export const dynamic = 'force-dynamic'
// src/app/admin/page.tsx
// Admin dashboard with metrics + quick actions for testing

import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'

async function getMetrics() {
  const supabase = createAdminClient()
  const today    = new Date().toISOString().split('T')[0]

  const [users, paid, sessions, payments, pending] = await Promise.all([
    supabase.from('users').select('*', { count:'exact', head:true }),
    supabase.from('users').select('*', { count:'exact', head:true }).eq('is_paid', true),
    supabase.from('exam_sessions').select('*', { count:'exact', head:true }).eq('status','completed'),
    supabase.from('purchases').select('amount').eq('status','approved'),
    supabase.from('pending_schools').select('*', { count:'exact', head:true }).eq('status','auto_approved'),
  ])

  const revenue = (payments.data || []).reduce((s: number, p: any) => s + (p.amount || 0), 0)

  return {
    totalUsers:    users.count    || 0,
    paidUsers:     paid.count     || 0,
    totalSessions: sessions.count || 0,
    revenue,
    pendingSchools: pending.count || 0,
  }
}

async function getRecentUsers() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('users')
    .select('id, email, name, username, is_paid, xp, rank, created_at')
    .order('created_at', { ascending: false })
    .limit(10)
  return data || []
}

export default async function AdminDashboardPage() {
  const [metrics, recentUsers] = await Promise.all([getMetrics(), getRecentUsers()])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-black text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">MyCETReviewer Admin</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label:'Total Users',    val: metrics.totalUsers    },
          { label:'Paid Users',     val: metrics.paidUsers     },
          { label:'Exams Completed',val: metrics.totalSessions },
          { label:'Revenue',        val: `₱${metrics.revenue.toLocaleString()}` },
        ].map(s=>(
          <div key={s.label} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <div className="text-2xl font-black text-white">{s.val}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {metrics.pendingSchools > 0 && (
        <div className="bg-yellow-950 border border-yellow-800 rounded-xl p-3 mb-6 flex items-center justify-between">
          <div className="text-xs text-yellow-300">
            {metrics.pendingSchools} community-submitted school{metrics.pendingSchools>1?'s':''} need review
          </div>
          <Link href="/admin/schools" className="text-xs font-bold text-yellow-400 hover:text-yellow-200">
            Review →
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-6">
        <div className="text-sm font-bold text-white mb-3">Quick Actions — Dev & Testing</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">

          {/* Grant paid access to any user */}
          <form action="/api/admin/quick-actions/grant-paid" method="POST" className="space-y-2">
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Grant Paid Access</div>
            <div className="flex gap-2">
              <input name="email" type="email" placeholder="user@email.com" required
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"/>
              <button type="submit"
                className="bg-green-700 hover:bg-green-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors whitespace-nowrap">
                Grant →
              </button>
            </div>
          </form>

          {/* Seed diagnostic for a user */}
          <form action="/api/admin/quick-actions/seed-diagnostic" method="POST" className="space-y-2">
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Seed Completed Diagnostic</div>
            <div className="flex gap-2">
              <input name="email" type="email" placeholder="user@email.com" required
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"/>
              <button type="submit"
                className="bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors whitespace-nowrap">
                Seed →
              </button>
            </div>
          </form>

          {/* Revoke paid access */}
          <form action="/api/admin/quick-actions/revoke-paid" method="POST" className="space-y-2">
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Revoke Paid Access</div>
            <div className="flex gap-2">
              <input name="email" type="email" placeholder="user@email.com" required
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"/>
              <button type="submit"
                className="bg-red-800 hover:bg-red-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors whitespace-nowrap">
                Revoke →
              </button>
            </div>
          </form>

          {/* Reset user for testing */}
          <form action="/api/admin/quick-actions/reset-user" method="POST" className="space-y-2">
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Reset User (Testing)</div>
            <div className="flex gap-2">
              <input name="email" type="email" placeholder="user@email.com" required
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"/>
              <button type="submit"
                className="bg-gray-600 hover:bg-gray-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors whitespace-nowrap">
                Reset →
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Recent users */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <div className="text-sm font-bold text-white">Recent Users</div>
          <Link href="/admin/users" className="text-xs text-gray-400 hover:text-white">View all →</Link>
        </div>
        <div className="divide-y divide-gray-700">
          {recentUsers.map(user => (
            <div key={user.id} className="px-4 py-3 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white font-semibold">{user.name||user.email.split('@')[0]}</span>
                  {user.username&&<span className="text-xs text-gray-500">@{user.username}</span>}
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${user.is_paid?'bg-green-900 text-green-300':'bg-gray-700 text-gray-400'}`}>
                    {user.is_paid?'Paid':'Free'}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{user.email}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">{user.xp} XP · {user.rank}</div>
                <div className="text-xs text-gray-600">{new Date(user.created_at).toLocaleDateString('en-PH')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
