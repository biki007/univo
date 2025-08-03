import { supabase, hasValidSupabaseConfig } from '@/lib/supabase'
import { Database } from '@/types/supabase'

// Type aliases for better readability
type Tables = Database['public']['Tables']
type Meeting = Tables['meetings']['Row']
type MeetingInsert = Tables['meetings']['Insert']
type MeetingUpdate = Tables['meetings']['Update']
type MeetingParticipant = Tables['meeting_participants']['Row']
type ChatMessage = Tables['chat_messages']['Row']
type ChatMessageInsert = Tables['chat_messages']['Insert']
type WhiteboardSession = Tables['whiteboard_sessions']['Row']
type FileUpload = Tables['file_uploads']['Row']
type MeetingRecording = Tables['meeting_recordings']['Row']

export interface MeetingWithDetails extends Meeting {
  host: {
    id: string
    full_name: string | null
    email: string
    avatar_url: string | null
  }
  participants_count: number
  current_participants: number
  is_user_participant: boolean
  user_role?: 'host' | 'moderator' | 'participant'
}

export interface ChatMessageWithUser extends ChatMessage {
  user: {
    id: string
    full_name: string | null
    email: string
    avatar_url: string | null
  }
}

class DatabaseService {
  // Meeting operations
  async createMeeting(meetingData: Omit<MeetingInsert, 'id' | 'meeting_code' | 'created_at' | 'updated_at'>): Promise<{
    data: Meeting | null
    error: any
  }> {
    if (!hasValidSupabaseConfig) {
      return { data: null, error: { message: 'Database not configured' } }
    }

    const { data, error } = await supabase
      .from('meetings')
      .insert(meetingData)
      .select()
      .single()

    return { data, error }
  }

  async getMeeting(meetingId: string, userId?: string): Promise<{
    data: MeetingWithDetails | null
    error: any
  }> {
    if (!hasValidSupabaseConfig) {
      return { data: null, error: { message: 'Database not configured' } }
    }

    const { data, error } = await supabase
      .from('meetings')
      .select(`
        *,
        host:profiles!meetings_host_id_fkey(id, full_name, email, avatar_url),
        meeting_participants(
          id,
          user_id,
          role,
          joined_at,
          left_at
        )
      `)
      .eq('id', meetingId)
      .single()

    if (error || !data) {
      return { data: null, error }
    }

    const participants = data.meeting_participants || []
    const currentParticipants = participants.filter((p: any) => !p.left_at)
    const userParticipant = userId ? participants.find((p: any) => p.user_id === userId) : null

    const meetingWithDetails: MeetingWithDetails = {
      ...data,
      host: data.host,
      participants_count: participants.length,
      current_participants: currentParticipants.length,
      is_user_participant: !!userParticipant,
      user_role: userParticipant?.role
    }

    return { data: meetingWithDetails, error: null }
  }

  async getMeetingByCode(meetingCode: string, userId?: string): Promise<{
    data: MeetingWithDetails | null
    error: any
  }> {
    if (!hasValidSupabaseConfig) {
      return { data: null, error: { message: 'Database not configured' } }
    }

    const { data, error } = await supabase
      .from('meetings')
      .select(`
        *,
        host:profiles!meetings_host_id_fkey(id, full_name, email, avatar_url),
        meeting_participants(
          id,
          user_id,
          role,
          joined_at,
          left_at
        )
      `)
      .eq('meeting_code', meetingCode)
      .single()

    if (error || !data) {
      return { data: null, error }
    }

    const participants = data.meeting_participants || []
    const currentParticipants = participants.filter((p: any) => !p.left_at)
    const userParticipant = userId ? participants.find((p: any) => p.user_id === userId) : null

    const meetingWithDetails: MeetingWithDetails = {
      ...data,
      host: data.host,
      participants_count: participants.length,
      current_participants: currentParticipants.length,
      is_user_participant: !!userParticipant,
      user_role: userParticipant?.role
    }

    return { data: meetingWithDetails, error: null }
  }

  async updateMeeting(meetingId: string, updates: MeetingUpdate): Promise<{
    data: Meeting | null
    error: any
  }> {
    if (!hasValidSupabaseConfig) {
      return { data: null, error: { message: 'Database not configured' } }
    }

    const { data, error } = await supabase
      .from('meetings')
      .update(updates)
      .eq('id', meetingId)
      .select()
      .single()

    return { data, error }
  }

