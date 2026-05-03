import { Suspense } from 'react'
import MockBreakEngine from '@/components/engines/MockBreakEngine'

export default function MockBreakEnginePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    }>
      <MockBreakEngine />
    </Suspense>
  )
}
