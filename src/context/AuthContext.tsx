'use client'
// src/context/AuthContext.tsx
// Updated for password-based auth — reads userId from sessionStorage/localStorage
// Falls back to Supabase session check for magic link users

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

type AuthUser = {
  id:         string
  email:      string
  name:       string
  username:   string | null
  isPaid:     boolean
  xp:         number
  rank:       string
  hasProfile: boolean
  targetSchools: string[]
}

type AuthContextType = {
  user:    AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null, loading: true,
  signOut: async () => {}, refresh: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadUser() {
    try {
      // Primary: check sessionStorage/localStorage for userId
      const userId = (typeof window !== 'undefined')
        ? (localStorage.getItem('userId') || sessionStorage.getItem('userId'))
        : null

      if (userId) {
        const res = await fetch(`/api/user/me?userId=${userId}`)
        if (res.ok) {
          const data = await res.json()
          setUser({
            id:            data.id,
            email:         data.email,
            name:          data.name,
            username:      data.username,
            isPaid:        data.is_paid,
            xp:            data.xp || 0,
            rank:          data.rank || 'Baguhan',
            hasProfile:    !!data.username,
            targetSchools: data.target_schools || [],
          })
          setLoading(false)
          return
        }
      }

      // Fallback: check Supabase session (for magic link users)
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user?.email) {
        const res = await fetch('/api/auth/session', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email: session.user.email }),
        })
        const data = await res.json()
        if (data.userId) {
          sessionStorage.setItem('userId', data.userId)
          localStorage.setItem('userId',   data.userId)
          const userRes = await fetch(`/api/user/me?userId=${data.userId}`)
          if (userRes.ok) {
            const userData = await userRes.json()
            setUser({
              id:            userData.id,
              email:         userData.email,
              name:          userData.name,
              username:      userData.username,
              isPaid:        userData.is_paid,
              xp:            userData.xp || 0,
              rank:          userData.rank || 'Baguhan',
              hasProfile:    !!userData.username,
              targetSchools: userData.target_schools || [],
            })
            setLoading(false)
            return
          }
        }
      }

      setUser(null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    sessionStorage.removeItem('userId')
    sessionStorage.removeItem('userEmail')
    localStorage.removeItem('userId')
    setUser(null)
    window.location.href = '/'
  }

  useEffect(() => {
    loadUser()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refresh: loadUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