  async startMeeting(meetingId: string): Promise<{ data: Meeting | null; error: any }> {
    return this.updateMeeting(meetingId, {
      status: 'active',
      started_at: new Date().toISOString()
    })
  }

  async endMeeting(meetingId: string, endedBy: string): Promise<{ error: any }> {
    if (!hasValidSupabaseConfig) {
      return { error: { message: 'Database not configured' } }
    }

    const { error } = await supabase.rpc('end_meeting', {
      meeting_id: meetingId,
      ended_by: endedBy
    })

    return { error }
  }

  // Participant operations
  async joinMeeting(meetingId: string, userId: string, role: 'host' | 'moderator' | 'participant' = 'participant'): Promise<{
    data: MeetingParticipant | null
    error: any
  }> {
    if (!hasValidSupabaseConfig) {
      return { data: null, error: { message: 'Database not configured' } }
    }

    const { data, error } = await supabase
      .from('meeting_participants')
      .insert({
        meeting_id: meetingId,
        user_id: userId,
        role
      })
      .select()
      .single()

    return { data, error }
  }

  async leaveMeeting(meetingId: string, userId: string): Promise<{ error: any }> {
    if (!hasValidSupabaseConfig) {
      return { error: { message: 'Database not configured' } }
    }

    const { error } = await supabase
      .from('meeting_participants')
      .update({ left_at: new Date().toISOString() })
      .eq('meeting_id', meetingId)
      .eq('user_id', userId)
      .is('left_at', null)

    return { error }
  }

  async updateParticipantStatus(
    meetingId: string, 
    userId: string, 
    updates: { is_muted?: boolean; is_video_on?: boolean; is_screen_sharing?: boolean }
  ): Promise<{ data: MeetingParticipant | null; error: any }> {
    if (!hasValidSupabaseConfig) {
      return { data: null, error: { message: 'Database not configured' } }
    }

    const { data, error } = await supabase
      .from('meeting_participants')
      .update(updates)
      .eq('meeting_id', meetingId)
      .eq('user_id', userId)
      .is('left_at', null)
      .select()
      .single()

    return { data, error }
  }

  async getMeetingParticipants(meetingId: string): Promise<{
    data: (MeetingParticipant & { user: { id: string; full_name: string | null; email: string; avatar_url: string | null } })[] | null
    error: any
  }> {
    if (!hasValidSupabaseConfig) {
      return { data: null, error: { message: 'Database not configured' } }
    }

    const { data, error } = await supabase
      .from('meeting_participants')
      .select(`
        *,
        user:profiles(id, full_name, email, avatar_url)
      `)
      .eq('meeting_id', meetingId)
      .order('joined_at', { ascending: true })

    return { data, error }
  }

