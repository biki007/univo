// Mock WebRTC Service for development
// This provides a working interface without external dependencies

export interface PeerConnection {
  id: string
  peer: MockPeer
  stream?: MediaStream
}

export interface WebRTCConfig {
  iceServers: RTCIceServer[]
}

interface MockPeer {
  on: (event: string, callback: (...args: any[]) => void) => void
  signal: (data: any) => void
  destroy: () => void
}

interface MockSocket {
  on: (event: string, callback: (...args: any[]) => void) => void
  emit: (event: string, data?: any) => void
  disconnect: () => void
}

class MockSimplePeer implements MockPeer {
  private eventHandlers: Map<string, Function[]> = new Map()
  
  constructor(private options: any) {
    // Simulate connection after a delay
    setTimeout(() => {
      this.emit('connect')
    }, 1000)
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }
    this.eventHandlers.get(event)!.push(callback)
  }

  signal(data: any) {
    // Mock signal handling
    console.log('Mock peer signal:', data)
  }

  destroy() {
    this.eventHandlers.clear()
  }

  private emit(event: string, ...args: any[]) {
    const handlers = this.eventHandlers.get(event) || []
    handlers.forEach(handler => handler(...args))
  }
}

class MockSocketIO implements MockSocket {
  private eventHandlers: Map<string, Function[]> = new Map()
  private connected = false

  constructor(private url: string, private options: any) {
    // Simulate connection
    setTimeout(() => {
      this.connected = true
      this.emit('connect')
    }, 500)
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }
    this.eventHandlers.get(event)!.push(callback)
  }

  emit(event: string, data?: any) {
    console.log('Mock socket emit:', event, data)
    
    // Simulate some responses
    if (event === 'join-room') {
      setTimeout(() => {
        this.emitEvent('room-joined', { roomId: data.roomId, users: [data.userId] })
      }, 100)
    }
  }

  disconnect() {
    this.connected = false
    this.eventHandlers.clear()
  }

  private emitEvent(event: string, ...args: any[]) {
    const handlers = this.eventHandlers.get(event) || []
    handlers.forEach(handler => handler(...args))
  }
}

export class WebRTCService {
  private socket: MockSocket | null = null
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
    // Get STUN servers from environment or use defaults
    const stunServers = process.env.NEXT_PUBLIC_STUN_SERVERS?.split(',').map(url => ({ urls: url.trim() })) || [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]

    // Get TURN server configuration from environment
    const turnConfig: RTCIceServer[] = []
    if (process.env.NEXT_PUBLIC_TURN_SERVER_URL) {
      turnConfig.push({
        urls: process.env.NEXT_PUBLIC_TURN_SERVER_URL,
        username: process.env.NEXT_PUBLIC_TURN_SERVER_USERNAME,
        credential: process.env.NEXT_PUBLIC_TURN_SERVER_CREDENTIAL
      })
    }

    this.config = {
      iceServers: [
        ...stunServers,
        ...turnConfig,
        ...(config?.iceServers || [])
      ]
    }

