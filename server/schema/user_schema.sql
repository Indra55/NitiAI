-- ================================
-- EXTENSIONS
-- ================================

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ================================
-- USERS (CORE)
-- ================================

CREATE TABLE users (
    -- Using native uuidv7() available in Postgres 18+
    id UUID PRIMARY KEY DEFAULT uuidv7(),

    username TEXT NOT NULL,
    name TEXT NOT NULL,
    age INT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Added for authentication
    phone TEXT,
    location TEXT,

    proficiency_level TEXT CHECK (proficiency_level IN ('beginner','intermediate','advanced')),
    preferred_work_mode TEXT CHECK (preferred_work_mode IN ('remote','onsite','hybrid')),
    availability_timeline TEXT,

    career_goal_short TEXT,
    career_goal_long TEXT,

    onboarding_completed BOOLEAN DEFAULT false,
    onboarding_step INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- ================================
-- EDUCATION
-- ================================

CREATE TABLE education (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    degree TEXT,
    major TEXT,
    institution TEXT,
    graduation_year INT
);

-- ================================
-- EXPERIENCE (JOBS / PROJECTS)
-- ================================

CREATE TABLE experience (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    title TEXT,
    organization TEXT,
    description TEXT,
    start_date DATE,
    end_date DATE
);

-- ================================
-- SKILLS (VECTOR READY)
-- ================================

CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    skill_name TEXT NOT NULL,
    skill_type TEXT CHECK (skill_type IN ('technical','soft')),
    proficiency INT CHECK (proficiency BETWEEN 1 AND 5),

    embedding vector(768)
);

-- ================================
-- CERTIFICATIONS & LINKS
-- ================================

CREATE TABLE certifications_links (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    label TEXT,
    url TEXT
);

-- ================================
-- PREFERENCES
-- ================================

CREATE TABLE preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

    interests TEXT[],
    preferred_roles TEXT[],
    industry_preferences TEXT[]
);

-- ================================
-- OPTIONAL (LATER STAGE)
-- ================================

CREATE TABLE optional_profile (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

    gender TEXT,
    expected_salary INT,
    work_style_preference TEXT
);

-- ================================
-- RESUME METADATA
-- ================================

CREATE TABLE resume_metadata (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

    resume_uploaded BOOLEAN DEFAULT false,
    parsed_successfully BOOLEAN DEFAULT false,
    resume_source TEXT,
    last_parsed_at TIMESTAMP
);

-- ================================
-- INDEXES (IMPORTANT)
-- ================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_skills_user_id ON skills(user_id);
CREATE INDEX idx_skills_embedding ON skills USING ivfflat (embedding vector_cosine_ops);




CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id VARCHAR(255) NOT NULL,
    job_title VARCHAR(500) NOT NULL,
    company VARCHAR(500),
    location VARCHAR(255),
    job_url TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'applied',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX idx_job_applications_applied_at ON job_applications(applied_at DESC);

-- Prevent duplicate applications
CREATE UNIQUE INDEX idx_job_applications_unique ON job_applications(user_id, job_id);