'use client'
import { getSeedQuestions } from '@/lib/seedQuestions'
// src/components/engines/MockSectionEngine.tsx
// Reads AI-generated questions from sessionStorage['mockSectionQuestions']
// Falls back to seed if AI questions not available

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

type Question = {
  id: string; question: string; choices: string[]
  correct: number; explanation: string
  subject: string; topic: string; difficulty: string
}

const SEED: Question[] = [
  { id:'s1',  subject:'Mathematics',           topic:'Algebra',   difficulty:'medium', question:'If 3(2x − 1) = 2(x + 5), what is x?',                             choices:['x = 2','x = 13/4','x = 3','x = 4'],                   correct:1, explanation:'4x = 13, x = 13/4.' },
  { id:'s2',  subject:'Mathematics',           topic:'Geometry',  difficulty:'medium', question:'Area of a triangle with base 10 and height 6?',                    choices:['30','60','16','12'],                                   correct:0, explanation:'Area = ½ × 10 × 6 = 30.' },
  { id:'s3',  subject:'Mathematics',           topic:'Patterns',  difficulty:'medium', question:'Next: 2, 6, 12, 20, 30, ___',                                      choices:['42','40','36','44'],                                   correct:0, explanation:'Differences: +4,+6,+8,+10,+12.' },
  { id:'s4',  subject:'Science',               topic:'Biology',   difficulty:'medium', question:'Cell has no membrane-bound nucleus. Type?',                        choices:['Eukaryotic','Prokaryotic','Somatic','Gametic'],         correct:1, explanation:'Prokaryotic = no membrane-bound nucleus.' },
  { id:'s5',  subject:'Science',               topic:'Physics',   difficulty:'easy',   question:'5kg object, 20N net force. Acceleration?',                         choices:['4 m/s²','100 m/s²','0.25 m/s²','2 m/s²'],             correct:0, explanation:'F=ma → a=4 m/s².' },
  { id:'s6',  subject:'Science',               topic:'Chemistry', difficulty:'easy',   question:'Moles in 44g CO₂? (C=12, O=16)',                                   choices:['1 mol','2 mol','0.5 mol','44 mol'],                    correct:0, explanation:'Molar mass=44. 1 mol.' },
  { id:'s7',  subject:'Language Proficiency',  topic:'Grammar',   difficulty:'hard',   question:'Which is CORRECT?',                                                choices:['Neither the captain nor the players was ready.','Neither the captain nor the players were ready.','Neither the captain nor the players are not ready.','Both were incorrect.'], correct:1, explanation:"Nearest subject 'players' → 'were'." },
  { id:'s8',  subject:'Language Proficiency',  topic:'Vocabulary',difficulty:'hard',   question:"'Equivocal' means:",                                               choices:['Definitive','Open to interpretation','Hostile','Clear'], correct:1, explanation:'Equivocal = deliberately ambiguous.' },
  { id:'s9',  subject:'Reading Comprehension', topic:'Inference', difficulty:'hard',   question:"'Researchers who spent decades defending a theory opposed the young scientist.' What is inferred?", choices:['They protected their reputation.','They had not read her work.','They found errors.','They were envious.'], correct:0, explanation:"'Decades defending' = vested interest." },
  { id:'s10', subject:'Reading Comprehension', topic:'Tone',      difficulty:'medium', question:"'Industry leaders greeted the policy with cautious optimism.' Tone:", choices:['Enthusiastically positive','Neutral to mildly positive','Critical','Ironic'], correct:1, explanation:"'Cautious optimism' = qualified positivity." },
  { id:'s11', subject:'Logic and Reasoning',   topic:'Patterns',  difficulty:'medium', question:'Pattern: 1, 4, 9, 16, 25, ___',                                   choices:['36','30','49','32'],                                   correct:0, explanation:'Perfect squares. 6²=36.' },
  { id:'s12', subject:'Logic and Reasoning',   topic:'Logic',     difficulty:'hard',   question:'All A are B. All B are C. Therefore:',                             choices:['All A are C','All C are A','Some A are C','No A are C'],correct:0, explanation:'Transitive: A→B→C means A→C.' },
  { id:'s13', subject:'Mathematics',           topic:'Statistics', difficulty:'medium',question:'Mean of 5,8,12,15,20?',                                            choices:['12','10','11','13'],                                   correct:0, explanation:'Sum=60 ÷ 5 = 12.' },
  { id:'s14', subject:'Science',               topic:'Genetics',  difficulty:'medium', question:'Tt × Tt cross. Fraction of tt offspring?',                         choices:['1/4','1/2','3/4','1'],                                 correct:0, explanation:'Punnett: tt = 1/4.' },
  { id:'s15', subject:'Language Proficiency',  topic:'Modifiers', difficulty:'hard',   question:'Which has a dangling modifier?',                                   choices:['Having studied, the exam seemed easy.','After reviewing, Maria found it easy.','Maria studied.','Because she studied, it was easy.'], correct:0, explanation:"'Having studied' should modify Maria." },
  { id:'s16', subject:'Science',               topic:'Ecology',   difficulty:'medium', question:'Grass→rabbit→fox→wolf. Wolves removed. What happens first?',       choices:['Grass increases','Fox increases','Rabbit decreases','Grass decreases'], correct:1, explanation:'No wolves → fox population rises.' },
  { id:'s17', subject:'Mathematics',           topic:'Algebra',   difficulty:'hard',   question:'Product of roots of 2x² − 5x + 3 = 0?',                           choices:['3/2','5/2','−3/2','5'],                                correct:0, explanation:"Vieta's: c/a = 3/2." },
  { id:'s18', subject:'Reading Comprehension', topic:'Figurative Language',difficulty:'medium',question:"Victories as 'hollow' suggests:", choices:['Dishonest','Empty of meaning','Few celebrated','Minor'],  correct:1, explanation:"'Hollow' = no real substance." },
  { id:'s19', subject:'Logic and Reasoning',   topic:'Sequences', difficulty:'medium', question:'Next: O, T, T, F, F, S, S, ___',                                  choices:['E','N','O','T'],                                       correct:0, explanation:'First letters of: One,Two,Three,...Eight.' },
  { id:'s20', subject:'Science',               topic:'Scientific Method',difficulty:'easy',question:"'Amount of light per day' in plant experiment:", choices:['Dependent variable','Independent variable','Controlled variable','Hypothesis'], correct:1, explanation:'Independent = what experimenter changes.' },
]

