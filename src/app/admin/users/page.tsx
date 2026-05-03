// src/app/admin/users/page.tsx

import { createAdminClient } from '@/lib/supabase/server'


export const dynamic = 'force-dynamic'
async function getUsers() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('users')
    .select('id, email, name, username, is_paid, is_active, xp, rank, target_schools, ph_school_name, access_expires_at, created_at, last_active_at')
    .order('created_at', { ascending: false })
    .limit(200)
  return data || []
}

export default async function AdminUsersPage() {
  const users = await getUsers()
  const paid  = users.filter(u => u.is_paid)
  const free  = users.filter(u => !u.is_paid)

  const EXAM_NAMES: Record<string,string> = {upcat:'UPCAT',acet:'ACET',dcat:'DCAT',ustet:'USTET',pupcet:'PUPCET',suc:'State U'}

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-black text-white">Users</h1>
        <p className="text-gray-400 text-sm mt-1">{users.length} total · {paid.length} paid · {free.length} free</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label:'Total Users', val: users.length },
          { label:'Paid Users',  val: paid.length  },
          { label:'Conversion',  val: users.length>0?`${Math.round(paid.length/users.length*100)}%`:'0%' },
        ].map(s=>(
          <div key={s.label} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <div className="text-2xl font-black text-white">{s.val}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-700">
          <div className="text-sm font-bold text-white">All Users</div>
        </div>
        <div className="divide-y divide-gray-700">
          {users.map(user => (
            <div key={user.id} className="px-4 py-3 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white">{user.name || user.email.split('@')[0]}</span>
                  {user.username && <span className="text-xs text-gray-400">@{user.username}</span>}
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${user.is_paid?'bg-green-900 text-green-300':'bg-gray-700 text-gray-400'}`}>
                    {user.is_paid ? 'Paid' : 'Free'}
                  </span>
                  {!user.is_active && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-900 text-red-300">Suspended</span>}
                </div>
                <div className="text-xs text-gray-400 mt-1 space-y-0.5">
                  <div>{user.email}</div>
                  {user.ph_school_name && <div>🏫 {user.ph_school_name}</div>}
                  <div className="flex gap-2 flex-wrap">
                    {user.target_schools?.map((s:string) => (
                      <span key={s} className="bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded text-xs">{EXAM_NAMES[s]||s}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0 space-y-1">
                <div className="text-xs text-gray-300 font-semibold">{user.xp} XP · {user.rank}</div>
                {user.access_expires_at && (
                  <div className="text-xs text-gray-500">
                    Expires {new Date(user.access_expires_at).toLocaleDateString('en-PH')}
                  </div>
                )}
                <div className="text-xs text-gray-600">
                  Joined {new Date(user.created_at).toLocaleDateString('en-PH')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
