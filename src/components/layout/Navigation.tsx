'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { UserMenu, Button, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  VideoCameraIcon,
  HomeIcon,
  CalendarIcon,
  UsersIcon,
  CogIcon,
  PlusIcon,
  Bars3Icon,
  XMarkIcon,
  AcademicCapIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  roles?: string[]
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
  },
  {
    name: 'Meetings',
    href: '/meetings',
    icon: VideoCameraIcon,
  },
  {
    name: 'Schedule',
    href: '/schedule',
    icon: CalendarIcon,
  },
  {
    name: 'Participants',
    href: '/participants',
    icon: UsersIcon,
  },
  {
    name: 'Education',
    href: '/education',
    icon: AcademicCapIcon,
    roles: ['teacher', 'student', 'admin'],
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: ChartBarIcon,
    roles: ['admin', 'manager'],
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: CogIcon,
  },
]

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, profile, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
  }

  const filteredNavItems = navigationItems.filter(item => {
    if (!item.roles) return true
    return profile?.role && item.roles.includes(profile.role)
  })

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <VideoCameraIcon className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Univo</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {user && (
              <>
                {filteredNavItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors',
                        isActive
                          ? 'text-primary-600 border-b-2 border-primary-600'
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'
                      )}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.name}
                      {item.badge && (
                        <Badge variant="primary" size="sm" className="ml-2">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  )
                })}
              </>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Quick actions */}
                <Link href="/meeting/new">
                  <Button
                    variant="default"
                    size="sm"
                    className="hidden sm:inline-flex"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    New Meeting
                  </Button>
                </Link>

                {/* User menu */}
                <UserMenu
                  user={{
                    name: profile?.full_name || user.email?.split('@')[0] || 'User',
                    email: user.email || '',
                    avatar: profile?.avatar_url || undefined,
                    role: profile?.role || 'user',
                  }}
                  onProfile={() => router.push('/profile')}
                  onSettings={() => router.push('/settings')}
                  onSignOut={handleSignOut}
                />
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Sign In
                </Link>
                <Link href="/register">
                  <Button>Get Started</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 text-gray-400 rounded-md md:hidden hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
            {user && filteredNavItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'block pl-3 pr-4 py-2 text-base font-medium transition-colors',
                    isActive
                      ? 'text-primary-600 bg-primary-50 border-r-4 border-primary-600'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                    {item.badge && (
                      <Badge variant="primary" size="sm" className="ml-2">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                </Link>
              )
            })}
            
            {user && (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <Link href="/meeting/new" className="mx-3">
                  <Button
                    variant="default"
                    className="w-auto"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    New Meeting
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}