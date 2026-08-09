require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 30000,
});

// Suppress unhandled DB pool errors during network/DNS downtime
pool.on('error', (err) => {
  console.warn('[PostgreSQL Pool Network Notice]', err.message);
});

module.exports = pool;
