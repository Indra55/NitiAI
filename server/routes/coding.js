const express = require("express");
const router = express.Router();
const sarvamService = require("../services/sarvamService");
const pool = require("../config/dbConfig");
const { optionalAuth } = require("../middleware/auth");

/**
 * @route POST /api/coding/generate
 * @desc Generate famous LeetCode questions tailored to candidate's level, resume, and career goals.
 * @access Public / OptionalAuth
 */
router.post("/generate", optionalAuth, async (req, res) => {
    try {
        const { domain = "DSA", difficulty = "Medium", topic = "General" } = req.body;
        let userId = req.user?.id;
        let candidateProfile = "Candidate Level: Intermediate. Stack: General Engineering.";

        // Fetch candidate profile & roadmap from DB
        try {
            let userExtra = {};
            if (userId) {
                const userRes = await pool.query(
                    `SELECT proficiency_level, career_goal_short, career_goal_long FROM users WHERE id = $1`,
                    [userId]
                );
                if (userRes.rows.length > 0) userExtra = userRes.rows[0];
            }

            const resumeRes = await pool.query(
                `SELECT professional_title, technical_skills, professional_summary FROM resume_info ${userId ? 'WHERE user_id = $1' : ''} ORDER BY updated_at DESC LIMIT 1`,
                userId ? [userId] : []
            );

            if (resumeRes.rows.length > 0) {
                const r = resumeRes.rows[0];
                candidateProfile = `
Candidate Level: ${userExtra.proficiency_level || 'Intermediate'}
Title: ${r.professional_title || 'Software Engineer'}
Skills: ${Array.isArray(r.technical_skills) ? r.technical_skills.join(', ') : r.technical_skills || ''}
Career Goal: ${userExtra.career_goal_short || 'Fullstack & Systems Engineering'}
Summary: ${r.professional_summary || ''}
`.trim();
            }
        } catch (dbErr) {
            console.warn("DB user profile lookup for coding generator skipped:", dbErr.message);
        }

        const prompt = `You are a technical interview problem setter specializing in famous LeetCode algorithmic and systems challenges.

CANDIDATE PROFILE:
${candidateProfile}

REQUEST PARAMETERS:
- Domain: ${domain}
- Topic: ${topic}
- Target Difficulty: ${difficulty}

INSTRUCTIONS:
Generate 2 famous LeetCode-style coding questions for the topic "${topic}" (${domain} domain) matching difficulty "${difficulty}".
Each question MUST align with the candidate's proficiency level and tech stack.

For each problem provide:
1. title: Clear LeetCode-style title (e.g. "LeetCode 146 - LRU Cache", "LeetCode 3 - Longest Substring")
2. description: Full problem description with technical constraints and input/output parameters.
3. difficulty: "${difficulty}"
4. example: An object with { "input": "...", "output": "..." }
5. testCases: Array of at least 3 test case objects { "input": "...", "output": "..." }
6. boilerplates: Object containing complete starter function templates for "javascript", "python", and "cpp".

RESPONSE FORMAT:
Return ONLY valid JSON (no markdown block, no extra text):
{
  "questions": [
    {
      "title": "...",
      "description": "...",
      "difficulty": "${difficulty}",
      "example": { "input": "...", "output": "..." },
      "testCases": [
        { "input": "...", "output": "..." },
        { "input": "...", "output": "..." },
        { "input": "...", "output": "..." }
      ],
      "boilerplates": {
        "javascript": "function solution(...) {\n  // Write code here\n};",
        "python": "def solution(...):\n    pass",
        "cpp": "class Solution {\npublic:\n    vector<int> solution(...) {\n        return {};\n    }\n};"
      }
    }
  ]
}`;

        const rawOutput = await sarvamService.generateCompletion(prompt, { temperature: 0.2 });
        let cleanJson = rawOutput.replace(/```json\n?|\n?```/g, '').trim();
        const firstBrace = cleanJson.indexOf('{');
        const lastBrace = cleanJson.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
        }

        const parsed = JSON.parse(cleanJson);
        if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
            return res.json(parsed);
        }

        throw new Error("Invalid questions structure returned by AI");
    } catch (error) {
        console.error("Error generating coding questions via Sarvam AI:", error.message);
        res.json({
            questions: [
                {
                    title: "LeetCode 146 - LRU Cache",
                    description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement get(key) and put(key, value) in O(1) time complexity.",
                    difficulty: "Medium",
                    example: { input: "capacity = 2, actions = ['put(1,1)', 'put(2,2)', 'get(1)']", output: "[null, null, 1]" },
                    testCases: [
                        { input: "2, ['put(1,1)', 'put(2,2)', 'get(1)']", output: "[null, null, 1]" },
                        { input: "1, ['put(1,1)', 'put(2,2)', 'get(1)', 'get(2)']", output: "[null, null, -1, 2]" }
                    ],
                    boilerplates: {
                        javascript: "function LRUCache(capacity) {\n  // Write your LRU Cache implementation\n};",
                        python: "class LRUCache:\n    def __init__(self, capacity: int):\n        pass",
                        cpp: "class LRUCache {\npublic:\n    LRUCache(int capacity) {}\n};"
                    }
                },
                {
                    title: "LeetCode 3 - Longest Substring Without Repeating Characters",
                    description: "Given a string s, find the length of the longest substring without repeating characters.",
                    difficulty: "Medium",
                    example: { input: "s = \"abcabcbb\"", output: "3" },
                    testCases: [
                        { input: "abcabcbb", output: "3" },
                        { input: "bbbbb", output: "1" },
                        { input: "pwwkew", output: "3" }
                    ],
                    boilerplates: {
                        javascript: "function lengthOfLongestSubstring(s) {\n  // Write code here\n};",
                        python: "def lengthOfLongestSubstring(s: str) -> int:\n    pass",
                        cpp: "int lengthOfLongestSubstring(string s) {\n    return 0;\n}"
                    }
                }
            ]
        });
    }
});

module.exports = router;
