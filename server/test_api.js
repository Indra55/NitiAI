const http = require('http');

const data = JSON.stringify({
  currentData: {
    extracted_name: "HITANSHU GALA",
    professional_summary: "Software development engineer with expertise in AI, Python, Flask, and REST APIs. Experienced in building scalable systems, automation pipelines, and microservices. Strong background in competitive programming and hackathons.",
    technical_skills: ["Python", "Flask"]
  },
  instruction: "Improve my professional summary"
});

const options = {
  hostname: 'localhost',
  port: 5555,
  path: '/api/resume/update',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log('BODY:', body));
});

req.on('error', (e) => console.error(`problem with request: ${e.message}`));
req.write(data);
req.end();
