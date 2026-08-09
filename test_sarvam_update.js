require('dotenv').config({path: './server/.env'});
const resumeService = require('./server/routes/resumeParser');

async function testUpdate() {
  const currentData = {
    name: "Hitanshu Gala",
    technical_skills: ["Python", "Flask", "AI"]
  };
  const instruction = "Add Docker and AWS to my technical skills";
  
  console.log("Original data:", currentData);
  
  try {
    const updatedData = await resumeService.updateResume(currentData, instruction);
    console.log("Updated data:", updatedData);
  } catch (err) {
    console.error("Error:", err);
  }
}

testUpdate();
