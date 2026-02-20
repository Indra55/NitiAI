import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { currentSkills, targetRole, timeframe } = body

    const prompt = `You are a learning advisor creating a personalized skill development plan.

Current Skills: ${currentSkills}
Target Role: ${targetRole}
Available Timeframe: ${timeframe}

Create a structured learning plan in JSON with:
1. primaryFocus (object: {skill, duration, resources})
2. secondaryFocus (object with same structure)
3. assessmentMilestones (array of 3-4 checkpoints)
4. estimatedReadiness (0-100 at timeframe end)
5. resources (array of 5-7 specific courses, books, platforms with time estimates)

Be specific with resource names and realistic with timelines.`

    const { text } = await generateText({
      model: "openai/gpt-4-turbo",
      prompt,
      temperature: 0.7,
    })

    let learningPlan
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      learningPlan = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text)
    } catch {
      learningPlan = {
        primaryFocus: {
          skill: "System Design",
          duration: "8-12 weeks",
          resources: ["Designing Data-Intensive Applications"],
        },
        secondaryFocus: {
          skill: "Advanced Algorithms",
          duration: "4-6 weeks",
          resources: ["LeetCode Premium"],
        },
      }
    }

    return Response.json(learningPlan)
  } catch (error) {
    console.error("[v0] Learning plan error:", error)
    return Response.json({ error: "Failed to create learning plan" }, { status: 500 })
  }
}
