const express = require("express");
const router = express.Router();
const axios = require("axios");
const { authenticateToken } = require("../middleware/auth");

// Mock data for fallback
const mockJobs = [
    {
        id: "1",
        title: "Senior Software Engineer - AI/ML",
        company: "TechCorp",
        location: "San Francisco, CA",
        salary: "$180K - $220K",
        match: 94,
        posted: "2 hours ago",
        type: "new",
        description: "Looking for an experienced engineer to build AI-powered features for our core platform using Python and TensorFlow.",
        url: "https://www.linkedin.com/jobs/view/123456789"
    },
    {
        id: "2",
        title: "Full-Stack Developer",
        company: "StartupXYZ",
        location: "New York, NY",
        salary: "$140K - $170K",
        match: 87,
        posted: "5 hours ago",
        type: "recommended",
        description: "Join our fast-growing team to build the next generation platform using React, Node.js, and PostgreSQL.",
        url: "https://www.linkedin.com/jobs/view/987654321"
    },
    {
        id: "3",
        title: "Tech Lead - Infrastructure",
        company: "CloudScale",
        location: "Remote",
        salary: "$200K - $250K",
        match: 91,
        posted: "1 day ago",
        type: "updated",
        description: "Lead infrastructure initiatives for our cloud-native platform. Kubernetes and AWS experience required.",
        url: "https://www.linkedin.com/jobs/view/456789123"
    },
    {
        id: "4",
        title: "Product Manager - Developer Tools",
        company: "DevTools Inc",
        location: "Seattle, WA",
        salary: "$150K - $190K",
        match: 82,
        posted: "2 days ago",
        type: "recommended",
        description: "Shape the future of developer experience with cutting-edge tools. Technical background preferred.",
        url: "https://www.linkedin.com/jobs/view/789123456"
    },
    {
        id: "5",
        title: "Data Scientist",
        company: "DataMinds",
        location: "Boston, MA",
        salary: "$160K - $190K",
        match: 89,
        posted: "3 days ago",
        type: "new",
        description: "Analyze large datasets to derive actionable insights and build predictive models.",
        url: "https://www.linkedin.com/jobs/view/321654987"
    }
];

