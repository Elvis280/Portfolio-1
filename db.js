require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.resolve(__dirname, 'portfolio.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Initialize Tables
    db.serialize(() => {
      // Key-Value table for textual content
      db.run(`CREATE TABLE IF NOT EXISTS textContent (
        key TEXT PRIMARY KEY,
        value TEXT
      )`);

      // Gallery table
      db.run(`CREATE TABLE IF NOT EXISTS gallery (
        id TEXT PRIMARY KEY,
        src TEXT,
        order_idx INTEGER
      )`);

      // Testimonials table
      db.run(`CREATE TABLE IF NOT EXISTS testimonials (
        id TEXT PRIMARY KEY,
        name TEXT,
        student TEXT,
        grade TEXT,
        subject TEXT,
        rating INTEGER,
        feedback TEXT,
        timestamp INTEGER
      )`);
      
      // Dynamic Sections table (for Subjects, Qualifications, etc. added by admin)
      // category could be 'subject', 'qualification', 'experience', 'faq'
      db.run(`CREATE TABLE IF NOT EXISTS dynamicSections (
        id TEXT PRIMARY KEY,
        category TEXT,
        htmlContent TEXT,
        order_idx INTEGER
      )`);

      // Config table for secure settings (like hashed password)
      db.run(`CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT
      )`);

      // Initialize default admin password
      const bcrypt = require('bcryptjs');
      db.get(`SELECT value FROM config WHERE key = 'admin_password'`, (err, row) => {
        if (!row && !err) {
          const hash = bcrypt.hashSync('admin123', 10);
          db.run(`INSERT INTO config (key, value) VALUES ('admin_password', ?)`, [hash]);
          console.log('Default admin password set to "admin123"');
        }
      });
    });
  }
});

module.exports = db;
