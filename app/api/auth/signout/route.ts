import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = createRouteHandlerClient({ cookies })

  // Sign out on server side
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Server-side sign out error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Clear auth cookie
  cookies().delete('supabase-auth-token')
  
  return NextResponse.json({ success: true })
}
