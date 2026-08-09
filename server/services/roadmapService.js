const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI (using Google's Gemini instead of OpenAI for this implementation)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Generate personalized career roadmap based on user profile
 * @param {Object} userProfile - User's career data
 * @returns {Object} Generated roadmap with milestones and tasks
 */
async function generateRoadmap(userProfile) {
    const { career_goal, proficiency_level, skills, experience_years } = userProfile;

    const prompt = `You are an expert career coach creating a personalized learning roadmap.

USER PROFILE:
- Career Goal: ${career_goal || 'Software Engineer'}
- Current Level: ${proficiency_level || 'beginner'}
- Current Skills: ${skills && skills.length > 0 ? skills.join(', ') : 'None specified'}
- Experience: ${experience_years || 0} years

TASK:
Create a comprehensive learning roadmap with 3-4 major milestones, each containing 3-5 actionable tasks.
The roadmap should be tailored to the user's current level and help them achieve their career goal.

REQUIREMENTS:
- Milestones should be sequential and build upon each other
- Tasks should be specific, measurable, and achievable
- Include realistic time estimates (in hours)
- Assign appropriate difficulty levels based on user's proficiency
- Create logical dependencies between tasks
- Include a mix of learning, projects, and practice tasks

OUTPUT FORMAT (JSON):
{
  "title": "Clear, motivating roadmap title",
  "description": "Brief overview of the roadmap",
  "estimated_total_hours": 120,
  "milestones": [
    {
      "title": "Milestone title",
      "description": "What this phase achieves",
      "sequence_order": 1,
      "tasks": [
        {
          "title": "Task title",
          "description": "Detailed description",
          "category": "learning|project|practice|reading",
          "priority": "low|medium|high|critical",
          "difficulty": "beginner|intermediate|advanced",
          "estimated_hours": 10,
          "deadline_days_from_start": 7,
          "sequence_order": 1,
          "resources": ["url1", "url2"],
          "prerequisite_task_indices": [0, 1]
        }
      ]
    }
  ]
}

Generate the roadmap now:`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from response (handle markdown code blocks)
        let jsonText = text;
        const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/);
        if (jsonMatch) {
            jsonText = jsonMatch[1];
        } else {
            // Try to find JSON object directly
            const objectMatch = text.match(/\{[\s\S]*\}/);
            if (objectMatch) {
                jsonText = objectMatch[0];
            }
        }

        const roadmapData = JSON.parse(jsonText);
        return roadmapData;
    } catch (error) {
        console.error("AI Roadmap Generation Error:", error);

        // Fallback: Generate a basic roadmap based on user level
        return generateFallbackRoadmap(userProfile);
    }
}

/**
 * Fallback roadmap generator if AI fails
 */
