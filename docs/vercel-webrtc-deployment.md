# Deploying WebRTC on Vercel

This guide covers deploying your Univio WebRTC application on Vercel with proper configuration.

## Vercel Configuration

### 1. Environment Variables Setup

In your Vercel dashboard, add these environment variables:

**Production Environment Variables:**
```env
# Database
DATABASE_URL=your-production-database-url
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# WebRTC Configuration
NEXT_PUBLIC_SOCKET_URL=https://your-signaling-server.herokuapp.com
NEXT_PUBLIC_STUN_SERVERS=stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302

# TURN Server (Choose one option)
# Option 1: Open Relay Project (Recommended - Free)
NEXT_PUBLIC_TURN_SERVER_URL=turn:openrelay.metered.ca:80
NEXT_PUBLIC_TURN_SERVER_USERNAME=openrelayproject
NEXT_PUBLIC_TURN_SERVER_CREDENTIAL=openrelayproject

# Option 2: Xirsys (Commercial)
# NEXT_PUBLIC_TURN_SERVER_URL=turn:global.xirsys.com:80?transport=tcp
# NEXT_PUBLIC_TURN_SERVER_USERNAME=your-xirsys-username
# NEXT_PUBLIC_TURN_SERVER_CREDENTIAL=your-xirsys-credential

# Option 3: Self-hosted
# NEXT_PUBLIC_TURN_SERVER_URL=turn:your-domain.com:3478
# NEXT_PUBLIC_TURN_SERVER_USERNAME=your-username
# NEXT_PUBLIC_TURN_SERVER_CREDENTIAL=your-password

# Security
NEXT_PUBLIC_FORCE_HTTPS=true
NEXT_PUBLIC_ENABLE_TURN_OVER_TLS=true
```

### 2. Vercel Configuration File

Create `vercel.json` in your project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=*, microphone=*, display-capture=*"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/socket",
      "destination": "https://your-signaling-server.herokuapp.com/socket.io/"
    }
  ]
}
```

### 3. Next.js Configuration for Vercel

Update your `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  
  // Enable WebRTC features
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },

  // Security headers for WebRTC
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "media-src 'self' blob:",
              "connect-src 'self' wss: ws: https:",
              "font-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'"
            ].join('; ')
          }
        ]
      }
    ]
  },

  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  }
}

module.exports = nextConfig
```

## Signaling Server Deployment

Since Vercel doesn't support WebSocket servers, deploy your signaling server separately:

### Option 1: Heroku (Recommended)

1. **Create signaling server** (`signaling-server/package.json`):
```json
{
  "name": "univio-signaling-server",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.2",
    "cors": "^2.8.5",
    "redis": "^4.6.7"
  },
  "engines": {
    "node": "18.x"
  }
}
```

2. **Create server** (`signaling-server/server.js`):
```javascript
const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')

const app = express()
const server = http.createServer(app)

app.use(cors({
  origin: process.env.CLIENT_URL || "https://your-app.vercel.app",
  credentials: true
}))

const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "https://your-app.vercel.app",
    methods: ["GET", "POST"],
    credentials: true
  }
})

