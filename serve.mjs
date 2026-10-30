// Tiny local preview server for ./dist  ->  http://localhost:4173
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain', '.json': 'application/json' };
createServer(async (req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  try {
    const data = await readFile(join('dist', p));
    res.writeHead(200, { 'Content-Type': types[extname(p)] || 'application/octet-stream' }).end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html' }).end(await readFile('dist/404.html'));
  }
}).listen(4173, () => console.log('http://localhost:4173'));
