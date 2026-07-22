require('dotenv').config();
const { Pool } = require('pg');

const PG_URL = process.env.DATABASE_URL;

if (!PG_URL) {
  console.error("❌ ERROR: Missing DATABASE_URL environment variable.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: PG_URL,
  ssl: { rejectUnauthorized: false }
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

// Test connection and initialize default admin if not exists
pool.connect(async (err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to the PostgreSQL database.');
  
  try {
    const bcrypt = require('bcryptjs');
    const res = await client.query(`SELECT value FROM "config" WHERE key = 'admin_password'`);
    if (res.rows.length === 0) {
      const hash = bcrypt.hashSync('admin123', 10);
      await client.query(`INSERT INTO "config" (key, value) VALUES ($1, $2)`, ['admin_password', hash]);
      console.log('Default admin password set to "admin123"');
    }
  } catch (err) {
    console.error('Error checking/setting admin password:', err.stack);
  } finally {
    release();
  }
});

module.exports = pool;
