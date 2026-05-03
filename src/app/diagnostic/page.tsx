'use client'
export const dynamic = 'force-dynamic'
// src/app/diagnostic/page.tsx
// Free diagnostic - once per school per user

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const EXAMS = [
  { id:'upcat',  name:'UPCAT',       emoji:'🎓', full:'UP System Admission Test',         sections:'Language · Reading · Math · Science',             time:'3 hrs',   badge:'Most competitive', cls:'bg-red-100 text-red-700'     },
  { id:'acet',   name:'ACET',        emoji:'📘', full:'Ateneo Admission Test',             sections:'English · Math · Abstract · Vocab · Reading',     time:'2.5 hrs', badge:'Very hard',        cls:'bg-blue-100 text-blue-700'   },
  { id:'dcat',   name:'DCAT',        emoji:'⚡', full:'De La Salle Admission Test',        sections:'Language · Quantitative · Inductive · Science',   time:'2.5 hrs', badge:'Very hard',        cls:'bg-green-100 text-green-700' },
  { id:'ustet',  name:'USTET',       emoji:'✝️', full:'UST Entrance Test',                sections:'Language · Reading · Reasoning · Science · Math', time:'2.5 hrs', badge:'Hard',             cls:'bg-yellow-100 text-yellow-700'},
  { id:'pupcet', name:'PUPCET',      emoji:'🏛️', full:'PUP Admission Test',               sections:'Verbal · Analytical · Math · Science',            time:'2 hrs',   badge:'Moderate',         cls:'bg-purple-100 text-purple-700'},
  { id:'suc',    name:'State U CET', emoji:'🏫', full:'State Universities Entrance Test', sections:'Verbal · Reasoning · Science · Abstract',         time:'2 hrs',   badge:'Moderate',         cls:'bg-orange-100 text-orange-700'},
]

export default function DiagnosticPage() {
  const router = useRouter()
  const [completedSchools, setCompletedSchools] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userId = localStorage.getItem('userId')
    if (!userId) { setLoading(false); return }

    fetch(`/api/user/sessions?userId=${userId}&limit=100`)
      .then(r => r.json())
      .then(sessions => {
        const done = sessions
          .filter((s: any) => s.exam_type === 'diagnostic' && s.status === 'completed')
          .map((s: any) => s.school_id)
        setCompletedSchools(done)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function handleSelect(examId: string) {
    if (completedSchools.includes(examId)) return
    router.push(`/exam?school=${examId}&type=diagnostic&source=seed`)
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="#" onClick={e=>{e.preventDefault(); window.location.href = localStorage.getItem("userId") ? "/dashboard" : "/"}} className="text-sm text-gray-500 hover:text-gray-900 cursor-pointer">← Back</a>
          <span className="font-black text-gray-900">MyCET<span className="text-red-600">Reviewer</span></span>
          {typeof window !== "undefined" && !localStorage.getItem("userId") && <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-gray-900">Sign in</Link>}
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <div className="inline-block bg-red-50 border border-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full mb-4">
            Free · No signup required · 15–20 minutes
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">Which admission test are you reviewing for?</h1>
          <p className="text-sm text-gray-500">Your diagnostic will be tailored to that exam's exact format, sections, and question style.</p>
          <p className="text-xs text-red-600 font-semibold mt-1">Reviewing for more than one? Start here — skills carry over.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse"/>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EXAMS.map(exam => {
              const done = completedSchools.includes(exam.id)
              return (
                <button key={exam.id} onClick={() => handleSelect(exam.id)}
                  disabled={done}
                  type="button"
                  className={`relative border-2 rounded-2xl p-5 text-left transition-all ${
                    done
                      ? 'border-green-200 bg-green-50 cursor-not-allowed opacity-75'
                      : 'border-gray-200 hover:border-red-300 hover:shadow-md cursor-pointer'
                  }`}>
                  {done && (
                    <div className="absolute top-3 right-3 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      Done ✓
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{exam.emoji}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-base font-black text-gray-900">{exam.name}</div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${exam.cls}`}>{exam.badge}</span>
                      </div>
                      <div className="text-xs text-gray-500 mb-2">{exam.full}</div>
                      <div className="text-xs text-gray-400">{exam.sections}</div>
                      <div className="text-xs text-red-600 font-semibold mt-1">Full exam: {exam.time}</div>
                    </div>
                  </div>
                  {done ? (
                    <div className="mt-3 pt-3 border-t border-green-200 flex items-center justify-between">
                      <span className="text-xs text-green-700 font-semibold">Diagnostic completed</span>
                      <Link href="/training"
                        onClick={e => e.stopPropagation()}
                        className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 px-2.5 py-1 rounded-lg">
                        Train now →
                      </Link>
                    </div>
                  ) : (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-400">
                      Free · {({'upcat':20,'acet':15,'dcat':15,'ustet':12,'pupcet':10,'suc':10} as Record<string,number>)[exam.id]} questions · Takes {({'upcat':15,'acet':12,'dcat':12,'ustet':10,'pupcet':8,'suc':8} as Record<string,number>)[exam.id]} min
                    </span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}

        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-2xl p-5 text-center">
          <div className="text-sm font-bold text-gray-900 mb-1">Already have an account?</div>
          <div className="text-xs text-gray-500 mb-3">Sign in to save your results and track your progress.</div>
          <Link href="/login" className="inline-block border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors">
            Sign in →
          </Link>
        </div>
      </div>
    </div>
  )
}
