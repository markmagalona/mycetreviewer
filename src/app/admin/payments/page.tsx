export const dynamic = 'force-dynamic'
// src/app/admin/payments/page.tsx
// Shows all payments — Mark can revoke access if GCash doesn't match

import { createAdminClient } from '@/lib/supabase/server'

async function getPayments() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('purchases')
    .select(`
      id, amount, payment_reference, screenshot_url,
      status, approved_at, created_at, expires_at,
      users!inner(id, name, email, is_paid, ph_school_name, target_schools)
    `)
    .order('created_at', { ascending: false })
    .limit(100)
  return data || []
}

export default async function AdminPaymentsPage() {
  const payments = await getPayments()
  const pending  = payments.filter(p => p.status === 'pending')
  const approved = payments.filter(p => p.status === 'approved')
  const revoked  = payments.filter(p => p.status === 'rejected' || p.status === 'refunded')

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">Payments</h1>
          <p className="text-gray-400 text-sm mt-1">
            Access is granted automatically on submission. Revoke here if GCash doesn't match.
          </p>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="bg-green-900 border border-green-700 text-green-300 px-3 py-1.5 rounded-lg">
            {approved.length} active
          </div>
          {pending.length > 0 && (
            <div className="bg-yellow-900 border border-yellow-700 text-yellow-300 px-3 py-1.5 rounded-lg">
              {pending.length} pending
            </div>
          )}
        </div>
      </div>

      {/* Revenue summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total Revenue',   val: `₱${payments.filter(p=>p.status==='approved').reduce((s,p)=>s+(p.amount||0),0).toLocaleString()}` },
          { label: 'Active Users',    val: approved.length },
          { label: 'Revoked',         val: revoked.length },
        ].map(s => (
          <div key={s.label} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <div className="text-2xl font-black text-white">{s.val}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Payments table */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-700">
          <div className="text-sm font-bold text-white">All Payments ({payments.length})</div>
        </div>
        <div className="divide-y divide-gray-700">
          {payments.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">No payments yet</div>
          ) : payments.map((payment: any) => (
            <div key={payment.id} className="px-4 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-white truncate">
                      {payment.users?.name || 'Unknown'}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      payment.status === 'approved'  ? 'bg-green-900 text-green-300' :
                      payment.status === 'pending'   ? 'bg-yellow-900 text-yellow-300' :
                      'bg-red-900 text-red-300'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 space-y-0.5">
                    <div>{payment.users?.email}</div>
                    <div>Ref: <span className="font-mono text-gray-300">{payment.payment_reference}</span></div>
                    <div>{new Date(payment.created_at).toLocaleString('en-PH')}</div>
                    {payment.users?.ph_school_name && <div>School: {payment.users.ph_school_name}</div>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="text-sm font-black text-green-400">₱{payment.amount}</div>
                  {payment.screenshot_url && (
                    <a href={payment.screenshot_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 underline">
                      View screenshot
                    </a>
                  )}
                  {payment.status === 'approved' && (
                    <form action="/api/admin/payments/revoke" method="POST">
                      <input type="hidden" name="paymentId" value={payment.id} />
                      <input type="hidden" name="userId" value={payment.users?.id} />
                      <button type="submit"
                        className="text-xs text-red-400 hover:text-red-300 border border-red-800 hover:border-red-600 px-2 py-1 rounded-lg transition-colors">
                        Revoke access
                      </button>
                    </form>
                  )}
                  {payment.status === 'rejected' && (
                    <form action="/api/admin/payments/restore" method="POST">
                      <input type="hidden" name="paymentId" value={payment.id} />
                      <input type="hidden" name="userId" value={payment.users?.id} />
                      <button type="submit"
                        className="text-xs text-green-400 hover:text-green-300 border border-green-800 hover:border-green-600 px-2 py-1 rounded-lg transition-colors">
                        Restore access
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
