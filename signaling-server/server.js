const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')
const helmet = require('helmet')

const app = express()
const server = http.createServer(app)

// Security middleware
app.use(helmet())

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL ? 
    process.env.CLIENT_URL.split(',').map(url => url.trim()) : 
    ["http://localhost:3000", "https://localhost:3000"],
  methods: ["GET", "POST"],
  credentials: true
}

app.use(cors(corsOptions))
app.use(express.json())

// Socket.io configuration
const io = socketIo(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
})

// In-memory storage for rooms and users
const rooms = new Map()
const userRooms = new Map() // Track which room each user is in

// Rate limiting
const rateLimiter = new Map()
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100

function checkRateLimit(socketId) {
  const now = Date.now()
  const userRequests = rateLimiter.get(socketId) || []
  
  // Remove old requests outside the window
  const validRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW)
  
  if (validRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false
  }
  
  validRequests.push(now)
  rateLimiter.set(socketId, validRequests)
  return true
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    rooms: rooms.size,
    connections: io.engine.clientsCount
  })
})

// Stats endpoint
app.get('/stats', (req, res) => {
  const stats = {
    totalRooms: rooms.size,
    totalConnections: io.engine.clientsCount,
    roomDetails: Array.from(rooms.entries()).map(([roomId, users]) => ({
      roomId,
      userCount: users.size,
      users: Array.from(users)
    }))
  }
  res.json(stats)
})

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`)
  
  // Authentication check
  const userId = socket.handshake.auth?.userId
  if (!userId) {
    console.log(`Connection rejected: No userId provided for ${socket.id}`)
    socket.emit('error', { message: 'Authentication required' })
    socket.disconnect()
    return
  }

  console.log(`Authenticated user: ${userId} (${socket.id})`)

  // Join room event
  socket.on('join-room', ({ roomId, userId: requestUserId }) => {
    try {
      // Rate limiting
      if (!checkRateLimit(socket.id)) {
        socket.emit('error', { message: 'Rate limit exceeded' })
        return
      }

      // Validate input
      if (!roomId || !requestUserId) {
        socket.emit('error', { message: 'Room ID and User ID are required' })
        return
      }

      // Check if user is already in a room
      const currentRoom = userRooms.get(socket.id)
      if (currentRoom && currentRoom !== roomId) {
        // Leave current room first
        socket.leave(currentRoom)
        const currentRoomUsers = rooms.get(currentRoom)
        if (currentRoomUsers) {
          currentRoomUsers.delete(requestUserId)
          socket.to(currentRoom).emit('user-left', { userId: requestUserId })
          
          if (currentRoomUsers.size === 0) {
            rooms.delete(currentRoom)
            console.log(`Room ${currentRoom} deleted (empty)`)
          }
        }
      }

      // Join new room
      socket.join(roomId)
      userRooms.set(socket.id, roomId)
      
      // Initialize room if it doesn't exist
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set())
      }
      
      const room = rooms.get(roomId)
      const wasEmpty = room.size === 0
      
      // Add user to room
      room.add(requestUserId)
      
      console.log(`User ${requestUserId} joined room ${roomId}. Room size: ${room.size}`)
      
      // Notify existing users about new user
      socket.to(roomId).emit('user-joined', { userId: requestUserId })
      
      // Send current room state to new user
      socket.emit('room-joined', { 
        roomId, 
        users: Array.from(room),
        isFirstUser: wasEmpty
      })

      // Log room statistics
      console.log(`Room ${roomId} stats: ${room.size} users`)
      
    } catch (error) {
      console.error('Error in join-room:', error)
      socket.emit('error', { message: 'Failed to join room' })
    }
  })

  // Signal forwarding for WebRTC
  socket.on('signal', ({ to, signal }) => {
    try {
      // Rate limiting
      if (!checkRateLimit(socket.id)) {
        socket.emit('error', { message: 'Rate limit exceeded' })
        return
      }

      if (!to || !signal) {
        socket.emit('error', { message: 'Invalid signal data' })
        return
      }

      // Forward signal to specific user
      socket.to(to).emit('signal', { 
        from: socket.id, 
        signal 
      })
      
      console.log(`Signal forwarded from ${socket.id} to ${to}`)
      
    } catch (error) {
      console.error('Error in signal forwarding:', error)
      socket.emit('error', { message: 'Failed to forward signal' })
    }
  })

  // Leave room event
  socket.on('leave-room', ({ roomId, userId: requestUserId }) => {
    try {
      if (!roomId || !requestUserId) {
        return
      }

      socket.leave(roomId)
      userRooms.delete(socket.id)
      
      const room = rooms.get(roomId)
      if (room) {
        room.delete(requestUserId)
        
        // Notify other users
        socket.to(roomId).emit('user-left', { userId: requestUserId })
        
        // Clean up empty room
        if (room.size === 0) {
          rooms.delete(roomId)
          console.log(`Room ${roomId} deleted (empty)`)
        } else {
          console.log(`User ${requestUserId} left room ${roomId}. Room size: ${room.size}`)
        }
      }
      
    } catch (error) {
      console.error('Error in leave-room:', error)
    }
  })

  // Handle custom messages (for future features)
  socket.on('custom-message', ({ roomId, message, type }) => {
    try {
      // Rate limiting
      if (!checkRateLimit(socket.id)) {
        socket.emit('error', { message: 'Rate limit exceeded' })
        return
      }

      if (!roomId || !message) {
        return
      }

      // Forward message to room
      socket.to(roomId).emit('custom-message', {
        from: socket.id,
        message,
        type,
        timestamp: Date.now()
      })
      
    } catch (error) {
      console.error('Error in custom-message:', error)
    }
  })

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    try {
      console.log(`User disconnected: ${socket.id} (${reason})`)
      
      // Clean up user from rooms
      const roomId = userRooms.get(socket.id)
      if (roomId) {
        const room = rooms.get(roomId)
        if (room) {
          // Find user ID (we need to track this better in production)
          const userId = socket.handshake.auth?.userId
          if (userId) {
            room.delete(userId)
            socket.to(roomId).emit('user-left', { userId })
            
            if (room.size === 0) {
              rooms.delete(roomId)
              console.log(`Room ${roomId} deleted (empty after disconnect)`)
            }
          }
        }
        userRooms.delete(socket.id)
      }
      
      // Clean up rate limiter
      rateLimiter.delete(socket.id)
      
    } catch (error) {
      console.error('Error in disconnect handler:', error)
    }
  })

  // Handle errors
  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error)
  })
})

// Cleanup interval for rate limiter
setInterval(() => {
  const now = Date.now()
  for (const [socketId, requests] of rateLimiter.entries()) {
    const validRequests = requests.filter(time => now - time < RATE_LIMIT_WINDOW)
    if (validRequests.length === 0) {
      rateLimiter.delete(socketId)
    } else {
      rateLimiter.set(socketId, validRequests)
    }
  }
}, RATE_LIMIT_WINDOW)

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`🚀 Signaling server running on port ${PORT}`)
  console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}`)
  console.log(`🏥 Health check: http://localhost:${PORT}/health`)
  console.log(`📊 Stats endpoint: http://localhost:${PORT}/stats`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔒 CORS origins: ${corsOptions.origin}`)
})