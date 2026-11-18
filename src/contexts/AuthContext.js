'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { normalizeProfile } from '@/lib/auth/roles'

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
})

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ])
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])
  const lastFetchedIdRef = useRef(null)

  const fetchProfile = useCallback(async (userId, userEmail, userMetadata) => {
    const fallbackProfile = normalizeProfile(
      { id: userId, email: userEmail, role: userMetadata?.role, full_name: userMetadata?.full_name },
      userEmail
    )

    try {
      const { data, error } = await withTimeout(
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle(),
        3500
      )

      if (error && error.code !== 'PGRST116') {
        console.warn('Unable to load user profile:', error.message)
      }
      setProfile(normalizeProfile(data || fallbackProfile, userEmail))
    } catch {
      setProfile(fallbackProfile)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    let active = true

    supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return
      const currentUser = data?.user ?? null
      const isMissingSession = error && (
        error.message?.toLowerCase().includes('session missing') ||
        error.name === 'AuthSessionMissingError'
      )
      if (error && !isMissingSession) {
        console.warn('Unable to restore authentication session:', error.message)
      }
      setUser(currentUser)
      if (currentUser) {
        lastFetchedIdRef.current = currentUser.id
        fetchProfile(currentUser.id, currentUser.email, currentUser.user_metadata)
      } else {
        setProfile(null)
        setLoading(false)
      }
    }).catch(() => {
      if (active) setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!active) return
        if (event === 'INITIAL_SESSION') return

        const currentUser = session?.user ?? null
        if (currentUser) {
          setUser(currentUser)
          if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || lastFetchedIdRef.current !== currentUser.id) {
            lastFetchedIdRef.current = currentUser.id
            await fetchProfile(currentUser.id, currentUser.email, currentUser.user_metadata)
          }
        } else if (event === 'SIGNED_OUT') {
          lastFetchedIdRef.current = null
          setUser(null)
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
      const { error } = await supabase.auth.signOut()
      if (error) {
        await supabase.auth.signOut({ scope: 'local' })
      }
    } catch {
      // Ignore network errors during sign out
    } finally {
      lastFetchedIdRef.current = null
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
