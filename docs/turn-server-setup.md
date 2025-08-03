# TURN Server Setup Guide

This guide explains how to configure TURN servers for your WebRTC implementation in Univio.

## What is a TURN Server?

TURN (Traversal Using Relays around NAT) servers are used when direct peer-to-peer connection fails due to restrictive firewalls or NAT configurations. They relay media traffic between peers.

## Environment Variables

Your WebRTC configuration uses these environment variables:

```env
NEXT_PUBLIC_TURN_SERVER_URL=turn:your-server.com:3478
NEXT_PUBLIC_TURN_SERVER_USERNAME=your-username
NEXT_PUBLIC_TURN_SERVER_CREDENTIAL=your-password
```

## Option 1: Open Relay Project (Metered) - Recommended

Open Relay Project provides free TURN servers for development and production use.

### Setup Steps:

1. **No Registration Required**
   - Open Relay Project provides free public TURN servers
   - No account creation or API keys needed
   - Ready to use immediately

2. **Configure Environment Variables**
   ```env
   NEXT_PUBLIC_TURN_SERVER_URL=turn:openrelay.metered.ca:80
   NEXT_PUBLIC_TURN_SERVER_USERNAME=openrelayproject
   NEXT_PUBLIC_TURN_SERVER_CREDENTIAL=openrelayproject
   ```

3. **Alternative Servers** (if primary is unavailable)
   ```env
   # Backup server 1
   NEXT_PUBLIC_TURN_SERVER_URL=turn:openrelay.metered.ca:443
   
   # Backup server 2
   NEXT_PUBLIC_TURN_SERVER_URL=turns:openrelay.metered.ca:443
   ```

### Open Relay Project Features:
- **Free**: No cost for any usage level
- **No Registration**: Ready to use immediately
- **Global**: Multiple server locations
- **Reliable**: Maintained by Metered.ca
- **STUN + TURN**: Both protocols supported

### Usage Limits:
- **No bandwidth limits**
- **No connection limits**
- **No time limits**
- **Production ready**

**⚠️ Note**: While free and reliable, consider having backup TURN servers for critical production applications.

## Option 2: Xirsys (Commercial Alternative)

Xirsys provides enterprise-grade TURN server infrastructure.

### Setup Steps:

