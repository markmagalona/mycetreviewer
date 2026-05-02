'use client'
// src/app/exam/page.tsx — v4
// Fixes:
// 1. AI questions use correct_index, seed questions use correct — unified to correct_index
// 2. Timer NaN — AI questions may not have difficulty, default to medium
// 3. Mock mode — no per-question reveals, section timer only
// 4. SR only for training

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

// Normalize question — handles both correct and correct_index fields
function normalizeQuestion(q: any): Question {
  return {
    ...q,
    correct:    q.correct_index ?? q.correct ?? 0,
    difficulty: q.difficulty || 'medium',
    subject:    q.subject || 'General',
    topic:      q.topic || 'General',
  }
}

const SEED_QUESTIONS: Record<string, any[]> = {
  upcat: [
    { id:'u1',  subject:'Mathematics',          topic:'Algebra',            difficulty:'medium', question:'If 3(2x − 1) = 2(x + 5), what is x?',                                                                                                                                      choices:['x = 2','x = 13/4','x = 3','x = 4'],                                                                                                                  correct:1, explanation:'Expand: 6x − 3 = 2x + 10. Move terms: 4x = 13. Solve: x = 13/4. Always distribute before moving terms across the equation.' },
    { id:'u2',  subject:'Mathematics',          topic:'Word Problems',      difficulty:'hard',   question:'A car travels from Manila to Batangas in 2 hours at 90 kph. The return trip is at 60 kph. What is the average speed for the entire trip?',                                 choices:['75 kph','72 kph','68 kph','80 kph'],                                                                                                                  correct:1, explanation:'Use harmonic mean for equal distances: 2 ÷ (1/90 + 1/60) = 72 kph. Never average speeds directly.' },
    { id:'u3',  subject:'Mathematics',          topic:'Statistics',         difficulty:'hard',   question:'The mean of 5 numbers is 12. One number is removed and the new mean becomes 14. What was the removed number?',                                                              choices:['4','2','6','8'],                                                                                                                                      correct:0, explanation:'Sum of 5 = 60. New sum of 4 = 56. Removed = 60 − 56 = 4.' },
    { id:'u4',  subject:'Mathematics',          topic:'Number Theory',      difficulty:'hard',   question:'What is the remainder when 7⁵³ is divided by 6?',                                                                                                                          choices:['1','5','3','7'],                                                                                                                                      correct:0, explanation:'7 ≡ 1 (mod 6), so 7⁵³ ≡ 1.' },
    { id:'u5',  subject:'Mathematics',          topic:'Geometry',           difficulty:'medium', question:'A triangle has sides 5, 12, and 13. What is its area?',                                                                                                                    choices:['30 cm²','60 cm²','65 cm²','32.5 cm²'],                                                                                                               correct:0, explanation:'5² + 12² = 13² ✓ — right triangle. Area = ½ × 5 × 12 = 30 cm².' },
    { id:'u6',  subject:'Language Proficiency', topic:'Grammar',            difficulty:'hard',   question:'Which sentence is CORRECT?',                                                                                                                                               choices:['Neither the captain nor the players was ready.','Neither the captain nor the players were ready.','Neither the captain nor the players are not ready.','Neither the captain and the players were ready.'], correct:1, explanation:"With neither…nor, agree with the nearest subject. 'Players' is plural → 'were'." },
    { id:'u7',  subject:'Language Proficiency', topic:'Modifiers',          difficulty:'hard',   question:'Which sentence contains a DANGLING MODIFIER?',                                                                                                                             choices:['Having studied all night, the exam seemed easy to Maria.','After finishing her review, Maria found the exam easy.','Maria, who had studied all night, found the exam easy.','The exam was easy because Maria had studied all night.'], correct:0, explanation:"'Having studied all night' should modify Maria, not 'the exam'." },
    { id:'u8',  subject:'Language Proficiency', topic:'Verb Tense',         difficulty:'hard',   question:"Complete: 'By the time she arrives, I _____ dinner.'",                                                                                                                     choices:['finished','will have finished','have finished','was finishing'],                                                                                      correct:1, explanation:"Future perfect: 'By the time' + present = future perfect ('will have + past participle')." },
    { id:'u9',  subject:'Reading Comprehension',topic:'Inference',          difficulty:'hard',   question:"'Researchers who spent decades defending a competing theory fiercely opposed the young scientist.' What can be inferred?",                                                  choices:['They were motivated by protecting their own reputation.','They had not read her research paper.','They found specific errors in her methodology.','They were envious of her credentials.'], correct:0, explanation:"'Decades defending' implies personal investment in their reputation." },
    { id:'u10', subject:'Reading Comprehension',topic:'Figurative Language', difficulty:'medium', question:"An author describes victories as 'hollow.' This suggests they were:",                                                                                                      choices:['Achieved dishonestly','Empty of real meaning or lasting value','Celebrated by few','Too minor to matter'],                                           correct:1, explanation:"'Hollow' = empty inside — no real substance." },
    { id:'u11', subject:'Science',              topic:'Cell Biology',        difficulty:'medium', question:'A cell has no membrane-bound nucleus. What type is it?',                                                                                                                  choices:['Eukaryotic','Prokaryotic','Somatic','Gametic'],                                                                                                       correct:1, explanation:'Prokaryotic cells lack a membrane-bound nucleus.' },
    { id:'u12', subject:'Science',              topic:'Genetics',            difficulty:'medium', question:'In a Tt × Tt cross, what fraction of offspring will be homozygous recessive (tt)?',                                                                                       choices:['1/4','1/2','3/4','1/3'],                                                                                                                             correct:0, explanation:'Punnett square: TT:Tt:tt = 1:2:1. Homozygous recessive = 1/4.' },
    { id:'u13', subject:'Science',              topic:'Physics',             difficulty:'easy',   question:'A 5 kg object is pushed with 20 N net force. What is its acceleration?',                                                                                                  choices:['4 m/s²','100 m/s²','0.25 m/s²','2 m/s²'],                                                                                                           correct:0, explanation:"F = ma → a = 20 ÷ 5 = 4 m/s²." },
    { id:'u14', subject:'Science',              topic:'Chemistry',           difficulty:'easy',   question:'How many moles are in 44 g of CO₂? (C=12, O=16)',                                                                                                                        choices:['1 mol','2 mol','0.5 mol','44 mol'],                                                                                                                  correct:0, explanation:'Molar mass CO₂ = 44 g/mol. Moles = 44 ÷ 44 = 1 mol.' },
    { id:'u15', subject:'Science',              topic:'Ecology',             difficulty:'medium', question:'Food chain: grass → rabbit → fox → wolf. If wolves disappear, what happens FIRST?',                                                                                       choices:['Grass increases','Fox population increases','Rabbit decreases','Grass decreases'],                                                                    correct:1, explanation:'Removing wolves → fox population rises first. Trophic cascade.' },
    { id:'u16', subject:'Mathematics',          topic:'Patterns',            difficulty:'medium', question:'Next number: 2, 6, 12, 20, 30, ___',                                                                                                                                     choices:['42','40','36','44'],                                                                                                                                  correct:0, explanation:'Differences: 4,6,8,10,12. Next: 30 + 12 = 42.' },
    { id:'u17', subject:'Language Proficiency', topic:'Vocabulary',          difficulty:'hard',   question:"'The senator gave an equivocal response.' Equivocal means:",                                                                                                              choices:['Definitive','Open to more than one interpretation','Hostile','Lengthy'],                                                                              correct:1, explanation:"Equivocal = deliberately unclear." },
    { id:'u18', subject:'Science',              topic:'Scientific Method',   difficulty:'easy',   question:"In a plant growth experiment, 'amount of light per day' is the:",                                                                                                         choices:['Dependent variable','Independent variable','Controlled variable','Hypothesis'],                                                                       correct:1, explanation:'Independent variable = what the experimenter deliberately changes.' },
    { id:'u19', subject:'Mathematics',          topic:'Algebra',             difficulty:'hard',   question:'What is the product of the roots of 2x² − 5x + 3 = 0?',                                                                                                                 choices:['3/2','5/2','−3/2','5'],                                                                                                                              correct:0, explanation:"Vieta's formula: product = c/a = 3/2." },
    { id:'u20', subject:'Reading Comprehension',topic:'Tone',                difficulty:'medium', question:"'Industry leaders greeted the policy with cautious optimism.' The tone is:",                                                                                              choices:['Enthusiastically positive','Neutral to mildly positive','Critical','Ironic'],                                                                        correct:1, explanation:"'Cautious optimism' = qualified, measured positivity." },
  ],
}
;['acet','dcat','ustet','pupcet','suc'].forEach(id => { SEED_QUESTIONS[id] = SEED_QUESTIONS.upcat })

