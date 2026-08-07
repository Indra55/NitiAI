require('dotenv').config();
const resumeService = require('./routes/resumeParser');

async function testSarvam() {
  console.log("Starting Sarvam Test...");
  const dummyResume = "John Doe. Software Engineer. 5 years experience in React and Node.js. Worked at TechCorp. Graduated from State University with Computer Science degree.";
  
  console.time("Sarvam_parseResumeBasic");
  try {
    const jsonOutput = await resumeService.parseResumeBasic(dummyResume);
    console.timeEnd("Sarvam_parseResumeBasic");
    console.log("Sarvam Output (parseResumeBasic):", JSON.stringify(jsonOutput, null, 2));
    
    if (jsonOutput.name === "John Doe") {
      console.log("✅ JSON output is structured correctly!");
    } else {
      console.log("❌ JSON output might be malformed or missing key data.");
    }
  } catch (error) {
    console.timeEnd("Sarvam_parseResumeBasic");
    console.error("Test Failed:", error);
  }
}

testSarvam();
