# Univio Signaling Server

WebRTC signaling server for Univio video conferencing application using Socket.io.

## Features

- ✅ **WebRTC Signaling** - Handle offer/answer/ICE candidate exchange
- ✅ **Room Management** - Create and manage meeting rooms
- ✅ **Rate Limiting** - Prevent abuse with configurable limits
- ✅ **Health Monitoring** - Health check and statistics endpoints
- ✅ **Security** - CORS protection and input validation
- ✅ **Scalable** - Ready for production deployment

## Quick Start

### Local Development

1. **Install dependencies**
   ```bash
   cd signaling-server
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Test the server**
   ```bash
   curl http://localhost:3001/health
   ```

### Environment Variables

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# CORS Configuration (comma-separated)
CLIENT_URL=https://your-app.vercel.app,https://your-app-git-main.vercel.app

# Optional: Custom rate limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=100
```

## Deployment Options

### Option 1: Heroku (Recommended)

1. **Create Heroku app**
   ```bash
   heroku create univio-signaling-server
   ```

2. **Set environment variables**
   ```bash
   heroku config:set CLIENT_URL=https://your-app.vercel.app
   heroku config:set NODE_ENV=production
   ```

3. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy signaling server"
   git push heroku main
   ```

4. **Verify deployment**
   ```bash
   curl https://univio-signaling-server.herokuapp.com/health
   ```

### Option 2: Railway

1. **Connect GitHub repository** to Railway
2. **Set environment variables**:
   - `CLIENT_URL=https://your-app.vercel.app`
   - `NODE_ENV=production`
3. **Deploy automatically** from repository

### Option 3: DigitalOcean App Platform

1. **Create new app** from GitHub repository
2. **Configure build settings**:
   - Build command: `npm install`
   - Run command: `npm start`
3. **Set environment variables**
4. **Deploy**

### Option 4: Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t univio-signaling .
docker run -p 3001:3001 -e CLIENT_URL=https://your-app.vercel.app univio-signaling
```

## API Endpoints

### Health Check
```
GET /health
```
Returns server status and basic statistics.

### Statistics
```
GET /stats
```
Returns detailed room and connection statistics.

## Socket.io Events

### Client → Server

| Event | Data | Description |
|-------|------|-------------|
| `join-room` | `{ roomId, userId }` | Join a meeting room |
| `leave-room` | `{ roomId, userId }` | Leave a meeting room |
| `signal` | `{ to, signal }` | Send WebRTC signaling data |
| `custom-message` | `{ roomId, message, type }` | Send custom message to room |

### Server → Client

| Event | Data | Description |
|-------|------|-------------|
| `room-joined` | `{ roomId, users, isFirstUser }` | Confirmation of room join |
| `user-joined` | `{ userId }` | New user joined the room |
| `user-left` | `{ userId }` | User left the room |
| `signal` | `{ from, signal }` | WebRTC signaling data from peer |
| `custom-message` | `{ from, message, type, timestamp }` | Custom message from peer |
| `error` | `{ message }` | Error message |

## Security Features

### Rate Limiting
- **100 requests per minute** per connection (configurable)
- Automatic cleanup of expired rate limit data

### CORS Protection
- Configurable allowed origins
- Credentials support for authenticated requests

### Input Validation
- Required field validation
- Sanitized error messages
- Connection authentication

### Connection Management
- Automatic cleanup on disconnect
- Room cleanup when empty
- Memory leak prevention

## Monitoring

### Health Check Response
```json
{
  "status": "healthy",
  "timestamp": "2025-01-03T12:00:00.000Z",
  "rooms": 5,
  "connections": 12
}
```

### Statistics Response
```json
{
  "totalRooms": 5,
  "totalConnections": 12,
  "roomDetails": [
    {
      "roomId": "room-123",
      "userCount": 3,
      "users": ["user1", "user2", "user3"]
    }
  ]
}
```

## Performance Considerations

### Memory Usage
- In-memory room storage (consider Redis for scaling)
- Automatic cleanup of empty rooms
- Rate limiter cleanup intervals

### Scaling
- Single instance handles ~1000 concurrent connections
- For larger scale, implement Redis adapter
- Consider load balancing multiple instances

### Network
- WebSocket transport preferred over polling
- Configurable ping/pong intervals
- Connection timeout handling

## Troubleshooting

### Common Issues

1. **CORS Errors**
   ```bash
   # Set correct CLIENT_URL
   heroku config:set CLIENT_URL=https://your-actual-domain.vercel.app
   ```

2. **Connection Timeouts**
   ```javascript
   // Increase timeout in client
   const socket = io('wss://your-server.herokuapp.com', {
     timeout: 20000
   })
   ```

3. **Rate Limiting**
   ```bash
   # Increase limits if needed
   heroku config:set RATE_LIMIT_MAX_REQUESTS=200
   ```

### Debugging

Enable debug logs:
```bash
DEBUG=socket.io* npm start
```

Check server logs:
```bash
heroku logs --tail -a univio-signaling-server
```

## Development

### Local Testing

1. **Start signaling server**
   ```bash
   npm run dev
   ```

2. **Test with curl**
   ```bash
   # Health check
   curl http://localhost:3001/health
   
   # Statistics
   curl http://localhost:3001/stats
   ```

3. **Test WebSocket connection**
   ```javascript
   const socket = io('http://localhost:3001')
   socket.emit('join-room', { roomId: 'test', userId: 'user1' })
   ```

### Code Structure

```
signaling-server/
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
├── README.md         # This file
└── .env.example      # Environment variables template
```

## License

MIT License - see LICENSE file for details.