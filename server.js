require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_admin_key_123'; // In production, use env variable

// Rate limiter for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login requests per windowMs
  message: { error: "Too many login attempts, please try again later" }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Large limit for base64 images
app.use(express.static(path.join(__dirname))); // Serve frontend files

// Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Access Denied: No Token Provided" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Access Denied: Invalid Token" });
    req.user = user;
    next();
  });
}

/* ============================
   AUTH ENDPOINTS
   ============================ */

app.post('/api/login', loginLimiter, (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: "Password required" });

  db.get(`SELECT value FROM config WHERE key = 'admin_password'`, (err, row) => {
    if (err || !row) return res.status(500).json({ error: "Database error" });

    const isValid = bcrypt.compareSync(password, row.value);
    if (!isValid) return res.status(401).json({ error: "Incorrect password" });

    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token });
  });
});

app.post('/api/update-password', authenticateToken, (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) return res.status(400).json({ error: "Missing fields" });

  db.get(`SELECT value FROM config WHERE key = 'admin_password'`, (err, row) => {
    if (err || !row) return res.status(500).json({ error: "Database error" });

    if (!bcrypt.compareSync(oldPassword, row.value)) {
      return res.status(401).json({ error: "Incorrect current password" });
    }

    const hash = bcrypt.hashSync(newPassword, 10);
    db.run(`UPDATE config SET value = ? WHERE key = 'admin_password'`, [hash], function(err) {
      if (err) return res.status(500).json({ error: "Failed to update password" });
      res.json({ success: true });
    });
  });
});

/* ============================
   API ENDPOINTS
   ============================ */

// 1. GET ALL DATA (Hydrate frontend on load)
app.get('/api/data', (req, res) => {
  const result = {
    content: {},
    gallery: [],
    testimonials: [],
    dynamicSections: []
  };

  db.serialize(() => {
    db.all(`SELECT * FROM textContent`, [], (err, rows) => {
      if (!err && rows) {
        rows.forEach(row => { result.content[row.key] = row.value; });
      }
      
      db.all(`SELECT * FROM gallery ORDER BY order_idx ASC`, [], (err, rows) => {
        if (!err && rows) result.gallery = rows;
        
        db.all(`SELECT * FROM testimonials ORDER BY timestamp DESC`, [], (err, rows) => {
          if (!err && rows) result.testimonials = rows;
          
          db.all(`SELECT * FROM dynamicSections ORDER BY order_idx ASC`, [], (err, rows) => {
            if (!err && rows) result.dynamicSections = rows;
            
            res.json(result);
          });
        });
      });
    });
  });
});

// 2. BULK UPDATE TEXT CONTENT
app.post('/api/content', authenticateToken, (req, res) => {
  const data = req.body; // Expects object: { key1: val1, key2: val2 }
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    const stmt = db.prepare(`INSERT INTO textContent (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`);
    
    for (const [key, value] of Object.entries(data)) {
      stmt.run(key, value);
    }
    
    stmt.finalize();
    db.run('COMMIT', (err) => {
      if (err) res.status(500).json({ error: err.message });
      else res.json({ success: true });
    });
  });
});

// 3. GALLERY UPSERT (Add or Update photo)
app.post('/api/gallery', authenticateToken, (req, res) => {
  const { id, src, order_idx } = req.body;
  const stmt = db.prepare(`INSERT INTO gallery (id, src, order_idx) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET src=excluded.src, order_idx=excluded.order_idx`);
  stmt.run(id, src, order_idx || 0, function(err) {
    if (err) res.status(500).json({ error: err.message });
    else res.json({ success: true });
  });
});

// 4. GALLERY DELETE
app.delete('/api/gallery/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM gallery WHERE id = ?`, id, function(err) {
    if (err) res.status(500).json({ error: err.message });
    else res.json({ success: true });
  });
});

// 5. TESTIMONIALS UPSERT
app.post('/api/testimonials', (req, res) => {
  const { id, name, student, grade, subject, rating, feedback, timestamp } = req.body;
  const stmt = db.prepare(`INSERT INTO testimonials (id, name, student, grade, subject, rating, feedback, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET feedback=excluded.feedback`);
  stmt.run(id, name, student, grade, subject, rating, feedback, timestamp, function(err) {
    if (err) res.status(500).json({ error: err.message });
    else res.json({ success: true });
  });
});

// 6. DYNAMIC SECTION UPSERT
app.post('/api/dynamic', authenticateToken, (req, res) => {
  const { id, category, htmlContent, order_idx } = req.body;
  const stmt = db.prepare(`INSERT INTO dynamicSections (id, category, htmlContent, order_idx) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET htmlContent=excluded.htmlContent, order_idx=excluded.order_idx`);
  stmt.run(id, category, htmlContent, order_idx || 0, function(err) {
    if (err) res.status(500).json({ error: err.message });
    else res.json({ success: true });
  });
});

// 7. DYNAMIC SECTION DELETE
app.delete('/api/dynamic/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM dynamicSections WHERE id = ?`, id, function(err) {
    if (err) res.status(500).json({ error: err.message });
    else res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
