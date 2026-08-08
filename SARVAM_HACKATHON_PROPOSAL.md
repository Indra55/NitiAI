# 🚀 Sarvam AI Hackathon Final Product Strategy: NitiAI Indic Edition

> **Product Vision**: Transform NitiAI into a comprehensive multilingual AI career, coding, and interview intelligence ecosystem. Built from a **Senior Product Engineer's perspective**, it delivers high-engagement tools for **Job Seekers (Users)** while giving **Employers & Recruiters (Clients)** unprecedented candidate evaluation depth and regional talent access.

---

## 🎯 Executive Product Strategy

Building for both **Users (Job Seekers, Students)** and **Clients (Recruiters, Hiring Managers, HR Tech Platforms)** requires balancing **candidate confidence & accessible learning** with **recruiter efficiency, accuracy, and reach**.

By integrating **Sarvam AI's specialized Indic model stack**, NitiAI bridges the native language gap—allowing candidates to practice live coding out loud and defend architectural choices in their comfortable regional dialect, while delivering verified, high-clarity intelligence to hiring teams.

---

## 📋 Final Product Feature Matrix

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 NitiAI Indic Ecosystem                                  │
├─────────────────────────────────────────────────────────┬───────────────────────────────┤
│ FOR USERS (JOB SEEKERS & STUDENTS)                      │ FOR CLIENTS (RECRUITERS & HR) │
├─────────────────────────────────────────────────────────┼───────────────────────────────┤
│ • Verbalize code logic in Hinglish/Tamil while coding   │ • Verify code reasoning alignment│
│ • Practice live Socratic technical debates              │ • Assess candidate trade-offs │
└─────────────────────────────────────────────────────────┴───────────────────────────────┘
```

---

## 💡 Core Features Implemented

### 3. 🎙️ Indic Live Code Audio Explainer & Real-Time Co-Pilot
> **User Pain Point**: Candidates freeze during live coding rounds because they struggle to verbalize their thought process ("think out loud") in English while writing code.  
> **Client Pain Point**: Interviewers cannot gauge if a candidate understands their own code or if they just memorized a LeetCode solution.

- **Product Solution**:
  - While typing in the Monaco Editor, candidates tap a mic button to explain their code logic in Hinglish, Tanglish, or Hindi (*"Is loop me hum HashMap populate kar rahe hain to avoid O(N^2)"*).
  - The Sarvam AI Co-pilot listens, verifies their verbal reasoning against their actual code, and speaks audio hints/critiques back via `Bulbul V3` without spoiling the answer.
- **Sarvam Stack Used**:
  - **Saaras V3**: Streaming low-latency STT for code-mixed speech.
  - **Sarvam 30B**: Code & logic verification engine.
  - **Bulbul V3**: Real-time audio hints in native languages.

---

### 4. ⚔️ Real-Time Technical Debate & Counter-Argument Simulator
> **User Pain Point**: Candidates get flustered when an interviewer challenges their tech choices ("Why PostgreSQL over MongoDB here? Why React over Vue?").  
> **Client Pain Point**: Hiring teams want engineers who can defend architectural decisions with sound engineering principles rather than blind dogmatism.

- **Product Solution**:
  - An interactive "Socratic Debate Mode" where Sarvam AI acts as a tough Senior Principal Architect challenging candidate choices in spoken regional/code-mixed language, evaluating their composure, trade-off analysis, and justification skills.
- **Sarvam Stack Used**:
  - **Sarvam 105B**: Socratic debate & architectural trade-off engine.
  - **Saaras V3 & Mayura**: Parses colloquial argument nuances and code-mixed candidate debate speech.
  - **Bulbul V3**: Voice of the Senior Architect interviewer.

---

## 🛠️ Unified Sarvam AI Service (`server/services/sarvamService.js`)

```javascript
const axios = require('axios');
const FormData = require('form-data');

class SarvamService {
  constructor() {
    this.apiKey = process.env.SARVAM_API_KEY;
    this.baseUrl = 'https://api.sarvam.ai';
  }

  // 1. Code-Mixed Speech Recognition (Saaras V3)
  async transcribeAudio(audioBuffer, languageCode = 'hi-IN') {
    const formData = new FormData();
    formData.append('file', audioBuffer, { filename: 'audio.wav' });
    formData.append('model', 'saaras-v3');
    formData.append('language_code', languageCode);

    const response = await axios.post(`${this.baseUrl}/speech-to-text`, formData, {
      headers: { ...formData.getHeaders(), 'api-subscription-key': this.apiKey }
    });
    return response.data;
  }

  // 2. Expressive Voice Synthesis (Bulbul V3)
  async textToSpeech(text, targetLanguage = 'hi-IN', speaker = 'meera') {
    const response = await axios.post(`${this.baseUrl}/text-to-speech`, {
      inputs: [text],
      target_language_code: targetLanguage,
      speaker: speaker,
      model: 'bulbul-v3'
    }, {
      headers: { 'api-subscription-key': this.apiKey }
    });
    return response.data;
  }

  // 3. Indic LLM Reasoning & Socratic Debate Engine (Sarvam 105B / 30B)
  async generateCompletion(prompt, systemInstruction = '', model = 'sarvam-105b') {
    const response = await axios.post(`${this.baseUrl}/chat/completions`, {
      model: model,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2
    }, {
      headers: { 'api-subscription-key': this.apiKey }
    });
    return response.data.choices[0].message.content;
  }
}

module.exports = new SarvamService();
```

---

## 🏆 Pitch Strategy for Sarvam Jury
1. **Targeted Sarvam Stack Showcase**: Leverages flagship models (`Sarvam 105B`, `Sarvam 30B`, `Saaras V3`, `Bulbul V3`, `Mayura`) focused on live code audio reasoning and Socratic debates.
2. **Product Innovation**: Combines real-time code execution with voice-based technical debate simulation into a high-impact developer platform.
