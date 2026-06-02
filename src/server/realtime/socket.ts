import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { getSubscriber, RedisChannel } from './redis';

let io: SocketIOServer | null = null;

export function initSocketIO(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    transports: ['websocket', 'polling'],
  });

  io.engine.on('connection_error', (err) => {
    console.error('[Socket.IO] Connection error', {
      code: err.code,
      message: err.message,
      origin: err.req.headers.origin,
      host: err.req.headers.host,
      url: err.req.url,
      context: err.context,
    });
  });

  io.on('connection', (socket) => {
    console.log('[Socket.IO] Client connected', {
      id: socket.id,
      transport: socket.conn.transport.name,
      origin: socket.handshake.headers.origin,
      host: socket.handshake.headers.host,
      address: socket.handshake.address,
    });
    socket.on('disconnect', (reason) => {
      console.log('[Socket.IO] Client disconnected', { id: socket.id, reason });
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
