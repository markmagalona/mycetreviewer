'use client'
// src/app/mock-break/page.tsx
// Between mock exam sections — no score shown
// Just encouragement + ready for next section button

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

const SCHOOL_CONFIGS: Record<string, {
  name: string
  sections: { id:string; name:string; questions:number; minutes:number }[]
}> = {
  upcat: { name:'UPCAT', sections:[
    {id:'language',  name:'Language Proficiency',  questions:20, minutes:45},
    {id:'reading',   name:'Reading Comprehension',  questions:20, minutes:45},
    {id:'math',      name:'Mathematics',            questions:20, minutes:45},
    {id:'science',   name:'Science',                questions:20, minutes:45},
  ]},
  acet: { name:'ACET', sections:[
    {id:'english',   name:'English',               questions:20, minutes:35},
    {id:'math',      name:'Mathematics',            questions:20, minutes:40},
    {id:'abstract',  name:'Abstract Reasoning',    questions:20, minutes:25},
    {id:'vocab',     name:'Vocabulary',             questions:15, minutes:20},
    {id:'reading',   name:'Reading Comprehension',  questions:15, minutes:30},
  ]},
  dcat: { name:'DCAT', sections:[
    {id:'language',     name:'Language Proficiency',   questions:20, minutes:40},
    {id:'quantitative', name:'Quantitative Reasoning', questions:20, minutes:45},
    {id:'inductive',    name:'Inductive Reasoning',    questions:15, minutes:30},
    {id:'science',      name:'Science Reasoning',      questions:15, minutes:35},
  ]},
  ustet: { name:'USTET', sections:[
    {id:'language',  name:'Language Proficiency',  questions:20, minutes:35},
    {id:'reading',   name:'Reading Comprehension',  questions:18, minutes:35},
    {id:'reasoning', name:'Reasoning Ability',      questions:18, minutes:30},
    {id:'science',   name:'Science',                questions:18, minutes:30},
    {id:'math',      name:'Mathematics',            questions:18, minutes:30},
  ]},
  pupcet: { name:'PUPCET', sections:[
    {id:'verbal',     name:'Verbal Ability',     questions:20, minutes:35},
    {id:'analytical', name:'Analytical Thinking', questions:18, minutes:35},
    {id:'math',       name:'Mathematics',         questions:20, minutes:40},
    {id:'science',    name:'Science',             questions:18, minutes:30},
  ]},
  suc: { name:'State U CET', sections:[
    {id:'verbal',    name:'Verbal Ability',        questions:20, minutes:35},
    {id:'reasoning', name:'Quantitative Reasoning', questions:18, minutes:35},
    {id:'science',   name:'Science',               questions:18, minutes:30},
    {id:'abstract',  name:'Abstract Reasoning',    questions:15, minutes:25},
  ]},
}

const BREAK_MESSAGES = [
  "Keep going — you're doing great!",
  "Stay focused. You've got this.",
  "One section down. Keep your momentum.",
  "Breathe. Stay calm. You're prepared.",
  "Almost there. Give it your best.",
]

export default function MockBreakPage() {
  const params   = useSearchParams()
  const router   = useRouter()
  const school   = params.get('school') || 'upcat'
  const sessionId= params.get('sessionId') || ''
  const completedSection = parseInt(params.get('completedSection') || '0')
  const totalSections    = parseInt(params.get('totalSections') || '4')
  const [message] = useState(() => BREAK_MESSAGES[Math.floor(Math.random() * BREAK_MESSAGES.length)])

  const config = SCHOOL_CONFIGS[school] || SCHOOL_CONFIGS.upcat
  const nextSectionIdx = completedSection + 1
  const nextSection    = config.sections[nextSectionIdx]
  const isLastBreak    = nextSectionIdx >= totalSections - 1

  function handleNext() {
    if (!nextSection) return
    router.push(
      `/mock-section?school=${school}&sessionId=${sessionId}&section=${nextSectionIdx}&name=${encodeURIComponent(nextSection.name)}&total=${totalSections}&minutes=${nextSection.minutes}&questions=${nextSection.questions}`
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">

        {/* Section completed indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {config.sections.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all ${
              i <= completedSection ? 'bg-red-600 w-8' : 'bg-gray-700 w-4'
            }`}/>
          ))}
        </div>

        {/* Completed badge */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-6">
          <div className="text-2xl mb-3">✅</div>
          <div className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-1">
            Section {completedSection + 1} Complete
          </div>
          <div className="text-lg font-black text-white mb-1">
            {config.sections[completedSection]?.name}
          </div>
          <div className="text-xs text-gray-500 mt-2">{message}</div>
        </div>

        {/* Next section info */}
        {nextSection && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6 text-left">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Up next</div>
            <div className="text-base font-black text-white mb-1">
              Section {nextSectionIdx + 1}: {nextSection.name}
            </div>
            <div className="text-xs text-gray-400">
              {nextSection.questions} questions · {nextSection.minutes} minutes
            </div>
            {isLastBreak && (
              <div className="mt-2 text-xs text-red-400 font-semibold">
                Final section — give it everything you have.
              </div>
            )}
          </div>
        )}

        {/* Scores are hidden until all sections done */}
        <div className="text-xs text-gray-600 mb-6">
          Your score will be revealed after all {totalSections} sections are complete.
        </div>

        <button onClick={handleNext}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl transition-colors text-base">
          Start Section {nextSectionIdx + 1} →
        </button>

        <p className="text-xs text-gray-600 mt-3">
          Take a short break if needed — the timer starts when you click above.
        </p>
      </div>
    </div>
  )
}