function generateFallbackRoadmap(userProfile) {
    const { career_goal, proficiency_level } = userProfile;
    const goal = career_goal || "Software Engineer";
    const level = proficiency_level || "beginner";

    const roadmaps = {
        beginner: {
            title: `${goal} - Beginner to Proficient Path`,
            description: "Build strong fundamentals and create your first projects",
            estimated_total_hours: 200,
            milestones: [
                {
                    title: "Programming Fundamentals",
                    description: "Master core programming concepts",
                    sequence_order: 1,
                    tasks: [
                        {
                            title: "Complete Programming Basics Course",
                            description: "Learn variables, loops, conditions, functions",
                            category: "learning",
                            priority: "high",
                            difficulty: "beginner",
                            estimated_hours: 40,
                            deadline_days_from_start: 14,
                            sequence_order: 1,
                            resources: ["https://www.codecademy.com", "https://www.freecodecamp.org"],
                            prerequisite_task_indices: []
                        },
                        {
                            title: "Build 3 Simple Projects",
                            description: "Calculator, To-Do List, Weather App",
                            category: "project",
                            priority: "high",
                            difficulty: "beginner",
                            estimated_hours: 30,
                            deadline_days_from_start: 21,
                            sequence_order: 2,
                            resources: [],
                            prerequisite_task_indices: [0]
                        },
                        {
                            title: "Learn Git & GitHub",
                            description: "Version control basics and collaboration",
                            category: "learning",
                            priority: "medium",
                            difficulty: "beginner",
                            estimated_hours: 10,
                            deadline_days_from_start: 21,
                            sequence_order: 3,
                            resources: ["https://www.github.com"],
                            prerequisite_task_indices: []
                        }
                    ]
                },
                {
                    title: "Data Structures & Algorithms",
                    description: "Essential problem-solving skills",
                    sequence_order: 2,
                    tasks: [
                        {
                            title: "Study Arrays, Strings, Hash Maps",
                            description: "Master basic data structures",
                            category: "learning",
                            priority: "high",
                            difficulty: "intermediate",
                            estimated_hours: 25,
                            deadline_days_from_start: 35,
                            sequence_order: 1,
                            resources: ["https://leetcode.com"],
                            prerequisite_task_indices: [0, 1]
                        },
                        {
                            title: "Solve 50 Easy LeetCode Problems",
                            description: "Practice algorithmic thinking",
                            category: "practice",
                            priority: "high",
                            difficulty: "intermediate",
                            estimated_hours: 40,
                            deadline_days_from_start: 50,
                            sequence_order: 2,
                            resources: ["https://leetcode.com"],
                            prerequisite_task_indices: [3]
                        }
                    ]
                },
                {
                    title: "Portfolio Projects",
                    description: "Build impressive projects for your resume",
                    sequence_order: 3,
                    tasks: [
                        {
                            title: "Build Full-Stack Web Application",
                            description: "Create a complete web app with frontend and backend",
                            category: "project",
                            priority: "critical",
                            difficulty: "intermediate",
                            estimated_hours: 50,
                            deadline_days_from_start: 70,
                            sequence_order: 1,
                            resources: [],
                            prerequisite_task_indices: [1, 4]
                        },
                        {
                            title: "Deploy to Production",
                            description: "Learn deployment with Vercel/Heroku",
                            category: "learning",
                            priority: "high",
                            difficulty: "intermediate",
                            estimated_hours: 5,
                            deadline_days_from_start: 75,
                            sequence_order: 2,
                            resources: [],
                            prerequisite_task_indices: [5]
                        }
                    ]
                }
            ]
        },
        intermediate: {
            title: `${goal} - Intermediate to Advanced Path`,
            description: "Level up your skills with advanced concepts",
            estimated_total_hours: 180,
            milestones: [
                {
                    title: "Advanced Concepts & Architecture",
                    description: "Master system design and architecture patterns",
                    sequence_order: 1,
                    tasks: [
                        {
                            title: "Study System Design Fundamentals",
                            description: "Load balancing, caching, databases, scalability",
                            category: "learning",
                            priority: "high",
                            difficulty: "advanced",
                            estimated_hours: 30,
                            deadline_days_from_start: 20,
                            sequence_order: 1,
                            resources: ["https://github.com/donnemartin/system-design-primer"],
                            prerequisite_task_indices: []
                        },
                        {
                            title: "Build Microservices Application",
                            description: "Create app with multiple services",
                            category: "project",
                            priority: "high",
                            difficulty: "advanced",
                            estimated_hours: 60,
                            deadline_days_from_start: 40,
                            sequence_order: 2,
                            resources: [],
                            prerequisite_task_indices: [0]
                        }
                    ]
                },
                {
                    title: "Interview Preparation",
                    description: "Prepare for senior-level interviews",
                    sequence_order: 2,
                    tasks: [
                        {
                            title: "Solve 100 Medium LeetCode Problems",
                            description: "Advanced algorithmic problem solving",
                            category: "practice",
                            priority: "critical",
                            difficulty: "advanced",
                            estimated_hours: 80,
                            deadline_days_from_start: 70,
                            sequence_order: 1,
                            resources: ["https://leetcode.com"],
                            prerequisite_task_indices: []
                        },
                        {
                            title: "Practice Mock Interviews",
                            description: "10 mock technical interviews",
                            category: "practice",
                            priority: "high",
                            difficulty: "advanced",
                            estimated_hours: 10,
                            deadline_days_from_start: 75,
                            sequence_order: 2,
                            resources: [],
                            prerequisite_task_indices: [2]
                        }
                    ]
                }
            ]
        },
        advanced: {
            title: `${goal} - Expert Mastery Path`,
            description: "Become a thought leader in your domain",
            estimated_total_hours: 150,
            milestones: [
                {
                    title: "Specialization & Expertise",
                    description: "Deep dive into specialized areas",
                    sequence_order: 1,
                    tasks: [
                        {
                            title: "Master Advanced Framework/Technology",
                            description: "Become expert in cutting-edge tech",
                            category: "learning",
                            priority: "high",
                            difficulty: "advanced",
                            estimated_hours: 50,
                            deadline_days_from_start: 30,
                            sequence_order: 1,
                            resources: [],
                            prerequisite_task_indices: []
                        },
                        {
                            title: "Contribute to Open Source",
                            description: "Make significant contributions to major projects",
                            category: "project",
                            priority: "high",
                            difficulty: "advanced",
                            estimated_hours: 40,
                            deadline_days_from_start: 50,
                            sequence_order: 2,
                            resources: ["https://github.com"],
                            prerequisite_task_indices: [0]
                        }
                    ]
                },
                {
                    title: "Leadership & Influence",
                    description: "Build your professional brand",
                    sequence_order: 2,
                    tasks: [
                        {
                            title: "Write Technical Blog Series",
                            description: "Share knowledge through 10 blog posts",
                            category: "project",
                            priority: "medium",
                            difficulty: "intermediate",
                            estimated_hours: 30,
                            deadline_days_from_start: 60,
                            sequence_order: 1,
                            resources: [],
                            prerequisite_task_indices: []
                        },
                        {
                            title: "Speak at Tech Conference/Meetup",
                            description: "Present your expertise publicly",
                            category: "project",
                            priority: "medium",
                            difficulty: "advanced",
                            estimated_hours: 30,
                            deadline_days_from_start: 75,
                            sequence_order: 2,
                            resources: [],
                            prerequisite_task_indices: [2]
                        }
                    ]
                }
            ]
        }
    };

    return roadmaps[level] || roadmaps.beginner;
}

module.exports = {
    generateRoadmap
};
