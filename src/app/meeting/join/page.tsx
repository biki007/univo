'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useToastHelpers } from '@/components/ui/Toast'
import { VideoCameraIcon, UserIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

export default function JoinMeetingPage() {
  const [meetingId, setMeetingId] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const router = useRouter()
  const toast = useToastHelpers()

  const handleJoinMeeting = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!meetingId.trim()) {
      toast.error('Meeting ID Required', 'Please enter a valid meeting ID.')
      return
    }

    if (!guestName.trim()) {
      toast.error('Name Required', 'Please enter your name to join the meeting.')
      return
    }

    setIsJoining(true)

    try {
      // Validate meeting ID format (basic validation)
      const cleanMeetingId = meetingId.replace(/\s+/g, '').replace(/-/g, '')
      
      if (cleanMeetingId.length < 9) {
        throw new Error('Invalid meeting ID format')
      }

      // In a real implementation, you would:
      // 1. Validate the meeting ID exists
      // 2. Check if the meeting is active
      // 3. Create a guest session
      // 4. Store guest info in session/localStorage

      // Store guest information for the meeting
      const guestInfo = {
        name: guestName.trim(),
        email: guestEmail.trim() || undefined,
        isGuest: true,
        joinedAt: new Date().toISOString(),
      }

      localStorage.setItem('guestInfo', JSON.stringify(guestInfo))
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Joining Meeting', `Welcome ${guestName}! Connecting to the meeting...`)
      
      // Navigate to the meeting room
      router.push(`/meeting/${cleanMeetingId}?guest=true`)
      
    } catch (error) {
      console.error('Failed to join meeting:', error)
      toast.error('Failed to Join', 'Please check the meeting ID and try again.')
    } finally {
      setIsJoining(false)
    }
  }

  const formatMeetingId = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '')
    
    // Format as XXX-XXX-XXX
    if (numbers.length <= 3) {
      return numbers
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 9)}`
    }
  }

  const handleMeetingIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatMeetingId(e.target.value)
    setMeetingId(formatted)
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
            Enter the meeting ID to join as a guest
          </p>
        </div>

        <Card variant="elevated" className="p-8">
          <CardContent>
            <form onSubmit={handleJoinMeeting} className="space-y-6">
              {/* Meeting ID Input */}
              <div>
                <Input
                  label="Meeting ID"
                  type="text"
                  required
                  placeholder="123-456-789"
                  value={meetingId}
                  onChange={handleMeetingIdChange}
                  maxLength={11} // XXX-XXX-XXX format
                  helperText="Enter the 9-digit meeting ID provided by the host"
                />
              </div>

              {/* Guest Name Input */}
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

              {/* Optional Email Input */}
              <div>
                <Input
                  label="Email (Optional)"
                  type="email"
                  placeholder="your.email@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  helperText="Optional: Provide email to receive meeting updates"
                />
              </div>

              {/* Join Button */}
              <Button
                type="submit"
                className="w-full"
                loading={isJoining}
                disabled={isJoining || !meetingId.trim() || !guestName.trim()}
              >
                {isJoining ? 'Joining Meeting...' : 'Join Meeting'}
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
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="p-4">
          <CardContent>
            <h3 className="mb-3 font-medium text-gray-900">Need help joining?</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <span className="font-medium text-primary-600">1.</span>
                <span>Get the meeting ID from the meeting host or invitation</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-medium text-primary-600">2.</span>
                <span>Enter your name so others can identify you</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-medium text-primary-600">3.</span>
                <span>Click &quot;Join Meeting&quot; to connect</span>
              </div>
            </div>
            
            <div className="p-3 mt-4 rounded-lg bg-blue-50">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> For the best experience, use a modern browser with camera and microphone permissions enabled.
              </p>
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