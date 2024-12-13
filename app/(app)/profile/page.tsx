import { Metadata } from 'next'
import { UserProfile } from '@/components/user/user-profile'

export const metadata: Metadata = {
  title: 'Profile | xFlo AI Assistant',
  description: 'Manage your xFlo AI Assistant profile settings',
}

export default function ProfilePage() {
  return (
    <div className="container max-w-4xl py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      <UserProfile />
    </div>
  )
}
