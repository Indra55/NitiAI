require('dotenv').config({path: './.env'});
const resumeService = require('./routes/resumeParser');

async function testUpdate() {
  const currentData = {
    name: "Hitanshu Gala",
    technical_skills: ["Python", "Flask", "AI"]
  };
  const instruction = "Add Docker and AWS to my technical skills";
  
  console.log("Original data:", currentData);
  
  try {
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
    const text = await resumeService.callSarvamWithRetry(prompt, 2, true);
    console.log("Raw Sarvam Output:", text);
    const updatedData = resumeService.safeJsonParse(text, currentData);
    console.log("Updated data:", updatedData);
  } catch (err) {
    console.error("Error:", err);
  }
}

testUpdate();
