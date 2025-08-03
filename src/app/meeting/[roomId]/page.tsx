'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useWebRTC } from '@/hooks/useWebRTC'
import { meetingService } from '@/lib/meeting-service'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { useToastHelpers } from '@/components/ui/Toast'
import { Whiteboard } from '@/components/meeting/Whiteboard'
import { CodeEditor } from '@/components/meeting/CodeEditor'
import { OfficeTools } from '@/components/meeting/OfficeTools'
import { AIAssistant } from '@/components/meeting/AIAssistant'
import { HostWaitingRoomControls } from '@/components/meeting/WaitingRoom'
import {
  VideoCameraIcon,
  VideoCameraSlashIcon,
  MicrophoneIcon,
  PhoneXMarkIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  Cog6ToothIcon,
  UserPlusIcon,
  HandRaisedIcon,
  PresentationChartBarIcon,
  CodeBracketIcon,
  PencilIcon,
  DocumentTextIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  StopIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

interface Participant {
  id: string
  name: string
  email: string
  avatar?: string
  isHost: boolean
  isMuted: boolean
  isVideoOff: boolean
  isHandRaised: boolean
  isPresenting: boolean
  joinedAt: Date
  role: 'host' | 'co-host' | 'participant' | 'guest'
}

interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  message: string
  timestamp: Date
  type: 'text' | 'system' | 'file'
}

