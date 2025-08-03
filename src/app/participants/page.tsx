'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/layout/Navigation'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input, Avatar } from '@/components/ui'
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
  EnvelopeIcon,
  PhoneIcon,
  VideoCameraIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline'

interface Participant {
  id: string
  name: string
  email: string
  avatar_url?: string
  role: 'admin' | 'moderator' | 'user'
  status: 'online' | 'offline' | 'in_meeting'
  last_seen?: string
  meetings_attended: number
  department?: string
}

// Mock data for demonstration
const mockParticipants: Participant[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    status: 'online',
    meetings_attended: 45,
    department: 'Engineering'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'moderator',
    status: 'in_meeting',
    meetings_attended: 32,
    department: 'Marketing'
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'user',
    status: 'offline',
    last_seen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    meetings_attended: 18,
    department: 'Sales'
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice@example.com',
    role: 'user',
    status: 'online',
    meetings_attended: 28,
    department: 'Design'
  },
  {
    id: '5',
    name: 'Charlie Wilson',
    email: 'charlie@example.com',
    role: 'moderator',
    status: 'offline',
    last_seen: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    meetings_attended: 41,
    department: 'Engineering'
  }
]

export default function ParticipantsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [participants, setParticipants] = useState<Participant[]>(mockParticipants)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterRole, setFilterRole] = useState<string>('all')

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

  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant.department?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || participant.status === filterStatus
    const matchesRole = filterRole === 'all' || participant.role === filterRole
    return matchesSearch && matchesStatus && matchesRole
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'success'
      case 'in_meeting': return 'warning'
      case 'offline': return 'secondary'
      default: return 'secondary'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error'
      case 'moderator': return 'primary'
      case 'user': return 'secondary'
      default: return 'secondary'
    }
  }

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) {
      return 'Less than an hour ago'
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    }
  }

  const totalParticipants = participants.length
  const onlineParticipants = participants.filter(p => p.status === 'online').length
  const inMeetingParticipants = participants.filter(p => p.status === 'in_meeting').length

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Participants</h1>
            <p className="mt-2 text-gray-600">
              Manage and connect with meeting participants
            </p>
          </div>
          <Button>
            <UserPlusIcon className="w-4 h-4 mr-2" />
            Invite Participants
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <UserGroupIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Participants</p>
                  <p className="text-2xl font-bold text-gray-900">{totalParticipants}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Online Now</p>
                  <p className="text-2xl font-bold text-gray-900">{onlineParticipants}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <VideoCameraIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Meetings</p>
                  <p className="text-2xl font-bold text-gray-900">{inMeetingParticipants}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <Input
              placeholder="Search participants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex space-x-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="in_meeting">In Meeting</option>
              <option value="offline">Offline</option>
            </select>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Filter by role"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>

        {/* Participants List */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredParticipants.map((participant) => (
            <Card key={participant.id} className="transition-shadow hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <Avatar
                      src={participant.avatar_url}
                      fallback={participant.name.charAt(0)}
                      size="md"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      participant.status === 'online' ? 'bg-green-500' :
                      participant.status === 'in_meeting' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {participant.name}
                      </h3>
                      <Badge variant={getRoleColor(participant.role)} size="sm">
                        {participant.role}
                      </Badge>
                    </div>
                    
                    <p className="mb-2 text-sm text-gray-600 truncate">{participant.email}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant={getStatusColor(participant.status)} size="sm">
                        {participant.status.replace('_', ' ')}
                      </Badge>
                      {participant.department && (
                        <span className="text-xs text-gray-500">{participant.department}</span>
                      )}
                    </div>
                    
                    <div className="mb-3 text-xs text-gray-500">
                      {participant.status === 'offline' && participant.last_seen ? (
                        <span>Last seen: {formatLastSeen(participant.last_seen)}</span>
                      ) : participant.status === 'online' ? (
                        <span>Online now</span>
                      ) : (
                        <span>Currently in a meeting</span>
                      )}
                    </div>
                    
                    <div className="mb-4 text-xs text-gray-500">
                      {participant.meetings_attended} meetings attended
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <EnvelopeIcon className="w-4 h-4 mr-1" />
                        Email
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <ChatBubbleLeftIcon className="w-4 h-4 mr-1" />
                        Chat
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredParticipants.length === 0 && (
          <div className="py-12 text-center">
            <UserGroupIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">No participants found</h3>
            <p className="mb-4 text-gray-600">
              {searchTerm || filterStatus !== 'all' || filterRole !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No participants have been added yet'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && filterRole === 'all' && (
              <Button>
                <UserPlusIcon className="w-4 h-4 mr-2" />
                Invite First Participant
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}