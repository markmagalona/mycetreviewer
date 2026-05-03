export const dynamic = 'force-dynamic'
// src/app/page.tsx — Landing page (updated)
// - "Which admission test are you reviewing for?" replaces "Choose your target school"
// - "Verified correct answers" replaces "Dual-model verified"  
// - UPCAT acceptance rate updated to 12%
// - Note for multi-exam students added

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'MyCETReviewer — Free College Entrance Exam Practice for Filipino Students',
  description: 'Practice for UPCAT, ACET, DCAT, USTET, PUPCET and State U CET. AI-generated questions, verified answers, personalized weak area training. Start free.',
}

const EXAMS = [
  { id:'upcat',  name:'UPCAT',       emoji:'🎓', label:'UP System Admission Test',        detail:'4 subtests · 3 hrs',   badge:'Most competitive', cls:'bg-red-100 text-red-700'     },
  { id:'acet',   name:'ACET',        emoji:'📘', label:'Ateneo Admission Test',            detail:'5 sections · 2.5 hrs', badge:'Very hard',        cls:'bg-blue-100 text-blue-700'   },
  { id:'dcat',   name:'DCAT',        emoji:'⚡', label:'De La Salle Admission Test',       detail:'4 areas · 2.5 hrs',   badge:'Very hard',        cls:'bg-green-100 text-green-700' },
  { id:'ustet',  name:'USTET',       emoji:'✝️', label:'UST Entrance Test',               detail:'5 areas · 2.5 hrs',   badge:'Hard',             cls:'bg-yellow-100 text-yellow-700'},
  { id:'pupcet', name:'PUPCET',      emoji:'🏛️', label:'PUP Admission Test',              detail:'4 areas · 2 hrs',     badge:'Moderate',         cls:'bg-purple-100 text-purple-700'},
  { id:'suc',    name:'State U CET', emoji:'🏫', label:'State Universities Entrance Test', detail:'PLM, BSU, MMSU + more',badge:'Moderate',         cls:'bg-orange-100 text-orange-700'},
]

const HOW_STEPS = [
  { icon:'🩺', title:'Diagnose your weak spots',      desc:'Free 20-question diagnostic mapped to your exam. Finds which topics are costing you points in 5 minutes.' },
  { icon:'💊', title:'Train only what you need',      desc:'Daily sessions drilling your weak topics. AI generates fresh questions every time — skip what you already know.' },
  { icon:'🏃', title:'Mock exam under real pressure', desc:'Full simulation with exact sections and timing. Nothing will surprise you on exam day.' },
  { icon:'📈', title:'Track your improvement',        desc:'Score history charts, XP, and rank progression. Know you are ready before exam day.' },
]

