import { io, Socket } from 'socket.io-client';

// Define a global interface to make TypeScript happy
declare global {
  interface Window {
    socket: Socket | null;
  }
}

let socket: Socket | null = null;

export const initializeSocket = (): Socket => {
  if (typeof window === 'undefined') return null as any;
  
  if (!socket) {
    // Create socket connection
    socket = io('http://localhost:3001', {
      path: '/api/socketio',
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling']
    });
    
    // Set global socket for easy access
    window.socket = socket;
    
    // Setup event listeners
    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
    });
    
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      // Try to reconnect with polling if websocket fails
      if (socket?.io?.opts?.transports?.includes('websocket' as any)) {
        console.log('Falling back to polling transport');
        socket.io.opts.transports = ['polling'];
      }
    });
    
    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });
  }
  
  return socket;
};

export const joinRoom = (doubtId: number, user: string, role: string = 'Student') => {
  if (!socket) return;
  
  socket.emit('join-room', { doubtId, user, role });
};

export const leaveRoom = (doubtId: number) => {
  if (!socket) return;
  
  socket.emit('leave-room', { doubtId });
};

export const sendMessage = (message: any) => {
  if (!socket) return;
  
  socket.emit('message', message);
};

export const sendTypingIndicator = (doubtId: number, user: string) => {
  if (!socket) return;
  
  socket.emit('typing', { doubtId, user });
};

export const shareNote = (note: any) => {
  if (!socket) return;
  
  socket.emit('note-shared', note);
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    if (typeof window !== 'undefined') {
      window.socket = null;
    }
  }
};

export default {
  initializeSocket,
  joinRoom,
  leaveRoom,
  sendMessage,
  sendTypingIndicator,
  shareNote,
  disconnectSocket,
};