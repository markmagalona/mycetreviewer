'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

type DayPlan = { day:number; date:string; focus:string; subject:string; tasks:string[]; rest?:boolean }
type WeekPlan = { week:number; theme:string; days:DayPlan[] }

const EXAM_NAMES: Record<string,string> = {
  upcat:'UPCAT', acet:'ACET', dcat:'DCAT', ustet:'USTET', pupcet:'PUPCET', suc:'State U CET'
}

function generateRuleBasedPlan(topics: string[], exam: string, days: number): WeekPlan[] {
  const subjects   = ['Mathematics','Language Proficiency','Reading Comprehension','Science','Logic and Reasoning']
  const weakSubjects = topics.map(t => t.split(' — ')[0]).filter((v,i,a) => a.indexOf(v)===i)
  const prioritized  = [...new Set([...weakSubjects,...subjects])].slice(0,5)
  const totalWeeks   = Math.min(Math.ceil(days/7), 4)
  const startDate    = new Date()
  const themes = [
    'Foundation — Building Core Skills',
    'Acceleration — Targeted Weak Topic Drill',
    'Reinforcement — Mixed Practice',
    'Final Sprint — Exam Simulation',
  ]
  return Array.from({length:totalWeeks}, (_,w) => {
    const isLastWeek = w === totalWeeks-1
    const days2: DayPlan[] = []
    for (let d=0; d<7; d++) {
      const dayNum = w*7+d+1
      if (dayNum > days) break
      const date = new Date(startDate); date.setDate(startDate.getDate()+dayNum-1)
      const dateStr = date.toLocaleDateString('en-PH',{month:'short',day:'numeric'})
      if (d===6) { days2.push({day:dayNum,date:dateStr,focus:'Rest & Review',subject:'All',tasks:['Light review of the week','No new material today','Get good sleep'],rest:true}); continue }
      const subject   = prioritized[d%prioritized.length]
      const weakTopic = topics.find(t=>t.includes(subject)) || `${subject} — Core Concepts`
      days2.push({
        day:dayNum, date:dateStr, focus:weakTopic, subject,
        tasks:[
          `Complete 1 AI training session on ${weakTopic.split(' — ')[1]||subject}`,
          'Review explanations for all wrong answers',
          isLastWeek ? 'Take a timed practice set (simulate exam pace)' : 'Do 10 minutes of flashcard review',
        ]
      })
    }
    return {week:w+1, theme:themes[w]||`Week ${w+1}`, days:days2}
  })
}

