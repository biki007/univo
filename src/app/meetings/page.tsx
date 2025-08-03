'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/layout/Navigation'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from '@/components/ui'
import {
  VideoCameraIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PlayIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

interface Meeting {
  id: string
  title: string
  description?: string
  scheduled_at?: string
  status: 'scheduled' | 'active' | 'ended' | 'cancelled'
  participants_count: number
  duration?: string
  meeting_code: string
}

// Mock data for demonstration
const mockMeetings: Meeting[] = [
  {
    id: '1',
    title: 'Team Standup',
    description: 'Daily team synchronization meeting',
    scheduled_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    status: 'scheduled',
    participants_count: 8,
    meeting_code: 'TEAM-001'
  },
  {
    id: '2',
    title: 'Project Review',
    description: 'Quarterly project review and planning',
    scheduled_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    status: 'active',
    participants_count: 12,
    meeting_code: 'PROJ-002'
  },
  {
    id: '3',
    title: 'Client Presentation',
    description: 'Product demo for potential client',
    scheduled_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    status: 'ended',
    participants_count: 5,
    duration: '45 minutes',
    meeting_code: 'CLIENT-003'
  },
  {
    id: '4',
    title: 'Training Session',
    description: 'New employee onboarding training',
    scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    status: 'scheduled',
    participants_count: 15,
    meeting_code: 'TRAIN-004'
  }
]

export default function MeetingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [meetings, setMeetings] = useState<Meeting[]>(mockMeetings)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

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

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || meeting.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit'
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'scheduled': return 'primary'
      case 'ended': return 'secondary'
      case 'cancelled': return 'error'
      default: return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <PlayIcon className="w-4 h-4" />
      case 'scheduled': return <CalendarIcon className="w-4 h-4" />
      case 'ended': return <EyeIcon className="w-4 h-4" />
      default: return <ClockIcon className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meetings</h1>
            <p className="mt-2 text-gray-600">
              Manage your meetings and join ongoing sessions
            </p>
          </div>
          <Button onClick={() => router.push('/meeting/new')}>
            <PlusIcon className="w-4 h-4 mr-2" />
            New Meeting
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <Input
                placeholder="Search meetings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Filter meetings by status"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="ended">Ended</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Meetings Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMeetings.map((meeting) => {
            const dateTime = meeting.scheduled_at ? formatDateTime(meeting.scheduled_at) : null
            
            return (
              <Card key={meeting.id} className="transition-shadow hover:shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{meeting.title}</CardTitle>
                      {meeting.description && (
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                          {meeting.description}
                        </p>
                      )}
                    </div>
                    <Badge variant={getStatusColor(meeting.status)} className="ml-2">
                      {getStatusIcon(meeting.status)}
                      <span className="ml-1 capitalize">{meeting.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Meeting Details */}
                  <div className="space-y-2">
                    {dateTime && (
                      <div className="flex items-center text-sm text-gray-600">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        <span>{dateTime.date} at {dateTime.time}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <UserGroupIcon className="w-4 h-4 mr-2" />
                      <span>{meeting.participants_count} participants</span>
                    </div>
                    
                    {meeting.duration && (
                      <div className="flex items-center text-sm text-gray-600">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        <span>{meeting.duration}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="px-2 py-1 font-mono text-xs bg-gray-100 rounded">
                        {meeting.meeting_code}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex pt-2 space-x-2">
                    {meeting.status === 'active' && (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => router.push(`/meeting/${meeting.meeting_code}`)}
                      >
                        <VideoCameraIcon className="w-4 h-4 mr-2" />
                        Join
                      </Button>
                    )}
                    
                    {meeting.status === 'scheduled' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => router.push(`/meeting/${meeting.meeting_code}`)}
                      >
                        <VideoCameraIcon className="w-4 h-4 mr-2" />
                        Start
                      </Button>
                    )}
                    
                    {meeting.status === 'ended' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                      >
                        <EyeIcon className="w-4 h-4 mr-2" />
                        View Recording
                      </Button>
                    )}
                    
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredMeetings.length === 0 && (
          <div className="py-12 text-center">
            <VideoCameraIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">No meetings found</h3>
            <p className="mb-4 text-gray-600">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by creating your first meeting'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <Button onClick={() => router.push('/meeting/new')}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Meeting
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}