const FREE_FEATURES  = ['Diagnostic exam (all 6 admission tests)','10 AI practice questions per day','Leaderboard + Battle of Schools competition','Basic results + weak topic map']
const PAID_FEATURES  = ['Everything in Free','Unlimited AI practice questions','Full mock exams — all 6 tests','AI personalized 30-day study plan','Mistake review mode','Performance history + score tracking','Dark mode + custom themes','Spaced repetition training','Speed XP bonuses']

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <Link href="/" className="text-lg font-black">MyCET<span className="text-red-600">Reviewer</span></Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
            <a href="#exams" className="hover:text-gray-900 transition-colors">Admission Tests</a>
            <a href="#how" className="hover:text-gray-900 transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-full border border-gray-200 hover:border-gray-400 transition-all">Login</Link>
            <Link href="/diagnostic" className="text-sm font-bold text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full transition-colors">
              <span className="hidden sm:inline">Start free →</span>
              <span className="sm:hidden">Start</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-3 py-1.5 text-xs font-bold text-red-700 mb-5">
                Free practice for all major Philippine CETs
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-4">
                If you took your <span className="text-red-600">college entrance exam</span> today — would you pass?
              </h1>
              <p className="text-gray-500 text-base lg:text-lg leading-relaxed mb-6 max-w-lg">
                Take a free 2-minute diagnostic. Find your exact weak spots. Get an AI study plan specific to your target exam.
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Link href="/diagnostic" className="w-full sm:w-auto text-center bg-red-600 hover:bg-red-700 text-white font-black text-base px-8 py-4 rounded-2xl transition-colors">
                  Start Free Diagnostic →
                </Link>
                <p className="text-xs text-gray-400">No signup required · Takes 2–5 minutes</p>
              </div>
              {/* Mobile stats */}
              <div className="grid grid-cols-3 gap-3 mt-8 lg:hidden">
                {[{n:'6',l:'CETs covered'},{n:'3',l:'Exam modes'},{n:'₱500',l:'Full year'}].map(s=>(
                  <div key={s.l} className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                    <div className="text-lg font-black text-red-600">{s.n}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Desktop stats */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {[
                {n:'6',   l:'CETs covered',       sub:'UPCAT to State U CET'},
                {n:'✓',   l:'Verified answers',   sub:'Questions checked for accuracy'},
                {n:'3',   l:'Exam modes',          sub:'Diagnose · Train · Mock'},
                {n:'₱500',l:'Full year access',   sub:'One-time · Pay via GCash'},
              ].map(s=>(
                <div key={s.l} className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
                  <div className="text-3xl font-black text-red-600 mb-1">{s.n}</div>
                  <div className="text-sm font-bold text-gray-900">{s.l}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
                </div>
              ))}
              <div className="col-span-2 bg-red-50 border border-red-200 rounded-2xl p-4">
                <div className="text-xs font-bold text-red-700 mb-1.5">Did you know?</div>
                <p className="text-xs text-red-600 leading-relaxed">
                  Only <strong>~12%</strong> of UPCAT applicants get accepted into the UP System this year.
                  Most students study the <strong>wrong topics.</strong> MyCETReviewer shows you exactly what to fix.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ADMISSION TESTS */}
      <section id="exams" className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black mb-2">Which admission test are you reviewing for?</h2>
            <p className="text-sm text-gray-500">Reviewing for multiple exams? Pick one to start — you can switch anytime.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {EXAMS.map(exam=>(
              <Link key={exam.id} href={`/diagnostic?school=${exam.id}`}
                className="group border border-gray-200 hover:border-red-300 hover:bg-red-50 rounded-2xl p-4 transition-all text-center">
                <div className="text-2xl mb-2">{exam.emoji}</div>
                <div className="font-black text-sm text-gray-900 group-hover:text-red-700 mb-0.5">{exam.name}</div>
                <div className="text-xs text-gray-400 mt-0.5 leading-tight hidden sm:block mb-1.5">{exam.label}</div>
                <div className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block ${exam.cls}`}>{exam.badge}</div>
              </Link>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">
            Taking more than one? Skills transfer across all exams — start with the most competitive.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-gray-950 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">How MyCETReviewer works</h2>
            <p className="text-sm text-gray-400">A score improvement system — not just a quiz app</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HOW_STEPS.map((step,i)=>(
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="text-2xl mb-3">{step.icon}</div>
                <div className="font-bold text-sm text-white mb-2">{step.title}</div>
                <div className="text-xs text-gray-400 leading-relaxed">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black mb-2">Simple, honest pricing</h2>
            <p className="text-sm text-gray-500">Start free. Upgrade when you are ready.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
            <div className="border border-gray-200 rounded-3xl p-6 flex flex-col">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Free</div>
              <div className="text-4xl font-black text-gray-900 mb-0.5">₱0</div>
              <div className="text-xs text-gray-400 mb-5">forever</div>
              <ul className="space-y-2.5 mb-6 flex-1">
                {FREE_FEATURES.map(f=>(
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <span className="text-green-600 font-bold text-xs mt-0.5 flex-shrink-0">✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/diagnostic" className="block text-center border border-gray-300 hover:border-gray-500 text-gray-700 font-bold text-sm py-3 rounded-xl transition-colors">Start for free</Link>
            </div>
            <div className="border-2 border-red-600 rounded-3xl p-6 bg-red-50 relative flex flex-col">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">MOST POPULAR</div>
              <div className="text-xs font-bold text-red-600 uppercase tracking-wider mb-3 mt-1">Full Access</div>
              <div className="text-4xl font-black text-gray-900 mb-0.5">₱500</div>
              <div className="text-xs text-red-600 font-semibold mb-5">1 year · one-time · pay via GCash</div>
              <ul className="space-y-2.5 mb-6 flex-1">
                {PAID_FEATURES.map(f=>(
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <span className="text-green-600 font-bold text-xs mt-0.5 flex-shrink-0">✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/upgrade" className="block text-center bg-red-600 hover:bg-red-700 text-white font-black text-sm py-3.5 rounded-xl transition-colors">Get full access for ₱500</Link>
              <p className="text-center text-xs text-gray-500 mt-2">Less than one Jollibee family meal</p>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">₱500 vs ₱8,000–₱25,000 review centers · Pay once · All 6 admission tests included</p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Ready to find out if you will pass?</h2>
          <p className="text-gray-400 text-sm sm:text-base mb-8 max-w-lg mx-auto leading-relaxed">Take the free diagnostic now. No signup. No credit card. Find out exactly what you need to fix.</p>
          <Link href="/diagnostic" className="inline-block bg-red-600 hover:bg-red-700 text-white font-black text-base px-10 py-4 rounded-2xl transition-colors">Start Free Diagnostic →</Link>
          <p className="text-xs text-gray-600 mt-4">UPCAT · ACET · DCAT · USTET · PUPCET · State U CET</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-black text-sm text-gray-900 mb-1">MyCET<span className="text-red-600">Reviewer</span>.com</div>
              <p className="text-xs text-gray-400">Helping Filipino students pass their college entrance exams.</p>
            </div>
            <div className="flex items-center gap-5 text-xs text-gray-400">
              <Link href="/privacy" className="hover:text-gray-700">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gray-700">Terms of Use</Link>
              <Link href="/contact" className="hover:text-gray-700">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
