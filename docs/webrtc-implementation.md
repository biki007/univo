# WebRTC Implementation Guide

## Overview

The Univio platform implements real-time video conferencing using WebRTC (Web Real-Time Communication) technology combined with Socket.io for signaling. This document outlines the architecture and implementation details.

## Architecture

### Core Components

1. **WebRTC Service** (`src/lib/webrtc.ts`)
   - Manages peer-to-peer connections
   - Handles media streams (audio/video)
   - Implements signaling through Socket.io
   - Provides connection state management

2. **WebRTC Hook** (`src/hooks/useWebRTC.ts`)
   - React hook for WebRTC functionality
   - State management for connections and streams
   - Event handling and cleanup
   - Easy integration with React components

3. **Video Components**
   - `VideoStream`: Individual video stream display
   - `VideoGrid`: Multi-participant video layout
   - `VideoControls`: Audio/video control interface

4. **Meeting Room** (`src/app/meeting/[roomId]/page.tsx`)
   - Complete meeting interface
   - Participant management
   - Real-time connection status
   - Error handling and recovery

## Key Features

### Real-time Communication
- **Peer-to-peer video/audio streaming** using WebRTC
- **Signaling server** communication via Socket.io
- **STUN servers** for NAT traversal
- **Automatic reconnection** handling

### Media Management
- **Camera and microphone access** with permission handling
- **Video/audio toggle** controls
- **Stream quality** optimization
- **Mirror effect** for local video

### User Interface
- **Responsive video grid** with automatic layout
- **Participant status indicators** (audio/video state)
- **Connection status** monitoring
- **Error states** with recovery options

## Implementation Details

### WebRTC Service

```typescript
// Initialize WebRTC service
const webrtcService = getWebRTCService()
await webrtcService.initialize(socketUrl, userId)

// Get user media
const stream = await webrtcService.getUserMedia({
  video: true,
  audio: true
})

// Join a room
await webrtcService.joinRoom(roomId)

// Toggle media
webrtcService.toggleVideo(enabled)
webrtcService.toggleAudio(enabled)
```

### React Hook Usage

```typescript
// Use WebRTC hook in components
const {
  isConnected,
  localStream,
  remoteStreams,
  peers,
  isVideoEnabled,
  isAudioEnabled,
  initialize,
  joinRoom,
  toggleVideo,
  toggleAudio
} = useWebRTC()

// Initialize and join room
useEffect(() => {
  initialize(userId).then(() => {
    joinRoom(roomId)
  })
}, [])
```

### Video Components

```typescript
// Display video stream
<VideoStream
  stream={localStream}
  muted={true}
  mirror={true}
  className="w-full h-full"
/>

// Video grid for multiple participants
<VideoGrid
  participants={participants}
  maxParticipants={12}
  showControls={true}
/>

// Video controls
<VideoControls
  isVideoEnabled={isVideoEnabled}
  isAudioEnabled={isAudioEnabled}
  onToggleVideo={toggleVideo}
  onToggleAudio={toggleAudio}
  onEndCall={handleEndCall}
/>
```

## Configuration

### Environment Variables

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### STUN Servers

The implementation uses Google's public STUN servers:
- `stun:stun.l.google.com:19302`
- `stun:stun1.l.google.com:19302`

For production, consider using your own STUN/TURN servers.

## Socket.io Events

### Client Events
- `join-room`: Join a meeting room
- `leave-room`: Leave a meeting room
- `signal`: Send signaling data to peers

### Server Events
- `user-joined`: New user joined the room
- `user-left`: User left the room
- `signal`: Receive signaling data from peers
- `room-joined`: Confirmation of room join
- `error`: Connection or room errors

## Error Handling

The implementation includes comprehensive error handling:

1. **Connection Errors**: Network issues, server unavailable
2. **Media Errors**: Camera/microphone access denied
3. **Peer Errors**: WebRTC connection failures
4. **Room Errors**: Invalid room ID, room full

## Browser Compatibility

### Supported Browsers
- Chrome 56+
- Firefox 52+
- Safari 11+
- Edge 79+

### Required Permissions
- Camera access
- Microphone access
- Secure context (HTTPS) for production

## Performance Considerations

### Optimization Strategies
1. **Adaptive bitrate** based on network conditions
2. **Video resolution** scaling for multiple participants
3. **Audio processing** with echo cancellation
4. **Connection monitoring** and automatic recovery

### Scalability
- Current implementation supports up to 12 participants per room
- For larger meetings, consider implementing SFU (Selective Forwarding Unit)
- Monitor bandwidth usage and implement quality controls

## Security

### Best Practices
1. **Secure signaling** over HTTPS/WSS
2. **User authentication** before joining rooms
3. **Room access control** with permissions
4. **Media encryption** (built into WebRTC)

## Testing

### Manual Testing
1. Open two browser windows
2. Login with different accounts
3. Create a meeting in one window
4. Join the meeting from the other window
5. Test video/audio controls

### Automated Testing
- Unit tests for WebRTC service
- Integration tests for React hooks
- E2E tests for meeting flow

## Troubleshooting

### Common Issues

1. **No video/audio**
   - Check browser permissions
   - Verify HTTPS connection
   - Test camera/microphone access

2. **Connection failures**
   - Check network connectivity
   - Verify STUN server accessibility
   - Review firewall settings

3. **Poor quality**
   - Monitor bandwidth usage
   - Check CPU utilization
   - Adjust video resolution

### Debug Tools
- Browser developer tools
- WebRTC internals (`chrome://webrtc-internals/`)
- Network monitoring tools

## Future Enhancements

### Planned Features
1. **Screen sharing** implementation
2. **Recording** functionality
3. **Chat integration** with video
4. **Virtual backgrounds** and filters
5. **Mobile app** support

### Performance Improvements
1. **SFU implementation** for larger meetings
2. **Bandwidth adaptation** algorithms
3. **Quality metrics** and monitoring
4. **Load balancing** for signaling servers

## Dependencies

### Core Libraries
- `simple-peer`: WebRTC wrapper library
- `socket.io-client`: Real-time communication
- `@heroicons/react`: UI icons

### Development Dependencies
- `@types/simple-peer`: TypeScript definitions
- Next.js 14+ for React framework
- Tailwind CSS for styling

## Support

For issues and questions:
1. Check browser console for errors
2. Review network connectivity
3. Verify server configuration
4. Test with different browsers/devices

---

*Last updated: January 2025*