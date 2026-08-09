const express = require("express");
const router = express.Router();
const pool = require("../config/dbConfig");
const { authenticateToken } = require("../middleware/auth");
const multer = require("multer");
const pdf = require("pdf-parse");
const resumeService = require("./resumeParser");

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed."));
        }
    },
});

/**
 * Extract text from PDF buffer
 */
async function extractTextFromPDF(buffer) {
    try {
        const data = await pdf(buffer);
        return data.text;
    } catch (error) {
        console.error("PDF extraction error:", error);
        throw new Error("Failed to extract text from PDF");
    }
}

/**
 * Extract text from uploaded file
 */
async function extractTextFromFile(file) {
    if (file.mimetype === "application/pdf") {
        return await extractTextFromPDF(file.buffer);
    } else if (file.mimetype === "text/plain") {
        return file.buffer.toString("utf-8");
    } else {
        throw new Error("File type not yet supported for text extraction");
    }
}

/**
 * @route POST /api/resume/upload
 * @desc Upload and parse resume - FAST version (stores in resume_info table)
 * @access Private
 */
router.post("/upload", authenticateToken, upload.single("resume"), async (req, res) => {
    const userId = req.user.id;
    const resumeFile = req.file;

    if (!resumeFile) {
        return res.status(400).json({ error: "No resume file uploaded" });
    }

    try {
        // Extract text from the uploaded file
        console.log("Extracting text from resume...");
        const resumeText = await extractTextFromFile(resumeFile);

        if (!resumeText || resumeText.trim().length < 100) {
            return res.status(400).json({ error: "Resume content is too short or could not be extracted" });
        }

        // Parse resume using AI (FAST - basic extraction only)
        console.log("Parsing resume with AI (basic mode)...");
        const startTime = Date.now();
        const parsedData = await resumeService.parseResumeBasic(resumeText);
        console.log(`AI parsing completed in ${Date.now() - startTime}ms`);

        // Also generate AI insights (ATS score, completeness, strengths, improvement areas)
        // This runs once during upload and gets cached
        console.log("Generating AI insights (one-time analysis)...");
        const analysisStartTime = Date.now();
        const analysis = await resumeService.analyzeResume(resumeText);
        console.log(`AI analysis completed in ${Date.now() - analysisStartTime}ms`);

        // Prepare data for database
        const technicalSkills = Array.isArray(parsedData.technical_skills)
            ? parsedData.technical_skills.filter(s => typeof s === 'string')
            : [];
        const softSkills = Array.isArray(parsedData.soft_skills)
            ? parsedData.soft_skills.filter(s => typeof s === 'string')
            : [];
        const certifications = Array.isArray(parsedData.certifications)
            ? parsedData.certifications.filter(c => typeof c === 'string')
            : [];

        // Prepare analysis data
        const completenessScore = Math.min(100, Math.max(0, analysis.completeness_score || 50));
        const atsScore = Math.min(100, Math.max(0, analysis.ats_compatibility_score || 50));
        const strengths = Array.isArray(analysis.strengths) ? analysis.strengths : [];
        const improvementAreas = Array.isArray(analysis.improvement_areas) ? analysis.improvement_areas : [];
        const missingElements = Array.isArray(analysis.missing_elements) ? analysis.missing_elements : [];

        // Single upsert to resume_info table (now includes AI insights)
        await pool.query(
            `INSERT INTO resume_info (
                user_id, resume_source, parsed_successfully, resume_text,
                extracted_name, extracted_email, extracted_phone, extracted_location,
                linkedin_url, portfolio_url, professional_title, years_of_experience,
                professional_summary, technical_skills, soft_skills,
                education, experience, projects, certifications,
                completeness_score, ats_score, strengths, improvement_areas, missing_elements,
                uploaded_at
            ) VALUES (
                $1, $2, true, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 
                $13::text[], $14::text[], $15::jsonb, $16::jsonb, $17::jsonb, $18::text[],
                $19, $20, $21::text[], $22::text[], $23::text[], now()
            )
            ON CONFLICT (user_id) DO UPDATE SET
                resume_source = EXCLUDED.resume_source,
                parsed_successfully = true,
                resume_text = EXCLUDED.resume_text,
                extracted_name = EXCLUDED.extracted_name,
                extracted_email = EXCLUDED.extracted_email,
                extracted_phone = EXCLUDED.extracted_phone,
                extracted_location = EXCLUDED.extracted_location,
                linkedin_url = EXCLUDED.linkedin_url,
                portfolio_url = EXCLUDED.portfolio_url,
                professional_title = EXCLUDED.professional_title,
                years_of_experience = EXCLUDED.years_of_experience,
                professional_summary = EXCLUDED.professional_summary,
                technical_skills = EXCLUDED.technical_skills,
                soft_skills = EXCLUDED.soft_skills,
                education = EXCLUDED.education,
                experience = EXCLUDED.experience,
                projects = EXCLUDED.projects,
                certifications = EXCLUDED.certifications,
                completeness_score = EXCLUDED.completeness_score,
                ats_score = EXCLUDED.ats_score,
                strengths = EXCLUDED.strengths,
                improvement_areas = EXCLUDED.improvement_areas,
                missing_elements = EXCLUDED.missing_elements,
                uploaded_at = now(),
                updated_at = now()`,
            [
                userId,
                resumeFile.originalname,
                resumeText.substring(0, 50000), // Store first 50k chars
                parsedData.name || null,
                parsedData.email || null,
                parsedData.phone || null,
                parsedData.location || null,
                parsedData.linkedin_url || null,
                parsedData.portfolio_url || null,
                parsedData.title || null,
                typeof parsedData.years_of_experience === 'number' ? parsedData.years_of_experience : null,
                parsedData.summary || null,
                technicalSkills,
                softSkills,
                JSON.stringify(parsedData.education || []),
                JSON.stringify(parsedData.experience || []),
                JSON.stringify(parsedData.projects || []),
                certifications,
                completenessScore,
                atsScore,
                strengths,
                improvementAreas,
                missingElements
            ]
        );

        // Also update the users table with key info
        await pool.query(
            `UPDATE users SET 
             name = COALESCE($1, name),
             phone = COALESCE($2, phone),
             location = COALESCE($3, location),
             onboarding_completed = true,
             onboarding_step = 4,
             updated_at = now()
             WHERE id = $4`,
            [
                parsedData.name || null,
                parsedData.phone || null,
                parsedData.location || null,
                userId
            ]
        );

        res.json({
            message: "Resume uploaded and parsed successfully",
            data: {
                name: parsedData.name,
                title: parsedData.title,
                years_of_experience: parsedData.years_of_experience,
                technical_skills_count: technicalSkills.length,
                soft_skills_count: softSkills.length,
                education_count: (parsedData.education || []).length,
                experience_count: (parsedData.experience || []).length,
                // AI Insights (cached during upload)
                completeness_score: completenessScore,
                ats_score: atsScore,
                strengths_count: strengths.length,
                improvement_areas_count: improvementAreas.length
            },
            endpoints: {
                get_resume: "/api/resume/info",
                get_analysis: "/api/resume/analyze",
                get_recommendations: "/api/resume/recommendations",
                get_career_insights: "/api/resume/career-insights"
            }
        });

    } catch (error) {
        console.error("Resume parsing error:", error);

        // Store failed attempt
        try {
            await pool.query(
                `INSERT INTO resume_info (user_id, resume_source, parsed_successfully, uploaded_at)
                 VALUES ($1, $2, false, now())
                 ON CONFLICT (user_id) DO UPDATE SET
                 resume_source = EXCLUDED.resume_source,
                 parsed_successfully = false,
                 uploaded_at = now()`,
                [userId, resumeFile.originalname]
            );
        } catch (dbError) {
            console.error("Failed to log upload failure:", dbError);
        }

        res.status(500).json({
            error: "Failed to parse resume",
            details: error.message
        });
    }
});

