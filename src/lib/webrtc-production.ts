// Production WebRTC Service with Open Relay Project (Metered) TURN servers
import { io, Socket } from 'socket.io-client'

export interface PeerConnection {
  id: string
  peer: RTCPeerConnection
  stream?: MediaStream
  dataChannel?: RTCDataChannel
}

export interface WebRTCConfig {
  iceServers: RTCIceServer[]
  iceGatheringTimeout?: number
  connectionTimeout?: number
}

export class ProductionWebRTCService {
  private socket: Socket | null = null
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
  public onDataChannelMessage?: (peerId: string, message: any) => void

  constructor(config?: Partial<WebRTCConfig>) {
    // Get STUN servers from environment or use defaults
    const stunServers = process.env.NEXT_PUBLIC_STUN_SERVERS?.split(',').map(url => ({ urls: url.trim() })) || [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]

    // Get TURN server configuration from environment (Open Relay Project)
    const turnConfig: RTCIceServer[] = []
    if (process.env.NEXT_PUBLIC_TURN_SERVER_URL) {
      turnConfig.push({
        urls: process.env.NEXT_PUBLIC_TURN_SERVER_URL,
        username: process.env.NEXT_PUBLIC_TURN_SERVER_USERNAME,
        credential: process.env.NEXT_PUBLIC_TURN_SERVER_CREDENTIAL
      })

      // Add backup TURN servers for better reliability
      if (process.env.NEXT_PUBLIC_TURN_SERVER_URL.includes('openrelay.metered.ca')) {
        turnConfig.push(
          {
            urls: 'turn:openrelay.metered.ca:443',
            username: 'openrelayproject',
            credential: 'openrelayproject'
          },
          {
            urls: 'turns:openrelay.metered.ca:443',
            username: 'openrelayproject',
            credential: 'openrelayproject'
          }
        )
      }
    }

    this.config = {
      iceServers: [
        ...stunServers,
        ...turnConfig,
        ...(config?.iceServers || [])
      ],
      iceGatheringTimeout: parseInt(process.env.NEXT_PUBLIC_ICE_GATHERING_TIMEOUT || '5000'),
      connectionTimeout: parseInt(process.env.NEXT_PUBLIC_CONNECTION_TIMEOUT || '10000')
    }

    console.log('WebRTC ICE Servers configured:', this.config.iceServers.length)
  }

  /**
   * Initialize the WebRTC service with Socket.io connection
   */
  async initialize(socketUrl: string, userId: string): Promise<void> {
    try {
      this.userId = userId
      
      // Initialize Socket.io connection
      this.socket = io(socketUrl, {
        transports: ['websocket'],
        auth: { userId },
        timeout: this.config.connectionTimeout
      })

      this.setupSocketListeners()
      
      return new Promise((resolve, reject) => {
        if (!this.socket) return reject(new Error('Socket not initialized'))
        
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'))
        }, this.config.connectionTimeout)

        this.socket.on('connect', () => {
          clearTimeout(timeout)
          console.log('Connected to signaling server')
          resolve()
        })

        this.socket.on('connect_error', (error: any) => {
          clearTimeout(timeout)
          console.error('Socket connection error:', error)
          reject(error)
        })
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

      // Enhanced constraints for better quality
      const enhancedConstraints: MediaStreamConstraints = {
        video: constraints.video ? {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 },
          facingMode: 'user'
        } : false,
        audio: constraints.audio ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } : false
      }

      const stream = await navigator.mediaDevices.getUserMedia(enhancedConstraints)
      this.localStream = stream
      
      // Set up track event listeners
      stream.getTracks().forEach(track => {
        track.addEventListener('ended', () => {
          console.log('Track ended:', track.kind)
          this.onError?.(new Error(`${track.kind} track ended unexpectedly`))
        })
      })

