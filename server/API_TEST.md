# REST API Testing Guide - HackSync API

## Base URL
```
http://localhost:5555
```

All API routes are prefixed with `/api`

> **Tip**: If you get a "Malformed JSON request" error, use the one-liner versions below.

### ⚡ Quick Start (One-Liners)
```bash
# Register
curl -X POST http://localhost:5555/api/users/register -H "Content-Type: application/json" -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login (Saves cookie)
curl -X POST http://localhost:5555/api/users/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password123"}' -c cookies.txt

# Get Profile (Uses cookie)
curl -X GET http://localhost:5555/api/users/me -b cookies.txt
```

---

## 📋 Table of Contents
1. [Health Check](#health-check)
2. [User Authentication](#user-authentication)
3. [Posts](#posts)
4. [Comments](#comments)
5. [Voting](#voting)
6. [Onboarding](#onboarding)
7. [Profile Enrichment](#profile-enrichment)
8. [Recommendations](#recommendations)

---

## Health Check

### Check API Status
```bash
curl -X GET http://localhost:5555/
```

**Response:**
```json
{
  "message": "HackSync API Server",
  "version": "1.0.0",
  "status": "running"
}
```

---

## User Authentication

### 1. Register New User
```bash
curl -X POST http://localhost:5555/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }' \
  -v
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

---

### 2. Login
```bash
curl -X POST http://localhost:5555/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' \
  -c cookies.txt \
  -v
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Note:** The JWT token is automatically stored in an HTTP-only cookie and also returned in the response.

---

### 3. Get Current User Profile
```bash
curl -X GET http://localhost:5555/api/users/me \
  -b cookies.txt \
  -v
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

---

### 4. Update Profile
```bash
curl -X PUT http://localhost:5555/api/users/me \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newusername"
  }' \
  -b cookies.txt \
  -v
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "username": "newusername",
    "email": "test@example.com"
  }
}
```

---

### 5. Logout
```bash
curl -X POST http://localhost:5555/api/users/logout \
  -b cookies.txt \
  -c cookies.txt \
  -v
```

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

---

## Posts

### 1. Get All Posts
```bash
curl -X GET http://localhost:5555/api/posts \
  -v
```

**Response (200):**
```json
{
  "posts": [
    {
      "id": 1,
      "content": "This is my first post!",
      "upvotes": 5,
      "downvotes": 1,
      "user_id": 1,
      "created": "2026-01-14T15:00:00.000Z",
      "username": "testuser",
      "comment_count": "3"
    }
  ],
  "count": 1
}
```

---

### 2. Get Single Post
```bash
curl -X GET http://localhost:5555/api/posts/1 \
  -v
```

**Response (200):**
```json
{
  "post": {
    "id": 1,
    "content": "This is my first post!",
    "upvotes": 5,
    "downvotes": 1,
    "user_id": 1,
    "created": "2026-01-14T15:00:00.000Z",
    "username": "testuser"
  },
  "comments": [
    {
      "id": 1,
      "post_id": 1,
      "user_id": 2,
      "content": "Great post!",
      "created_at": "2026-01-14T15:05:00.000Z",
      "username": "anotheruser"
    }
  ],
  "userVote": null
}
```

---

### 3. Create New Post (Requires Auth)
```bash
curl -X POST http://localhost:5555/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is my awesome post!"
  }' \
  -b cookies.txt \
  -v
```

**Response (201):**
```json
{
  "message": "Post created successfully",
  "post": {
    "id": 2,
    "content": "This is my awesome post!",
    "upvotes": 0,
    "downvotes": 0,
    "user_id": 1,
    "created": "2026-01-14T15:10:00.000Z"
  }
}
```

---

## Comments

### 1. Get Comments for a Post
```bash
curl -X GET http://localhost:5555/api/posts/1/comments \
  -v
```

**Response (200):**
```json
{
  "comments": [
    {
      "id": 1,
      "post_id": 1,
      "user_id": 2,
      "content": "Great post!",
      "created_at": "2026-01-14T15:05:00.000Z",
      "username": "anotheruser"
    }
  ],
  "count": 1
}
```

---

### 2. Add Comment to Post (Requires Auth)
```bash
curl -X POST http://localhost:5555/api/posts/1/comments \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is a great post!"
  }' \
  -b cookies.txt \
  -v
```

**Response (201):**
```json
{
  "message": "Comment added successfully",
  "comment": {
    "id": 2,
    "post_id": 1,
    "user_id": 1,
    "content": "This is a great post!",
    "created_at": "2026-01-14T15:15:00.000Z"
  }
}
```

---

## Voting

### 1. Upvote a Post (Requires Auth)
```bash
curl -X POST http://localhost:5555/api/posts/1/upvote \
  -b cookies.txt \
  -v
```

**Response (200):**
```json
{
  "message": "Post upvoted",
  "action": "upvoted"
}
```

**Possible actions:**
- `upvoted` - Post was upvoted
- `removed` - Upvote was removed (clicked again)

---

### 2. Downvote a Post (Requires Auth)
```bash
curl -X POST http://localhost:5555/api/posts/1/downvote \
  -b cookies.txt \
  -v
```

**Response (200):**
```json
{
  "message": "Post downvoted",
  "action": "downvoted"
}
```

**Possible actions:**
- `downvoted` - Post was downvoted
- `removed` - Downvote was removed (clicked again)

---

## Complete Test Flow

```bash
# 1. Register a new user
curl -X POST http://localhost:5555/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# 2. Login
curl -X POST http://localhost:5555/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt

# 3. Get current user
curl -X GET http://localhost:5555/api/users/me \
  -b cookies.txt

# 4. Create a post
curl -X POST http://localhost:5555/api/posts \
  -H "Content-Type: application/json" \
  -d '{"content":"My first API post!"}' \
  -b cookies.txt

# 5. Get all posts
curl -X GET http://localhost:5555/api/posts

# 6. Get single post (replace 1 with actual post ID)
curl -X GET http://localhost:5555/api/posts/1

# 7. Upvote the post
curl -X POST http://localhost:5555/api/posts/1/upvote \
  -b cookies.txt

# 8. Add a comment
curl -X POST http://localhost:5555/api/posts/1/comments \
  -H "Content-Type: application/json" \
  -d '{"content":"Great post!"}' \
  -b cookies.txt

# 9. Get comments
curl -X GET http://localhost:5555/api/posts/1/comments

# 10. Logout
curl -X POST http://localhost:5555/api/users/logout \
  -b cookies.txt
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Please provide username, email, and password"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 404 Not Found
```json
{
  "error": "Post not found"
}
```

### 409 Conflict
```json
{
  "error": "User with this email already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "An error occurred during registration"
}
```

---

## Authentication Methods

### Option 1: Using Cookies (Recommended)
The API automatically sets an HTTP-only cookie on login. Use `-c cookies.txt` to save and `-b cookies.txt` to send cookies.

```bash
# Login and save cookie
curl -X POST http://localhost:5555/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt

# Use cookie for authenticated requests
curl -X GET http://localhost:5555/api/users/me \
  -b cookies.txt
```

### Option 2: Using Bearer Token
You can also use the token from the login response as a Bearer token (requires adding Authorization header support).

---

## Tips

1. **Pretty Print JSON:**
   ```bash
   curl http://localhost:5555/api/posts | jq
   ```

2. **View Response Headers:**
   ```bash
   curl -i http://localhost:5555/api/posts
   ```

3. **Save Response to File:**
   ```bash
   curl http://localhost:5555/api/posts > posts.json
   ```

4. **Test with Different Users:**
   Create multiple users and test interactions between them.

---

## API Endpoints Summary

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/` | No | Health check |
| POST | `/api/users/register` | No | Register new user |
| POST | `/api/users/login` | No | Login user |
| POST | `/api/users/logout` | No | Logout user |
| GET | `/api/users/me` | Yes | Get current user |
| PUT | `/api/users/me` | Yes | Update profile |
| GET | `/api/posts` | No | Get all posts |
| GET | `/api/posts/:id` | No | Get single post |
| POST | `/api/posts` | Yes | Create post |
| POST | `/api/posts/:id/upvote` | Yes | Upvote post |
| POST | `/api/posts/:id/downvote` | Yes | Downvote post |
| GET | `/api/posts/:id/comments` | No | Get comments |
| POST | `/api/posts/:id/comments` | Yes | Add comment |
| POST | `/api/onboarding/basic-info` | Yes | Step 1: Basic Info |
| POST | `/api/onboarding/career-goals` | Yes | Step 2: Career Info |
| POST | `/api/onboarding/skills` | Yes | Step 3: Skills |
| POST | `/api/onboarding/resume` | Yes | Optional: Resume Upload |

---

## Onboarding

### 1. Step 1: Basic Info
```bash
curl -X POST http://localhost:5555/api/onboarding/basic-info \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "+1234567890",
    "age": 25,
    "gender": "male",
    "location": "New York, USA"
  }' \
  -b cookies.txt \
  -v
```

### 2. Step 2: Career Info
```bash
curl -X POST http://localhost:5555/api/onboarding/career-goals \
  -H "Content-Type: application/json" \
  -d '{
    "role": "Full Stack Developer",
    "status": "intermediate"
  }' \
  -b cookies.txt \
  -v
```

### 3. Step 3: Skills
```bash
curl -X POST http://localhost:5555/api/onboarding/skills \
  -H "Content-Type: application/json" \
  -d '{
    "skills": ["Node.js", "React", "PostgreSQL"]
  }' \
  -b cookies.txt \
  -v
