import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifyAccessToken } from '../auth/tokens';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SocketManager {
  private io: SocketIOServer;
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3001",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', async (socket) => {
      console.log('Client connected:', socket.id);

      // Authenticate user
      const token = socket.handshake.auth.token;
      if (!token) {
        socket.disconnect();
        return;
      }

      try {
        const decoded = verifyAccessToken(token);
        const user = await prisma.user.findUnique({
          where: { id: decoded.sub },
        });

        if (!user) {
          socket.disconnect();
          return;
        }

        // Store user socket mapping
        this.userSockets.set(user.id, socket.id);
        socket.join(`user_${user.id}`);

        console.log(`User ${user.email} connected with socket ${socket.id}`);

        // Handle disconnect
        socket.on('disconnect', () => {
          console.log(`User ${user.email} disconnected`);
          this.userSockets.delete(user.id);
        });

      } catch (error) {
        console.error('Socket authentication error:', error);
        socket.disconnect();
      }
    });
  }

  // Send notification to specific user
  public sendNotificationToUser(userId: string, notification: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('notification', notification);
    }
  }

  // Send notification to all users in a room
  public sendNotificationToRoom(room: string, notification: any) {
    this.io.to(room).emit('notification', notification);
  }

  // Broadcast to all connected users
  public broadcast(notification: any) {
    this.io.emit('notification', notification);
  }
}

export let socketManager: SocketManager;

export function initializeSocket(server: HTTPServer) {
  socketManager = new SocketManager(server);
  return socketManager;
}
