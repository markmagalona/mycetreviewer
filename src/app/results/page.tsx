import { Suspense } from 'react'
import ResultsEngine from './ResultsEngine'

export default function ResultsEnginePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    }>
      <ResultsEngine />
    </Suspense>
  )
}
