const express = require("express");
const router = express.Router();
const pool = require("../config/dbConfig");
const { authenticateToken } = require("../middleware/auth");

/**
 * @route GET /api/recommendations/career
 * @desc Get career recommendations based on user profile
 * @access Private
 */
router.get("/career", authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        // 1. Fetch user profile data
        const userResult = await pool.query(
            "SELECT proficiency_level, career_goal_short, preferred_work_mode FROM users WHERE id = $1",
            [userId]
        );
        const user = userResult.rows[0];

        // 2. Fetch skills
        const skillsResult = await pool.query(
            "SELECT skill_name, proficiency FROM skills WHERE user_id = $1",
            [userId]
        );
        const skills = skillsResult.rows;

        // 3. Fetch experience count
        const expResult = await pool.query(
            "SELECT COUNT(*) as exp_count FROM experience WHERE user_id = $1",
            [userId]
        );
        const expCount = parseInt(expResult.rows[0].exp_count);

        // 4. Fetch preferences
        const prefResult = await pool.query(
            "SELECT preferred_roles, industry_preferences FROM preferences WHERE user_id = $1",
            [userId]
        );
        const preferences = prefResult.rows[0] || { preferred_roles: [], industry_preferences: [] };

        /**
         * Career Recommendation Logic (Mocked for this stage)
         * Requirements:
         * - Use user profile data, skills, experience count, preferences
         * - Work even if resume was never uploaded
         * - Work even if extended profile is empty
         */

        const recommendations = [];

        // Heuristic 1: Based on Career Goal
        if (user && user.career_goal_short) {
            recommendations.push({
                title: `Senior ${user.career_goal_short}`,
                reason: `Aligns with your stated goal of becoming a ${user.career_goal_short}`,
                match_score: 95
            });
        }

        // Heuristic 2: Based on Skills
        if (skills && skills.length > 0) {
            const topSkills = skills.sort((a, b) => b.proficiency - a.proficiency).slice(0, 2);
            topSkills.forEach(skill => {
                recommendations.push({
                    title: `${skill.skill_name} Specialist`,
                    reason: `Leverages your proficiency in ${skill.skill_name}`,
                    match_score: 85
                });
            });
        }

        // Heuristic 3: Based on Preferences
        if (preferences.preferred_roles && preferences.preferred_roles.length > 0) {
            preferences.preferred_roles.forEach(role => {
                recommendations.push({
                    title: role,
                    reason: "Matches one of your preferred roles",
                    match_score: 90
                });
            });
        }

        // Heuristic 4: Based on Experience Count
        if (expCount > 5) {
            recommendations.push({
                title: "Technical Lead / Manager",
                reason: "Your extensive experience makes you a candidate for leadership roles",
                match_score: 80
            });
        } else if (expCount > 0 && expCount <= 2) {
            recommendations.push({
                title: "Junior Developer / Associate",
                reason: "Great starting point for your early career stage",
                match_score: 80
            });
        }

        // Fallback if no data is available
        if (recommendations.length === 0) {
            recommendations.push({
                title: "Software Engineer (General)",
                reason: "A versatile starting point for most technical careers",
                match_score: 60
            });
            recommendations.push({
                title: "Product Coordinator",
                reason: "Good entry-level role for career exploration",
                match_score: 55
            });
        }

        // Remove duplicates and limit results
        const uniqueRecommendations = Array.from(new Set(recommendations.map(r => r.title)))
            .map(title => recommendations.find(r => r.title === title))
            .sort((a, b) => b.match_score - a.match_score)
            .slice(0, 5);

        res.json({
            user_id: userId,
            recommendations: uniqueRecommendations
        });

    } catch (err) {
        console.error("Recommendations error:", err);
        res.status(500).json({ error: "Failed to generate career recommendations" });
    }
});

