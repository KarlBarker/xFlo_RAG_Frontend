'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from './session-provider'

type AuthContextType = {
  isAdmin: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  isAdmin: false,
  isLoading: true
})

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const { session, isLoading: sessionLoading } = useSession()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (sessionLoading) {
          console.log('AuthProvider: Session is loading...')
          return
        }

        setIsLoading(true)
        console.log('AuthProvider: Checking auth state...')
        
        if (!session) {
          console.log('AuthProvider: No session found')
          setIsAdmin(false)
          return
        }

        const userId = session.user.id
        console.log('AuthProvider: Session found for user:', {
          email: session.user.email,
          id: userId,
          metadata: session.user.user_metadata
        })
        
        // First check metadata
        const isUserAdmin = session.user.user_metadata?.is_admin === true
        console.log('AuthProvider: Is admin from metadata?', isUserAdmin)

        if (isUserAdmin) {
          console.log('AuthProvider: Admin status confirmed via metadata')
          setIsAdmin(true)
          return
        }

        // Then check profiles table by ID
        console.log('AuthProvider: Checking profiles table by ID:', userId)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', userId)
          .single()

        if (profileError) {
          console.log('AuthProvider: Error checking by ID, trying email...')
          // If ID fails, try by email as fallback
          const { data: emailProfileData, error: emailProfileError } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('email', session.user.email)
            .single()

          if (emailProfileError) {
            console.error('AuthProvider: Error checking by email:', emailProfileError)
            throw emailProfileError
          }

          if (emailProfileData?.is_admin) {
            console.log('AuthProvider: Admin status confirmed via email lookup')
            setIsAdmin(true)
            return
          }
        } else if (profileData?.is_admin) {
          console.log('AuthProvider: Admin status confirmed via ID lookup')
          setIsAdmin(true)
          return
        }

        console.log('AuthProvider: User is not admin')
        setIsAdmin(false)
        
      } catch (error) {
        console.error('AuthProvider: Error checking auth:', error)
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [session, sessionLoading])

  const isLoadingState = isLoading || sessionLoading

  return (
    <AuthContext.Provider value={{ isAdmin, isLoading: isLoadingState }}>
      {children}
    </AuthContext.Provider>
  )
}
