'use client'
// src/components/engines/ResultsEngine.tsx
// Dynamic header based on school + exam type
// No email gate for paid users or mock/training
// Wrong answer review for mock and training

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

type Answer = {
  questionId: string
  question: { subject: string; topic: string; difficulty: string; question: string; choices: string[]; correct: number; explanation: string }
  chosen: number; isCorrect: boolean; timeSeconds: number; xpEarned: number
}
type Results = {
  school: string; examType: string; answers: Answer[]
  examXP: number; totalQuestions: number; srCount: number
}

// Dynamic labels
const EXAM_NAMES: Record<string,string> = {
  upcat:'UPCAT', acet:'ACET', dcat:'DCAT',
  ustet:'USTET', pupcet:'PUPCET', suc:'State U CET',
}
const EXAM_TYPE_LABELS: Record<string,string> = {
  diagnostic:'Diagnostic', mock:'Mock Exam', training:'Training Session',
}

function aiCoach(pct: number, worst: string, xp: number, avgTime: number): string {
  const timeNote = avgTime > 45 ? ` Average time was ${Math.round(avgTime)}s per question — aim for under 30s.` : ''
  if (pct >= 80) return `Strong result — ${pct}%. You earned <strong>+${xp} XP</strong>. Weakest area: <strong>${worst}</strong>. Keep daily practice here.${timeNote}`
  if (pct >= 65) return `Solid — ${pct}%. You earned <strong>+${xp} XP</strong>. Focus on <strong>${worst}</strong> daily.${timeNote}`
  if (pct >= 50) return `You scored ${pct}%. You earned <strong>+${xp} XP</strong>. Start with <strong>${worst}</strong> — highest impact.${timeNote}`
  return `You scored ${pct}% — this is your starting point. You earned <strong>+${xp} XP</strong>. Train <strong>${worst}</strong> daily. Measurable improvement in two weeks.${timeNote}`
}

function validateEmail(email: string): string|null {
  const t = email.trim().toLowerCase()
  if (!t.includes('@')) return 'Please enter a valid email address.'
  const [local, domain] = t.split('@')
  if (!local || local.length < 2 || !domain || !domain.includes('.')) return 'Please enter a valid email address.'
  const fake = ['test.com','example.com','fake.com','asdf.com']
  if (fake.includes(domain)) return 'Please enter your real email address.'
  return null
}

