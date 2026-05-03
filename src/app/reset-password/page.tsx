export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import ResetPasswordEngine from './ResetPasswordEngine'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    }>
      <ResetPasswordEngine />
    </Suspense>
  )
}
