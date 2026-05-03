'use client'
// src/app/training/page.tsx — v3
// Fix: "Change topic" now links to /dashboard (weak topics list) not /training

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import SessionGuard from '@/components/ui/SessionGuard'

const TOPICS_BY_SUBJECT: Record<string, string[]> = {
  'Mathematics': [
    'Algebra — Linear Equations','Algebra — Quadratic Equations','Algebra — Rates and Work Problems',
    'Algebra — Systems of Equations','Geometry — Triangles and Angles','Geometry — Circles and Area',
    'Statistics — Mean, Median, Mode','Statistics — Probability','Number Theory — Divisibility',
    'Number Theory — Sequences and Patterns','Word Problems — Distance and Speed','Word Problems — Mixture Problems',
  ],
  'Language Proficiency': [
    'Grammar — Subject-Verb Agreement','Grammar — Verb Tenses','Grammar — Parallel Structure',
    'Grammar — Modifiers','Vocabulary — Context Clues','Vocabulary — Word Roots',
    'Vocabulary — Academic Words','Sentence Completion','Error Identification',
  ],
  'Reading Comprehension': [
    'Main Idea and Title','Supporting Details','Vocabulary in Context',
    'Author Purpose and Tone','Fact vs Opinion','Inference — Explicit','Figurative Language',
  ],
  'Science': [
    'Biology — Cell Structure','Biology — Genetics and Heredity','Biology — Photosynthesis and Respiration',
    'Biology — Ecology and Food Chains','Chemistry — Periodic Table','Chemistry — Chemical Bonding',
    'Chemistry — Acids and Bases',"Physics — Newton's Laws",'Physics — Work, Energy, Power',
    'Physics — Electricity and Circuits','Earth Science — Weather and Climate','Earth Science — Rock Cycle',
  ],
  'Logic and Reasoning': [
    'Number Sequences','Letter Patterns','Logical Conclusions','Syllogisms','Analogy',
  ],
}

const DIFFICULTIES = ['easy', 'medium', 'hard']

function getFormats(subject: string) {
  const base = [{ id:'mcq', label:'Multiple Choice', desc:'4 choices — standard CET format' }]
  if (subject === 'Reading Comprehension') {
    base.push({ id:'passage', label:'Passage-Based', desc:'Read a short text, answer questions' })
  }
  return base
}

function parseWeakTopic(weakTopic: string): { subject: string; topic: string } | null {
  const decoded = decodeURIComponent(weakTopic)
  for (const [subject, topics] of Object.entries(TOPICS_BY_SUBJECT)) {
    for (const topic of topics) {
      if (decoded.toLowerCase().includes(topic.toLowerCase().split(' — ')[0].toLowerCase())) {
        return { subject, topic }
      }
    }
    if (decoded.toLowerCase().includes(subject.toLowerCase())) {
      return { subject, topic: topics[0] }
    }
  }
  return null
}

