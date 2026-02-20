import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { skills, education, interests, goals } = body

    const prompt = `You are an expert career advisor analyzing a user's profile. Based on their information, provide 4 personalized career path recommendations.

User Profile:
- Skills: ${skills || "Not provided"}
- Education: ${education || "Not provided"}
- Interests: ${interests || "Not provided"}
- Career Goals: ${goals || "Not provided"}

For each recommendation, provide:
1. Job Title
2. Why it's suitable for them
3. Key skills they need
4. Growth trajectory
5. Industry outlook

Format your response as a JSON array with these exact fields: title, description, fit, skills (array), growth, outlook`

    const { text } = await generateText({
      model: "openai/gpt-4-turbo",
      prompt,
      temperature: 0.7,
    })

    // Parse the response
    let recommendations
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text)
    } catch {
      recommendations = [
        {
          title: "Software Engineer",
          description: "Build scalable systems and products",
          fit: "Technical focus and problem-solving",
          skills: ["System Design", "Programming", "Problem Solving"],
          growth: "Senior Engineer → Tech Lead → Engineering Manager",
          outlook: "High demand, strong salary growth",
        },
      ]
    }

    return Response.json({ recommendations })
  } catch (error) {
    console.error("[v0] Career recommender error:", error)
    return Response.json({ error: "Failed to generate recommendations" }, { status: 500 })
  }
}
