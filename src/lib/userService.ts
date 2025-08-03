import { supabase, hasValidSupabaseConfig } from '@/lib/supabase'
import { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
type UserRole = Profile['role']

export interface UserWithStats extends Profile {
  meeting_count?: number
  last_meeting?: string
  total_meeting_time?: number
}

export interface UserFilters {
  role?: UserRole
  search?: string
  isOnline?: boolean
  dateFrom?: string
  dateTo?: string
}

export interface PaginationOptions {
  page?: number
  limit?: number
  sortBy?: keyof Profile
  sortOrder?: 'asc' | 'desc'
}

class UserService {
  // Get all users with optional filtering and pagination
  async getUsers(
    filters: UserFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<{ data: UserWithStats[] | null; error: any; count: number }> {
    if (!hasValidSupabaseConfig) {
      return { 
        data: null, 
        error: { message: 'Supabase not configured' }, 
        count: 0 
      }
    }

    const {
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = pagination

    const {
      role,
      search,
      isOnline,
      dateFrom,
      dateTo
    } = filters

    let query = supabase
      .from('profiles')
      .select(`
        *,
        meetings!meetings_host_id_fkey(count),
        meeting_participants!meeting_participants_user_id_fkey(
          meeting_id,
          joined_at,
          left_at
        )
      `, { count: 'exact' })

    // Apply filters
    if (role) {
      query = query.eq('role', role)
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    if (typeof isOnline === 'boolean') {
      query = query.eq('is_online', isOnline)
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }

    // Apply sorting and pagination
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range((page - 1) * limit, page * limit - 1)

    const { data, error, count } = await query

    return { data, error, count: count || 0 }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<{ data: Profile | null; error: any }> {
    if (!hasValidSupabaseConfig) {
      return { data: null, error: { message: 'Supabase not configured' } }
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    return { data, error }
  }

  // Update user profile
  async updateUser(
    userId: string, 
    updates: ProfileUpdate
  ): Promise<{ data: Profile | null; error: any }> {
    if (!hasValidSupabaseConfig) {
      return { data: null, error: { message: 'Supabase not configured' } }
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    return { data, error }
  }

  // Update user role (admin only)
  async updateUserRole(
    userId: string, 
    newRole: UserRole
  ): Promise<{ data: Profile | null; error: any }> {
    if (!hasValidSupabaseConfig) {
      return { data: null, error: { message: 'Supabase not configured' } }
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        role: newRole,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    return { data, error }
  }

  // Delete user (admin only)
  async deleteUser(userId: string): Promise<{ error: any }> {
    if (!hasValidSupabaseConfig) {
      return { error: { message: 'Supabase not configured' } }
    }

    // First delete the user's profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      return { error: profileError }
    }

    // Then delete the auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)

    return { error: authError }
  }

  // Update user online status
  async updateOnlineStatus(
    userId: string, 
    isOnline: boolean
  ): Promise<{ data: Profile | null; error: any }> {
    if (!hasValidSupabaseConfig) {
      return { data: null, error: { message: 'Supabase not configured' } }
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        is_online: isOnline,
        last_seen: isOnline ? null : new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    return { data, error }
  }

  // Get user statistics
  async getUserStats(userId: string): Promise<{
    data: {
      totalMeetings: number
      totalMeetingTime: number
      averageMeetingDuration: number
      lastMeetingDate: string | null
    } | null
    error: any
  }> {
    if (!hasValidSupabaseConfig) {
      return { data: null, error: { message: 'Supabase not configured' } }
    }

    const { data, error } = await supabase
      .from('meeting_participants')
      .select(`
        joined_at,
        left_at,
        meetings!inner(
          title,
          started_at,
          ended_at
        )
      `)
      .eq('user_id', userId)

    if (error) {
      return { data: null, error }
    }

    const totalMeetings = data.length
    let totalMeetingTime = 0
    let lastMeetingDate: string | null = null

    data.forEach(participant => {
      if (participant.joined_at && participant.left_at) {
        const joinTime = new Date(participant.joined_at).getTime()
        const leaveTime = new Date(participant.left_at).getTime()
        totalMeetingTime += (leaveTime - joinTime) / 1000 / 60 // Convert to minutes
      }

      const meeting = participant.meetings as any
      const meetingDate = meeting?.started_at
      if (meetingDate && (!lastMeetingDate || meetingDate > lastMeetingDate)) {
        lastMeetingDate = meetingDate
      }
    })

    const averageMeetingDuration = totalMeetings > 0 ? totalMeetingTime / totalMeetings : 0

    return {
      data: {
        totalMeetings,
        totalMeetingTime,
        averageMeetingDuration,
        lastMeetingDate
      },
      error: null
    }
  }

  // Bulk operations
  async bulkUpdateUsers(
    userIds: string[], 
    updates: ProfileUpdate
  ): Promise<{ data: Profile[] | null; error: any }> {
    if (!hasValidSupabaseConfig) {
      return { data: null, error: { message: 'Supabase not configured' } }
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .in('id', userIds)
      .select()

    return { data, error }
  }

  async bulkDeleteUsers(userIds: string[]): Promise<{ error: any }> {
    if (!hasValidSupabaseConfig) {
      return { error: { message: 'Supabase not configured' } }
    }

    // Delete profiles first
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .in('id', userIds)

    if (profileError) {
      return { error: profileError }
    }

    // Delete auth users
    for (const userId of userIds) {
      const { error: authError } = await supabase.auth.admin.deleteUser(userId)
      if (authError) {
        console.error(`Failed to delete auth user ${userId}:`, authError)
      }
    }

    return { error: null }
  }

  // Search users
  async searchUsers(
    query: string, 
    limit: number = 10
  ): Promise<{ data: Profile[] | null; error: any }> {
    if (!hasValidSupabaseConfig) {
      return { data: null, error: { message: 'Supabase not configured' } }
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(limit)

    return { data, error }
  }
}

export const userService = new UserService()