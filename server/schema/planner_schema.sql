-- ================================
-- AI PLANNER / ROADMAP SCHEMA
-- ================================

-- Career Roadmaps (Main Plans)
CREATE TABLE career_roadmaps (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('active', 'paused', 'completed', 'archived')) DEFAULT 'active',
    
    total_tasks INT DEFAULT 0,
    completed_tasks INT DEFAULT 0,
    progress_percentage INT DEFAULT 0,
    estimated_hours INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    
    -- Only one active roadmap per user at a time
    UNIQUE(user_id, status)
);

-- Roadmap Milestones (Key Phases)
CREATE TABLE roadmap_milestones (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    roadmap_id UUID REFERENCES career_roadmaps(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    description TEXT,
    sequence_order INT NOT NULL,
    deadline DATE,
    status TEXT CHECK (status IN ('pending', 'in-progress', 'completed')) DEFAULT 'pending',
    
    created_at TIMESTAMP DEFAULT now()
);

-- Roadmap Tasks (Individual Action Items)
CREATE TABLE roadmap_tasks (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    roadmap_id UUID REFERENCES career_roadmaps(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES roadmap_milestones(id),
    
    title TEXT NOT NULL,
    description TEXT,
    category TEXT, -- 'learning', 'project', 'practice', 'reading'
    
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    status TEXT CHECK (status IN ('todo', 'in-progress', 'completed', 'blocked')) DEFAULT 'todo',
    
    estimated_hours INT DEFAULT 0,
    actual_hours INT DEFAULT 0,
    deadline DATE,
    sequence_order INT,
    
    resources TEXT[], -- URLs or references
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    completed_at TIMESTAMP
);

-- Task Dependencies (Prerequisites)
CREATE TABLE task_dependencies (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    task_id UUID REFERENCES roadmap_tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID REFERENCES roadmap_tasks(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT now(),
    
    UNIQUE(task_id, depends_on_task_id),
    -- Prevent self-dependency
    CHECK (task_id != depends_on_task_id)
);

-- Task Progress Tracking
CREATE TABLE task_progress (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    task_id UUID REFERENCES roadmap_tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    progress_percentage INT DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    notes TEXT,
    time_spent_hours INT DEFAULT 0,
    last_worked_on TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    
    UNIQUE(task_id, user_id)
);

-- ================================
-- INDEXES
-- ================================

CREATE INDEX idx_roadmaps_user_id ON career_roadmaps(user_id);
CREATE INDEX idx_roadmaps_status ON career_roadmaps(status);
CREATE INDEX idx_milestones_roadmap_id ON roadmap_milestones(roadmap_id);
CREATE INDEX idx_tasks_roadmap_id ON roadmap_tasks(roadmap_id);
CREATE INDEX idx_tasks_milestone_id ON roadmap_tasks(milestone_id);
CREATE INDEX idx_tasks_status ON roadmap_tasks(status);
CREATE INDEX idx_dependencies_task_id ON task_dependencies(task_id);
CREATE INDEX idx_dependencies_depends_on ON task_dependencies(depends_on_task_id);
CREATE INDEX idx_progress_task_id ON task_progress(task_id);
CREATE INDEX idx_progress_user_id ON task_progress(user_id);