function getQuestionsForSection(sectionId: string, sectionName: string, count: number): Question[] {
  // Try to get AI-generated questions
  try {
    const raw = sessionStorage.getItem('mockSectionQuestions')
    if (raw) {
      const allSections = JSON.parse(raw)
      const sectionQs = allSections[sectionId] || []
      if (sectionQs.length > 0) {
        return sectionQs.map((q: any, i: number) => ({
          id: q.id || `ai-${sectionId}-${i}`,
          question:    q.question,
          choices:     q.choices,
          correct:     q.correct_index ?? q.correct ?? 0,
          explanation: q.explanation || '',
          subject:     q.subject || sectionName,
          topic:       q.topic   || sectionName,
          difficulty:  q.difficulty || 'medium',
        }))
      }
    }
  } catch {}

  // Fallback: use per-CET seed questions shuffled, repeated to fill count
  const cetSeeds = getSeedQuestions(school || 'upcat')
  const shuffled = [...cetSeeds].sort(() => Math.random() - 0.5)
  const result: Question[] = []
  while (result.length < count) {
    result.push(...shuffled.map((q, i) => ({...q, id:`${q.id}-${result.length+i}`})))
  }
  return result.slice(0, count)
}

export default function MockSectionEngine() {
  const params         = useSearchParams()
  const router         = useRouter()
  const school         = params.get('school')        || 'upcat'
  const sessionId      = params.get('sessionId')     || ''
  const sectionIdx     = parseInt(params.get('sectionIdx')    || '0')
  const sectionId      = params.get('sectionId')     || 'section'
  const sectionName    = params.get('sectionName')   || 'Section'
  const questionCount  = parseInt(params.get('questions')     || '20')
  const sectionMinutes = parseInt(params.get('minutes')       || '45')
  const totalSections  = parseInt(params.get('totalSections') || '4')

  const [questions, setQuestions] = useState<Question[]>([])
  const [loaded,    setLoaded]    = useState(false)
  const [idx,       setIdx]       = useState(0)
  const [chosen,    setChosen]    = useState<number|null>(null)
  const [timeLeft,  setTimeLeft]  = useState(sectionMinutes * 60)
  const timerRef = useRef<any>(null)

  useEffect(() => {
    setQuestions(getQuestionsForSection(sectionId, sectionName, questionCount))
    setLoaded(true)
  }, [sectionId, sectionName, questionCount])

  useEffect(() => {
    if (!loaded) return
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); finishSection(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [loaded])

  const currentQ = questions[idx]
  const progress = questions.length > 0 ? Math.round(((idx+1)/questions.length)*100) : 0
  const mins = Math.floor(timeLeft/60)
  const secs = timeLeft % 60
  const isDanger = timeLeft <= 60

  function handleAnswer(i: number) {
    if (chosen !== null) return
    setChosen(i)
    // Save answer
    const existing = JSON.parse(sessionStorage.getItem('mockAnswers')||'[]')
    existing.push({
      sectionId, sectionName, questionId: currentQ.id,
      question: currentQ, chosen: i,
      isCorrect: i === currentQ.correct, xpEarned: 0
    })
    sessionStorage.setItem('mockAnswers', JSON.stringify(existing))
    // Auto advance after 800ms
    setTimeout(() => {
      if (idx + 1 >= questions.length) finishSection()
      else { setIdx(prev => prev+1); setChosen(null) }
    }, 800)
  }

  function finishSection() {
    clearInterval(timerRef.current)
    const allAnswers = JSON.parse(sessionStorage.getItem('mockAnswers')||'[]')
    const sectionAnswers = allAnswers.filter((a:any) => a.sectionId === sectionId)
    const score = sectionAnswers.filter((a:any) => a.isCorrect).length

    if (sectionIdx >= totalSections - 1) {
      // Last section — go to results
      sessionStorage.setItem('examResults', JSON.stringify({
        school, examType:'mock', answers: allAnswers,
        examXP: 0, totalQuestions: allAnswers.length, srCount: 0
      }))
      router.push(`/results?school=${school}&type=mock`)
    } else {
      router.push(`/mock-break?school=${school}&sessionId=${sessionId}&completedSection=${sectionIdx}&totalSections=${totalSections}&score=${score}&total=${sectionAnswers.length}`)
    }
  }

  if (!loaded || !currentQ) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading section...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-900 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">{school.toUpperCase()} MOCK · {sectionName}</div>
            <div className="text-xs text-gray-500 mt-0.5">Section {sectionIdx+1} of {totalSections}</div>
          </div>
          <div className={`text-lg font-black ${isDanger ? 'text-red-400' : 'text-white'}`}>
            {mins}:{secs.toString().padStart(2,'0')}
          </div>
        </div>
        <div className="h-1 bg-gray-800">
          <div className="h-1 bg-red-600 transition-all" style={{width:`${progress}%`}}/>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-sm text-gray-400">Q{idx+1} of {questions.length}</span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            currentQ.difficulty==='hard'   ? 'bg-red-100 text-red-700' :
            currentQ.difficulty==='medium' ? 'bg-yellow-100 text-yellow-700' :
                                             'bg-green-100 text-green-700'
          }`}>{currentQ.difficulty}</span>
        </div>

        <div className="text-lg sm:text-xl font-bold text-gray-900 leading-relaxed mb-8">
          {currentQ.question}
        </div>

        <div className={`gap-3 mb-8 ${currentQ.choices.every(c=>c.length<35) ? 'grid grid-cols-1 sm:grid-cols-2' : 'flex flex-col'}`}>
          {currentQ.choices.map((choice, i) => {
            let cls  = 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
            let lCls = 'bg-gray-100 text-gray-600'
            if (chosen !== null) {
              if (i === chosen) { cls = 'border-blue-500 bg-blue-50'; lCls = 'bg-blue-600 text-white' }
              else              { cls = 'border-gray-100 bg-gray-50 cursor-default opacity-60' }
            }
            return (
              <button key={i} onClick={() => handleAnswer(i)} disabled={chosen!==null}
                className={`flex items-start gap-3 border-2 rounded-xl p-4 text-left transition-all ${cls}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${lCls}`}>
                  {String.fromCharCode(65+i)}
                </div>
                <div className="text-sm sm:text-base text-gray-800 leading-relaxed pt-0.5">{choice}</div>
              </button>
            )
          })}
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
          <div className="text-xs text-gray-500">No hints during mock exam · Explanations shown after all sections</div>
        </div>
      </div>
    </div>
  )
}