    console.log('WebRTC ICE Servers configured:', this.config.iceServers.length)
  }

  /**
   * Initialize the WebRTC service with Socket.io connection
   */
  async initialize(socketUrl: string, userId: string): Promise<void> {
    try {
      this.userId = userId
      this.socket = new MockSocketIO(socketUrl, {
        transports: ['websocket'],
        auth: { userId }
      })

      this.setupSocketListeners()
      
      return new Promise((resolve, reject) => {
        if (!this.socket) return reject(new Error('Socket not initialized'))
        
        this.socket.on('connect', () => {
          console.log('Connected to signaling server')
          resolve()
        })

        this.socket.on('connect_error', (error: any) => {
          console.error('Socket connection error:', error)
          reject(error)
        })

        // Auto-resolve after timeout for mock
        setTimeout(resolve, 1000)
      })
    } catch (error) {
      console.error('Failed to initialize WebRTC service:', error)
      this.onError?.(error as Error)
      throw error
    }
  }

  /**
   * Get user media (camera and microphone)
   */
  async getUserMedia(constraints: MediaStreamConstraints = { video: true, audio: true }): Promise<MediaStream> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media devices not supported')
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      this.localStream = stream
      this.onLocalStream?.(stream)
      return stream
    } catch (error) {
      console.error('Failed to get user media:', error)
      this.onError?.(error as Error)
      throw error
    }
  }

  /**
   * Join a meeting room
   */
  async joinRoom(roomId: string): Promise<void> {
    if (!this.socket) {
      throw new Error('Socket not initialized')
    }

    this.roomId = roomId
    this.socket.emit('join-room', { roomId, userId: this.userId })
  }

  /**
   * Leave the current room
   */
  leaveRoom(): void {
    if (!this.socket || !this.roomId) return

    this.socket.emit('leave-room', { roomId: this.roomId, userId: this.userId })
    
    // Close all peer connections
    this.peers.forEach((connection) => {
      connection.peer.destroy()
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

    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  /**
   * Setup Socket.io event listeners
   */
  private setupSocketListeners(): void {
    if (!this.socket) return

    // Handle new peer joining
    this.socket.on('user-joined', ({ userId: peerId, signal }: { userId: string, signal: any }) => {
      console.log('User joined:', peerId)
      this.createPeerConnection(peerId, false, signal)
    })

    // Handle peer leaving
    this.socket.on('user-left', ({ userId: peerId }: { userId: string }) => {
      console.log('User left:', peerId)
      this.removePeerConnection(peerId)
    })

    // Handle signaling data
    this.socket.on('signal', ({ from, signal }: { from: string, signal: any }) => {
      const peerConnection = this.peers.get(from)
      if (peerConnection) {
        peerConnection.peer.signal(signal)
      }
    })

    // Handle room joined confirmation
    this.socket.on('room-joined', ({ roomId, users }: { roomId: string, users: string[] }) => {
      console.log('Joined room:', roomId, 'with users:', users)
      
      // Create peer connections for existing users
      users.forEach((userId: string) => {
        if (userId !== this.userId) {
          this.createPeerConnection(userId, true)
        }
      })
    })

    // Handle errors
    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error)
      this.onError?.(new Error(error.message || 'Socket error'))
    })
  }

  /**
   * Create a new peer connection
   */
  private createPeerConnection(peerId: string, initiator: boolean, initialSignal?: any): void {
    try {
      const peer = new MockSimplePeer({
        initiator,
        trickle: false,
        stream: this.localStream || undefined,
        config: {
          iceServers: this.config.iceServers
        }
      })

      const peerConnection: PeerConnection = {
        id: peerId,
        peer
      }

      // Handle signaling
      peer.on('signal', (signal: any) => {
        if (this.socket) {
          this.socket.emit('signal', {
            to: peerId,
            signal
          })
        }
      })

      // Handle incoming stream
      peer.on('stream', (stream: MediaStream) => {
        console.log('Received stream from peer:', peerId)
        peerConnection.stream = stream
        this.onRemoteStream?.(peerId, stream)
      })

      // Handle connection state changes
      peer.on('connect', () => {
        console.log('Connected to peer:', peerId)
        this.onPeerJoined?.(peerId, peerConnection.stream)
        this.onConnectionStateChange?.(peerId, 'connected')
      })

      peer.on('close', () => {
        console.log('Peer connection closed:', peerId)
        this.removePeerConnection(peerId)
        this.onConnectionStateChange?.(peerId, 'closed')
      })

      peer.on('error', (error: any) => {
        console.error('Peer connection error:', peerId, error)
        this.onError?.(error)
        this.removePeerConnection(peerId)
      })

      // If we have an initial signal, process it
      if (initialSignal) {
        peer.signal(initialSignal)
      }

      this.peers.set(peerId, peerConnection)
    } catch (error) {
      console.error('Failed to create peer connection:', error)
      this.onError?.(error as Error)
    }
  }

  /**
   * Remove a peer connection
   */
  private removePeerConnection(peerId: string): void {
    const peerConnection = this.peers.get(peerId)
    if (peerConnection) {
      peerConnection.peer.destroy()
      this.peers.delete(peerId)
      this.onPeerLeft?.(peerId)
    }
  }
}

// Singleton instance
let webrtcService: WebRTCService | null = null

export const getWebRTCService = (): WebRTCService => {
  if (!webrtcService) {
    webrtcService = new WebRTCService()
  }
  return webrtcService
}

export default WebRTCService