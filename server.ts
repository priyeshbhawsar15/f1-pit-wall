import { createServer } from 'http';
import next from 'next';
import { initSocketIO } from './src/server/realtime/socket';
import { startUDPListener } from './src/server/udp-listener';
import { prisma } from './src/lib/db';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3333', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

async function ensureEventSessionTimeMsColumn(): Promise<void> {
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS "sessionTimeMs" INTEGER');
  } catch (error: any) {
    console.warn('[DB] Could not ensure events.sessionTimeMs column:', error.message);
  }
}

app.prepare().then(async () => {
  await ensureEventSessionTimeMsColumn();

  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  initSocketIO(httpServer);

  startUDPListener();

  httpServer.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> UDP listener active on ${process.env.UDP_HOST || '0.0.0.0'}:${process.env.UDP_PORT || 20777}`);
    console.log(`> Socket.IO attached to HTTP server`);
  });
});
