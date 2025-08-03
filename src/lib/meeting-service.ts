import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'

type Meeting = Database['public']['Tables']['meetings']['Row']

export interface MeetingAccessRequest {
  meetingCode: string
  password?: string
  guestName?: string
  guestEmail?: string
  userId?: string
}

export interface MeetingAccessResult {
  success: boolean
  meeting?: Meeting
  requiresWaiting?: boolean
  waitingRoomId?: string
  error?: string
  errorCode?: 'INVALID_CODE' | 'WRONG_PASSWORD' | 'MEETING_ENDED' | 'CAPACITY_FULL' | 'ACCESS_DENIED'
}

export interface WaitingRoomStatus {
  id: string
  status: 'waiting' | 'admitted' | 'denied' | 'left'
  position: number
  estimatedWaitTime?: number
}

class MeetingService {
  /**
   * Validate meeting access and determine if user can join directly or needs approval
   */
  async requestMeetingAccess(request: MeetingAccessRequest): Promise<MeetingAccessResult> {
    try {
      // 1. Find meeting by code
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .select('*')
        .eq('meeting_code', request.meetingCode)
        .single()

      if (meetingError || !meeting) {
        await this.logAccessAttempt(null, request.userId, request.guestName, 'join_attempt', 'Invalid meeting code')
        return {
          success: false,
          error: 'Meeting not found',
          errorCode: 'INVALID_CODE'
        }
      }

      // 2. Check if meeting is active
      if (meeting.status === 'ended' || meeting.status === 'cancelled') {
        await this.logAccessAttempt(meeting.id, request.userId, request.guestName, 'join_denied', 'Meeting has ended')
        return {
          success: false,
          error: 'This meeting has ended',
          errorCode: 'MEETING_ENDED'
        }
      }

      // 3. Check capacity
      const { count: participantCount } = await supabase
        .from('meeting_participants')
        .select('*', { count: 'exact', head: true })
        .eq('meeting_id', meeting.id)
        .is('left_at', null)

      if (participantCount && participantCount >= meeting.max_participants) {
        await this.logAccessAttempt(meeting.id, request.userId, request.guestName, 'join_denied', 'Meeting at capacity')
        return {
          success: false,
          error: 'Meeting is at full capacity',
          errorCode: 'CAPACITY_FULL'
        }
      }

      // 4. Check if user is the host
      if (request.userId === meeting.host_id) {
        await this.logAccessAttempt(meeting.id, request.userId, request.guestName, 'join_success', 'Host joined')
        return {
          success: true,
          meeting
        }
      }

      // 5. Validate password if required
      if (meeting.password_hash && request.password) {
        const isValidPassword = await this.validatePassword(request.password, meeting.password_hash)
        if (!isValidPassword) {
          await this.logAccessAttempt(meeting.id, request.userId, request.guestName, 'join_denied', 'Wrong password')
          return {
            success: false,
            error: 'Incorrect meeting password',
            errorCode: 'WRONG_PASSWORD'
          }
        }
      } else if (meeting.password_hash) {
        return {
          success: false,
          error: 'Meeting password required',
          errorCode: 'WRONG_PASSWORD'
        }
      }

      // 6. Check guest access
      if (!request.userId && !meeting.allow_guests) {
        await this.logAccessAttempt(meeting.id, request.userId, request.guestName, 'join_denied', 'Guests not allowed')
        return {
          success: false,
          error: 'Guest access is not allowed for this meeting',
          errorCode: 'ACCESS_DENIED'
        }
      }

      // 7. Check waiting room requirements
      const needsWaitingRoom = this.requiresWaitingRoom(meeting, request.userId)
      
      if (needsWaitingRoom) {
        const waitingRoomId = await this.addToWaitingRoom(meeting.id, request.userId, request.guestName, request.guestEmail)
        await this.logAccessAttempt(meeting.id, request.userId, request.guestName, 'join_attempt', 'Added to waiting room')
        
        return {
          success: false,
          requiresWaiting: true,
          waitingRoomId,
          meeting,
          error: 'Please wait for the host to admit you'
        }
      }

      // 8. Direct access granted
      await this.logAccessAttempt(meeting.id, request.userId, request.guestName, 'join_success', 'Direct access granted')
      return {
        success: true,
        meeting
      }

    } catch (error) {
      console.error('Meeting access error:', error)
      return {
        success: false,
        error: 'An error occurred while joining the meeting'
      }
    }
  }

  /**
   * Check if user requires waiting room approval
   */
  private requiresWaitingRoom(meeting: Meeting, userId?: string): boolean {
    // Host never needs waiting room
    if (userId === meeting.host_id) return false

    // If waiting room is disabled, no waiting required
    if (!meeting.waiting_room_enabled) return false

    // Parse meeting settings
    const settings = meeting.settings as any || {}

    // If auto-admit registered users is enabled and user is registered
    if (settings.auto_admit_registered_users && userId) return false

    // Otherwise, waiting room is required
    return true
  }

  /**
   * Add participant to waiting room
   */
  private async addToWaitingRoom(
    meetingId: string, 
    userId?: string, 
    guestName?: string, 
    guestEmail?: string
  ): Promise<string> {
    const { data, error } = await supabase
      .from('waiting_room_participants')
      .insert({
        meeting_id: meetingId,
        user_id: userId,
        guest_name: guestName,
        guest_email: guestEmail,
        status: 'waiting'
      })
      .select('id')
      .single()

    if (error) throw error
    return data.id
  }

