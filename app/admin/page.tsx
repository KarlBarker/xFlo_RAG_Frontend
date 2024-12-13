'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { UserManagementTable } from '../../components/admin/user-management-table'
import { Toaster } from '../../components/ui/toaster'
import { useAuth } from '@/components/providers/auth-provider'

export default function AdminPage() {
  const router = useRouter()
  const { isAdmin } = useAuth()

  useEffect(() => {
    if (!isAdmin) {
      console.log('Admin page: User is not admin, redirecting to dashboard')
      router.push('/dashboard')
    }
  }, [isAdmin, router])

  if (!isAdmin) {
    return null // Don't render anything if not admin
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <UserManagementTable />
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Management</CardTitle>
              <CardDescription>
                Manage organization accounts and settings
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure system-wide settings and preferences
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
      <Toaster />
    </div>
  )
}
