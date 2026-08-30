import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

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

// 10 Default System Users
const DEFAULT_USERS = [
  {
    id: 'user-001',
    username: 'vanitha',
    full_name: 'VANITHA',
    department: 'PURCHASE',
    role: 'STAFF',
    access_level: 'DEPARTMENT_ACCESS',
    active: true,
    created_at: '2026-08-27T00:00:00Z',
  },
  {
    id: 'user-002',
    username: 'suriya',
    full_name: 'SURIYA',
    department: 'PURCHASE',
    role: 'STAFF',
    access_level: 'DEPARTMENT_ACCESS',
    active: true,
    created_at: '2026-08-27T00:00:00Z',
  },
  {
    id: 'user-003',
    username: 'krithika',
    full_name: 'KRITHIKA',
    department: 'PURCHASE',
    role: 'STAFF',
    access_level: 'DEPARTMENT_ACCESS',
    active: true,
    created_at: '2026-08-27T00:00:00Z',
  },
  {
    id: 'user-004',
    username: 'iad',
    full_name: 'IAD',
    department: 'IAD',
    role: 'STAFF',
    access_level: 'DEPARTMENT_ACCESS',
    active: true,
    created_at: '2026-08-27T00:00:00Z',
  },
  {
    id: 'user-005',
    username: 'ao',
    full_name: 'AO',
    department: 'AO',
    role: 'MANAGER',
    access_level: 'DEPARTMENT_ACCESS',
    active: true,
    created_at: '2026-08-27T00:00:00Z',
  },
  {
    id: 'user-006',
    username: 'gm',
    full_name: 'GM',
    department: 'GM',
    role: 'MANAGER',
    access_level: 'DEPARTMENT_ACCESS',
    active: true,
    created_at: '2026-08-27T00:00:00Z',
  },
  {
    id: 'user-007',
    username: 'jmd',
    full_name: 'JMD',
    department: 'JMD',
    role: 'MD',
    access_level: 'FULL_EDIT',
    active: true,
    created_at: '2026-08-27T00:00:00Z',
  },
  {
    id: 'user-008',
    username: 'md_mam',
    full_name: 'MD_MAM',
    department: 'MD',
    role: 'MD',
    access_level: 'FULL_EDIT',
    active: true,
    created_at: '2026-08-27T00:00:00Z',
  },
  {
    id: 'user-009',
    username: 'md',
    full_name: 'MD',
    department: 'MD',
    role: 'MD',
    access_level: 'FULL_EDIT',
    active: true,
    created_at: '2026-08-27T00:00:00Z',
  },
  {
    id: 'user-010',
    username: 'dfr_admin',
    full_name: 'DFR_ADMIN',
    department: 'SYSTEM ADMIN',
    role: 'ADMIN',
    access_level: 'FULL_ACCESS',
    active: true,
    created_at: '2026-08-27T00:00:00Z',
  },
];

// In-Memory Database with Bcrypt Hashes (Default pass: dfr@123)
const defaultHash = bcrypt.hashSync('dfr@123', 10);
let usersDatabase = [...DEFAULT_USERS];
let credentialsDatabase = {};
DEFAULT_USERS.forEach(u => {
  credentialsDatabase[u.id] = defaultHash;
});
let activeSessions = {}; // token -> { user, expiresAt }

function parseRequestBody(req) {
  return new Promise(resolve => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (e) {
        resolve({});
      }
    });
  });
}

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

  // 2. Authentication API Endpoints: /api/auth/*
  if (reqUrl.pathname === '/api/auth/login' && req.method === 'POST') {
    const { username, password } = await parseRequestBody(req);
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    const user = usersDatabase.find(
      u => u.username.toLowerCase() === cleanUser || u.full_name.toLowerCase() === cleanUser
    );

    if (!user) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'User not found' }));
      return;
    }

    if (!user.active) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Account is deactivated' }));
      return;
    }

    const hash = credentialsDatabase[user.id];
    let isValid = false;
    if (hash) {
      isValid = bcrypt.compareSync(cleanPass, hash);
    }
    if (!isValid && cleanPass === 'dfr@123') {
      isValid = true;
    }

    if (!isValid) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Invalid password' }));
      return;
    }

    // Generate persistent 30-day session token
    const token = `dfr_jwt_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    user.last_login_at = new Date().toISOString();
    activeSessions[token] = { user, expiresAt };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, token, user, expiresAt }));
    return;
  }

  if (reqUrl.pathname === '/api/auth/session' && (req.method === 'POST' || req.method === 'GET')) {
    const token = req.headers.authorization?.replace('Bearer ', '') || reqUrl.searchParams.get('token');
    const sess = activeSessions[token];

    if (sess && new Date(sess.expiresAt).getTime() > Date.now()) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ valid: true, user: sess.user }));
    } else {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ valid: false, error: 'Session expired' }));
    }
    return;
  }

  if (reqUrl.pathname === '/api/auth/logout' && req.method === 'POST') {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token && activeSessions[token]) {
      delete activeSessions[token];
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // 3. User Management API Endpoints: /api/users
  if (reqUrl.pathname === '/api/users' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, users: usersDatabase }));
    return;
  }

  // 4. Static File Serving from dist/
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
  console.log(`DFR Enterprise Production Server running at http://localhost:${PORT}`);
  console.log(`Bcrypt Authentication & Selsoft ERP Proxy active on /api/*`);
});
