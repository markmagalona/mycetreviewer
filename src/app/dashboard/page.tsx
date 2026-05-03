'use client'
// src/app/dashboard/page.tsx
// Focus area "Train →" links now pass topic to training page

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

type Session = {
  id:string; school_id:string; exam_type:string; score:number
  xp_earned:number; completed_at:string; weak_topics:string[]
}

const RANK_INFO: Record<string,{icon:string;next:string;nextXP:number;color:string}> = {
  'Baguhan':            {icon:'🌱',next:'Mag-aaral',         nextXP:100,  color:'#16a34a'},
  'Mag-aaral':          {icon:'📚',next:'Achiever',          nextXP:300,  color:'#185FA5'},
  'Achiever':           {icon:'⚡',next:'With Honor',        nextXP:600,  color:'#854F0B'},
  'With Honor':         {icon:'🏅',next:'With High Honor',   nextXP:1000, color:'#A32D2D'},
  'With High Honor':    {icon:'🎓',next:'With Highest Honor',nextXP:2000, color:'#534AB7'},
  'With Highest Honor': {icon:'🏆',next:'Max rank',          nextXP:9999, color:'#791F1F'},
}
const EXAM_NAMES: Record<string,string> = {upcat:'UPCAT',acet:'ACET',dcat:'DCAT',ustet:'USTET',pupcet:'PUPCET',suc:'State U CET'}

