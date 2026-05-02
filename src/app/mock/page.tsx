'use client'
// src/app/mock/page.tsx — v3
// Routes to /mock-section for proper section-by-section flow
// Clears previous mock answers from sessionStorage on start

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import SessionGuard from '@/components/ui/SessionGuard'

const SCHOOL_CONFIGS: Record<string, {
  name: string; emoji: string; total: number; totalMin: number
  sections: { id:string; name:string; questions:number; minutes:number }[]
}> = {
  upcat: { name:'UPCAT', emoji:'🎓', total:80, totalMin:180, sections:[
    {id:'language', name:'Language Proficiency',  questions:20, minutes:45},
    {id:'reading',  name:'Reading Comprehension',  questions:20, minutes:45},
    {id:'math',     name:'Mathematics',            questions:20, minutes:45},
    {id:'science',  name:'Science',                questions:20, minutes:45},
  ]},
  acet: { name:'ACET', emoji:'📘', total:85, totalMin:150, sections:[
    {id:'english',  name:'English',               questions:20, minutes:35},
    {id:'math',     name:'Mathematics',            questions:20, minutes:40},
    {id:'abstract', name:'Abstract Reasoning',    questions:20, minutes:25},
    {id:'vocab',    name:'Vocabulary',             questions:15, minutes:20},
    {id:'reading',  name:'Reading Comprehension',  questions:15, minutes:30},
  ]},
  dcat: { name:'DCAT', emoji:'⚡', total:70, totalMin:150, sections:[
    {id:'language',     name:'Language Proficiency',   questions:20, minutes:40},
    {id:'quantitative', name:'Quantitative Reasoning', questions:20, minutes:45},
    {id:'inductive',    name:'Inductive Reasoning',    questions:15, minutes:30},
    {id:'science',      name:'Science Reasoning',      questions:15, minutes:35},
  ]},
  ustet: { name:'USTET', emoji:'✝️', total:92, totalMin:160, sections:[
    {id:'language',  name:'Language Proficiency',  questions:20, minutes:35},
    {id:'reading',   name:'Reading Comprehension',  questions:18, minutes:35},
    {id:'reasoning', name:'Reasoning Ability',      questions:18, minutes:30},
    {id:'science',   name:'Science',                questions:18, minutes:30},
    {id:'math',      name:'Mathematics',            questions:18, minutes:30},
  ]},
  pupcet: { name:'PUPCET', emoji:'🏛️', total:76, totalMin:140, sections:[
    {id:'verbal',     name:'Verbal Ability',     questions:20, minutes:35},
    {id:'analytical', name:'Analytical Thinking', questions:18, minutes:35},
    {id:'math',       name:'Mathematics',         questions:20, minutes:40},
    {id:'science',    name:'Science',             questions:18, minutes:30},
  ]},
  suc: { name:'State U CET', emoji:'🏫', total:71, totalMin:125, sections:[
    {id:'verbal',    name:'Verbal Ability',        questions:20, minutes:35},
    {id:'reasoning', name:'Quantitative Reasoning', questions:18, minutes:35},
    {id:'science',   name:'Science',               questions:18, minutes:30},
    {id:'abstract',  name:'Abstract Reasoning',    questions:15, minutes:25},
  ]},
}

