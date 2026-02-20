# Resume Parser API Documentation

## Overview
The resume parser uses Google's Gemini AI to extract information from resumes. The system uses a **fast upload + on-demand features** architecture for optimal performance.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FAST UPLOAD (~10-15s)                    │
│  Resume → Extract Text → AI Parse (Basic) → Store in DB    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 ON-DEMAND FEATURES (~5-10s each)            │
│  • /analyze → ATS Score, Completeness (cached)             │
│  • /recommendations → Career Paths (fresh each time)       │
│  • /career-insights → Career Trajectory (cached)           │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites
- Add `GEMINI_API_KEY` to your `.env` file
- Run the new schema: `psql -d your_db -f schema/resume_info.sql`
- Install dependencies: `npm install`

---

## Endpoints

### 1. Upload and Parse Resume
**POST** `/api/resume/upload`

Uploads a resume file, extracts text, parses essential data using AI, and stores in `resume_info` table.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```

**Body:**
- `resume` (file): PDF, DOC, DOCX, or TXT file (max 5MB)

**Example:**
```bash
curl -X POST http://localhost:5555/api/resume/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "resume=@/path/to/resume.pdf"
```

**Response:**
```json
{
  "message": "Resume uploaded and parsed successfully",
  "data": {
    "name": "John Doe",
    "title": "Senior Software Engineer",
    "years_of_experience": 5,
    "technical_skills_count": 12,
    "soft_skills_count": 5,
    "education_count": 1,
    "experience_count": 3
  },
  "endpoints": {
    "get_resume": "/api/resume/info",
    "get_analysis": "/api/resume/analyze",
    "get_recommendations": "/api/resume/recommendations",
    "get_career_insights": "/api/resume/career-insights"
  }
}
```

---

### 2. Get Resume Info
**GET** `/api/resume/info`

Retrieves all stored resume data for the authenticated user.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Example:**
```bash
curl -X GET http://localhost:5555/api/resume/info \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "extracted_name": "John Doe",
  "extracted_email": "john@example.com",
  "extracted_phone": "+1-555-123-4567",
  "extracted_location": "San Francisco, CA",
  "linkedin_url": "linkedin.com/in/johndoe",
  "portfolio_url": "johndoe.dev",
  "professional_title": "Senior Software Engineer",
  "years_of_experience": 5,
  "professional_summary": "Experienced full-stack developer...",
  "technical_skills": ["JavaScript", "Python", "React", "Node.js"],
  "soft_skills": ["Leadership", "Communication"],
  "education": [
    {
      "degree": "B.S. Computer Science",
      "institution": "Stanford University",
      "field": "Computer Science",
      "year": "2018"
    }
  ],
  "experience": [
    {
      "title": "Senior Software Engineer",
      "company": "Tech Corp",
      "start": "2020-06",
      "end": "present",
      "description": "Led development of..."
    }
  ],
  "certifications": ["AWS Solutions Architect"],
  "completeness_score": 85,
  "ats_score": 78,
  "uploaded_at": "2026-01-15T01:00:00Z",
  "updated_at": "2026-01-15T01:00:00Z"
}
```

---

### 3. Analyze Resume (On-Demand)
**GET** `/api/resume/analyze`

Generates ATS compatibility and completeness scores. Results are cached for 24 hours.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
- `force=true` - Force regenerate analysis (ignore cache)

**Example:**
```bash
# Get cached or generate new analysis
curl -X GET http://localhost:5555/api/resume/analyze \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Force fresh analysis
curl -X GET "http://localhost:5555/api/resume/analyze?force=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "completeness_score": 85,
  "ats_score": 78,
  "strengths": ["Clear work history", "Relevant technical skills", "Quantified achievements"],
  "improvement_areas": ["Add more action verbs", "Include certifications section"],
  "missing_elements": ["Portfolio link", "GitHub profile"],
  "cached": false
}
```

---

### 4. Get Career Recommendations (On-Demand)
**GET** `/api/resume/recommendations`

Generates fresh career path recommendations based on resume data. Not cached - always fresh.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Example:**
```bash
curl -X GET http://localhost:5555/api/resume/recommendations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "recommended_roles": [
    {
      "title": "Staff Software Engineer",
      "match_score": 92,
      "reasoning": "Your 5 years of experience with React and Node.js align perfectly...",
      "skill_gaps": ["System Design", "Kubernetes"],
      "estimated_transition_time": "6-12 months"
    },
    {
      "title": "Engineering Manager",
      "match_score": 78,
      "reasoning": "Your leadership experience and technical background...",
      "skill_gaps": ["People Management", "Agile Methodologies"],
      "estimated_transition_time": "1-2 years"
    }
  ],
  "skill_development_plan": [
    {
      "skill": "System Design",
      "priority": "high",
      "estimated_learning_time": "2-3 months"
    },
    {
      "skill": "Kubernetes",
      "priority": "medium",
      "estimated_learning_time": "1-2 months"
    }
  ],
  "generated_at": "2026-01-15T01:00:00Z"
}
```

---

### 5. Get Career Insights (On-Demand, Cached)
**GET** `/api/resume/career-insights`

Analyzes career trajectory and provides insights. Results are cached until resume is updated.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
- `force=true` - Force regenerate insights (ignore cache)

**Example:**
```bash
curl -X GET http://localhost:5555/api/resume/career-insights \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "current_role_level": "senior",
  "industries_worked": ["Technology", "FinTech", "SaaS"],
  "career_interests": ["Cloud Architecture", "DevOps", "System Design"],
  "growth_trajectory": "ascending",
  "recommended_paths": ["Staff Engineer", "Principal Engineer", "CTO"],
  "cached": true,
  "message": "Add ?force=true to regenerate insights"
}
```

---

### 6. Delete Resume
**DELETE** `/api/resume`

Deletes all stored resume data for the authenticated user.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Example:**
```bash
curl -X DELETE http://localhost:5555/api/resume \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "message": "Resume deleted successfully"
}
```

---

## Database Schema

All resume data is stored in a single `resume_info` table. Run this migration:

```bash
psql -d your_db -f schema/resume_info.sql
```

### Table: `resume_info`

| Column | Type | Description |
|--------|------|-------------|
| user_id | UUID | Primary key, references users |
| resume_source | TEXT | Original filename |
| resume_text | TEXT | Raw extracted text (for re-analysis) |
| extracted_name | TEXT | Parsed name |
| extracted_email | TEXT | Parsed email |
| technical_skills | TEXT[] | Array of technical skills |
| soft_skills | TEXT[] | Array of soft skills |
| education | JSONB | Education entries |
| experience | JSONB | Work experience entries |
| projects | JSONB | Project entries |
| certifications | TEXT[] | Certifications list |
| completeness_score | INT | 0-100 completeness score |
| ats_score | INT | 0-100 ATS compatibility score |
| career_insights | JSONB | Cached career insights |
| uploaded_at | TIMESTAMP | When resume was uploaded |
| updated_at | TIMESTAMP | Last update time |

### Migration from Old Schema

If you have the old multi-table schema, run:

```bash
psql -d your_db -f schema/drop_old_resume_tables.sql
psql -d your_db -f schema/resume_info.sql
```

---

## Environment Variables

Add to `.env`:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your API key from: https://ai.google.dev/

---

## Error Handling

### Common Errors:

**400 Bad Request**
```json
{ "error": "No resume file uploaded" }
```

**400 Bad Request**
```json
{ "error": "Resume content is too short or could not be extracted" }
```

**404 Not Found**
```json
{ "error": "No resume found. Please upload a resume first." }
```

**500 Internal Server Error**
```json
{ "error": "Failed to parse resume", "details": "Error message here" }
```

---

## Performance

| Operation | Time | Notes |
|-----------|------|-------|
| Upload & Parse | ~10-15s | Basic extraction only |
| Get Info | Instant | From database |
| Analyze | ~5-10s | Cached for 24h |
| Recommendations | ~5-10s | Always fresh |
| Career Insights | ~5-10s | Cached until update |

---

## Testing

```bash
# 1. Register and login
curl -X POST http://localhost:5555/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# 2. Login to get JWT token
TOKEN=$(curl -s -X POST http://localhost:5555/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' | jq -r '.token')

# 3. Upload resume
curl -X POST http://localhost:5555/api/resume/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "resume=@sample_resume.pdf"

# 4. Get resume info
curl -X GET http://localhost:5555/api/resume/info \
  -H "Authorization: Bearer $TOKEN"

# 5. Get analysis (on-demand)
curl -X GET http://localhost:5555/api/resume/analyze \
  -H "Authorization: Bearer $TOKEN"

# 6. Get recommendations (on-demand)
curl -X GET http://localhost:5555/api/resume/recommendations \
  -H "Authorization: Bearer $TOKEN"

# 7. Get career insights (on-demand)
curl -X GET http://localhost:5555/api/resume/career-insights \
  -H "Authorization: Bearer $TOKEN"
```

---

## What Gets Extracted

### During Upload (Fast)
- ✅ Name, email, phone, location
- ✅ LinkedIn, portfolio URLs
- ✅ Professional title & summary
- ✅ Years of experience
- ✅ Technical skills (list)
- ✅ Soft skills (list)
- ✅ Education history
- ✅ Work experience
- ✅ Certifications

### On-Demand (When Requested)
- 📊 Completeness score
- 📊 ATS compatibility score
- 📊 Strengths & improvement areas
- 🎯 Career recommendations
- 🎯 Skill development plan
- 📈 Career trajectory insights

---

## Integration with Onboarding

The resume parser integrates as **Step 4** of onboarding:

1. **Step 1**: Basic Info (`POST /api/onboarding/basic-info`)
2. **Step 2**: Career Goals (`POST /api/onboarding/career-goals`)
3. **Step 3**: Skills (`POST /api/onboarding/skills`)
4. **Step 4**: Resume Upload (`POST /api/resume/upload`) ← Completes onboarding

---

## Future Enhancements

- [ ] LinkedIn profile import
- [ ] Resume version comparison
- [ ] Job matching based on resume
- [ ] Resume builder/editor
- [ ] Multi-language support
