require("dotenv").config();
const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction
    ? { rejectUnauthorized: false }
    : false,
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 30000,
});

module.exports = pool;
