'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions,
  canManageUser,
  canModerateInMeeting,
  canEndMeeting,
  shouldShowAdminPanel,
  shouldShowUserManagement,
  shouldShowAnalytics,
  getRoleDisplayName,
  getRoleColor,
  getRoleDescription,
  type Permission 
} from '@/lib/permissions'
import { Database } from '@/types/supabase'

type UserRole = Database['public']['Tables']['profiles']['Row']['role']

export function usePermissions() {
  const { profile } = useAuth()
  const userRole = profile?.role || 'user'

  return {
    // Basic permission checks
    hasPermission: (permission: Permission) => hasPermission(userRole, permission),
    hasAnyPermission: (permissions: Permission[]) => hasAnyPermission(userRole, permissions),
    hasAllPermissions: (permissions: Permission[]) => hasAllPermissions(userRole, permissions),
    
    // User management permissions
    canManageUser: (targetRole: UserRole) => canManageUser(userRole, targetRole),
    
    // Meeting permissions
    canModerateInMeeting: (isHost: boolean = false) => canModerateInMeeting(userRole, isHost),
    canEndMeeting: (isHost: boolean = false) => canEndMeeting(userRole, isHost),
    
    // UI visibility helpers
    shouldShowAdminPanel: () => shouldShowAdminPanel(userRole),
    shouldShowUserManagement: () => shouldShowUserManagement(userRole),
    shouldShowAnalytics: () => shouldShowAnalytics(userRole),
    
    // Role information
    userRole,
    roleDisplayName: getRoleDisplayName(userRole),
    roleColor: getRoleColor(userRole),
    roleDescription: getRoleDescription(userRole),
    
    // Convenience booleans
    isUser: userRole === 'user',
    isModerator: userRole === 'moderator',
    isAdmin: userRole === 'admin',
    isAdminOrModerator: userRole === 'admin' || userRole === 'moderator',
  }
}

// Permission guard component
interface PermissionGuardProps {
  permissions: Permission[]
  requireAll?: boolean
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function PermissionGuard({ 
  permissions, 
  requireAll = true, 
  fallback = null, 
  children 
}: PermissionGuardProps) {
  const { hasAllPermissions, hasAnyPermission } = usePermissions()
  
  const hasAccess = requireAll 
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions)
  
  if (!hasAccess) {
    return fallback as React.ReactElement
  }
  
  return children as React.ReactElement
}

// Role guard component
interface RoleGuardProps {
  roles: UserRole[]
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function RoleGuard({ roles, fallback = null, children }: RoleGuardProps) {
  const { userRole } = usePermissions()
  
  if (!roles.includes(userRole)) {
    return fallback as React.ReactElement
  }
  
  return children as React.ReactElement
}

// Permission-based conditional rendering hook
export function useConditionalRender() {
  const permissions = usePermissions()
  
  return {
    renderIf: (condition: boolean, component: React.ReactNode) => {
      return condition ? component : null
    },
    renderIfPermission: (permission: Permission, component: React.ReactNode) => {
      return permissions.hasPermission(permission) ? component : null
    },
    renderIfRole: (roles: UserRole[], component: React.ReactNode) => {
      return roles.includes(permissions.userRole) ? component : null
    },
    renderIfAdmin: (component: React.ReactNode) => {
      return permissions.isAdmin ? component : null
    },
    renderIfModerator: (component: React.ReactNode) => {
      return permissions.isAdminOrModerator ? component : null
    }
  }
}