type Question = {
  id: string; subject: string; topic: string; difficulty: 'easy'|'medium'|'hard'
  question: string; choices: string[]; correct: number; explanation: string
}
type Answer = {
  questionId: string; question: Question; chosen: number; isCorrect: boolean
  timeSeconds: number; wasSpacedRepetition: boolean; xpEarned: number
}

const XP          = { easy: 10, medium: 20, hard: 30 }
const SPEED_BONUS = 5
const SPEED_THRESH= 15
const TIMER       = { easy: 30, medium: 45, hard: 60 }
const EXAM_NAMES: Record<string,string> = { upcat:'UPCAT', acet:'ACET', dcat:'DCAT', ustet:'USTET', pupcet:'PUPCET', suc:'State U CET' }

function getCorrectMsg(difficulty: string, time: number, xp: number): string {
  const fast = time < SPEED_THRESH
  if (difficulty === 'hard' && fast) return `Difficult question answered quickly! +${xp} XP ⚡`
  if (difficulty === 'hard')         return `Correct! That was a tough one. +${xp} XP 💪`
  if (fast)                          return `Fast and correct! +${xp} XP ⚡`
  const msgs = [`Correct! +${xp} XP`, `Well done! +${xp} XP`, `Right answer! +${xp} XP`, `Spot on! +${xp} XP`]
  return msgs[Math.floor(Math.random() * msgs.length)]
}

