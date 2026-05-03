// src/app/admin/layout.tsx
// Admin sidebar with all nav items including Schools + AI Monitor

import Link from 'next/link'
import { cookies } from 'next/headers'



export const dynamic = 'force-dynamic'
const NAV = [
  { href:'/admin',           label:'Dashboard',    icon:'📊' },
  { href:'/admin/payments',  label:'Payments',     icon:'💳' },
  { href:'/admin/users',     label:'Users',        icon:'👥' },
  { href:'/admin/schools',   label:'Schools',      icon:'🏫' },
  { href:'/admin/flagged',   label:'Flagged',      icon:'🚩' },
  { href:'/admin/ai-monitor',label:'AI Monitor',   icon:'🤖' },
]


export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Auth handled per-page via middleware

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex w-52 flex-col bg-gray-900 border-r border-gray-800 fixed h-full">
        <div className="p-4 border-b border-gray-800">
          <div className="text-sm font-black text-white">
            MyCET<span className="text-red-500">Reviewer</span>
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Admin Panel</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-800">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-600 hover:text-gray-400 transition-colors">
            ← Back to site
          </Link>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-gray-900 border-t border-gray-800 z-50 flex">
        {NAV.slice(0,5).map(item => (
          <Link key={item.href} href={item.href}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 text-gray-500 hover:text-white transition-colors">
            <span className="text-base">{item.icon}</span>
            <span className="text-[10px] font-semibold">{item.label.split(' ')[0]}</span>
          </Link>
        ))}
      </nav>

      {/* Main content */}
      <main className="flex-1 md:ml-52 p-4 sm:p-6 pb-20 md:pb-6">
        {children}
      </main>
    </div>
  )
}
