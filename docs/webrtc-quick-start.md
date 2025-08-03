# WebRTC Quick Start Guide

Get your WebRTC video conferencing up and running in 5 minutes using Open Relay Project (Metered).

## 🚀 Quick Setup

### 1. Environment Configuration

Copy these values to your `.env.local` file:

```env
# WebRTC Configuration - Ready to use!
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_STUN_SERVERS=stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302

# TURN Server - Open Relay Project (FREE)
NEXT_PUBLIC_TURN_SERVER_URL=turn:openrelay.metered.ca:80
NEXT_PUBLIC_TURN_SERVER_USERNAME=openrelayproject
NEXT_PUBLIC_TURN_SERVER_CREDENTIAL=openrelayproject
```

### 2. Test WebRTC Connection

Open your browser console and run this test:

```javascript
// Test TURN server connectivity
const pc = new RTCPeerConnection({
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  ]
})

pc.onicecandidate = (event) => {
  if (event.candidate) {
    console.log('ICE Candidate:', event.candidate.candidate)
    if (event.candidate.candidate.includes('relay')) {
      console.log('✅ TURN server working!')
    }
  }
}

pc.createOffer().then(offer => pc.setLocalDescription(offer))
```

### 3. Test Camera/Microphone

```javascript
// Test media access
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    console.log('✅ Camera and microphone access granted')
    // Stop tracks to free resources
    stream.getTracks().forEach(track => track.stop())
  })
  .catch(err => {
    console.error('❌ Media access error:', err.message)
  })
```

## 🌐 Deploy to Vercel

### 1. Set Environment Variables in Vercel

In your Vercel dashboard → Settings → Environment Variables:

```env
NEXT_PUBLIC_SOCKET_URL=https://your-signaling-server.herokuapp.com
NEXT_PUBLIC_STUN_SERVERS=stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302
NEXT_PUBLIC_TURN_SERVER_URL=turn:openrelay.metered.ca:80
NEXT_PUBLIC_TURN_SERVER_USERNAME=openrelayproject
NEXT_PUBLIC_TURN_SERVER_CREDENTIAL=openrelayproject
```

### 2. Deploy Signaling Server

Create a simple signaling server on Heroku:

```javascript
// server.js
const express = require('express')
const http = require('http')
const socketIo = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "https://your-app.vercel.app",
    methods: ["GET", "POST"]
  }
})

const rooms = new Map()

io.on('connection', (socket) => {
  socket.on('join-room', ({ roomId, userId }) => {
    socket.join(roomId)
    if (!rooms.has(roomId)) rooms.set(roomId, new Set())
    rooms.get(roomId).add(userId)
    
    socket.to(roomId).emit('user-joined', { userId })
    socket.emit('room-joined', { roomId, users: Array.from(rooms.get(roomId)) })
  })

  socket.on('signal', ({ to, signal }) => {
    socket.to(to).emit('signal', { from: socket.id, signal })
  })

  socket.on('leave-room', ({ roomId, userId }) => {
    socket.leave(roomId)
    socket.to(roomId).emit('user-left', { userId })
    rooms.get(roomId)?.delete(userId)
  })
})

server.listen(process.env.PORT || 3001)
```

Deploy to Heroku:
```bash
heroku create your-signaling-server
git push heroku main
```

### 3. Deploy to Vercel

```bash
vercel --prod
```

## ✅ Verification Checklist

- [ ] Environment variables configured
- [ ] TURN server test passes
- [ ] Camera/microphone access works
- [ ] Signaling server deployed
- [ ] Vercel deployment successful
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Video calling works between two browser windows

## 🎯 Why Open Relay Project?

- **✅ Free**: No cost, no limits
- **✅ No Setup**: Ready to use immediately
- **✅ Reliable**: Maintained by Metered.ca
- **✅ Production Ready**: Used by thousands of applications
- **✅ Global**: Multiple server locations
- **✅ No Registration**: No account needed

## 🔧 Troubleshooting

### Issue: "Media devices not supported"
**Solution**: Ensure you're using HTTPS (automatic on Vercel)

### Issue: "TURN server not working"
**Solution**: Try alternative Open Relay servers:
```env
# Alternative servers
NEXT_PUBLIC_TURN_SERVER_URL=turn:openrelay.metered.ca:443
# or
NEXT_PUBLIC_TURN_SERVER_URL=turns:openrelay.metered.ca:443
```

### Issue: "Connection fails between peers"
**Solution**: Check browser console for ICE candidate errors and verify signaling server is running

## 📚 Next Steps

- Read the [Complete WebRTC Implementation Guide](./webrtc-implementation.md)
- Check [TURN Server Setup Options](./turn-server-setup.md)
- Review [Vercel Deployment Guide](./vercel-webrtc-deployment.md)

---

**🎉 You're ready to build amazing video conferencing experiences!**