/**
 * @route GET /api/recommendations/dashboard
 * @desc Get comprehensive career dashboard data for homepage
 * @access Private
 * 
 * This endpoint fulfills the problem statement requirement:
 * "AI Career Path Recommender: Suggests suitable career paths and trending roles
 *  by analyzing user skills, education, and interests, with guidance on fast-growing industries"
 */
router.get("/dashboard", authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        // 1. Fetch user profile data
        const userResult = await pool.query(
            `SELECT id, name, email, phone, location, age,
                    proficiency_level, preferred_work_mode, availability_timeline,
                    career_goal_short, career_goal_long, onboarding_completed
             FROM users WHERE id = $1`,
            [userId]
        );
        const user = userResult.rows[0];

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // 2. Fetch skills
        const skillsResult = await pool.query(
            "SELECT skill_name, skill_type, proficiency FROM skills WHERE user_id = $1",
            [userId]
        );
        const skills = skillsResult.rows;
        const technicalSkills = skills.filter(s => s.skill_type === 'technical').map(s => s.skill_name);
        const softSkills = skills.filter(s => s.skill_type === 'soft').map(s => s.skill_name);
        const allSkillNames = skills.map(s => s.skill_name);

        // 3. Fetch education
        const eduResult = await pool.query(
            "SELECT degree, major, institution, graduation_year FROM education WHERE user_id = $1",
            [userId]
        );
        const education = eduResult.rows;

        // 4. Fetch experience
        const expResult = await pool.query(
            "SELECT title, organization, description, start_date, end_date FROM experience WHERE user_id = $1 ORDER BY start_date DESC",
            [userId]
        );
        const experience = expResult.rows;

        // 5. Fetch preferences (including interests)
        const prefResult = await pool.query(
            "SELECT interests, preferred_roles, industry_preferences FROM preferences WHERE user_id = $1",
            [userId]
        );
        const preferences = prefResult.rows[0] || { interests: [], preferred_roles: [], industry_preferences: [] };

        // 6. Fetch resume info if available
        const resumeResult = await pool.query(
            `SELECT professional_title, years_of_experience, professional_summary,
                    technical_skills, soft_skills, completeness_score, ats_score,
                    career_insights, education, experience, projects
             FROM resume_info WHERE user_id = $1`,
            [userId]
        );
        const resumeInfo = resumeResult.rows[0];

        // 7. Fetch Peer Meetings
        const peerResult = await pool.query(
            "SELECT COUNT(*) as meeting_count FROM peer_meetings WHERE user_id = $1",
            [userId]
        );
        const peerMeetingsCount = parseInt(peerResult.rows[0]?.meeting_count || 0);

        // 8. Calculate years of experience
        let calculatedYearsExp = 0;

        // Use resume experience if available, otherwise fall back to experience table
        const experienceSource = (resumeInfo && resumeInfo.experience && resumeInfo.experience.length > 0)
            ? resumeInfo.experience
            : experience;

        if (experienceSource.length > 0) {
            experienceSource.forEach(exp => {
                // Handle both formats (resume_info uses start_date, experience table uses start_date)
                if (exp.start_date) {
                    const startDate = new Date(exp.start_date);
                    const endDate = exp.end_date ? new Date(exp.end_date) : new Date();
                    const years = (endDate - startDate) / (1000 * 60 * 60 * 24 * 365);
                    calculatedYearsExp += Math.max(0, years);
                }
            });
        }
        calculatedYearsExp = Math.round(calculatedYearsExp);

        // 9. Build comprehensive profile for AI analysis
        // PRIORITIZE RESUME INFO as requested
        const comprehensiveProfile = {
            title: resumeInfo?.professional_title || user.career_goal_short,
            career_goal_short: user.career_goal_short,
            proficiency_level: user.proficiency_level,
            years_of_experience: resumeInfo?.years_of_experience || calculatedYearsExp || 0,
            technical_skills: resumeInfo?.technical_skills || technicalSkills,
            soft_skills: resumeInfo?.soft_skills || softSkills,
            skills: resumeInfo ? [...(resumeInfo.technical_skills || []), ...(resumeInfo.soft_skills || [])] : allSkillNames,

            // Map education from resume_info if available, else from education table
            education: (resumeInfo && resumeInfo.education && resumeInfo.education.length > 0)
                ? resumeInfo.education.map(e => ({
                    degree: e.degree,
                    field_of_study: e.field_of_study || e.major, // Handle both keys
                    institution: e.institution,
                    graduation_year: e.graduation_year
                }))
                : education.map(e => ({
                    degree: e.degree,
                    field_of_study: e.major,
                    institution: e.institution,
                    graduation_year: e.graduation_year
                })),

            // Map experience from resume_info if available, else from experience table
            experience: (resumeInfo && resumeInfo.experience && resumeInfo.experience.length > 0)
                ? resumeInfo.experience.map(e => ({
                    title: e.title,
                    company: e.company || e.organization, // Handle both keys
                    description: e.description
                }))
                : experience.map(e => ({
                    title: e.title,
                    company: e.organization,
                    description: e.description
                })),

            interests: preferences.interests || [],
            preferred_roles: preferences.preferred_roles || [],
            industry_preferences: preferences.industry_preferences || [],
            preferred_work_mode: user.preferred_work_mode
        };

        // 10. Generate AI-powered career dashboard
        const resumeService = require('./resumeParser');
        let careerDashboard;

        // Check if we have cached insights and they are in the correct format (Dashboard format)
        if (resumeInfo && resumeInfo.career_insights && resumeInfo.career_insights.recommended_career_paths) {
            console.log("Using cached career insights for user:", userId);
            careerDashboard = resumeInfo.career_insights;
        } else {
            console.log("Generating new career insights for user:", userId);
            careerDashboard = await resumeService.generateCareerDashboard(comprehensiveProfile);

            // Cache the result if successful
            if (careerDashboard && !careerDashboard.error) {
                try {
                    await pool.query(
                        `INSERT INTO resume_info (user_id, career_insights, updated_at)
                         VALUES ($1, $2, NOW())
                         ON CONFLICT (user_id)
                         DO UPDATE SET career_insights = $2, updated_at = NOW()`,
                        [userId, careerDashboard]
                    );
                    console.log("Cached career insights for user:", userId);
                } catch (cacheErr) {
                    console.error("Failed to cache career insights:", cacheErr);
                }
            }
        }

        // 11. Calculate profile completeness
        const profileCompleteness = calculateProfileCompleteness(user, skills, education, experience, preferences, resumeInfo, peerMeetingsCount);

        // 12. Build response
        const response = {
            user_id: userId,
            user_name: user.name,

            // Profile Overview
            profile_overview: {
                completeness_percentage: profileCompleteness.percentage,
                completeness_breakdown: profileCompleteness.breakdown,
                onboarding_completed: user.onboarding_completed,
                has_resume: !!resumeInfo,
                resume_score: resumeInfo?.ats_score || null
            },

            // AI-Generated Career Data
            career_dashboard: careerDashboard,

            // Quick Stats for Dashboard Cards
            quick_stats: {
                total_skills: allSkillNames.length,
                technical_skills_count: technicalSkills.length,
                years_of_experience: comprehensiveProfile.years_of_experience,
                education_count: education.length,
                experience_count: experience.length,
                current_goal: user.career_goal_short
            },

            // Last updated
            generated_at: new Date().toISOString()
        };

        res.json(response);

    } catch (err) {
        console.error("Dashboard error:", err);
        res.status(500).json({ error: "Failed to generate career dashboard" });
    }
});