export default function ResultsEngine() {
  const params   = useSearchParams()
  const router   = useRouter()
  const school   = params.get('school') || 'upcat'
  const examType = params.get('type')   || 'diagnostic'

  const [results,    setResults]    = useState<Results|null>(null)
  const [email,      setEmail]      = useState('')
  const [unlocked,   setUnlocked]   = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')
  const [ringDash,   setRingDash]   = useState(226)
  const [isPaid,     setIsPaid]     = useState(false)
  const [showReview, setShowReview] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('examResults')
    if (!raw) { router.push('/diagnostic'); return }
    const parsed = JSON.parse(raw)
    setResults(parsed)

    // Unlock immediately for mock and training
    if (examType === 'mock' || examType === 'training') setUnlocked(true)

    // Check if paid
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId')
    if (userId) {
      fetch(`/api/user/me?userId=${userId}`)
        .then(r => r.json())
        .then(d => { if (d.is_paid) { setIsPaid(true); setUnlocked(true) } })
        .catch(() => {})
    }
  }, [router, examType])

  useEffect(() => {
    if (!results) return
    const pct = Math.round(results.answers.filter(a => a.isCorrect).length / results.totalQuestions * 100)
    setTimeout(() => setRingDash(Math.round(226 * (1 - pct / 100))), 600)
  }, [results])

  if (!results) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading results...</div>
    </div>
  )

  const correct      = results.answers.filter(a => a.isCorrect).length
  const total        = results.totalQuestions
  const pct          = Math.round(correct / total * 100)
  const avgTime      = results.answers.reduce((s, a) => s + a.timeSeconds, 0) / results.answers.length
  const wrongAnswers = results.answers.filter(a => !a.isCorrect)

  // Use actual school from results if available
  const actualSchool   = results.school || school
  const actualExamType = results.examType || examType

  // Build topic map
  const topicMap: Record<string, {correct:number;total:number}> = {}
  results.answers.forEach(a => {
    const k = `${a.question.subject} — ${a.question.topic}`
    if (!topicMap[k]) topicMap[k] = { correct: 0, total: 0 }
    topicMap[k].total++
    if (a.isCorrect) topicMap[k].correct++
  })
  const weakTopics = Object.entries(topicMap)
    .sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total)
    .slice(0, 3).map(([name]) => name)

  // Subject scores
  const subjectMap: Record<string,{correct:number;total:number}> = {}
  results.answers.forEach(a => {
    const s = a.question.subject
    if (!subjectMap[s]) subjectMap[s] = { correct: 0, total: 0 }
    subjectMap[s].total++
    if (a.isCorrect) subjectMap[s].correct++
  })

  let percentile = 'Below 50th percentile (est.)'
  if (pct >= 90) percentile = 'Top 5th percentile (est.)'
  else if (pct >= 80) percentile = 'Top 15th percentile (est.)'
  else if (pct >= 70) percentile = 'Top 30th percentile (est.)'
  else if (pct >= 60) percentile = 'Top 50th percentile (est.)'

  let risk = 'High risk — focused training needed'
  let riskCls = 'bg-red-50 text-red-700 border-red-200'
  if (pct >= 70) { risk = 'On track — keep training'; riskCls = 'bg-green-50 text-green-700 border-green-200' }
  else if (pct >= 60) { risk = 'Borderline — consistent daily training needed'; riskCls = 'bg-yellow-50 text-yellow-700 border-yellow-200' }

  const examName      = EXAM_NAMES[actualSchool] || actualSchool.toUpperCase()
  const examTypeLabel = EXAM_TYPE_LABELS[actualExamType] || 'Results'

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault()
    const err = validateEmail(email)
    if (err) { setError(err); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      if (res.ok) {
        setUnlocked(true)
        localStorage.setItem('userEmail', email.trim().toLowerCase())
        // Fire Meta Pixel Lead event
        if (typeof window !== 'undefined' && (window as any).fbq) {
          (window as any).fbq('track', 'Lead', { content_name: 'Diagnostic Results Email Capture' })
        }
      }
      else { const d = await res.json(); setError(d.error || 'Something went wrong.') }
    } catch { setError('Network error.') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header — dynamic based on school + exam type */}
      <div className="bg-gray-900">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-8 pb-6">
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">
            {examName} {examTypeLabel} Results
          </div>
          <div className="text-5xl sm:text-6xl font-black text-white leading-none mb-1">{pct}%</div>
          <div className="text-sm text-gray-400 mb-3">{correct} of {total} correct</div>
          <div className={`inline-block border rounded-full px-3 py-1 text-xs font-bold ${riskCls}`}>{risk}</div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Readiness ring */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex items-center gap-5">
          <div className="relative flex-shrink-0">
            <svg width="90" height="90">
              <circle cx="45" cy="45" r="36" fill="none" stroke="#e5e7eb" strokeWidth="7"/>
              <circle cx="45" cy="45" r="36" fill="none" stroke="#c1121f" strokeWidth="7"
                strokeLinecap="round" strokeDasharray="226" strokeDashoffset={ringDash}
                transform="rotate(-90 45 45)" style={{transition:'stroke-dashoffset 1.2s ease'}}/>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-base font-black text-gray-900">{pct}%</div>
          </div>
          <div>
            <div className="font-bold text-base text-gray-900 mb-1">
              {pct >= 70 ? `${examName} Ready 🎉` : pct >= 55 ? 'Almost there!' : 'More training needed'}
            </div>
            <div className="text-sm text-gray-500 leading-relaxed">
              {percentile}
              {pct < 70 && <><br/><span className="text-red-600 font-semibold">{70 - pct}% more to reach exam-ready level</span></>}
            </div>
          </div>
        </div>

        {/* Score by subject */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-4">Score by subject</h3>
          <div className="space-y-3">
            {Object.entries(subjectMap).map(([subject, data]) => {
              const p = Math.round(data.correct / data.total * 100)
              const color = p >= 70 ? '#16a34a' : p >= 50 ? '#f59e0b' : '#c1121f'
              return (
                <div key={subject}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-semibold text-gray-700">{subject}</span>
                    <span className="font-bold" style={{color}}>{data.correct}/{data.total} — {p}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-2.5 rounded-full transition-all duration-700" style={{width:`${p}%`,background:color}}/>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Weak topics */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-4">Your 3 weakest topics</h3>
          {unlocked ? (
            <div className="space-y-2">
              {weakTopics.map((topic, i) => (
                <div key={i} className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-black flex-shrink-0">{i+1}</div>
                  <div className="text-sm font-semibold text-red-800 flex-1">{topic}</div>
                  <Link href={`/training?topic=${encodeURIComponent(topic)}`}
                    className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 px-2.5 py-1 rounded-lg transition-colors flex-shrink-0">
                    Train →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-2 mb-5">
                {weakTopics.map((_, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                    <div className="text-sm font-semibold text-gray-600">Topic {i+1}</div>
                    <div className="text-sm font-bold blur-sm select-none px-4 py-1 bg-gray-200 rounded text-gray-300">●●●●●●●●●</div>
                  </div>
                ))}
              </div>
              <div className="bg-gray-900 rounded-2xl p-5">
                <div className="text-base font-bold text-white mb-1">See your full breakdown — free</div>
                <div className="text-sm text-gray-400 mb-4">Enter your email to reveal your weak topics and study plan.</div>
                <form onSubmit={handleUnlock} className="space-y-3">
                  <input type="email" value={email} onChange={e => {setEmail(e.target.value);setError('')}}
                    placeholder="your@email.com"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500"/>
                  {error && <div className="text-xs text-red-400">{error}</div>}
                  <button type="submit" disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-sm transition-colors">
                    {loading ? 'Unlocking...' : 'Unlock free →'}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>

        {/* Analysis + XP */}
        {unlocked && (
          <>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Analysis</h3>
              <div className="text-sm text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{__html: aiCoach(pct, weakTopics[0]?.split('—')[1]?.trim() || weakTopics[0] || 'your weak topics', results.examXP, avgTime)}}/>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center gap-4">
              <div className="text-2xl font-black text-yellow-700">+{results.examXP}</div>
              <div>
                <div className="text-sm font-bold text-yellow-800">XP earned this session</div>
                <div className="text-xs text-yellow-600 mt-0.5">Saved to your account</div>
              </div>
            </div>

            {/* Wrong answer review */}
            {actualExamType !== 'diagnostic' && wrongAnswers.length > 0 && (
              <div>
                <button onClick={() => setShowReview(!showReview)}
                  className="w-full flex items-center justify-between bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-2xl px-5 py-4 transition-colors">
                  <div className="text-left">
                    <div className="text-sm font-bold text-gray-900">Review {wrongAnswers.length} wrong answer{wrongAnswers.length > 1 ? 's' : ''}</div>
                    <div className="text-xs text-gray-500 mt-0.5">See correct answers + explanations · No score impact</div>
                  </div>
                  <div className="text-gray-400 text-lg">{showReview ? '↑' : '↓'}</div>
                </button>

                {showReview && (
                  <div className="space-y-4 mt-3">
                    {wrongAnswers.map((ans, i) => (
                      <div key={i} className="border border-red-200 rounded-2xl overflow-hidden">
                        <div className="bg-red-50 px-4 py-3">
                          <div className="text-xs text-red-600 font-semibold uppercase tracking-wide mb-1">
                            {ans.question.subject} — {ans.question.topic}
                          </div>
                          <div className="text-sm font-bold text-gray-900 leading-relaxed">{ans.question.question}</div>
                        </div>
                        <div className="px-4 py-3 space-y-2">
                          {ans.question.choices?.map((choice, j) => {
                            const isCorrect = j === ans.question.correct
                            const isChosen  = j === ans.chosen
                            if (!isCorrect && !isChosen) return null
                            return (
                              <div key={j} className={`flex items-start gap-2 text-xs rounded-lg px-3 py-2 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                <span className={`font-black flex-shrink-0 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                  {isCorrect ? '✓' : '✗'} {String.fromCharCode(65+j)}.
                                </span>
                                <span className={isCorrect ? 'text-green-800' : 'text-red-700'}>{choice}</span>
                                <span className={`ml-auto flex-shrink-0 font-semibold ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                                  {isCorrect ? 'Correct' : 'Your answer'}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                        <div className="bg-blue-50 border-t border-blue-100 px-4 py-3">
                          <div className="text-xs font-bold text-blue-700 mb-1">Explanation</div>
                          <div className="text-xs text-blue-800 leading-relaxed">{ans.question.explanation}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CTAs */}
            <div className="space-y-3 pb-6">
              {actualExamType === 'mock' ? (
                <>
                  <Link href={`/training?topic=${encodeURIComponent(weakTopics[0] || '')}`}
                    className="block w-full text-center bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl transition-colors">
                    Train Your Weakest Topic →
                  </Link>
                  <Link href="/mock" className="block w-full text-center border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3.5 rounded-2xl transition-colors text-sm">
                    Back to Mock Exams
                  </Link>
                </>
              ) : actualExamType === 'training' ? (
                <>
                  <Link href="/training" className="block w-full text-center bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl transition-colors">
                    Start Another Training Session →
                  </Link>
                  <Link href="/dashboard" className="block w-full text-center border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3.5 rounded-2xl transition-colors text-sm">
                    Back to Dashboard
                  </Link>
                </>
              ) : (
                <>
                  {!isPaid && (
                    <Link href="/upgrade" className="block w-full text-center bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl transition-colors">
                      Unlock Full Access — ₱500 →
                    </Link>
                  )}
                  <Link href="/diagnostic" className="block w-full text-center border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3.5 rounded-2xl transition-colors text-sm">
                    Try Another Admission Test
                  </Link>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
