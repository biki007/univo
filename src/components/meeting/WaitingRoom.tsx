'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { meetingService, WaitingRoomStatus } from '@/lib/meeting-service'
import {
  ClockIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface WaitingRoomProps {
  waitingRoomId: string
  meetingTitle: string
  onAdmitted: () => void
  onDenied: () => void
}

export function WaitingRoom({ waitingRoomId, meetingTitle, onAdmitted, onDenied }: WaitingRoomProps) {
  const [status, setStatus] = useState<WaitingRoomStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    
    const checkStatus = async () => {
      try {
        const waitingStatus = await meetingService.getWaitingRoomStatus(waitingRoomId)
        
        if (!isMounted) return
        
        setStatus(waitingStatus)
        
        if (waitingStatus?.status === 'admitted') {
          onAdmitted()
        } else if (waitingStatus?.status === 'denied') {
          onDenied()
        }
      } catch (error) {
        console.error('Error checking waiting room status:', error)
        if (isMounted) {
          setStatus(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    checkStatus()
    
    // Poll for status updates every 3 seconds
    const interval = setInterval(checkStatus, 3000)
    
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [waitingRoomId, onAdmitted, onDenied])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          <p className="text-gray-600">Checking meeting status...</p>
        </div>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Unable to Join Meeting
            </h2>
            <p className="text-gray-600">
              There was an error processing your request. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status.status === 'denied') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <XCircleIcon className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Access Denied
            </h2>
            <p className="text-gray-600">
              The meeting host has denied your request to join this meeting.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              <ClockIcon className="absolute w-8 h-8 text-blue-600 inset-2" />
            </div>
            
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Waiting for Host Approval
            </h2>
            
            <p className="mb-6 text-gray-600">
              You&apos;re in the waiting room for <strong>{meetingTitle}</strong>.
              The host will admit you shortly.
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center space-x-2">
                  <UserGroupIcon className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">Position in queue</span>
                </div>
                <Badge variant="secondary">#{status.position}</Badge>
              </div>

              {status.estimatedWaitTime && status.estimatedWaitTime > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-600">Estimated wait</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    ~{Math.ceil(status.estimatedWaitTime / 60)} min
                  </span>
                </div>
              )}
            </div>

            <div className="p-4 mt-6 rounded-lg bg-blue-50">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Keep this tab open. You&apos;ll be automatically
                admitted when the host approves your request.
              </p>
            </div>

            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => window.history.back()}
            >
              Leave Waiting Room
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface HostWaitingRoomControlsProps {
  meetingId: string
  hostId: string
  onParticipantUpdate: () => void
}

export function HostWaitingRoomControls({ 
  meetingId, 
  hostId, 
  onParticipantUpdate 
}: HostWaitingRoomControlsProps) {
  const [waitingParticipants, setWaitingParticipants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    
    const fetchWaitingParticipants = async () => {
      try {
        const participants = await meetingService.getWaitingRoomParticipants(meetingId, hostId)
        
        if (!isMounted) return
        
        setWaitingParticipants(participants)
      } catch (error) {
        console.error('Error fetching waiting participants:', error)
        if (isMounted) {
          setWaitingParticipants([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchWaitingParticipants()
    
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchWaitingParticipants, 5000)
    
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [meetingId, hostId])

  const handleAdmit = async (waitingRoomId: string) => {
    try {
      const success = await meetingService.respondToWaitingRoomRequest(waitingRoomId, hostId, 'admit')
      
      if (success) {
        setWaitingParticipants(prev =>
          prev.filter(p => p.id !== waitingRoomId)
        )
        onParticipantUpdate()
      } else {
        console.error('Failed to admit participant - unauthorized or not found')
      }
    } catch (error) {
      console.error('Error admitting participant:', error)
    }
  }

  const handleDeny = async (waitingRoomId: string) => {
    try {
      const success = await meetingService.respondToWaitingRoomRequest(waitingRoomId, hostId, 'deny')
      
      if (success) {
        setWaitingParticipants(prev =>
          prev.filter(p => p.id !== waitingRoomId)
        )
      } else {
        console.error('Failed to deny participant - unauthorized or not found')
      }
    } catch (error) {
      console.error('Error denying participant:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="w-1/4 h-4 mb-4 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (waitingParticipants.length === 0) {
    return null
  }

  return (
    <div className="p-4 border-t border-gray-200">
      <h3 className="mb-4 text-sm font-medium text-gray-900">
        Waiting Room ({waitingParticipants.length})
      </h3>
      
      <div className="space-y-3">
        {waitingParticipants.map((participant) => (
          <div key={participant.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
            <div className="flex items-center space-x-3">
              <Avatar
                src={participant.profiles?.avatar_url}
                fallback={participant.guest_name || participant.profiles?.full_name || 'Guest'}
                size="sm"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {participant.guest_name || participant.profiles?.full_name || 'Guest User'}
                </p>
                <p className="text-xs text-gray-500">
                  Waiting since {new Date(participant.requested_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDeny(participant.id)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Deny
              </Button>
              <Button
                size="sm"
                onClick={() => handleAdmit(participant.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                Admit
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}