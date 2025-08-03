import { HTMLAttributes } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  fallback?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  status?: 'online' | 'offline' | 'away' | 'busy' | 'in-meeting'
  showStatus?: boolean
  rounded?: boolean
  border?: boolean
  clickable?: boolean
}

export function Avatar({ 
  src,
  alt,
  fallback,
  size = 'md',
  status,
  showStatus = false,
  rounded = true,
  border = false,
  clickable = false,
  className,
  children,
  ...props 
}: AvatarProps) {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  }

  const statusSizes = {
    xs: 'w-2 h-2 -bottom-0 -right-0',
    sm: 'w-2.5 h-2.5 -bottom-0.5 -right-0.5',
    md: 'w-3 h-3 -bottom-0.5 -right-0.5',
    lg: 'w-3.5 h-3.5 -bottom-1 -right-1',
    xl: 'w-4 h-4 -bottom-1 -right-1',
    '2xl': 'w-5 h-5 -bottom-1.5 -right-1.5',
  }

  const statusColors = {
    online: 'bg-success-500',
    offline: 'bg-gray-400',
    away: 'bg-warning-500',
    busy: 'bg-error-500',
    'in-meeting': 'bg-primary-500',
  }

  // Generate initials from fallback text
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div 
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden bg-gray-100',
        sizes[size],
        rounded ? 'rounded-full' : 'rounded-lg',
        border && 'ring-2 ring-white shadow-sm',
        clickable && 'cursor-pointer hover:opacity-80 transition-opacity',
        className
      )}
      {...props}
    >
      {src ? (
        <Image
          src={src}
          alt={alt || 'Avatar'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : fallback ? (
        <span className="font-medium text-gray-600">
          {getInitials(fallback)}
        </span>
      ) : (
        <svg
          className="w-full h-full text-gray-400"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
      
      {children}
      
      {/* Status indicator */}
      {showStatus && status && (
        <span
          className={cn(
            'absolute rounded-full border-2 border-white',
            statusSizes[size],
            statusColors[status]
          )}
        />
      )}
    </div>
  )
}

// Avatar group component for showing multiple users
export interface AvatarGroupProps {
  avatars: Array<{
    src?: string
    alt?: string
    fallback?: string
    status?: 'online' | 'offline' | 'away' | 'busy' | 'in-meeting'
  }>
  max?: number
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  showStatus?: boolean
  className?: string
}

export function AvatarGroup({ 
  avatars, 
  max = 5, 
  size = 'md',
  showStatus = false,
  className 
}: AvatarGroupProps) {
  const displayAvatars = avatars.slice(0, max)
  const remainingCount = avatars.length - max

  return (
    <div className={cn('flex -space-x-2', className)}>
      {displayAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          alt={avatar.alt}
          fallback={avatar.fallback}
          status={avatar.status}
          showStatus={showStatus}
          size={size}
          border
          className="hover:z-10"
        />
      ))}
      
      {remainingCount > 0 && (
        <Avatar
          fallback={`+${remainingCount}`}
          size={size}
          border
          className="text-gray-600 bg-gray-200 hover:z-10"
        />
      )}
    </div>
  )
}