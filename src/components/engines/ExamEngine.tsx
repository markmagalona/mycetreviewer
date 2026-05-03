'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function normalizeQuestion(q: any) {
  return {
    ...q,
    correct: q.correct_index ?? q.correct ?? 0,
    difficulty: q.difficulty || 'medium',
    subject: q.subject || 'General',
    topic: q.topic || 'General',
  }
}

const SEED: any[] = [
  { id:'u1', subject:'Mathematics', topic:'Algebra', difficulty:'medium', question:'If 3(2x − 1) = 2(x + 5), what is x?', choices:['x = 2','x = 13/4','x = 3','x = 4'], correct:1, explanation:'Expand: 6x − 3 = 2x + 10. Solve: 4x = 13, x = 13/4.' },
  { id:'u2', subject:'Mathematics', topic:'Statistics', difficulty:'hard', question:'The mean of 5 numbers is 12. One removed, new mean is 14. What was removed?', choices:['4','2','6','8'], correct:0, explanation:'Sum=60. New sum=56. Removed=4.' },
  { id:'u3', subject:'Language Proficiency', topic:'Grammar', difficulty:'hard', question:'Which sentence is CORRECT?', choices:['Neither the captain nor the players was ready.','Neither the captain nor the players were ready.','Neither the captain nor the players are not ready.','Neither and the players were ready.'], correct:1, explanation:"With neither…nor, agree with nearest subject. 'Players' → 'were'." },
  { id:'u4', subject:'Reading Comprehension', topic:'Inference', difficulty:'hard', question:"'Researchers who spent decades defending a theory fiercely opposed the young scientist.' What is inferred?", choices:['They protected their reputation.','They had not read her paper.','They found errors in her method.','They were envious.'], correct:0, explanation:"'Decades defending' implies investment in their position." },
  { id:'u5', subject:'Science', topic:'Cell Biology', difficulty:'medium', question:'A cell has no membrane-bound nucleus. What type?', choices:['Eukaryotic','Prokaryotic','Somatic','Gametic'], correct:1, explanation:'Prokaryotic cells lack a membrane-bound nucleus.' },
  { id:'u6', subject:'Science', topic:'Physics', difficulty:'easy', question:'A 5 kg object is pushed with 20 N net force. Acceleration?', choices:['4 m/s²','100 m/s²','0.25 m/s²','2 m/s²'], correct:0, explanation:'F=ma → a=20÷5=4 m/s².' },
  { id:'u7', subject:'Mathematics', topic:'Geometry', difficulty:'medium', question:'A triangle has sides 5, 12, and 13. What is its area?', choices:['30 cm²','60 cm²','65 cm²','32.5 cm²'], correct:0, explanation:'Right triangle. Area = ½ × 5 × 12 = 30 cm².' },
  { id:'u8', subject:'Language Proficiency', topic:'Vocabulary', difficulty:'hard', question:"'The senator gave an equivocal response.' Equivocal means:", choices:['Definitive','Open to more than one interpretation','Hostile','Lengthy'], correct:1, explanation:'Equivocal = deliberately unclear.' },
  { id:'u9', subject:'Science', topic:'Genetics', difficulty:'medium', question:'In a Tt × Tt cross, fraction of homozygous recessive (tt)?', choices:['1/4','1/2','3/4','1/3'], correct:0, explanation:'Punnett square: tt = 1/4.' },
  { id:'u10', subject:'Reading Comprehension', topic:'Tone', difficulty:'medium', question:"'Industry leaders greeted the policy with cautious optimism.' Tone is:", choices:['Enthusiastically positive','Neutral to mildly positive','Critical','Ironic'], correct:1, explanation:"'Cautious optimism' = qualified positivity." },
  { id:'u11', subject:'Mathematics', topic:'Patterns', difficulty:'medium', question:'Next: 2, 6, 12, 20, 30, ___', choices:['42','40','36','44'], correct:0, explanation:'Differences: 4,6,8,10,12. Next: 30+12=42.' },
  { id:'u12', subject:'Science', topic:'Chemistry', difficulty:'easy', question:'Moles in 44g of CO₂? (C=12, O=16)', choices:['1 mol','2 mol','0.5 mol','44 mol'], correct:0, explanation:'Molar mass=44. 44÷44=1 mol.' },
  { id:'u13', subject:'Language Proficiency', topic:'Verb Tense', difficulty:'hard', question:"Complete: 'By the time she arrives, I _____ dinner.'", choices:['finished','will have finished','have finished','was finishing'], correct:1, explanation:"Future perfect: 'will have + past participle'." },
  { id:'u14', subject:'Science', topic:'Ecology', difficulty:'medium', question:'Food chain: grass→rabbit→fox→wolf. Wolves disappear, what happens FIRST?', choices:['Grass increases','Fox population increases','Rabbit decreases','Grass decreases'], correct:1, explanation:'Remove wolves → fox population rises first.' },
  { id:'u15', subject:'Mathematics', topic:'Word Problems', difficulty:'hard', question:'A car goes Manila→Batangas in 2hrs at 90kph. Return at 60kph. Average speed?', choices:['75 kph','72 kph','68 kph','80 kph'], correct:1, explanation:'Harmonic mean: 2÷(1/90+1/60)=72 kph.' },
  { id:'u16', subject:'Reading Comprehension', topic:'Figurative Language', difficulty:'medium', question:"Victories described as 'hollow' suggests:", choices:['Dishonest','Empty of real meaning','Few celebrated','Minor'], correct:1, explanation:"'Hollow' = no real substance." },
  { id:'u17', subject:'Science', topic:'Scientific Method', difficulty:'easy', question:"In a plant growth experiment, 'amount of light per day' is:", choices:['Dependent variable','Independent variable','Controlled variable','Hypothesis'], correct:1, explanation:'Independent variable = what experimenter changes.' },
  { id:'u18', subject:'Mathematics', topic:'Algebra', difficulty:'hard', question:'Product of roots of 2x² − 5x + 3 = 0?', choices:['3/2','5/2','−3/2','5'], correct:0, explanation:"Vieta's: product = c/a = 3/2." },
  { id:'u19', subject:'Language Proficiency', topic:'Modifiers', difficulty:'hard', question:'Which has a DANGLING MODIFIER?', choices:['Having studied all night, the exam seemed easy to Maria.','After finishing her review, Maria found the exam easy.','Maria, who studied, found the exam easy.','The exam was easy because Maria studied.'], correct:0, explanation:"'Having studied' should modify Maria, not 'the exam'." },
  { id:'u20', subject:'Science', topic:'Physics — Newton', difficulty:'medium', question:'Newton\'s 3rd Law: when you push a wall, the wall:', choices:['Does nothing','Pushes back with equal force','Pushes back with less force','Absorbs the force'], correct:1, explanation:'Every action has an equal and opposite reaction.' },
]

