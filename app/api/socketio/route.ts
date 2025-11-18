// Import the Server type from socket.io
// @ts-ignore – socket.io is installed at runtime in Next.js API routes
import { Server as SocketIOServer } from 'socket.io';

// Define the types for your events
// This makes your code type-safe
interface ClientToServerEvents {
  'join-room': (data: { doubtId: string; user: string; role: string }) => void;
  'leave-room': (data: { doubtId: string; user: string }) => void;
  message: (message: { doubtId: string; content: string; /* ...other fields */ }) => void;
  typing: (data: { doubtId: string; user: string }) => void;
  'note-shared': (note: { doubtId: string; /* ...other fields */ }) => void;
}

interface ServerToClientEvents {
  'user-joined': (data: { user: string; role: string }) => void;
  'user-left': (data: { user: string }) => void;
  message: (message: { doubtId: string; content: string; /* ...other fields */ }) => void;
  typing: (data: { user: string }) => void;
  'note-shared': (note: { doubtId: string; /* ...other fields */ }) => void;
}

interface InterServerEvents {
  // Not used in this example
}

interface SocketData {
  // Not used in this example
}

// Define your custom Socket.io Server type
export type AppSocketIOServer = SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

// Augment the Node.js global type
declare global {
  namespace NodeJS {
    interface Global {
      io?: AppSocketIOServer;
    }
  }
}