// POST /api/jobs/linkedin - Fetch jobs based on user profile
router.post("/linkedin", authenticateToken, async (req, res) => {
    try {
        // Debug logging
        console.log("POST /api/jobs/linkedin hit");
        console.log("User from auth middleware:", req.user ? `ID: ${req.user.id}` : "No user");

        if (!req.user) {
            return res.status(401).json({ error: "User context missing" });
        }

        const { career_goal_short, location } = req.user;
        console.log(`Searching for: ${career_goal_short} in ${location}`);

        // Check for API key
        const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || 'dcbbcd4b71msh4678aa2113ea60cp1820aajsndf18bdd64b5c';
        const RAPIDAPI_HOST = 'linkedin-job-search-api.p.rapidapi.com';

        console.log(`API Key present: ${!!RAPIDAPI_KEY}`);
        console.log(`API Host: ${RAPIDAPI_HOST}`);

        if (RAPIDAPI_KEY) {
            // Clean up title - remove hyphens and ensure proper formatting
            const cleanTitle = (career_goal_short || 'Software Engineer').replace(/-/g, ' ');
            const cleanLocation = location || 'United States';

            const options = {
                method: 'GET',
                url: `https://${RAPIDAPI_HOST}/active-jb-24h`,
                params: {
                    title_filter: `"${cleanTitle}"`,
                    location_filter: `"${cleanLocation}"`,
                    limit: '10',
                    offset: '0',
                    description_type: 'text'
                },
                headers: {
                    'x-rapidapi-key': RAPIDAPI_KEY,
                    'x-rapidapi-host': RAPIDAPI_HOST
                }
            };

            try {
                console.log("Sending request to RapidAPI with options:", JSON.stringify(options, (key, value) => {
                    if (key === 'x-rapidapi-key') return 'HIDDEN';
                    return value;
                }, 2));

                let response = await axios.request(options);

                console.log("RapidAPI Response Status:", response.status);
                console.log("RapidAPI Response Data Type:", typeof response.data);
                console.log("RapidAPI Full Response (first 500 chars):", JSON.stringify(response.data).substring(0, 500));

                // The API can return: array directly, {data: array}, {jobs: array}, or {results: array}
                let rawJobs = [];
                if (Array.isArray(response.data)) {
                    rawJobs = response.data;
                } else if (response.data && typeof response.data === 'object') {
                    rawJobs = response.data.data || response.data.jobs || response.data.results || [];
                }

                console.log(`Raw jobs found from active-jb-24h: ${Array.isArray(rawJobs) ? rawJobs.length : 'Not an array'}`);

                // If no jobs found, try a broader search with just the country
                if (rawJobs.length === 0) {
                    console.log("No jobs found in 24h, trying search-jobs endpoint with broader location...");

                    // Try with a broader location (just country name)
                    const broaderLocation = cleanLocation.split(',')[cleanLocation.split(',').length - 1].trim() || 'India';

                    const searchOptions = {
                        method: 'GET',
                        url: `https://${RAPIDAPI_HOST}/search-jobs`,
                        params: {
                            keywords: cleanTitle,
                            location_id: '102713980', // India location ID on LinkedIn
                            date_posted: 'past-week',
                            limit: '20'
                        },
                        headers: {
                            'x-rapidapi-key': RAPIDAPI_KEY,
                            'x-rapidapi-host': RAPIDAPI_HOST
                        }
                    };

                    try {
                        console.log("Trying search-jobs endpoint...");
                        response = await axios.request(searchOptions);

                        if (Array.isArray(response.data)) {
                            rawJobs = response.data;
                        } else if (response.data && typeof response.data === 'object') {
                            rawJobs = response.data.data || response.data.jobs || response.data.results || [];
                        }

                        console.log(`Raw jobs found from search-jobs: ${Array.isArray(rawJobs) ? rawJobs.length : 'Not an array'}`);
                    } catch (searchError) {
                        console.log("search-jobs endpoint failed:", searchError.message);
                    }
                }

                // Log the first job to see its actual structure
                if (rawJobs.length > 0) {
                    console.log("Sample job object structure:", JSON.stringify(rawJobs[0], null, 2));
                }

                const jobs = Array.isArray(rawJobs) ? rawJobs.map(job => {
                    // Handle various API response formats for company name
                    let companyName = "Unknown Company";
                    if (job.company_name) companyName = job.company_name;
                    else if (job.companyName) companyName = job.companyName;
                    else if (job.company?.name) companyName = job.company.name;
                    else if (typeof job.company === 'string') companyName = job.company;
                    else if (job.organization) companyName = job.organization;
                    else if (job.employer) companyName = job.employer;

                    // Handle various location formats
                    let jobLocation = "Remote";
                    if (job.location) jobLocation = typeof job.location === 'string' ? job.location : (job.location.city || job.location.name || "Remote");
                    else if (job.job_location) jobLocation = job.job_location;
                    else if (job.jobLocation) jobLocation = job.jobLocation;
                    else if (job.formattedLocation) jobLocation = job.formattedLocation;

                    // Handle various URL formats
                    let jobUrl = "#";
                    if (job.url) jobUrl = job.url;
                    else if (job.job_url) jobUrl = job.job_url;
                    else if (job.linkedinJobUrl) jobUrl = job.linkedinJobUrl;
                    else if (job.linkedin_url) jobUrl = job.linkedin_url;
                    else if (job.applyUrl) jobUrl = job.applyUrl;
                    else if (job.apply_url) jobUrl = job.apply_url;
                    else if (job.link) jobUrl = job.link;

                    // Handle salary
                    let salary = "See listing";
                    if (job.salary) salary = typeof job.salary === 'string' ? job.salary : (job.salary.text || "See listing");
                    else if (job.compensation) salary = job.compensation;
                    else if (job.salaryText) salary = job.salaryText;

                    // Handle posted date
                    let posted = "Recently";
                    if (job.posted_date) posted = job.posted_date;
                    else if (job.postDate) posted = job.postDate;
                    else if (job.date_posted) posted = job.date_posted;
                    else if (job.postedAt) posted = job.postedAt;
                    else if (job.listedAt) posted = new Date(job.listedAt).toISOString().split('T')[0];

                    // Handle description
                    let description = "Click View on LinkedIn for full details.";
                    if (job.description) {
                        description = typeof job.description === 'string'
                            ? job.description.substring(0, 200) + "..."
                            : "Click View on LinkedIn for full details.";
                    } else if (job.job_description) {
                        description = job.job_description.substring(0, 200) + "...";
                    }

                    return {
                        id: job.id || job.job_id || job.jobId || Math.random().toString(36).substr(2, 9),
                        title: job.title || job.job_title || job.jobTitle || "Untitled Job",
                        company: companyName,
                        location: jobLocation,
                        salary: salary,
                        match: Math.floor(Math.random() * (99 - 70) + 70),
                        posted: posted,
                        type: "new",
                        description: description,
                        url: jobUrl
                    };
                }) : [];

                if (jobs.length === 0) {
                    console.warn("Both API endpoints returned no jobs. Falling back to mock data.");
                    return res.json({ jobs: mockJobs });
                }

                console.log(`Returning ${jobs.length} valid jobs to client`);
                return res.json({ jobs });
            } catch (apiError) {
                console.error("RapidAPI Request Failed.");
                console.error("Error Message:", apiError.message);
                if (apiError.response) {
                    console.error("API Error Status:", apiError.response.status);
                    console.error("API Error Data:", JSON.stringify(apiError.response.data));
                }
                return res.json({ jobs: mockJobs });
            }

        } else {
            console.log("Using mock data (No API key found)");
            return res.json({ jobs: mockJobs });
        }

    } catch (error) {
        console.error("CRITICAL SERVER ERROR in /linkedin:", error);
        res.status(500).json({ error: "Failed to fetch jobs" });
    }
});

