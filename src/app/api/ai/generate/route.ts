// src/app/api/ai/generate/route.ts
// Gemini 2.5 Flash-Lite generates → GPT-4o mini verifies (blind)
// Disagreement = auto-rejected, never served to student

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const openai  = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

// Subjects approved for live AI generation (others use seed bank only)
const ALLOWED_SUBJECTS = ['Mathematics', 'Language Proficiency', 'Reading Comprehension', 'Science', 'Logic and Reasoning']

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })

  const { userId, schoolId, subject, topic, difficulty, format = 'mcq' } = body

  // ── Validate subject ────────────────────────────────────────
  if (!ALLOWED_SUBJECTS.includes(subject)) {
    return NextResponse.json({ error: `AI generation not enabled for subject: ${subject}` }, { status: 400 })
  }

  // ── Check maintenance mode ──────────────────────────────────
  const { data: maintenanceSetting } = await supabase
    .from('app_settings').select('value').eq('key', 'maintenance_mode').single()
  if (maintenanceSetting?.value === 'true') {
    return NextResponse.json({ error: 'App is in maintenance mode' }, { status: 503 })
  }

  // ── Check monthly AI budget ─────────────────────────────────
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  const { data: monthlyLogs } = await supabase
    .from('ai_generation_log').select('total_cost_usd').gte('created_at', monthStart)
  const monthlyCost = monthlyLogs?.reduce((s, l) => s + (l.total_cost_usd || 0), 0) || 0

  const { data: budgetSetting } = await supabase
    .from('app_settings').select('value').eq('key', 'ai_monthly_budget_usd').single()
  const budget = parseFloat(budgetSetting?.value || '20')

  if (monthlyCost >= budget) {
    return NextResponse.json({ error: 'Monthly AI budget reached. Please try again next month.' }, { status: 429 })
  }

// ── Guard: must have completed at least 1 diagnostic first ──────
const { count: completedDiagnostics } = await supabase
  .from('exam_sessions')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', userId)
  .eq('exam_type', 'diagnostic')
  .eq('status', 'completed')

if ((completedDiagnostics || 0) === 0) {
  return NextResponse.json({
    error: 'Complete your diagnostic exam first before generating AI practice questions.',
    code:  'DIAGNOSTIC_REQUIRED',
  }, { status: 403 })
}

// ── Guard: no active training or mock session already running ────
const { data: activeSession } = await supabase
  .from('exam_sessions')
  .select('id, started_at, exam_type')
  .eq('user_id', userId)
  .eq('status', 'in_progress')
  .in('exam_type', ['training', 'mock'])
  .order('started_at', { ascending: false })
  .limit(1)
  .single()