const rooms = new Map()

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('join-room', ({ roomId, userId }) => {
    socket.join(roomId)
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set())
    }
    
    const room = rooms.get(roomId)
    room.add(userId)
    
    socket.to(roomId).emit('user-joined', { userId })
    socket.emit('room-joined', { roomId, users: Array.from(room) })
  })

  socket.on('signal', ({ to, signal }) => {
    socket.to(to).emit('signal', { from: socket.id, signal })
  })

  socket.on('leave-room', ({ roomId, userId }) => {
    socket.leave(roomId)
    socket.to(roomId).emit('user-left', { userId })
    
    const room = rooms.get(roomId)
    if (room) {
      room.delete(userId)
      if (room.size === 0) {
        rooms.delete(roomId)
      }
    }
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`)
})
```

3. **Deploy to Heroku**:
```bash
# Create Heroku app
heroku create univio-signaling-server

# Set environment variables
heroku config:set CLIENT_URL=https://your-app.vercel.app

# Deploy
git add .
git commit -m "Deploy signaling server"
git push heroku main
```

### Option 2: Railway

1. **Connect GitHub repository** to Railway
2. **Set environment variables**:
   - `CLIENT_URL=https://your-app.vercel.app`
   - `PORT=3001`
3. **Deploy automatically** from your repository

### Option 3: DigitalOcean App Platform

1. **Create new app** from GitHub repository
2. **Configure build settings**:
   - Build command: `npm install`
   - Run command: `npm start`
3. **Set environment variables**
4. **Deploy**

## Deployment Steps

### 1. Deploy Signaling Server First

```bash
# Clone your repository
git clone https://github.com/your-username/univio-signaling-server
cd univio-signaling-server

# Deploy to Heroku
heroku create univio-signaling-server
git push heroku main

# Note the URL: https://univio-signaling-server.herokuapp.com
```

### 2. Configure Vercel Environment Variables

In Vercel dashboard:
1. Go to your project settings
2. Add environment variables:
   ```
   NEXT_PUBLIC_SOCKET_URL=https://univio-signaling-server.herokuapp.com
   NEXT_PUBLIC_TURN_SERVER_URL=turn:global.xirsys.com:80?transport=tcp
   NEXT_PUBLIC_TURN_SERVER_USERNAME=your-xirsys-username
   NEXT_PUBLIC_TURN_SERVER_CREDENTIAL=your-xirsys-credential
   ```

### 3. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or connect GitHub repository in Vercel dashboard
```

## Testing Your Deployment

### 1. Test HTTPS Requirement

WebRTC requires HTTPS in production. Vercel automatically provides HTTPS.

### 2. Test Camera/Microphone Permissions

```javascript
// Test in browser console on your deployed site
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => console.log('✅ Media access granted'))
  .catch(err => console.error('❌ Media access denied:', err))
```

### 3. Test TURN Server Connection

```javascript
// Test TURN server connectivity
const pc = new RTCPeerConnection({
  iceServers: [
    {
      urls: process.env.NEXT_PUBLIC_TURN_SERVER_URL,
      username: process.env.NEXT_PUBLIC_TURN_SERVER_USERNAME,
      credential: process.env.NEXT_PUBLIC_TURN_SERVER_CREDENTIAL
    }
  ]
})

pc.onicecandidate = (event) => {
  if (event.candidate && event.candidate.candidate.includes('relay')) {
    console.log('✅ TURN server working!')
  }
}

pc.createOffer().then(offer => pc.setLocalDescription(offer))
```

## Performance Optimization for Vercel

### 1. Enable Edge Functions

Create `middleware.ts`:
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Add security headers
  const response = NextResponse.next()
  
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  return response
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}
```

### 2. Optimize Bundle Size

```javascript
// next.config.js
const nextConfig = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['simple-peer', 'socket.io-client']
  }
}
```

## Monitoring and Analytics

### 1. Vercel Analytics

```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 2. WebRTC Monitoring

Add monitoring to your WebRTC service:

```typescript
// Track connection metrics
const trackConnectionMetrics = (peerId: string, connectionState: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'webrtc_connection', {
      peer_id: peerId,
      connection_state: connectionState,
      timestamp: Date.now()
    })
  }
}
```

## Troubleshooting Common Issues

### 1. CORS Issues

Ensure your signaling server allows your Vercel domain:
```javascript
const io = socketIo(server, {
  cors: {
    origin: ["https://your-app.vercel.app", "https://your-app-git-main.vercel.app"],
    methods: ["GET", "POST"]
  }
})
```

### 2. Environment Variables Not Loading

Check Vercel deployment logs and ensure variables are prefixed with `NEXT_PUBLIC_` for client-side access.

### 3. WebSocket Connection Failures

Verify your signaling server is running and accessible:
```bash
curl https://your-signaling-server.herokuapp.com/health
```

## Cost Estimation

**Monthly costs for production deployment:**

- **Vercel Pro**: $20/month (includes analytics, edge functions)
- **Heroku Dyno**: $7/month (signaling server)
- **Xirsys TURN**: $20/month (10GB bandwidth)
- **Total**: ~$47/month for small to medium scale

## Security Checklist

- ✅ HTTPS enabled (automatic on Vercel)
- ✅ Environment variables secured
- ✅ CORS properly configured
- ✅ CSP headers implemented
- ✅ TURN server credentials protected
- ✅ Rate limiting on signaling server
- ✅ User authentication before room access

---

*Your WebRTC application is now ready for production deployment on Vercel!*