// Import pool for database operations
const pool = require("../config/dbConfig");

// POST /api/jobs/applications - Save a job application
router.post("/applications", authenticateToken, async (req, res) => {
    try {
        const { job_id, job_title, company, location, job_url } = req.body;
        const user_id = req.user.id;

        console.log(`Saving job application for user ${user_id}: ${job_title} at ${company}`);

        // Insert the application (or update if already exists)
        const result = await pool.query(
            `INSERT INTO job_applications (user_id, job_id, job_title, company, location, job_url)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (user_id, job_id) 
             DO UPDATE SET 
                applied_at = NOW(),
                updated_at = NOW()
             RETURNING *`,
            [user_id, job_id, job_title, company || 'Unknown Company', location || 'Remote', job_url]
        );

        console.log("Application saved:", result.rows[0]);
        res.status(201).json({
            message: "Application saved successfully",
            data: result.rows[0]
        });
    } catch (error) {
        console.error("Error saving job application:", error);
        res.status(500).json({ error: "Failed to save application" });
    }
});

// GET /api/jobs/applications - Get user's job applications
router.get("/applications", authenticateToken, async (req, res) => {
    try {
        const user_id = req.user.id;

        const result = await pool.query(
            `SELECT id, job_id, job_title, company, location, job_url, applied_at, status, notes
             FROM job_applications 
             WHERE user_id = $1 
             ORDER BY applied_at DESC`,
            [user_id]
        );

        res.json({ applications: result.rows });
    } catch (error) {
        console.error("Error fetching job applications:", error);
        res.status(500).json({ error: "Failed to fetch applications" });
    }
});

// PATCH /api/jobs/applications/:id - Update application status or notes
router.patch("/applications/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        const user_id = req.user.id;

        const result = await pool.query(
            `UPDATE job_applications 
             SET status = COALESCE($1, status),
                 notes = COALESCE($2, notes),
                 updated_at = NOW()
             WHERE id = $3 AND user_id = $4
             RETURNING *`,
            [status, notes, id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Application not found" });
        }

        res.json({ message: "Application updated", data: result.rows[0] });
    } catch (error) {
        console.error("Error updating job application:", error);
        res.status(500).json({ error: "Failed to update application" });
    }
});

module.exports = router;

