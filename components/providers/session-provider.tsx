'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import { createContext, useContext, useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'

type SessionContextType = {
  signOut: () => Promise<void>
  session: Session | null
  isLoading: boolean
}

const defaultSignOut = async () => {
  throw new Error('useSession must be used within a SessionProvider')
}

const SessionContext = createContext<SessionContextType>({
  signOut: defaultSignOut,
  session: null,
  isLoading: true
})

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    const initializeSession = async () => {
      try {
        setIsLoading(true)
        console.log('SessionProvider: Initializing session...')

        // Get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('SessionProvider: Error getting initial session:', sessionError)
          return
        }

        if (initialSession) {
          console.log('SessionProvider: Initial session found')
          setSession(initialSession)
        } else {
          console.log('SessionProvider: No initial session')
        }
      } catch (err) {
        console.error('SessionProvider: Unexpected error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    // Initialize session
    initializeSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('SessionProvider: Auth state changed:', event)
        
        if (currentSession) {
          console.log('SessionProvider: New session available')
          setSession(currentSession)
        } else {
          console.log('SessionProvider: No session after auth change')
          setSession(null)
        }
        
        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signOut = async () => {
    try {
      setIsLoading(true)
      console.log('SessionProvider: Signing out...')
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('SessionProvider: Sign out error:', error)
        throw error
      }
      
      // Clear session state
      setSession(null)
      
      // Clear all storage
      window.localStorage.clear()
      window.sessionStorage.clear()
      
      // Clear cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`)
      })
      
      console.log('SessionProvider: Sign out complete')
      
      // Redirect to sign in
      router.push('/auth/signin')
      router.refresh()
    } catch (err) {
      console.error('SessionProvider: Sign out error:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <SessionContext.Provider value={{ session, signOut, isLoading }}>
      {children}
    </SessionContext.Provider>
  )
}
