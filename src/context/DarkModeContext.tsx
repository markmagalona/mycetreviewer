'use client'
// src/context/DarkModeContext.tsx
// Dark mode toggle — persists to localStorage
// Apply dark class to <html> element

import { createContext, useContext, useEffect, useState } from 'react'

type DarkModeContextType = {
  isDark:     boolean
  toggleDark: () => void
}

const DarkModeContext = createContext<DarkModeContextType>({
  isDark: false,
  toggleDark: () => {},
})

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Read from localStorage on mount
    const saved = localStorage.getItem('darkMode')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const dark = saved !== null ? saved === 'true' : prefersDark
    setIsDark(dark)
    if (dark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [])

  function toggleDark() {
    const next = !isDark
    setIsDark(next)
    localStorage.setItem('darkMode', String(next))
    if (next) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }

  return (
    <DarkModeContext.Provider value={{ isDark, toggleDark }}>
      {children}
    </DarkModeContext.Provider>
  )
}

export function useDarkMode() {
  return useContext(DarkModeContext)
}
