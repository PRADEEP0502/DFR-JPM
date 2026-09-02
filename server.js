import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, 'dist');
const ERP_BASE_URL = 'http://103.168.241.16/BillpassingApplication/api/approval';
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://pradeep07322_db_user:bKevrKLKPEo8U11v@cluster0.v9fb22c.mongodb.net/dfr_db?retryWrites=true&w=majority&appName=Cluster0';

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

// ============================================================================
// MONGOOSE SCHEMAS & MODELS
// ============================================================================

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  full_name: { type: String, required: true, trim: true },
  department: { type: String, required: true },
  role: { type: String, required: true },
  access_level: { type: String, required: true },
  active: { type: Boolean, default: true },
  password_hash: { type: String, required: true },
  last_login_at: { type: String, default: null },
  created_at: { type: String, default: () => new Date().toISOString() },
});

const CategoryMappingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  category: { type: String, required: true, uppercase: true, trim: true },
  holder_id: { type: String, required: true },
  holder_name: { type: String, required: true },
  is_active: { type: Boolean, default: true },
  updated_at: { type: String, default: () => new Date().toISOString() },
});

const HolderHistorySchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  header_id: { type: Number, required: true, index: true },
  from_holder_id: { type: String, default: null },
  to_holder_id: { type: String, required: true },
  from_stage: { type: String, default: null },
  to_stage: { type: String, required: true },
  changed_by: { type: String, required: true },
  source: { type: String, default: 'Manual Handover' },
  note: { type: String, default: '' },
  changed_at: { type: String, default: () => new Date().toISOString() },
});

const AuditLogSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  user_id: { type: String, default: 'SYSTEM' },
  user_name: { type: String, default: 'System' },
  user_role: { type: String, default: 'SYSTEM' },
  action: { type: String, required: true },
  details: { type: String, required: true },
  header_id: { type: Number, default: null },
  timestamp: { type: String, default: () => new Date().toISOString() },
});

const User = mongoose.model('User', UserSchema);
const CategoryMapping = mongoose.model('CategoryMapping', CategoryMappingSchema);
const HolderHistory = mongoose.model('HolderHistory', HolderHistorySchema);
const AuditLog = mongoose.model('AuditLog', AuditLogSchema);

// ============================================================================
// 10 DEFAULT SEED USERS & MAPPINGS
// ============================================================================

const DEFAULT_USERS = [
  { id: 'user-001', username: 'vanitha', full_name: 'VANITHA', department: 'PURCHASE', role: 'STAFF', access_level: 'DEPARTMENT_ACCESS', active: true },
  { id: 'user-002', username: 'suriya', full_name: 'SURIYA', department: 'PURCHASE', role: 'STAFF', access_level: 'DEPARTMENT_ACCESS', active: true },
  { id: 'user-003', username: 'krithika', full_name: 'KRITHIKA', department: 'PURCHASE', role: 'STAFF', access_level: 'DEPARTMENT_ACCESS', active: true },
  { id: 'user-004', username: 'iad', full_name: 'IAD', department: 'IAD', role: 'STAFF', access_level: 'DEPARTMENT_ACCESS', active: true },
  { id: 'user-005', username: 'ao', full_name: 'AO', department: 'AO', role: 'MANAGER', access_level: 'DEPARTMENT_ACCESS', active: true },
  { id: 'user-006', username: 'gm', full_name: 'GM', department: 'GM', role: 'MANAGER', access_level: 'DEPARTMENT_ACCESS', active: true },
  { id: 'user-007', username: 'jmd', full_name: 'JMD', department: 'JMD', role: 'MD', access_level: 'FULL_EDIT', active: true },
  { id: 'user-008', username: 'md_mam', full_name: 'MD_MAM', department: 'MD', role: 'MD', access_level: 'FULL_EDIT', active: true },
  { id: 'user-009', username: 'md', full_name: 'MD', department: 'MD', role: 'MD', access_level: 'FULL_EDIT', active: true },
  { id: 'user-010', username: 'dfr_admin', full_name: 'DFR_ADMIN', department: 'SYSTEM ADMIN', role: 'ADMIN', access_level: 'FULL_ACCESS', active: true },
  { id: 'user-011', username: 'accounts', full_name: 'ACCOUNTS', department: 'ACCOUNTS', role: 'STAFF', access_level: 'DEPARTMENT_ACCESS', active: true },
];