/**
 * Helper: Calculate profile completeness
 */
function calculateProfileCompleteness(user, skills, education, experience, preferences, resumeInfo, peerMeetingsCount = 0) {
    const breakdown = {
        basic_info: 0,
        skills: 0,
        education: 0,
        experience: 0,
        preferences: 0,
        resume: 0,
        peer_learning: 0
    };

    // Basic info (name, email, phone, location, career goal) - max 15 points
    if (user.name) breakdown.basic_info += 3;
    if (user.email) breakdown.basic_info += 3;
    if (user.phone) breakdown.basic_info += 3;
    if (user.location) breakdown.basic_info += 3;
    if (user.career_goal_short) breakdown.basic_info += 3;

    // Skills - max 15 points
    if (skills.length >= 1) breakdown.skills += 5;
    if (skills.length >= 3) breakdown.skills += 5;
    if (skills.length >= 5) breakdown.skills += 5;

    // Education - max 10 points
    if (education.length >= 1) breakdown.education += 10;

    // Experience - max 20 points
    if (experience.length >= 1) breakdown.experience += 10;
    if (experience.length >= 2) breakdown.experience += 5;
    if (experience.length >= 3) breakdown.experience += 5;

    // Preferences/Interests - max 10 points
    if (preferences.interests && preferences.interests.length > 0) breakdown.preferences += 5;
    if (preferences.preferred_roles && preferences.preferred_roles.length > 0) breakdown.preferences += 5;

    // Resume - max 15 points
    if (resumeInfo) {
        breakdown.resume += 10;
        if (resumeInfo.ats_score && resumeInfo.ats_score >= 70) breakdown.resume += 5;
    }

    // Peer Learning - max 15 points
    if (peerMeetingsCount >= 1) breakdown.peer_learning += 10;
    if (peerMeetingsCount >= 3) breakdown.peer_learning += 5;

    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
    const percentage = Math.min(100, total);

    return {
        percentage,
        breakdown,
        max_possible: 100
    };
}

