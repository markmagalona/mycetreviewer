'use client'
// src/components/ui/SchoolSearch.tsx
// School search — shows region only (no city/province — too unreliable)
// Auto-approved on submit — immediately searchable

import { useState, useEffect, useRef } from 'react'

type School = { id: number; name: string; region: string; type: string; verified: boolean }
type Props  = {
  onSelect:    (school: School | null, customName?: string) => void
  placeholder?: string
  defaultValue?: string
  userId?:      string
}

export default function SchoolSearch({ onSelect, placeholder = 'Search your school...', defaultValue = '', userId = '' }: Props) {
  const [query,      setQuery]      = useState(defaultValue)
  const [results,    setResults]    = useState<School[]>([])
  const [loading,    setLoading]    = useState(false)
  const [open,       setOpen]       = useState(false)
  const [selected,   setSelected]   = useState<School | null>(null)
  const [submitted,  setSubmitted]  = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [addedName,  setAddedName]  = useState('')
  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapRef      = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (selected || query.length < 2) { setResults([]); setOpen(false); return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res  = await fetch(`/api/schools/search?q=${encodeURIComponent(query)}&limit=8`)
        const data = await res.json()
        setResults(data.schools || [])
        setOpen(true)
      } catch { setResults([]) }
      finally { setLoading(false) }
    }, 300)
  }, [query, selected])

  function handleSelect(school: School) {
    setSelected(school)
    setQuery(school.name)
    setOpen(false)
    setSubmitted(false)
    onSelect(school)
  }

  function handleClear() {
    setSelected(null)
    setQuery('')
    setResults([])
    setSubmitted(false)
    setAddedName('')
    onSelect(null)
  }

  async function handleSubmitNew() {
    if (!query.trim() || query.length < 3) return
    setSubmitting(true)
    try {
      const res  = await fetch('/api/schools/submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: query.trim(), userId }),
      })
      const data = await res.json()

      if (data.exists) {
        handleSelect(data.school)
      } else if (data.success) {
        // Auto-approved — immediately usable
        setSubmitted(true)
        setAddedName(data.cleanedName || query.trim())
        onSelect(data.school, data.cleanedName || query.trim())
      }
    } catch { /* silently fail */ }
    finally { setSubmitting(false) }
  }

  const showNotFound = open && !loading && results.length === 0 && query.length >= 2 && !selected

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setSelected(null); setSubmitted(false); setAddedName('') }}
          onFocus={() => { if (results.length > 0) setOpen(true) }}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 pr-10 transition-colors"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"/>
          </div>
        )}
        {selected && (
          <button onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none">
            ×
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-64 overflow-y-auto">
          {results.map((school, i) => (
            <button key={`${school.id}-${i}`} onClick={() => handleSelect(school)}
              className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900 flex-1">{school.name}</span>
                {school.verified
                  ? <span className="text-xs text-green-600 font-bold flex-shrink-0">✓ Verified</span>
                  : <span className="text-xs text-gray-400 flex-shrink-0">Community</span>
                }
              </div>
              {school.region && (
                <div className="text-xs text-gray-400 mt-0.5">{school.region}</div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Not found — offer to add */}
      {showNotFound && !submitted && (
        <div className="mt-2 bg-gray-50 border border-gray-200 rounded-xl p-3">
          <div className="text-xs text-gray-600 mb-2">
            "{query}" is not in our list yet.
          </div>
          <div className="flex gap-2">
            <button onClick={handleSubmitNew} disabled={submitting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 rounded-lg transition-colors disabled:opacity-50">
              {submitting ? 'Adding...' : 'Add my school →'}
            </button>
            <button onClick={() => { onSelect(null, query.trim()) }}
              className="text-xs text-gray-500 hover:text-gray-700 px-3">
              Skip
            </button>
          </div>
          <div className="text-xs text-gray-400 mt-1.5">
            Added immediately — no waiting for approval.
          </div>
        </div>
      )}

      {/* Added confirmation */}
      {submitted && (
        <div className="mt-2 bg-green-50 border border-green-200 rounded-xl p-3">
          <div className="text-xs text-green-700 font-semibold">School added! ✓</div>
          <div className="text-xs text-green-600 mt-0.5">
            "{addedName}" is now in our list and saved to your profile.
          </div>
        </div>
      )}

      {/* Selected badge */}
      {selected && (
        <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <span className="text-xs text-green-700">✓</span>
          <span className="text-xs font-semibold text-green-800 flex-1">{selected.name}</span>
          {selected.region && <span className="text-xs text-green-600">{selected.region}</span>}
        </div>
      )}
    </div>
  )
}
