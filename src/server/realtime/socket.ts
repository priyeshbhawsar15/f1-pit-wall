import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { getSubscriber, RedisChannel } from './redis';

let io: SocketIOServer | null = null;

export function initSocketIO(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  const sub = getSubscriber();

  const channels = Object.values(RedisChannel);
  sub.subscribe(...channels, (err) => {
    if (err) console.error('[Socket.IO] Redis subscribe error:', err);
    else console.log('[Socket.IO] Subscribed to Redis channels:', channels.join(', '));
  });

  sub.on('message', (channel, message) => {
    if (!io) return;
    try {
      const data = JSON.parse(message);
      const eventName = channel.replace('f1:', '');
      io.emit(eventName, data);
    } catch (err) {
      console.error('[Socket.IO] Failed to relay message:', err);
    }
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}
