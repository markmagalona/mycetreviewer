export const dynamic = 'force-dynamic'
// src/app/diagnostic/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Free Diagnostic Exam — MyCETReviewer',
  description: 'Free 20-question diagnostic for UPCAT, ACET, DCAT, USTET, PUPCET or State U CET. Find your weak spots in minutes.',
}

const EXAMS = [
  { id:'upcat',  name:'UPCAT',       emoji:'🎓', full:'UP System Admission Test',          sections:'Language · Reading · Math · Science',             time:'3 hrs',   badge:'Most competitive', cls:'bg-red-100 text-red-700'     },
  { id:'acet',   name:'ACET',        emoji:'📘', full:'Ateneo Admission Test',              sections:'English · Math · Abstract · Vocab · Reading',     time:'2.5 hrs', badge:'Very hard',        cls:'bg-blue-100 text-blue-700'   },
  { id:'dcat',   name:'DCAT',        emoji:'⚡', full:'De La Salle Admission Test',         sections:'Language · Quantitative · Inductive · Science',   time:'2.5 hrs', badge:'Very hard',        cls:'bg-green-100 text-green-700' },
  { id:'ustet',  name:'USTET',       emoji:'✝️', full:'UST Entrance Test',                 sections:'Language · Reading · Reasoning · Science · Math', time:'2.5 hrs', badge:'Hard',             cls:'bg-yellow-100 text-yellow-700'},
  { id:'pupcet', name:'PUPCET',      emoji:'🏛️', full:'PUP Admission Test',                sections:'Verbal · Analytical · Math · Science',            time:'2 hrs',   badge:'Moderate',         cls:'bg-purple-100 text-purple-700'},
  { id:'suc',    name:'State U CET', emoji:'🏫', full:'State Universities Entrance Test',  sections:'Verbal · Reasoning · Science · Abstract',         time:'2 hrs',   badge:'Moderate',         cls:'bg-orange-100 text-orange-700'},
]

export default function DiagnosticPage({ searchParams }: { searchParams: { school?: string } }) {
  const preselected = searchParams.school || ''
  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-black text-gray-900">MyCET<span className="text-red-600">Reviewer</span></Link>
          <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900">Sign in</Link>
        </div>
      </nav>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-3 py-1.5 text-xs font-bold text-red-700 mb-4">
            Free · No signup required · 15–20 minutes
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">
            Which admission test are you reviewing for?
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Your diagnostic will be tailored to that exam's exact format, sections, and question style.
            <br className="hidden sm:block" />
            <span className="text-red-600 font-semibold"> Reviewing for more than one? Start here — skills carry over.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {EXAMS.map((exam) => (
            <Link key={exam.id} href={`/exam?school=${exam.id}&type=diagnostic`}
              className={`group border rounded-2xl p-5 transition-all text-left hover:border-red-300 hover:bg-red-50 hover:shadow-sm ${preselected === exam.id ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="text-2xl">{exam.emoji}</div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${exam.cls}`}>{exam.badge}</span>
              </div>
              <div className="font-black text-base text-gray-900 group-hover:text-red-700 mb-0.5">{exam.name}</div>
              <div className="text-xs text-gray-400 mb-2">{exam.full}</div>
              <div className="text-xs text-gray-500 leading-relaxed">{exam.sections}</div>
              <div className="text-xs text-red-600 font-semibold mt-2">Full exam: {exam.time}</div>
            </Link>
          ))}
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
          <h3 className="font-bold text-sm text-gray-900 mb-3">What you get after the diagnostic</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {icon:'📊', text:'Your overall readiness score and percentile estimate'},
              {icon:'🎯', text:'Your 3 weakest topics — the ones costing you the most points'},
              {icon:'🤖', text:'AI coach feedback in Taglish about what to fix first'},
              {icon:'📈', text:'Personalized training plan targeting your weak areas'},
            ].map((item,i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
                <span className="text-xs text-gray-600 leading-relaxed">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
