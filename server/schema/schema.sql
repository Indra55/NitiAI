-- =============================================================
-- SkillSphere — Consolidated Database Schema
-- =============================================================
-- Run this ONCE on a fresh database to create all tables.
-- Requires: PostgreSQL 14+ with pgvector extension installed.
-- =============================================================

-- ================================
-- EXTENSIONS
-- ================================

CREATE EXTENSION IF NOT EXISTS vector;      -- pgvector for embeddings
CREATE EXTENSION IF NOT EXISTS pgcrypto;    -- gen_random_uuid()

-- ================================
-- 1. USERS (CORE)
-- ================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    username            TEXT NOT NULL,
    name                TEXT,
    age                 INT,
    email               TEXT UNIQUE NOT NULL,
    password            TEXT NOT NULL,
    phone               TEXT,
    location            TEXT,

    proficiency_level   TEXT CHECK (proficiency_level IN ('beginner','intermediate','advanced')),
    preferred_work_mode TEXT CHECK (preferred_work_mode IN ('remote','onsite','hybrid')),
    availability_timeline TEXT,

    career_goal_short   TEXT,
    career_goal_long    TEXT,

    -- Resume-related fields (previously in resume_enhancements ALTER statements)
    linkedin_url        TEXT,
    portfolio_url       TEXT,
    photo_url           TEXT,
    professional_title  TEXT,
    years_of_experience INT,
    professional_summary TEXT,

    onboarding_completed BOOLEAN DEFAULT false,
    onboarding_step      INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- ================================
-- 2. EDUCATION
-- ================================

CREATE TABLE IF NOT EXISTS education (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    degree          TEXT,
    major           TEXT,
    institution     TEXT,
    graduation_year INT
);

-- ================================
-- 3. EXPERIENCE
-- ================================

CREATE TABLE IF NOT EXISTS experience (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    title        TEXT,
    organization TEXT,
    description  TEXT,
    start_date   DATE,
    end_date     DATE
);

-- ================================
-- 4. SKILLS (VECTOR-READY)
-- ================================

CREATE TABLE IF NOT EXISTS skills (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    skill_name  TEXT NOT NULL,
    skill_type  TEXT CHECK (skill_type IN ('technical','soft')),
    proficiency INT CHECK (proficiency BETWEEN 1 AND 5),

    embedding   vector(768)
);

-- ================================
-- 5. CERTIFICATIONS & LINKS
-- ================================

CREATE TABLE IF NOT EXISTS certifications_links (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    label TEXT,
    url   TEXT
);

-- ================================
-- 6. PREFERENCES
-- ================================

CREATE TABLE IF NOT EXISTS preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

    interests            TEXT[],
    preferred_roles      TEXT[],
    industry_preferences TEXT[]
);

-- ================================
-- 7. OPTIONAL PROFILE
-- ================================

CREATE TABLE IF NOT EXISTS optional_profile (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

    gender                TEXT,
    expected_salary       INT,
    work_style_preference TEXT
);

-- ================================
-- 8. RESUME INFO (CONSOLIDATED)
-- ================================

