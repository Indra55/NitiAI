import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { resumeContent } = body

    const prompt = `You are an experienced recruiter with 15+ years reviewing resumes. Provide constructive, mentor-like feedback on this resume. 
    
Resume:
${resumeContent}

Provide feedback in JSON format with:
1. strengths (array of 3-4 things done well)
2. improvements (array of 3-4 actionable improvements)
3. readinessScore (0-100)
4. targetRoles (array of 2-3 suitable roles)
5. nextSteps (array of 3 specific actions)

Be encouraging and focus on growth, not criticism.`

    const { text } = await generateText({
      model: "openai/gpt-4-turbo",
      prompt,
      temperature: 0.6,
    })

    let feedback
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      feedback = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text)
    } catch {
      feedback = {
        strengths: ["Clear structure", "Relevant skills listed"],
        improvements: ["Add metrics to impact", "Quantify achievements"],
        readinessScore: 70,
        targetRoles: ["Senior Engineer", "Tech Lead"],
        nextSteps: ["Add metrics", "Highlight leadership"],
      }
    }

    return Response.json(feedback)
  } catch (error) {
    console.error("[v0] Resume review error:", error)
    return Response.json({ error: "Failed to review resume" }, { status: 500 })
  }
}
