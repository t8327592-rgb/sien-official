import { createServer, request } from 'node:http';

// Safe failure simulation: every write is rejected locally; GETs read isolated QA.
const server = createServer((incoming,response) => {
  if (!['GET','HEAD'].includes(incoming.method || '')) {
    response.writeHead(502,{'Content-Type':'text/html'});
    response.end('<html>QA gateway unavailable</html>');return;
  }
  const upstream=request({hostname:'127.0.0.1',port:3002,path:incoming.url,method:incoming.method,headers:{...incoming.headers,host:'127.0.0.1:3002'}},result=>{response.writeHead(result.statusCode||502,result.headers);result.pipe(response);});
  upstream.on('error',()=>{response.writeHead(502);response.end('QA unavailable');});
  incoming.pipe(upstream);
});
server.listen(3004,'127.0.0.1',()=>console.log('QA write-failure simulation: http://127.0.0.1:3004'));
process.on('SIGINT',()=>server.close(()=>process.exit(0)));
