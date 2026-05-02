// src/components/ui/SessionGuard.tsx
// Shows a resume/abandon modal when student tries to start a new session
// while they have an existing in-progress session

'use client'
import { useState, useEffect } from 'react'

type Session = { id:string; exam_type:'training'|'mock'; started_at:string; school_id:string }
type Props   = { userId:string; onClear:()=>void; children:React.ReactNode }

const SCHOOL_NAMES: Record<string,string> = {upcat:'UPCAT',acet:'ACET',dcat:'DCAT',ustet:'USTET',pupcet:'PUPCET',suc:'State U CET'}

export default function SessionGuard({userId, onClear, children}: Props) {
  const [activeSession, setActiveSession] = useState<Session|null>(null)
  const [checked,       setChecked]       = useState(false)
  const [abandoning,    setAbandoning]    = useState(false)

  useEffect(()=>{
    async function checkSession(){
      try{
        const res  = await fetch(`/api/session/check?userId=${userId}`)
        const data = await res.json()
        setActiveSession(data.hasActiveSession ? data.session : null)
      }catch{ /* silently fail */ }
      finally{ setChecked(true) }
    }
    if(userId) checkSession()
    else setChecked(true)
  },[userId])

  async function handleAbandon(){
    if(!activeSession) return
    setAbandoning(true)
    try{
      const res = await fetch('/api/session/abandon',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({sessionId:activeSession.id, userId}),
      })
      if(res.ok){ setActiveSession(null); onClear() }
    }catch{ /* silently fail */ }
    finally{ setAbandoning(false) }
  }

  if(!checked) return (
    <div className="flex items-center justify-center py-8">
      <div className="text-gray-400 text-sm">Loading...</div>
    </div>
  )

  if(activeSession) {
    const startedAt = new Date(activeSession.started_at)
    const hoursAgo  = Math.round((Date.now()-startedAt.getTime())/3600000)
    const timeLabel = hoursAgo<1 ? 'a few minutes ago' : hoursAgo===1 ? '1 hour ago' : `${hoursAgo} hours ago`

    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 m-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="text-xl flex-shrink-0">⚠️</div>
          <div>
            <div className="font-bold text-sm text-yellow-900 mb-1">
              You have an unfinished {activeSession.exam_type === 'training' ? 'Training' : 'Mock Exam'} session
            </div>
            <div className="text-xs text-yellow-700 leading-relaxed">
              Started {timeLabel} · {SCHOOL_NAMES[activeSession.school_id] || activeSession.school_id}
            </div>
            <div className="text-xs text-yellow-600 mt-1">
              You need to finish it or abandon it before starting a new session.
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={()=>window.location.href=`/exam?sessionId=${activeSession.id}&school=${activeSession.school_id}&type=${activeSession.exam_type}`}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
            Continue session
          </button>
          <button onClick={handleAbandon} disabled={abandoning}
            className="flex-1 bg-white border border-yellow-300 hover:border-yellow-500 text-yellow-800 font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">
            {abandoning ? 'Abandoning...' : 'Abandon + start new'}
          </button>
        </div>
        <p className="text-xs text-yellow-600 text-center mt-2">Abandoned sessions do not earn XP</p>
      </div>
    )
  }

  return <>{children}</>
}