```

### 4. Optional: Resume Upload
```bash
curl -X POST http://localhost:5555/api/onboarding/resume \
  -F "resume=@/path/to/your/resume.pdf" \
  -b cookies.txt \
  -v
```

---

## Profile Enrichment

### 1. Add Education
```bash
curl -X POST http://localhost:5555/api/profile/education \
  -H "Content-Type: application/json" \
  -d '{
    "degree": "Bachelor of Science",
    "major": "Computer Science",
    "institution": "Tech University",
    "graduation_year": 2024
  }' \
  -b cookies.txt \
  -v
```

### 2. Add Experience
```bash
curl -X POST http://localhost:5555/api/profile/experience \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Software Intern",
    "organization": "Code Corp",
    "description": "Worked on backend APIs",
    "start_date": "2023-06-01",
    "end_date": "2023-08-31"
  }' \
  -b cookies.txt \
  -v
```

### 3. Add Skills (Simplified)
```bash
# Add a single skill
curl -X POST http://localhost:5555/api/skills \
  -H "Content-Type: application/json" \
  -d '{
    "skills": "JavaScript"
  }' \
  -b cookies.txt \
  -v

# Add multiple skills at once
curl -X POST http://localhost:5555/api/skills \
  -H "Content-Type: application/json" \
  -d '{
    "skills": ["Node.js", "React", "PostgreSQL"]
  }' \
  -b cookies.txt \
  -v
