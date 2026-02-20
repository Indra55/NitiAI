-- ================================
-- RESUME INFO TABLE (CONSOLIDATED)
-- Stores all parsed resume data in one place
-- Run this after user_schema.sql
-- ================================

CREATE TABLE IF NOT EXISTS resume_info (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    
    -- Upload metadata
    resume_source TEXT,                    -- filename
    uploaded_at TIMESTAMP DEFAULT now(),
    parsed_successfully BOOLEAN DEFAULT false,
    
    -- Raw extracted text (for re-parsing later)
    resume_text TEXT,
    
    -- Basic Info (from resume)
    extracted_name TEXT,
    extracted_email TEXT,
    extracted_phone TEXT,
    extracted_location TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    
    -- Professional Summary
    professional_title TEXT,
    years_of_experience INT,
    professional_summary TEXT,
    
    -- Skills (stored as arrays - fast to query)
    technical_skills TEXT[],
    soft_skills TEXT[],
    
    -- Education (stored as JSONB array for flexibility)
    education JSONB DEFAULT '[]'::jsonb,
    -- Format: [{"degree": "", "institution": "", "field": "", "year": ""}]
    
    -- Experience (stored as JSONB array)
    experience JSONB DEFAULT '[]'::jsonb,
    -- Format: [{"title": "", "company": "", "start": "", "end": "", "description": ""}]
    
    -- Projects (stored as JSONB array)
    projects JSONB DEFAULT '[]'::jsonb,
    -- Format: [{"name": "", "description": "", "technologies": [], "url": ""}]
    
    -- Certifications
    certifications TEXT[],
    
    -- Resume Quality Scores (from AI analysis)
    completeness_score INT CHECK (completeness_score BETWEEN 0 AND 100),
    ats_score INT CHECK (ats_score BETWEEN 0 AND 100),
    
    -- AI Analysis (stored as JSONB for flexibility)
    strengths TEXT[],
    improvement_areas TEXT[],
    missing_elements TEXT[],
    
    -- Career Insights (generated on-demand, cached here)
    career_insights JSONB,
    -- Format: {"role_level": "", "industries": [], "trajectory": "", "recommended_paths": []}
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_resume_info_user_id ON resume_info(user_id);

-- ================================
-- HELPER: Update timestamp trigger
-- ================================

CREATE OR REPLACE FUNCTION update_resume_info_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_resume_info_timestamp ON resume_info;
CREATE TRIGGER trigger_update_resume_info_timestamp
    BEFORE UPDATE ON resume_info
    FOR EACH ROW
    EXECUTE FUNCTION update_resume_info_timestamp();