function getWrongMsg(difficulty: string, time: number): string {
  if (time < 5)              return `Too fast — read the full question before answering.`
  if (difficulty === 'hard') return `Incorrect, but this was a hard question. Study the explanation.`
  return `Incorrect. The explanation will help you understand why.`
}

export default function ExamPage() {
  const params    = useSearchParams()
  const router    = useRouter()
  const school    = params.get('school') || 'upcat'
  const examType  = (params.get('type') || 'diagnostic') as 'diagnostic'|'mock'|'training'
  const source    = params.get('source') || 'seed'
  const sessionId = params.get('sessionId') || ''

  const useSR  = examType === 'training'
  const isMock = examType === 'mock'

  const [queue,    setQueue]   = useState<Question[]>([])
  const [srQueue,  setSrQueue] = useState<Question[]>([])
  const [loaded,   setLoaded]  = useState(false)
  const [idx,      setIdx]     = useState(0)
  const [answers,  setAnswers] = useState<Answer[]>([])
  const [chosen,   setChosen]  = useState<number|null>(null)
  const [revealed, setRevealed]= useState(false)
  const [timeLeft, setTimeLeft]= useState(45)
  const [examXP,   setExamXP]  = useState(0)
  const [toast,    setToast]   = useState('')
  const [toastOn,  setToastOn] = useState(false)
  const [saving,   setSaving]  = useState(false)
  const [rankUp,   setRankUp]  = useState('')
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null)
  const startRef = useRef(Date.now())

  // Load questions on mount
  useEffect(() => {
    if (source === 'ai') {
      const raw = sessionStorage.getItem('trainingQuestions')
      if (raw) {
        const data = JSON.parse(raw)
        // Normalize AI questions — they use correct_index not correct
        const normalized = (data.questions || []).map(normalizeQuestion)
        setQueue(normalized)
      } else {
        const seed = (SEED_QUESTIONS[school] || SEED_QUESTIONS.upcat).map(normalizeQuestion)
        setQueue([...seed].sort(() => Math.random() - 0.5).slice(0, 5))
      }
    } else {
      const seed = (SEED_QUESTIONS[school] || SEED_QUESTIONS.upcat).map(normalizeQuestion)
      setQueue([...seed].sort(() => Math.random() - 0.5).slice(0, isMock ? seed.length : 20))
    }
    setLoaded(true)
  }, [school, source, isMock])

  const fullQueue = useSR ? [...queue, ...srQueue] : queue
  const currentQ  = fullQueue[idx]
  const isSR      = useSR && idx >= queue.length
  const progress  = queue.length > 0 ? Math.round(((idx + 1) / queue.length) * 100) : 0

  useEffect(() => {
    if (!currentQ || revealed || !loaded || isMock) return
    const lim = TIMER[currentQ.difficulty] || 45  // default 45 if difficulty missing
    setTimeLeft(lim)
    startRef.current = Date.now()
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); handleAnswer(-1); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current!)
  }, [idx, currentQ, loaded, isMock])

  const showToast = useCallback((msg: string) => {
    setToast(msg); setToastOn(true)
    setTimeout(() => setToastOn(false), 2500)
  }, [])

  const handleAnswer = useCallback((chosenIdx: number) => {
    if (revealed) return
    clearInterval(timerRef.current!)
    setChosen(chosenIdx); setRevealed(true)
    const t     = (Date.now() - startRef.current) / 1000
    const ok    = chosenIdx === currentQ.correct
    const sb    = ok && t < SPEED_THRESH ? SPEED_BONUS : 0
    const xp    = ok ? XP[currentQ.difficulty] + sb : 0
    setExamXP(prev => prev + xp)
    const ans: Answer = {
      questionId: currentQ.id, question: currentQ, chosen: chosenIdx,
      isCorrect: ok, timeSeconds: t, wasSpacedRepetition: isSR, xpEarned: xp,
    }
    setAnswers(prev => [...prev, ans])
    if (useSR && !ok && !isSR) setSrQueue(prev => [...prev, currentQ])
    // No toast during mock exam
    if (!isMock) showToast(ok ? getCorrectMsg(currentQ.difficulty, t, xp) : getWrongMsg(currentQ.difficulty, t))
  }, [revealed, currentQ, isSR, useSR, isMock, showToast])

  const handleNext = useCallback(async () => {
    if (!revealed) return
    const next = idx + 1
    if (next >= fullQueue.length) {
      setSaving(true)
      const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId') || ''
      const finalAnswers = [...answers]
      if (userId) {
        try {
          const res = await fetch('/api/exam/save', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId, school, examType, sessionId,
              answers: finalAnswers, examXP,
              totalQuestions: queue.length, srCount: srQueue.length,
            }),
          })
          const data = await res.json()
          if (data.rankUp && data.newRank) setRankUp(data.newRank)
        } catch { /* silently fail */ }
      }
      sessionStorage.setItem('examResults', JSON.stringify({
        school, examType, answers: finalAnswers,
        examXP, totalQuestions: queue.length, srCount: srQueue.length,
      }))
      setSaving(false)
      router.push(`/results?school=${school}&type=${examType}`)
    } else {
      setIdx(next); setChosen(null); setRevealed(false)
    }
  }, [revealed, idx, fullQueue, answers, examXP, queue, srQueue, school, examType, sessionId, router])

  if (!loaded || !currentQ) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading questions...</div>
    </div>
  )

  const lim      = TIMER[currentQ.difficulty] || 45
  const timerPct = (timeLeft / lim) * 100
  const isDanger = timeLeft <= 10

  return (
    <div className="min-h-screen bg-white">
      {/* Toast */}
      <div className={`fixed top-0 inset-x-0 z-50 bg-gray-900 text-white text-center py-2.5 px-4 text-sm font-bold border-b-2 border-yellow-400 transition-transform duration-300 ${toastOn ? 'translate-y-0' : '-translate-y-full'}`}>
        {toast}
      </div>

      {/* Rank up modal */}
      {rankUp && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl">
            <div className="text-4xl mb-3">🎉</div>
            <div className="text-xl font-black text-gray-900 mb-1">Rank Up!</div>
            <div className="text-red-600 font-bold text-lg mb-4">{rankUp}</div>
            <button onClick={() => setRankUp('')}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-xl transition-colors">
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="bg-gray-900 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
              {EXAM_NAMES[school]} · {examType.charAt(0).toUpperCase() + examType.slice(1)} · {currentQ.subject}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">+{examXP} XP this session</div>
          </div>
          <div className="flex items-center gap-3">
            {isSR && <div className="bg-yellow-900 text-yellow-300 text-xs font-bold px-2 py-0.5 rounded-full">↩ Review</div>}
            {isMock && <div className="bg-red-900 text-red-300 text-xs font-bold px-2 py-0.5 rounded-full">MOCK</div>}
            {/* Only show timer for non-mock */}
            {!isMock && <div className={`text-lg font-black ${isDanger ? 'text-red-400' : 'text-white'}`}>{timeLeft}s</div>}
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-800">
          <div className="h-1 bg-red-600 transition-all duration-300" style={{ width: `${progress}%` }}/>
        </div>
        {/* Timer bar — only for non-mock */}
        {!isMock && (
          <div className="h-1.5 bg-gray-700">
            <div className={`h-1.5 transition-all duration-1000 ${isDanger ? 'bg-red-500' : 'bg-yellow-400'}`} style={{ width: `${timerPct}%` }}/>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Question meta */}
        <div className="flex items-center gap-2 mb-5">
          <span className="text-sm text-gray-400 font-semibold">
            Q{idx + 1} of {queue.length}{useSR && srQueue.length > 0 ? ` · ${srQueue.length} review` : ''}
          </span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            currentQ.difficulty === 'hard'   ? 'bg-red-100 text-red-700' :
            currentQ.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                               'bg-green-100 text-green-700'
          }`}>{currentQ.difficulty}</span>
          {!isMock && <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{currentQ.topic}</span>}
        </div>

        {/* Question text */}
        <div className="text-lg sm:text-xl font-bold text-gray-900 leading-relaxed mb-8">
          {currentQ.question}
        </div>

        {/* Answer choices */}
        <div className={`gap-3 mb-8 ${currentQ.choices.every(c => c.length < 35) ? 'grid grid-cols-1 sm:grid-cols-2' : 'flex flex-col'}`}>
          {currentQ.choices.map((choice, i) => {
            let cls  = 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
            let lCls = 'bg-gray-100 text-gray-600'
            if (revealed && !isMock) {
              // Show correct/wrong colors for non-mock
              if (i === currentQ.correct)                         { cls = 'border-green-500 bg-green-50'; lCls = 'bg-green-600 text-white' }
              else if (i === chosen && chosen !== currentQ.correct){ cls = 'border-red-500 bg-red-50';   lCls = 'bg-red-600 text-white'   }
              else                                                 { cls = 'border-gray-100 bg-gray-50 opacity-50 cursor-default' }
            } else if (revealed && isMock) {
              // Mock — just show selected, no correct/wrong colors
              if (i === chosen) { cls = 'border-blue-500 bg-blue-50'; lCls = 'bg-blue-600 text-white' }
              else              { cls = 'border-gray-100 bg-gray-50 cursor-default' }
            } else if (chosen === i) {
              cls = 'border-blue-500 bg-blue-50'; lCls = 'bg-blue-600 text-white'
            }
            return (
              <button key={i} onClick={() => handleAnswer(i)} disabled={revealed}
                className={`flex items-start gap-3 border-2 rounded-xl p-4 text-left transition-all ${cls}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${lCls}`}>
                  {String.fromCharCode(65 + i)}
                </div>
                <div className="text-sm sm:text-base text-gray-800 leading-relaxed pt-0.5">{choice}</div>
              </button>
            )
          })}
        </div>

        {/* Explanation — only for non-mock */}
        {revealed && !isMock && (
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-2xl p-5 mb-6">
            <div className="text-xs font-bold text-blue-700 mb-2 uppercase tracking-wide">Explanation</div>
            <div className="text-sm sm:text-base text-blue-800 leading-relaxed">{currentQ.explanation}</div>
            {answers[answers.length - 1]?.xpEarned > 0 && (
              <div className="mt-2 text-sm font-bold text-green-700">
                +{answers[answers.length - 1].xpEarned} XP
                {answers[answers.length - 1].xpEarned > XP[currentQ.difficulty] && ' · speed bonus ⚡'}
              </div>
            )}
          </div>
        )}

        {/* Mock mode — no explanation, just note */}
        {revealed && isMock && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-6 text-center">
            <div className="text-xs text-gray-500">Answers and explanations shown after all sections are complete.</div>
          </div>
        )}

        {/* Next button */}
        {revealed ? (
          <button onClick={handleNext} disabled={saving}
            className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition-colors text-base">
            {saving ? 'Saving...' : idx >= fullQueue.length - 1 ? 'See My Results →' : 'Next Question →'}
          </button>
        ) : (
          <div className="w-full bg-gray-100 text-gray-400 font-bold py-4 rounded-2xl text-center cursor-not-allowed">
            Select an answer above
          </div>
        )}
      </div>
    </div>
  )
}