const XP: Record<string,number> = { easy:10, medium:20, hard:30 }
const TIMER: Record<string,number> = { easy:30, medium:45, hard:60 }
const EXAM_NAMES: Record<string,string> = { upcat:'UPCAT', acet:'ACET', dcat:'DCAT', ustet:'USTET', pupcet:'PUPCET', suc:'State U CET' }

export default function ExamEngine() {
  const params    = useSearchParams()
  const router    = useRouter()
  const school    = params.get('school') || 'upcat'
  const examType  = (params.get('type') || 'diagnostic') as 'diagnostic'|'mock'|'training'
  const source    = params.get('source') || 'seed'
  const sessionId = params.get('sessionId') || ''
  const isMock    = examType === 'mock'

  const [queue,    setQueue]    = useState<any[]>([])
  const [loaded,   setLoaded]   = useState(false)
  const [idx,      setIdx]      = useState(0)
  const [answers,  setAnswers]  = useState<any[]>([])
  const [chosen,   setChosen]   = useState<number|null>(null)
  const [revealed, setRevealed] = useState(false)
  const [timeLeft, setTimeLeft] = useState(45)
  const [examXP,   setExamXP]   = useState(0)
  const [saving,   setSaving]   = useState(false)
  const [toast,    setToast]    = useState('')
  const [toastOn,  setToastOn]  = useState(false)
  const timerRef = useRef<any>(null)
  const startRef = useRef(Date.now())

  useEffect(() => {
    if (source === 'ai') {
      const raw = sessionStorage.getItem('trainingQuestions')
      if (raw) {
        const data = JSON.parse(raw)
        setQueue((data.questions || []).map(normalizeQuestion))
      } else {
        setQueue(SEED.sort(() => Math.random() - 0.5).slice(0, 5).map(normalizeQuestion))
      }
    } else {
      const shuffled = [...SEED].sort(() => Math.random() - 0.5)
      setQueue(shuffled.slice(0, isMock ? shuffled.length : 20).map(normalizeQuestion))
    }
    setLoaded(true)
  }, [source, isMock])

  const currentQ = queue[idx]
  const progress = queue.length > 0 ? Math.round(((idx + 1) / queue.length) * 100) : 0

  useEffect(() => {
    if (!currentQ || revealed || !loaded || isMock) return
    const lim = TIMER[currentQ.difficulty] || 45
    setTimeLeft(lim)
    startRef.current = Date.now()
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); handleAnswer(-1); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [idx, loaded, isMock])

  function showToast(msg: string) {
    setToast(msg); setToastOn(true)
    setTimeout(() => setToastOn(false), 2500)
  }

  function handleAnswer(chosenIdx: number) {
    if (revealed) return
    clearInterval(timerRef.current)
    setChosen(chosenIdx); setRevealed(true)
    const t = (Date.now() - startRef.current) / 1000
    const ok = chosenIdx === currentQ.correct
    const xp = ok ? XP[currentQ.difficulty] || 20 : 0
    setExamXP(prev => prev + xp)
    setAnswers(prev => [...prev, {
      questionId: currentQ.id, question: currentQ,
      chosen: chosenIdx, isCorrect: ok,
      timeSeconds: t, xpEarned: xp,
    }])
    if (!isMock) showToast(ok ? `Correct! +${xp} XP` : 'Incorrect — check the explanation.')
  }

  async function handleNext() {
    if (!revealed) return
    const next = idx + 1
    if (next >= queue.length) {
      setSaving(true)
      const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId') || ''
      const finalAnswers = [...answers]
      if (userId) {
        try {
          await fetch('/api/exam/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId, school, examType, sessionId,
              answers: finalAnswers, examXP,
              totalQuestions: queue.length, srCount: 0,
            }),
          })
        } catch {}
      }
      sessionStorage.setItem('examResults', JSON.stringify({
        school, examType, answers: finalAnswers,
        examXP, totalQuestions: queue.length, srCount: 0,
      }))
      setSaving(false)
      router.push(`/results?school=${school}&type=${examType}`)
    } else {
      setIdx(next); setChosen(null); setRevealed(false)
    }
  }

  if (!loaded || !currentQ) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading questions...</div>
    </div>
  )

  const lim = TIMER[currentQ.difficulty] || 45
  const timerPct = (timeLeft / lim) * 100
  const isDanger = timeLeft <= 10

  return (
    <div className="min-h-screen bg-white">
      <div className={`fixed top-0 inset-x-0 z-50 bg-gray-900 text-white text-center py-2.5 text-sm font-bold border-b-2 border-yellow-400 transition-transform duration-300 ${toastOn ? 'translate-y-0' : '-translate-y-full'}`}>
        {toast}
      </div>

      <div className="bg-gray-900 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">{EXAM_NAMES[school]} · {examType} · {currentQ.subject}</div>
            <div className="text-xs text-gray-500 mt-0.5">+{examXP} XP</div>
          </div>
          <div className="flex items-center gap-3">
            {isMock && <div className="bg-red-900 text-red-300 text-xs font-bold px-2 py-0.5 rounded-full">MOCK</div>}
            {!isMock && <div className={`text-lg font-black ${isDanger ? 'text-red-400' : 'text-white'}`}>{timeLeft}s</div>}
          </div>
        </div>
        <div className="h-1 bg-gray-800"><div className="h-1 bg-red-600 transition-all" style={{ width: `${progress}%` }}/></div>
        {!isMock && <div className="h-1.5 bg-gray-700"><div className={`h-1.5 transition-all duration-1000 ${isDanger ? 'bg-red-500' : 'bg-yellow-400'}`} style={{ width: `${timerPct}%` }}/></div>}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-sm text-gray-400">Q{idx + 1} of {queue.length}</span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${currentQ.difficulty === 'hard' ? 'bg-red-100 text-red-700' : currentQ.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{currentQ.difficulty}</span>
          {!isMock && <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{currentQ.topic}</span>}
        </div>

        <div className="text-lg sm:text-xl font-bold text-gray-900 leading-relaxed mb-8">{currentQ.question}</div>

        <div className="flex flex-col gap-3 mb-8">
          {currentQ.choices?.map((choice: string, i: number) => {
            let cls = 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
            let lCls = 'bg-gray-100 text-gray-600'
            if (revealed && !isMock) {
              if (i === currentQ.correct) { cls = 'border-green-500 bg-green-50'; lCls = 'bg-green-600 text-white' }
              else if (i === chosen) { cls = 'border-red-500 bg-red-50'; lCls = 'bg-red-600 text-white' }
              else { cls = 'border-gray-100 bg-gray-50 opacity-50 cursor-default' }
            } else if (revealed && isMock) {
              if (i === chosen) { cls = 'border-blue-500 bg-blue-50'; lCls = 'bg-blue-600 text-white' }
              else { cls = 'border-gray-100 bg-gray-50 cursor-default' }
            } else if (chosen === i) {
              cls = 'border-blue-500 bg-blue-50'; lCls = 'bg-blue-600 text-white'
            }
            return (
              <button key={i} onClick={() => handleAnswer(i)} disabled={revealed}
                className={`flex items-start gap-3 border-2 rounded-xl p-4 text-left transition-all ${cls}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${lCls}`}>{String.fromCharCode(65 + i)}</div>
                <div className="text-sm sm:text-base text-gray-800 leading-relaxed pt-0.5">{choice}</div>
              </button>
            )
          })}
        </div>

        {revealed && !isMock && (
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-2xl p-5 mb-6">
            <div className="text-xs font-bold text-blue-700 mb-2 uppercase">Explanation</div>
            <div className="text-sm text-blue-800 leading-relaxed">{currentQ.explanation}</div>
          </div>
        )}

        {revealed && isMock && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-6 text-center">
            <div className="text-xs text-gray-500">Explanations shown after all sections complete.</div>
          </div>
        )}

        {revealed ? (
          <button onClick={handleNext} disabled={saving}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-2xl transition-colors">
            {saving ? 'Saving...' : idx >= queue.length - 1 ? 'See My Results →' : 'Next Question →'}
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
