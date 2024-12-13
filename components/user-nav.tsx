'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from './ui/button'

export function UserNav() {
  const supabase = createClient()

  const handleSignOut = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut()
      
      // Clear storage
      localStorage.clear()
      sessionStorage.clear()

      // Redirect through auth callback with logout flag
      window.location.href = '/auth/callback?logout=true'
    } catch (error) {
      console.error('Error signing out:', error)
      window.location.href = '/auth/callback?logout=true'
    }
  }

  return (
    <Button 
      variant="ghost" 
      onClick={handleSignOut}
      className="text-sm font-medium transition-colors hover:text-gray-900 text-gray-500"
    >
      Sign Out
    </Button>
  )
}