  // Chat operations
  async sendMessage(messageData: Omit<ChatMessageInsert, 'id' | 'created_at' | 'updated_at'>): Promise<{
    data: ChatMessageWithUser | null
    error: any
  }> {
    if (!hasValidSupabaseConfig) {
      return { data: null, error: { message: 'Database not configured' } }
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .insert(messageData)
      .select(`
        *,
        user:profiles(id, full_name, email, avatar_url)
      `)
      .single()

    return { data, error }
  }

  async getChatMessages(meetingId: string, limit: number = 50): Promise<{
    data: ChatMessageWithUser[] | null
    error: any
  }> {
    if (!hasValidSupabaseConfig) {
      return { data: null, error: { message: 'Database not configured' } }
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        user:profiles(id, full_name, email, avatar_url)
      `)
      .eq('meeting_id', meetingId)
      .order('created_at', { ascending: true })
      .limit(limit)

    return { data, error }
  }

  // Whiteboard operations
  async createWhiteboard(meetingId: string, createdBy: string, title?: string): Promise<{
    data: WhiteboardSession | null
    error: any
  }> {
    if (!hasValidSupabaseConfig) {
      return { data: null, error: { message: 'Database not configured' } }
    }

    const { data, error } = await supabase
      .from('whiteboard_sessions')
      .insert({
        meeting_id: meetingId,
        created_by: createdBy,
        title: title || 'Untitled Whiteboard'
      })
      .select()
      .single()

    return { data, error }
  }

  async updateWhiteboard(whiteboardId: string, canvasData: any): Promise<{
    data: WhiteboardSession | null
    error: any
  }> {
    if (!hasValidSupabaseConfig) {
      return { data: null, error: { message: 'Database not configured' } }
    }

    // First get current version
    const { data: currentData } = await supabase
      .from('whiteboard_sessions')
      .select('version')
      .eq('id', whiteboardId)
      .single()

    const newVersion = (currentData?.version || 0) + 1

    const { data, error } = await supabase
      .from('whiteboard_sessions')
      .update({
        canvas_data: canvasData,
        version: newVersion
      })
      .eq('id', whiteboardId)
      .select()
      .single()

    return { data, error }
  }

  async getWhiteboards(meetingId: string): Promise<{
    data: WhiteboardSession[] | null
    error: any
  }> {
    if (!hasValidSupabaseConfig) {
      return { data: null, error: { message: 'Database not configured' } }
    }

    const { data, error } = await supabase
      .from('whiteboard_sessions')
      .select('*')
      .eq('meeting_id', meetingId)
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    return { data, error }
  }

  // File operations
  async uploadFile(fileData: Omit<FileUpload, 'id' | 'created_at'>): Promise<{
    data: FileUpload | null
    error: any
  }> {
    if (!hasValidSupabaseConfig) {
      return { data: null, error: { message: 'Database not configured' } }
    }

    const { data, error } = await supabase
      .from('file_uploads')
      .insert(fileData)
      .select()
      .single()

    return { data, error }
  }

  async getMeetingFiles(meetingId: string): Promise<{
    data: (FileUpload & { user: { id: string; full_name: string | null; email: string } })[] | null
    error: any
  }> {
    if (!hasValidSupabaseConfig) {
      return { data: null, error: { message: 'Database not configured' } }
    }

    const { data, error } = await supabase
      .from('file_uploads')
      .select(`
        *,
        user:profiles(id, full_name, email)
      `)
      .eq('meeting_id', meetingId)
      .order('created_at', { ascending: false })

    return { data, error }
  }

  // Analytics operations
  async logEvent(eventType: string, eventData: any, userId?: string, meetingId?: string): Promise<{ error: any }> {
    if (!hasValidSupabaseConfig) {
      return { error: { message: 'Database not configured' } }
    }

    const { error } = await supabase
      .from('analytics_events')
      .insert({
        user_id: userId,
        meeting_id: meetingId,
        event_type: eventType,
        event_data: eventData
      })

    return { error }
  }

  async getMeetingStats(meetingId: string): Promise<{
    data: any
    error: any
  }> {
    if (!hasValidSupabaseConfig) {
      return { data: null, error: { message: 'Database not configured' } }
    }

    const { data, error } = await supabase.rpc('get_meeting_stats', {
      meeting_id: meetingId
    })

    return { data, error }
  }

  async getUserAnalytics(userId: string, daysBack: number = 30): Promise<{
    data: any
    error: any
  }> {
    if (!hasValidSupabaseConfig) {
      return { data: null, error: { message: 'Database not configured' } }
    }

    const { data, error } = await supabase.rpc('get_user_analytics', {
      user_id: userId,
      days_back: daysBack
    })

    return { data, error }
  }

  // Real-time subscriptions
  subscribeToChatMessages(meetingId: string, callback: (payload: any) => void) {
    if (!hasValidSupabaseConfig) {
      return { unsubscribe: () => {} }
    }

    return supabase
      .channel(`chat_messages:${meetingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `meeting_id=eq.${meetingId}`
        },
        callback
      )
      .subscribe()
  }

  subscribeToMeetingParticipants(meetingId: string, callback: (payload: any) => void) {
    if (!hasValidSupabaseConfig) {
      return { unsubscribe: () => {} }
    }

    return supabase
      .channel(`meeting_participants:${meetingId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meeting_participants',
          filter: `meeting_id=eq.${meetingId}`
        },
        callback
      )
      .subscribe()
  }

  subscribeToWhiteboard(whiteboardId: string, callback: (payload: any) => void) {
    if (!hasValidSupabaseConfig) {
      return { unsubscribe: () => {} }
    }

    return supabase
      .channel(`whiteboard:${whiteboardId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'whiteboard_sessions',
          filter: `id=eq.${whiteboardId}`
        },
        callback
      )
      .subscribe()
  }
}

export const database = new DatabaseService()