'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Image from 'next/image'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    // Check if we have a code in the URL
    const code = searchParams?.get('code')
    if (!code) {
      setError('Missing reset code. Please use the link from your email.')
    }
  }, [searchParams])

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Get the code from URL
      const code = searchParams?.get('code')
      if (!code) {
        setError('Missing reset code. Please use the link from your email.')
        return
      }

      console.log('ResetPassword: Updating password with code')
      
      // Update the user's password
      const { data, error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        console.error('ResetPassword: Error updating password:', error)
        setError(error.message)
        return
      }

      console.log('ResetPassword: Password updated successfully')

      // Sign out to ensure a clean state
      await supabase.auth.signOut()
      
      // Redirect to sign in
      router.push('/auth/signin?message=Password updated successfully')
    } catch (err) {
      console.error('ResetPassword: Unexpected error:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
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
          <CardTitle className="text-2xl font-semibold tracking-tight text-center">
            Reset Password
          </CardTitle>
          <CardDescription className="text-center text-gray-500">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordReset}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your new password"
                  required
                  disabled={isLoading}
                />
              </div>
              {error && (
                <div className="text-sm text-red-500">
                  {error}
                </div>
              )}
              <Button 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
