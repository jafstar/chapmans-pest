import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.mjs': 'application/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.mp4': 'video/mp4' }

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0])
  if (p === '/') p = '/index.html'
  const filePath = path.join(ROOT, p)
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end() }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found') }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(filePath)] || 'application/octet-stream' })
    res.end(data)
  })
}).listen(8080, () => console.log('Serving chapmans-pest-control on http://localhost:8080'))
