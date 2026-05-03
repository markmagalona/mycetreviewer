'use client'
export const dynamic = 'force-dynamic'
// src/app/mock/page.tsx — real exam question counts, AI-generated questions per section

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import SessionGuard from '@/components/ui/SessionGuard'

// Real question counts per actual exam
const SCHOOL_CONFIGS: Record<string, {
  name:string; emoji:string; total:number; totalMin:number
  sections:{id:string;name:string;questions:number;minutes:number;subject:string}[]
}> = {
  upcat: { name:'UPCAT', emoji:'🎓', total:240, totalMin:180, sections:[
    {id:'language', name:'Language Proficiency',  questions:60, minutes:45, subject:'Language Proficiency'},
    {id:'reading',  name:'Reading Comprehension', questions:60, minutes:45, subject:'Reading Comprehension'},
    {id:'math',     name:'Mathematics',           questions:60, minutes:45, subject:'Mathematics'},
    {id:'science',  name:'Science',               questions:60, minutes:45, subject:'Science'},
  ]},
  acet: { name:'ACET', emoji:'📘', total:165, totalMin:150, sections:[
    {id:'english',  name:'English',               questions:40, minutes:35, subject:'Language Proficiency'},
    {id:'math',     name:'Mathematics',           questions:40, minutes:40, subject:'Mathematics'},
    {id:'abstract', name:'Abstract Reasoning',    questions:30, minutes:25, subject:'Logic and Reasoning'},
    {id:'vocab',    name:'Vocabulary',            questions:30, minutes:20, subject:'Language Proficiency'},
    {id:'reading',  name:'Reading Comprehension', questions:25, minutes:30, subject:'Reading Comprehension'},
  ]},
  dcat: { name:'DCAT', emoji:'⚡', total:200, totalMin:150, sections:[
    {id:'language',     name:'Language Proficiency',   questions:60, minutes:40, subject:'Language Proficiency'},
    {id:'quantitative', name:'Quantitative Reasoning', questions:60, minutes:45, subject:'Mathematics'},
    {id:'inductive',    name:'Inductive Reasoning',    questions:40, minutes:30, subject:'Logic and Reasoning'},
    {id:'science',      name:'Science Reasoning',      questions:40, minutes:35, subject:'Science'},
  ]},
  ustet: { name:'USTET', emoji:'✝️', total:270, totalMin:160, sections:[
    {id:'mental',    name:'Mental Ability',        questions:50, minutes:30, subject:'Logic and Reasoning'},
    {id:'english',   name:'English',               questions:80, minutes:45, subject:'Language Proficiency'},
    {id:'math',      name:'Mathematics',           questions:60, minutes:45, subject:'Mathematics'},
    {id:'science',   name:'Science',               questions:80, minutes:40, subject:'Science'},
  ]},
  pupcet: { name:'PUPCET', emoji:'🏛️', total:220, totalMin:140, sections:[
    {id:'verbal',     name:'Verbal Ability',      questions:60, minutes:35, subject:'Language Proficiency'},
    {id:'analytical', name:'Analytical Thinking', questions:50, minutes:35, subject:'Logic and Reasoning'},
    {id:'math',       name:'Mathematics',         questions:60, minutes:40, subject:'Mathematics'},
    {id:'science',    name:'Science',             questions:50, minutes:30, subject:'Science'},
  ]},
  suc: { name:'State U CET', emoji:'🏫', total:190, totalMin:125, sections:[
    {id:'verbal',    name:'Verbal Ability',         questions:50, minutes:30, subject:'Language Proficiency'},
    {id:'reasoning', name:'Quantitative Reasoning', questions:50, minutes:35, subject:'Mathematics'},
    {id:'science',   name:'Science',                questions:50, minutes:30, subject:'Science'},
    {id:'abstract',  name:'Abstract Reasoning',     questions:40, minutes:30, subject:'Logic and Reasoning'},
  ]},
}

