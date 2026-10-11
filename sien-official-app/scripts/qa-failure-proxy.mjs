import { createServer, request } from 'node:http';
import { createConnection } from 'node:net';

// Local QA only: exercises a non-JSON gateway failure without modifying app APIs.
const server = createServer((incoming, response) => {
  if (incoming.url === '/api/orders' && incoming.method === 'POST') {
    response.writeHead(502, { 'Content-Type': 'text/html' }); response.end('<html>QA gateway unavailable</html>'); return;
  }
  const upstream = request({ hostname: '127.0.0.1', port: 3002, path: incoming.url, method: incoming.method, headers: { ...incoming.headers, host: '127.0.0.1:3002' } }, result => {
    response.writeHead(result.statusCode || 502, result.headers); result.pipe(response);
  });
  upstream.on('error', () => { response.writeHead(502); response.end('QA server unavailable'); });
  incoming.pipe(upstream);
});
server.on('upgrade', (incoming, socket, head) => {
  const upstream = createConnection(3002, '127.0.0.1', () => {
    const headers = { ...incoming.headers, host: '127.0.0.1:3002' };
    upstream.write(`${incoming.method} ${incoming.url} HTTP/1.1\r\n${Object.entries(headers).map(([key, value]) => `${key}: ${value}`).join('\r\n')}\r\n\r\n`);
    if (head.length) upstream.write(head);
    socket.pipe(upstream); upstream.pipe(socket);
  });
  upstream.on('error', () => socket.destroy()); socket.on('error', () => upstream.destroy());
});
server.listen(3003, '127.0.0.1', () => process.stdout.write('Local failure QA: http://127.0.0.1:3003\n'));
process.on('SIGINT', () => server.close(() => process.exit(0)));
