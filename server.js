import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, 'dist');
const ERP_BASE_URL = 'http://103.168.241.16/BillpassingApplication/api/approval';

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host}`);

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // 1. Selsoft ERP Proxy: /api/selsoft/*
  if (reqUrl.pathname.startsWith('/api/selsoft/')) {
    const endpoint = reqUrl.pathname.replace(/^\/api\/selsoft\//, '');
    const targetUrl = new URL(`${ERP_BASE_URL}/${endpoint}`);
    reqUrl.searchParams.forEach((val, key) => targetUrl.searchParams.set(key, val));

    try {
      const upstreamRes = await fetch(targetUrl.toString(), {
        method: req.method,
        headers: {
          Accept: 'application/json',
        },
      });

      res.writeHead(upstreamRes.status, {
        'Content-Type': 'application/json',
      });

      const body = await upstreamRes.arrayBuffer();
      res.end(Buffer.from(body));
    } catch (err) {
      console.error('ERP Proxy Error:', err);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ Success: false, ErrorMessage: err.message || 'ERP Proxy connection failed' }));
    }
    return;
  }

  // 2. Static File Serving from dist/
  let filePath = path.join(DIST_DIR, reqUrl.pathname);

  // If path is root or directory, check for index.html
  if (reqUrl.pathname === '/' || !path.extname(filePath)) {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    } else if (!fs.existsSync(filePath)) {
      // SPA Fallback: serve dist/index.html
      filePath = path.join(DIST_DIR, 'index.html');
    }
  }

  // Check file existence
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    // Final SPA Fallback
    const indexPath = path.join(DIST_DIR, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(indexPath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found. Please run `npm run build` first.');
    }
  }
});

server.listen(PORT, () => {
  console.log(`DFR Production Server running at http://localhost:${PORT}`);
  console.log(`Selsoft ERP Proxy active on /api/selsoft/* -> ${ERP_BASE_URL}/*`);
});
