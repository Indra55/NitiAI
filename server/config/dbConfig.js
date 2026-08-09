require("dotenv").config();
const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction
    ? { rejectUnauthorized: false }
    : false
});

// Suppress unhandled DB pool errors during network/DNS downtime
pool.on('error', (err) => {
  console.warn('[PostgreSQL Pool Network Notice]', err.message);
});

module.exports = pool;