/**
 * @route GET /api/recommendations/trending
 * @desc Get just the trending roles and fast-growing industries (lighter endpoint)
 * @access Private
 */
router.get("/trending", authenticateToken, async (req, res) => {
    try {
        // For a lighter response, return cached/static trending data
        // In production, this could be fetched from an external job market API
        const trendingData = {
            trending_roles_2026: [
                {
                    title: "AI/ML Engineer",
                    demand_level: "Very High",
                    growth_rate: "+45%",
                    why_trending: "Explosion of AI applications across all industries"
                },
                {
                    title: "Cloud Solutions Architect",
                    demand_level: "Very High",
                    growth_rate: "+38%",
                    why_trending: "Continued cloud migration and multi-cloud strategies"
                },
                {
                    title: "Cybersecurity Engineer",
                    demand_level: "Very High",
                    growth_rate: "+35%",
                    why_trending: "Rising cyber threats and compliance requirements"
                },
                {
                    title: "Data Engineer",
                    demand_level: "High",
                    growth_rate: "+32%",
                    why_trending: "Data-driven decision making becoming critical"
                },
                {
                    title: "DevOps/Platform Engineer",
                    demand_level: "High",
                    growth_rate: "+28%",
                    why_trending: "Automation and infrastructure-as-code adoption"
                }
            ],
            fast_growing_industries: [
                {
                    industry: "Artificial Intelligence",
                    growth_rate: "+45%",
                    key_roles: ["ML Engineer", "AI Researcher", "Prompt Engineer", "MLOps Engineer"]
                },
                {
                    industry: "Cybersecurity",
                    growth_rate: "+35%",
                    key_roles: ["Security Engineer", "Penetration Tester", "SOC Analyst", "Security Architect"]
                },
                {
                    industry: "Green Technology",
                    growth_rate: "+30%",
                    key_roles: ["Sustainability Analyst", "Clean Energy Engineer", "ESG Consultant"]
                },
                {
                    industry: "HealthTech",
                    growth_rate: "+28%",
                    key_roles: ["Health Data Scientist", "Biotech Engineer", "Digital Health Product Manager"]
                }
            ],
            last_updated: new Date().toISOString(),
            source: "Market Analysis 2025-2026"
        };

        res.json(trendingData);

    } catch (err) {
        console.error("Trending data error:", err);
        res.status(500).json({ error: "Failed to fetch trending data" });
    }
});

module.exports = router;
