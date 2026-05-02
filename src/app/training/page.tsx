import { Suspense } from 'react'
import TrainingEngine from './TrainingEngine'

export default function TrainingEnginePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    }>
      <TrainingEngine />
    </Suspense>
  )
}