export default function StudyPlanPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [plan,          setPlan]          = useState<WeekPlan[]>([])
  const [generating,    setGenerating]    = useState(false)
  const [generated,     setGenerated]     = useState(false)
  const [weakTopics,    setWeakTopics]    = useState<string[]>([])
  const [examDate,      setExamDate]      = useState('')
  const [targetExam,    setTargetExam]    = useState('upcat')
  const [expandedWeek,  setExpandedWeek]  = useState<number>(1)

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login?redirect=/study-plan'); return }
    if (!user?.isPaid) return
    const userId = localStorage.getItem('userId')
    if (userId) {
      fetch(`/api/user/sessions?userId=${userId}&limit=50`)
        .then(r=>r.json())
        .then(sessions => {
          const diag = sessions.find((s:any) => s.exam_type==='diagnostic' && s.status==='completed')
          if (diag?.weak_topics) setWeakTopics(diag.weak_topics)
          if (diag?.school_id)   setTargetExam(diag.school_id)
        }).catch(()=>{})
    }
  }, [user, authLoading, router])

  async function generatePlan() {
    setGenerating(true)
    const planDays = examDate ? Math.min(Math.max(1,Math.ceil((new Date(examDate).getTime()-Date.now())/86400000)),30) : 30
    try {
      const res = await fetch('/api/ai/generate', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({userId:user?.id,schoolId:targetExam,subject:'study_plan',topic:'personalized_30_day',difficulty:'medium',format:'study_plan',weakTopics,examDate,planDays})
      })
      const data = await res.json()
      setPlan(data.studyPlan || generateRuleBasedPlan(weakTopics,targetExam,planDays))
    } catch {
      setPlan(generateRuleBasedPlan(weakTopics,targetExam,30))
    }
    setGenerated(true); setGenerating(false)
  }

  if (authLoading || !user) return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading...</div>
    </div>
  )

  if (!user.isPaid) return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">← Dashboard</Link>
          <span className="font-black text-gray-900 dark:text-white">MyCET<span className="text-red-600">Reviewer</span></span>
          <div/>
        </div>
      </nav>
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4">📅</div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-3">30-Day Study Plan</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Full Access only — personalized to your diagnostic results.</p>
        <Link href="/upgrade" className="inline-block bg-red-600 hover:bg-red-700 text-white font-black px-10 py-4 rounded-2xl transition-colors">
          Get Full Access — ₱500 →
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">← Dashboard</Link>
          <span className="font-black text-gray-900 dark:text-white">MyCET<span className="text-red-600">Reviewer</span></span>
          <div/>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Your 30-Day Study Plan</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Personalized based on your diagnostic results.</p>
        </div>

        {!generated ? (
          <div className="space-y-5">
            {weakTopics.length > 0 && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-2xl p-4">
                <div className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wide mb-2">Weak topics from your diagnostic</div>
                <div className="space-y-1">
                  {weakTopics.map((t,i) => (
                    <div key={i} className="text-sm text-red-800 dark:text-red-300 flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-red-600 text-white text-xs flex items-center justify-center flex-shrink-0">{i+1}</span>
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Target admission test</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {Object.entries(EXAM_NAMES).map(([id,name]) => (
                  <button key={id} onClick={()=>setTargetExam(id)}
                    className={`border rounded-xl py-2 text-xs font-bold transition-all ${targetExam===id ? 'border-red-500 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'}`}>
                    {name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                Exam date <span className="text-gray-400 font-normal text-xs">(optional)</span>
              </label>
              <input type="date" value={examDate} onChange={e=>setExamDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500"/>
            </div>

            <button onClick={generatePlan} disabled={generating}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-black py-4 rounded-2xl transition-colors">
              {generating ? 'Generating your plan...' : 'Generate My 30-Day Plan ✦'}
            </button>
            <p className="text-xs text-gray-400 text-center">Personalized to your weak topics · Takes ~10 seconds</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-2xl p-5 text-center">
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Your personalized plan</div>
              <div className="text-lg font-black text-white">{EXAM_NAMES[targetExam]} · {plan.reduce((s,w)=>s+w.days.length,0)}-Day Roadmap</div>
              {examDate && <div className="text-xs text-gray-400 mt-1">Exam: {new Date(examDate).toLocaleDateString('en-PH',{month:'long',day:'numeric',year:'numeric'})}</div>}
            </div>

            {plan.map(week => (
              <div key={week.week} className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                <button onClick={()=>setExpandedWeek(expandedWeek===week.week ? 0 : week.week)}
                  className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="text-left">
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">Week {week.week}</div>
                    <div className="text-sm font-black text-gray-900 dark:text-white mt-0.5">{week.theme}</div>
                  </div>
                  <div className="text-gray-400">{expandedWeek===week.week ? '↑' : '↓'}</div>
                </button>
                {expandedWeek===week.week && (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {week.days.map(day => (
                      <div key={day.day} className={`px-5 py-4 ${day.rest ? 'bg-green-50 dark:bg-green-950/30' : 'bg-white dark:bg-gray-900'}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Day {day.day} · {day.date}</div>
                            <div className={`text-sm font-bold mt-0.5 ${day.rest ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                              {day.rest ? '😴 Rest Day' : day.focus}
                            </div>
                          </div>
                          {!day.rest && (
                            <Link href={`/training?topic=${encodeURIComponent(day.focus)}&school=${targetExam}`}
                              className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 dark:bg-red-950 px-2.5 py-1 rounded-lg transition-colors flex-shrink-0 ml-3">
                              Train →
                            </Link>
                          )}
                        </div>
                        <ul className="space-y-1">
                          {day.tasks.map((task,i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>{task}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="flex gap-3 pb-6">
              <button onClick={()=>{setGenerated(false);setPlan([])}}
                className="flex-1 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-2xl transition-colors text-sm">
                Regenerate
              </button>
              <Link href="/training" className="flex-1 text-center bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-2xl transition-colors text-sm">
                Start Training →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
