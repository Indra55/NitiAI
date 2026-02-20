const express = require("express");
const router = express.Router();
const pool = require("../config/dbConfig");
const { authenticateToken } = require("../middleware/auth");

/**
 * @route GET /api/skills
 * @desc Get all skill names for the current user
 * @access Private
 */
router.get("/", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, skill_name FROM skills WHERE user_id = $1",
            [req.user.id]
        );
        res.json({ skills: result.rows });
    } catch (err) {
        console.error("Get skills error:", err);
        res.status(500).json({ error: "Failed to fetch skills" });
    }
});

/** 
 * @route POST /api/skills
 * @desc Add skills (can be a single string or an array of strings)
 * @access Private
 */
router.post("/", authenticateToken, async (req, res) => {
    const { skills } = req.body;

    if (!skills) {
        return res.status(400).json({ error: "Skills are required" });
    }

    const skillsArray = Array.isArray(skills) ? skills : [skills];

    try {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            const insertedSkills = [];
            for (const skillName of skillsArray) {
                if (skillName && typeof skillName === 'string') {
                    const result = await client.query(
                        "INSERT INTO skills (user_id, skill_name) VALUES ($1, $2) RETURNING id, skill_name",
                        [req.user.id, skillName.trim()]
                    );
                    insertedSkills.push(result.rows[0]);
                }
            }

            await client.query("COMMIT");
            res.status(201).json({
                message: "Skills added successfully",
                skills: insertedSkills
            });
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Add skills error:", err);
        res.status(500).json({ error: "Failed to add skills" });
    }
});

/**
 * @route DELETE /api/skills/:id
 * @desc Remove a skill
 * @access Private
 */
router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            "DELETE FROM skills WHERE id = $1 AND user_id = $2 RETURNING id",
            [req.params.id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Skill not found" });
        }

        res.json({ message: "Skill removed" });
    } catch (err) {
        console.error("Delete skill error:", err);
        res.status(500).json({ error: "Failed to delete skill" });
    }
});

module.exports = router;
