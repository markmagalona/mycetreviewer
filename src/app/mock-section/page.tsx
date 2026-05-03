import { Suspense } from 'react'
import MockSectionEngine from '@/components/engines/MockSectionEngine'

export default function MockSectionEnginePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    }>
      <MockSectionEngine />
    </Suspense>
  )
}