  /**
   * Get waiting room status for a participant
   */
  async getWaitingRoomStatus(waitingRoomId: string): Promise<WaitingRoomStatus | null> {
    const { data, error } = await supabase
      .from('waiting_room_participants')
      .select('*')
      .eq('id', waitingRoomId)
      .single()

    if (error || !data) return null

    // Get position in queue
    const { count } = await supabase
      .from('waiting_room_participants')
      .select('*', { count: 'exact', head: true })
      .eq('meeting_id', data.meeting_id)
      .eq('status', 'waiting')
      .lt('requested_at', data.requested_at)

    return {
      id: data.id,
      status: data.status as any,
      position: (count || 0) + 1,
      estimatedWaitTime: (count || 0) * 30 // Rough estimate: 30 seconds per person
    }
  }

  /**
   * Host admits or denies waiting room participant
   */
  async respondToWaitingRoomRequest(
    waitingRoomId: string, 
    hostId: string, 
    action: 'admit' | 'deny'
  ): Promise<boolean> {
    try {
      // Verify host permission
      const { data: waitingParticipant } = await supabase
        .from('waiting_room_participants')
        .select('meeting_id, meetings!inner(host_id)')
        .eq('id', waitingRoomId)
        .single()

      if (!waitingParticipant || (waitingParticipant.meetings as any).host_id !== hostId) {
        return false
      }

      // Update status
      const { error } = await supabase
        .from('waiting_room_participants')
        .update({
          status: action === 'admit' ? 'admitted' : 'denied',
          responded_at: new Date().toISOString(),
          responded_by: hostId
        })
        .eq('id', waitingRoomId)

      return !error
    } catch (error) {
      console.error('Error responding to waiting room request:', error)
      return false
    }
  }

  /**
   * Get all waiting room participants for a meeting (host view)
   */
  async getWaitingRoomParticipants(meetingId: string, hostId: string) {
    // Verify host permission
    const { data: meeting } = await supabase
      .from('meetings')
      .select('host_id')
      .eq('id', meetingId)
      .single()

    if (!meeting || meeting.host_id !== hostId) {
      throw new Error('Unauthorized')
    }

    const { data, error } = await supabase
      .from('waiting_room_participants')
      .select(`
        *,
        profiles(full_name, avatar_url)
      `)
      .eq('meeting_id', meetingId)
      .eq('status', 'waiting')
      .order('requested_at', { ascending: true })

    if (error) throw error
    return data
  }

  /**
   * Validate meeting password
   */
  private async validatePassword(password: string, hash: string): Promise<boolean> {
    try {
      // TODO: Implement proper password hashing with bcrypt or similar
      // For demo purposes, we'll use a simple hash comparison
      // In production, this should use bcrypt.compare(password, hash)
      
      // Simple hash for demo - replace with proper bcrypt in production
      if (typeof window !== 'undefined') {
        // Client-side: use Web Crypto API
        const encoder = new TextEncoder()
        const data = encoder.encode(password)
        const hashBuffer = await crypto.subtle.digest('SHA-256', data)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const hashedInput = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
        return hashedInput === hash
      } else {
        // Server-side: use Node.js crypto
        const crypto = require('crypto')
        const hashedInput = crypto.createHash('sha256').update(password).digest('hex')
        return hashedInput === hash
      }
    } catch (error) {
      console.error('Password validation error:', error)
      return false
    }
  }

  /**
   * Log access attempts for security auditing
   */
  private async logAccessAttempt(
    meetingId: string | null,
    userId?: string,
    guestName?: string,
    action: string = 'join_attempt',
    reason?: string
  ) {
    try {
      await supabase
        .from('meeting_access_logs')
        .insert({
          meeting_id: meetingId,
          user_id: userId,
          guest_name: guestName,
          action,
          reason
        })
    } catch (error) {
      console.error('Failed to log access attempt:', error)
    }
  }

  /**
   * Join meeting after access is granted
   */
  async joinMeeting(meetingId: string, userId: string, role: 'host' | 'moderator' | 'participant' = 'participant') {
    try {
      // Check if user is already in the meeting
      const { data: existingParticipant } = await supabase
        .from('meeting_participants')
        .select('*')
        .eq('meeting_id', meetingId)
        .eq('user_id', userId)
        .is('left_at', null)
        .single()

      if (existingParticipant) {
        console.log('User already in meeting, returning existing participant')
        return existingParticipant
      }

      const { data, error } = await supabase
        .from('meeting_participants')
        .insert({
          meeting_id: meetingId,
          user_id: userId,
          role,
          joined_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Update meeting status to active if it's the first participant
      await supabase
        .from('meetings')
        .update({
          status: 'active',
          started_at: new Date().toISOString()
        })
        .eq('id', meetingId)
        .eq('status', 'scheduled')

      await this.logAccessAttempt(meetingId, userId, undefined, 'joined', 'Successfully joined meeting')
      return data
    } catch (error) {
      console.error('Error joining meeting:', error)
      await this.logAccessAttempt(meetingId, userId, undefined, 'join_failed', error instanceof Error ? error.message : 'Unknown error')
      throw error
    }
  }

  /**
   * Leave meeting
   */
  async leaveMeeting(meetingId: string, userId: string) {
    try {
      const { error } = await supabase
        .from('meeting_participants')
        .update({ left_at: new Date().toISOString() })
        .eq('meeting_id', meetingId)
        .eq('user_id', userId)
        .is('left_at', null)

      if (error) throw error

      await this.logAccessAttempt(meetingId, userId, undefined, 'left', 'User left meeting')
    } catch (error) {
      console.error('Error leaving meeting:', error)
      throw error
    }
  }
}

export const meetingService = new MeetingService()