export default function MockPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [selectedSchool, setSelectedSchool] = useState('upcat')
  const [canTake,        setCanTake]        = useState(true)
  const [nextAvailable,  setNextAvailable]  = useState('')
  const [checkingLimit,  setCheckingLimit]  = useState(true)
  const [generating,     setGenerating]     = useState(false)
  const [genProgress,    setGenProgress]    = useState('')

  const config = SCHOOL_CONFIGS[selectedSchool]

  useEffect(() => {
    if (!user) return
    const userId = localStorage.getItem('userId')
    if (!userId) { setCheckingLimit(false); return }
    fetch(`/api/mock/start?check=true&userId=${userId}`)
      .then(r => r.json())
      .then(d => {
        setCanTake(!d.blocked)
        if (d.nextAvailable) setNextAvailable(d.nextAvailable)
      })
      .catch(() => {})
      .finally(() => setCheckingLimit(false))
  }, [user])

  async function startMock() {
    const userId = localStorage.getItem('userId')
    if (!userId) { router.push('/login'); return }
    setGenerating(true)

    // Generate questions for each section via AI
    const allSectionQuestions: Record<string, any[]> = {}

    for (const section of config.sections) {
      setGenProgress(`Generating ${section.name} questions (${section.questions} items)...`)
      try {
        const res = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({
            userId,
            schoolId:   selectedSchool,
            subject:    section.subject,
            topic:      section.name,
            difficulty: 'mixed',
            format:     'mock',
            count:      section.questions,
          })
        })
        const data = await res.json()
        allSectionQuestions[section.id] = data.questions || []
      } catch {
        allSectionQuestions[section.id] = []
      }
    }

    // Save all section questions to sessionStorage
    sessionStorage.setItem('mockSectionQuestions', JSON.stringify(allSectionQuestions))
    sessionStorage.removeItem('mockAnswers')

    // Start mock session
    try {
      const res = await fetch('/api/mock/start', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({userId, school: selectedSchool})
      })
      const data = await res.json()
      const sessionId = data.sessionId || 'mock-' + Date.now()

      // Navigate to first section
      const firstSection = config.sections[0]
      router.push(`/mock-section?school=${selectedSchool}&sessionId=${sessionId}&sectionIdx=0&sectionId=${firstSection.id}&sectionName=${encodeURIComponent(firstSection.name)}&questions=${firstSection.questions}&minutes=${firstSection.minutes}&totalSections=${config.sections.length}`)
    } catch {
      setGenerating(false)
      setGenProgress('')
    }
  }

  if (authLoading) return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading...</div>
    </div>
  )

  return (
    <SessionGuard>
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
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Mock Exam</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Full simulation — real question counts, strict timers, no hints.</p>
          </div>

          {/* School selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {Object.entries(SCHOOL_CONFIGS).map(([id, cfg]) => (
              <button key={id} onClick={() => setSelectedSchool(id)}
                className={`border-2 rounded-2xl p-4 text-left transition-all ${selectedSchool===id ? 'border-red-500 bg-red-50 dark:bg-red-950' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                <div className="text-2xl mb-1">{cfg.emoji}</div>
                <div className={`text-sm font-black ${selectedSchool===id ? 'text-red-700 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>{cfg.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{cfg.total} items · {cfg.totalMin} min</div>
              </button>
            ))}
          </div>

          {/* Selected exam breakdown */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden mb-6">
            <div className="bg-gray-50 dark:bg-gray-800 px-5 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="text-sm font-black text-gray-900 dark:text-white">{config.name} — Exam Structure</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{config.total} total questions · {config.totalMin} minutes · AI-generated</div>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {config.sections.map((section, i) => (
                <div key={i} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{section.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{section.subject}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-gray-900 dark:text-white">{section.questions} items</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{section.minutes} min</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rules */}
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 mb-6">
            <div className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">Mock exam rules</div>
            <ul className="space-y-1.5">
              {['Section-by-section — must complete each before moving on','Strict time limits per section — auto-submits when time runs out','No per-question hints or explanations during the exam','AI-generates fresh questions every session','Once per week limit — makes it meaningful'].map((r,i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <span className="text-red-500 flex-shrink-0 mt-0.5">•</span>{r}
                </li>
              ))}
            </ul>
          </div>

          {generating ? (
            <div className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 rounded-2xl p-6 text-center">
              <div className="text-2xl mb-3 animate-spin inline-block">⚙️</div>
              <div className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-1">Generating your mock exam...</div>
              <div className="text-xs text-blue-600 dark:text-blue-400">{genProgress}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">This takes 1-2 minutes for full exam generation</div>
            </div>
          ) : checkingLimit ? (
            <div className="h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"/>
          ) : !canTake ? (
            <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-2xl p-5 text-center">
              <div className="text-sm font-bold text-orange-900 dark:text-orange-300 mb-1">Weekly limit reached</div>
              <div className="text-xs text-orange-600 dark:text-orange-400">Next mock available: {nextAvailable}</div>
            </div>
          ) : (
            <button onClick={startMock}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-2xl transition-colors text-base">
              Start {config.name} Mock Exam ({config.total} questions) →
            </button>
          )}

          <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-3">
            AI generates fresh questions each session · Results saved to your profile
          </p>
        </div>
      </div>
    </SessionGuard>
  )
}