function getDaysUntil(d:string|null){ if(!d) return null; return Math.max(0,Math.ceil((new Date(d).getTime()-Date.now())/(864e5))) }

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router   = useRouter()
  const [sessions,  setSessions]  = useState<Session[]>([])
  const [examDate,  setExamDate]  = useState<string|null>(null)
  const [loaded,    setLoaded]    = useState(false)

  useEffect(()=>{
    if(!authLoading&&!user){ router.push('/login'); return }
    if(user&&!loaded){
      Promise.all([
        fetch(`/api/user/sessions?userId=${user.id}&limit=20`),
        fetch(`/api/user/me?userId=${user.id}`),
      ]).then(async([sr,ur])=>{
        if(sr.ok) setSessions(await sr.json())
        if(ur.ok){ const d=await ur.json(); setExamDate(d.exam_date||null) }
        setLoaded(true)
      }).catch(()=>setLoaded(true))
    }
  },[user,authLoading,router,loaded])

  if(authLoading||!user) return(
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading...</div>
    </div>
  )

  const ri          = RANK_INFO[user.rank]||RANK_INFO['Baguhan']
  const xpPct       = Math.min(100,Math.round((user.xp/ri.nextXP)*100))
  const daysLeft    = getDaysUntil(examDate)
  const completedExams = new Set(sessions.map(s=>s.school_id))
  const lastDiag    = sessions.find(s=>s.exam_type==='diagnostic')
  const weakTopics  = lastDiag?.weak_topics||[]
  const lastScore   = lastDiag?.score
  const lastSchool  = lastDiag?.school_id || user.targetSchools?.[0] || 'upcat'

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-black text-gray-900">MyCET<span className="text-red-600">Reviewer</span></Link>
          <div className="flex items-center gap-3">
            <Link href="/leaderboard" className="text-sm text-gray-500 hover:text-gray-900">Leaderboard</Link>
            <Link href="/profile"     className="text-sm text-gray-500 hover:text-gray-900">Profile</Link>
            <button onClick={signOut}  className="text-sm text-gray-400 hover:text-gray-600">Sign out</button>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* XP + rank */}
        <div className="bg-gray-900 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Welcome back</div>
              <div className="text-lg font-black text-white">
                {user.username||user.name}
                {!user.hasProfile&&(
                  <Link href="/profile" className="ml-2 text-xs text-red-400 font-normal hover:text-red-300">(set username)</Link>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-black text-yellow-400">{user.xp.toLocaleString()} XP</div>
              <div className="text-xs text-gray-400 mt-0.5">{ri.icon} {user.rank}</div>
            </div>
          </div>
          <div className="bg-gray-700 rounded-full h-2 overflow-hidden mb-1">
            <div className="h-2 rounded-full transition-all duration-700" style={{width:xpPct+'%',background:ri.color}}/>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{user.xp} XP</span>
            {ri.nextXP<9999?<span>{ri.nextXP-user.xp} XP to {ri.next}</span>:<span>Maximum rank 🏆</span>}
          </div>
        </div>

        {/* Countdown */}
        {daysLeft!==null&&(
          <div className={`rounded-2xl p-4 flex items-center gap-4 ${daysLeft<=7?'bg-red-50 border border-red-200':daysLeft<=30?'bg-yellow-50 border border-yellow-200':'bg-blue-50 border border-blue-100'}`}>
            <div className="text-3xl font-black" style={{color:daysLeft<=7?'#c1121f':daysLeft<=30?'#854F0B':'#185FA5'}}>{daysLeft}</div>
            <div>
              <div className="font-bold text-sm text-gray-900">
                {daysLeft===0?'Exam day is today!':daysLeft===1?'Exam is tomorrow!':'Days until your exam'}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {daysLeft<=7?'Daily mock exams — simulate real conditions.':
                 daysLeft<=30?'Daily training on weak topics.':'Keep building your foundation daily.'}
              </div>
            </div>
            <Link href="/profile" className="ml-auto text-xs text-gray-400 hover:text-gray-600 flex-shrink-0">Edit</Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {val:sessions.filter(s=>s.exam_type==='diagnostic').length, label:'Diagnostics'},
            {val:sessions.filter(s=>s.exam_type==='mock').length,       label:'Mock exams'},
            {val:sessions.filter(s=>s.exam_type==='training').length,   label:'Training done'},
            {val:lastScore!=null?lastScore+'%':'—',                     label:'Last score'},
          ].map((s,i)=>(
            <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
              <div className="text-xl font-black text-gray-900">{s.val}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Weak topics — with topic-specific training links */}
        {weakTopics.length>0&&(
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900">Focus areas — from your last diagnostic</h3>
              <Link href="/training" className="text-xs text-red-600 hover:text-red-800 font-semibold">
                All topics →
              </Link>
            </div>
            <div className="space-y-2">
              {weakTopics.slice(0,3).map((topic,i)=>(
                <div key={i} className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-black flex-shrink-0">{i+1}</div>
                  <div className="text-sm font-semibold text-red-800 flex-1">{topic}</div>
                  {/* Pass the topic to training page so it pre-selects */}
                  <Link
                    href={`/training?topic=${encodeURIComponent(topic)}&school=${lastSchool}`}
                    className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 px-2.5 py-1 rounded-lg transition-colors flex-shrink-0">
                    Train →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No diagnostics yet */}
        {weakTopics.length===0&&sessions.filter(s=>s.exam_type==='diagnostic').length===0&&(
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-center">
            <div className="text-2xl mb-2">🩺</div>
            <div className="text-sm font-bold text-gray-900 mb-1">Take your free diagnostic</div>
            <div className="text-xs text-gray-500 mb-4">Find your weak spots in 15 minutes. It's free and no signup needed.</div>
            <Link href="/diagnostic" className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">
              Start Free Diagnostic →
            </Link>
          </div>
        )}

        {/* Admission tests */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3">Admission tests</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(EXAM_NAMES).map(([id,name])=>{
              const done=completedExams.has(id)
              const s=sessions.find(s=>s.school_id===id&&s.exam_type==='diagnostic')
              return(
                <Link key={id}
                  href={done?`/results?school=${id}&type=diagnostic`:`/exam?school=${id}&type=diagnostic`}
                  className={`border rounded-xl p-3 text-center transition-all ${done?'border-green-300 bg-green-50':'border-gray-200 hover:border-red-300 hover:bg-red-50'}`}>
                  <div className="text-sm font-black text-gray-900">{name}</div>
                  {done?<div className="text-xs text-green-700 font-bold mt-1">✓ {s?.score}%</div>:<div className="text-xs text-gray-400 mt-1">Not taken yet</div>}
                </Link>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="pb-6 space-y-2">
          {user.isPaid?(
            <Link href="/study-plan"
              className="block w-full text-center border border-red-300 hover:bg-red-50 text-red-600 font-bold py-3.5 rounded-2xl transition-colors text-sm mb-2">
              📅 View My 30-Day Study Plan
            </Link>
            <Link href="/training"
              className="block w-full text-center bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl transition-colors">
              Start AI Training Session →
            </Link>
          ):(
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-center">
              <div className="text-sm font-bold text-gray-900 mb-1">Unlock unlimited AI practice</div>
              <div className="text-xs text-gray-500 mb-4">Mock exams, unlimited AI questions, personalized study plan</div>
              <Link href="/upgrade"
                className="inline-block bg-red-600 hover:bg-red-700 text-white font-black py-3 px-8 rounded-2xl transition-colors text-sm">
                Get Full Access — ₱500 →
              </Link>
            </div>
          )}
          {user.isPaid&&(
            <Link href="/mock"
              className="block w-full text-center border border-gray-300 hover:border-gray-500 text-gray-700 font-bold py-3.5 rounded-2xl transition-colors text-sm">
              Start Mock Exam
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
