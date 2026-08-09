require('dotenv').config({path: './.env'});
const resumeService = require('./routes/resumeParser');

async function testUpdateFull() {
  const currentData = {
    "extracted_name": "HITANSHU GALA",
    "extracted_email": "galahitanshu@gmail.com",
    "extracted_phone": "+91-9920807853",
    "extracted_location": "Mumbai, India",
    "linkedin_url": null,
    "portfolio_url": null,
    "professional_title": null,
    "years_of_experience": null,
    "professional_summary": "Software development engineer with expertise in AI, Python, Flask, and REST APIs. Experienced in building scalable systems, automation pipelines, and microservices. Strong background in competitive programming and hackathons.",
    "technical_skills": [
      "C++",
      "Java",
      "Python",
      "JavaScript",
      "TypeScript",
      "SQL",
      "Node.js",
      "Express.js",
      "React.js",
      "Bun",
      "Flask",
      "LangChain",
      "REST APIs",
      "WebSockets",
      "PostgreSQL",
      "MySQL",
      "MongoDB",
      "Redis",
      "FAISS",
      "Git",
      "Docker",
      "NGINX",
      "Linux",
      "AWS",
      "CI/CD",
      "GitHub Webhooks",
      "Ansible",
      "BullMQ"
    ]
  };
  
  const instruction = "Make my summary more impactful and results-oriented";
  
  try {
    const updatedData = await resumeService.updateResume(currentData, instruction);
    console.log("Updated data:", updatedData);
  } catch (err) {
    console.error("Error:", err);
  }
}

testUpdateFull();
