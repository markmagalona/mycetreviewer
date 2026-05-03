'use client'
// src/app/mock-section/page.tsx
// Handles one section of a mock exam
// Section timer (total time for section, not per question)
// No reveals during exam — just answer and move on
// After last question → section break or final results

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

type Question = {
  id: string; subject: string; topic: string; difficulty: 'easy'|'medium'|'hard'
  question: string; choices: string[]; correct: number; explanation: string
}
type Answer = {
  questionId: string; question: Question; chosen: number; isCorrect: boolean
  timeSeconds: number; xpEarned: number
}

// Seed questions bank
const SEED_QUESTIONS: Record<string, any[]> = {
  upcat: [
    { id:'u1',  subject:'Mathematics',          topic:'Algebra',            difficulty:'medium', question:'If 3(2x − 1) = 2(x + 5), what is x?',                                                                                choices:['x = 2','x = 13/4','x = 3','x = 4'],                                                                                                                  correct:1, explanation:'Expand: 6x − 3 = 2x + 10. Move terms: 4x = 13. Solve: x = 13/4.' },
    { id:'u2',  subject:'Mathematics',          topic:'Word Problems',      difficulty:'hard',   question:'A car travels from Manila to Batangas in 2 hours at 90 kph. Return trip at 60 kph. Average speed?',                  choices:['75 kph','72 kph','68 kph','80 kph'],                                                                                                                  correct:1, explanation:'Harmonic mean: 2 ÷ (1/90 + 1/60) = 72 kph.' },
    { id:'u3',  subject:'Mathematics',          topic:'Statistics',         difficulty:'hard',   question:'Mean of 5 numbers is 12. One removed, new mean is 14. What was removed?',                                           choices:['4','2','6','8'],                                                                                                                                      correct:0, explanation:'Sum=60. New sum=56. Removed=4.' },
    { id:'u4',  subject:'Mathematics',          topic:'Geometry',           difficulty:'medium', question:'A triangle has sides 5, 12, and 13. What is its area?',                                                             choices:['30 cm²','60 cm²','65 cm²','32.5 cm²'],                                                                                                               correct:0, explanation:'Right triangle. Area = ½ × 5 × 12 = 30 cm².' },
    { id:'u5',  subject:'Mathematics',          topic:'Patterns',           difficulty:'medium', question:'Next number: 2, 6, 12, 20, 30, ___',                                                                               choices:['42','40','36','44'],                                                                                                                                  correct:0, explanation:'Differences: 4,6,8,10,12. Next: 30+12=42.' },
    { id:'u6',  subject:'Language Proficiency', topic:'Grammar',            difficulty:'hard',   question:'Which sentence is CORRECT?',                                                                                        choices:['Neither the captain nor the players was ready.','Neither the captain nor the players were ready.','Neither the captain nor the players are not ready.','Neither the captain and the players were ready.'], correct:1, explanation:"With neither…nor, agree with nearest subject. 'Players' → 'were'." },
    { id:'u7',  subject:'Language Proficiency', topic:'Modifiers',          difficulty:'hard',   question:'Which sentence has a DANGLING MODIFIER?',                                                                           choices:['Having studied all night, the exam seemed easy to Maria.','After finishing her review, Maria found the exam easy.','Maria, who had studied all night, found the exam easy.','The exam was easy because Maria studied.'], correct:0, explanation:"'Having studied' should modify Maria, not 'the exam'." },
    { id:'u8',  subject:'Language Proficiency', topic:'Verb Tense',         difficulty:'hard',   question:"Complete: 'By the time she arrives, I _____ dinner.'",                                                              choices:['finished','will have finished','have finished','was finishing'],                                                                                      correct:1, explanation:"Future perfect: 'will have + past participle'." },
    { id:'u9',  subject:'Language Proficiency', topic:'Vocabulary',         difficulty:'hard',   question:"'The senator gave an equivocal response.' Equivocal means:",                                                       choices:['Definitive','Open to more than one interpretation','Hostile','Lengthy'],                                                                              correct:1, explanation:"Equivocal = deliberately unclear." },
    { id:'u10', subject:'Language Proficiency', topic:'Grammar',            difficulty:'medium', question:"Choose the correct sentence:",                                                                                      choices:['Each of the students have submitted their papers.','Each of the students has submitted their papers.','Each of the students have submitted his paper.','Each of the students submitted their papers.'],correct:1,explanation:"'Each' is singular → 'has'." },
    { id:'u11', subject:'Reading Comprehension',topic:'Inference',          difficulty:'hard',   question:"'Researchers who spent decades defending a theory fiercely opposed the young scientist.' What is inferred?",        choices:['They protected their reputation.','They had not read her paper.','They found errors in her method.','They were envious.'],                         correct:0, explanation:"'Decades defending' implies investment in their position." },
    { id:'u12', subject:'Reading Comprehension',topic:'Figurative Language', difficulty:'medium', question:"Victories described as 'hollow' suggests they were:",                                                              choices:['Dishonest','Empty of real meaning','Celebrated by few','Minor'],                                                                                      correct:1, explanation:"'Hollow' = no real substance." },
    { id:'u13', subject:'Reading Comprehension',topic:'Main Idea',          difficulty:'medium', question:"'The policy was met with cautious optimism.' The tone is:",                                                         choices:['Enthusiastically positive','Neutral to mildly positive','Critical','Ironic'],                                                                        correct:1, explanation:"'Cautious optimism' = qualified positivity." },
    { id:'u14', subject:'Reading Comprehension',topic:'Author Purpose',     difficulty:'hard',   question:"A passage states facts, cites studies, and draws conclusions. The author's purpose is to:",                        choices:['Entertain','Persuade','Inform','Describe'],                                                                                                           correct:2, explanation:"Facts + studies + conclusions = informative purpose." },
    { id:'u15', subject:'Reading Comprehension',topic:'Vocabulary in Context',difficulty:'medium',question:"'The arbitrator made an equitable decision.' Equitable most nearly means:",                                        choices:['Quick','Fair','Harsh','Final'],                                                                                                                       correct:1, explanation:"Equitable = fair and just." },
    { id:'u16', subject:'Science',              topic:'Cell Biology',        difficulty:'medium', question:'A cell has no membrane-bound nucleus. What type?',                                                                 choices:['Eukaryotic','Prokaryotic','Somatic','Gametic'],                                                                                                       correct:1, explanation:'Prokaryotic cells lack a membrane-bound nucleus.' },
    { id:'u17', subject:'Science',              topic:'Genetics',            difficulty:'medium', question:'In a Tt × Tt cross, fraction of homozygous recessive (tt) offspring?',                                            choices:['1/4','1/2','3/4','1/3'],                                                                                                                             correct:0, explanation:'Punnett square: tt = 1/4.' },
    { id:'u18', subject:'Science',              topic:'Physics',             difficulty:'easy',   question:'A 5 kg object is pushed with 20 N net force. Acceleration?',                                                      choices:['4 m/s²','100 m/s²','0.25 m/s²','2 m/s²'],                                                                                                           correct:0, explanation:"F=ma → a=20÷5=4 m/s²." },
    { id:'u19', subject:'Science',              topic:'Chemistry',           difficulty:'easy',   question:'Moles in 44g of CO₂? (C=12, O=16)',                                                                              choices:['1 mol','2 mol','0.5 mol','44 mol'],                                                                                                                  correct:0, explanation:'Molar mass=44. 44÷44=1 mol.' },
    { id:'u20', subject:'Science',              topic:'Ecology',             difficulty:'medium', question:'Food chain: grass→rabbit→fox→wolf. Wolves disappear, what happens FIRST?',                                        choices:['Grass increases','Fox population increases','Rabbit decreases','Grass decreases'],                                                                    correct:1, explanation:'Remove wolves → fox population rises first.' },
  ],
}
;['acet','dcat','ustet','pupcet','suc'].forEach(id => { SEED_QUESTIONS[id] = SEED_QUESTIONS.upcat })

