const express = require("express");
const router = express.Router();
const pool = require("../config/dbConfig");
const { authenticateToken } = require("../middleware/auth");

/**
 * @route GET /api/profile/education
 * @desc Get all education records for the current user
 * @access Private
 */
router.get("/education", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, degree, major, institution, graduation_year FROM education WHERE user_id = $1 ORDER BY graduation_year DESC",
            [req.user.id]
        );
        res.json({ education: result.rows });
    } catch (err) {
        console.error("Get education error:", err);
        res.status(500).json({ error: "Failed to fetch education" });
    }
}); 

/**
 * @route POST /api/profile/education
 * @desc Add education details
 * @access Private
 */
router.post("/education", authenticateToken, async (req, res) => {
    const { degree, major, institution, graduation_year } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO education (user_id, degree, major, institution, graduation_year) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [req.user.id, degree, major, institution, graduation_year]
        );
        res.status(201).json({ message: "Education added successfully", data: result.rows[0] });
    } catch (err) {
        console.error("Education error:", err);
        res.status(500).json({ error: "Failed to add education" });
    }
});

/**
 * @route GET /api/profile/experience
 * @desc Get all experience records for the current user
 * @access Private
 */
router.get("/experience", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, title, organization, description, start_date, end_date FROM experience WHERE user_id = $1 ORDER BY start_date DESC",
            [req.user.id]
        );
        res.json({ experience: result.rows });
    } catch (err) {
        console.error("Get experience error:", err);
        res.status(500).json({ error: "Failed to fetch experience" });
    }
});

/**
 * @route POST /api/profile/experience
 * @desc Add work experience
 * @access Private
 */
router.post("/experience", authenticateToken, async (req, res) => {
    const { title, organization, description, start_date, end_date } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO experience (user_id, title, organization, description, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [req.user.id, title, organization, description, start_date, end_date]
        );
        res.status(201).json({ message: "Experience added successfully", data: result.rows[0] });
    } catch (err) {
        console.error("Experience error:", err);
        res.status(500).json({ error: "Failed to add experience" });
    }
});


/**
 * @route POST /api/profile/preferences
 * @desc Update user preferences
 * @access Private
 */
router.post("/preferences", authenticateToken, async (req, res) => {
    const { interests, preferred_roles, industry_preferences } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO preferences (user_id, interests, preferred_roles, industry_preferences) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (user_id) DO UPDATE SET 
       interests = EXCLUDED.interests, 
       preferred_roles = EXCLUDED.preferred_roles, 
       industry_preferences = EXCLUDED.industry_preferences 
       RETURNING *`,
            [req.user.id, interests || [], preferred_roles || [], industry_preferences || []]
        );
        res.json({ message: "Preferences updated successfully", data: result.rows[0] });
    } catch (err) {
        console.error("Preferences error:", err);
        res.status(500).json({ error: "Failed to update preferences" });
    }
});

/**
 * @route POST /api/profile/optional
 * @desc Update optional profile details
 * @access Private
 */
router.post("/optional", authenticateToken, async (req, res) => {
    const { gender, expected_salary, work_style_preference } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO optional_profile (user_id, gender, expected_salary, work_style_preference) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (user_id) DO UPDATE SET 
       gender = EXCLUDED.gender, 
       expected_salary = EXCLUDED.expected_salary, 
       work_style_preference = EXCLUDED.work_style_preference 
       RETURNING *`,
            [req.user.id, gender, expected_salary, work_style_preference]
        );
        res.json({ message: "Optional profile updated successfully", data: result.rows[0] });
    } catch (err) {
        console.error("Optional profile error:", err);
        res.status(500).json({ error: "Failed to update optional profile" });
    }
});

/**
 * @route POST /api/profile/certifications
 * @desc Add certifications or links
 * @access Private
 */
router.post("/certifications", authenticateToken, async (req, res) => {
    const { label, url } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO certifications_links (user_id, label, url) VALUES ($1, $2, $3) RETURNING *",
            [req.user.id, label, url]
        );
        res.status(201).json({ message: "Certification/Link added successfully", data: result.rows[0] });
    } catch (err) {
        console.error("Certifications error:", err);
        res.status(500).json({ error: "Failed to add certification or link" });
    }
});

module.exports = router;
