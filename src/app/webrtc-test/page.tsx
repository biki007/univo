'use client'

import { useState, useEffect, useRef } from 'react'
import { useWebRTC } from '@/hooks/useWebRTC'
import VideoStream from '@/components/video/VideoStream'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function WebRTCTestPage() {
  const [roomId, setRoomId] = useState('')
  const [userId, setUserId] = useState('')
  const [isInRoom, setIsInRoom] = useState(false)
  const [connectionStats, setConnectionStats] = useState<any>(null)
  
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
    getUserMedia,
    disconnect,
    sendDataToPeer,
    broadcastData,
    getConnectionStats
  } = useWebRTC({
    socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
    autoGetUserMedia: false
  })

  // Generate random IDs on component mount
  useEffect(() => {
    setRoomId(`room-${Math.random().toString(36).substring(7)}`)
    setUserId(`user-${Math.random().toString(36).substring(7)}`)
  }, [])

  // Initialize WebRTC when component mounts
  useEffect(() => {
    if (userId && !isConnected && !isConnecting) {
      initialize(userId).catch(console.error)
    }
  }, [userId, isConnected, isConnecting, initialize])

  // Monitor connection stats
  useEffect(() => {
    if (peers.size > 0 && getConnectionStats) {
      const interval = setInterval(async () => {
        const peerId = Array.from(peers.keys())[0]
        const stats = await getConnectionStats(peerId)
        setConnectionStats(stats)
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [peers, getConnectionStats])

  const handleJoinRoom = async () => {
    try {
      if (!isConnected) {
        throw new Error('WebRTC not connected')
      }

      // Get user media first
      await getUserMedia({ video: true, audio: true })
      
      // Join the room
      await joinRoom(roomId)
      setIsInRoom(true)
    } catch (error) {
      console.error('Failed to join room:', error)
    }
  }

  const handleLeaveRoom = () => {
    leaveRoom()
    setIsInRoom(false)
    setConnectionStats(null)
  }

  const handleSendTestMessage = () => {
    if (broadcastData) {
      broadcastData({
        type: 'test-message',
        message: 'Hello from WebRTC test!',
        timestamp: Date.now()
      })
    }
  }

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId)
    alert('Room ID copied to clipboard!')
  }

  return (
    <div className="container max-w-6xl p-6 mx-auto">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">WebRTC Test Page</h1>
        <p className="text-gray-600">
          Test your WebRTC configuration with Open Relay Project TURN servers
        </p>
      </div>

      {/* Connection Status */}
      <Card className="p-4 mb-6">
        <h2 className="mb-3 text-xl font-semibold">Connection Status</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="text-center">
            <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
              isConnected ? 'bg-green-500' : isConnecting ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <p className="text-sm">
              {isConnected ? 'Connected' : isConnecting ? 'Connecting' : 'Disconnected'}
            </p>
          </div>
          <div className="text-center">
            <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
              localStream ? 'bg-green-500' : 'bg-gray-300'
            }`} />
            <p className="text-sm">Local Media</p>
          </div>
          <div className="text-center">
            <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
              peers.size > 0 ? 'bg-green-500' : 'bg-gray-300'
            }`} />
            <p className="text-sm">Peers: {peers.size}</p>
          </div>
          <div className="text-center">
            <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
              isInRoom ? 'bg-green-500' : 'bg-gray-300'
            }`} />
            <p className="text-sm">In Room</p>
          </div>
        </div>
        
        {error && (
          <div className="p-3 mt-4 text-red-700 bg-red-100 border border-red-300 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}
      </Card>

      {/* Room Controls */}
      <Card className="p-4 mb-6">
        <h2 className="mb-3 text-xl font-semibold">Room Controls</h2>
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Room ID"
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isInRoom}
            />
            <Button onClick={copyRoomId} variant="outline">
              Copy Room ID
            </Button>
          </div>
          
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="User ID"
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isInRoom}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {!isInRoom ? (
              <Button 
                onClick={handleJoinRoom}
                disabled={!isConnected || !roomId || !userId}
                className="bg-green-600 hover:bg-green-700"
              >
                Join Room
              </Button>
            ) : (
              <Button 
                onClick={handleLeaveRoom}
                className="bg-red-600 hover:bg-red-700"
              >
                Leave Room
              </Button>
            )}
            
            {isInRoom && (
              <>
                <Button
                  onClick={() => toggleVideo()}
                  variant={isVideoEnabled ? "default" : "outline"}
                >
                  {isVideoEnabled ? 'Disable Video' : 'Enable Video'}
                </Button>
                
                <Button
                  onClick={() => toggleAudio()}
                  variant={isAudioEnabled ? "default" : "outline"}
                >
                  {isAudioEnabled ? 'Disable Audio' : 'Enable Audio'}
                </Button>
                
                {sendDataToPeer && (
                  <Button onClick={handleSendTestMessage} variant="outline">
                    Send Test Message
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Video Streams */}
      <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
        {/* Local Video */}
        <Card className="p-4">
          <h3 className="mb-3 text-lg font-semibold">Local Video</h3>
          <div className="overflow-hidden bg-gray-900 rounded-lg aspect-video">
            {localStream ? (
              <VideoStream
                stream={localStream}
                muted={true}
                mirror={true}
                className="w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-white">
                No local video
              </div>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Video: {isVideoEnabled ? 'On' : 'Off'} | Audio: {isAudioEnabled ? 'On' : 'Off'}
          </div>
        </Card>

        {/* Remote Videos */}
        {Array.from(remoteStreams.entries()).map(([peerId, stream]) => (
          <Card key={peerId} className="p-4">
            <h3 className="mb-3 text-lg font-semibold">Remote Video ({peerId.substring(0, 8)}...)</h3>
            <div className="overflow-hidden bg-gray-900 rounded-lg aspect-video">
              <VideoStream
                stream={stream}
                muted={false}
                mirror={false}
                className="w-full h-full"
              />
            </div>
          </Card>
        ))}
      </div>

      {/* Connection Statistics */}
      {connectionStats && (
        <Card className="p-4 mb-6">
          <h2 className="mb-3 text-xl font-semibold">Connection Statistics</h2>
          <div className="p-3 overflow-auto font-mono text-sm bg-gray-100 rounded max-h-40">
            <pre>{JSON.stringify(connectionStats, null, 2)}</pre>
          </div>
        </Card>
      )}

      {/* Configuration Info */}
      <Card className="p-4">
        <h2 className="mb-3 text-xl font-semibold">Configuration</h2>
        <div className="space-y-2 text-sm">
          <div><strong>Socket URL:</strong> {process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'}</div>
          <div><strong>STUN Servers:</strong> {process.env.NEXT_PUBLIC_STUN_SERVERS || 'Default Google STUN'}</div>
          <div><strong>TURN Server:</strong> {process.env.NEXT_PUBLIC_TURN_SERVER_URL || 'Open Relay Project'}</div>
          <div><strong>Environment:</strong> {process.env.NODE_ENV || 'development'}</div>
        </div>
      </Card>

      {/* Instructions */}
      <Card className="p-4 mt-6 border-blue-200 bg-blue-50">
        <h2 className="mb-3 text-xl font-semibold text-blue-800">How to Test</h2>
        <ol className="space-y-2 text-blue-700 list-decimal list-inside">
          <li>Make sure the signaling server is running on port 3001</li>
          <li>Click &quot;Join Room&quot; to enter the test room</li>
          <li>Open this page in another browser window/tab</li>
          <li>Use the same Room ID in the second window</li>
          <li>Click &quot;Join Room&quot; in the second window</li>
          <li>You should see video streams from both windows</li>
          <li>Test video/audio controls and data messaging</li>
        </ol>
      </Card>
    </div>
  )
}