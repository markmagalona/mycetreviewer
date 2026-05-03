import { Suspense } from 'react'
import CallbackEngine from '@/components/engines/CallbackEngine'

export default function CallbackEnginePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    }>
      <CallbackEngine />
    </Suspense>
  )
}
