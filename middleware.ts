import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    // Check session and refresh if needed
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Middleware: Session error:', error)
      return res
    }

    if (session?.user) {
      // Refresh session to ensure we have latest metadata
      const { data: { session: refreshedSession }, error: refreshError } = 
        await supabase.auth.refreshSession()
      
      if (refreshError) {
        console.error('Middleware: Refresh error:', refreshError)
      } else if (refreshedSession) {
        // Update session with latest data
        await supabase.auth.setSession(refreshedSession)
        
        // Set auth context for database policies
        const token = refreshedSession.access_token
        if (token) {
          res.headers.set('Authorization', `Bearer ${token}`)
          // Also set cookie for client-side access
          res.headers.set('Set-Cookie', `sb-access-token=${token}; Path=/; HttpOnly; SameSite=Lax`)
        }
      }
    }

    // Skip middleware for static files, images and API routes
    const pathname = req.nextUrl.pathname
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/static') ||
      pathname.startsWith('/images') ||
      pathname.includes('favicon.ico') ||
      pathname === '/auth/reset-password'  // Allow reset-password page without auth
    ) {
      return NextResponse.next()
    }

    // Handle auth routes
    if (pathname.startsWith('/auth/')) {
      // If user is logged in and trying to access auth pages, redirect to dashboard
      if (session) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
      return res
    }

    // For all other routes, redirect to signin if no session
    if (!session) {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return res
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