const EXAM_NAMES: Record<string,string> = { upcat:'UPCAT', acet:'ACET', dcat:'DCAT', ustet:'USTET', pupcet:'PUPCET', suc:'State U CET' }

export default function MockSectionPage() {
  const params    = useSearchParams()
  const router    = useRouter()
  const school    = params.get('school') || 'upcat'
  const sessionId = params.get('sessionId') || ''
  const sectionIdx= parseInt(params.get('section') || '0')
  const sectionName = params.get('name') || 'Section'
  const totalSections = parseInt(params.get('total') || '4')
  const sectionMinutes = parseInt(params.get('minutes') || '45')
  const questionCount = parseInt(params.get('questions') || '20')

  const allSeed = (SEED_QUESTIONS[school] || SEED_QUESTIONS.upcat)
  const [questions] = useState<Question[]>(() => {
    // Each section gets a different slice of questions
    const shuffled = [...allSeed].sort(() => Math.random() - 0.5)
    const perSection = Math.ceil(shuffled.length / totalSections)
    const start = sectionIdx * perSection
    return shuffled.slice(start, start + Math.min(questionCount, perSection))
      .map(q => ({ ...q, correct: q.correct_index ?? q.correct ?? 0 }))
  })

  const [idx,       setIdx]       = useState(0)
  const [answers,   setAnswers]   = useState<Answer[]>([])
  const [chosen,    setChosen]    = useState<number|null>(null)
  const [revealed,  setRevealed]  = useState(false)
  const [sectionTimeLeft, setSectionTimeLeft] = useState(sectionMinutes * 60)
  const [done,      setDone]      = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null)
  const startRef = useRef(Date.now())

  const currentQ = questions[idx]
  const progress = Math.round(((idx + 1) / questions.length) * 100)

  // Section countdown timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSectionTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          finishSection()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current!)
  }, [])

  function handleSelect(i: number) {
    if (chosen !== null) return // already selected
    setChosen(i)
  }

  function handleNext() {
    if (chosen === null) return
    const t      = (Date.now() - startRef.current) / 1000
    const ok     = chosen === currentQ.correct
    const ans: Answer = {
      questionId: currentQ.id, question: currentQ, chosen,
      isCorrect: ok, timeSeconds: t, xpEarned: ok ? 20 : 0,
    }
    const newAnswers = [...answers, ans]
    setAnswers(newAnswers)
    setChosen(null)
    startRef.current = Date.now()

    if (idx >= questions.length - 1) {
      clearInterval(timerRef.current!)
      saveSectionAndContinue(newAnswers)
    } else {
      setIdx(prev => prev + 1)
    }
  }

  function saveSectionAndContinue(sectionAnswers: Answer[]) {
    // Get existing accumulated answers
    const existing = JSON.parse(sessionStorage.getItem('mockAllAnswers') || '[]')
    const allAnswers = [...existing, ...sectionAnswers]
    sessionStorage.setItem('mockAllAnswers', JSON.stringify(allAnswers))

    const isLastSection = sectionIdx >= totalSections - 1

    if (isLastSection) {
      // All sections done — go to full results
      const school_ = school
      const totalQ = allAnswers.length
      const totalXP = allAnswers.reduce((s: number, a: any) => s + (a.xpEarned || 0), 0)
      sessionStorage.setItem('examResults', JSON.stringify({
        school: school_, examType: 'mock',
        answers: allAnswers, examXP: totalXP,
        totalQuestions: totalQ, srCount: 0,
      }))
      router.push(`/results?school=${school_}&type=mock`)
    } else {
      // Go to section break screen
      router.push(`/mock-break?school=${school}&sessionId=${sessionId}&completedSection=${sectionIdx}&totalSections=${totalSections}&score=${sectionAnswers.filter(a => a.isCorrect).length}&total=${sectionAnswers.length}`)
    }
  }

  function finishSection() {
    // Time ran out — save whatever was answered and move on
    saveSectionAndContinue(answers)
  }

  const mins     = Math.floor(sectionTimeLeft / 60)
  const secs     = sectionTimeLeft % 60
  const timeStr  = `${mins}:${String(secs).padStart(2, '0')}`
  const isDanger = sectionTimeLeft <= 120 // last 2 minutes = red

  if (!currentQ) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading section...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="bg-gray-900 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
              {EXAM_NAMES[school]} Mock · Section {sectionIdx + 1} of {totalSections}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{sectionName}</div>
          </div>
          <div className={`text-lg font-black tabular-nums ${isDanger ? 'text-red-400' : 'text-white'}`}>
            {timeStr}
          </div>
        </div>
        {/* Progress */}
        <div className="h-1 bg-gray-800">
          <div className="h-1 bg-red-600 transition-all duration-300" style={{ width: `${progress}%` }}/>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Question meta */}
        <div className="flex items-center gap-2 mb-5">
          <span className="text-sm text-gray-400 font-semibold">
            Q{idx + 1} of {questions.length}
          </span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            currentQ.difficulty==='hard'   ? 'bg-red-100 text-red-700'    :
            currentQ.difficulty==='medium' ? 'bg-yellow-100 text-yellow-700' :
                                             'bg-green-100 text-green-700'
          }`}>{currentQ.difficulty}</span>
          <div className="ml-auto">
            <span className="bg-red-900 text-red-300 text-xs font-bold px-2 py-0.5 rounded-full">MOCK</span>
          </div>
        </div>

        {/* Question */}
        <div className="text-lg sm:text-xl font-bold text-gray-900 leading-relaxed mb-8">
          {currentQ.question}
        </div>

        {/* Choices — no correct/wrong colors */}
        <div className={`gap-3 mb-8 ${currentQ.choices.every(c => c.length < 35) ? 'grid grid-cols-1 sm:grid-cols-2' : 'flex flex-col'}`}>
          {currentQ.choices.map((choice, i) => {
            let cls  = 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
            let lCls = 'bg-gray-100 text-gray-600'
            if (chosen === i) { cls = 'border-blue-500 bg-blue-50'; lCls = 'bg-blue-600 text-white' }
            return (
              <button key={i} onClick={() => handleSelect(i)}
                disabled={chosen !== null}
                className={`flex items-start gap-3 border-2 rounded-xl p-4 text-left transition-all ${cls}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${lCls}`}>
                  {String.fromCharCode(65 + i)}
                </div>
                <div className="text-sm sm:text-base text-gray-800 leading-relaxed pt-0.5">{choice}</div>
              </button>
            )
          })}
        </div>

        {/* No explanation shown during mock */}
        {chosen !== null && (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 mb-6 text-center">
            <div className="text-xs text-gray-400">Answer recorded. Explanations shown after all sections are complete.</div>
          </div>
        )}

        {/* Next */}
        {chosen !== null ? (
          <button onClick={handleNext}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-2xl transition-colors text-base">
            {idx >= questions.length - 1 ? (sectionIdx >= totalSections - 1 ? 'See Full Results →' : 'Finish Section →') : 'Next Question →'}
          </button>
        ) : (
          <div className="w-full bg-gray-100 text-gray-400 font-bold py-4 rounded-2xl text-center cursor-not-allowed">
            Select an answer above
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mt-3">
          No explanations during mock exam · Stay focused
        </p>
      </div>
    </div>
  )
}
