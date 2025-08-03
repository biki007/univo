/**
 * Univio Platform - WebRTC Hook
 * Copyright (c) 2025 Univio Team
 * Licensed under the MIT License - see LICENSE file for details
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { ProductionWebRTCService, PeerConnection } from '@/lib/webrtc-production'

// Mock WebRTC service interface for development
interface MockWebRTCService {
  initialize: (socketUrl: string, userId: string) => Promise<void>
  joinRoom: (roomId: string) => Promise<void>
  leaveRoom: () => void
  toggleVideo: (enabled: boolean) => void
  toggleAudio: (enabled: boolean) => void
  getUserMedia: (constraints?: MediaStreamConstraints) => Promise<MediaStream>
  disconnect: () => void
  getPeers: () => Map<string, PeerConnection>
  getLocalStream: () => MediaStream | null
  sendDataToPeer?: (peerId: string, data: any) => void
  broadcastData?: (data: any) => void
  getConnectionStats?: (peerId: string) => Promise<RTCStatsReport | null>
  onPeerJoined?: (peerId: string, stream?: MediaStream) => void
  onPeerLeft?: (peerId: string) => void
  onLocalStream?: (stream: MediaStream) => void
  onRemoteStream?: (peerId: string, stream: MediaStream) => void
  onError?: (error: Error) => void
  onConnectionStateChange?: (peerId: string, state: string) => void
  onDataChannelMessage?: (peerId: string, message: any) => void
}

// Use production WebRTC service or fallback to mock for development
const createWebRTCService = (): ProductionWebRTCService | MockWebRTCService => {
  if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_USE_PRODUCTION_WEBRTC === 'true') {
    return new ProductionWebRTCService()
  }
  
  // Fallback mock service for development without signaling server
  const mockService: MockWebRTCService = {
    async initialize(socketUrl: string, userId: string) {
      console.log('Mock WebRTC initialized for user:', userId)
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('WebRTC is not supported in this browser')
      }
    },
    
    async joinRoom(roomId: string) {
      console.log('Mock: Joined room:', roomId)
    },
    
    leaveRoom() {
      console.log('Mock: Left room')
    },
    
    toggleVideo(enabled: boolean) {
      console.log('Mock: Video toggled:', enabled)
    },
    
    toggleAudio(enabled: boolean) {
      console.log('Mock: Audio toggled:', enabled)
    },
    
    async getUserMedia(constraints: MediaStreamConstraints = { video: true, audio: true }) {
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      mockService.onLocalStream?.(stream)
      return stream
    },
    
    disconnect() {
      console.log('Mock: Disconnected')
    },
    
    getPeers() {
      return new Map<string, PeerConnection>()
    },
    
    getLocalStream() {
      return null
    },
    
    sendDataToPeer(peerId: string, data: any) {
      console.log('Mock: Send data to peer:', peerId, data)
    },
    
    broadcastData(data: any) {
      console.log('Mock: Broadcast data:', data)
    },
    
    async getConnectionStats(peerId: string) {
      return null
    },
    
    onPeerJoined: undefined,
    onPeerLeft: undefined,
    onLocalStream: undefined,
    onRemoteStream: undefined,
    onError: undefined,
    onConnectionStateChange: undefined,
    onDataChannelMessage: undefined
  }
  
  return mockService
}

export interface UseWebRTCOptions {
  socketUrl?: string
  autoGetUserMedia?: boolean
  mediaConstraints?: MediaStreamConstraints
}

export interface UseWebRTCReturn {
  // Connection state
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  
  // Media streams
  localStream: MediaStream | null
  remoteStreams: Map<string, MediaStream>
  
  // Peer connections
  peers: Map<string, PeerConnection>
  
  // Media controls
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  
  // Actions
  initialize: (userId: string) => Promise<void>
  joinRoom: (roomId: string) => Promise<void>
  leaveRoom: () => void
  toggleVideo: () => void
  toggleAudio: () => void
  getUserMedia: (constraints?: MediaStreamConstraints) => Promise<MediaStream>
  disconnect: () => void
  
  // Data channel methods (production only)
  sendDataToPeer?: (peerId: string, data: any) => void
  broadcastData?: (data: any) => void
  getConnectionStats?: (peerId: string) => Promise<RTCStatsReport | null>
}

export const useWebRTC = (options: UseWebRTCOptions = {}): UseWebRTCReturn => {
  const {
    socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
    autoGetUserMedia = true,
    mediaConstraints = { video: true, audio: true }
  } = options

  // State
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map())
  const [peers, setPeers] = useState<Map<string, PeerConnection>>(new Map())
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)

  // Refs
  const webrtcService = useRef<ProductionWebRTCService | MockWebRTCService>(createWebRTCService())
  const currentRoomId = useRef<string | null>(null)
  const currentUserId = useRef<string | null>(null)

  // Initialize WebRTC service
  const initialize = useCallback(async (userId: string) => {
    try {
      setIsConnecting(true)
      setError(null)
      currentUserId.current = userId

      // Setup event handlers
      webrtcService.current.onPeerJoined = (peerId: string, stream?: MediaStream) => {
        console.log('Peer joined:', peerId)
        setPeers(new Map(webrtcService.current.getPeers()))
        
        if (stream) {
          setRemoteStreams(prev => new Map(prev.set(peerId, stream)))
        }
      }

      webrtcService.current.onPeerLeft = (peerId: string) => {
        console.log('Peer left:', peerId)
        setPeers(new Map(webrtcService.current.getPeers()))
        setRemoteStreams(prev => {
          const newMap = new Map(prev)
          newMap.delete(peerId)
          return newMap
        })
      }

      webrtcService.current.onLocalStream = (stream: MediaStream) => {
        console.log('Local stream received')
        setLocalStream(stream)
      }

      webrtcService.current.onRemoteStream = (peerId: string, stream: MediaStream) => {
        console.log('Remote stream received from:', peerId)
        setRemoteStreams(prev => new Map(prev.set(peerId, stream)))
      }

      webrtcService.current.onError = (error: Error) => {
        console.error('WebRTC error:', error)
        setError(error.message)
      }

      webrtcService.current.onConnectionStateChange = (peerId: string, state: string) => {
        console.log('Connection state changed:', peerId, state)
        setPeers(new Map(webrtcService.current.getPeers()))
      }

      // Initialize the service
      try {
        await webrtcService.current.initialize(socketUrl, userId)
      } catch (initError) {
        console.warn('Failed to initialize WebRTC service:', initError)
        // Continue with mock service - it's already a mock implementation
      }
      
      // Get user media if auto-enabled
      if (autoGetUserMedia) {
        try {
          await webrtcService.current.getUserMedia(mediaConstraints)
        } catch (mediaError) {
          console.error('Failed to get user media:', mediaError)
          setError('Camera/microphone access denied. Please allow camera and microphone permissions and refresh the page.')
          throw mediaError
        }
      }

      setIsConnected(true)
      setIsConnecting(false)
    } catch (err) {
      console.error('Failed to initialize WebRTC:', err)
      setError(err instanceof Error ? err.message : 'Failed to initialize WebRTC')
      setIsConnecting(false)
    }
  }, [socketUrl, autoGetUserMedia, mediaConstraints])

  // Join a room
  const joinRoom = useCallback(async (roomId: string) => {
    try {
      if (!isConnected) {
        throw new Error('WebRTC service not initialized')
      }

      setError(null)
      currentRoomId.current = roomId
      await webrtcService.current.joinRoom(roomId)
    } catch (err) {
      console.error('Failed to join room:', err)
      setError(err instanceof Error ? err.message : 'Failed to join room')
    }
  }, [isConnected])

  // Leave room
  const leaveRoom = useCallback(() => {
    try {
      webrtcService.current.leaveRoom()
      currentRoomId.current = null
      setRemoteStreams(new Map())
      setPeers(new Map())
    } catch (err) {
      console.error('Failed to leave room:', err)
      setError(err instanceof Error ? err.message : 'Failed to leave room')
    }
  }, [])

  // Toggle video
  const toggleVideo = useCallback(() => {
    try {
      const newState = !isVideoEnabled
      webrtcService.current.toggleVideo(newState)
      setIsVideoEnabled(newState)
    } catch (err) {
      console.error('Failed to toggle video:', err)
      setError(err instanceof Error ? err.message : 'Failed to toggle video')
    }
  }, [isVideoEnabled])

  // Toggle audio
  const toggleAudio = useCallback(() => {
    try {
      const newState = !isAudioEnabled
      webrtcService.current.toggleAudio(newState)
      setIsAudioEnabled(newState)
    } catch (err) {
      console.error('Failed to toggle audio:', err)
      setError(err instanceof Error ? err.message : 'Failed to toggle audio')
    }
  }, [isAudioEnabled])

  // Get user media
  const getUserMedia = useCallback(async (constraints?: MediaStreamConstraints) => {
    try {
      setError(null)
      const finalConstraints = constraints || mediaConstraints
      const stream = await webrtcService.current.getUserMedia(finalConstraints)
      return stream
    } catch (err) {
      console.error('Failed to get user media:', err)
      setError(err instanceof Error ? err.message : 'Failed to get user media')
      throw err
    }
  }, [mediaConstraints])

  // Send data to specific peer (production only)
  const sendDataToPeer = useCallback((peerId: string, data: any) => {
    if ('sendDataToPeer' in webrtcService.current && webrtcService.current.sendDataToPeer) {
      webrtcService.current.sendDataToPeer(peerId, data)
    }
  }, [])

  // Broadcast data to all peers (production only)
  const broadcastData = useCallback((data: any) => {
    if ('broadcastData' in webrtcService.current && webrtcService.current.broadcastData) {
      webrtcService.current.broadcastData(data)
    }
  }, [])

  // Get connection statistics (production only)
  const getConnectionStats = useCallback(async (peerId: string) => {
    if ('getConnectionStats' in webrtcService.current && webrtcService.current.getConnectionStats) {
      return await webrtcService.current.getConnectionStats(peerId)
    }
    return null
  }, [])

  // Disconnect
  const disconnect = useCallback(() => {
    try {
      webrtcService.current.disconnect()
      setIsConnected(false)
      setLocalStream(null)
      setRemoteStreams(new Map())
      setPeers(new Map())
      currentRoomId.current = null
      currentUserId.current = null
      setError(null)
    } catch (err) {
      console.error('Failed to disconnect:', err)
      setError(err instanceof Error ? err.message : 'Failed to disconnect')
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isConnected) {
        disconnect()
      }
    }
  }, [isConnected, disconnect])

  // Update local stream state when it changes
  useEffect(() => {
    const currentLocalStream = webrtcService.current.getLocalStream()
    if (currentLocalStream !== localStream) {
      setLocalStream(currentLocalStream)
    }
  }, [localStream])

  // Monitor media track states
  useEffect(() => {
    if (!localStream) return

    const videoTracks = localStream.getVideoTracks()
    const audioTracks = localStream.getAudioTracks()

    if (videoTracks.length > 0) {
      setIsVideoEnabled(videoTracks[0].enabled)
    }

    if (audioTracks.length > 0) {
      setIsAudioEnabled(audioTracks[0].enabled)
    }
  }, [localStream])

  return {
    // Connection state
    isConnected,
    isConnecting,
    error,
    
    // Media streams
    localStream,
    remoteStreams,
    
    // Peer connections
    peers,
    
    // Media controls
    isVideoEnabled,
    isAudioEnabled,
    
    // Actions
    initialize,
    joinRoom,
    leaveRoom,
    toggleVideo,
    toggleAudio,
    getUserMedia,
    disconnect,
    
    // Data channel methods (production only)
    sendDataToPeer: 'sendDataToPeer' in webrtcService.current ? sendDataToPeer : undefined,
    broadcastData: 'broadcastData' in webrtcService.current ? broadcastData : undefined,
    getConnectionStats: 'getConnectionStats' in webrtcService.current ? getConnectionStats : undefined
  }
}

export default useWebRTC