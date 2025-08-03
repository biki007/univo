import { ReactNode, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  rounded?: boolean
  dot?: boolean
}

export function Badge({ 
  children, 
  className, 
  variant = 'default',
  size = 'md',
  rounded = false,
  dot = false,
  ...props 
}: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    primary: 'bg-primary-100 text-primary-800 border-primary-200',
    secondary: 'bg-secondary-100 text-secondary-800 border-secondary-200',
    success: 'bg-success-100 text-success-800 border-success-200',
    warning: 'bg-warning-100 text-warning-800 border-warning-200',
    error: 'bg-error-100 text-error-800 border-error-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  }

  const dotColors = {
    default: 'bg-gray-400',
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
    info: 'bg-blue-500',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border',
        rounded ? 'rounded-full' : 'rounded-md',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span 
          className={cn(
            'w-2 h-2 rounded-full mr-1.5',
            dotColors[variant]
          )}
        />
      )}
      {children}
    </span>
  )
}

// Predefined role badges
export function RoleBadge({ role }: { role: 'admin' | 'teacher' | 'student' | 'manager' | 'guest' | 'user' }) {
  const roleConfig = {
    admin: { variant: 'error' as const, label: 'Admin' },
    teacher: { variant: 'primary' as const, label: 'Teacher' },
    student: { variant: 'info' as const, label: 'Student' },
    manager: { variant: 'warning' as const, label: 'Manager' },
    guest: { variant: 'secondary' as const, label: 'Guest' },
    user: { variant: 'default' as const, label: 'User' },
  }

  const config = roleConfig[role]
  
  return (
    <Badge variant={config.variant} size="sm" rounded>
      {config.label}
    </Badge>
  )
}

// Status badges
export function StatusBadge({ 
  status 
}: { 
  status: 'online' | 'offline' | 'away' | 'busy' | 'in-meeting' 
}) {
  const statusConfig = {
    online: { variant: 'success' as const, label: 'Online', dot: true },
    offline: { variant: 'secondary' as const, label: 'Offline', dot: true },
    away: { variant: 'warning' as const, label: 'Away', dot: true },
    busy: { variant: 'error' as const, label: 'Busy', dot: true },
    'in-meeting': { variant: 'primary' as const, label: 'In Meeting', dot: true },
  }

  const config = statusConfig[status]
  
  return (
    <Badge variant={config.variant} size="sm" rounded dot={config.dot}>
      {config.label}
    </Badge>
  )
}