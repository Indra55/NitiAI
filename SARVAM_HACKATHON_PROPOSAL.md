# 🚀 Sarvam AI Hackathon Final Product Strategy: NitiAI Indic Edition

> **Product Vision**: Transform NitiAI into a comprehensive multilingual AI career, coding, and interview intelligence ecosystem. Built from a **Senior Product Engineer's perspective**, it delivers high-engagement tools for **Job Seekers (Users)** while giving **Employers & Recruiters (Clients)** unprecedented candidate evaluation depth and regional talent access.

---

## 🎯 Executive Product Strategy

Building for both **Users (Job Seekers, Students)** and **Clients (Recruiters, Hiring Managers, HR Tech Platforms)** requires balancing **candidate confidence & accessible learning** with **recruiter efficiency, accuracy, and reach**.

By integrating **Sarvam AI's specialized Indic model stack**, NitiAI bridges the native language gap—allowing candidates to practice interviews, explain code out loud, defend architectural choices, and audit resume skills in their comfortable regional dialect, while delivering verified, high-clarity intelligence to hiring teams in English.

---

## 📋 Final Product Feature Matrix

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 NitiAI Indic Ecosystem                                  │
├─────────────────────────────────────────────────────────┬───────────────────────────────┤
│ FOR USERS (JOB SEEKERS & STUDENTS)                      │ FOR CLIENTS (RECRUITERS & HR) │
├─────────────────────────────────────────────────────────┼───────────────────────────────┤
│ • Native job description translation (22 languages)     │ • Expand hiring reach to T2/T3│
│ • Verbalize code logic in Hinglish/Tamil                │ • Real-time Socratic Tech     │
│ • Practice technical debates & STAR method              │   Debates                     │
│                                                         │ • Dual-language HR candidate  │
│                                                         │   report cards                │
└─────────────────────────────────────────────────────────┴───────────────────────────────┘
```

---

## 💡 Final 5 Core Features

### 1. 🌐 Multilingual Indic AI Career Coach & Real-Time Job Matcher
> **User Pain Point**: Job postings on platforms like LinkedIn are written in dense, formal English, making role requirements and skill expectations intimidating or unclear to non-native English speakers.  
> **Client Pain Point**: Top companies struggle to reach qualified talent in Tier-2 and Tier-3 Indian cities because job listings are exclusively in English.

- **Product Solution**:
  - **Localized Job Cards**: Real-time translation of LinkedIn/Adzuna job postings into 22 Indian languages. Technical terms stay intact, but key responsibilities are explained in the candidate's native tongue.
  - **Indic Conversational AI Coach**: Candidates can ask questions like *"What skills do I need for this SDE-2 role?"* in Hindi, Tamil, or Hinglish, receiving actionable advice.
- **Sarvam Stack Used**:
  - **Sarvam Translate**: Translates complex job descriptions into 22 Indian languages.
  - **Sarvam 105B**: Flagship LLM powering contextual career advising.
  - **Mayura**: Handles colloquial regional queries and code-mixed phrasing.

---

### 2. 🎯 Behavioral & Soft-Skills Interview Simulator (STAR Method Coach)
> **User Pain Point**: Candidates struggle with behavioral questions ("Tell me about a time you resolved a team conflict under deadline") because they don't know how to structure answers using industry standards like the STAR method.  
> **Client Pain Point**: Technical hires often fail in real company environments due to poor teamwork, adaptability, or communication skills.

- **Product Solution**:
  - Voice-based soft-skills coaching arena. Candidates speak their answers in regional/code-mixed language, and the AI coach scores their response on Situation, Task, Action, and Result, giving instant voice feedback.
- **Sarvam Stack Used**:
  - **Saaras V3**: Speech recognition for spoken candidate responses in 22 Indian languages.
  - **Sarvam 30B**: Evaluates STAR framework compliance and soft-skill metrics.
  - **Bulbul V3**: Delivers constructive vocal coaching in 11 Indian languages.

---

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

### 5. 📝 Indic HR Scribe & Bilingual Candidate Report Card Generator
> **User Pain Point**: Candidates rarely get detailed, actionable feedback explaining why they passed or failed an interview.  
> **Client Pain Point**: HR teams struggle to write consistent candidate evaluation notes and send feedback to candidates.

- **Product Solution**:
  - During live interviews, Sarvam AI acts as a silent scribe. It transcribes candidate regional spoken answers via `Saaras V3` and generates a dual-language (English + Native language) **Bilingual Candidate Scorecard PDF** detailing logic score, problem-solving speed, and areas for improvement.
- **Sarvam Stack Used**:
  - **Saaras V3**: Real-time multi-speaker transcription.
  - **Sarvam 105B**: Automated candidate scorecard generator.
  - **Sarvam Translate**: Instant bilingual report translation.

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

  // 1. Job & Report Translation (Sarvam Translate)
  async translateContent(text, targetLang = 'hi-IN') {
    const response = await axios.post(`${this.baseUrl}/translate`, {
      input: text,
      target_language_code: targetLang,
      model: 'sarvam-translate'
    }, {
      headers: { 'api-subscription-key': this.apiKey }
    });
    return response.data;
  }

  // 2. Code-Mixed Speech Recognition (Saaras V3)
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

  // 3. Expressive Voice Synthesis (Bulbul V3)
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

  // 4. Indic LLM Reasoning & Socratic Debate Engine (Sarvam 105B / 30B)
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
1. **Full Sarvam Ecosystem Showcase**: Leverages the flagship models in the Sarvam stack (`Sarvam 105B`, `Sarvam 30B`, `Saaras V3`, `Bulbul V3`, `Sarvam Translate`, `Mayura`).
2. **Product Innovation**: Combines real-time code execution, voice-based tech debates, STAR behavioral evaluation, and automated HR scorecards into a cohesive platform.
3. **High Hackathon Feasibility**: Modular architecture allows shipping all 5 features clean using Express routes & Next.js App Router.
