require("dotenv").config();
const { Pool } = require("pg");
const dns = require("dns");
const { URL } = require("url");

// ─── Force IPv4 DNS so Neon's IPv6-only records don't cause ENETUNREACH ───────
// Neon's pooler hostname currently resolves only to IPv6 addresses.
// If the local network has no IPv6 route, every connection times out.
// Setting the DNS lookup order to IPv4-first guarantees we always get a
// routable address on networks that have IPv4 but not IPv6.
dns.setDefaultResultOrder("ipv4first");

// ─── Parse connection string ──────────────────────────────────────────────────
// Strip ?sslmode=... from the URL so pg doesn't see an ambiguous SSL mode
// that triggers the security alias warning. We set SSL explicitly below.
function buildPoolConfig() {
  const rawUrl = process.env.DATABASE_URL || "";
  let cleanUrl = rawUrl;
  try {
    const u = new URL(rawUrl);
    // Remove params that conflict with our explicit ssl config
    u.searchParams.delete("sslmode");
    u.searchParams.delete("channel_binding");
    u.searchParams.delete("uselibpqcompat");
    cleanUrl = u.toString();
  } catch {
    // If URL parsing fails, fall back to the raw string
  }

  const isProduction = process.env.NODE_ENV === "production";
  const hasRemoteDb = rawUrl.includes("neon.tech") ||
                      rawUrl.includes("supabase") ||
                      rawUrl.includes("render.com") ||
                      rawUrl.includes("railway.app") ||
                      isProduction;

  return {
    connectionString: cleanUrl,
    // Always use TLS for remote DB hosts regardless of NODE_ENV
    ssl: hasRemoteDb ? { rejectUnauthorized: false } : false,
    // Connection pool tuning for Neon serverless postgres
    max: 20,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 30_000, // 30s to allow Neon cold compute wake-up
    keepAlive: true,
    keepAliveInitialDelayMillis: 10_000,
  };
}

const pool = new Pool(buildPoolConfig());

// Add robust retry wrapper for transient pooler timeouts
const originalQuery = pool.query.bind(pool);
pool.queryWithRetry = async (text, params, retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      return await originalQuery(text, params);
    } catch (err) {
      if (i === retries || !err.message.includes('ETIMEDOUT')) throw err;
      console.warn(`[DB Pool] Transient pool timeout. Retrying (${i + 1}/${retries})...`);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
};

// ─── Graceful error handling ──────────────────────────────────────────────────
pool.on("error", (err) => {
  // Silent log for idle socket drops by serverless pooler
  console.warn("[DB Pool] Idle socket reset by remote pooler:", err.message);
});

// ─── Health check helper ──────────────────────────────────────────────────────
pool.healthCheck = async () => {
  try {
    const client = await pool.connect();
    try {
      await client.query("SELECT 1");
      return true;
    } finally {
      client.release();
    }
  } catch (err) {
    return false;
  }
};

// Ensure native_language column exists in users table
pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS native_language VARCHAR(20) DEFAULT 'hi-IN';")
  .then(() => console.log("✅ DB Migration: native_language column verified"))
  .catch((err) => console.warn("DB Migration Warning:", err.message));

module.exports = pool;
