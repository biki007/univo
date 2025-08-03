export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'user' | 'admin' | 'moderator'
          created_at: string
          updated_at: string
          last_seen: string | null
          is_online: boolean
          preferences: Json | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin' | 'moderator'
          created_at?: string
          updated_at?: string
          last_seen?: string | null
          is_online?: boolean
          preferences?: Json | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin' | 'moderator'
          created_at?: string
          updated_at?: string
          last_seen?: string | null
          is_online?: boolean
          preferences?: Json | null
        }
      }
      meetings: {
        Row: {
          id: string
          title: string
          description: string | null
          host_id: string
          meeting_code: string
          scheduled_at: string | null
          started_at: string | null
          ended_at: string | null
          status: 'scheduled' | 'active' | 'ended' | 'cancelled'
          max_participants: number
          is_recording: boolean
          recording_url: string | null
          ai_summary: string | null
          ai_transcript: string | null
          settings: Json | null
          password_hash: string | null
          waiting_room_enabled: boolean
          allow_guests: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          host_id: string
          meeting_code?: string
          scheduled_at?: string | null
          started_at?: string | null
          ended_at?: string | null
          status?: 'scheduled' | 'active' | 'ended' | 'cancelled'
          max_participants?: number
          is_recording?: boolean
          recording_url?: string | null
          ai_summary?: string | null
          ai_transcript?: string | null
          settings?: Json | null
          password_hash?: string | null
          waiting_room_enabled?: boolean
          allow_guests?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          host_id?: string
          meeting_code?: string
          scheduled_at?: string | null
          started_at?: string | null
          ended_at?: string | null
          status?: 'scheduled' | 'active' | 'ended' | 'cancelled'
          max_participants?: number
          is_recording?: boolean
          recording_url?: string | null
          ai_summary?: string | null
          ai_transcript?: string | null
          settings?: Json | null
          password_hash?: string | null
          waiting_room_enabled?: boolean
          allow_guests?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      meeting_participants: {
        Row: {
          id: string
          meeting_id: string
          user_id: string
          joined_at: string
          left_at: string | null
          role: 'host' | 'moderator' | 'participant'
          is_muted: boolean
          is_video_on: boolean
          is_screen_sharing: boolean
          created_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          user_id: string
          joined_at?: string
          left_at?: string | null
          role?: 'host' | 'moderator' | 'participant'
          is_muted?: boolean
          is_video_on?: boolean
          is_screen_sharing?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          user_id?: string
          joined_at?: string
          left_at?: string | null
          role?: 'host' | 'moderator' | 'participant'
          is_muted?: boolean
          is_video_on?: boolean
          is_screen_sharing?: boolean
          created_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          meeting_id: string
          user_id: string
          message: string
          message_type: 'text' | 'file' | 'system'
          file_url: string | null
          file_name: string | null
          file_size: number | null
          is_private: boolean
          recipient_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          user_id: string
          message: string
          message_type?: 'text' | 'file' | 'system'
          file_url?: string | null
          file_name?: string | null
          file_size?: number | null
          is_private?: boolean
          recipient_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          user_id?: string
          message?: string
          message_type?: 'text' | 'file' | 'system'
          file_url?: string | null
          file_name?: string | null
          file_size?: number | null
          is_private?: boolean
          recipient_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      whiteboard_sessions: {
        Row: {
          id: string
          meeting_id: string
          created_by: string
          title: string
          canvas_data: Json
          version: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          created_by: string
          title: string
          canvas_data?: Json
          version?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          created_by?: string
          title?: string
          canvas_data?: Json
          version?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ai_transcriptions: {
        Row: {
          id: string
          meeting_id: string
          user_id: string
          transcript_text: string
          language: string
          confidence_score: number
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          user_id: string
          transcript_text: string
          language?: string
          confidence_score?: number
          timestamp: string
          created_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          user_id?: string
          transcript_text?: string
          language?: string
          confidence_score?: number
          timestamp?: string
          created_at?: string
        }
      }
      meeting_recordings: {
        Row: {
          id: string
          meeting_id: string
          file_url: string
          file_size: number | null
          duration: number | null
          format: string
          quality: string
          is_processed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          file_url: string
          file_size?: number | null
          duration?: number | null
          format?: string
          quality?: string
          is_processed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          file_url?: string
          file_size?: number | null
          duration?: number | null
          format?: string
          quality?: string
          is_processed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      file_uploads: {
        Row: {
          id: string
          meeting_id: string | null
          user_id: string
          file_name: string
          file_url: string
          file_size: number
          file_type: string
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          meeting_id?: string | null
          user_id: string
          file_name: string
          file_url: string
          file_size: number
          file_type: string
          is_public?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string | null
          user_id?: string
          file_name?: string
          file_url?: string
          file_size?: number
          file_type?: string
          is_public?: boolean
          created_at?: string
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          session_token: string
          device_info: Json | null
          ip_address: string | null
          user_agent: string | null
          is_active: boolean
          last_activity: string
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_token: string
          device_info?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          is_active?: boolean
          last_activity?: string
          created_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          user_id?: string
          session_token?: string
          device_info?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          is_active?: boolean
          last_activity?: string
          created_at?: string
          expires_at?: string
        }
      }
      meeting_invitations: {
        Row: {
          id: string
          meeting_id: string
          inviter_id: string
          invitee_email: string
          invitee_id: string | null
          invitation_token: string
          status: string
          sent_at: string
          responded_at: string | null
          expires_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          inviter_id: string
          invitee_email: string
          invitee_id?: string | null
          invitation_token: string
          status?: string
          sent_at?: string
          responded_at?: string | null
          expires_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          inviter_id?: string
          invitee_email?: string
          invitee_id?: string | null
          invitation_token?: string
          status?: string
          sent_at?: string
          responded_at?: string | null
          expires_at?: string
        }
      }
      analytics_events: {
        Row: {
          id: string
          user_id: string | null
          meeting_id: string | null
          event_type: string
          event_data: Json | null
          session_id: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          meeting_id?: string | null
          event_type: string
          event_data?: Json | null
          session_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          meeting_id?: string | null
          event_type?: string
          event_data?: Json | null
          session_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      waiting_room_participants: {
        Row: {
          id: string
          meeting_id: string
          user_id: string | null
          guest_name: string | null
          guest_email: string | null
          join_request_message: string | null
          status: 'waiting' | 'admitted' | 'denied' | 'left'
          requested_at: string
          responded_at: string | null
          responded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          user_id?: string | null
          guest_name?: string | null
          guest_email?: string | null
          join_request_message?: string | null
          status?: 'waiting' | 'admitted' | 'denied' | 'left'
          requested_at?: string
          responded_at?: string | null
          responded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          user_id?: string | null
          guest_name?: string | null
          guest_email?: string | null
          join_request_message?: string | null
          status?: 'waiting' | 'admitted' | 'denied' | 'left'
          requested_at?: string
          responded_at?: string | null
          responded_by?: string | null
          created_at?: string
        }
      }
      meeting_access_logs: {
        Row: {
          id: string
          meeting_id: string
          user_id: string | null
          guest_name: string | null
          action: 'join_attempt' | 'join_success' | 'join_denied' | 'left' | 'kicked'
          reason: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          user_id?: string | null
          guest_name?: string | null
          action: 'join_attempt' | 'join_success' | 'join_denied' | 'left' | 'kicked'
          reason?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          user_id?: string | null
          guest_name?: string | null
          action?: 'join_attempt' | 'join_success' | 'join_denied' | 'left' | 'kicked'
          reason?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_key in never]: never
    }
    Functions: {
      [_key in never]: never
    }
    Enums: {
      user_role: 'user' | 'admin' | 'moderator'
      meeting_status: 'scheduled' | 'active' | 'ended' | 'cancelled'
      participant_role: 'host' | 'moderator' | 'participant'
      message_type: 'text' | 'file' | 'system'
    }
    CompositeTypes: {
      [_key in never]: never
    }
  }
}