require("dotenv").config();
const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
<<<<<<< HEAD
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 30000,
});

// Suppress unhandled DB pool errors during network/DNS downtime
pool.on('error', (err) => {
  console.warn('[PostgreSQL Pool Network Notice]', err.message);
=======
  ssl: isProduction
    ? { rejectUnauthorized: false }
    : false,
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 30000,
>>>>>>> 13c74dd87da51f6a8aaa832204a49832ee68af6c
});

module.exports = pool;
