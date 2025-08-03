'use client'

import { ReactNode, useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface DropdownProps {
  trigger: ReactNode
  children: ReactNode
  align?: 'left' | 'right' | 'center'
  side?: 'bottom' | 'top'
  className?: string
  contentClassName?: string
  disabled?: boolean
}

export function Dropdown({
  trigger,
  children,
  align = 'left',
  side = 'bottom',
  className,
  contentClassName,
  disabled = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const alignmentClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 transform -translate-x-1/2',
  }

  const sideClasses = {
    bottom: 'top-full mt-2',
    top: 'bottom-full mb-2',
  }

  return (
    <div className={cn('relative inline-block', className)} ref={dropdownRef}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          'cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 min-w-48 bg-white border border-gray-200 rounded-lg shadow-lg animate-fade-in',
            alignmentClasses[align],
            sideClasses[side],
            contentClassName
          )}
        >
          {children}
        </div>
      )}
    </div>
  )
}

// Dropdown item components
export interface DropdownItemProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  destructive?: boolean
  className?: string
}

export function DropdownItem({
  children,
  onClick,
  disabled = false,
  destructive = false,
  className,
}: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none first:rounded-t-lg last:rounded-b-lg',
        destructive && 'text-red-600 hover:bg-red-50 focus:bg-red-50',
        disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent',
        className
      )}
    >
      {children}
    </button>
  )
}

export function DropdownSeparator({ className }: { className?: string }) {
  return <div className={cn('my-1 border-t border-gray-200', className)} />
}

export function DropdownLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider', className)}>
      {children}
    </div>
  )
}

// User menu dropdown component
export interface UserMenuProps {
  user: {
    name: string
    email: string
    avatar?: string
    role?: string
  }
  onProfile?: () => void
  onSettings?: () => void
  onSignOut?: () => void
}

export function UserMenu({ user, onProfile, onSettings, onSignOut }: UserMenuProps) {
  return (
    <Dropdown
      trigger={
        <div className="flex items-center p-2 space-x-2 transition-colors rounded-lg cursor-pointer hover:bg-gray-100">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100">
            {user.avatar ? (
              <div className="relative w-full h-full overflow-hidden rounded-full">
                <Image
                  src={user.avatar}
                  alt={user.name}
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              </div>
            ) : (
              <span className="text-sm font-medium text-primary-600">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="hidden text-left md:block">
            <div className="text-sm font-medium text-gray-900">{user.name}</div>
            <div className="text-xs text-gray-500">{user.role}</div>
          </div>
        </div>
      }
      align="right"
    >
      <div className="p-3 border-b border-gray-200">
        <div className="text-sm font-medium text-gray-900">{user.name}</div>
        <div className="text-xs text-gray-500">{user.email}</div>
      </div>
      
      <DropdownItem onClick={onProfile}>
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Profile</span>
        </div>
      </DropdownItem>
      
      <DropdownItem onClick={onSettings}>
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Settings</span>
        </div>
      </DropdownItem>
      
      <DropdownSeparator />
      
      <DropdownItem onClick={onSignOut} destructive>
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Sign Out</span>
        </div>
      </DropdownItem>
    </Dropdown>
  )
}