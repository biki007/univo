'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/layout/Navigation'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui'
import {
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline'

interface ScheduledMeeting {
  id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  participants: string[]
  meeting_code: string
  status: 'upcoming' | 'ongoing' | 'completed'
}

// Mock data for demonstration
const mockScheduledMeetings: ScheduledMeeting[] = [
  {
    id: '1',
    title: 'Team Standup',
    description: 'Daily team synchronization',
    start_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString(),
    participants: ['john@example.com', 'jane@example.com', 'bob@example.com'],
    meeting_code: 'STANDUP-001',
    status: 'upcoming'
  },
  {
    id: '2',
    title: 'Project Review',
    description: 'Weekly project status review',
    start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
    participants: ['alice@example.com', 'charlie@example.com'],
    meeting_code: 'REVIEW-002',
    status: 'upcoming'
  },
  {
    id: '3',
    title: 'Client Demo',
    description: 'Product demonstration for client',
    start_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    participants: ['client@company.com', 'sales@example.com'],
    meeting_code: 'DEMO-003',
    status: 'upcoming'
  }
]

export default function SchedulePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [meetings, setMeetings] = useState<ScheduledMeeting[]>(mockScheduledMeetings)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week')

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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDuration = (start: string, end: string) => {
    const startTime = new Date(start)
    const endTime = new Date(end)
    const diffMs = endTime.getTime() - startTime.getTime()
    const diffMins = Math.round(diffMs / (1000 * 60))
    
    if (diffMins < 60) {
      return `${diffMins}m`
    } else {
      const hours = Math.floor(diffMins / 60)
      const mins = diffMins % 60
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing': return 'success'
      case 'upcoming': return 'primary'
      case 'completed': return 'secondary'
      default: return 'secondary'
    }
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    }
    setCurrentDate(newDate)
  }

  const getDateRangeText = () => {
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    } else {
      return currentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      })
    }
  }

  const isToday = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const sortedMeetings = meetings.sort((a, b) => 
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
            <p className="mt-2 text-gray-600">
              Manage your upcoming meetings and events
            </p>
          </div>
          <Button onClick={() => router.push('/meeting/new')}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Schedule Meeting
          </Button>
        </div>

        {/* Calendar Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateDate('prev')}
                className="p-2 text-gray-400 rounded-lg hover:text-gray-600 hover:bg-gray-100"
                aria-label="Previous period"
                title="Previous period"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold text-center text-gray-900 min-w-64">
                {getDateRangeText()}
              </h2>
              <button
                onClick={() => navigateDate('next')}
                className="p-2 text-gray-400 rounded-lg hover:text-gray-600 hover:bg-gray-100"
                aria-label="Next period"
                title="Next period"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            {(['day', 'week', 'month'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  viewMode === mode
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Meetings List */}
        <div className="space-y-4">
          {sortedMeetings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">No meetings scheduled</h3>
                <p className="mb-4 text-gray-600">
                  You don&apos;t have any meetings scheduled for this period.
                </p>
                <Button onClick={() => router.push('/meeting/new')}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Schedule Your First Meeting
                </Button>
              </CardContent>
            </Card>
          ) : (
            sortedMeetings.map((meeting) => (
              <Card key={meeting.id} className="transition-shadow hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2 space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {meeting.title}
                        </h3>
                        <Badge variant={getStatusColor(meeting.status)}>
                          {meeting.status}
                        </Badge>
                        {isToday(meeting.start_time) && (
                          <Badge variant="warning">Today</Badge>
                        )}
                      </div>
                      
                      {meeting.description && (
                        <p className="mb-3 text-gray-600">{meeting.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          <span>{formatDate(meeting.start_time)}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-2" />
                          <span>
                            {formatTime(meeting.start_time)} - {formatTime(meeting.end_time)}
                            <span className="ml-2 text-gray-500">
                              ({getDuration(meeting.start_time, meeting.end_time)})
                            </span>
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <UserGroupIcon className="w-4 h-4 mr-2" />
                          <span>{meeting.participants.length} participants</span>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <span className="px-2 py-1 font-mono text-xs bg-gray-100 rounded">
                          {meeting.meeting_code}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex ml-4 space-x-2">
                      {meeting.status === 'upcoming' && (
                        <Button
                          size="sm"
                          onClick={() => router.push(`/meeting/${meeting.meeting_code}`)}
                        >
                          <VideoCameraIcon className="w-4 h-4 mr-2" />
                          Join
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}