export default function MeetingRoomPage() {
  const params = useParams()
  const router = useRouter()
  const { user, profile } = useAuth()
  const toast = useToastHelpers()
  
  const roomId = params.roomId as string
  
  // Meeting state
  const [meetingInfo, setMeetingInfo] = useState({
    title: 'Team Meeting',
    description: 'Weekly team sync and project updates',
    startTime: new Date(),
    isRecording: false,
    recordingDuration: 0,
    hostId: '',
    isHost: false,
  })
  
  // UI state
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [, ] = useState(false) // showChat, setShowChat - keeping for future use
  const [, ] = useState(false) // showParticipants, setShowParticipants - keeping for future use
  const [showSettings, setShowSettings] = useState(false)
  const [isHandRaised, setIsHandRaised] = useState(false)
  const [isPresenting, setIsPresenting] = useState(false)
  const [activeView] = useState<'gallery' | 'speaker' | 'presentation'>('gallery')
  const [sidePanel, setSidePanel] = useState<'chat' | 'participants' | 'whiteboard' | 'code' | 'files' | 'ai' | null>(null)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  
  // Participants state - start with empty array, will be populated dynamically
  const [participants, setParticipants] = useState<Participant[]>([])

  // WebRTC hook
  const {
    localStream,
    initialize,
    joinRoom,
    leaveRoom,
    toggleVideo,
    toggleAudio,
    isVideoEnabled,
    isAudioEnabled,
    disconnect,
  } = useWebRTC()

  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) {
      router.push('/meeting/join-secure')
      return
    }

    // Initialize WebRTC and validate meeting access
    const initializeAndJoin = async () => {
      try {
        console.log('Initializing meeting for user:', user.id)
        
        // Initialize WebRTC first
        await initialize(user.id)
        
        // Join the room
        await joinRoom(roomId)
        
        // Fetch meeting details from database
        // For now, using mock data but this should fetch real meeting data
        const mockMeetingData = {
          title: 'Team Meeting',
          description: 'Weekly team sync and project updates',
          hostId: user.id, // Make current user the host for demo
          isHost: true // Current user is host for demo
        }
        
        setMeetingInfo(prev => ({
          ...prev,
          ...mockMeetingData,
          isHost: mockMeetingData.isHost
        }))
        
        // Add current user to participants list
        const currentUser: Participant = {
          id: user.id,
          name: profile?.full_name || user.email?.split('@')[0] || 'You',
          email: user.email || '',
          avatar: profile?.avatar_url || undefined,
          isHost: mockMeetingData.isHost,
          isMuted: !isAudioEnabled,
          isVideoOff: !isVideoEnabled,
          isHandRaised: false,
          isPresenting: false,
          joinedAt: new Date(),
          role: mockMeetingData.isHost ? 'host' : 'participant',
        }
        
        setParticipants([currentUser])
        
        console.log('Meeting initialized successfully')
      } catch (error) {
        console.error('Failed to initialize meeting:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        toast.error('Failed to join meeting', errorMessage)
        
        // Don't redirect immediately, give user a chance to retry
        setTimeout(() => {
          router.push('/meeting/join-secure')
        }, 3000)
      }
    }

    initializeAndJoin()

    return () => {
      const cleanup = async () => {
        try {
          if (user) {
            await meetingService.leaveMeeting(roomId, user.id)
          }
        } catch (error) {
          console.error('Error during cleanup:', error)
        } finally {
          leaveRoom()
          disconnect()
        }
      }
      
      cleanup()
    }
  }, [user, profile, initialize, joinRoom, roomId, toast, leaveRoom, disconnect, router, isAudioEnabled, isVideoEnabled])

  // Update local video element when stream changes
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  // Sync state with WebRTC hook and update participant info
  useEffect(() => {
    setIsVideoOn(isVideoEnabled)
    setIsMuted(!isAudioEnabled)
    
    // Update current user's participant info
    if (user) {
      setParticipants(prev => prev.map(p =>
        p.id === user.id
          ? { ...p, isMuted: !isAudioEnabled, isVideoOff: !isVideoEnabled }
          : p
      ))
    }
  }, [isVideoEnabled, isAudioEnabled, user])

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages])

  const handleToggleVideo = () => {
    try {
      toggleVideo()
      // State will be updated by the useEffect that monitors isVideoEnabled
    } catch (error) {
      console.error('Failed to toggle video:', error)
      toast.error('Video Error', 'Failed to toggle video. Please check your camera.')
    }
  }

  const handleToggleMute = () => {
    try {
      toggleAudio()
      // State will be updated by the useEffect that monitors isAudioEnabled
    } catch (error) {
      console.error('Failed to toggle audio:', error)
      toast.error('Audio Error', 'Failed to toggle microphone. Please check your microphone.')
    }
  }

  const handleLeaveMeeting = async () => {
    try {
      if (user) {
        await meetingService.leaveMeeting(roomId, user.id)
      }
      leaveRoom()
      disconnect()
      router.push('/dashboard')
      toast.success('Meeting ended', 'You have left the meeting successfully.')
    } catch (error) {
      console.error('Error leaving meeting:', error)
      // Still navigate away even if logging fails
      leaveRoom()
      disconnect()
      router.push('/dashboard')
    }
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: user?.id || 'unknown',
      senderName: profile?.full_name || user?.email?.split('@')[0] || 'You',
      message: newMessage.trim(),
      timestamp: new Date(),
      type: 'text',
    }

    setChatMessages(prev => [...prev, message])
    setNewMessage('')
  }

  const handleStartRecording = () => {
    setMeetingInfo(prev => ({ ...prev, isRecording: true }))
    toast.success('Recording started', 'Meeting is now being recorded.')
  }

  const handleStopRecording = () => {
    setMeetingInfo(prev => ({ ...prev, isRecording: false }))
    toast.success('Recording stopped', 'Meeting recording has been saved.')
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getRoleBadgeColor = (role: Participant['role']) => {
    switch (role) {
      case 'host': return 'error'
      case 'co-host': return 'warning'
      case 'participant': return 'primary'
      case 'guest': return 'secondary'
      default: return 'default'
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="font-semibold text-white">{meetingInfo.title}</h1>
            <p className="text-sm text-gray-400">{meetingInfo.description}</p>
          </div>
          {meetingInfo.isRecording && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-red-400">
                REC {formatDuration(meetingInfo.recordingDuration)}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-xs">
            {participants.length} participant{participants.length !== 1 ? 's' : ''}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidePanel(sidePanel === 'participants' ? null : 'participants')}
            className="text-gray-300 hover:text-white hover:bg-gray-700"
          >
            <UserPlusIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Video Area */}
        <div className="flex flex-col flex-1">
          {/* Video Grid */}
          <div className="flex-1 p-4">
            {activeView === 'gallery' && (
              <div className="grid h-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {/* Local Video */}
                <div className="relative overflow-hidden bg-gray-800 rounded-lg">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute flex items-center space-x-2 bottom-2 left-2">
                    <span className="px-2 py-1 text-sm text-white bg-black rounded bg-opacity-70">
                      You
                    </span>
                    {isMuted && <MicrophoneIcon className="w-4 h-4 text-red-400" />}
                    {!isVideoOn && <VideoCameraSlashIcon className="w-4 h-4 text-red-400" />}
                  </div>
                  {isHandRaised && (
                    <div className="absolute top-2 right-2">
                      <HandRaisedIcon className="w-6 h-6 text-yellow-400" />
                    </div>
                  )}
                </div>

                {/* Remote Videos */}
                {participants.slice(0, 11).map((participant) => (
                  <div key={participant.id} className="relative overflow-hidden bg-gray-800 rounded-lg">
                    {participant.isVideoOff ? (
                      <div className="flex items-center justify-center w-full h-full">
                        <Avatar
                          src={participant.avatar}
                          fallback={participant.name}
                          size="xl"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-gray-700">
                        <span className="text-gray-400">Video feed</span>
                      </div>
                    )}
                    
                    <div className="absolute flex items-center space-x-2 bottom-2 left-2">
                      <span className="px-2 py-1 text-sm text-white bg-black rounded bg-opacity-70">
                        {participant.name}
                      </span>
                      <Badge 
                        variant={getRoleBadgeColor(participant.role) as any}
                        size="sm"
                      >
                        {participant.role}
                      </Badge>
                      {participant.isMuted && <MicrophoneIcon className="w-4 h-4 text-red-400" />}
                    </div>
                    
                    {participant.isHandRaised && (
                      <div className="absolute top-2 right-2">
                        <HandRaisedIcon className="w-6 h-6 text-yellow-400" />
                      </div>
                    )}
                    
                    {participant.isPresenting && (
                      <div className="absolute top-2 left-2">
                        <PresentationChartBarIcon className="w-6 h-6 text-blue-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="px-4 py-3 bg-gray-800 border-t border-gray-700">
            <div className="flex items-center justify-center space-x-4">
              {/* Audio Control */}
              <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="lg"
                onClick={handleToggleMute}
                className="w-12 h-12 rounded-full"
              >
                <MicrophoneIcon className="w-6 h-6" />
              </Button>

              {/* Video Control */}
              <Button
                variant={!isVideoOn ? "destructive" : "secondary"}
                size="lg"
                onClick={handleToggleVideo}
                className="w-12 h-12 rounded-full"
              >
                {!isVideoOn ? (
                  <VideoCameraSlashIcon className="w-6 h-6" />
                ) : (
                  <VideoCameraIcon className="w-6 h-6" />
                )}
              </Button>

              {/* Speaker Control */}
              <Button
                variant={!isSpeakerOn ? "destructive" : "secondary"}
                size="lg"
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className="w-12 h-12 rounded-full"
              >
                {!isSpeakerOn ? (
                  <SpeakerXMarkIcon className="w-6 h-6" />
                ) : (
                  <SpeakerWaveIcon className="w-6 h-6" />
                )}
              </Button>

              {/* Hand Raise */}
              <Button
                variant={isHandRaised ? "default" : "secondary"}
                size="lg"
                onClick={() => {
                  const newHandRaisedState = !isHandRaised
                  setIsHandRaised(newHandRaisedState)
                  
                  // Update participant info
                  if (user) {
                    setParticipants(prev => prev.map(p =>
                      p.id === user.id
                        ? { ...p, isHandRaised: newHandRaisedState }
                        : p
                    ))
                  }
                }}
                className="w-12 h-12 rounded-full"
              >
                <HandRaisedIcon className="w-6 h-6" />
              </Button>

              {/* Share Screen */}
              <Button
                variant={isPresenting ? "default" : "secondary"}
                size="lg"
                onClick={() => setIsPresenting(!isPresenting)}
                className="w-12 h-12 rounded-full"
              >
                <ShareIcon className="w-6 h-6" />
              </Button>

              {/* Recording */}
              <Button
                variant={meetingInfo.isRecording ? "destructive" : "secondary"}
                size="lg"
                onClick={meetingInfo.isRecording ? handleStopRecording : handleStartRecording}
                className="w-12 h-12 rounded-full"
              >
                <StopIcon className="w-6 h-6" />
              </Button>

              {/* Chat */}
              <Button
                variant={sidePanel === 'chat' ? "default" : "secondary"}
                size="lg"
                onClick={() => setSidePanel(sidePanel === 'chat' ? null : 'chat')}
                className="w-12 h-12 rounded-full"
              >
                <ChatBubbleLeftIcon className="w-6 h-6" />
              </Button>

              {/* Whiteboard */}
              <Button
                variant={sidePanel === 'whiteboard' ? "default" : "secondary"}
                size="lg"
                onClick={() => setSidePanel(sidePanel === 'whiteboard' ? null : 'whiteboard')}
                className="w-12 h-12 rounded-full"
              >
                <PencilIcon className="w-6 h-6" />
              </Button>

              {/* Code Editor */}
              <Button
                variant={sidePanel === 'code' ? "default" : "secondary"}
                size="lg"
                onClick={() => setSidePanel(sidePanel === 'code' ? null : 'code')}
                className="w-12 h-12 rounded-full"
              >
                <CodeBracketIcon className="w-6 h-6" />
              </Button>

              {/* Office Tools */}
              <Button
                variant={sidePanel === 'files' ? "default" : "secondary"}
                size="lg"
                onClick={() => setSidePanel(sidePanel === 'files' ? null : 'files')}
                className="w-12 h-12 rounded-full"
              >
                <DocumentTextIcon className="w-6 h-6" />
              </Button>

              {/* AI Assistant */}
              <Button
                variant={showAIAssistant ? "default" : "secondary"}
                size="lg"
                onClick={() => setShowAIAssistant(!showAIAssistant)}
                className="w-12 h-12 rounded-full"
              >
                <SparklesIcon className="w-6 h-6" />
              </Button>

              {/* Settings */}
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setShowSettings(!showSettings)}
                className="w-12 h-12 rounded-full"
              >
                <Cog6ToothIcon className="w-6 h-6" />
              </Button>

              {/* Leave Meeting */}
              <Button
                variant="destructive"
                size="lg"
                onClick={handleLeaveMeeting}
                className="w-12 h-12 rounded-full"
              >
                <PhoneXMarkIcon className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        {sidePanel && (
          <div className="flex flex-col bg-gray-800 border-l border-gray-700 w-80">
            {sidePanel === 'chat' && (
              <>
                <div className="p-4 border-b border-gray-700">
                  <h3 className="font-semibold text-white">Chat</h3>
                </div>
                <div 
                  ref={chatContainerRef}
                  className="flex-1 p-4 space-y-3 overflow-y-auto"
                >
                  {chatMessages.map((message) => (
                    <div key={message.id} className="text-sm">
                      <div className="mb-1 text-xs text-gray-400">
                        {message.senderName} • {message.timestamp.toLocaleTimeString()}
                      </div>
                      <div className="text-white">{message.message}</div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 text-sm text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <Button type="submit" size="sm">
                      Send
                    </Button>
                  </div>
                </form>
              </>
            )}

            {sidePanel === 'participants' && (
              <>
                <div className="p-4 border-b border-gray-700">
                  <h3 className="font-semibold text-white">
                    Participants ({participants.length})
                  </h3>
                </div>
                <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                  {participants.map((participant) => (
                    <div key={participant.id} className="flex items-center space-x-3">
                      <Avatar
                        src={participant.avatar}
                        fallback={participant.name}
                        size="sm"
                        showStatus
                        status="online"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-white">
                            {participant.name}
                          </span>
                          <Badge 
                            variant={getRoleBadgeColor(participant.role) as any}
                            size="sm"
                          >
                            {participant.role}
                          </Badge>
                        </div>
                        <div className="flex items-center mt-1 space-x-2">
                          {participant.isMuted && (
                            <MicrophoneIcon className="w-3 h-3 text-red-400" />
                          )}
                          {participant.isVideoOff && (
                            <VideoCameraSlashIcon className="w-3 h-3 text-red-400" />
                          )}
                          {participant.isHandRaised && (
                            <HandRaisedIcon className="w-3 h-3 text-yellow-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Host Waiting Room Controls */}
                {meetingInfo.isHost && (
                  <HostWaitingRoomControls
                    meetingId={roomId}
                    hostId={user?.id || ''}
                    onParticipantUpdate={() => {
                      // Refresh participants list when someone is admitted
                      // In a real implementation, this would update the participants state
                      console.log('Participant admitted - refresh participants list')
                    }}
                  />
                )}
              </>
            )}

            {sidePanel === 'whiteboard' && (
              <div className="flex flex-col flex-1">
                <Whiteboard roomId={roomId} className="flex-1" />
              </div>
            )}

            {sidePanel === 'code' && (
              <div className="flex flex-col flex-1">
                <CodeEditor roomId={roomId} className="flex-1" />
              </div>
            )}

            {sidePanel === 'files' && (
              <div className="flex flex-col flex-1">
                <OfficeTools roomId={roomId} className="flex-1" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Assistant Modal */}
      <AIAssistant
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        meetingId={roomId}
        participants={participants.map(p => p.name)}
      />
    </div>
  )
}