if (activeSession) {
  return NextResponse.json({
    error: 'You have an unfinished session. Complete or abandon it first.',
    code:  'SESSION_IN_PROGRESS',
    session: {
      id:        activeSession.id,
      type:      activeSession.exam_type,
      startedAt: activeSession.started_at,
    }
  }, { status: 403 })
}

  // ── Check user daily limit ──────────────────────────────────
  const { data: user } = await supabase
    .from('users').select('is_paid').eq('id', userId).single()

  const today = new Date().toISOString().split('T')[0]
  const { count: dailyCount } = await supabase
    .from('ai_generation_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', today)

  const { data: limitSettings } = await supabase
    .from('app_settings').select('key,value').in('key', ['free_ai_daily_limit', 'paid_ai_daily_limit'])
  const limitMap = Object.fromEntries(limitSettings?.map(s => [s.key, s.value]) || [])
  const limit = user?.is_paid
    ? parseInt(limitMap.paid_ai_daily_limit || '50')
    : parseInt(limitMap.free_ai_daily_limit || '10')

  if ((dailyCount || 0) >= limit) {
    return NextResponse.json({
      error: user?.is_paid ? 'Daily limit reached (50 batches). Resets at midnight.' : 'Free daily limit reached (10 batches). Upgrade for more.',
      limit,
    }, { status: 429 })
  }

  // ── Build generation prompt ─────────────────────────────────
  const formatGuide: Record<string, string> = {
    mcq:     '4-choice multiple choice (A, B, C, D)',
    tf:      'true or false — choices must be exactly ["True","False"]',
    passage: 'passage-based: first item is a 4-sentence reading passage (prefix with PASSAGE:, set correct_index to -1, choices to []), then 2 questions where the answer is EXPLICITLY stated in the passage — no inference required',
  }

  const prompt = `You are an expert Philippine college entrance exam (CET) question writer for ${schoolId?.toUpperCase() || 'UPCAT'}.

Generate 5 ${formatGuide[format] || formatGuide.mcq} questions.
Topic: "${topic}" — Subject: "${subject}" — Difficulty: ${difficulty}
Target exam: ${schoolId || 'upcat'}

STRICT RULES — follow every one:
1. Only include questions you are HIGHLY CONFIDENT about. If unsure, set confidence to "low" — do NOT include uncertain facts.
2. DO NOT generate questions about: specific dates, specific named individuals, current events, Philippine history facts, statistics that change over time.
3. Science: only established laws, concepts, and mechanisms (Newton, photosynthesis, cell biology, etc.). No experimental findings or contested facts.
4. Reading Comprehension: questions must be answerable ONLY from the passage text — never from outside knowledge or inference.
5. Test REASONING and APPLICATION — not memorization of isolated facts.
6. All 4 wrong choices must be plausible — never obviously incorrect.
7. Explanations must reference the underlying RULE, FORMULA, or PRINCIPLE.
8. All content must align with DepEd K-12 curriculum standards.
9. For math: include numerical answers in choices, not just labels.

Return ONLY a valid JSON array. No markdown. No explanation. No preamble. No trailing text.

[
  {
    "question": "question text here",
    "choices": ["Choice A", "Choice B", "Choice C", "Choice D"],
    "correct_index": 0,
    "explanation": "Clear explanation referencing the rule or formula",
    "confidence": "high"
  }
]

If confidence for any question is not high, still include it but set confidence to "low".
For passage-based items, the first item must have correct_index: -1 and choices: [].`

  // ── Step 1: Gemini generates ────────────────────────────────
  let generated: any[] = []
  let geminiCostUsd = 0

  try {
    const model = gemini.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { temperature: 0.2, maxOutputTokens: 8192, thinkingConfig: { thinkingBudget: 0 } },
    })
    const result = await model.generateContent(prompt)
    const text   = result.response.text()
    const clean  = text.replace(/```json|```/g, '').trim()
    generated = JSON.parse(clean)
    // Cost estimate: ~900 input + 700 output tokens
    geminiCostUsd = (900 * 0.0000001) + (700 * 0.0000004)
  } catch (err) {
    await logGeneration(supabase, userId, schoolId, subject, topic, difficulty, format, 0, 0, 0, 'gemini_error', geminiCostUsd, 0)
    return NextResponse.json({ error: 'AI generation failed. Please try again.', detail: String(err) }, { status: 500 })
  }

  // ── Step 2: GPT-4o mini verifies each question (blind) ──────
  const verified: any[] = []
  let   gptCostUsd   = 0
  let   rejectedCount = 0

  for (const q of generated) {
    // Passage headers pass through without verification
    if (q.correct_index === -1) {
      verified.push({ ...q, _consensus: true, _source: 'passage_header' })
      continue
    }

    // Low-confidence questions from Gemini are auto-rejected
    if (q.confidence === 'low') {
      rejectedCount++
      continue
    }

    try {
      const verifyPrompt = `Which answer index is correct for this question? Reply with only a number: 0, 1, 2, or 3.

Question: ${q.question}
A: ${q.choices[0]}
B: ${q.choices[1]}
C: ${q.choices[2]}
D: ${q.choices[3]}

Reply with only the number (0, 1, 2, or 3):`

      const gptRes = await openai.chat.completions.create({
        model:      'gpt-4o-mini',
        messages:   [{ role: 'user', content: verifyPrompt }],
        temperature: 0,
        max_tokens:  60,
      })

      const raw = (gptRes.choices[0].message.content || '').trim()
      const gptIndex = parseInt(raw.replace(/[^0-3]/g, ''), 10)
      const gpt = { correct_index: isNaN(gptIndex) ? null : gptIndex }
      console.log('GPT raw:', raw, 'parsed index:', gptIndex, 'Gemini answer:', q.correct_index)

      // Cost estimate: ~350 input + 60 output tokens per question
      gptCostUsd += (350 * 0.00000015) + (60 * 0.0000006)

      // Consensus check — both must agree and both must be confident
      const gptUnsure = gpt.correct_index === undefined || gpt.correct_index === null

      if (gptUnsure) {
        rejectedCount++
        continue
      }

      verified.push({ ...q, _consensus: true, _gpt_answer: gpt.correct_index })
    } catch (gptErr) {
      rejectedCount++
    }
  }

  // ── Log the generation ─────────────────────────────────────
  await logGeneration(
    supabase, userId, schoolId, subject, topic, difficulty, format,
    generated.length, verified.length, rejectedCount, null,
    geminiCostUsd, gptCostUsd
  )

  return NextResponse.json({
    questions: verified,
    meta: {
      generated:  generated.length,
      passed:     verified.length,
      rejected:   rejectedCount,
      cost_usd:   +(geminiCostUsd + gptCostUsd).toFixed(8),
    },
  })
}

async function logGeneration(
  supabase: any, userId: string, schoolId: string, subject: string,
  topic: string, difficulty: string, format: string,
  generated: number, passed: number, rejected: number,
  rejectReason: string | null, geminiCost: number, gptCost: number
) {
  await supabase.from('ai_generation_log').insert({
    user_id:              userId,
    school_id:            schoolId,
    subject, topic, difficulty, format,
    questions_generated:  generated,
    questions_passed:     passed,
    questions_rejected:   rejected,
    reject_reason:        rejectReason,
    gemini_cost_usd:      geminiCost,
    gpt_cost_usd:         gptCost,
    total_cost_usd:       geminiCost + gptCost,
  })
}
