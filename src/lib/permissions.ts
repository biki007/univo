import { Database } from '@/types/supabase'

type UserRole = Database['public']['Tables']['profiles']['Row']['role']

// Define permissions for each role
export const PERMISSIONS = {
  // Meeting permissions
  CREATE_MEETING: 'create_meeting',
  JOIN_MEETING: 'join_meeting',
  MODERATE_MEETING: 'moderate_meeting',
  END_MEETING: 'end_meeting',
  RECORD_MEETING: 'record_meeting',
  
  // User management permissions
  VIEW_USERS: 'view_users',
  MANAGE_USERS: 'manage_users',
  DELETE_USERS: 'delete_users',
  ASSIGN_ROLES: 'assign_roles',
  
  // Content permissions
  SHARE_SCREEN: 'share_screen',
  USE_WHITEBOARD: 'use_whiteboard',
  UPLOAD_FILES: 'upload_files',
  USE_CHAT: 'use_chat',
  
  // Admin permissions
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_SETTINGS: 'manage_settings',
  ACCESS_ADMIN_PANEL: 'access_admin_panel',
  MANAGE_BILLING: 'manage_billing',
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  user: [
    PERMISSIONS.CREATE_MEETING,
    PERMISSIONS.JOIN_MEETING,
    PERMISSIONS.SHARE_SCREEN,
    PERMISSIONS.USE_WHITEBOARD,
    PERMISSIONS.UPLOAD_FILES,
    PERMISSIONS.USE_CHAT,
  ],
  moderator: [
    PERMISSIONS.CREATE_MEETING,
    PERMISSIONS.JOIN_MEETING,
    PERMISSIONS.MODERATE_MEETING,
    PERMISSIONS.END_MEETING,
    PERMISSIONS.RECORD_MEETING,
    PERMISSIONS.SHARE_SCREEN,
    PERMISSIONS.USE_WHITEBOARD,
    PERMISSIONS.UPLOAD_FILES,
    PERMISSIONS.USE_CHAT,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_ANALYTICS,
  ],
  admin: [
    PERMISSIONS.CREATE_MEETING,
    PERMISSIONS.JOIN_MEETING,
    PERMISSIONS.MODERATE_MEETING,
    PERMISSIONS.END_MEETING,
    PERMISSIONS.RECORD_MEETING,
    PERMISSIONS.SHARE_SCREEN,
    PERMISSIONS.USE_WHITEBOARD,
    PERMISSIONS.UPLOAD_FILES,
    PERMISSIONS.USE_CHAT,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.DELETE_USERS,
    PERMISSIONS.ASSIGN_ROLES,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.ACCESS_ADMIN_PANEL,
    PERMISSIONS.MANAGE_BILLING,
  ],
}

// Permission checking functions
export const hasPermission = (userRole: UserRole, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[userRole].includes(permission)
}

export const hasAnyPermission = (userRole: UserRole, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(userRole, permission))
}

export const hasAllPermissions = (userRole: UserRole, permissions: Permission[]): boolean => {
  return permissions.every(permission => hasPermission(userRole, permission))
}

// Role hierarchy (higher roles inherit lower role permissions)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 1,
  moderator: 2,
  admin: 3,
}

export const canManageUser = (managerRole: UserRole, targetRole: UserRole): boolean => {
  return ROLE_HIERARCHY[managerRole] > ROLE_HIERARCHY[targetRole]
}

// Meeting-specific permissions
export const canModerateInMeeting = (userRole: UserRole, isHost: boolean): boolean => {
  return isHost || hasPermission(userRole, PERMISSIONS.MODERATE_MEETING)
}

export const canEndMeeting = (userRole: UserRole, isHost: boolean): boolean => {
  return isHost || hasPermission(userRole, PERMISSIONS.END_MEETING)
}

// UI permission helpers
export const shouldShowAdminPanel = (userRole: UserRole): boolean => {
  return hasPermission(userRole, PERMISSIONS.ACCESS_ADMIN_PANEL)
}

export const shouldShowUserManagement = (userRole: UserRole): boolean => {
  return hasPermission(userRole, PERMISSIONS.VIEW_USERS)
}

export const shouldShowAnalytics = (userRole: UserRole): boolean => {
  return hasPermission(userRole, PERMISSIONS.VIEW_ANALYTICS)
}

// Role display helpers
export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    user: 'User',
    moderator: 'Moderator',
    admin: 'Administrator',
  }
  return roleNames[role]
}

export const getRoleColor = (role: UserRole): string => {
  const roleColors: Record<UserRole, string> = {
    user: 'bg-blue-100 text-blue-800',
    moderator: 'bg-yellow-100 text-yellow-800',
    admin: 'bg-red-100 text-red-800',
  }
  return roleColors[role]
}

export const getRoleDescription = (role: UserRole): string => {
  const descriptions: Record<UserRole, string> = {
    user: 'Can create and join meetings, share content, and participate in discussions.',
    moderator: 'Can moderate meetings, manage participants, and access basic analytics.',
    admin: 'Full access to all features including user management and system settings.',
  }
  return descriptions[role]
}