```

### 4. Get My Skills
```bash
curl -X GET http://localhost:5555/api/skills \
  -b cookies.txt \
  -v
```

### 4. Update Preferences
```bash
curl -X POST http://localhost:5555/api/profile/preferences \
  -H "Content-Type: application/json" \
  -d '{
    "interests": ["AI", "Web Dev"],
    "preferred_roles": ["Backend Engineer"],
    "industry_preferences": ["Fintech", "Healthtech"]
  }' \
  -b cookies.txt \
  -v
```

---

## Recommendations

### 1. Get Career Recommendations (Basic)
```bash
curl -X GET http://localhost:5555/api/recommendations/career \
  -b cookies.txt \
  -v
```

**Response:**
```json
{
  "user_id": "uuid",
  "recommendations": [
    {
      "title": "Senior Full Stack Developer",
      "reason": "Aligns with your stated goal",
      "match_score": 95
    }
  ]
}
```

---

### 2. Get Career Dashboard (Comprehensive) ⭐ NEW
```bash
curl -X GET http://localhost:5555/api/recommendations/dashboard \
  -b cookies.txt \
  -v
```

This is the **main endpoint for your homepage dashboard**. It provides:
- Profile overview with completeness score
- AI-powered career path recommendations
- Trending roles for 2025-2026
- Fast-growing industries with growth rates
- Skill development priorities
- Career trajectory (short/medium/long term goals)
- Actionable steps

**Response:**
```json
{
  "user_id": "uuid",
  "user_name": "John Doe",
  
  "profile_overview": {
    "completeness_percentage": 75,
    "completeness_breakdown": {
      "basic_info": 18,
      "skills": 15,
      "education": 10,
      "experience": 15,
      "preferences": 7,
      "resume": 10
    },
    "onboarding_completed": true,
    "has_resume": true,
    "resume_score": 82
  },

  "career_dashboard": {
    "profile_summary": {
      "current_level": "mid",
      "primary_domain": "Full Stack Development",
      "profile_strength_score": 78,
      "profile_completeness": 80
    },
    "recommended_career_paths": [
      {
        "title": "Senior Full Stack Developer",
        "match_score": 95,
        "reasoning": "Strong alignment with current skills and experience",
        "skill_gaps": ["System Design", "Cloud Architecture"],
        "estimated_transition_time": "3-6 months",
        "salary_range": "$120k-$160k",
        "growth_outlook": "High demand, +28% growth"
      }
    ],
    "trending_roles_2026": [
      {
        "title": "AI/ML Engineer",
        "demand_level": "Very High",
        "why_trending": "Explosion of AI applications across all industries",
        "relevance_to_profile": "Your JS skills can transfer to Python for ML"
      }
    ],
    "fast_growing_industries": [
      {
        "industry": "Artificial Intelligence",
        "growth_rate": "+45%",
        "key_roles": ["ML Engineer", "AI Researcher", "MLOps Engineer"],
        "skills_needed": ["Python", "TensorFlow", "Data Science"],
        "fit_for_profile": "Medium"
      }
    ],
    "skill_development_priorities": [
      {
        "skill": "System Design",
        "priority": "high",
        "reason": "Essential for senior roles",
        "learning_resources": ["Online courses", "Architecture books"],
        "estimated_time": "2-3 months"
      }
    ],
    "career_trajectory": {
      "short_term_goal": "Master system design for senior interviews",
      "medium_term_goal": "Lead a team of 3-5 developers",
      "long_term_vision": "Engineering Manager or Staff Engineer"
    },
    "action_items": [
      "Complete a system design course in the next 2 months",
      "Contribute to open-source projects",
      "Build a portfolio project showcasing full-stack skills"
    ],
    "generated_at": "2026-01-15T07:40:00.000Z",
    "data_sources": ["Profile Analysis", "Resume Data", "Market Trends 2026"]
  },

  "quick_stats": {
    "total_skills": 12,
    "technical_skills_count": 8,
    "years_of_experience": 3,
    "education_count": 1,
    "experience_count": 2,
    "current_goal": "Full Stack Developer"
  },

  "generated_at": "2026-01-15T07:40:00.000Z"
}
```

---

### 3. Get Trending Roles & Industries (Lightweight) ⭐ NEW
```bash
curl -X GET http://localhost:5555/api/recommendations/trending \
  -b cookies.txt \
  -v
