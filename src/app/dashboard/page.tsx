'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Navigation } from '@/components/layout/Navigation'
import { Card, CardContent, Avatar, Badge } from '@/components/ui'
import {
  VideoCameraIcon,
  CalendarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const quickActions = [
    {
      title: 'Start Instant Meeting',
      description: 'Begin a meeting right now',
      icon: <VideoCameraIcon className="w-6 h-6" />,
      href: '/meeting/demo-room-123',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'Schedule Meeting',
      description: 'Plan a meeting for later',
      icon: <CalendarIcon className="w-6 h-6" />,
      href: '#',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'Join Meeting',
      description: 'Enter with meeting code',
      icon: <UserGroupIcon className="w-6 h-6" />,
      href: '/meeting/join-secure',
      color: 'bg-purple-600 hover:bg-purple-700'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Main Content */}
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold text-gray-900">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}!
          </h2>
          <p className="text-gray-600">
            Ready to connect with your team? Start or join a meeting below.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Card className="h-full transition-shadow cursor-pointer hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg text-white ${action.color}`}>
                      {action.icon}
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold text-gray-900">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Meetings */}
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Recent Meetings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <VideoCameraIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Team Standup</h4>
                    <p className="text-sm text-gray-600">2 hours ago • 15 minutes</p>
                  </div>
                </div>
                <Badge variant="secondary">Ended</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CalendarIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Project Review</h4>
                    <p className="text-sm text-gray-600">Tomorrow • 2:00 PM</p>
                  </div>
                </div>
                <Badge variant="primary">Scheduled</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Info */}
        <div className="p-4 mt-8 rounded-lg bg-blue-50">
          <h3 className="mb-2 font-medium text-blue-900">🚀 Demo Mode Active</h3>
          <p className="text-sm text-blue-800">
            You&apos;re logged in as <strong>{profile?.full_name}</strong> ({profile?.role}). 
            Click &quot;Start Instant Meeting&quot; to test the meeting room interface.
          </p>
        </div>
      </div>
    </div>
  )
}