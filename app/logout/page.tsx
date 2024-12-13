'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

export default function LogoutPage() {
  useEffect(() => {
    const handleLogout = async () => {
      const supabase = createClient()
      
      // Sign out of Supabase
      await supabase.auth.signOut()
      
      // Clear all storage
      window.localStorage.clear()
      window.sessionStorage.clear()
      
      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })
      
      // Force reload to signin page
      window.location.replace('/signin')
    }

    handleLogout()
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Signing out...</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  )
}
