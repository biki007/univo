// Mock WebRTC service for testing without backend server
export interface PeerConnection {
  id: string
  peer: any
  stream?: MediaStream
}

export interface WebRTCConfig {
  iceServers: RTCIceServer[]
}

export class MockWebRTCService {
  private localStream: MediaStream | null = null
  private peers: Map<string, PeerConnection> = new Map()
  private roomId: string | null = null
  private userId: string | null = null
  private config: WebRTCConfig

  // Event callbacks
  public onPeerJoined?: (peerId: string, stream?: MediaStream) => void
  public onPeerLeft?: (peerId: string) => void
  public onLocalStream?: (stream: MediaStream) => void
  public onRemoteStream?: (peerId: string, stream: MediaStream) => void
  public onError?: (error: Error) => void
  public onConnectionStateChange?: (peerId: string, state: string) => void

  constructor(config?: Partial<WebRTCConfig>) {
    this.config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        ...(config?.iceServers || [])
      ]
    }
  }

  /**
   * Initialize the WebRTC service (mock)
   */
  async initialize(socketUrl: string, userId: string): Promise<void> {
    try {
      this.userId = userId
      console.log('Mock WebRTC service initialized for user:', userId)
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return Promise.resolve()
    } catch (error) {
      console.error('Failed to initialize mock WebRTC service:', error)
      this.onError?.(error as Error)
      throw error
    }
  }

  /**
   * Get user media (camera and microphone)
   */
  async getUserMedia(constraints: MediaStreamConstraints = { video: true, audio: true }): Promise<MediaStream> {
    try {
      console.log('Requesting user media with constraints:', constraints)
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      this.localStream = stream
      this.onLocalStream?.(stream)
      console.log('User media obtained successfully')
      return stream
    } catch (error) {
      console.error('Failed to get user media:', error)
      this.onError?.(error as Error)
      throw error
    }
  }

  /**
   * Join a meeting room (mock)
   */
  async joinRoom(roomId: string): Promise<void> {
    console.log('Joining room:', roomId)
    this.roomId = roomId
    
    // Simulate joining room
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // For demo purposes, create a mock peer after 2 seconds
    setTimeout(() => {
      this.createMockPeer()
    }, 2000)
    
    return Promise.resolve()
  }

  /**
   * Leave the current room
   */
  leaveRoom(): void {
    console.log('Leaving room:', this.roomId)
    
    // Close all peer connections
    this.peers.forEach((connection) => {
      this.onPeerLeft?.(connection.id)
    })
    this.peers.clear()
    
    this.roomId = null
  }

  /**
   * Toggle local video
   */
  toggleVideo(enabled: boolean): void {
    if (!this.localStream) return

    const videoTracks = this.localStream.getVideoTracks()
    videoTracks.forEach(track => {
      track.enabled = enabled
    })
    console.log('Video toggled:', enabled)
  }

  /**
   * Toggle local audio
   */
  toggleAudio(enabled: boolean): void {
    if (!this.localStream) return

    const audioTracks = this.localStream.getAudioTracks()
    audioTracks.forEach(track => {
      track.enabled = enabled
    })
    console.log('Audio toggled:', enabled)
  }

  /**
   * Get current peer connections
   */
  getPeers(): Map<string, PeerConnection> {
    return this.peers
  }

  /**
   * Get local stream
   */
  getLocalStream(): MediaStream | null {
    return this.localStream
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    this.leaveRoom()
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
      this.localStream = null
    }
    
    console.log('Mock WebRTC service disconnected')
  }

  /**
   * Create a mock peer for testing
   */
  private createMockPeer(): void {
    const mockPeerId = 'mock-peer-' + Math.random().toString(36).substring(7)
    
    const mockPeer: PeerConnection = {
      id: mockPeerId,
      peer: { destroy: () => {} } // Mock peer object
    }
    
    this.peers.set(mockPeerId, mockPeer)
    this.onPeerJoined?.(mockPeerId)
    this.onConnectionStateChange?.(mockPeerId, 'connected')
    
    console.log('Mock peer created:', mockPeerId)
  }
}

// Singleton instance
let mockWebrtcService: MockWebRTCService | null = null

export const getMockWebRTCService = (): MockWebRTCService => {
  if (!mockWebrtcService) {
    mockWebrtcService = new MockWebRTCService()
  }
  return mockWebrtcService
}

export default MockWebRTCService