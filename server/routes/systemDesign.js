const express = require("express");
const router = express.Router();
const sarvamService = require("../services/sarvamService");
const { optionalAuth } = require("../middleware/auth");

// ─── In-memory challenge cache (per user, 10 min TTL) ─────────────────────────
// Avoids regenerating challenges on every page visit; cleared on refresh=true
const challengeCache = new Map(); // userId → { challenges, expiresAt }
const CACHE_TTL = 10 * 60 * 1000;

function getCached(userId) {
  const entry = challengeCache.get(userId);
  if (!entry || Date.now() > entry.expiresAt) { challengeCache.delete(userId); return null; }
  return entry.challenges;
}
function setCache(userId, challenges) {
  challengeCache.set(userId, { challenges, expiresAt: Date.now() + CACHE_TTL });
}

// ─── Fallback challenges (used when Sarvam AI is unavailable) ─────────────────
const FALLBACK_CHALLENGES = [
  {
    id: "social-feed",
    title: "Design a social media feed",
    summary: "Build a home feed that stays fast as creators and readers scale.",
    prompt: "Design the backend for a social-media home feed. Users follow creators, publish posts, and need a relevant, low-latency feed when they open the app.",
    requirements: [
      "Serve a feed in under 200 ms for active users",
      "Support millions of followers for popular creators",
      "Keep new posts visible without overloading the database",
    ],
    focus: ["Read vs. write paths", "Caching and fan-out", "Database scaling"],
  },
  {
    id: "flash-sale",
    title: "Design a flash-sale checkout",
    summary: "Handle a burst of buyers without overselling a limited inventory item.",
    prompt: "Design a checkout system for a flash sale with 100,000 units and millions of simultaneous purchase attempts. Prevent overselling while keeping checkout responsive.",
    requirements: [
      "Never oversell inventory",
      "Absorb sudden traffic spikes",
      "Process payment and order work reliably in the background",
    ],
    focus: ["Load shedding", "Queues and idempotency", "Consistency boundaries"],
  },
  {
    id: "photo-sharing",
    title: "Design photo sharing",
    summary: "Upload, transform, and deliver photos worldwide with smooth playback.",
    prompt: "Design a photo-sharing service where users upload images, receive resized variants, and view public photos globally with low latency.",
    requirements: [
      "Upload and process large image files",
      "Generate thumbnails asynchronously",
      "Deliver popular media quickly around the world",
    ],
    focus: ["Object/media processing", "Async jobs", "CDN and caching"],
  },
];

// ─── POST /api/system-design/challenges ───────────────────────────────────────
router.post("/challenges", optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { count = 3, refresh = false } = req.body;

    // Return cache unless user explicitly refreshes
    if (!refresh && userId) {
      const cached = getCached(userId);
      if (cached) return res.json({ challenges: cached, source: "cache" });
    }

    const systemPrompt = `You are a senior staff engineer designing system-design interview questions.
Generate exactly ${count} distinct, realistic system-design challenges for a software engineering interview.
Each challenge must test a DIFFERENT architectural domain (e.g., storage, messaging, compute, delivery, consistency).
Return ONLY a valid JSON array — no markdown, no commentary — in this exact shape:
[
  {
    "id": "unique-kebab-case-id",
    "title": "Design a <concise system name>",
    "summary": "One sentence (max 20 words) describing the core scaling challenge.",
    "prompt": "2-3 sentence problem statement with concrete scale numbers (users, QPS, storage).",
    "requirements": ["Requirement 1", "Requirement 2", "Requirement 3"],
    "focus": ["Topic 1", "Topic 2", "Topic 3"]
  }
]`;

    const userPrompt = `Generate ${count} system-design interview challenges. Each must cover a different domain. Return only the JSON array.`;

    let challenges = null;

    try {
      const raw = await sarvamService.generateCompletion(userPrompt, systemPrompt);
      // Strip any accidental markdown fences
      const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      if (Array.isArray(parsed) && parsed.length > 0) {
        challenges = parsed.slice(0, count);
      }
    } catch (aiErr) {
      console.warn("[system-design] AI generation failed:", aiErr.message);
    }

    // Fallback to curated set if AI unavailable or returned bad JSON
    if (!challenges) {
      challenges = FALLBACK_CHALLENGES.slice(0, count);
    }

    if (userId) setCache(userId, challenges);
    return res.json({ challenges, source: challenges === FALLBACK_CHALLENGES ? "fallback" : "ai" });
  } catch (err) {
    console.error("[system-design] /challenges error:", err);
    res.status(500).json({ error: "Failed to generate challenges" });
  }
});

module.exports = router;
