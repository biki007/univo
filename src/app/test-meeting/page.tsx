'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import useWebRTC from '@/hooks/useWebRTC'
import VideoGrid, { VideoParticipant } from '@/components/video/VideoGrid'
import VideoControls from '@/components/video/VideoControls'
import { 
  ExclamationTriangleIcon,
  SignalIcon,
  SignalSlashIcon
} from '@heroicons/react/24/outline'

export default function TestMeeting() {
  // Mock user for testing
  const mockUser = useMemo(() => ({
    id: 'test-user-123',
    email: 'test@example.com',
    user_metadata: { full_name: 'Test User' }
  }), [])

  const roomId = 'test-room-123'

  // WebRTC hook
  const {
    isConnected,
    isConnecting,
    error,
    localStream,
    remoteStreams,
    peers,
    isVideoEnabled,
    isAudioEnabled,
    initialize,
    joinRoom,
    leaveRoom,
    toggleVideo,
    toggleAudio,
    disconnect
  } = useWebRTC({
    autoGetUserMedia: true,
    mediaConstraints: { video: true, audio: true }
  })

  // UI state
  const [isInitialized, setIsInitialized] = useState(false)
  const [showError, setShowError] = useState(false)
  const [participants, setParticipants] = useState<VideoParticipant[]>([])
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  // Add debug logging
  const addDebugLog = useCallback((message: string) => {
    console.log('[Test Meeting Debug]:', message)
    setDebugInfo(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`])
  }, [])

  // Initialize WebRTC when component mounts
  useEffect(() => {
    if (isInitialized) return

    const initializeWebRTC = async () => {
      try {
        addDebugLog('Initializing WebRTC...')
        await initialize(mockUser.id)
        addDebugLog('WebRTC initialized successfully')
        setIsInitialized(true)
      } catch (err) {
        console.error('Failed to initialize WebRTC:', err)
        addDebugLog(`WebRTC initialization failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
        setShowError(true)
      }
    }

    initializeWebRTC()
  }, [initialize, isInitialized, addDebugLog, mockUser.id])

  // Join room when initialized
  useEffect(() => {
    if (!isInitialized || !isConnected || !roomId) return

    const joinMeetingRoom = async () => {
      try {
        addDebugLog(`Joining room: ${roomId}`)
        await joinRoom(roomId)
        addDebugLog('Successfully joined room')
      } catch (err) {
        console.error('Failed to join room:', err)
        addDebugLog(`Failed to join room: ${err instanceof Error ? err.message : 'Unknown error'}`)
        setShowError(true)
      }
    }

    joinMeetingRoom()
  }, [isInitialized, isConnected, roomId, joinRoom, addDebugLog])

  // Update participants list
  useEffect(() => {
    const participantList: VideoParticipant[] = []

    // Add local participant
    if (mockUser) {
      if (localStream) {
        addDebugLog('Local stream available, adding local participant')
        participantList.push({
          id: mockUser.id,
          name: mockUser.user_metadata?.full_name || mockUser.email || 'You',
          stream: localStream,
          isVideoEnabled,
          isAudioEnabled,
          isLocal: true
        })
      } else {
        addDebugLog('No local stream available yet')
        // Add participant without stream to show placeholder
        participantList.push({
          id: mockUser.id,
          name: mockUser.user_metadata?.full_name || mockUser.email || 'You',
          stream: null,
          isVideoEnabled: false,
          isAudioEnabled: false,
          isLocal: true
        })
      }
    }

    // Add remote participants
    remoteStreams.forEach((stream, peerId) => {
      const peerConnection = peers.get(peerId)
      if (peerConnection) {
        addDebugLog(`Adding remote participant: ${peerId}`)
        participantList.push({
          id: peerId,
          name: `Participant ${peerId.slice(0, 8)}`,
          stream,
          isVideoEnabled: true,
          isAudioEnabled: true,
          isLocal: false
        })
      }
    })

    setParticipants(participantList)
    addDebugLog(`Updated participants list: ${participantList.length} participants`)
  }, [mockUser, localStream, remoteStreams, peers, isVideoEnabled, isAudioEnabled, addDebugLog])

  // Handle end call
  const handleEndCall = useCallback(() => {
    leaveRoom()
    disconnect()
    window.location.href = '/'
  }, [leaveRoom, disconnect])

  // Handle errors
  useEffect(() => {
    if (error) {
      setShowError(true)
    }
  }, [error])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isConnected) {
        leaveRoom()
        disconnect()
      }
    }
  }, [isConnected, leaveRoom, disconnect])

  // Show error state
  if (showError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="max-w-md p-6 mx-auto text-center">
          <ExclamationTriangleIcon className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="mb-2 text-2xl font-bold text-white">Connection Error</h2>
          <p className="mb-6 text-gray-300">
            {error || 'Failed to connect to the meeting. Please check your camera/microphone permissions.'}
          </p>
          
          {/* Debug Information */}
          {debugInfo.length > 0 && (
            <div className="p-3 mb-4 text-left bg-gray-800 rounded">
              <p className="mb-2 text-sm text-gray-400">Debug Information:</p>
              {debugInfo.map((info, index) => (
                <p key={index} className="font-mono text-xs text-gray-500">{info}</p>
              ))}
            </div>
          )}
          
          <div className="space-y-3">
            <button
              onClick={() => {
                setShowError(false)
                setIsInitialized(false)
              }}
              className="w-full px-4 py-2 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full px-4 py-2 font-medium text-white transition-colors bg-gray-600 rounded-lg hover:bg-gray-700"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show connecting state
  if (isConnecting || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center text-white">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-white rounded-full animate-spin"></div>
          <p className="mb-2 text-lg font-medium">Connecting to test meeting...</p>
          <p className="text-gray-400">Room ID: {roomId}</p>
          
          {/* Debug logs during connection */}
          {debugInfo.length > 0 && (
            <div className="max-w-md p-3 mx-auto mt-4 bg-gray-800 rounded">
              <p className="mb-2 text-sm text-gray-400">Debug:</p>
              {debugInfo.slice(-3).map((info, index) => (
                <p key={index} className="font-mono text-xs text-gray-500">{info}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-white">
            Test Meeting Room
          </h1>
          <span className="text-sm text-gray-400">
            ID: {roomId}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <>
                <SignalIcon className="w-5 h-5 text-green-400" />
                <span className="text-sm text-green-400">Connected</span>
              </>
            ) : (
              <>
                <SignalSlashIcon className="w-5 h-5 text-red-400" />
                <span className="text-sm text-red-400">Disconnected</span>
              </>
            )}
          </div>
          
          {/* Participant Count */}
          <div className="text-sm text-gray-400">
            {participants.length} participant{participants.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Debug Panel */}
        <div className="p-3 mb-4 bg-gray-800 rounded">
          <h3 className="mb-2 text-sm font-medium text-white">Camera Test Debug Info</h3>
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-300">
            <div>
              <p>Local Stream: {localStream ? '✅ Active' : '❌ None'}</p>
              <p>Video Enabled: {isVideoEnabled ? '✅' : '❌'}</p>
              <p>Audio Enabled: {isAudioEnabled ? '✅' : '❌'}</p>
            </div>
            <div>
              <p>Connected: {isConnected ? '✅' : '❌'}</p>
              <p>Participants: {participants.length}</p>
              <p>Remote Streams: {remoteStreams.size}</p>
            </div>
          </div>
          {debugInfo.length > 0 && (
            <div className="mt-2 overflow-y-auto max-h-20">
              {debugInfo.map((info, index) => (
                <p key={index} className="font-mono text-xs text-gray-500">{info}</p>
              ))}
            </div>
          )}
        </div>

        {/* Video Grid */}
        <div className="flex-1 mb-4">
          <VideoGrid
            participants={participants}
            className="h-full min-h-[400px]"
            maxParticipants={12}
            showControls={true}
          />
        </div>

        {/* Controls */}
        <div className="flex justify-center">
          <VideoControls
            isVideoEnabled={isVideoEnabled}
            isAudioEnabled={isAudioEnabled}
            isConnected={isConnected}
            participantCount={participants.length}
            onToggleVideo={toggleVideo}
            onToggleAudio={toggleAudio}
            onEndCall={handleEndCall}
            showParticipantCount={true}
            showChatButton={true}
            showShareButton={true}
          />
        </div>
      </div>
    </div>
  )
}