      this.onLocalStream?.(stream)
      return stream
    } catch (error) {
      console.error('Failed to get user media:', error)
      
      // Provide more specific error messages
      let errorMessage = 'Failed to access camera/microphone'
      if (error instanceof Error) {
        switch (error.name) {
          case 'NotAllowedError':
            errorMessage = 'Camera/microphone access denied. Please allow permissions and refresh.'
            break
          case 'NotFoundError':
            errorMessage = 'No camera/microphone found. Please check your devices.'
            break
          case 'NotReadableError':
            errorMessage = 'Camera/microphone is already in use by another application.'
            break
          case 'OverconstrainedError':
            errorMessage = 'Camera/microphone constraints not supported by your device.'
            break
          case 'SecurityError':
            errorMessage = 'Security error - ensure HTTPS in production.'
            break
        }
      }
      
      const enhancedError = new Error(errorMessage)
      this.onError?.(enhancedError)
      throw enhancedError
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
      connection.peer.close()
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

    // Notify peers about video state change
    this.peers.forEach((connection) => {
      if (connection.dataChannel && connection.dataChannel.readyState === 'open') {
        connection.dataChannel.send(JSON.stringify({
          type: 'video-toggle',
          enabled
        }))
      }
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

    // Notify peers about audio state change
    this.peers.forEach((connection) => {
      if (connection.dataChannel && connection.dataChannel.readyState === 'open') {
        connection.dataChannel.send(JSON.stringify({
          type: 'audio-toggle',
          enabled
        }))
      }
    })
  }

  /**
   * Send data to a specific peer
   */
  sendDataToPeer(peerId: string, data: any): void {
    const connection = this.peers.get(peerId)
    if (connection?.dataChannel && connection.dataChannel.readyState === 'open') {
      connection.dataChannel.send(JSON.stringify(data))
    }
  }

  /**
   * Send data to all peers
   */
  broadcastData(data: any): void {
    this.peers.forEach((connection, peerId) => {
      this.sendDataToPeer(peerId, data)
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
   * Get connection statistics
   */
  async getConnectionStats(peerId: string): Promise<RTCStatsReport | null> {
    const connection = this.peers.get(peerId)
    if (connection) {
      return await connection.peer.getStats()
    }
    return null
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    this.leaveRoom()
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop()
        console.log('Stopped track:', track.kind)
      })
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
    this.socket.on('user-joined', ({ userId: peerId }: { userId: string }) => {
      console.log('User joined:', peerId)
      this.createPeerConnection(peerId, true)
    })

    // Handle peer leaving
    this.socket.on('user-left', ({ userId: peerId }: { userId: string }) => {
      console.log('User left:', peerId)
      this.removePeerConnection(peerId)
    })

    // Handle signaling data
    this.socket.on('signal', async ({ from, signal }: { from: string, signal: any }) => {
      const peerConnection = this.peers.get(from)
      if (peerConnection) {
        try {
          if (signal.type === 'offer') {
            await peerConnection.peer.setRemoteDescription(signal)
            const answer = await peerConnection.peer.createAnswer()
            await peerConnection.peer.setLocalDescription(answer)
            
            this.socket?.emit('signal', {
              to: from,
              signal: answer
            })
          } else if (signal.type === 'answer') {
            await peerConnection.peer.setRemoteDescription(signal)
          } else if (signal.candidate) {
            await peerConnection.peer.addIceCandidate(signal)
          }
        } catch (error) {
          console.error('Error handling signal:', error)
          this.onError?.(error as Error)
        }
      }
    })

    // Handle room joined confirmation
    this.socket.on('room-joined', ({ roomId, users }: { roomId: string, users: string[] }) => {
      console.log('Joined room:', roomId, 'with users:', users)
      
      // Create peer connections for existing users
      users.forEach((userId: string) => {
        if (userId !== this.userId) {
          this.createPeerConnection(userId, false)
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
  private async createPeerConnection(peerId: string, initiator: boolean): Promise<void> {
    try {
      const peer = new RTCPeerConnection({
        iceServers: this.config.iceServers,
        iceCandidatePoolSize: 10
      })

      const peerConnection: PeerConnection = {
        id: peerId,
        peer
      }

      // Add local stream to peer connection
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          peer.addTrack(track, this.localStream!)
        })
      }

      // Create data channel for additional communication
      if (initiator) {
        const dataChannel = peer.createDataChannel('data', {
          ordered: true
        })
        peerConnection.dataChannel = dataChannel
        this.setupDataChannel(dataChannel, peerId)
      }

      // Handle data channel from remote peer
      peer.ondatachannel = (event) => {
        const dataChannel = event.channel
        peerConnection.dataChannel = dataChannel
        this.setupDataChannel(dataChannel, peerId)
      }

      // Handle ICE candidates
      peer.onicecandidate = (event) => {
        if (event.candidate && this.socket) {
          this.socket.emit('signal', {
            to: peerId,
            signal: event.candidate
          })
        }
      }

      // Handle incoming stream
      peer.ontrack = (event) => {
        console.log('Received stream from peer:', peerId)
        const [stream] = event.streams
        peerConnection.stream = stream
        this.onRemoteStream?.(peerId, stream)
      }

      // Handle connection state changes
      peer.onconnectionstatechange = () => {
        console.log(`Connection state for ${peerId}:`, peer.connectionState)
        this.onConnectionStateChange?.(peerId, peer.connectionState)
        
        switch (peer.connectionState) {
          case 'connected':
            this.onPeerJoined?.(peerId, peerConnection.stream)
            break
          case 'disconnected':
            // Attempt reconnection after a delay
            setTimeout(() => {
              if (peer.connectionState === 'disconnected') {
                this.attemptReconnection(peerId)
              }
            }, 3000)
            break
          case 'failed':
            this.handleConnectionFailure(peerId)
            break
          case 'closed':
            this.removePeerConnection(peerId)
            break
        }
      }

      // Handle ICE connection state changes
      peer.oniceconnectionstatechange = () => {
        console.log(`ICE connection state for ${peerId}:`, peer.iceConnectionState)
        
        if (peer.iceConnectionState === 'failed') {
          // Restart ICE
          peer.restartIce()
        }
      }

      this.peers.set(peerId, peerConnection)

      // Create offer if initiator
      if (initiator) {
        const offer = await peer.createOffer()
        await peer.setLocalDescription(offer)
        
        this.socket?.emit('signal', {
          to: peerId,
          signal: offer
        })
      }

    } catch (error) {
      console.error('Failed to create peer connection:', error)
      this.onError?.(error as Error)
    }
  }

  /**
   * Setup data channel event listeners
   */
  private setupDataChannel(dataChannel: RTCDataChannel, peerId: string): void {
    dataChannel.onopen = () => {
      console.log('Data channel opened with:', peerId)
    }

    dataChannel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.onDataChannelMessage?.(peerId, data)
      } catch (error) {
        console.error('Error parsing data channel message:', error)
      }
    }

    dataChannel.onerror = (error) => {
      console.error('Data channel error:', error)
    }

    dataChannel.onclose = () => {
      console.log('Data channel closed with:', peerId)
    }
  }

  /**
   * Remove a peer connection
   */
  private removePeerConnection(peerId: string): void {
    const peerConnection = this.peers.get(peerId)
    if (peerConnection) {
      peerConnection.peer.close()
      this.peers.delete(peerId)
      this.onPeerLeft?.(peerId)
    }
  }

  /**
   * Attempt to reconnect to a peer
   */
  private async attemptReconnection(peerId: string): Promise<void> {
    console.log('Attempting reconnection to:', peerId)
    this.removePeerConnection(peerId)
    
    // Wait a bit before attempting reconnection
    setTimeout(() => {
      this.createPeerConnection(peerId, true)
    }, 1000)
  }

  /**
   * Handle connection failure
   */
  private handleConnectionFailure(peerId: string): void {
    console.error('Connection failed with peer:', peerId)
    this.onError?.(new Error(`Connection failed with peer: ${peerId}`))
    this.removePeerConnection(peerId)
  }
}

// Singleton instance
let productionWebrtcService: ProductionWebRTCService | null = null

export const getProductionWebRTCService = (): ProductionWebRTCService => {
  if (!productionWebrtcService) {
    productionWebrtcService = new ProductionWebRTCService()
  }
  return productionWebrtcService
}

export default ProductionWebRTCService