const express = require("express");
const router = express.Router();
const axios = require("axios");
const { optionalAuth } = require("../middleware/auth");

/**
 * @route POST /api/coding/generate
 * @desc Generate coding practice problems using Sarvam AI (sarvam-105b)
 */
router.post("/generate", optionalAuth, async (req, res) => {
    const { domain = "DSA", difficulty = "Medium", topic = "General" } = req.body;

    const apiKey = process.env.SARVAM_API_KEY;

    if (!apiKey) {
        console.warn("SARVAM_API_KEY missing in environment.");
        return res.json({ questions: getFallbackQuestions(domain, difficulty) });
    }

    const prompt = `
Generate 1 unique, real-world coding problem for domain "${domain}" and topic "${topic}" with "${difficulty}" difficulty.
IMPORTANT: The boilerplates MUST be starter code templates ONLY (e.g. "// Write your solution below"), NOT complete solutions.

Return ONLY valid JSON matching this exact structure (no markdown formatting):
{
  "questions": [
    {
      "title": "Problem Title",
      "description": "Clear problem statement and requirements...",
      "difficulty": "${difficulty}",
      "example": { "input": "...", "output": "..." },
      "testCases": [
        { "input": "...", "output": "..." },
        { "input": "...", "output": "..." }
      ],
      "boilerplates": {
        "javascript": "// Write your solution below\\nfunction solution(args) {\\n  // Your code here\\n  return res;\\n}",
        "python": "# Write your solution below\\ndef solution(args):\\n    # Your code here\\n    pass",
        "cpp": "// Write your solution below\\nclass Solution {\\npublic:\\n    // Your code here\\n};"
      }
    }
  ]
}
`;

    try {
        const response = await axios.post(
            "https://api.sarvam.ai/v1/chat/completions",
            {
                model: "sarvam-105b",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert AI coding instructor. Return ONLY valid JSON format. Do not use markdown codeblocks."
                    },
                    { role: "user", content: prompt }
                ]
            },
            {
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                timeout: 12000
            }
        );

        const content = response.data.choices?.[0]?.message?.content;
        if (content) {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
                    return res.json({ questions: parsed.questions });
                }
            }
        }

        return res.json({ questions: getFallbackQuestions(domain, difficulty) });
    } catch (err) {
        console.warn("Sarvam AI generate coding question error:", err.message);
        return res.json({ questions: getFallbackQuestions(domain, difficulty) });
    }
});

function getFallbackQuestions(domain, difficulty) {
    if (domain === "System Architecture") {
        return [{
            title: "Low-Latency Rate Limiter (Token Bucket)",
            description: "Design and implement a token bucket rate limiter class that allows up to `capacity` requests every `refillRate` seconds. Given an array of request timestamps in milliseconds, return an array of booleans indicating whether each request was accepted (`true`) or rate-limited (`false`).",
            difficulty: difficulty || "Medium",
            example: {
                input: "capacity = 3, refillRate = 1000, requests = [0, 100, 200, 300, 1100]",
                output: "[true, true, true, false, true]"
            },
            testCases: [
                { input: "3, 1000, [0, 100, 200, 300, 1100]", output: "[true, true, true, false, true]" },
                { input: "2, 500, [0, 100, 200]", output: "[true, true, false]" }
            ],
            boilerplates: {
                javascript: "// Write your solution below\nfunction solution(capacity, refillRate, requests) {\n  // Your code here\n  return [];\n}",
                python: "# Write your solution below\ndef solution(capacity, refillRate, requests):\n    # Your code here\n    return []",
                cpp: "// Write your solution below\nclass Solution {\npublic:\n    vector<bool> solution(int capacity, int refillRate, vector<int> requests) {\n        // Your code here\n        return {};\n    }\n};"
            }
        }];
    }

    if (domain === "AI Pipelines") {
        return [{
            title: "Cosine Similarity Vector Search",
            description: "Given a query embedding vector `query` and an array of candidate document vectors `docs`, compute the cosine similarity for each document vector and return the index of the top-1 most relevant document.",
            difficulty: difficulty || "Medium",
            example: {
                input: "query = [1, 0, 1], docs = [[1, 0, 1], [0, 1, 0], [1, 1, 0]]",
                output: "0"
            },
            testCases: [
                { input: "[1, 0, 1], [[1, 0, 1], [0, 1, 0]]", output: "0" }
            ],
            boilerplates: {
                javascript: "// Write your solution below\nfunction solution(query, docs) {\n  // Your code here\n  return 0;\n}",
                python: "# Write your solution below\ndef solution(query, docs):\n    # Your code here\n    return 0",
                cpp: "// Write your solution below\nclass Solution {\npublic:\n    int solution(vector<float> query, vector<vector<float>> docs) {\n        return 0;\n    }\n};"
            }
        }];
    }

    // Default DSA Fallback
    return [{
        title: "LRU Cache Memory Management",
        description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache with fixed `capacity`. Implement `get(key)` and `put(key, value)` with O(1) average time complexity.",
        difficulty: difficulty || "Medium",
        example: {
            input: "capacity = 2, actions = ['put(1,1)', 'put(2,2)', 'get(1)']",
            output: "[null, null, 1]"
        },
        testCases: [
            { input: "2, ['put(1,1)', 'put(2,2)', 'get(1)']", output: "[null, null, 1]" }
        ],
        boilerplates: {
            javascript: "// Write your solution below\nfunction solution(capacity, actions) {\n  // Your code here\n  return [];\n}",
            python: "# Write your solution below\ndef solution(capacity, actions):\n    # Your code here\n    return []",
            cpp: "// Write your solution below\nclass Solution {\npublic:\n    vector<int> solution(int capacity, vector<string> actions) {\n        // Your code here\n        return {};\n    }\n};"
        }
    }];
}

module.exports = router;