CREATE TABLE IF NOT EXISTS resume_info (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

    -- Upload metadata
    resume_source       TEXT,                    -- filename
    uploaded_at         TIMESTAMP DEFAULT now(),
    parsed_successfully BOOLEAN DEFAULT false,

    -- Raw extracted text (for re-parsing later)
    resume_text TEXT,

    -- Basic info (from resume)
    extracted_name     TEXT,
    extracted_email    TEXT,
    extracted_phone    TEXT,
    extracted_location TEXT,
    linkedin_url       TEXT,
    portfolio_url      TEXT,

    -- Professional summary
    professional_title    TEXT,
    years_of_experience   INT,
    professional_summary  TEXT,

    -- Skills (stored as arrays)
    technical_skills TEXT[],
    soft_skills      TEXT[],

    -- Education (JSONB array)
    education JSONB DEFAULT '[]'::jsonb,
    -- Format: [{"degree":"","institution":"","field":"","year":""}]

    -- Experience (JSONB array)
    experience JSONB DEFAULT '[]'::jsonb,
    -- Format: [{"title":"","company":"","start":"","end":"","description":""}]

    -- Projects (JSONB array)
    projects JSONB DEFAULT '[]'::jsonb,
    -- Format: [{"name":"","description":"","technologies":[],"url":""}]

    -- Certifications
    certifications TEXT[],

    -- Resume quality scores (AI analysis)
    completeness_score INT CHECK (completeness_score BETWEEN 0 AND 100),
    ats_score          INT CHECK (ats_score BETWEEN 0 AND 100),

    -- AI analysis
    strengths          TEXT[],
    improvement_areas  TEXT[],
    missing_elements   TEXT[],

    -- Career insights (generated on-demand, cached)
    career_insights JSONB,
    -- Format: {"role_level":"","industries":[],"trajectory":"","recommended_paths":[]}

    -- Timestamps
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- ================================
-- 9. JOB APPLICATIONS
-- ================================

CREATE TABLE IF NOT EXISTS job_applications (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    job_id    VARCHAR(255) NOT NULL,
    job_title VARCHAR(500) NOT NULL,
    company   VARCHAR(500),
    location  VARCHAR(255),
    job_url   TEXT,

    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status     VARCHAR(50) DEFAULT 'applied',
    notes      TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- 10. CAREER ROADMAPS (AI PLANNER)
-- ================================

CREATE TABLE IF NOT EXISTS career_roadmaps (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    title       TEXT NOT NULL,
    description TEXT,
    status      TEXT CHECK (status IN ('active', 'paused', 'completed', 'archived')) DEFAULT 'active',

    total_tasks         INT DEFAULT 0,
    completed_tasks     INT DEFAULT 0,
    progress_percentage INT DEFAULT 0,
    estimated_hours     INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),

    -- Only one active roadmap per user at a time
    UNIQUE(user_id, status)
);

-- ================================
-- 11. ROADMAP MILESTONES
-- ================================

CREATE TABLE IF NOT EXISTS roadmap_milestones (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id UUID REFERENCES career_roadmaps(id) ON DELETE CASCADE,

    title          TEXT NOT NULL,
    description    TEXT,
    sequence_order INT NOT NULL,
    deadline       DATE,
    status         TEXT CHECK (status IN ('pending', 'in-progress', 'completed')) DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT now()
);

-- ================================
-- 12. ROADMAP TASKS
-- ================================

CREATE TABLE IF NOT EXISTS roadmap_tasks (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id   UUID REFERENCES career_roadmaps(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES roadmap_milestones(id),

    title       TEXT NOT NULL,
    description TEXT,
    category    TEXT, -- 'learning', 'project', 'practice', 'reading'

    priority   TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    status     TEXT CHECK (status IN ('todo', 'in-progress', 'completed', 'blocked')) DEFAULT 'todo',

    estimated_hours INT DEFAULT 0,
    actual_hours    INT DEFAULT 0,
    deadline        DATE,
    sequence_order  INT,

    resources TEXT[], -- URLs or references
    notes     TEXT,

    created_at   TIMESTAMP DEFAULT now(),
    updated_at   TIMESTAMP DEFAULT now(),
    completed_at TIMESTAMP
);

-- ================================
-- 13. TASK DEPENDENCIES
-- ================================

CREATE TABLE IF NOT EXISTS task_dependencies (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id            UUID REFERENCES roadmap_tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID REFERENCES roadmap_tasks(id) ON DELETE CASCADE,
    created_at         TIMESTAMP DEFAULT now(),

    UNIQUE(task_id, depends_on_task_id),
    CHECK (task_id != depends_on_task_id)
);

-- ================================
-- 14. TASK PROGRESS
-- ================================

CREATE TABLE IF NOT EXISTS task_progress (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES roadmap_tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    progress_percentage INT DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    notes               TEXT,
    time_spent_hours    INT DEFAULT 0,
    last_worked_on      TIMESTAMP,

    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),

    UNIQUE(task_id, user_id)
);

-- ================================
-- 15. PEER MEETINGS
-- ================================
-- NOTE: This table was used by routes/peer-meetings.js
-- but was MISSING from all previous schema files.

CREATE TABLE IF NOT EXISTS peer_meetings (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    peer_name     TEXT NOT NULL,
    peer_email    TEXT,
    peer_linkedin TEXT,

    meeting_title  TEXT NOT NULL,
    meeting_agenda TEXT NOT NULL,
    meeting_topics TEXT[],

    skill_level      TEXT DEFAULT 'intermediate',
    meeting_type     TEXT DEFAULT 'mock-interview',

    scheduled_date   DATE,
    scheduled_time   TIME,
    duration_minutes INT DEFAULT 60,
    timezone         TEXT DEFAULT 'UTC',

    meeting_url TEXT,
    status      TEXT DEFAULT 'scheduled',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =============================================================
-- INDEXES
-- =============================================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Skills
CREATE INDEX IF NOT EXISTS idx_skills_user_id ON skills(user_id);
CREATE INDEX IF NOT EXISTS idx_skills_embedding ON skills USING ivfflat (embedding vector_cosine_ops);

-- Resume Info
CREATE INDEX IF NOT EXISTS idx_resume_info_user_id ON resume_info(user_id);

-- Job Applications
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id     ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_applied_at  ON job_applications(applied_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_job_applications_unique ON job_applications(user_id, job_id);

-- Planner
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id          ON career_roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_status            ON career_roadmaps(status);
CREATE INDEX IF NOT EXISTS idx_milestones_roadmap_id      ON roadmap_milestones(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_tasks_roadmap_id           ON roadmap_tasks(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_tasks_milestone_id         ON roadmap_tasks(milestone_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status               ON roadmap_tasks(status);
CREATE INDEX IF NOT EXISTS idx_dependencies_task_id       ON task_dependencies(task_id);
CREATE INDEX IF NOT EXISTS idx_dependencies_depends_on    ON task_dependencies(depends_on_task_id);
CREATE INDEX IF NOT EXISTS idx_progress_task_id           ON task_progress(task_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_id           ON task_progress(user_id);

-- Peer Meetings
CREATE INDEX IF NOT EXISTS idx_peer_meetings_user_id       ON peer_meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_peer_meetings_scheduled     ON peer_meetings(scheduled_date DESC);


-- =============================================================
-- TRIGGERS
-- =============================================================

-- Auto-update resume_info.updated_at on row update
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