1. **Sign up at [Xirsys](https://xirsys.com/)**
2. **Create a Channel** in dashboard
3. **Get Credentials** from TURN Credentials tab
4. **Configure Environment Variables**
   ```env
   NEXT_PUBLIC_TURN_SERVER_URL=turn:global.xirsys.com:80?transport=tcp
   NEXT_PUBLIC_TURN_SERVER_USERNAME=your-xirsys-username
   NEXT_PUBLIC_TURN_SERVER_CREDENTIAL=your-xirsys-credential
   ```

### Xirsys Pricing:
- **Free Tier**: 500 MB/month
- **Starter**: $20/month for 10 GB
- **Professional**: $50/month for 50 GB

## Option 3: Twilio STUN/TURN

Twilio provides enterprise-grade TURN services with pay-as-you-go pricing.

### Setup Steps:

1. **Sign up at [Twilio](https://www.twilio.com/)**
   - Create account and verify phone number
   - Get $15 free credit

2. **Enable Network Traversal Service**
   - Go to Console → Programmable Video → Settings
   - Enable "Network Traversal Service"

3. **Get Credentials**
   - Use Twilio's REST API to get temporary credentials
   - Or use permanent credentials from console

4. **Configure Environment Variables**
   ```env
   NEXT_PUBLIC_TURN_SERVER_URL=turn:global.turn.twilio.com:3478?transport=udp
   NEXT_PUBLIC_TURN_SERVER_USERNAME=your-twilio-username
   NEXT_PUBLIC_TURN_SERVER_CREDENTIAL=your-twilio-credential
   ```

### Twilio Pricing:
- **Pay-as-you-go**: $0.0015 per participant minute
- **Volume discounts** available

## Option 4: Self-Hosted CoTURN Server

For maximum control and cost savings at scale, host your own TURN server.

### Server Requirements:
- **VPS/Cloud Server** (minimum 1GB RAM, 1 CPU)
- **Public IP address**
- **Open ports**: 3478 (TURN), 49152-65535 (media relay)
- **Ubuntu 20.04 LTS** (recommended)

### Installation Steps:

1. **Install CoTURN**
   ```bash
   sudo apt update
   sudo apt install coturn
   ```

2. **Configure CoTURN**
   ```bash
   sudo nano /etc/turnserver.conf
   ```

   Add this configuration:
   ```conf
   # Basic configuration
   listening-port=3478
   tls-listening-port=5349
   listening-ip=0.0.0.0
   external-ip=YOUR_PUBLIC_IP_ADDRESS
   
   # Authentication
   lt-cred-mech
   user=univio:your-secure-password
   
   # Security
   realm=your-domain.com
   server-name=your-domain.com
   
   # Logging
   log-file=/var/log/turnserver.log
   verbose
   
   # Performance
   max-bps=1000000
   bps-capacity=0
   stale-nonce=600
   
   # Relay configuration
   min-port=49152
   max-port=65535
   ```

3. **Enable and Start Service**
   ```bash
   sudo systemctl enable coturn
   sudo systemctl start coturn
   sudo systemctl status coturn
   ```

4. **Configure Firewall**
   ```bash
   sudo ufw allow 3478/tcp
   sudo ufw allow 3478/udp
   sudo ufw allow 5349/tcp
   sudo ufw allow 5349/udp
   sudo ufw allow 49152:65535/udp
   ```

5. **Configure Environment Variables**
   ```env
   NEXT_PUBLIC_TURN_SERVER_URL=turn:your-domain.com:3478
   NEXT_PUBLIC_TURN_SERVER_USERNAME=univio
   NEXT_PUBLIC_TURN_SERVER_CREDENTIAL=your-secure-password
   ```

### SSL/TLS Configuration (Production):

1. **Get SSL Certificate**
   ```bash
   sudo apt install certbot
   sudo certbot certonly --standalone -d your-domain.com
   ```

2. **Update CoTURN Configuration**
   ```conf
   cert=/etc/letsencrypt/live/your-domain.com/cert.pem
   pkey=/etc/letsencrypt/live/your-domain.com/privkey.pem
   ```

3. **Use TURNS (Secure TURN)**
   ```env
   NEXT_PUBLIC_TURN_SERVER_URL=turns:your-domain.com:5349
   ```

## Testing Multiple TURN Servers

For better reliability, you can configure multiple TURN servers:

```typescript
// In your WebRTC configuration
const iceServers = [
  // STUN servers
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  
  // Primary TURN server (Open Relay Project)
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject'
  },
  
  // Backup TURN server (TURNS over TLS)
  {
    urls: 'turns:openrelay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject'
  }
]
```

## Testing Your TURN Server

Use this online tool to test your TURN server configuration:
- [WebRTC Trickle ICE Test](https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/)

Or test programmatically:

```javascript
const pc = new RTCPeerConnection({
  iceServers: [
    {
      urls: 'turn:your-server.com:3478',
      username: 'your-username',
      credential: 'your-password'
    }
  ]
});

pc.onicecandidate = (event) => {
  if (event.candidate) {
    console.log('ICE Candidate:', event.candidate);
    if (event.candidate.candidate.includes('relay')) {
      console.log('✅ TURN server working!');
    }
  }
};

// Create offer to trigger ICE gathering
pc.createOffer().then(offer => pc.setLocalDescription(offer));
```

## Cost Comparison

| Option | Setup Time | Monthly Cost | Pros | Cons |
|--------|------------|-------------|------|------|
| Open Relay Project | 1 minute | Free | No setup, reliable, production-ready | Dependency on third party |
| Xirsys | 5 minutes | $20+ | Enterprise support | Ongoing cost |
| Twilio | 10 minutes | ~$22+ | Enterprise grade | Complex pricing |
| Self-hosted | 2 hours | $5-10 | Full control | Maintenance required |

## Recommendations

- **Development & Small Production**: Use Open Relay Project (free, reliable)
- **Enterprise with SLA Requirements**: Use Xirsys or Twilio
- **High Volume/Custom Requirements**: Self-hosted CoTURN
- **Backup Strategy**: Configure multiple TURN servers for redundancy

## Troubleshooting

### Common Issues:

1. **TURN server not working**
   - Check firewall settings
   - Verify credentials
   - Test with ICE trickle tool

2. **High bandwidth usage**
   - Monitor TURN usage
   - Implement connection quality monitoring
   - Use STUN when possible (direct P2P)

3. **Connection failures**
   - Check server logs
   - Verify network connectivity
   - Test from different networks

### Monitoring:

Monitor your TURN server usage:
- **Bandwidth consumption**
- **Active sessions**
- **Error rates**
- **Geographic distribution**

## Security Best Practices

1. **Use strong credentials**
2. **Enable TLS/SSL (TURNS)**
3. **Implement rate limiting**
4. **Monitor for abuse**
5. **Regular security updates**
6. **Restrict access by IP if possible**

---

*For more help, check the [WebRTC Implementation Guide](./webrtc-implementation.md)*