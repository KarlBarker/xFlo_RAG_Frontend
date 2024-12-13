'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'

interface AuthFormProps {
  className?: string
  view?: 'sign_in' | 'sign_up'
}

export function AuthForm({ className, view = 'sign_in', ...props }: AuthFormProps) {
  const router = useRouter()
  const [origin, setOrigin] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setOrigin(window.location.origin)
    
    // Check for password reset hash in URL
    const hash = window.location.hash
    if (hash && hash.includes('#access_token=')) {
      handlePasswordReset(hash)
    }
  }, [])

  const handlePasswordReset = async (hash: string) => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session during password reset:', error)
        setError(error.message)
        return
      }

      if (data?.session) {
        console.log('Session exists during password reset, redirecting...')
        router.push('/dashboard')
      }
    } catch (err) {
      console.error('Unexpected error during password reset:', err)
      setError('An unexpected error occurred during password reset')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    setMessage(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      console.log('Attempting sign in for:', email)
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error('Sign in error details:', {
          message: signInError.message,
          status: signInError.status,
          name: signInError.name
        })
        setError(signInError.message)
        return
      }

      if (!data?.session) {
        console.error('No session after sign in. Full response:', data)
        setError('Failed to create session')
        return
      }

      // Log session details (excluding sensitive data)
      console.log('Session created:', {
        user: data.session.user.id,
        expires_at: data.session.expires_at,
        role: data.session.user.role
      })

      // Ensure we have the session before redirecting
      await supabase.auth.setSession(data.session)
      
      console.log('Sign in successful, redirecting...')
      router.push('/dashboard')
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    const email = (document.getElementById('email') as HTMLInputElement)?.value
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      // Get the current URL
      const currentUrl = window.location.origin
      console.log('AuthForm: Current URL:', currentUrl)
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${currentUrl}/auth/reset-password`,
      })

      if (error) {
        console.error('AuthForm: Password reset error:', error)
        setError(error.message)
        return
      }

      // Show success message
      console.log('AuthForm: Password reset email sent')
      setMessage('Check your email for the password reset link')
    } catch (err) {
      console.error('AuthForm: Unexpected error:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-[350px] bg-white shadow-lg">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          <Image
            src="/images/xflo-logo.png"
            alt="xFlo Logo"
            width={120}
            height={120}
            style={{ width: 'auto', height: '40px' }}
            priority
          />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl font-semibold tracking-tight text-center">
            {view === 'sign_in' ? 'Sign in' : 'Create an account'}
          </CardTitle>
          <CardDescription className="text-center text-gray-500">
            {view === 'sign_in'
              ? 'Enter your email below to sign in'
              : 'Enter your email below to create your account'}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignIn}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button
                  type="button"
                  variant="link"
                  className="px-0 font-normal"
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                name="password"
                required
              />
            </div>
            {error && (
              <div className="text-sm text-red-500">
                {error}
              </div>
            )}
            {message && (
              <div className="text-sm text-green-500">
                {message}
              </div>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Please wait...' : 'Sign In'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
