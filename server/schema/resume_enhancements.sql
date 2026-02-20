-- ================================
-- RESUME ENHANCEMENTS (SIMPLIFIED)
-- Only adds columns to users table
-- Run this after user_schema.sql
-- ================================

-- Add additional fields to users table for resume data
ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS professional_title TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS years_of_experience INT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS professional_summary TEXT;

-- ================================
-- NOTE: Old tables removed
-- ================================
-- The following tables are NO LONGER USED:
--   - projects
--   - career_insights
--   - resume_analysis
--   - career_recommendations
--   - skill_development_plan
--   - resume_metadata
--
-- All resume data is now stored in: resume_info (see resume_info.sql)
-- 
-- Run the DROP commands below to clean up old tables:
-- (See drop_old_resume_tables.sql)
