import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const output = path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots');
fs.mkdirSync(output, { recursive: true });
http.createServer((request, response) => {
  const name = new URL(request.url || '/', 'http://127.0.0.1').searchParams.get('name') || '';
  if (request.method !== 'POST' || !/^dev01r-[a-z0-9-]+\.jpg$/.test(name)) {
    response.writeHead(400).end('Invalid screenshot name');
    return;
  }
  const bytes = [];
  let size = 0;
  request.on('data', chunk => {
    size += chunk.length;
    if (size > 15_000_000) request.destroy();
    else bytes.push(chunk);
  });
  request.on('end', () => {
    const image = Buffer.concat(bytes);
    if (image[0] !== 0xff || image[1] !== 0xd8) {
      response.writeHead(415).end('Expected JPEG');
      return;
    }
    fs.writeFileSync(path.join(output, name), image);
    response.writeHead(200, { 'content-type': 'text/plain' }).end(String(image.length));
  });
}).listen(5182, '127.0.0.1', () => console.log('Screenshot receiver: 127.0.0.1:5182'));