/**
 * @route GET /api/resume/info
 * @desc Get stored resume info
 * @access Private
 */
router.get("/info", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                extracted_name, extracted_email, extracted_phone, extracted_location,
                linkedin_url, portfolio_url, professional_title, years_of_experience,
                professional_summary, technical_skills, soft_skills,
                education, experience, projects, certifications,
                completeness_score, ats_score, strengths, improvement_areas,
                career_insights,
                uploaded_at, updated_at
             FROM resume_info WHERE user_id = $1`,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No resume found. Please upload a resume first." });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching resume info:", error);
        res.status(500).json({ error: "Failed to fetch resume info" });
    }
});

/**
 * @route GET /api/resume/analyze
 * @desc Analyze resume for ATS score and completeness (ON-DEMAND)
 * @access Private
 */
router.get("/analyze", authenticateToken, async (req, res) => {
    try {
        // Get stored resume text
        const resumeResult = await pool.query(
            `SELECT resume_text, completeness_score, ats_score, updated_at 
             FROM resume_info WHERE user_id = $1`,
            [req.user.id]
        );

        if (resumeResult.rows.length === 0 || !resumeResult.rows[0].resume_text) {
            return res.status(404).json({ error: "No resume found. Please upload a resume first." });
        }

        const resumeData = resumeResult.rows[0];

        // Check if we already have recent analysis (within 24 hours)
        const hasRecentAnalysis = resumeData.completeness_score !== null &&
            resumeData.ats_score !== null &&
            resumeData.updated_at &&
            (Date.now() - new Date(resumeData.updated_at).getTime()) < 24 * 60 * 60 * 1000;

        if (hasRecentAnalysis && !req.query.force) {
            // Return cached analysis
            const cached = await pool.query(
                `SELECT completeness_score, ats_score, strengths, improvement_areas, missing_elements
                 FROM resume_info WHERE user_id = $1`,
                [req.user.id]
            );
            return res.json({
                ...cached.rows[0],
                cached: true,
                message: "Add ?force=true to regenerate analysis"
            });
        }

        // Generate fresh analysis
        console.log("Generating resume analysis...");
        const analysis = await resumeService.analyzeResume(resumeData.resume_text);

        // Store the analysis
        await pool.query(
            `UPDATE resume_info SET
             completeness_score = $2,
             ats_score = $3,
             strengths = $4::text[],
             improvement_areas = $5::text[],
             missing_elements = $6::text[],
             updated_at = now()
             WHERE user_id = $1`,
            [
                req.user.id,
                Math.min(100, Math.max(0, analysis.completeness_score || 0)),
                Math.min(100, Math.max(0, analysis.ats_compatibility_score || 0)),
                Array.isArray(analysis.strengths) ? analysis.strengths : [],
                Array.isArray(analysis.improvement_areas) ? analysis.improvement_areas : [],
                Array.isArray(analysis.missing_elements) ? analysis.missing_elements : []
            ]
        );

        res.json({
            completeness_score: analysis.completeness_score,
            ats_score: analysis.ats_compatibility_score,
            strengths: analysis.strengths,
            improvement_areas: analysis.improvement_areas,
            missing_elements: analysis.missing_elements,
            cached: false
        });
    } catch (error) {
        console.error("Error analyzing resume:", error);
        res.status(500).json({ error: "Failed to analyze resume", details: error.message });
    }
});

/**
 * @route GET /api/resume/recommendations
 * @desc Generate career recommendations (ON-DEMAND)
 * @access Private
 */
router.get("/recommendations", authenticateToken, async (req, res) => {
    try {
        // Get stored resume info
        const resumeResult = await pool.query(
            `SELECT professional_title, years_of_experience, technical_skills, experience
             FROM resume_info WHERE user_id = $1`,
            [req.user.id]
        );

        if (resumeResult.rows.length === 0) {
            return res.status(404).json({ error: "No resume found. Please upload a resume first." });
        }

        const profile = resumeResult.rows[0];

        // Generate recommendations on-the-fly
        console.log("Generating career recommendations...");
        const recommendations = await resumeService.generateCareerRecommendations({
            title: profile.professional_title,
            years_of_experience: profile.years_of_experience,
            skills: profile.technical_skills || [],
            experience: profile.experience || []
        });

        res.json({
            recommended_roles: recommendations.recommended_roles || [],
            skill_development_plan: recommendations.skill_development_plan || [],
            generated_at: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error generating recommendations:", error);
        res.status(500).json({ error: "Failed to generate recommendations", details: error.message });
    }
});

/**
 * @route GET /api/resume/career-insights
 * @desc Get career insights (ON-DEMAND with caching)
 * @access Private
 */
router.get("/career-insights", authenticateToken, async (req, res) => {
    try {
        // Get stored info
        const resumeResult = await pool.query(
            `SELECT professional_title, years_of_experience, technical_skills, experience, career_insights
             FROM resume_info WHERE user_id = $1`,
            [req.user.id]
        );

        if (resumeResult.rows.length === 0) {
            return res.status(404).json({ error: "No resume found. Please upload a resume first." });
        }

        const profile = resumeResult.rows[0];

        // Return cached if available and not forcing refresh
        if (profile.career_insights && !req.query.force) {
            return res.json({
                ...profile.career_insights,
                cached: true,
                message: "Add ?force=true to regenerate insights"
            });
        }

        // Generate fresh insights
        console.log("Generating career insights...");
        const insights = await resumeService.getCareerInsights({
            title: profile.professional_title,
            years_of_experience: profile.years_of_experience,
            skills: profile.technical_skills || [],
            experience: profile.experience || []
        });

        // Cache the insights
        await pool.query(
            `UPDATE resume_info SET career_insights = $2::jsonb, updated_at = now() WHERE user_id = $1`,
            [req.user.id, JSON.stringify(insights)]
        );

        res.json({
            ...insights,
            cached: false
        });
    } catch (error) {
        console.error("Error getting career insights:", error);
        res.status(500).json({ error: "Failed to get career insights", details: error.message });
    }
});

/**
 * @route DELETE /api/resume
 * @desc Delete stored resume
 * @access Private
 */
router.delete("/", authenticateToken, async (req, res) => {
    try {
        await pool.query("DELETE FROM resume_info WHERE user_id = $1", [req.user.id]);
        res.json({ message: "Resume deleted successfully" });
    } catch (error) {
        console.error("Error deleting resume:", error);
        res.status(500).json({ error: "Failed to delete resume" });
    }
});

/**
 * @route POST /api/resume/match-analysis
 * @desc Analyze resume match against a Job Description
 * @returns match_percentage, matched_skills, missing_skills, improvement_suggestions
 * @access Private
 */
router.post("/match-analysis", authenticateToken, async (req, res) => {
    // Extend timeout — Gemini AI analysis can take 30-60s
    req.setTimeout(120000);
    res.setTimeout(120000);

    const { jobDescription } = req.body;

    if (!jobDescription || jobDescription.trim().length < 20) {
        return res.status(400).json({ error: "A valid Job Description is required (at least 20 characters)" });
    }

    try {
        // Get stored resume text
        const resumeResult = await pool.query(
            "SELECT resume_text FROM resume_info WHERE user_id = $1",
            [req.user.id]
        );

        if (resumeResult.rows.length === 0 || !resumeResult.rows[0].resume_text) {
            return res.status(404).json({ error: "No resume found. Please upload a resume first." });
        }

        const resumeText = resumeResult.rows[0].resume_text;

        console.log("Performing resume-JD match analysis...");
        const startTime = Date.now();
        const analysis = await resumeService.matchAnalysis(resumeText, jobDescription);
        console.log(`Match analysis completed in ${Date.now() - startTime}ms`);

        res.json({
            ...analysis,
            analyzed_at: new Date().toISOString()
        });

    } catch (error) {
        console.error("Error in match analysis:", error);
        res.status(500).json({ error: "Failed to perform match analysis", details: error.message });
    }
});

/**
 * @route POST /api/resume/tailor
 * @desc Tailor resume based on Job Description
 * @access Private
 */
router.post("/tailor", authenticateToken, async (req, res) => {
    const { jobDescription } = req.body;

    if (!jobDescription) {
        return res.status(400).json({ error: "Job Description is required" });
    }

    try {
        // Get stored resume text
        const resumeResult = await pool.query(
            "SELECT resume_text FROM resume_info WHERE user_id = $1",
            [req.user.id]
        );

        if (resumeResult.rows.length === 0 || !resumeResult.rows[0].resume_text) {
            return res.status(404).json({ error: "No resume found. Please upload a resume first." });
        }

        const resumeText = resumeResult.rows[0].resume_text;

        console.log("Tailoring resume...");
        const tailoredResult = await resumeService.tailorResume(resumeText, jobDescription);

        res.json(tailoredResult);

    } catch (error) {
        console.error("Error tailoring resume:", error);
        res.status(500).json({ error: "Failed to tailor resume", details: error.message });
    }
});

/**
 * @route POST /api/resume/update
 * @desc Update resume data based on instruction
 * @access Private
 */
router.post("/update", authenticateToken, async (req, res) => {
    const { currentData, instruction } = req.body;

    if (!instruction) {
        return res.status(400).json({ error: "Instruction is required" });
    }

    try {
        console.log("Updating resume based on instruction...");
        const updatedData = await resumeService.updateResume(currentData, instruction);
        res.json(updatedData);
    } catch (error) {
        console.error("Error updating resume:", error);
        res.status(500).json({ error: "Failed to update resume", details: error.message });
    }
});

/**
 * @route POST /api/resume/generate-latex
 * @desc Generate LaTeX code for resume
 * @access Private
 */
router.post("/generate-latex", authenticateToken, async (req, res) => {
    const { data, template } = req.body;

    if (!data) {
        return res.status(400).json({ error: "Resume data is required" });
    }

    try {
        console.log(`Generating LaTeX for template: ${template}...`);
        const latexCode = await resumeService.generateLaTeX(data, template);
        res.json({ latex_code: latexCode });
    } catch (error) {
        console.error("Error generating LaTeX:", error);
        res.status(500).json({ error: "Failed to generate LaTeX", details: error.message });
    }
});

/**
 * @route POST /api/resume/chat-insights
 * @desc Chat with AI about market insights
 * @access Private
 */
router.post("/chat-insights", authenticateToken, async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ error: "Query is required" });
        }

        // 1. Fetch User Context
        const userResult = await pool.query(
            `SELECT professional_title, years_of_experience, technical_skills, career_insights 
             FROM resume_info WHERE user_id = $1`,
            [req.user.id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "Resume data not found" });
        }

        const profile = userResult.rows[0];

        // Fallback market data if database is empty
        const fallbackTrendingRoles = [
            { title: "AI/ML Engineer", demand_level: "Very High", why_trending: "Massive enterprise AI adoption" },
            { title: "Full-Stack Developer", demand_level: "High", why_trending: "Digital transformation across industries" },
            { title: "DevOps Engineer", demand_level: "High", why_trending: "Cloud migration and automation needs" },
            { title: "Data Engineer", demand_level: "High", why_trending: "Big data infrastructure demand" },
            { title: "Cloud Architect", demand_level: "Very High", why_trending: "Multi-cloud strategy adoption" }
        ];

        const fallbackIndustries = [
            { industry: "Technology/SaaS", growth_rate: "25%", fit_for_profile: "High" },
            { industry: "FinTech", growth_rate: "20%", fit_for_profile: "High" },
            { industry: "HealthTech", growth_rate: "18%", fit_for_profile: "Medium" },
            { industry: "E-commerce", growth_rate: "15%", fit_for_profile: "Medium" }
        ];

        // Prepare Context Object - use fallback if DB is empty
        const trendingRoles = profile.career_insights?.career_dashboard?.trending_roles_2026;
        const industries = profile.career_insights?.career_dashboard?.fast_growing_industries;

        const context = {
            title: profile.professional_title || "Software Developer",
            years_of_experience: profile.years_of_experience || 0,
            skills: profile.technical_skills || [],
            trending_roles: (trendingRoles && trendingRoles.length > 0) ? trendingRoles : fallbackTrendingRoles,
            fast_growing_industries: (industries && industries.length > 0) ? industries : fallbackIndustries,
            analysis_summary: profile.career_insights?.career_dashboard?.profile_summary || {},
            data_source: (trendingRoles && trendingRoles.length > 0) ? "database" : "fallback_2025"
        };

        // 3. Get AI Response
        const response = await resumeService.chatWithData(query, context);

        res.json({ response });

    } catch (error) {
        console.error("Chat insights error:", error);
        res.status(500).json({ error: "Failed to process chat request" });
    }
});

module.exports = router;