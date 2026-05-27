import { createServer } from 'http';
import next from 'next';
import { initSocketIO } from './src/server/realtime/socket';
import { startUDPListener } from './src/server/udp-listener';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3333', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
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