export default function TrainingPage() {
  const { user, loading: authLoading } = useAuth()
  const router       = useRouter()
  const searchParams = useSearchParams()
  const preTopic     = searchParams.get('topic') || ''
  const preSchool    = searchParams.get('school') || ''

  const [subject,       setSubject]       = useState('')
  const [topic,         setTopic]         = useState('')
  const [difficulty,    setDifficulty]    = useState('medium')
  const [format,        setFormat]        = useState('mcq')
  const [generating,    setGenerating]    = useState(false)
  const [error,         setError]         = useState('')
  const [dailyCount,    setDailyCount]    = useState(0)
  const [dailyLimit,    setDailyLimit]    = useState(20)
  const [hasDiagnostic, setHasDiagnostic] = useState<boolean|null>(null)
  const [checkingDiag,  setCheckingDiag]  = useState(true)
  const [targetSchool,  setTargetSchool]  = useState('upcat')
  const [fromDashboard, setFromDashboard] = useState(false)

  useEffect(()=>{
    if(!authLoading&&!user){ router.push('/login?redirect=/training'); return }
    if(user){
      setTargetSchool(preSchool || user.targetSchools?.[0] || 'upcat')
      setDailyLimit(user.isPaid ? 20 : 10) // 20 for paid, 10 for free
      checkStatusDirectly()

      if(preTopic){
        const parsed = parseWeakTopic(preTopic)
        if(parsed){
          setSubject(parsed.subject)
          setTopic(parsed.topic)
          setFromDashboard(true)
        }
      }
    }
  },[user, authLoading])

  async function checkStatusDirectly(){
    if(!user) return
    setCheckingDiag(true)
    try{
      const [sessionsRes, countRes] = await Promise.all([
        fetch(`/api/user/sessions?userId=${user.id}&limit=100`),
        fetch(`/api/training/daily-count?userId=${user.id}&date=${new Date().toISOString().split('T')[0]}`),
      ])
      if(sessionsRes.ok){
        const sessions = await sessionsRes.json()
        setHasDiagnostic(sessions.some((s:any) => s.exam_type==='diagnostic' && s.status==='completed'))
      }
      if(countRes.ok){
        const d = await countRes.json()
        setDailyCount(d.count || 0)
      }
    }catch{ setHasDiagnostic(false) }
    finally{ setCheckingDiag(false) }
  }

  function handleSubjectChange(s: string){
    setSubject(s); setTopic('')
    if(s !== 'Reading Comprehension') setFormat('mcq')
  }

  async function handleGenerate(){
    if(!user||!topic||!subject) return
    setGenerating(true); setError('')
    try{
      const res = await fetch('/api/ai/generate',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ userId:user.id, schoolId:targetSchool, subject, topic, difficulty, format }),
      })
      const data = await res.json()
      if(!res.ok){
        if(data.code==='DIAGNOSTIC_REQUIRED'){ setHasDiagnostic(false); setError('Complete your diagnostic first.'); return }
        if(data.code==='SESSION_IN_PROGRESS'){ setError('Finish your current session first.'); return }
        setError(data.error||'Generation failed. Please try again.')
        return
      }
      if(!data.questions||data.questions.length===0){
        setError('No questions passed quality check. Try a different topic or difficulty.')
        return
      }
      sessionStorage.setItem('trainingQuestions', JSON.stringify({
        questions: data.questions, school: targetSchool, subject, topic, difficulty, format,
      }))
      router.push(`/exam?school=${targetSchool}&type=training&source=ai`)
    }catch{ setError('Network error. Please try again.') }
    finally{ setGenerating(false) }
  }

  if(authLoading||!user) return(
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading...</div>
    </div>
  )

  const remaining  = dailyLimit - dailyCount
  const atLimit    = remaining <= 0
  const formats    = getFormats(subject)
  const canGenerate = !!topic && !!subject && !generating && !atLimit && hasDiagnostic === true

  return(
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">← Dashboard</Link>
          <span className="font-black text-gray-900">MyCET<span className="text-red-600">Reviewer</span></span>
          <div className="text-xs font-semibold">
            {checkingDiag ? <span className="text-gray-400">...</span>
              : atLimit    ? <span className="text-red-600">Limit reached</span>
              : <span className={remaining<=3?'text-orange-600':'text-gray-400'}>{remaining} left today</span>
            }
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900 mb-1">Targeted Training</h1>
          <p className="text-sm text-gray-500">
            AI generates 5 fresh questions on your chosen topic.
            {!user.isPaid&&<span className="text-orange-600 ml-1">{dailyLimit} batches/day free. <Link href="/upgrade" className="underline">Upgrade →</Link></span>}
          </p>
        </div>

        {!checkingDiag && hasDiagnostic===false && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
            <div className="font-bold text-sm text-yellow-900 mb-1">Complete your diagnostic first</div>
            <div className="text-xs text-yellow-700 mb-3">Take the free diagnostic before using AI practice questions.</div>
            <Link href="/diagnostic" className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors">
              Take Free Diagnostic →
            </Link>
          </div>
        )}

        {atLimit && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <div className="font-bold text-sm text-red-800 mb-1">Daily limit reached</div>
            <div className="text-xs text-red-600 mb-3">
              You've used all {dailyLimit} AI batches for today. Resets at midnight.
              {!user.isPaid&&' Upgrade for 20/day.'}
            </div>
            {!user.isPaid&&<Link href="/upgrade" className="inline-block bg-red-600 text-white font-bold px-4 py-2 rounded-xl text-xs">Upgrade — ₱500 →</Link>}
          </div>
        )}

        <SessionGuard userId={user.id} onClear={()=>setError('')}>

          {/* Pre-selected from dashboard weak topics */}
          {fromDashboard && subject && topic && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5 flex items-center justify-between">
              <div>
                <div className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-0.5">From your weak topics</div>
                <div className="text-sm font-bold text-blue-900">{topic}</div>
              </div>
              {/* Change topic → goes back to dashboard weak topics list */}
              <Link href="/dashboard" className="text-xs text-blue-500 hover:text-blue-700 font-semibold">
                ← Back to weak topics
              </Link>
            </div>
          )}

          {/* Subject picker — hidden when pre-selected from dashboard */}
          {(!subject || !fromDashboard) && (
            <div className="mb-5">
              <label className="block text-sm font-bold text-gray-900 mb-2">Subject</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.keys(TOPICS_BY_SUBJECT).map(s=>(
                  <button key={s} onClick={()=>handleSubjectChange(s)}
                    className={`border rounded-xl px-3 py-2.5 text-xs font-bold text-left transition-all ${subject===s?'border-red-500 bg-red-50 text-red-700':'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Topic picker — hidden when pre-selected */}
          {subject && (!topic || !fromDashboard) && (
            <div className="mb-5">
              <label className="block text-sm font-bold text-gray-900 mb-2">Topic</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TOPICS_BY_SUBJECT[subject]?.map(t=>(
                  <button key={t} onClick={()=>setTopic(t)}
                    className={`border rounded-xl px-3 py-2.5 text-xs font-bold text-left transition-all ${topic===t?'border-red-500 bg-red-50 text-red-700':'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Difficulty */}
          <div className="mb-5">
            <label className="block text-sm font-bold text-gray-900 mb-2">Difficulty</label>
            <div className="flex gap-2">
              {DIFFICULTIES.map(d=>(
                <button key={d} onClick={()=>setDifficulty(d)}
                  className={`flex-1 border rounded-xl py-2.5 text-sm font-bold transition-all capitalize ${difficulty===d?
                    d==='easy'?'border-green-500 bg-green-50 text-green-700':
                    d==='medium'?'border-yellow-500 bg-yellow-50 text-yellow-700':
                    'border-red-500 bg-red-50 text-red-700'
                    :'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Format — passage only for Reading */}
          {formats.length > 1 && (
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-900 mb-2">Format</label>
              <div className="flex gap-2">
                {formats.map(f=>(
                  <button key={f.id} onClick={()=>setFormat(f.id)}
                    className={`flex-1 border rounded-xl px-3 py-2.5 text-left transition-all ${format===f.id?'border-red-500 bg-red-50':'border-gray-200 hover:border-gray-300'}`}>
                    <div className={`text-xs font-bold ${format===f.id?'text-red-700':'text-gray-900'}`}>{f.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4">{error}</div>}

          <button onClick={handleGenerate} disabled={!canGenerate}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-black py-4 rounded-2xl transition-colors text-base">
            {checkingDiag  ? 'Checking status...'
              : generating ? 'Generating with AI...'
              : !subject   ? 'Select a subject above'
              : !topic     ? 'Select a topic above'
              : hasDiagnostic===false ? 'Complete diagnostic first'
              : atLimit    ? 'Daily limit reached'
              : `Generate 5 ${difficulty} questions — ${topic.split(' — ').pop()} ✦`
            }
          </button>
          <p className="text-xs text-gray-400 text-center mt-2">Questions verified by dual AI · Fresh every session</p>

        </SessionGuard>
      </div>
    </div>
  )
}
