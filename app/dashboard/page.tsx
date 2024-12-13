'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { useAuth } from '@/components/providers/auth-provider'

export default function DashboardPage() {
  const { isAdmin, isLoading } = useAuth()
  
  useEffect(() => {
    console.log('Dashboard: Current auth state:', { isAdmin, isLoading })
  }, [isAdmin, isLoading])

  const modules = [
    {
      title: 'Documents',
      description: 'Upload, manage and search through your documents',
      href: '/documents'
    },
    {
      title: 'Chat',
      description: 'Chat with your AI assistant about your documents',
      href: '/chat'
    }
  ]

  // Add admin module if user is admin
  if (isAdmin) {
    console.log('Dashboard: Adding admin module')
    modules.push({
      title: 'Admin',
      description: 'Manage users, roles, and system settings',
      href: '/admin'
    })
  } else {
    console.log('Dashboard: User is not admin, skipping admin module')
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Link key={module.title} href={module.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-xl mb-2">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