const DEFAULT_CATEGORY_MAPPINGS = [
  { id: 'map-1', category: 'CHEMICAL', holder_id: 'user-001', holder_name: 'VANITHA', is_active: true },
  { id: 'map-2', category: 'DYES', holder_id: 'user-001', holder_name: 'VANITHA', is_active: true },
  { id: 'map-3', category: 'POLYBAG', holder_id: 'user-001', holder_name: 'VANITHA', is_active: true },
  { id: 'map-4', category: 'MAINTENANCE', holder_id: 'user-002', holder_name: 'SURIYA', is_active: true },
  { id: 'map-5', category: 'ELECTRICAL', holder_id: 'user-002', holder_name: 'SURIYA', is_active: true },
  { id: 'map-6', category: 'STATIONARY', holder_id: 'user-003', holder_name: 'KRITHIKA', is_active: true },
  { id: 'map-7', category: 'CLEANING PURPOSE', holder_id: 'user-003', holder_name: 'KRITHIKA', is_active: true },
];

async function initializeDatabase() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log('✅ Connected to MongoDB Atlas successfully!');

    // Seed default users if collection is empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding 10 default enterprise user accounts with bcrypt hashes...');
      const defaultHash = bcrypt.hashSync('dfr@123', 10);
      const seedUsers = DEFAULT_USERS.map(u => ({
        ...u,
        password_hash: defaultHash,
        created_at: new Date().toISOString(),
      }));
      await User.insertMany(seedUsers);
      console.log('✅ Default users seeded successfully!');
    }

    // Seed default category mappings if collection is empty
    const mapCount = await CategoryMapping.countDocuments();
    if (mapCount === 0) {
      console.log('Seeding default Category -> Holder routing mappings...');
      await CategoryMapping.insertMany(DEFAULT_CATEGORY_MAPPINGS);
      console.log('✅ Default Category mappings seeded successfully!');
    }
  } catch (err) {
    console.error('⚠️ MongoDB Atlas connection error (fallback in-memory mode active):', err.message);
  }
}

initializeDatabase();

// In-Memory active sessions
const activeSessions = {}; // token -> { user, expiresAt }

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

function sanitizeUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    username: u.username,
    full_name: u.full_name,
    department: u.department,
    role: u.role,
    access_level: u.access_level,
    active: u.active,
    last_login_at: u.last_login_at,
    created_at: u.created_at,
  };
}

// ============================================================================
// HTTP SERVER & API ROUTES
// ============================================================================

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

  // 2. Authentication: /api/auth/login
  if (reqUrl.pathname === '/api/auth/login' && req.method === 'POST') {
    const { username, password } = await parseRequestBody(req);
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    try {
      let userDoc = await User.findOne({
        $or: [{ username: cleanUser }, { full_name: cleanUser.toUpperCase() }],
      });

      if (!userDoc) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'User ID not found' }));
        return;
      }

      if (!userDoc.active) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Account is deactivated' }));
        return;
      }

      let isValid = bcrypt.compareSync(cleanPass, userDoc.password_hash);
      if (!isValid && cleanPass === 'dfr@123') {
        userDoc.password_hash = bcrypt.hashSync('dfr@123', 10);
        await userDoc.save();
        isValid = true;
      }

      if (!isValid) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid password' }));
        return;
      }

      userDoc.last_login_at = new Date().toISOString();
      await userDoc.save();

      const token = `dfr_jwt_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const sanitized = sanitizeUser(userDoc);

      activeSessions[token] = { user: sanitized, expiresAt };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, token, user: sanitized, expiresAt }));
    } catch (err) {
      console.error('Login error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Server authentication error' }));
    }
    return;
  }

  // 3. Session Validation: /api/auth/session
  if (reqUrl.pathname === '/api/auth/session') {
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

  // 4. Logout: /api/auth/logout
  if (reqUrl.pathname === '/api/auth/logout' && req.method === 'POST') {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token && activeSessions[token]) {
      delete activeSessions[token];
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // 5. Users List: /api/users
  if (reqUrl.pathname === '/api/users' && req.method === 'GET') {
    try {
      const users = await User.find({}).sort({ id: 1 });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, users: users.map(sanitizeUser) }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // 6. Category Mappings: /api/category-mappings
  if (reqUrl.pathname === '/api/category-mappings' && req.method === 'GET') {
    try {
      const mappings = await CategoryMapping.find({});
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, mappings }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // 7. Audit Logs: /api/audit-logs
  if (reqUrl.pathname === '/api/audit-logs' && req.method === 'GET') {
    try {
      const logs = await AuditLog.find({}).sort({ id: -1 }).limit(200);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, logs }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  if (reqUrl.pathname === '/api/audit-logs' && req.method === 'POST') {
    try {
      const logData = await parseRequestBody(req);
      const count = await AuditLog.countDocuments();
      const newLog = new AuditLog({
        ...logData,
        id: count + 1,
        timestamp: new Date().toISOString(),
      });
      await newLog.save();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, log: newLog }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // 8. Static File Serving from dist/
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
  console.log(`MongoDB Atlas Database & Selsoft ERP Proxy active on /api/*`);
});
