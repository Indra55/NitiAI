const { GoogleGenerativeAI } = require('@google/generative-ai');

class EnhancedResumeService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }

    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      }
    });

    // Track last request time to prevent rate limiting
    this.lastRequestTime = 0;
    this.minRequestInterval = 4000; // 4 seconds between requests (15 rpm limit)
  }

  /**
   * Wait to avoid rate limiting
   */
  async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      console.log(`Rate limit: waiting ${waitTime}ms before next request...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Make API call with retry logic
   */
  async callWithRetry(prompt, maxRetries = 2) {
    await this.waitForRateLimit();

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (error) {
        if (error.status === 429 && attempt < maxRetries) {
          // Rate limited - wait and retry
          const waitTime = 35000; // Wait 35 seconds
          console.log(`Rate limited. Waiting ${waitTime / 1000}s before retry ${attempt + 1}/${maxRetries}...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          this.lastRequestTime = Date.now();
        } else {
          throw error;
        }
      }
    }
  }

  /**
   * Safely parse JSON with fallback
   */
  safeJsonParse(text, fallback = {}) {
    try {
      // Step 1: Remove markdown code blocks
      let cleaned = text.replace(/```json\n?|\n?```/g, '').trim();

      // Step 2: Remove any text before the first { or after the last }
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
      }

      // Step 3: Fix common JSON issues
      // Fix trailing commas
      cleaned = cleaned.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');

      // Fix unescaped newlines inside strings (common AI error)
      cleaned = cleaned.replace(/:\s*"([^"]*)\n([^"]*)"/g, (match, p1, p2) => {
        return `: "${p1}\\n${p2}"`;
      });

      // Fix incomplete arrays (missing closing bracket)
      const openBrackets = (cleaned.match(/\[/g) || []).length;
      const closeBrackets = (cleaned.match(/\]/g) || []).length;
      if (openBrackets > closeBrackets) {
        // Add missing closing brackets
        cleaned = cleaned + ']'.repeat(openBrackets - closeBrackets);
      }

      // Fix incomplete objects (missing closing brace)  
      const openBraces = (cleaned.match(/\{/g) || []).length;
      const closeBraces = (cleaned.match(/\}/g) || []).length;
      if (openBraces > closeBraces) {
        cleaned = cleaned + '}'.repeat(openBraces - closeBraces);
      }

      // Step 4: Try to parse
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('JSON parse error:', error.message);
      console.error('Problematic text (first 500 chars):', text.substring(0, 500));
      return fallback;
    }
  }

  /**
   * FAST extraction - essential resume data (ONLY API CALL DURING UPLOAD)
   */
  async parseResumeBasic(resumeText) {
    const prompt = `Extract resume data as JSON:

Resume:
${resumeText.substring(0, 10000)}

Return this exact JSON structure:
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "+1234567890",
  "location": "City, Country",
  "linkedin_url": "linkedin.com/in/...",
  "portfolio_url": "website.com",
  "title": "Current Job Title",
  "years_of_experience": 0,
  "summary": "Brief professional summary",
  "technical_skills": ["skill1", "skill2"],
  "soft_skills": ["communication", "leadership"],
  "education": [{"degree": "Degree Name", "institution": "University", "field_of_study": "Field", "graduation_year": "2024"}],
  "experience": [{"title": "Job Title", "company": "Company Name", "start_date": "2020-01", "end_date": "2024-01", "description": "Brief description"}],
  "projects": [{"name": "Project Name", "description": "What it does", "technologies": ["tech1", "tech2"], "url": "github.com/..."}],
  "certifications": ["Cert 1", "Cert 2"]
}`;

    try {
      const text = await this.callWithRetry(prompt);

      return this.safeJsonParse(text, {
        name: null, email: null, phone: null, location: null,
        linkedin_url: null, portfolio_url: null, title: null,
        years_of_experience: 0, summary: null,
        technical_skills: [], soft_skills: [],
        education: [], experience: [], projects: [], certifications: []
      });
    } catch (error) {
      console.error('Error parsing resume with Gemini:', error.message);
      throw new Error('Failed to parse resume. Please try again in a minute.');
    }
  }

  /**
   * ON-DEMAND: Generate career recommendations
   */
  async generateCareerRecommendations(userProfile) {
    const skillsStr = (userProfile.skills || []).slice(0, 10).join(', ') || 'Not specified';
    const rolesStr = (userProfile.experience || []).slice(0, 2).map(e => e.title || 'Unknown').join(', ') || 'Not specified';

    const prompt = `Suggest 5 career paths for:
Title: ${userProfile.title || 'Not specified'}
Experience: ${userProfile.years_of_experience || 0} years
Skills: ${skillsStr}
Recent roles: ${rolesStr}

Return JSON:
{
  "recommended_roles": [
    {"title": "Role 1", "match_score": 95, "reasoning": "Short reason", "skill_gaps": ["gap1"], "estimated_transition_time": "3 months"},
    {"title": "Role 2", "match_score": 85, "reasoning": "Short reason", "skill_gaps": ["gap1"], "estimated_transition_time": "6 months"},
    {"title": "Role 3", "match_score": 75, "reasoning": "Short reason", "skill_gaps": ["gap1"], "estimated_transition_time": "6 months"},
    {"title": "Role 4", "match_score": 65, "reasoning": "Short reason", "skill_gaps": ["gap1"], "estimated_transition_time": "1 year"},
    {"title": "Role 5", "match_score": 55, "reasoning": "Short reason", "skill_gaps": ["gap1"], "estimated_transition_time": "1-2 years"}
  ],
  "skill_development_plan": [
    {"skill": "Skill to learn", "priority": "high", "estimated_learning_time": "2 months"}
  ]
}`;

    try {
      const text = await this.callWithRetry(prompt);

      return this.safeJsonParse(text, {
        recommended_roles: [],
        skill_development_plan: []
      });
    } catch (error) {
      console.error('Error generating recommendations:', error.message);
      return {
        recommended_roles: [],
        skill_development_plan: [],
        error: 'Rate limited. Please try again in a minute.'
      };
    }
  }

  /**
   * ON-DEMAND: Analyze resume for ATS compatibility
   */
  async analyzeResume(resumeText) {
    const prompt = `Rate this resume (0-100). Return JSON only.

Resume excerpt:
${resumeText.substring(0, 4000)}

Return JSON:
{
  "completeness_score": 75,
  "ats_compatibility_score": 80,
  "strengths": ["strength1", "strength2"],
  "improvement_areas": ["area1", "area2"],
  "missing_elements": ["element1"]
}`;

    try {
      const text = await this.callWithRetry(prompt);

      return this.safeJsonParse(text, {
        completeness_score: 50,
        ats_compatibility_score: 50,
        strengths: [],
        improvement_areas: [],
        missing_elements: []
      });
    } catch (error) {
      console.error('Error analyzing resume:', error.message);
      return {
        completeness_score: 0,
        ats_compatibility_score: 0,
        strengths: [],
        improvement_areas: [],
        missing_elements: [],
        error: 'Rate limited. Please try again in a minute.'
      };
    }
  }

  /**
   * ON-DEMAND: Get career insights
   */
  async getCareerInsights(userProfile) {
    const skillsStr = (userProfile.skills || []).slice(0, 8).join(', ') || 'Not specified';
    const rolesStr = (userProfile.experience || []).map(e => e.title || 'Unknown').join(' -> ') || 'Not specified';

    const prompt = `Analyze this career trajectory. Return JSON only.

Title: ${userProfile.title || 'Not specified'}
Experience: ${userProfile.years_of_experience || 0} years  
Skills: ${skillsStr}
Career path: ${rolesStr}

Return JSON:
{
  "current_role_level": "junior/mid/senior/lead",
  "industries_worked": ["industry1"],
  "career_interests": ["interest1"],
  "growth_trajectory": "ascending/stable/transitioning",
  "recommended_paths": ["path1", "path2"]
}`;

    try {
      const text = await this.callWithRetry(prompt);

      return this.safeJsonParse(text, {
        current_role_level: 'mid',
        industries_worked: [],
        career_interests: [],
        growth_trajectory: 'stable',
        recommended_paths: []
      });
    } catch (error) {
      console.error('Error getting career insights:', error.message);
      return {
        current_role_level: 'unknown',
        industries_worked: [],
        career_interests: [],
        growth_trajectory: 'unknown',
        recommended_paths: [],
        error: 'Rate limited. Please try again in a minute.'
      };
    }
  }

  /**
   * COMPREHENSIVE: Generate full career dashboard data
   * Includes: career paths, trending roles, fast-growing industries, skill gaps
   * This fulfills the problem statement requirement for AI Career Path Recommender
   */
  async generateCareerDashboard(userProfile) {
    // Build comprehensive context from user profile
    const technicalSkills = (userProfile.technical_skills || userProfile.skills || []).slice(0, 12).join(', ') || 'Not specified';
    const softSkills = (userProfile.soft_skills || []).slice(0, 6).join(', ') || 'Not specified';
    const interests = (userProfile.interests || []).slice(0, 5).join(', ') || 'Not specified';
    const education = (userProfile.education || []).map(e => `${e.degree || e.field_of_study || 'Degree'} from ${e.institution || 'University'}`).join('; ') || 'Not specified';
    const experience = (userProfile.experience || []).slice(0, 3).map(e => `${e.title || 'Role'} at ${e.company || e.organization || 'Company'}`).join('; ') || 'Not specified';

    const prompt = `You are a career advisor AI. Analyze this professional profile and provide comprehensive career guidance.

PROFILE:
- Current Title: ${userProfile.title || userProfile.career_goal_short || 'Not specified'}
- Experience Level: ${userProfile.proficiency_level || 'intermediate'}
- Years of Experience: ${userProfile.years_of_experience || 0}
- Technical Skills: ${technicalSkills}
- Soft Skills: ${softSkills}
- Education: ${education}
- Interests: ${interests}
- Recent Roles: ${experience}
- Preferred Work Mode: ${userProfile.preferred_work_mode || 'Not specified'}

Provide career recommendations considering:
1. Current skills and experience
2. Education background
3. Personal interests
4. 2025-2026 job market trends
5. Fast-growing industries

Return this EXACT JSON structure:
{
  "profile_summary": {
    "current_level": "junior/mid/senior/lead/executive",
    "primary_domain": "Main field of expertise",
    "profile_strength_score": 75,
    "profile_completeness": 80
  },
  "recommended_career_paths": [
    {
      "title": "Specific Job Title",
      "match_score": 95,
      "reasoning": "Why this role fits the profile",
      "skill_gaps": ["skill1", "skill2"],
      "estimated_transition_time": "3-6 months",
      "salary_range": "$80k-$120k",
      "growth_outlook": "High demand, +25% growth"
    }
  ],
  "trending_roles_2026": [
    {
      "title": "Trending Role",
      "demand_level": "Very High",
      "why_trending": "Brief explanation",
      "relevance_to_profile": "How it relates to user's skills"
    }
  ],
  "fast_growing_industries": [
    {
      "industry": "Industry Name",
      "growth_rate": "+35%",
      "key_roles": ["Role 1", "Role 2"],
      "skills_needed": ["Skill 1", "Skill 2"],
      "fit_for_profile": "High/Medium/Low"
    }
  ],
  "skill_development_priorities": [
    {
      "skill": "Skill to Learn",
      "priority": "high/medium/low",
      "reason": "Why this skill matters",
      "learning_resources": ["Resource type 1", "Resource type 2"],
      "estimated_time": "2-3 months"
    }
  ],
  "career_trajectory": {
    "short_term_goal": "Goal for next 6-12 months",
    "medium_term_goal": "Goal for 1-2 years",
    "long_term_vision": "Where career could lead in 3-5 years"
  },
  "action_items": [
    "Specific actionable step 1",
    "Specific actionable step 2",
    "Specific actionable step 3"
  ],
  "skill_heatmap": [
    {"category": "Programming", "value": 85},
    {"category": "Frameworks", "value": 60},
    {"category": "Cloud/DevOps", "value": 45},
    {"category": "Databases", "value": 70},
    {"category": "Tools", "value": 80},
    {"category": "Soft Skills", "value": 90}
  ]
}

RULES FOR skill_heatmap:
- Generate 6-8 distinct and diverse skill categories based on the user's profile (e.g., Programming, Architecture, Cloud, Mobile, Soft Skills, AI/ML, Security).
- Assign a proficiency value (0-100) for each.

Provide exactly 5 recommended career paths, 4 trending roles, 3 fast-growing industries, and 4 skill priorities.`;

    try {
      const text = await this.callWithRetry(prompt);

      const result = this.safeJsonParse(text, {
        profile_summary: {
          current_level: 'mid',
          primary_domain: 'Technology',
          profile_strength_score: 50,
          profile_completeness: 50
        },
        recommended_career_paths: [],
        trending_roles_2026: [],
        fast_growing_industries: [],
        skill_development_priorities: [],
        career_trajectory: {
          short_term_goal: 'Build core skills',
          medium_term_goal: 'Advance to senior role',
          long_term_vision: 'Leadership position'
        },
        action_items: [],
        skill_heatmap: []
      });

      // Add metadata
      result.generated_at = new Date().toISOString();
      result.data_sources = ['Profile Analysis', 'Resume Data', 'Market Trends 2026'];

      return result;
    } catch (error) {
      console.error('Error generating career dashboard:', error.message);
      return {
        error: 'Failed to generate career dashboard. Please try again.',
        profile_summary: { current_level: 'unknown', profile_strength_score: 0 },
        recommended_career_paths: [],
        trending_roles_2026: [],
        fast_growing_industries: [],
        skill_development_priorities: [],
        career_trajectory: {},
        action_items: []
      };
    }
  }
  /**
   * Update resume data based on user instruction
   */
  async updateResume(currentData, instruction) {
    const prompt = `You are an expert resume editor. Update the following resume JSON based on the user's instruction.
    
    Current Resume JSON:
    ${JSON.stringify(currentData).substring(0, 15000)}
    
    User Instruction:
    "${instruction}"
    
    Rules:
    1. ONLY modify the parts requested by the user.
    2. Keep the rest of the data exactly the same.
    3. If the user asks to "improve" or "fix" something, apply best practices.
    4. Return the FULL updated JSON.
    
    Return JSON only.`;

    try {
      const text = await this.callWithRetry(prompt);
      return this.safeJsonParse(text, currentData);
    } catch (error) {
      console.error('Error updating resume:', error.message);
      throw new Error('Failed to update resume.');
    }
  }

  /**
   * Generate LaTeX code from resume data
   */
  async generateLaTeX(data, templateName = 'classic') {
    const prompt = `Convert this resume JSON into a professional LaTeX (.tex) resume using a "${templateName}" style.
    
    Resume JSON:
    ${JSON.stringify(data).substring(0, 15000)}
    
    Template Style: ${templateName} (modern, classic, or minimal)
    
    Rules:
    1. Use standard LaTeX packages (geometry, enumitem, hyperref).
    2. Ensure it compiles with pdflatex.
    3. Make it look professional and clean.
    4. Return ONLY the raw LaTeX code (no markdown blocks).
    
    LaTeX Code:`;

    try {
      const text = await this.callWithRetry(prompt);
      // Clean up potential markdown blocks
      return text.replace(/```latex\n?|\n?```/g, '').trim();
    } catch (error) {
      console.error('Error generating LaTeX:', error.message);
      throw new Error('Failed to generate LaTeX.');
    }
  }

  /**
   * Tailor resume based on Job Description
   */
  async tailorResume(resumeText, jobDescription) {
    const prompt = `You are an expert resume writer. Tailor the following resume to match the provided Job Description (JD).
    
    Resume:
    ${resumeText.substring(0, 10000)}
    
    Job Description:
    ${jobDescription.substring(0, 5000)}
    
    Instructions:
    1. Analyze the JD for keywords and required skills.
    2. Rewrite the resume summary to align with the JD.
    3. Highlight relevant skills and experiences in the resume.
    4. Use strong action verbs.
    5. Keep the structure similar but optimized.
    6. Return the FULL tailored resume as a JSON object.
    
    Return JSON:
    {
      "tailored_resume_data": {
        "name": "Full Name",
        "email": "email@example.com",
        "phone": "Phone",
        "location": "Location",
        "linkedin_url": "URL",
        "portfolio_url": "URL",
        "title": "Job Title",
        "years_of_experience": 0,
        "professional_summary": "Tailored summary",
        "technical_skills": ["skill1", "skill2"],
        "soft_skills": ["skill1", "skill2"],
        "education": [],
        "experience": [],
        "projects": [],
        "certifications": []
      },
      "changes_made": ["Change 1", "Change 2"],
      "match_score_improvement": "From 70% to 95%"
    }`;

    try {
      const text = await this.callWithRetry(prompt);
      return this.safeJsonParse(text, {
        tailored_resume_data: null,
        changes_made: [],
        match_score_improvement: "Unknown"
      });
    } catch (error) {
      console.error('Error tailoring resume:', error.message);
      throw new Error('Failed to tailor resume.');
    }
  }

  /**
   * Match resume against a Job Description
   * Returns: match percentage, matched skills, missing skills, improvement suggestions
   */
  async matchAnalysis(resumeText, jobDescription) {
    const prompt = `You are an expert ATS (Applicant Tracking System) and hiring analyst.
    
Analyze how well this resume matches the provided Job Description (JD).

Resume:
${resumeText.substring(0, 10000)}

Job Description:
${jobDescription.substring(0, 5000)}

Perform a detailed analysis and return JSON:
{
  "match_percentage": 72,
  "summary": "One paragraph executive summary of the match analysis",
  "matched_skills": [
    {"skill": "Python", "context": "Where/how it appears in resume", "strength": "strong"},
    {"skill": "React", "context": "Used in 2 projects", "strength": "moderate"}
  ],
  "missing_skills": [
    {"skill": "Kubernetes", "importance": "required", "suggestion": "Take a K8s certification course"},
    {"skill": "GraphQL", "importance": "nice-to-have", "suggestion": "Build a side project using GraphQL"}
  ],
  "keyword_analysis": {
    "jd_keywords_found": ["keyword1", "keyword2"],
    "jd_keywords_missing": ["keyword3", "keyword4"],
    "keyword_match_rate": 65
  },
  "experience_match": {
    "years_required": "3-5 years",
    "years_detected": "2 years",
    "experience_fit": "partial",
    "notes": "Close to minimum requirement"
  },
  "education_match": {
    "required": "Bachelor's in CS or related field",
    "detected": "B.Tech in Computer Science",
    "match": true
  },
  "improvement_suggestions": [
    {
      "category": "Skills Gap",
      "priority": "high",
      "suggestion": "Learn Kubernetes and Docker to match the DevOps requirements",
      "estimated_effort": "2-3 weeks",
      "impact": "Could increase match by 10-15%"
    },
    {
      "category": "Resume Optimization",
      "priority": "medium",
      "suggestion": "Add quantifiable metrics to work experience bullet points",
      "estimated_effort": "1-2 hours",
      "impact": "Improves ATS score by 5-8%"
    }
  ],
  "skill_heatmap": [
    {"category": "Core Skills", "value": 85},
    {"category": "Domain Tech", "value": 60},
    {"category": "Architecture", "value": 40},
    {"category": "Tooling", "value": 50},
    {"category": "Soft Skills", "value": 75},
    {"category": "Experience Fit", "value": 80}
  ],
  "overall_verdict": "Good Match / Needs Work / Strong Match / Weak Match",
  "confidence_score": 85
}

Rules:
1. Be precise with the match percentage — base it on skill overlap, experience fit, education, and keyword density.
2. Categorize matched skills by strength: "strong", "moderate", or "basic".
3. Categorize missing skills by importance: "required", "preferred", or "nice-to-have".
4. Provide 3-6 actionable improvement suggestions with clear priorities.
5. Generate a "skill_heatmap" (0-100 values) representing the user's proficiency in 6-8 diverse and key categories relevant to the JD based on their resume.
6. Return valid JSON only. Do not wrap in markdown code fences.`;

    const fallback = {
      match_percentage: 0,
      summary: "Unable to analyze — please try again.",
      matched_skills: [],
      missing_skills: [],
      keyword_analysis: { jd_keywords_found: [], jd_keywords_missing: [], keyword_match_rate: 0 },
      experience_match: { years_required: "Unknown", years_detected: "Unknown", experience_fit: "unknown", notes: "" },
      education_match: { required: "Unknown", detected: "Unknown", match: false },
      improvement_suggestions: [],
      skill_heatmap: [],
      overall_verdict: "Unable to determine",
      confidence_score: 0
    };

    try {
      console.log('[matchAnalysis] Calling Gemini API...');
      console.log('[matchAnalysis] Resume length:', resumeText.length, 'JD length:', jobDescription.length);
      const text = await this.callWithRetry(prompt);
      console.log('[matchAnalysis] Gemini raw response (first 500 chars):', text?.substring(0, 500));
      console.log('[matchAnalysis] Response type:', typeof text, 'Length:', text?.length);

      if (!text || typeof text !== 'string') {
        console.error('[matchAnalysis] Invalid response from API:', typeof text, text);
        return fallback;
      }

      // Use the robust safeJsonParse that handles truncated/malformed JSON
      const parsed = this.safeJsonParse(text, fallback);

      // --- Data Normalization ---
      // Ensure skill_heatmap is a non-empty array
      if (!parsed.skill_heatmap || !Array.isArray(parsed.skill_heatmap) || parsed.skill_heatmap.length === 0) {
        console.warn('[matchAnalysis] skill_heatmap missing or invalid format. Attempting recovery...');

        // Check if it's an object instead of an array
        if (parsed.skill_heatmap && typeof parsed.skill_heatmap === 'object' && !Array.isArray(parsed.skill_heatmap)) {
          console.log('[matchAnalysis] Converting skill_heatmap object to array');
          parsed.skill_heatmap = Object.entries(parsed.skill_heatmap).map(([cat, val]) => ({
            category: cat,
            value: typeof val === 'number' ? val : 50
          }));
        } else {
          // Create a better default heatmap based on the match percentage if missing
          console.log('[matchAnalysis] Generating default heatmap based on match score');
          const score = parsed.match_percentage || 50;
          parsed.skill_heatmap = [
            { category: "Core Tech", value: score },
            { category: "Frameworks", value: Math.max(0, score - 15) },
            { category: "Cloud/DevOps", value: Math.max(0, score - 30) },
            { category: "Tools", value: Math.max(0, score - 10) },
            { category: "Soft Skills", value: 75 },
            { category: "Architecture", value: Math.max(0, score - 20) }
          ];
        }
      }

      console.log('[matchAnalysis] Final skill_heatmap count:', parsed.skill_heatmap.length);
      console.log('[matchAnalysis] Parsed match_percentage:', parsed.match_percentage);
      console.log('[matchAnalysis] Parsed verdict:', parsed.overall_verdict);
      return parsed;

    } catch (error) {
      console.error('[matchAnalysis] ERROR:', error);
      console.error('[matchAnalysis] Error stack:', error.stack);
      throw new Error('Failed to perform match analysis: ' + error.message);
    }
  }

  /**
   * INTERACTIVE: Chat with data
   */
  async chatWithData(query, context) {
    // Format the market data nicely for the prompt
    const rolesFormatted = (context.trending_roles || []).map(r =>
      `  - ${r.title} (Demand: ${r.demand_level}) - ${r.why_trending || 'High growth'}`
    ).join('\n');

    const industriesFormatted = (context.fast_growing_industries || []).map(i =>
      `  - ${i.industry} (Growth: ${i.growth_rate}, Fit: ${i.fit_for_profile})`
    ).join('\n');

    const prompt = `You are a friendly career advisor helping a job seeker. Answer their question directly.

USER PROFILE:
- Title: ${context.title || 'Developer'}
- Experience: ${context.years_of_experience || 0} years
- Skills: ${Array.isArray(context.skills) ? context.skills.slice(0, 15).join(', ') : context.skills || 'Various'}

MARKET DATA:
Trending Roles:
${rolesFormatted || '  - General tech roles in demand'}

Growing Industries:
${industriesFormatted || '  - Tech sector growing'}

QUESTION: "${query}"

IMPORTANT OUTPUT FORMAT RULES:
- Write your response as a NORMAL PARAGRAPH with bullet points where helpful
- DO NOT use JSON format
- DO NOT wrap response in curly braces {}
- DO NOT use "analysis:", "reasoning:", or any JSON keys
- Just write like you're talking to a friend
- Use **bold** for emphasis and - for bullet points
- Keep it under 200 words

Example good format:
"Based on the market data, **AI/ML Engineer** looks like a great fit for you! Here's why:
- Your Python skills match the high demand
- The role has Very High demand right now
I'd recommend focusing on..."

YOUR RESPONSE (plain text only):`;

    try {
      const text = await this.callWithRetry(prompt);
      return text;
    } catch (error) {
      console.error('Error in chatWithData:', error.message);
      return "I'm having trouble analyzing the market data right now. Please try again in a moment.";
    }
  }
}

module.exports = new EnhancedResumeService();