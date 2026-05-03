'use client'

export const dynamic = 'force-dynamic'
// src/app/leaderboard/page.tsx
// Global leaderboard + Battle of Schools
// Shows usernames only — never real names

import { useState, useEffect } from 'react'
import Link from 'next/link'

type LeaderEntry = { rank:number; username:string; xp:number; rankTitle:string; school:string|null; targetExam:string|null }
type SchoolEntry = { rank:number; schoolId:string; schoolName:string; avgScore:number; totalStudents:number }

const EXAM_NAMES: Record<string,string> = {upcat:'UPCAT',acet:'ACET',dcat:'DCAT',ustet:'USTET',pupcet:'PUPCET',suc:'State U'}
const RANK_COLORS: Record<string,string> = {
  'Baguhan':'text-green-700 bg-green-100',
  'Mag-aaral':'text-blue-700 bg-blue-100',
  'Achiever':'text-yellow-700 bg-yellow-100',
  'With Honor':'text-red-700 bg-red-100',
  'With High Honor':'text-purple-700 bg-purple-100',
  'With Highest Honor':'text-gray-100 bg-gray-900',
}

const RANK_MEDALS = ['🥇','🥈','🥉']

export default function LeaderboardPage() {
  const [tab,       setTab]       = useState<'global'|'battle'>('global')
  const [examFilter,setExamFilter]= useState('')
  const [global,    setGlobal]    = useState<LeaderEntry[]>([])
  const [battle,    setBattle]    = useState<SchoolEntry[]>([])
  const [loading,   setLoading]   = useState(true)
  const [currentUser, setCurrentUser] = useState('')

  useEffect(() => {
    setCurrentUser(sessionStorage.getItem('userEmail') || '')
  }, [])

  useEffect(() => {
    loadData()
  }, [tab, examFilter])

  async function loadData() {
    setLoading(true)
    try {
      if (tab === 'global') {
        const url = `/api/leaderboard?type=global${examFilter ? `&exam=${examFilter}` : ''}&limit=50`
        const res  = await fetch(url)
        const data = await res.json()
        setGlobal(data.leaderboard || [])
      } else {
        const res  = await fetch('/api/leaderboard?type=battle&limit=30')
        const data = await res.json()
        setBattle(data.schools || [])
      }
    } catch { /* silently fail */ }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-black text-gray-900">MyCET<span className="text-red-600">Reviewer</span></Link>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="py-8 text-center">
          <h1 className="text-2xl font-black text-gray-900 mb-1">Leaderboard</h1>
          <p className="text-sm text-gray-500">Top students and schools this week · Resets every Monday</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button onClick={() => setTab('global')}
            className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${tab==='global'?'text-red-600 border-red-600':'text-gray-500 border-transparent hover:text-gray-700'}`}>
            🏆 Global Rankings
          </button>
          <button onClick={() => setTab('battle')}
            className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${tab==='battle'?'text-red-600 border-red-600':'text-gray-500 border-transparent hover:text-gray-700'}`}>
            ⚔️ Battle of Schools
          </button>
        </div>

        {/* Global tab */}
        {tab === 'global' && (
          <>
            {/* Exam filter */}
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
              <button onClick={() => setExamFilter('')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${!examFilter?'bg-red-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                All exams
              </button>
              {Object.entries(EXAM_NAMES).map(([id, name]) => (
                <button key={id} onClick={() => setExamFilter(id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${examFilter===id?'bg-red-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {name}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="py-12 text-center text-gray-400 text-sm">Loading rankings...</div>
            ) : global.length === 0 ? (
              <div className="py-12 text-center">
                <div className="text-3xl mb-3">🏆</div>
                <div className="text-gray-500 text-sm">No rankings yet. Be the first!</div>
                <Link href="/diagnostic" className="mt-4 inline-block bg-red-600 text-white text-sm font-bold px-6 py-2.5 rounded-full">
                  Take the diagnostic →
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {global.map((entry, i) => (
                  <div key={i}
                    className={`flex items-center gap-3 p-3.5 rounded-xl transition-colors ${entry.username===currentUser?'bg-yellow-50 border border-yellow-200':i<3?'bg-gray-50':'hover:bg-gray-50'}`}>
                    {/* Rank */}
                    <div className="w-8 text-center flex-shrink-0">
                      {i < 3
                        ? <span className="text-lg">{RANK_MEDALS[i]}</span>
                        : <span className="text-sm font-black text-gray-400">#{entry.rank}</span>
                      }
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-black text-sm ${entry.username===currentUser?'text-yellow-800':'text-gray-900'}`}>
                          {entry.username}
                          {entry.username===currentUser&&<span className="ml-1 text-xs font-normal text-yellow-600">(you)</span>}
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${RANK_COLORS[entry.rankTitle]||'text-gray-600 bg-gray-100'}`}>
                          {entry.rankTitle}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {entry.school && <span className="text-xs text-gray-400 truncate max-w-[120px]">{entry.school}</span>}
                        {entry.targetExam && <span className="text-xs text-gray-400">{EXAM_NAMES[entry.targetExam]||entry.targetExam}</span>}
                      </div>
                    </div>
                    {/* XP */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-black text-gray-900">{entry.xp.toLocaleString()}</div>
                      <div className="text-xs text-gray-400">XP</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Battle of Schools tab */}
        {tab === 'battle' && (
          <>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-5">
              <div className="text-sm font-bold text-red-800 mb-1">⚔️ Battle of Schools — This Week</div>
              <div className="text-xs text-red-600 leading-relaxed">
                Schools ranked by average diagnostic score this week. Minimum 2 students required to qualify. Resets every Monday.
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-gray-400 text-sm">Loading school rankings...</div>
            ) : battle.length === 0 ? (
              <div className="py-12 text-center">
                <div className="text-3xl mb-3">🏫</div>
                <div className="text-gray-500 text-sm">No schools ranked yet this week.</div>
                <div className="text-xs text-gray-400 mt-2">Set your school on your profile to join the competition.</div>
                <Link href="/profile" className="mt-4 inline-block bg-red-600 text-white text-sm font-bold px-6 py-2.5 rounded-full">
                  Set my school →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {battle.map((school, i) => (
                  <div key={i} className={`flex items-center gap-3 p-4 rounded-xl border ${i===0?'border-yellow-300 bg-yellow-50':i===1?'border-gray-200 bg-gray-50':i===2?'border-orange-200 bg-orange-50':'border-gray-100 bg-white'}`}>
                    <div className="w-8 text-center flex-shrink-0">
                      {i < 3
                        ? <span className="text-lg">{RANK_MEDALS[i]}</span>
                        : <span className="text-sm font-black text-gray-400">#{school.rank}</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-sm text-gray-900 truncate">{school.schoolName}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{school.totalStudents} student{school.totalStudents!==1?'s':''} competing</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-black text-gray-900">{school.avgScore}%</div>
                      <div className="text-xs text-gray-400">avg score</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 text-center pb-6">
              <Link href="/profile" className="text-sm text-red-600 font-semibold hover:underline">
                Add your school to compete →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
