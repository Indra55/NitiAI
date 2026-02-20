# Resume Parser Integration - Quick Guide

## ✅ What Changed

### 1. **FAST Resume Upload** (pg4 of onboarding)
- **Endpoint**: `POST /api/resume/upload`
- **What it does**: Only parses and stores resume data (10-15 seconds)
- **What it DOESN'T do**: Generate recommendations (saves 15-20 seconds!)

### 2. **Dynamic Recommendations** (on-demand)
- **Endpoint**: `GET /api/resume/recommendations`
- **What it does**: Generates fresh AI recommendations when user requests them
- **Why**: Recommendations stay current and user can regenerate anytime

---

## 🚀 Quick Start

### Step 1: Install Dependencies
```bash
cd /home/hitanshu/projectz/Hackathons/hacksync/server
npm install
```

### Step 2: Add Gemini API Key
Add to `.env`:
```
GEMINI_API_KEY=your_api_key_here
```

Get key from: https://ai.google.dev/

### Step 3: Run Schema Enhancements
```bash
psql -U your_user -d your_db -f schema/resume_enhancements.sql
```

---

## 📝 API Flow

### Onboarding Flow (Steps 1-4)

```bash
# Step 1: Basic Info
POST /api/onboarding/basic-info
{
  "name": "John Doe",
  "phone": "+1234567890",
  "age": 25,
  "gender": "male",
  "location": "San Francisco"
}

# Step 2: Career Goals
POST /api/onboarding/career-goals
{
  "role": "Full Stack Developer",
  "status": "intermediate"
}

# Step 3: Skills
POST /api/onboarding/skills
{
  "skills": ["JavaScript", "React", "Node.js", "Python"]
}

# Step 4: Resume Upload (NEW - FAST!)
POST /api/resume/upload
Content-Type: multipart/form-data
- resume: <file>

Response (in ~10-15 seconds):
{
  "message": "Resume uploaded and parsed successfully",
  "summary": {
    "completeness_score": 85,
    "ats_score": 78,
    "skills_extracted": 15,
    "experience_entries": 3,
    "education_entries": 1,
    "projects_found": 2
  },
  "next_steps": {
    "get_recommendations": "/api/resume/recommendations",
    "get_development_plan": "/api/resume/development-plan",
    "get_career_insights": "/api/resume/career-insights"
  }
}
```

### After Onboarding (Dynamic Features)

```bash
# Get Fresh Career Recommendations (generates on-demand)
GET /api/resume/recommendations
Authorization: Bearer <token>

Response (in ~10-20 seconds):
{
  "message": "Fresh recommendations generated",
  "recommendations": {
    "recommended_roles": [
      {
        "title": "Senior Full Stack Developer",
        "match_score": 92,
        "reasoning": "Your 5 years of experience...",
        "skill_gaps": ["GraphQL", "Docker"],
        "estimated_transition_time": "3-6 months",
        "growth_industries": ["FinTech", "HealthTech"]
      }
    ],
    "skill_development_plan": [...],
    "industry_trends": {...}
  }
}

# Get Resume Analysis (instant - already stored)
GET /api/resume/analysis
Authorization: Bearer <token>

# Get Career Insights (instant - already stored)
GET /api/resume/career-insights
Authorization: Bearer <token>

# Get Development Plan (instant - cached from recommendations)
GET /api/resume/development-plan
Authorization: Bearer <token>
```

---

## ⚡ Performance

| Endpoint | Time | Why |
|----------|------|-----|
| `POST /api/resume/upload` | 10-15s | Only parsing resume |
| `GET /api/resume/recommendations` | 10-20s | AI generates fresh recommendations |
| `GET /api/resume/analysis` | <1s | Already stored in DB |
| `GET /api/resume/career-insights` | <1s | Already stored in DB |
| `GET /api/resume/development-plan` | <1s | Cached from last recommendation |

---

## 🗄️ What Gets Stored During Upload

### Tables Updated:
1. ✅ `users` - Basic info, professional summary
2. ✅ `skills` - Technical & soft skills with proficiency
3. ✅ `education` - Degrees, institutions, GPA
4. ✅ `experience` - Work history with achievements
5. ✅ `projects` - Personal/professional projects
6. ✅ `certifications_links` - Certifications
7. ✅ `career_insights` - Career trajectory analysis
8. ✅ `resume_analysis` - ATS scores, completeness
9. ✅ `resume_metadata` - Upload tracking

### NOT Stored During Upload:
- ❌ `career_recommendations` - Generated on-demand
- ❌ `skill_development_plan` - Generated on-demand

---

## 🔄 When to Regenerate Recommendations

Users can call `GET /api/resume/recommendations` anytime to get fresh recommendations based on:
- Updated skills
- New experience added
- Changed career goals
- Market trends (AI always uses latest data)

---

## 🧪 Testing

```bash
# 1. Register
curl -X POST http://localhost:5555/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"pass123"}'

# 2. Login
TOKEN=$(curl -X POST http://localhost:5555/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}' | jq -r '.token')

# 3. Upload Resume (FAST!)
curl -X POST http://localhost:5555/api/resume/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "resume=@sample_resume.pdf"

# 4. Get Recommendations (when user wants them)
curl -X GET http://localhost:5555/api/resume/recommendations \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Schema Changes Required

Run this migration:
```bash
psql -U your_user -d your_db -f schema/resume_enhancements.sql
```

New tables:
- `projects`
- `career_insights`
- `resume_analysis`
- `career_recommendations`
- `skill_development_plan`

Enhanced tables:
- `users` - Added linkedin_url, portfolio_url, professional_title, etc.
- `experience` - Added achievements[], technologies_used[]
- `education` - Added field_of_study, gpa

---

## 🎯 Key Benefits

1. **Fast Onboarding**: Resume upload completes in 10-15s instead of 30-40s
2. **Fresh Recommendations**: Always generated with latest AI insights
3. **User Control**: Users can regenerate recommendations anytime
4. **Better UX**: No timeout errors during upload
5. **Scalable**: Heavy AI processing happens on-demand, not during critical onboarding

---

## 🐛 Troubleshooting

**Error: "GEMINI_API_KEY environment variable is required"**
- Add `GEMINI_API_KEY=your_key` to `.env`

**Error: "Failed to extract text from PDF"**
- Make sure `pdf-parse` is installed: `npm install pdf-parse`
- Only PDF and TXT files are fully supported

**Error: "relation 'projects' does not exist"**
- Run the schema enhancements: `psql ... -f schema/resume_enhancements.sql`

**Timeout during upload**
- This should be fixed! Upload now only parses, doesn't generate recommendations
- If still timing out, check Gemini API connectivity

---

## 📝 Notes

- Resume parsing uses Gemini 1.5 Flash (fast model)
- Recommendations use the same model but with more detailed prompts
- All data is stored in PostgreSQL for quick retrieval
- Recommendations are cached in DB after generation for faster subsequent access
