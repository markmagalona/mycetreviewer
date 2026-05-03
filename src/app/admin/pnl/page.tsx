export const dynamic = 'force-dynamic'
// src/app/admin/pnl/page.tsx
// P&L statement + token usage + cost tracking

import { createAdminClient } from '@/lib/supabase/server'

const PHP_PER_USD   = 57
const VERCEL_COST   = 20  // USD/month (Pro plan)
const SUPABASE_COST = 0   // Free tier

async function getPnLData() {
  const supabase = createAdminClient()
  const now      = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()

  const [
    aiLogsThisMonth,
    aiLogsLastMonth,
    purchasesThisMonth,
    purchasesLastMonth,
    purchasesAllTime,
    totalUsers,
    paidUsers,
  ] = await Promise.all([
    supabase.from('ai_generation_log').select('gemini_cost_usd, gpt_cost_usd, questions_generated, questions_passed, created_at').gte('created_at', monthStart),
    supabase.from('ai_generation_log').select('gemini_cost_usd, gpt_cost_usd').gte('created_at', lastMonthStart).lte('created_at', lastMonthEnd),
    supabase.from('purchases').select('amount').eq('status', 'approved').gte('created_at', monthStart),
    supabase.from('purchases').select('amount').eq('status', 'approved').gte('created_at', lastMonthStart).lte('created_at', lastMonthEnd),
    supabase.from('purchases').select('amount').eq('status', 'approved'),
    supabase.from('users').select('*', { count: 'exact' }),
    supabase.from('users').select('*', { count: 'exact' }).eq('is_paid', true),
  ])

  const aiCostThisMonth  = (aiLogsThisMonth.data  || []).reduce((s, l) => s + (l.gemini_cost_usd || 0) + (l.gpt_cost_usd || 0), 0)
  const aiCostLastMonth  = (aiLogsLastMonth.data  || []).reduce((s, l) => s + (l.gemini_cost_usd || 0) + (l.gpt_cost_usd || 0), 0)
  const revenueThisMonth = (purchasesThisMonth.data || []).reduce((s, p) => s + (p.amount || 0), 0)
  const revenueLastMonth = (purchasesLastMonth.data || []).reduce((s, p) => s + (p.amount || 0), 0)
  const revenueAllTime   = (purchasesAllTime.data  || []).reduce((s, p) => s + (p.amount || 0), 0)

  const totalGenerations = (aiLogsThisMonth.data || []).length
  const totalQGenerated  = (aiLogsThisMonth.data || []).reduce((s, l) => s + (l.questions_generated || 0), 0)
  const totalQPassed     = (aiLogsThisMonth.data || []).reduce((s, l) => s + (l.questions_passed    || 0), 0)

  // Daily AI costs this month
  const dailyCosts: Record<string, number> = {}
  ;(aiLogsThisMonth.data || []).forEach(l => {
    const day = l.created_at?.split('T')[0] || ''
    dailyCosts[day] = (dailyCosts[day] || 0) + (l.gemini_cost_usd || 0) + (l.gpt_cost_usd || 0)
  })

  return {
    // Revenue (PHP)
    revenueThisMonth,
    revenueLastMonth,
    revenueAllTime,
    // AI Costs (USD → PHP)
    aiCostThisMonth,
    aiCostLastMonth,
    aiCostThisMonthPHP: aiCostThisMonth * PHP_PER_USD,
    // Infrastructure Costs (USD → PHP)
    vercelCostPHP: VERCEL_COST * PHP_PER_USD,
    supabaseCostPHP: SUPABASE_COST,
    // P&L
    totalCostPHP: (aiCostThisMonth * PHP_PER_USD) + (VERCEL_COST * PHP_PER_USD),
    netPLThisMonth: revenueThisMonth - (aiCostThisMonth * PHP_PER_USD) - (VERCEL_COST * PHP_PER_USD),
    // Usage
    totalGenerations,
    totalQGenerated,
    totalQPassed,
    passRate: totalQGenerated > 0 ? Math.round(totalQPassed / totalQGenerated * 100) : 0,
    avgCostPerSession: totalGenerations > 0 ? aiCostThisMonth / totalGenerations : 0,
    dailyCosts,
    // Users
    totalUsers:  totalUsers.count  || 0,
    paidUsers:   paidUsers.count   || 0,
    // Month labels
    thisMonth: now.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }),
    lastMonth: new Date(now.getFullYear(), now.getMonth() - 1).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }),
  }
}

