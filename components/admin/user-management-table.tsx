'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import { Button } from '../../components/ui/button'
import { MoreHorizontal, Pencil, Trash } from 'lucide-react'
import { Badge } from '../../components/ui/badge'
import { useToast } from '../../hooks/use-toast'
import { AddUserDialog } from './add-user-dialog'
import { EditUserDialog } from './edit-user-dialog'

interface User {
  id: string
  email: string
  role: string
  created_at: string
  status?: string
}

export function UserManagementTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userToEdit, setUserToEdit] = useState<User | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  const fetchUsers = async () => {
    try {
      setError(null)
      console.log('Starting to fetch users...')
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('Session check:', { session, error: sessionError })
      
      if (sessionError) {
        throw new Error(`Session error: ${sessionError.message}`)
      }

      if (!session) {
        throw new Error('No session found')
      }

      // Get current user's role from auth metadata
      const isAdmin = session.user.app_metadata?.role === 'super_admin'
      console.log('Current user role from metadata:', { isAdmin, metadata: session.user.app_metadata })
      setCurrentUserRole(isAdmin ? 'super_admin' : 'user')

      // Fetch all profiles if admin, or just the user's own profile
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, account_id, created_at')
        .order('created_at', { ascending: false })

      console.log('Profiles query:', { profiles, error: profilesError })

      if (profilesError) {
        throw new Error(`Profiles error: ${profilesError.message}`)
      }

      if (profiles) {
        // Add role information from auth metadata for display
        const usersWithRoles = profiles.map(profile => ({
          ...profile,
          role: profile.id === session.user.id ? 
            (session.user.app_metadata?.role || 'user') : 
            'user'
        }))
        console.log('Processed profiles:', usersWithRoles)
        setUsers(usersWithRoles)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('Error in fetchUsers:', errorMessage)
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'default'
      case 'admin':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'pending':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const handleEditUser = (user: User) => {
    console.log('Attempting to edit user:', user)
    setUserToEdit(user)
  }

  const handleDeleteUser = async (user: User) => {
    console.log('Attempting to delete user:', user)
  }

  if (loading) {
    return <div className="text-center py-4">Loading users...</div>
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-600">
        Error: {error}
        <Button 
          onClick={fetchUsers} 
          variant="outline" 
          className="ml-2"
        >
          Retry
        </Button>
      </div>
    )
  }

  const canManageUser = (userRole: string) => {
    if (userRole === 'super_admin') {
      return currentUserRole === 'super_admin'
    }
    return currentUserRole === 'super_admin' || currentUserRole === 'admin'
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Users ({users.length})</h2>
        <AddUserDialog onUserAdded={fetchUsers} />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                console.log('Rendering user:', user.email, 'Role:', user.role, 'Can manage:', canManageUser(user.role))
                return (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(user.status || 'active')}>
                        {user.status || 'active'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {canManageUser(user.role) ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className="h-8 w-8 p-0 hover:bg-slate-100"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent 
                            align="end" 
                            className="w-[160px] z-50"
                          >
                            <DropdownMenuItem 
                              onClick={() => handleEditUser(user)}
                              className="cursor-pointer"
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>Edit User</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(user)}
                              className="cursor-pointer text-red-600"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              <span>Delete User</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <div className="text-sm text-gray-500 italic">
                          Protected
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
      {userToEdit && (
        <EditUserDialog
          user={userToEdit}
          onUserUpdated={() => {
            fetchUsers()
            setUserToEdit(null)
          }}
        />
      )}
    </div>
  )
}
