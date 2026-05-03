'use client'
// src/app/profile/page.tsx — uses AuthContext, no dev mode

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import SchoolSearch from '@/components/ui/SchoolSearch'

const EXAMS = [
  {id:'upcat', name:'UPCAT',       emoji:'🎓'},
  {id:'acet',  name:'ACET',        emoji:'📘'},
  {id:'dcat',  name:'DCAT',        emoji:'⚡'},
  {id:'ustet', name:'USTET',       emoji:'✝️'},
  {id:'pupcet',name:'PUPCET',      emoji:'🏛️'},
  {id:'suc',   name:'State U CET', emoji:'🏫'},
]

export default function ProfilePage() {
  const { user, loading: authLoading, refresh } = useAuth()
  const router      = useRouter()
  const timerRef    = useRef<ReturnType<typeof setTimeout>|null>(null)
  const [username,      setUsername]      = useState('')
  const [selectedExams, setSelectedExams] = useState<string[]>([])
  const [school,        setSchool]        = useState<any>(null)
  const [schoolName,    setSchoolName]    = useState('')
  const [examDate,      setExamDate]      = useState('')
  const [saving,        setSaving]        = useState(false)
  const [error,         setError]         = useState('')
  const [success,       setSuccess]       = useState(false)
  const [usernameStatus,setUsernameStatus]= useState<'idle'|'checking'|'available'|'taken'>('idle')

  useEffect(()=>{
    if(!authLoading&&!user){ router.push('/login?redirect=/profile'); return }
    if(user){
      // Pre-fill existing values
      if(user.username) setUsername(user.username)
    }
  },[user,authLoading,router])

  function handleUsernameChange(val:string){
    const clean=val.replace(/[^a-zA-Z0-9_]/g,'').slice(0,20)
    setUsername(clean); setUsernameStatus('idle')
    if(timerRef.current) clearTimeout(timerRef.current)
    if(clean.length>=3&&clean!==user?.username){
      timerRef.current=setTimeout(async()=>{
        setUsernameStatus('checking')
        try{
          const res=await fetch(`/api/user/check-username?username=${clean}`)
          const data=await res.json()
          setUsernameStatus(data.available?'available':'taken')
        }catch{ setUsernameStatus('idle') }
      },500)
    } else if(clean===user?.username){
      setUsernameStatus('available') // same as current = available
    }
  }

  function toggleExam(id:string){
    setSelectedExams(prev=>prev.includes(id)?prev.filter(e=>e!==id):[...prev,id])
  }

  async function handleSave(e:React.FormEvent){
    e.preventDefault()
    if(!user) return
    if(!username||username.length<3){setError('Username must be at least 3 characters.');return}
    if(usernameStatus==='taken'){setError('That username is already taken.');return}
    if(selectedExams.length===0){setError('Please select at least one admission test.');return}
    setSaving(true); setError('')
    try{
      const res=await fetch('/api/user/profile',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          userId:         user.id,
          username,
          phSchoolId:     school?.id||null,
          phSchoolName:   school?.name||schoolName||null,
          targetSchools:  selectedExams,
          examDate:       examDate||null,
        }),
      })
      if(res.ok){
        await refresh() // refresh auth context with new profile data
        setSuccess(true)
        setTimeout(()=>router.push('/dashboard'),1500)
      } else {
        const d=await res.json(); setError(d.error||'Save failed. Please try again.')
      }
    }catch{ setError('Network error. Please try again.') }
    finally{ setSaving(false) }
  }

  if(authLoading||!user) return(
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading...</div>
    </div>
  )

  const hintColor={idle:'',checking:'text-gray-400',available:'text-green-600',taken:'text-red-600'}
  const hintText ={idle:'',checking:'Checking...',available:'✓ Available',taken:'✗ Taken'}

  return(
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-black text-gray-900">MyCET<span className="text-red-600">Reviewer</span></Link>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">
            {user.hasProfile ? 'Back to dashboard' : 'Skip for now'}
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900 mb-2">
            {user.hasProfile ? 'Edit your profile' : 'Set up your profile'}
          </h1>
          <p className="text-sm text-gray-500">
            Your username appears on the leaderboard. Your school enters you in the Battle of Schools competition.
          </p>
        </div>

        {success?(
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <div className="text-2xl mb-2">🎉</div>
            <div className="font-bold text-green-800">Profile saved! Taking you to your dashboard...</div>
          </div>
        ):(
          <form onSubmit={handleSave} className="space-y-6">

            {/* Username */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Username <span className="text-red-600">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                What other students see on the leaderboard. Never your real name or email.
              </p>
              <div className="relative">
                <input type="text" value={username} onChange={e=>handleUsernameChange(e.target.value)}
                  placeholder="e.g. StudyBeast2025"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 pr-32"
                  maxLength={20} required/>
                {usernameStatus!=='idle'&&(
                  <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold ${hintColor[usernameStatus]}`}>
                    {hintText[usernameStatus]}
                  </div>
                )}
              </div>
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-400">Letters, numbers, underscores only · 3–20 characters</p>
                <p className="text-xs text-gray-400">{username.length}/20</p>
              </div>
            </div>

            {/* Target exams */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Which exams are you taking? <span className="text-red-600">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-3">Select all that apply.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {EXAMS.map(exam=>(
                  <button key={exam.id} type="button" onClick={()=>toggleExam(exam.id)}
                    className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 text-left transition-all ${selectedExams.includes(exam.id)?'border-red-500 bg-red-50 text-red-700':'border-gray-200 text-gray-700 hover:border-gray-300'}`}>
                    <span>{exam.emoji}</span>
                    <span className="text-sm font-bold">{exam.name}</span>
                    {selectedExams.includes(exam.id)&&<span className="ml-auto text-xs">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* School */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">Your Senior High School</label>
              <p className="text-xs text-gray-500 mb-2">
                Puts you in the Battle of Schools competition.
              </p>
              <SchoolSearch
                onSelect={(s,custom)=>{ setSchool(s); setSchoolName(custom||s?.name||'') }}
                placeholder="Search your SHS..."
              />
            </div>

            {/* Exam date */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Exam date{' '}
                <span className="text-gray-400 font-normal text-xs">(optional — sets your countdown timer)</span>
              </label>
              <input type="date" value={examDate} onChange={e=>setExamDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500"/>
            </div>

            {error&&(
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Dark mode toggle */}
            <div className="flex items-center justify-between border border-gray-200 rounded-2xl px-4 py-3">
              <div>
                <div className="text-sm font-bold text-gray-900">Dark mode</div>
                <div className="text-xs text-gray-500 mt-0.5">Easy on the eyes during late-night study</div>
              </div>
              <button onClick={e=>{e.preventDefault();toggleDark()}}
                className={`relative w-12 h-6 rounded-full transition-colors ${isDark?'bg-red-600':'bg-gray-200'}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isDark?'translate-x-6':'translate-x-0.5'}`}/>
              </button>
            </div>

            <button type="submit" disabled={saving||usernameStatus==='taken'}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-black py-4 rounded-2xl transition-colors">
              {saving?'Saving...':'Save Profile →'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
