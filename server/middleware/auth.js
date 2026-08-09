const jwt = require("jsonwebtoken");
const pool = require("../config/dbConfig");

// ─── User cache (in-memory, TTL 5 minutes) ────────────────────────────────────
// When the DB pool is warming up or has a transient failure, serve the
// last successfully fetched user record instead of a skeletal fallback.
const USER_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const userCache = new Map(); // userId → { data, expiresAt }

function cacheUser(userId, userData) {
    userCache.set(userId, { data: userData, expiresAt: Date.now() + USER_CACHE_TTL_MS });
}

function getCachedUser(userId) {
    const entry = userCache.get(userId);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) { userCache.delete(userId); return null; }
    return entry.data;
}

// Evict expired entries periodically (every 10 min) to avoid memory growth
setInterval(() => {
    const now = Date.now();
    for (const [id, entry] of userCache) {
        if (now > entry.expiresAt) userCache.delete(id);
    }
}, 10 * 60 * 1000).unref();

// ─── DB fetch with one retry ──────────────────────────────────────────────────
const USER_QUERY = `
    SELECT id, username, email, phone, location, proficiency_level,
           preferred_work_mode, availability_timeline,
           career_goal_short, career_goal_long,
           onboarding_completed, onboarding_step
    FROM users WHERE id = $1`;

async function fetchUserFromDb(userId) {
    try {
        const result = await pool.query(USER_QUERY, [userId]);
        return result.rows[0] || null;
    } catch (firstErr) {
        // One 300 ms retry — handles pool warm-up race on server start
        await new Promise((r) => setTimeout(r, 300));
        try {
            const result = await pool.query(USER_QUERY, [userId]);
            return result.rows[0] || null;
        } catch (retryErr) {
            throw retryErr; // let caller decide what to do
        }
    }
}

// ─── Helper to extract token ──────────────────────────────────────────────────
function extractToken(req) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) return authHeader.substring(7);
    return req.cookies?.token;
}

// ─── authenticateToken (required) ────────────────────────────────────────────
async function authenticateToken(req, res, next) {
    const token = extractToken(req);

    if (!token) {
        return res.status(401).json({ error: "Authentication required" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        try {
            const userData = await fetchUserFromDb(userId);

            if (!userData) {
                // User deleted from DB — invalidate session
                res.clearCookie("token");
                return res.status(401).json({ error: "User not found" });
            }

            cacheUser(userId, userData);
            req.user = userData;
        } catch (dbErr) {
            // DB unavailable — serve cached user if we have one
            const cached = getCachedUser(userId);
            if (cached) {
                req.user = cached;
            } else {
                // No cache yet — minimal fallback (only happens on very first
                // request after a fresh server start with DB unreachable)
                console.warn("[Auth] DB unavailable, using JWT-only fallback for", userId);
                req.user = { id: userId, username: decoded.username || "user" };
            }
        }

        next();
    } catch (err) {
        res.clearCookie("token");
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}

// ─── optionalAuth ─────────────────────────────────────────────────────────────
async function optionalAuth(req, res, next) {
    const token = extractToken(req);
    if (!token) return next();

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        try {
            const result = await pool.query(
                "SELECT id, username, email, onboarding_completed FROM users WHERE id = $1",
                [userId]
            );
            if (result.rows.length > 0) {
                req.user = result.rows[0];
                cacheUser(userId, result.rows[0]);
            }
        } catch {
            // Serve cache on DB failure
            const cached = getCachedUser(userId);
            if (cached) req.user = cached;
        }
    } catch {
        res.clearCookie("token");
    }

    next();
}

module.exports = { authenticateToken, optionalAuth };