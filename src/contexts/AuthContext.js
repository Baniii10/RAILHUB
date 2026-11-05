'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { normalizeProfile } from '@/lib/auth/roles'

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  const fetchProfile = useCallback(async (userId, email) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.warn('Unable to load user profile:', error.message)
      }
      setProfile(data ? normalizeProfile(data, email) : null)
    } catch {
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    let active = true

    supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return
      const currentUser = data?.user ?? null
      // "Auth session missing!" is normal for guests/unauthenticated visitors
      const isMissingSession = error && (
        error.message?.toLowerCase().includes('session missing') ||
        error.name === 'AuthSessionMissingError'
      )
      if (error && !isMissingSession) {
        console.warn('Unable to restore authentication session:', error.message)
      }
      setUser(currentUser)
      if (currentUser) {
        fetchProfile(currentUser.id, currentUser.email)
      } else {
        setLoading(false)
      }
    }).catch(() => {
      if (active) setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!active) return
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser) {
          await fetchProfile(currentUser.id, currentUser.email)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' })
      if (error) console.warn('Sign out warning:', error.message)
    } finally {
      setUser(null)
      setProfile(null)
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
