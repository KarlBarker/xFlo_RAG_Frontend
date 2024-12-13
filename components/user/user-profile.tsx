'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  updated_at: string | null
  is_admin?: boolean
}

export function UserProfile() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)

  const getProfile = useCallback(async () => {
    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.log('No user found')
        router.push('/signin')
        return
      }

      console.log('User metadata:', user.user_metadata)
      console.log('App metadata:', user.app_metadata)
      console.log('Role:', user.role)

      // Get user metadata for admin status
      const isAdmin = user.user_metadata?.is_admin === true
      console.log('Is admin?', isAdmin)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        throw error
      }

      const profileData = {
        id: user.id,
        email: user.email!,
        full_name: data?.full_name ?? null,
        avatar_url: data?.avatar_url ?? null,
        updated_at: data?.updated_at ?? null,
        is_admin: isAdmin
      }

      console.log('Setting profile:', profileData)
      setProfile(profileData)
    } catch (error) {
      console.error('Error in getProfile:', error)
      toast({
        title: 'Error',
        description: 'Error loading profile. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [supabase, router, toast])

  useEffect(() => {
    getProfile()
  }, [getProfile])

  const updateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      const formData = new FormData(e.currentTarget)
      const updates = {
        full_name: formData.get('fullName') as string,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({ id: profile?.id, ...updates })

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Profile updated successfully.',
      })
      
      getProfile()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error updating profile. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[125px] w-full" />
        <Skeleton className="h-[125px] w-full" />
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Manage your profile information
          </CardDescription>
        </CardHeader>
        <form onSubmit={updateProfile}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                value={profile.email}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Enter your full name"
                defaultValue={profile.full_name || ''}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {profile.is_admin && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>
              You have administrator privileges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              As an admin, you have access to additional features and settings.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              onClick={() => router.push('/admin')}
            >
              Go to Admin Dashboard
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
