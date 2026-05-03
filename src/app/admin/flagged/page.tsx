// src/app/admin/flagged/page.tsx

import { createAdminClient } from '@/lib/supabase/server'


export const dynamic = 'force-dynamic'
async function getFlaggedQuestions() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('question_flags')
    .select(`
      id, reason, details, status, created_at,
      questions!inner(id, question_text, choices, correct_index, explanation, subject, topic, difficulty, flag_count),
      users!inner(email, username)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(50)
  return data || []
}

export default async function AdminFlaggedPage() {
  const flags = await getFlaggedQuestions()

  const REASON_LABELS: Record<string,string> = {
    wrong_answer:       'Wrong answer',
    wrong_explanation:  'Wrong explanation',
    confusing_question: 'Confusing question',
    duplicate:          'Duplicate',
    other:              'Other',
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-black text-white">Flagged Questions</h1>
        <p className="text-gray-400 text-sm mt-1">
          {flags.length} pending · Questions auto-hidden after 3 flags
        </p>
      </div>

      {flags.length === 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
          <div className="text-2xl mb-2">✅</div>
          <div className="text-gray-400 text-sm">No flagged questions — all clear!</div>
        </div>
      ) : (
        <div className="space-y-4">
          {flags.map((flag: any) => (
            <div key={flag.id} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-red-900 text-red-300 px-2 py-0.5 rounded-full">
                    {REASON_LABELS[flag.reason] || flag.reason}
                  </span>
                  <span className="text-xs text-gray-400">{flag.questions?.subject} · {flag.questions?.topic}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    flag.questions?.difficulty==='hard'?'bg-red-900 text-red-300':
                    flag.questions?.difficulty==='medium'?'bg-yellow-900 text-yellow-300':
                    'bg-green-900 text-green-300'
                  }`}>{flag.questions?.difficulty}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {flag.users?.username || flag.users?.email} · {new Date(flag.created_at).toLocaleDateString('en-PH')}
                </div>
              </div>

              <div className="px-4 py-4 space-y-3">
                <div>
                  <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Question</div>
                  <div className="text-sm text-white leading-relaxed">{flag.questions?.question_text}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {(flag.questions?.choices as string[] || []).map((choice: string, i: number) => (
                    <div key={i} className={`text-xs px-3 py-2 rounded-lg ${i===flag.questions?.correct_index?'bg-green-900 text-green-300 font-bold':'bg-gray-700 text-gray-300'}`}>
                      {String.fromCharCode(65+i)}. {choice}
                      {i===flag.questions?.correct_index&&' ✓'}
                    </div>
                  ))}
                </div>

                <div>
                  <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Explanation</div>
                  <div className="text-xs text-gray-300 leading-relaxed">{flag.questions?.explanation}</div>
                </div>

                {flag.details && (
                  <div className="bg-yellow-900 border border-yellow-700 rounded-lg px-3 py-2">
                    <div className="text-xs text-yellow-400 font-bold mb-0.5">Student report:</div>
                    <div className="text-xs text-yellow-200">{flag.details}</div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <form action="/api/admin/flags/resolve" method="POST" className="flex-1">
                    <input type="hidden" name="flagId" value={flag.id} />
                    <input type="hidden" name="questionId" value={flag.questions?.id} />
                    <input type="hidden" name="userId" value="" />
                    <input type="hidden" name="action" value="dismiss" />
                    <button type="submit"
                      className="w-full text-xs text-gray-400 border border-gray-600 hover:border-gray-400 py-2 rounded-lg transition-colors">
                      Dismiss — question is correct
                    </button>
                  </form>
                  <form action="/api/admin/flags/resolve" method="POST" className="flex-1">
                    <input type="hidden" name="flagId" value={flag.id} />
                    <input type="hidden" name="questionId" value={flag.questions?.id} />
                    <input type="hidden" name="userId" value="" />
                    <input type="hidden" name="action" value="delete" />
                    <button type="submit"
                      className="w-full text-xs text-red-400 border border-red-800 hover:border-red-600 py-2 rounded-lg transition-colors">
                      Delete question
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
