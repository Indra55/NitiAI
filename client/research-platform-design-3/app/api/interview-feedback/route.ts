import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { question, answer, interviewType, role } = body

    const prompt = `You are an expert interview coach providing constructive feedback.

Interview Type: ${interviewType}
Role: ${role}
Question: ${question}
Candidate's Answer: ${answer}

Provide feedback as JSON with:
1. whatWentWell (2-3 specific positive observations)
2. oneImprovement (single, actionable improvement)
3. nextTimeTip (strategy for similar questions)
4. confidenceScore (0-100)
5. suggestedAnswer (brief outline of stronger response)

Be supportive and focus on growth. This is practice.`

    const { text } = await generateText({
      model: "openai/gpt-4-turbo",
      prompt,
      temperature: 0.7,
    })

    let feedback
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      feedback = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text)
    } catch {
      feedback = {
        whatWentWell: ["Clear communication", "Specific examples"],
        oneImprovement: "Add more detail to your metrics",
        nextTimeTip: "Always quantify your impact",
        confidenceScore: 75,
        suggestedAnswer: "Focus on STAR method",
      }
    }

    return Response.json(feedback)
  } catch (error) {
    console.error("[v0] Interview feedback error:", error)
    return Response.json({ error: "Failed to generate feedback" }, { status: 500 })
  }
}
