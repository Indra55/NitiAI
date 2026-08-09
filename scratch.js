const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
require('dotenv').config({ path: 'server/.env' });

async function testSarvam() {
  const prompt = `You are an expert resume editor. Update the following resume JSON based on the user's instruction.
    
    Current Resume JSON:
    {"extracted_name":"Hitanshu Gala","technical_skills":["C++"],"experience":[],"professional_summary":"Software engineer."}
    
    User Instruction:
    "can you put the go lang after c++"
    
    Return JSON only.`;

  const payload = {
    model: "sarvam-105b", // Or whatever model is used
    messages: [
      { 
        role: "system", 
        content: "You are a helpful assistant. Return your response in JSON format. Do not wrap in markdown." 
      },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" }
  };
  
  try {
    const response = await axios.post("https://api.sarvam.ai/v1/chat/completions", payload, {
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": process.env.SARVAM_API_KEY,
        "Authorization": `Bearer ${process.env.SARVAM_API_KEY}`
      }
    });
    console.log("Response:", response.data.choices[0].message.content);
  } catch(e) {
    console.error("Error:", e.response ? e.response.data : e.message);
  }
}

testSarvam();
