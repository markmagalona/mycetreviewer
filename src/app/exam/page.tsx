import { Suspense } from 'react'
import ExamEngine from '@/components/engines/ExamEngine'

export default function ExamPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading exam...</div>
      </div>
    }>
      <ExamEngine />
    </Suspense>
  )
}
