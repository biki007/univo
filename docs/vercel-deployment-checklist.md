# Vercel Deployment Checklist for WebRTC

## Pre-Deployment Setup

### ✅ 1. Environment Variables
Set these in your Vercel dashboard:

**Required:**
```env
NEXT_PUBLIC_SOCKET_URL=https://your-signaling-server.herokuapp.com
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
DATABASE_URL=your-database-url
```

**WebRTC Configuration:**
```env
NEXT_PUBLIC_STUN_SERVERS=stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302
NEXT_PUBLIC_TURN_SERVER_URL=turn:openrelay.metered.ca:80
NEXT_PUBLIC_TURN_SERVER_USERNAME=openrelayproject
NEXT_PUBLIC_TURN_SERVER_CREDENTIAL=openrelayproject
```

### ✅ 2. Signaling Server Deployment
Deploy your signaling server first (required for WebRTC):

**Option A: Heroku**
```bash
# Create signaling server repository
mkdir univio-signaling-server
cd univio-signaling-server

# Copy server code from docs/vercel-webrtc-deployment.md
# Deploy to Heroku
heroku create univio-signaling-server
git push heroku main
```

**Option B: Railway**
1. Connect GitHub repository to Railway
2. Set `CLIENT_URL=https://your-app.vercel.app`
3. Deploy automatically

### ✅ 3. TURN Server Setup
**Recommended: Open Relay Project (Metered)**

No setup required! Use these credentials:
```env
NEXT_PUBLIC_TURN_SERVER_URL=turn:openrelay.metered.ca:80
NEXT_PUBLIC_TURN_SERVER_USERNAME=openrelayproject
NEXT_PUBLIC_TURN_SERVER_CREDENTIAL=openrelayproject
```

**Alternative: Xirsys (if you need enterprise support)**
1. Sign up at [xirsys.com](https://xirsys.com)
2. Create a channel
3. Get credentials from dashboard
4. Add to Vercel environment variables

### ✅ 4. Files Ready
Ensure these files are in your repository:
- ✅ [`vercel.json`](../vercel.json) - Vercel configuration
- ✅ [`next.config.js`](../next.config.js) - Updated with WebRTC settings
- ✅ [`.env.local.example`](../.env.local.example) - Environment template

## Deployment Steps

### 1. Connect Repository to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure build settings (auto-detected for Next.js)

### 2. Configure Environment Variables
In Vercel dashboard → Settings → Environment Variables:
1. Add all required environment variables
2. Set for Production, Preview, and Development
3. Save changes

### 3. Deploy
1. Trigger deployment from Vercel dashboard
2. Or push to main branch (auto-deploy)
3. Monitor build logs for errors

### 4. Test Deployment
1. Visit your deployed URL
2. Test camera/microphone permissions
3. Test video calling between two browser windows
4. Check browser console for errors

## Post-Deployment Testing

### ✅ Camera/Microphone Test
```javascript
// Test in browser console on deployed site
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    console.log('✅ Media access granted')
    stream.getTracks().forEach(track => track.stop())
  })
  .catch(err => console.error('❌ Media access denied:', err))
```

### ✅ TURN Server Test
```javascript
// Test TURN server connectivity
const pc = new RTCPeerConnection({
  iceServers: [
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject'
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

### ✅ WebSocket Connection Test
```javascript
// Test signaling server connection
const socket = io('https://your-signaling-server.herokuapp.com')
socket.on('connect', () => console.log('✅ Signaling server connected'))
socket.on('connect_error', (err) => console.error('❌ Signaling server error:', err))
```

## Common Issues & Solutions

### 🔧 Issue: "Media devices not supported"
**Solution:** Ensure HTTPS is enabled (automatic on Vercel)

### 🔧 Issue: "CORS error on signaling server"
**Solution:** Update signaling server CORS settings:
```javascript
const io = socketIo(server, {
  cors: {
    origin: ["https://your-app.vercel.app", "https://your-app-git-*.vercel.app"],
    methods: ["GET", "POST"]
  }
})
```

### 🔧 Issue: "Environment variables not loading"
**Solution:** 
1. Ensure variables are prefixed with `NEXT_PUBLIC_` for client-side
2. Redeploy after adding environment variables
3. Check Vercel function logs

### 🔧 Issue: "WebRTC connection fails"
**Solution:**
1. Verify TURN server credentials
2. Check firewall settings
3. Test with different networks

### 🔧 Issue: "Build fails on Vercel"
**Solution:**
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify Next.js configuration

## Performance Monitoring

### Add Vercel Analytics
```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Monitor WebRTC Metrics
Add to your WebRTC service:
```typescript
const trackConnectionMetrics = (event: string, data: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, {
      custom_parameter: data,
      timestamp: Date.now()
    })
  }
}
```

## Security Checklist

- ✅ HTTPS enabled (automatic on Vercel)
- ✅ Environment variables secured in Vercel dashboard
- ✅ CORS properly configured on signaling server
- ✅ CSP headers implemented in `next.config.js`
- ✅ TURN server credentials protected
- ✅ User authentication before room access
- ✅ Rate limiting on signaling server

## Cost Estimation

**Monthly costs for production:**
- Vercel Pro: $20/month
- Heroku Dyno: $7/month (signaling server)
- Xirsys TURN: $20/month (10GB)
- **Total: ~$47/month**

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [WebRTC Troubleshooting](https://webrtc.org/getting-started/testing)
- [Xirsys Support](https://xirsys.com/support)

---

**🚀 Your WebRTC application is ready for production on Vercel!**