export default function MockExamPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [selectedSchool, setSelectedSchool] = useState('upcat')
  const [starting,       setStarting]       = useState(false)
  const [error,          setError]          = useState('')
  const [hasDiagnostic,  setHasDiagnostic]  = useState<boolean|null>(null)
  const [weeklyCount,    setWeeklyCount]     = useState(0)
  const [checkingStatus, setCheckingStatus] = useState(true)

  useEffect(()=>{
    if(!authLoading&&!user){ router.push('/login?redirect=/mock'); return }
    if(user){
      setSelectedSchool(user.targetSchools?.[0] || 'upcat')
      checkStatusDirectly()
    }
  },[user,authLoading])

  async function checkStatusDirectly(){
    if(!user) return
    setCheckingStatus(true)
    try{
      const res = await fetch(`/api/user/sessions?userId=${user.id}&limit=100`)
      if(res.ok){
        const sessions = await res.json()
        setHasDiagnostic(sessions.some((s:any) => s.exam_type==='diagnostic' && s.status==='completed'))
        const weekAgo = new Date(Date.now()-7*24*60*60*1000).toISOString()
        setWeeklyCount(sessions.filter((s:any) => s.exam_type==='mock' && s.status==='completed' && s.completed_at > weekAgo).length)
      }
    }catch{ setHasDiagnostic(false) }
    finally{ setCheckingStatus(false) }
  }

  async function handleStart(){
    if(!user||!selectedSchool) return
    setStarting(true); setError('')
    try{
      const res = await fetch('/api/mock/start',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ userId:user.id, schoolId:selectedSchool }),
      })
      const data = await res.json()
      if(!res.ok){
        setError(data.error||'Could not start mock exam.')
        return
      }
      // Clear any previous mock answers
      sessionStorage.removeItem('mockAllAnswers')
      // Go to first section
      const config = SCHOOL_CONFIGS[selectedSchool]
      const first  = config.sections[0]
      router.push(
        `/mock-section?school=${selectedSchool}&sessionId=${data.sessionId}&section=0&name=${encodeURIComponent(first.name)}&total=${config.sections.length}&minutes=${first.minutes}&questions=${first.questions}`
      )
    }catch{ setError('Network error. Please try again.') }
    finally{ setStarting(false) }
  }

  if(authLoading||!user) return(
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading...</div>
    </div>
  )

  if(!user.isPaid) return(
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">← Dashboard</Link>
          <span className="font-black text-gray-900">MyCET<span className="text-red-600">Reviewer</span></span>
          <div/>
        </div>
      </nav>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="text-4xl mb-4">🏃</div>
        <h1 className="text-2xl font-black text-gray-900 mb-3">Mock Exams — Full Access Only</h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-8 max-w-md mx-auto">
          Full mock exams with exact sections, strict timers, and no hints. Unlock with Full Access for ₱500.
        </p>
        <Link href="/upgrade" className="inline-block bg-red-600 hover:bg-red-700 text-white font-black px-10 py-4 rounded-2xl transition-colors">
          Get Full Access — ₱500 →
        </Link>
      </div>
    </div>
  )

  const config    = SCHOOL_CONFIGS[selectedSchool]
  const hours     = Math.floor((config?.totalMin||0)/60)
  const mins      = (config?.totalMin||0)%60
  const atWeeklyLimit = weeklyCount >= 1
  const canStart  = !checkingStatus && hasDiagnostic===true && !atWeeklyLimit && !starting

  return(
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">← Dashboard</Link>
          <span className="font-black text-gray-900">MyCET<span className="text-red-600">Reviewer</span></span>
          <div/>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900 mb-1">Mock Full Exam</h1>
          <p className="text-sm text-gray-500">Section by section · Strict timers · Full results at the end</p>
        </div>

        {!checkingStatus && atWeeklyLimit && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
            <div className="font-bold text-sm text-blue-900 mb-1">Weekly mock exam taken ✓</div>
            <div className="text-xs text-blue-700 leading-relaxed">
              You've completed your mock exam this week. Come back next week for a fresh set.
              Use Training mode to drill your weak topics in the meantime.
            </div>
            <Link href="/training" className="inline-block mt-3 text-xs font-bold text-blue-600 hover:text-blue-800">
              Go to Training →
            </Link>
          </div>
        )}

        {!checkingStatus && hasDiagnostic===false && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
            <div className="font-bold text-sm text-yellow-900 mb-1">Complete your diagnostic first</div>
            <div className="text-xs text-yellow-700 mb-3">Take the free diagnostic before attempting a mock exam.</div>
            <Link href="/diagnostic" className="inline-block bg-yellow-600 text-white font-bold px-4 py-2 rounded-xl text-xs">Take Free Diagnostic →</Link>
          </div>
        )}

        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
          <div className="text-sm font-bold text-red-800 mb-2">Before you start</div>
          <div className="space-y-1.5 text-xs text-red-700">
            <div>⏱ Each section has a strict countdown timer</div>
            <div>🚫 No answer reveals during the exam — only after all sections</div>
            <div>📵 Set aside uninterrupted time for each section</div>
            <div>📅 Once per week — makes each attempt meaningful</div>
          </div>
        </div>

        {/* School selector */}
        <div className="mb-5">
          <label className="block text-sm font-bold text-gray-900 mb-2">Choose your admission test</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(SCHOOL_CONFIGS).map(([id,cfg])=>(
              <button key={id} onClick={()=>setSelectedSchool(id)}
                className={`border rounded-xl p-3 text-left transition-all ${selectedSchool===id?'border-red-500 bg-red-50':'border-gray-200 hover:border-gray-300'}`}>
                <div className="text-base mb-1">{cfg.emoji}</div>
                <div className={`text-sm font-black ${selectedSchool===id?'text-red-700':'text-gray-900'}`}>{cfg.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{cfg.sections.length} sections</div>
              </button>
            ))}
          </div>
        </div>

        {/* Sections breakdown */}
        {config && (
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-900 mb-2">Sections</label>
            <div className="space-y-2">
              {config.sections.map((section,i)=>(
                <div key={section.id} className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{section.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{section.questions} questions</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-700">{section.minutes} min</div>
                    <div className="text-xs text-gray-400">Section {i+1}</div>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <div className="text-sm font-black text-gray-900">Total</div>
                <div className="text-sm font-black text-gray-900">
                  {config.sections.reduce((s,sec)=>s+sec.questions,0)} questions · {hours>0?`${hours}h `:''}{ mins>0?`${mins}min`:''}
                </div>
              </div>
            </div>
          </div>
        )}

        <SessionGuard userId={user.id} onClear={()=>setError('')}>
          {error&&(
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4">{error}</div>
          )}
          <button onClick={handleStart} disabled={!canStart}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-black py-4 rounded-2xl transition-colors text-base">
            {checkingStatus ? 'Checking status...'
              : starting    ? 'Starting exam...'
              : hasDiagnostic===false ? 'Complete diagnostic first'
              : atWeeklyLimit ? 'Come back next week'
              : 'Begin Mock Exam →'
            }
          </button>
          {canStart && (
            <p className="text-xs text-gray-400 text-center mt-2">
              Make sure you have {hours>0?`${hours}h `:''}{ mins>0?`${mins} min`:''}  of uninterrupted time
            </p>
          )}
        </SessionGuard>
      </div>
    </div>
  )
}
