import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface Message {
  id: number
  doubt_id: number
  user_id: number
  content: string
  created_at: string
  user_name: string
  user_email: string
}

interface DoubtUpdate {
  doubtId: number
  messageCount: number
  lastActivity: string
}

export class ChatSocket {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 50
  private reconnectDelay = 1000

  constructor() {
    this.connect()
  }

  private connect() {
    try {
      // Connect to Socket.io server
      this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        timeout: 20000,
        forceNew: false,
        path: '/api/socketio',
        // Expose connection state via a getter instead of accessing private property
        // Use the public getter `getConnectionStatus()` to check connection state
      })

      this.setupEventListeners()
    } catch (error) {
      console.error('Failed to initialize socket:', error)
      this.scheduleReconnect()
    }
  }

  private _isConnected = false;

  private setupEventListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('Socket connected successfully')
      this._isConnected = true
      this.reconnectAttempts = 0
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      this._isConnected = false
      
      if (reason === 'io server disconnect') {
        // Server forced disconnect, try to reconnect
        this.scheduleReconnect()
      }
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      this._isConnected = false
      this.scheduleReconnect()
    })

    this.socket.on('error', (error) => {
      console.error('Socket error:', error)
    })
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    setTimeout(() => {
      console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
      this.connect()
    }, delay)
  }

  // Join a doubt room
  joinDoubtRoom(doubtId: number) {
    if (!this.socket || !this.isConnected) {
      console.warn('Cannot join room: socket not connected')
      return
    }

    this.socket.emit('join_doubt_room', { doubtId })
    console.log(`Joined doubt room: ${doubtId}`)
  }

  // Leave a doubt room
  leaveDoubtRoom(doubtId: number) {
    if (!this.socket || !this.isConnected) {
      console.warn('Cannot leave room: socket not connected')
      return
    }

    this.socket.emit('leave_doubt_room', { doubtId })
    console.log(`Left doubt room: ${doubtId}`)
  }

  // Send a message
  sendMessage(doubtId: number, content: string) {
    if (!this.socket || !this.isConnected) {
      console.warn('Cannot send message: socket not connected')
      return false
    }

    this.socket.emit('send_message', { doubtId, content })
    return true
  }

  // Listen for new messages
  onNewMessage(callback: (message: Message) => void) {
    if (!this.socket) return

    this.socket.on('new_message', callback)
  }

  // Listen for doubt updates
  onDoubtUpdate(callback: (update: DoubtUpdate) => void) {
    if (!this.socket) return

    this.socket.on('doubt_update', callback)
  }

  // Listen for user typing
  onUserTyping(callback: (data: { doubtId: number; userName: string }) => void) {
    if (!this.socket) return

    this.socket.on('user_typing', callback)
  }

  // Send typing indicator
  sendTyping(doubtId: number) {
    if (!this.socket || !this.isConnected) return

    this.socket.emit('typing', { doubtId })
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  // Getter for connection status
  get isConnected() {
    return this.socket?.connected || this._isConnected;
  }

  // Alias for isConnected for backward compatibility
  getConnectionStatus() {
    return this.isConnected;
  }
}

// Custom hook for real-time chat
export const useRealTimeChat = (doubtId: number) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [socket, setSocket] = useState<ChatSocket | null>(null)

  useEffect(() => {
    const chatSocket = new ChatSocket()
    setSocket(chatSocket)

    // Set up event listeners
    chatSocket.onNewMessage((newMessage) => {
      setMessages(prev => [...prev, newMessage])
    })

    chatSocket.onUserTyping((data) => {
      if (data.doubtId === doubtId) {
        setTypingUsers(prev => {
          if (!prev.includes(data.userName)) {
            return [...prev, data.userName]
          }
          return prev
        })

        // Remove typing indicator after 3 seconds
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(name => name !== data.userName))
        }, 3000)
      }
    })

    // Join room when connected
    const checkConnection = setInterval(() => {
      if (chatSocket.isConnected) {
        setIsConnected(true)
        chatSocket.joinDoubtRoom(doubtId)
        clearInterval(checkConnection)
      }
    }, 1000)

    return () => {
      clearInterval(checkConnection)
      chatSocket.leaveDoubtRoom(doubtId)
      chatSocket.disconnect()
    }
  }, [doubtId])

  const sendMessage = (content: string) => {
    if (socket) {
      return socket.sendMessage(doubtId, content)
    }
    return false
  }

  const sendTyping = () => {
    if (socket) {
      socket.sendTyping(doubtId)
    }
  }

  return {
    messages,
    isConnected,
    typingUsers,
    sendMessage,
    sendTyping
  }
}