require('dotenv').config({path: './.env'});
const pool = require('../config/dbConfig');

async function migrate() {
    try {
        console.log("Adding template_layouts column to resume_info table...");
        await pool.query(`
            ALTER TABLE resume_info 
            ADD COLUMN IF NOT EXISTS template_layouts JSONB DEFAULT '{
                "modern": {
                    "left_column": ["summary", "experience", "projects"],
                    "right_column": ["education", "skills", "soft_skills", "certifications"]
                },
                "classic": {
                    "section_order": ["summary", "experience", "projects", "education", "skills", "soft_skills", "certifications"]
                },
                "minimal": {
                    "top_section": ["summary", "experience", "projects"],
                    "bottom_grid": ["education", "skills", "soft_skills", "certifications"]
                }
            }'::jsonb;
        `);
        console.log("Migration successful!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        pool.end();
    }
}

migrate();
