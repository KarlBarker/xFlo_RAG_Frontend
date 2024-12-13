import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.signOut()
    cookies().delete('supabase-auth-token')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Sign out on server side
    await supabase.auth.signOut()
    
    // Clear auth cookies
    cookies().delete('supabase-auth-token')
    cookies().delete('sb-refresh-token')
    cookies().delete('sb-access-token')
    
    // Create response with redirect
    const response = NextResponse.redirect(new URL('/signin', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
    
    // Clear all cookies
    response.cookies.delete('supabase-auth-token')
    response.cookies.delete('sb-refresh-token')
    response.cookies.delete('sb-access-token')
    
    return response
  } catch (error) {
    console.error('Logout redirect error:', error)
    // Redirect to signin even if there's an error
    return NextResponse.redirect(new URL('/signin', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
  }
}