```

A lighter endpoint for just trending data without AI analysis:

**Response:**
```json
{
  "trending_roles_2026": [
    {
      "title": "AI/ML Engineer",
      "demand_level": "Very High",
      "growth_rate": "+45%",
      "why_trending": "Explosion of AI applications across all industries"
    },
    {
      "title": "Cloud Solutions Architect",
      "demand_level": "Very High",
      "growth_rate": "+38%",
      "why_trending": "Continued cloud migration and multi-cloud strategies"
    }
  ],
  "fast_growing_industries": [
    {
      "industry": "Artificial Intelligence",
      "growth_rate": "+45%",
      "key_roles": ["ML Engineer", "AI Researcher", "Prompt Engineer", "MLOps Engineer"]
    },
    {
      "industry": "Cybersecurity",
      "growth_rate": "+35%",
      "key_roles": ["Security Engineer", "Penetration Tester", "SOC Analyst"]
    }
  ],
  "last_updated": "2026-01-15T07:40:00.000Z",
  "source": "Market Analysis 2025-2026"
}
```

---

## API Endpoints Summary (Updated)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | No | Health check |
| POST | `/api/users/register` | No | Register new user |
| POST | `/api/users/login` | No | Login user |
| POST | `/api/users/logout` | No | Logout user |
| GET | `/api/users/me` | Yes | Get current user |
| PUT | `/api/users/me` | Yes | Update profile |
| GET | `/api/posts` | No | Get all posts |
| GET | `/api/posts/:id` | No | Get single post |
| POST | `/api/posts` | Yes | Create post |
| POST | `/api/posts/:id/upvote` | Yes | Upvote post |
| POST | `/api/posts/:id/downvote` | Yes | Downvote post |
| GET | `/api/posts/:id/comments` | No | Get comments |
| POST | `/api/posts/:id/comments` | Yes | Add comment |
| POST | `/api/onboarding/basic-info` | Yes | Step 1: Basic Info |
| POST | `/api/onboarding/career-goals` | Yes | Step 2: Career Info |
| POST | `/api/onboarding/skills` | Yes | Step 3: Skills |
| POST | `/api/onboarding/resume` | Yes | Optional: Resume Upload |
| POST | `/api/profile/education` | Yes | Add education |
| POST | `/api/profile/experience` | Yes | Add experience |
| POST | `/api/profile/preferences` | Yes | Update preferences |
| GET | `/api/skills` | Yes | Get user skills |
| POST | `/api/skills` | Yes | Add skills |
| GET | `/api/recommendations/career` | Yes | Basic career recommendations |
| GET | `/api/recommendations/dashboard` | Yes | **⭐ Full career dashboard** |
| GET | `/api/recommendations/trending` | Yes | Trending roles & industries |
| POST | `/api/resume/upload` | Yes | Upload and parse resume |
| GET | `/api/resume/recommendations` | Yes | AI career recommendations |
| GET | `/api/resume/analyze` | Yes | Resume ATS analysis |
| GET | `/api/resume/insights` | Yes | Career insights |

