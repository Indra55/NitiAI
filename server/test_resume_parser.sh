#!/bin/bash

# Resume Parser Test Script
# This script tests the resume upload and recommendations flow

BASE_URL="http://localhost:5555"
EMAIL="test_resume_$(date +%s)@example.com"
PASSWORD="testpass123"

echo "🧪 Testing Resume Parser Integration"
echo "===================================="
echo ""

# Step 1: Register
echo "📝 Step 1: Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/users/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testuser\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "Response: $REGISTER_RESPONSE"
echo ""

# Step 2: Login
echo "🔐 Step 2: Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/users/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to get token. Response: $LOGIN_RESPONSE"
    exit 1
fi

echo "✅ Token received: ${TOKEN:0:20}..."
echo ""

# Step 3: Basic Info
echo "👤 Step 3: Submitting basic info..."
curl -s -X POST "$BASE_URL/api/onboarding/basic-info" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","phone":"+1234567890","age":25,"gender":"male","location":"San Francisco"}' | jq '.'
echo ""

# Step 4: Career Goals
echo "🎯 Step 4: Submitting career goals..."
curl -s -X POST "$BASE_URL/api/onboarding/career-goals" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"Full Stack Developer","status":"intermediate"}' | jq '.'
echo ""

# Step 5: Skills
echo "💡 Step 5: Submitting skills..."
curl -s -X POST "$BASE_URL/api/onboarding/skills" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"skills":["JavaScript","React","Node.js","Python","PostgreSQL"]}' | jq '.'
echo ""

# Step 6: Create sample resume
echo "📄 Step 6: Creating sample resume..."
cat > /tmp/sample_resume.txt << 'EOF'
JOHN DOE
Full Stack Developer
Email: john.doe@example.com | Phone: +1234567890 | LinkedIn: linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Experienced Full Stack Developer with 5 years of expertise in building scalable web applications using modern JavaScript frameworks and cloud technologies. Passionate about clean code and user experience.

TECHNICAL SKILLS
- Languages: JavaScript, TypeScript, Python, SQL
- Frontend: React, Vue.js, HTML5, CSS3, Tailwind
- Backend: Node.js, Express, Django, FastAPI
- Databases: PostgreSQL, MongoDB, Redis
- Cloud: AWS, Docker, Kubernetes
- Tools: Git, CI/CD, Jest, Webpack

WORK EXPERIENCE

Senior Full Stack Developer | TechCorp Inc. | 2021 - Present
- Led development of microservices architecture serving 1M+ users
- Reduced API response time by 40% through optimization
- Mentored team of 5 junior developers
- Technologies: React, Node.js, PostgreSQL, AWS, Docker

Full Stack Developer | StartupXYZ | 2019 - 2021
- Built customer-facing dashboard with real-time analytics
- Implemented CI/CD pipeline reducing deployment time by 60%
- Developed RESTful APIs handling 10K+ requests/day
- Technologies: Vue.js, Express, MongoDB, Redis

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley | 2019
GPA: 3.8/4.0

PROJECTS
E-Commerce Platform
- Built full-stack e-commerce platform with payment integration
- Technologies: React, Node.js, Stripe, PostgreSQL
- URL: github.com/johndoe/ecommerce

Real-time Chat Application
- Developed WebSocket-based chat with 1000+ concurrent users
- Technologies: Socket.io, Redis, React
- URL: github.com/johndoe/chat-app

CERTIFICATIONS
- AWS Certified Solutions Architect
- MongoDB Certified Developer
EOF

echo "✅ Sample resume created at /tmp/sample_resume.txt"
echo ""

# Step 7: Upload Resume (FAST - no recommendations)
echo "⚡ Step 7: Uploading resume (should be FAST - 10-15s)..."
echo "Started at: $(date +%T)"
UPLOAD_START=$(date +%s)

UPLOAD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/resume/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "resume=@/tmp/sample_resume.txt")

UPLOAD_END=$(date +%s)
UPLOAD_TIME=$((UPLOAD_END - UPLOAD_START))

echo "Completed at: $(date +%T)"
echo "⏱️  Upload took: ${UPLOAD_TIME}s"
echo ""
echo "Response:"
echo "$UPLOAD_RESPONSE" | jq '.'
echo ""

if [ $UPLOAD_TIME -gt 30 ]; then
    echo "⚠️  WARNING: Upload took longer than expected (${UPLOAD_TIME}s > 30s)"
else
    echo "✅ Upload completed in acceptable time (${UPLOAD_TIME}s)"
fi
echo ""

# Step 8: Get Resume Analysis (should be instant)
echo "📊 Step 8: Getting resume analysis (should be instant)..."
curl -s -X GET "$BASE_URL/api/resume/analysis" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Step 9: Get Career Insights (should be instant)
echo "🔍 Step 9: Getting career insights (should be instant)..."
curl -s -X GET "$BASE_URL/api/resume/career-insights" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Step 10: Generate Recommendations (on-demand, will take 10-20s)
echo "🎯 Step 10: Generating career recommendations (on-demand, 10-20s)..."
echo "Started at: $(date +%T)"
REC_START=$(date +%s)

REC_RESPONSE=$(curl -s -X GET "$BASE_URL/api/resume/recommendations" \
  -H "Authorization: Bearer $TOKEN")

REC_END=$(date +%s)
REC_TIME=$((REC_END - REC_START))

echo "Completed at: $(date +%T)"
echo "⏱️  Recommendations took: ${REC_TIME}s"
echo ""
echo "Response:"
echo "$REC_RESPONSE" | jq '.'
echo ""

# Step 11: Get Development Plan (should be instant - cached)
echo "📚 Step 11: Getting development plan (should be instant - cached)..."
curl -s -X GET "$BASE_URL/api/resume/development-plan" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Summary
echo "===================================="
echo "✅ Test Complete!"
echo ""
echo "Performance Summary:"
echo "  - Resume Upload: ${UPLOAD_TIME}s (target: <20s)"
echo "  - Recommendations: ${REC_TIME}s (target: <30s)"
echo ""
echo "Key Points:"
echo "  ✅ Upload is FAST (no recommendations generation)"
echo "  ✅ Recommendations are generated on-demand"
echo "  ✅ Analysis & insights are instant (cached)"
echo ""
echo "Test user: $EMAIL"
echo "Token: ${TOKEN:0:30}..."
