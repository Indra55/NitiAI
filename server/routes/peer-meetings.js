const express = require("express");
const router = express.Router();
const pool = require("../config/dbConfig");
const { authenticateToken } = require("../middleware/auth");

// POST /api/peer-meetings - Create a new peer meeting
router.post("/", authenticateToken, async (req, res) => {
    try {
        const user_id = req.user.id;
        const {
            peer_name,
            peer_email,
            peer_linkedin,
            meeting_title,
            meeting_agenda,
            meeting_topics, // Expected to be a comma-separated string from frontend or array
            skill_level,
            meeting_type,
            scheduled_date,
            scheduled_time,
            duration_minutes,
            timezone
        } = req.body;

        // Validation
        if (!peer_name || !meeting_title || !meeting_agenda) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Convert meeting_topics to array if it's a string
        let topicsArray = [];
        if (typeof meeting_topics === 'string') {
            topicsArray = meeting_topics.split(',').map(t => t.trim()).filter(t => t);
        } else if (Array.isArray(meeting_topics)) {
            topicsArray = meeting_topics;
        }

        const query = `
            INSERT INTO peer_meetings (
                user_id,
                peer_name,
                peer_email,
                peer_linkedin,
                meeting_title,
                meeting_agenda,
                meeting_topics,
                skill_level,
                meeting_type,
                scheduled_date,
                scheduled_time,
                duration_minutes,
                timezone,
                meeting_url,
                status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'scheduled')
            RETURNING *
        `;

        const values = [
            user_id,
            peer_name,
            peer_email || null,
            peer_linkedin || null,
            meeting_title,
            meeting_agenda,
            topicsArray,
            skill_level || 'intermediate',
            meeting_type || 'mock-interview',
            scheduled_date || null,
            scheduled_time || null,
            duration_minutes || 60,
            timezone || 'UTC',
            'https://peer2peer.hitanshu.tech'
        ];

        const result = await pool.query(query, values);

        res.status(201).json({
            message: "Peer meeting created successfully",
            meeting: result.rows[0]
        });

    } catch (error) {
        console.error("Error creating peer meeting:", error);
        res.status(500).json({ error: "Failed to create peer meeting" });
    }
});

// GET /api/peer-meetings - Get user's peer meetings
router.get("/", authenticateToken, async (req, res) => {
    try {
        const user_id = req.user.id;

        const query = `
            SELECT * FROM peer_meetings
            WHERE user_id = $1
            ORDER BY scheduled_date DESC, scheduled_time DESC
        `;

        const result = await pool.query(query, [user_id]);

        res.json({ meetings: result.rows });
    } catch (error) {
        console.error("Error fetching peer meetings:", error);
        res.status(500).json({ error: "Failed to fetch peer meetings" });
    }
});

module.exports = router;
