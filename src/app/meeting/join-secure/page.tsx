'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { meetingService, MeetingAccessRequest } from '@/lib/meeting-service'
import { WaitingRoom } from '@/components/meeting/WaitingRoom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { useToastHelpers } from '@/components/ui/Toast'
import { VideoCameraIcon, LockClosedIcon, UserIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

type JoinState = 'form' | 'waiting' | 'joining' | 'error'

export default function SecureJoinMeetingPage() {
  const [meetingCode, setMeetingCode] = useState('')
  const [password, setPassword] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [joinState, setJoinState] = useState<JoinState>('form')
  const [waitingRoomId, setWaitingRoomId] = useState<string>('')
  const [meetingTitle, setMeetingTitle] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()
  const { user } = useAuth()
  const toast = useToastHelpers()

  const handleJoinMeeting = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!meetingCode.trim()) {
      toast.error('Meeting Code Required', 'Please enter a valid meeting code.')
      return
    }

    if (!user && !guestName.trim()) {
      toast.error('Name Required', 'Please enter your name to join the meeting.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const request: MeetingAccessRequest = {
        meetingCode: meetingCode.trim(),
        password: password.trim() || undefined,
        guestName: !user ? guestName.trim() : undefined,
        guestEmail: !user ? guestEmail.trim() || undefined : undefined,
        userId: user?.id
      }

      const result = await meetingService.requestMeetingAccess(request)

      if (result.success && result.meeting) {
        // Direct access granted - join the meeting
        if (user) {
          await meetingService.joinMeeting(
            result.meeting.id, 
            user.id, 
            user.id === result.meeting.host_id ? 'host' : 'participant'
          )
        }
        
        toast.success('Joining Meeting', 'Welcome! Connecting to the meeting...')
        router.push(`/meeting/${result.meeting.id}`)
        
      } else if (result.requiresWaiting && result.waitingRoomId && result.meeting) {
        // Waiting room required
        setWaitingRoomId(result.waitingRoomId)
        setMeetingTitle(result.meeting.title)
        setJoinState('waiting')
        
      } else {
        // Access denied
        setError(result.error || 'Unable to join meeting')
        setJoinState('error')
        
        if (result.errorCode === 'WRONG_PASSWORD') {
          // Focus password field for retry
          const passwordField = document.getElementById('password') as HTMLInputElement
          passwordField?.focus()
        }
      }
      
    } catch (error) {
      console.error('Failed to join meeting:', error)
      setError('An unexpected error occurred. Please try again.')
      setJoinState('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleWaitingRoomAdmitted = async () => {
    setJoinState('joining')
    
    try {
      // Get the meeting details again and join
      const result = await meetingService.requestMeetingAccess({
        meetingCode: meetingCode.trim(),
        password: password.trim() || undefined,
        guestName: !user ? guestName.trim() : undefined,
        guestEmail: !user ? guestEmail.trim() || undefined : undefined,
        userId: user?.id
      })

      if (result.success && result.meeting) {
        if (user) {
          await meetingService.joinMeeting(
            result.meeting.id, 
            user.id, 
            user.id === result.meeting.host_id ? 'host' : 'participant'
          )
        }
        
        toast.success('Admitted to Meeting', 'You have been admitted! Joining now...')
        router.push(`/meeting/${result.meeting.id}`)
      }
    } catch (error) {
      console.error('Error joining after admission:', error)
      toast.error('Failed to Join', 'There was an error joining the meeting.')
      setJoinState('form')
    }
  }

  const handleWaitingRoomDenied = () => {
    toast.error('Access Denied', 'The host has denied your request to join.')
    setJoinState('form')
  }

  const formatMeetingCode = (value: string) => {
    // Remove all non-alphanumeric characters and convert to uppercase
    const clean = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
    
    // Format as XXX-XXX-XXX for numeric codes or keep as-is for alphanumeric
    if (/^\d+$/.test(clean)) {
      if (clean.length <= 3) {
        return clean
      } else if (clean.length <= 6) {
        return `${clean.slice(0, 3)}-${clean.slice(3)}`
      } else {
        return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6, 9)}`
      }
    }
    
    return clean
  }

  const handleMeetingCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatMeetingCode(e.target.value)
    setMeetingCode(formatted)
  }

  // Show waiting room
  if (joinState === 'waiting') {
    return (
      <WaitingRoom
        waitingRoomId={waitingRoomId}
        meetingTitle={meetingTitle}
        onAdmitted={handleWaitingRoomAdmitted}
        onDenied={handleWaitingRoomDenied}
      />
    )
  }

  // Show joining state
  if (joinState === 'joining') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          <p className="text-gray-600">Joining meeting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-br from-blue-50 via-white to-indigo-50 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center mb-8 space-x-2">
            <VideoCameraIcon className="w-10 h-10 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">Univo</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">
            Join Meeting
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter the meeting code to join securely
          </p>
        </div>

        <Card variant="elevated" className="p-8">
          <CardContent>
            {/* Error Display */}
            {joinState === 'error' && error && (
              <div className="p-4 mb-6 border border-red-200 rounded-lg bg-red-50">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleJoinMeeting} className="space-y-6">
              {/* Meeting Code Input */}
              <div>
                <Input
                  label="Meeting Code"
                  type="text"
                  required
                  placeholder="ABC-123-DEF or 123-456-789"
                  value={meetingCode}
                  onChange={handleMeetingCodeChange}
                  maxLength={11}
                  helperText="Enter the meeting code provided by the host"
                />
              </div>

              {/* Password Input (conditional) */}
              <div>
                <Input
                  id="password"
                  label="Meeting Password (if required)"
                  type="password"
                  placeholder="Enter meeting password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  helperText="Leave blank if the meeting doesn't require a password"
                />
              </div>

              {/* Guest Information (if not logged in) */}
              {!user && (
                <>
                  <div>
                    <Input
                      label="Your Name"
                      type="text"
                      required
                      placeholder="Enter your full name"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      maxLength={50}
                    />
                  </div>

                  <div>
                    <Input
                      label="Email (Optional)"
                      type="email"
                      placeholder="your.email@example.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      helperText="Optional: Provide email for meeting updates"
                    />
                  </div>
                </>
              )}

              {/* Join Button */}
              <Button
                type="submit"
                className="w-full"
                loading={isLoading}
                disabled={isLoading || !meetingCode.trim() || (!user && !guestName.trim())}
              >
                {isLoading ? 'Validating Access...' : 'Join Meeting'}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-gray-500 bg-white">Or</span>
              </div>
            </div>

            {/* Sign In Options */}
            <div className="space-y-3">
              {!user && (
                <>
                  <Link href="/login" className="block">
                    <Button variant="outline" className="w-full">
                      Sign in to your account
                    </Button>
                  </Link>
                  <Link href="/register" className="block">
                    <Button variant="ghost" className="w-full">
                      Create new account
                    </Button>
                  </Link>
                </>
              )}
              
              <Link href="/meeting/join" className="block">
                <Button variant="ghost" className="w-full text-sm">
                  Use legacy join (less secure)
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="p-4">
          <CardContent>
            <h3 className="mb-3 font-medium text-gray-900">🔒 Enhanced Security</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <span className="font-medium text-green-600">✓</span>
                <span>Meeting validation and access control</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-medium text-green-600">✓</span>
                <span>Host approval for secure meetings</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-medium text-green-600">✓</span>
                <span>Password protection support</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-medium text-green-600">✓</span>
                <span>Waiting room for additional security</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By joining, you agree to our{' '}
            <Link href="/terms" className="font-medium text-primary-600 hover:text-primary-500">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="font-medium text-primary-600 hover:text-primary-500">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}