'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { usePermissions, PermissionGuard } from '@/hooks/usePermissions'
import { userService, type UserWithStats, type UserFilters, type PaginationOptions } from '@/lib/userService'
import { PERMISSIONS, getRoleDisplayName, getRoleColor } from '@/lib/permissions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import {
  UserIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  UserGroupIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { Database } from '@/types/supabase'

type UserRole = Database['public']['Tables']['profiles']['Row']['role']

export default function AdminUsersPage() {
  const router = useRouter()
  const { shouldShowUserManagement, isAdmin } = usePermissions()
  
  const [users, setUsers] = useState<UserWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [totalCount, setTotalCount] = useState(0)
  
  // Filters and pagination
  const [filters, setFilters] = useState<UserFilters>({})
  const [pagination, setPagination] = useState<PaginationOptions>({
    page: 1,
    limit: 10,
    sortBy: 'created_at',
    sortOrder: 'desc'
  })
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  // Removed unused state variable - showFiltersModal, setShowFiltersModal
  
  // Form states
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    role: 'user' as UserRole
  })
  const [saveLoading, setSaveLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Check permissions
  useEffect(() => {
    if (!shouldShowUserManagement()) {
      router.push('/dashboard')
    }
  }, [shouldShowUserManagement, router])

  // Load users
  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    
    try {
      const { data, error, count } = await userService.getUsers(filters, pagination)
      
      if (error) {
        setError(error.message)
      } else {
        setUsers(data || [])
        setTotalCount(count)
      }
    } catch (err) {
      console.error('Error loading users:', err)
      setError(`Failed to load users: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }, [filters, pagination])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // Handle user actions
  const handleEditUser = (user: UserWithStats) => {
    setSelectedUser(user)
    setEditForm({
      full_name: user.full_name || '',
      email: user.email,
      role: user.role
    })
    setShowEditModal(true)
  }

  const handleDeleteUser = (user: UserWithStats) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  const handleSaveUser = async () => {
    if (!selectedUser) return
    
    // Basic validation
    if (!editForm.full_name.trim()) {
      setError('Full name is required')
      return
    }
    
    setSaveLoading(true)
    setError('')
    try {
      const { error } = await userService.updateUser(selectedUser.id, {
        full_name: editForm.full_name.trim(),
        role: editForm.role
      })
      
      if (error) {
        setError(error.message)
      } else {
        setShowEditModal(false)
        loadUsers()
      }
    } catch (err) {
      console.error('Error updating user:', err)
      setError(`Failed to update user: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setSaveLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedUser) return
    
    setDeleteLoading(true)
    setError('')
    try {
      const { error } = await userService.deleteUser(selectedUser.id)
      
      if (error) {
        setError(error.message)
      } else {
        setShowDeleteModal(false)
        loadUsers()
      }
    } catch (err) {
      console.error('Error deleting user:', err)
      setError(`Failed to delete user: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setDeleteLoading(false)
    }
  }

  // Pagination helpers
  const totalPages = Math.ceil(totalCount / (pagination.limit || 10))
  const currentPage = pagination.page || 1

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  if (!shouldShowUserManagement()) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <UserGroupIcon className="w-8 h-8 text-blue-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">User Management</h1>
            </div>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Search and Filters */}
        <div className="mb-6 bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <Input
                    type="text"
                    placeholder="Search users..."
                    className="pl-10"
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {/* TODO: Implement filters */}}
                  className="flex items-center gap-2"
                >
                  <FunnelIcon className="w-4 h-4" />
                  Filters
                </Button>
                <PermissionGuard permissions={[PERMISSIONS.MANAGE_USERS]}>
                  <Button className="flex items-center gap-2">
                    <PlusIcon className="w-4 h-4" />
                    Add User
                  </Button>
                </PermissionGuard>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 mb-6 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
              <p className="ml-2 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="w-6 h-6 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                        <span className="ml-2 text-gray-500">Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <UserIcon className="w-12 h-12 mx-auto text-gray-300" />
                      <p className="mt-2 text-gray-500">No users found</p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10">
                            {user.avatar_url ? (
                              <div className="relative w-10 h-10 overflow-hidden rounded-full">
                                <Image
                                  src={user.avatar_url}
                                  alt={user.full_name || 'User avatar'}
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                />
                              </div>
                            ) : (
                              <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                                <UserIcon className="w-6 h-6 text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.full_name || 'No name'}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {getRoleDisplayName(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.is_online 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.is_online ? 'Online' : 'Offline'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            className="flex items-center gap-1"
                          >
                            <EyeIcon className="w-4 h-4" />
                            View
                          </Button>
                          <PermissionGuard permissions={[PERMISSIONS.MANAGE_USERS]}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                              className="flex items-center gap-1"
                            >
                              <PencilIcon className="w-4 h-4" />
                              Edit
                            </Button>
                          </PermissionGuard>
                          <PermissionGuard permissions={[PERMISSIONS.DELETE_USERS]}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUser(user)}
                              className="flex items-center gap-1 text-red-600 hover:text-red-700"
                            >
                              <TrashIcon className="w-4 h-4" />
                              Delete
                            </Button>
                          </PermissionGuard>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * (pagination.limit || 10)) + 1} to{' '}
                  {Math.min(currentPage * (pagination.limit || 10), totalCount)} of{' '}
                  {totalCount} results
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1"
                  >
                    Next
                    <ChevronRightIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="user-full-name" className="block text-sm font-medium text-gray-700">Full Name *</label>
            <Input
              id="user-full-name"
              type="text"
              value={editForm.full_name}
              onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
              className="mt-1"
              required
              aria-describedby="full-name-error"
            />
            {!editForm.full_name.trim() && (
              <p id="full-name-error" className="mt-1 text-sm text-red-600">Full name is required</p>
            )}
          </div>
          <div>
            <label htmlFor="user-email" className="block text-sm font-medium text-gray-700">Email</label>
            <Input
              id="user-email"
              type="email"
              value={editForm.email}
              disabled
              className="mt-1 bg-gray-50"
              aria-label="User email (read-only)"
            />
          </div>
          <PermissionGuard permissions={[PERMISSIONS.ASSIGN_ROLES]}>
            <div>
              <label htmlFor="user-role-select" className="block text-sm font-medium text-gray-700">Role</label>
              <select
                id="user-role-select"
                value={editForm.role}
                onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value as UserRole }))}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                aria-label="Select user role"
              >
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                {isAdmin && <option value="admin">Administrator</option>}
              </select>
            </div>
          </PermissionGuard>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser} disabled={saveLoading || !editForm.full_name.trim()}>
              {saveLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete User Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete User"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-sm text-gray-900">
                Are you sure you want to delete <strong>{selectedUser?.full_name || selectedUser?.email}</strong>?
              </p>
              <p className="mt-1 text-sm text-gray-500">
                This action cannot be undone. All user data will be permanently removed.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={deleteLoading}
              className="text-white bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? 'Deleting...' : 'Delete User'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}