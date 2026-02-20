-- ================================
-- DROP OLD RESUME TABLES
-- Run this ONCE to clean up old tables
-- ================================

-- Drop tables that are replaced by resume_info
DROP TABLE IF EXISTS career_recommendations CASCADE;
DROP TABLE IF EXISTS skill_development_plan CASCADE;
DROP TABLE IF EXISTS resume_analysis CASCADE;
DROP TABLE IF EXISTS career_insights CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS resume_metadata CASCADE;

-- Drop old columns from experience table (if they exist)
-- These were added for resume parsing but are now stored in resume_info
ALTER TABLE experience DROP COLUMN IF EXISTS achievements;
ALTER TABLE experience DROP COLUMN IF EXISTS technologies_used;

-- Drop old columns from education table (if they exist)
ALTER TABLE education DROP COLUMN IF EXISTS field_of_study;
ALTER TABLE education DROP COLUMN IF EXISTS gpa;

-- ================================
-- VERIFICATION
-- ================================
-- After running this, you should only have these tables:
--   - users (core user data)
--   - education (basic education records)
--   - experience (basic work history)
--   - skills (user skills with embeddings)
--   - certifications_links (links/certs)
--   - preferences (user preferences)
--   - optional_profile (optional data)
--   - resume_info (NEW - all resume data)
