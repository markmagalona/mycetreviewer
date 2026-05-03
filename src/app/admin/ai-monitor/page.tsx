export const dynamic = 'force-dynamic'
// src/app/admin/ai-monitor/page.tsx
// Shows AI generation stats, recent generations, pass/fail rates, cost tracking

import { createAdminClient } from '@/lib/supabase/server'

async function getAIStats() {
  const supabase = createAdminClient()
  const today    = new Date().toISOString().split('T')[0]
  const weekAgo  = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [todayRes, weekRes, recentRes] = await Promise.all([
    supabase.from('ai_generation_log').select('*', { count: 'exact', head: true })
      .gte('created_at', `${today}T00:00:00`),
    supabase.from('ai_generation_log').select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo),
    supabase.from('ai_generation_log')
      .select('id, school_id, subject, topic, difficulty, questions_generated, questions_passed, status, error_reason, created_at, users!user_id(email, username)')
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  return {
    todayCount:  todayRes.count || 0,
    weekCount:   weekRes.count  || 0,
    recent:      recentRes.data || [],
  }
}

export default async function AdminAIMonitorPage() {
  const stats = await getAIStats()

  const passed = stats.recent.filter(r => r.status === 'success').length
  const failed  = stats.recent.filter(r => r.status === 'failed').length
  const partial = stats.recent.filter(r => r.status === 'partial').length
  const passRate = stats.recent.length > 0 ? Math.round(passed / stats.recent.length * 100) : 0

  const totalGenerated = stats.recent.reduce((s: number, r: any) => s + (r.questions_generated || 0), 0)
  const totalPassed    = stats.recent.reduce((s: number, r: any) => s + (r.questions_passed   || 0), 0)
  const qPassRate      = totalGenerated > 0 ? Math.round(totalPassed / totalGenerated * 100) : 0

  const ERROR_LABELS: Record<string,string> = {
    gemini_failed:   'Gemini error',
    gpt_failed:      'GPT-4o mini error',
    consensus_fail:  'Models disagreed',
    low_confidence:  'Low confidence',
    all_rejected:    'All questions rejected',
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-black text-white">AI Monitor</h1>
        <p className="text-gray-400 text-sm mt-1">Question generation stats · Gemini 2.5 Flash-Lite + GPT-4o mini</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label:'Generated today',  val: stats.todayCount },
          { label:'This week',        val: stats.weekCount  },
          { label:'Session pass rate',val: `${passRate}%`   },
          { label:'Question pass rate',val:`${qPassRate}%`  },
        ].map(s=>(
          <div key={s.label} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <div className="text-2xl font-black text-white">{s.val}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Status breakdown */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label:'Successful',  val: passed,  cls:'text-green-400' },
          { label:'Partial',     val: partial, cls:'text-yellow-400'},
          { label:'Failed',      val: failed,  cls:'text-red-400'   },
        ].map(s=>(
          <div key={s.label} className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
            <div className={`text-2xl font-black ${s.cls}`}>{s.val}</div>
            <div className="text-xs text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent generations */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-700">
          <div className="text-sm font-bold text-white">Recent Generations (last 50)</div>
        </div>
        <div className="divide-y divide-gray-700 overflow-y-auto max-h-96">
          {stats.recent.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">No generations yet</div>
          ) : stats.recent.map((log: any) => (
            <div key={log.id} className="px-4 py-3 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    log.status==='success' ? 'bg-green-900 text-green-300' :
                    log.status==='partial' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-red-900 text-red-300'
                  }`}>{log.status}</span>
                  <span className="text-sm font-semibold text-white truncate">
                    {log.subject} — {log.topic}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-1 space-x-2">
                  <span>{log.school_id?.toUpperCase()}</span>
                  <span className={`${log.difficulty==='hard'?'text-red-400':log.difficulty==='medium'?'text-yellow-400':'text-green-400'}`}>
                    {log.difficulty}
                  </span>
                  <span>{log.users?.username||log.users?.email||'unknown'}</span>
                </div>
                {log.error_reason && (
                  <div className="text-xs text-red-400 mt-0.5">
                    {ERROR_LABELS[log.error_reason] || log.error_reason}
                  </div>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs text-gray-300">
                  {log.questions_passed || 0}/{log.questions_generated || 0} passed
                </div>
                <div className="text-xs text-gray-600 mt-0.5">
                  {new Date(log.created_at).toLocaleTimeString('en-PH', {hour:'2-digit',minute:'2-digit'})}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
