// src/types/index.ts

export type School = {
  id: string
  name: string
  full_name: string
  logo_emoji: string
  difficulty: 'moderate' | 'hard' | 'very_hard'
  sections: Section[]
  total_questions: number
  total_time_minutes: number
  description: string
}

export type Section = {
  id: string
  name: string
  questions: number
  minutes: number
}

export type Question = {
  id: string
  school_ids: string[]
  subject: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  question_text: string
  choices: string[]
  correct_index: number
  explanation: string
  source: 'seed' | 'ai_generated'
  status: 'active' | 'hidden' | 'pending'
  flag_count: number
  times_shown: number
  times_correct: number
}

export type User = {
  id: string
  email: string
  name: string
  phone?: string
  is_paid: boolean
  is_active: boolean
  access_expires_at: string | null
  target_schools: string[]
  xp: number
  rank: string
  level: number
  streak_days: number
  last_active_at: string
  created_at: string
}

export type ExamSession = {
  id: string
  user_id: string
  school_id: string
  exam_type: 'diagnostic' | 'mock' | 'training'
  status: 'in_progress' | 'completed' | 'abandoned'
  score: number
  total_questions: number
  correct_answers: number
  xp_earned: number
  time_taken_seconds: number
  section_scores: Record<string, number>
  weak_topics: string[]
  behavioral_insights: BehavioralInsights
  started_at: string
  completed_at: string
}

export type BehavioralInsights = {
  avg_time_per_question: number
  slow_questions: number
  fast_wrong_answers: number
  spaced_repetition_corrected: number
}

export type Purchase = {
  id: string
  user_id: string
  amount: number
  payment_reference: string
  screenshot_url: string | null
  status: 'pending' | 'approved' | 'rejected' | 'refunded'
  admin_note: string | null
  created_at: string
  approved_at: string | null
  expires_at: string | null
  user?: User
}

export type QuestionFlag = {
  id: string
  question_id: string
  user_id: string
  reason: 'wrong_answer' | 'wrong_explanation' | 'confusing_question' | 'duplicate' | 'other'
  details: string | null
  status: 'pending' | 'resolved_fixed' | 'resolved_dismissed' | 'resolved_deleted'
  xp_awarded: boolean
  created_at: string
  question?: Question
  user?: User
}

export type ExamAnswer = {
  questionId: string
  question: Question
  chosenIndex: number
  isCorrect: boolean
  responseTimeSeconds: number
  wasSpacedRepetition: boolean
  xpEarned: number
}

// ─── Constants ────────────────────────────────────────────────

export const RANKS = [
  { min: 0,    name: 'Baguhan',           icon: '🌱', color: '#3B6D11', bg: '#EAF3DE' },
  { min: 100,  name: 'Mag-aaral',         icon: '📚', color: '#185FA5', bg: '#E6F1FB' },
  { min: 300,  name: 'Achiever',          icon: '⚡', color: '#854F0B', bg: '#FAEEDA' },
  { min: 600,  name: 'With Honor',        icon: '🏅', color: '#A32D2D', bg: '#FCEBEB' },
  { min: 1000, name: 'With High Honor',   icon: '🎓', color: '#534AB7', bg: '#EEEDFE' },
  { min: 2000, name: 'With Highest Honor',icon: '🏆', color: '#791F1F', bg: '#1a1a2e' },
]

export const XP_PER_DIFFICULTY = { easy: 10, medium: 20, hard: 30 }
export const XP_SPEED_BONUS = 5
export const XP_SPEED_THRESHOLD_SECONDS = 15
export const XP_MOCK_COMPLETION_BONUS = 50
export const XP_STREAK_BONUS = 30
export const XP_FLAG_REWARD = 10

export const AI_DAILY_LIMIT_FREE = 10
export const AI_DAILY_LIMIT_PAID = 50

export const TAGLISH_CORRECT = [
  'Tama! Galing mo! ✨',
  'Idol! Alam mo yan!',
  'Yes! +XP ka na! 🔥',
  'Solid! Tama ka!',
  'Ayos! Sige pa!',
  'Lodi talaga! Correct!',
  'Wow, tama! 🎯',
  'Galing! Keep it up!',
  'Sus, alam mo na pala yan!',
  'Correct agad! Matalino ka!',
]

export const TAGLISH_WRONG = [
  'Malapit na! Basahin ang explanation.',
  'Ay sus, mali — pero okay lang!',
  'Wrong this time. Pag-aralan mo!',
  'Hindi pa, pero kaya mo next time!',
  'Okay lang! Study muna natin yan.',
]

export const getRank = (xp: number) =>
  [...RANKS].reverse().find(r => xp >= r.min) || RANKS[0]

export const getLevel = (xp: number): number => {
  const thresholds = [0, 100, 200, 350, 550, 800, 1100, 1500, 2000, 3000]
  let level = 1
  thresholds.forEach((t, i) => { if (xp >= t) level = i + 1 })
  return Math.min(level, 10)
}

export const getLevelProgress = (xp: number): { current: number; next: number; pct: number } => {
  const thresholds = [0, 100, 200, 350, 550, 800, 1100, 1500, 2000, 3000, 99999]
  const level = getLevel(xp)
  const current = thresholds[level - 1]
  const next = thresholds[level]
  const pct = Math.round(((xp - current) / (next - current)) * 100)
  return { current, next, pct }
}
