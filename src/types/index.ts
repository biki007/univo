// User types
export interface User {
  id: string
  email: string
  fullName: string
  avatarUrl?: string
  role: UserRole
  isVerified: boolean
  isActive: boolean
  oauthProvider?: string
  createdAt: string
  updatedAt: string
}

export type UserRole = 
  | 'super_admin'
  | 'org_admin'
  | 'host'
  | 'instructor'
  | 'participant'
  | 'student'
  | 'guest'

// Meeting types
export interface Meeting {
  id: string
  title: string
  description?: string
  hostId: string
  meetingCode: string
  password?: string
  scheduledAt?: string
  startedAt?: string
  endedAt?: string
  status: MeetingStatus
  settings: MeetingSettings
  maxParticipants: string
  isRecording: boolean
  recordingUrl?: string
  createdAt: string
  host?: User
  participants?: MeetingParticipant[]
}

export type MeetingStatus = 'scheduled' | 'active' | 'ended' | 'cancelled'

export interface MeetingSettings {
  allowGuests?: boolean
  requirePassword?: boolean
  enableChat?: boolean
  enableWhiteboard?: boolean
  enableScreenShare?: boolean
  enableRecording?: boolean
  enableTranscription?: boolean
  enableTranslation?: boolean
  muteOnJoin?: boolean
  videoOnJoin?: boolean
  waitingRoom?: boolean
}

export interface MeetingParticipant {
  id: string
  meetingId: string
  userId?: string
  guestName?: string
  role: ParticipantRole
  joinedAt: string
  leftAt?: string
  isMuted: boolean
  isVideoOff: boolean
  permissions: ParticipantPermissions
  user?: User
}

export type ParticipantRole = 'host' | 'co_host' | 'participant' | 'observer'

export interface ParticipantPermissions {
  canMute?: boolean
  canUnmute?: boolean
  canShareScreen?: boolean
  canUseWhiteboard?: boolean
  canManageParticipants?: boolean
  canRecord?: boolean
}

// Message types
export interface Message {
  id: string
  meetingId: string
  senderId?: string
  senderName: string
  content: string
  messageType: MessageType
  fileUrl?: string
  fileName?: string
  fileSize?: string
  createdAt: string
  sender?: User
}

export type MessageType = 'text' | 'file' | 'image' | 'system'

// Transcription types
export interface Transcription {
  id: string
  meetingId: string
  speakerId?: string
  speakerName: string
  content: string
  confidence?: number
  language: string
  startTime: number
  endTime: number
  createdAt: string
  speaker?: User
}

// WebRTC types
export interface MediaDevices {
  audioInput: MediaDeviceInfo[]
  audioOutput: MediaDeviceInfo[]
  videoInput: MediaDeviceInfo[]
}

export interface MediaSettings {
  audioEnabled: boolean
  videoEnabled: boolean
  audioDeviceId?: string
  videoDeviceId: string
  audioOutputDeviceId?: string
  videoQuality: 'low' | 'medium' | 'high'
}

export interface PeerConnection {
  id: string
  userId?: string
  userName: string
  connection: RTCPeerConnection
  stream?: MediaStream
  isAudioEnabled: boolean
  isVideoEnabled: boolean
  isScreenSharing: boolean
}

// Socket events
export interface SocketEvents {
  // Connection events
  connect: () => void
  disconnect: () => void
  
  // Meeting events
  join_meeting: (data: { meetingId: string; userInfo: any }) => void
  leave_meeting: (data: { meetingId: string }) => void
  participant_joined: (data: { participantId: string; userInfo: any; meetingId: string }) => void
  participant_left: (data: { participantId: string; meetingId: string }) => void
  
  // WebRTC events
  webrtc_offer: (data: { offer: RTCSessionDescriptionInit; target: string }) => void
  webrtc_answer: (data: { answer: RTCSessionDescriptionInit; target: string }) => void
  webrtc_ice_candidate: (data: { candidate: RTCIceCandidateInit; target: string }) => void
  
  // Chat events
  send_message: (data: { meetingId: string; message: string; senderInfo: any }) => void
  new_message: (data: { message: string; senderInfo: any; timestamp: number; meetingId: string }) => void
  
  // Screen sharing events
  start_screen_share: (data: { meetingId: string }) => void
  stop_screen_share: (data: { meetingId: string }) => void
  screen_share_started: (data: { presenterId: string; meetingId: string }) => void
  screen_share_stopped: (data: { presenterId: string; meetingId: string }) => void
  
  // Whiteboard events
  whiteboard_draw: (data: { meetingId: string; drawData: any }) => void
  whiteboard_clear: (data: { meetingId: string }) => void
  whiteboard_update: (data: { drawData: any; from: string }) => void
  whiteboard_cleared: (data: { from: string }) => void
  
  // Error events
  error: (data: { message: string }) => void
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Authentication types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  fullName: string
  role?: UserRole
}

export interface AuthResponse {
  accessToken: string
  tokenType: string
  user: User
}

// Form types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'checkbox'
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    custom?: (value: any) => string | undefined
  }
}

// Notification types
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  actions?: NotificationAction[]
}

export interface NotificationAction {
  label: string
  action: () => void
  style?: 'primary' | 'secondary'
}

// Whiteboard types
export interface WhiteboardTool {
  type: 'pen' | 'eraser' | 'rectangle' | 'circle' | 'line' | 'text'
  color: string
  size: number
}

export interface WhiteboardDrawData {
  tool: WhiteboardTool
  points: { x: number; y: number }[]
  timestamp: number
  userId: string
}

// File types
export interface FileUpload {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  url?: string
  error?: string
}

// Analytics types
export interface MeetingAnalytics {
  meetingId: string
  duration: number
  participantCount: number
  maxConcurrentParticipants: number
  messageCount: number
  screenShareDuration: number
  recordingDuration: number
  transcriptionAccuracy: number
  engagementScore: number
}

// AI types
export interface AITranscription {
  text: string
  confidence: number
  language: string
  speaker: string
  timestamp: number
}

export interface AITranslation {
  originalText: string
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  confidence: number
}

export interface MeetingSummary {
  summary: string[]
  actionItems: string[]
  keyPoints: string[]
  decisions: string[]
  participants: string[]
  duration: number
}