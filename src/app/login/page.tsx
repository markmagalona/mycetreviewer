export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import LoginEngine from '@/components/engines/LoginEngine'

export default function LoginEnginePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    }>
      <LoginEngine />
    </Suspense>
  )
}
