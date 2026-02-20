const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/dbConfig");
const { authenticateToken } = require("../middleware/auth");

// Register new user
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Please provide username, email, and password" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    // Check if user already exists
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: "User with this email already exists" });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashedPassword]
    );

    res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0]
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "An error occurred during registration" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Please provide email and password" });
    }

    // Find user
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "strict"
    });

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        onboarding_completed: user.onboarding_completed
      },
      token
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "An error occurred during login" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout successful" });
});

// Get current user profile (comprehensive)
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch core user data
    const userResult = await pool.query(
      `SELECT id, username, name, email, phone, location, age,
              proficiency_level, preferred_work_mode, availability_timeline,
              career_goal_short, career_goal_long,
              onboarding_completed, onboarding_step,
              created_at, updated_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userResult.rows[0];

    // 2. Fetch skills
    const skillsResult = await pool.query(
      "SELECT id, skill_name, skill_type, proficiency FROM skills WHERE user_id = $1",
      [userId]
    );
    const skills = skillsResult.rows;

    // 3. Fetch education
    const educationResult = await pool.query(
      "SELECT id, degree, major, institution, graduation_year FROM education WHERE user_id = $1 ORDER BY graduation_year DESC",
      [userId]
    );
    const education = educationResult.rows;

    // 4. Fetch experience
    const experienceResult = await pool.query(
      "SELECT id, title, organization, description, start_date, end_date FROM experience WHERE user_id = $1 ORDER BY start_date DESC",
      [userId]
    );
    const experience = experienceResult.rows;

    // 5. Fetch preferences
    const preferencesResult = await pool.query(
      "SELECT interests, preferred_roles, industry_preferences FROM preferences WHERE user_id = $1",
      [userId]
    );
    const preferences = preferencesResult.rows[0] || {
      interests: [],
      preferred_roles: [],
      industry_preferences: []
    };

    // 6. Fetch certifications/links
    const certsResult = await pool.query(
      "SELECT id, label, url FROM certifications_links WHERE user_id = $1",
      [userId]
    );
    const certifications = certsResult.rows;

    // 7. Fetch optional profile data
    const optionalResult = await pool.query(
      "SELECT gender, expected_salary, work_style_preference FROM optional_profile WHERE user_id = $1",
      [userId]
    );
    const optionalProfile = optionalResult.rows[0] || {};

    // 8. Fetch resume info
    const resumeResult = await pool.query(
      `SELECT resume_source, uploaded_at, parsed_successfully,
              extracted_name, extracted_email, extracted_phone, extracted_location,
              linkedin_url, portfolio_url,
              professional_title, years_of_experience, professional_summary,
              technical_skills, soft_skills,
              completeness_score, ats_score,
              strengths, improvement_areas, missing_elements,
              created_at as resume_created_at, updated_at as resume_updated_at
       FROM resume_info WHERE user_id = $1`,
      [userId]
    );
    const resumeInfo = resumeResult.rows[0];

    // 9. Calculate profile completeness
    const completeness = calculateProfileCompleteness(user, skills, education, experience, preferences, resumeInfo);

    // 10. Build comprehensive response
    const response = {
      user: {
        // Core info
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        age: user.age,

        // Career info
        proficiency_level: user.proficiency_level,
        preferred_work_mode: user.preferred_work_mode,
        availability_timeline: user.availability_timeline,
        career_goal_short: user.career_goal_short,
        career_goal_long: user.career_goal_long,

        // Status
        onboarding_completed: user.onboarding_completed,
        onboarding_step: user.onboarding_step,

        // Timestamps
        created_at: user.created_at,
        updated_at: user.updated_at
      },

      // Related data
      skills: skills,
      education: education,
      experience: experience,
      preferences: preferences,
      certifications: certifications,
      optional_profile: optionalProfile,

      // Resume data (if uploaded)
      resume: resumeInfo ? {
        uploaded: true,
        source: resumeInfo.resume_source,
        uploaded_at: resumeInfo.uploaded_at,
        parsed_successfully: resumeInfo.parsed_successfully,

        // Extracted info
        extracted_info: {
          name: resumeInfo.extracted_name,
          email: resumeInfo.extracted_email,
          phone: resumeInfo.extracted_phone,
          location: resumeInfo.extracted_location,
          linkedin_url: resumeInfo.linkedin_url,
          portfolio_url: resumeInfo.portfolio_url
        },

        // Professional summary
        professional_title: resumeInfo.professional_title,
        years_of_experience: resumeInfo.years_of_experience,
        professional_summary: resumeInfo.professional_summary,

        // Skills from resume
        technical_skills: resumeInfo.technical_skills || [],
        soft_skills: resumeInfo.soft_skills || [],

        // Scores
        completeness_score: resumeInfo.completeness_score,
        ats_score: resumeInfo.ats_score,

        // Analysis
        strengths: resumeInfo.strengths || [],
        improvement_areas: resumeInfo.improvement_areas || [],
        missing_elements: resumeInfo.missing_elements || []
      } : {
        uploaded: false
      },

      // Profile stats
      stats: {
        total_skills: skills.length,
        technical_skills_count: skills.filter(s => s.skill_type === 'technical').length,
        soft_skills_count: skills.filter(s => s.skill_type === 'soft').length,
        education_count: education.length,
        experience_count: experience.length,
        certifications_count: certifications.length
      },

      // Profile completeness
      profile_completeness: completeness
    };

    res.json(response);

  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "An error occurred while fetching profile" });
  }
});

/**
 * Helper: Calculate profile completeness percentage
 */
function calculateProfileCompleteness(user, skills, education, experience, preferences, resumeInfo) {
  const breakdown = {
    basic_info: 0,
    skills: 0,
    education: 0,
    experience: 0,
    preferences: 0,
    resume: 0
  };

  // Basic info - max 20 points
  if (user.name) breakdown.basic_info += 5;
  if (user.email) breakdown.basic_info += 5;
  if (user.phone) breakdown.basic_info += 3;
  if (user.location) breakdown.basic_info += 3;
  if (user.career_goal_short) breakdown.basic_info += 4;

  // Skills - max 20 points
  if (skills.length >= 1) breakdown.skills += 5;
  if (skills.length >= 3) breakdown.skills += 5;
  if (skills.length >= 5) breakdown.skills += 5;
  if (skills.length >= 8) breakdown.skills += 5;

  // Education - max 15 points
  if (education.length >= 1) breakdown.education += 10;
  if (education.length >= 2) breakdown.education += 5;

  // Experience - max 20 points
  if (experience.length >= 1) breakdown.experience += 10;
  if (experience.length >= 2) breakdown.experience += 5;
  if (experience.length >= 3) breakdown.experience += 5;

  // Preferences - max 10 points
  if (preferences.interests && preferences.interests.length > 0) breakdown.preferences += 5;
  if (preferences.preferred_roles && preferences.preferred_roles.length > 0) breakdown.preferences += 5;

  // Resume - max 15 points
  if (resumeInfo) {
    breakdown.resume += 10;
    if (resumeInfo.ats_score && resumeInfo.ats_score >= 70) breakdown.resume += 5;
  }

  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const percentage = Math.min(100, total);

  return {
    percentage,
    breakdown,
    suggestions: generateSuggestions(breakdown, skills, education, experience, preferences, resumeInfo)
  };
}

/**
 * Helper: Generate suggestions to improve profile
 */
function generateSuggestions(breakdown, skills, education, experience, preferences, resumeInfo) {
  const suggestions = [];

  if (breakdown.basic_info < 20) {
    suggestions.push({ area: "basic_info", message: "Complete your basic profile info (phone, location, career goal)" });
  }
  if (skills.length < 5) {
    suggestions.push({ area: "skills", message: `Add more skills (currently ${skills.length}, aim for 5+)` });
  }
  if (education.length === 0) {
    suggestions.push({ area: "education", message: "Add your education history" });
  }
  if (experience.length === 0) {
    suggestions.push({ area: "experience", message: "Add your work experience or projects" });
  }
  if (!preferences.interests || preferences.interests.length === 0) {
    suggestions.push({ area: "preferences", message: "Add your interests and preferred roles" });
  }
  if (!resumeInfo) {
    suggestions.push({ area: "resume", message: "Upload your resume for AI-powered insights" });
  }

  return suggestions;
}

// Update user profile
router.put("/me", authenticateToken, async (req, res) => {
  try {
    const {
      username,
      name,
      email,
      phone,
      location,
      age,
      proficiency_level,
      preferred_work_mode,
      availability_timeline,
      career_goal_short,
      career_goal_long
    } = req.body;

    // If email is being changed, check if it already exists
    if (email) {
      const existingEmail = await pool.query(
        "SELECT id FROM users WHERE email = $1 AND id != $2",
        [email, req.user.id]
      );
      if (existingEmail.rows.length > 0) {
        return res.status(409).json({ error: "Email already in use by another account" });
      }
    }

    // Helper to convert empty strings to null to avoid constraint violations
    const sanitize = (val) => (val === "" ? null : val);

    const result = await pool.query(
      `UPDATE users SET 
        username = COALESCE($1, username),
        name = COALESCE($2, name),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        location = COALESCE($5, location),
        age = COALESCE($6, age),
        proficiency_level = COALESCE($7, proficiency_level),
        preferred_work_mode = COALESCE($8, preferred_work_mode),
        availability_timeline = COALESCE($9, availability_timeline),
        career_goal_short = COALESCE($10, career_goal_short),
        career_goal_long = COALESCE($11, career_goal_long),
        updated_at = now()
      WHERE id = $12 
      RETURNING id, username, name, email, phone, location, age, proficiency_level, preferred_work_mode, availability_timeline, career_goal_short, career_goal_long`,
      [
        username,
        name,
        email,
        phone,
        location,
        age,
        sanitize(proficiency_level),
        sanitize(preferred_work_mode),
        availability_timeline,
        career_goal_short,
        career_goal_long,
        req.user.id
      ]
    );

    res.json({
      message: "Profile updated successfully",
      user: result.rows[0]
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "An error occurred while updating profile" });
  }
});

module.exports = router;
