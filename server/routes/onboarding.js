const express = require("express");
const router = express.Router();
const pool = require("../config/dbConfig");
const { authenticateToken } = require("../middleware/auth");
const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data");

const upload = multer({ storage: multer.memoryStorage() });

/**
 * @route POST /api/onboarding/basic-info
 * @desc Step 1: Basic Info (name, phone, age, gender, location)
 * @access Private
 */
router.post("/basic-info", authenticateToken, async (req, res) => {
    const { name, phone, age, gender, location } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Name is required" });
    }

    try {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // Update users table
            await client.query(
                `UPDATE users SET 
          name = $1,
          phone = $2,
          location = $3,
          age = $4,
          onboarding_step = 1,
          updated_at = now()
        WHERE id = $5`,
                [name, phone, location, age, req.user.id]
            );

            // Update optional_profile table for gender
            if (gender) {
                await client.query(
                    `INSERT INTO optional_profile (user_id, gender) 
           VALUES ($1, $2) 
           ON CONFLICT (user_id) DO UPDATE SET gender = EXCLUDED.gender`,
                    [req.user.id, gender]
                );
            }

            await client.query("COMMIT");
            res.json({
                message: "Page 1 completed",
                next_step: 2
            });
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Onboarding Pg1 error:", err);
        res.status(500).json({ error: "Failed to save Page 1 data" });
    }
});

/**
 * @route POST /api/onboarding/career-goals
 * @desc Step 2: Career Info (role, current status, experience)
 * @access Private
 */
router.post("/career-goals", authenticateToken, async (req, res) => {
    const { role, status, experience } = req.body;

    if (!role) {
        return res.status(400).json({ error: "Role is required" });
    }

    // Map frontend experience levels to database proficiency levels
    const experienceToProficiency = {
        'beginner': 'beginner',
        'junior': 'beginner',
        'mid': 'intermediate',
        'senior': 'advanced',
        'expert': 'advanced'
    };

    const proficiency = experience ? experienceToProficiency[experience] || null : null;

    try {
        await pool.query(
            `UPDATE users SET 
        career_goal_short = $1,
        proficiency_level = COALESCE($2, proficiency_level),
        availability_timeline = $3,
        onboarding_step = 2,
        updated_at = now()
      WHERE id = $4`,
            [role, proficiency, status, req.user.id]
        );

        res.json({ message: "Page 2 completed", next_step: 3 });
    } catch (err) {
        console.error("Onboarding Pg2 error:", err);
        res.status(500).json({ error: "Failed to save Page 2 data" });
    }
});

/**
 * @route POST /api/onboarding/skills
 * @desc Step 3: Skills (blind entry)
 * @access Private
 */
router.post("/skills", authenticateToken, async (req, res) => {
    const { skills } = req.body;

    if (!skills) {
        return res.status(400).json({ error: "Skills are required" });
    }

    const skillsArray = Array.isArray(skills) ? skills : [skills];

    try {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            for (const skillName of skillsArray) {
                if (skillName && typeof skillName === 'string') {
                    await client.query(
                        "INSERT INTO skills (user_id, skill_name) VALUES ($1, $2)",
                        [req.user.id, skillName.trim()]
                    );
                }
            }

            // Mark onboarding as completed
            await client.query(
                "UPDATE users SET onboarding_completed = true, onboarding_step = 3 WHERE id = $1",
                [req.user.id]
            );

            await client.query("COMMIT");
            res.json({ message: "Onboarding completed successfully" });
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Onboarding Pg3 error:", err);
        res.status(500).json({ error: "Failed to save Page 3 data" });
    }
});

/**
 * @route POST /api/onboarding/resume
 * @desc Step 4: Resume upload (redirects to comprehensive parser)
 * @access Private
 * @deprecated Use /api/resume/upload instead for full AI-powered parsing
 */
router.post("/resume", authenticateToken, upload.single("resume"), async (req, res) => {
    // This endpoint now serves as a simple wrapper
    // The actual parsing is done in /api/resume/upload
    res.json({
        message: "Please use /api/resume/upload for comprehensive resume parsing",
        redirect: "/api/resume/upload",
        note: "The new endpoint provides AI-powered parsing with career insights and recommendations"
    });
});

module.exports = router;