function fmt(n: number, decimals = 0) {
  return n.toLocaleString('en-PH', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export default async function AdminPnLPage() {
  const d = await getPnLData()
  const isProfit = d.netPLThisMonth >= 0

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-black text-white">P&L Statement</h1>
        <p className="text-gray-400 text-sm mt-1">{d.thisMonth} · All amounts in PHP unless noted</p>
      </div>

      {/* Monthly P&L summary */}
      <div className={`border rounded-2xl p-5 mb-6 ${isProfit ? 'bg-green-950 border-green-800' : 'bg-red-950 border-red-800'}`}>
        <div className="flex items-start justify-between">
          <div>
            <div className={`text-xs uppercase tracking-wide font-bold mb-1 ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
              {d.thisMonth} Net P&L
            </div>
            <div className={`text-4xl font-black ${isProfit ? 'text-green-300' : 'text-red-300'}`}>
              {isProfit ? '+' : ''}₱{fmt(d.netPLThisMonth)}
            </div>
          </div>
          <div className={`text-4xl`}>{isProfit ? '📈' : '📉'}</div>
        </div>
        <div className={`text-xs mt-3 ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
          ₱{fmt(d.revenueThisMonth)} revenue − ₱{fmt(d.totalCostPHP)} costs
        </div>
      </div>

      {/* Revenue vs Costs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {/* Revenue */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-3 font-bold">Revenue</div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">{d.thisMonth}</span>
              <span className="font-black text-green-400">₱{fmt(d.revenueThisMonth)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{d.lastMonth}</span>
              <span className="text-gray-400">₱{fmt(d.revenueLastMonth)}</span>
            </div>
            <div className="border-t border-gray-700 pt-2 flex justify-between text-sm">
              <span className="text-gray-300 font-semibold">All-time</span>
              <span className="font-black text-white">₱{fmt(d.revenueAllTime)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Paid users</span>
              <span className="text-gray-300">{d.paidUsers} / {d.totalUsers}</span>
            </div>
          </div>
        </div>

        {/* Costs */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-3 font-bold">Costs — {d.thisMonth}</div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">AI (Gemini + GPT)</span>
              <span className="font-bold text-orange-400">₱{fmt(d.aiCostThisMonthPHP, 2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Vercel (Pro)</span>
              <span className="text-gray-400">₱{fmt(d.vercelCostPHP)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Supabase</span>
              <span className="text-gray-400">₱0 (Free)</span>
            </div>
            <div className="border-t border-gray-700 pt-2 flex justify-between text-sm">
              <span className="text-gray-300 font-semibold">Total costs</span>
              <span className="font-black text-red-400">₱{fmt(d.totalCostPHP, 2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Token Usage */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-6">
        <div className="text-sm font-bold text-white mb-4">AI Usage — {d.thisMonth}</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Sessions',         val: fmt(d.totalGenerations)                         },
            { label: 'Questions generated', val: fmt(d.totalQGenerated)                       },
            { label: 'Questions passed',  val: `${fmt(d.totalQPassed)} (${d.passRate}%)`      },
            { label: 'Cost per session',  val: `$${d.avgCostPerSession.toFixed(4)}`           },
          ].map(s => (
            <div key={s.label} className="bg-gray-700 rounded-xl p-3">
              <div className="text-lg font-black text-white">{s.val}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Cost comparison */}
        <div className="mt-4 p-3 bg-gray-700 rounded-xl">
          <div className="text-xs text-gray-400 mb-2">Cost projections (at current rate)</div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: '10 paid users',  sessions: 10 * 20 * 30  },
              { label: '100 paid users', sessions: 100 * 15 * 30 },
              { label: '500 paid users', sessions: 500 * 10 * 30 },
            ].map(p => {
              const cost = p.sessions * d.avgCostPerSession * PHP_PER_USD
              const rev  = p.label.includes('10') ? 5000 : p.label.includes('100') ? 50000 : 250000
              return (
                <div key={p.label} className="bg-gray-600 rounded-lg p-2">
                  <div className="text-xs text-gray-400">{p.label}</div>
                  <div className="text-xs text-red-400 font-bold">−₱{fmt(cost, 0)}/mo AI</div>
                  <div className="text-xs text-green-400 font-bold">+₱{fmt(rev, 0)}/mo rev</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Daily AI costs */}
      {Object.keys(d.dailyCosts).length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <div className="text-sm font-bold text-white mb-3">Daily AI Spend — {d.thisMonth}</div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {Object.entries(d.dailyCosts).sort().reverse().map(([day, cost]) => {
              const pct = Math.min(100, Math.round((cost / 0.5) * 100)) // scale to $0.50 max
              return (
                <div key={day} className="flex items-center gap-3">
                  <div className="text-xs text-gray-400 w-20 flex-shrink-0">{day.slice(5)}</div>
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{width:`${pct}%`}}/>
                  </div>
                  <div className="text-xs text-orange-400 w-16 text-right">${cost.toFixed(4)}</div>
                </div>
              )
            })}
          </div>
          <div className="text-xs text-gray-500 mt-2">Exchange rate: ₱{PHP_PER_USD}/USD</div>
        </div>
      )}
    </div>
  )
}
