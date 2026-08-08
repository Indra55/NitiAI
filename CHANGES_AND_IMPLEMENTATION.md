# 📌 Detailed Technical Blueprint & Implementation Guide - NitiAI (Branch: `jay`)

This document explains **what was changed**, **where the code lives**, and **how each feature processes requests step-by-step** from the user interface down to the Sarvam AI model stack.

---

## 🏗️ Architecture & Data Flow Overview

```
┌───────────────────────────┐         HTTP POST Request         ┌───────────────────────────┐
│                           │ ────────────────────────────────> │                           │
│   Next.js Frontend Client │                                   │    Express Backend API    │
│  (SarvamIndicStudio.tsx)  │ <──────────────────────────────── │    (sarvamRoutes.js)      │
└───────────────────────────┘          JSON + Base64 Audio      └─────────────┬─────────────┘
                                                                              │
                                                                 SDK Call     │
                                                                              ▼
                                                                ┌───────────────────────────┐
                                                                │      sarvamService.js     │
                                                                └─────────────┬─────────────┘
                                                                              │
                                                             https://api.sarvam.ai/v1
                                                                              │
                                                                ┌─────────────┴─────────────┐
                                                                │  Sarvam AI Model Stack    │
                                                                │  • Sarvam 105B (LLM)      │
                                                                │  • Saaras V3 (STT)        │
                                                                │  • Bulbul V3 (TTS)        │
                                                                └───────────────────────────┘
```

---

## 🛠️ How Feature 3 Works: Indic Live Code Audio Explainer

### 🎯 Feature Goal
Allow candidates to type code in the editor while speaking or typing their verbal thought process in Hinglish/Indic dialects. Sarvam AI verifies whether their verbal reasoning matches the code logic and provides audio hints via `Bulbul V3`.

### 🔄 End-to-End Execution Flow

1. **User Action (Frontend)**:
   Candidate enters code and verbal reasoning in [SarvamIndicStudio.tsx](file:///e:/Hackathons/niti-ai/NitiAI/client/components/sarvam/SarvamIndicStudio.tsx):
   - **Code**: `function twoSum(nums, target) { ... }`
   - **Spoken Thought**: *"Is code me hum HashMap populate kar rahe hain to avoid nested loops..."*

2. **API Call**:
   The frontend triggers `handleCodeExplainer()`, sending a request to `POST /api/sarvam/live-code-explainer`:
   ```json
   {
     "code": "function twoSum(nums, target) { const map = new Map(); ... }",
     "problemTitle": "Two Sum",
     "candidateVerbalExplanation": "Is code me hum HashMap populate kar rahe hain to avoid nested loops...",
     "languageCode": "hi-IN"
   }
   ```

3. **Backend Route Handler ([sarvamRoutes.js](file:///e:/Hackathons/niti-ai/NitiAI/server/routes/sarvamRoutes.js))**:
   ```javascript
   router.post('/live-code-explainer', async (req, res) => {
     const { code, problemTitle, candidateVerbalExplanation, languageCode = 'hi-IN' } = req.body;
     const prompt = `Code: \`\`\`${code}\`\`\`\nProblem: "${problemTitle}"\nSpoken Logic: "${candidateVerbalExplanation}"...`;
     
     // 1. LLM Code & Verbal Logic Verification
     const evaluationRaw = await sarvamService.generateCompletion(prompt, 'You are an Indic Live Code Audio Co-pilot.', 'sarvam-105b');
     const evaluation = JSON.parse(evaluationRaw);

     // 2. Audio Hint Generation (Bulbul V3)
     const ttsResult = await sarvamService.textToSpeech(evaluation.audioHintText, languageCode);

     res.json({ success: true, evaluation, audioHint: ttsResult });
   });
   ```

4. **Sarvam AI SDK Service ([sarvamService.js](file:///e:/Hackathons/niti-ai/NitiAI/server/services/sarvamService.js))**:
   - Sends an HTTP POST to `https://api.sarvam.ai/v1/chat/completions` with header `'api-subscription-key': process.env.SARVAM_API_KEY`.
   - Sends the generated audio hint to `https://api.sarvam.ai/text-to-speech` with model `bulbul:v3` and speaker `priya`.

5. **UI Rendering**:
   The client receives the JSON payload, displays the **"Verified Alignment"** tag, renders the audio hint text, and streams the Base64 audio string.

---

## ⚔️ How Feature 4 Works: Socratic Technical Debate Simulator

### 🎯 Feature Goal
Sarvam AI acts as a tough Socratic Senior Principal Architect challenging candidate architectural decisions (e.g. PostgreSQL vs MongoDB, Redis caching strategies) in Indic/code-mixed language.

### 🔄 End-to-End Execution Flow

1. **User Action (Frontend)**:
   Candidate selects a topic and states their architectural stance in [SarvamIndicStudio.tsx](file:///e:/Hackathons/niti-ai/NitiAI/client/components/sarvam/SarvamIndicStudio.tsx):
   - **Topic**: `PostgreSQL vs MongoDB for transactional checkout`
   - **Stance**: *"I choose PostgreSQL because e-commerce transactions require strict ACID compliance."*

2. **API Call**:
   Frontend executes `handleTechDebate()` calling `POST /api/sarvam/tech-debate`:
   ```json
   {
     "topic": "PostgreSQL vs MongoDB for transactional checkout",
     "candidateStance": "I choose PostgreSQL because...",
     "languageCode": "hi-IN"
   }
   ```

3. **Backend Route Handler ([sarvamRoutes.js](file:///e:/Hackathons/niti-ai/NitiAI/server/routes/sarvamRoutes.js))**:
   ```javascript
   router.post('/tech-debate', async (req, res) => {
     const { topic, candidateStance, languageCode = 'hi-IN' } = req.body;
     const prompt = `Topic: "${topic}"\nCandidate Stance: "${candidateStance}"...`;

     // 1. Socratic Architect Reasoning via Sarvam 105B
     const debateRaw = await sarvamService.generateCompletion(
       prompt, 
       'You are a Senior Principal Architect conducting a Socratic technical debate.', 
       'sarvam-105b'
     );
     const debateRes = JSON.parse(debateRaw);

     // 2. Voice Pushback via Bulbul V3
     const ttsResult = await sarvamService.textToSpeech(debateRes.socraticPushback, languageCode);

     res.json({ success: true, debateResponse: debateRes, voicePushback: ttsResult });
   });
   ```

4. **Sarvam AI LLM & Voice Response**:
   - `Sarvam 105B` generates a sharp architectural counter-question: *"Aapne PostgreSQL choose kiya, lekin high-throughput real-time write workloads ke liye Redis ya Cassandra kyu prefer nahi kiya?"*
   - `Bulbul V3` (`priya` speaker) synthesizes expressive spoken audio of the pushback.

5. **UI Rendering**:
   The candidate receives the Principal Architect counter-question card and voice audio feedback.

---

## 🔑 Environment Key Configuration

- **File**: [server/.env](file:///e:/Hackathons/niti-ai/NitiAI/server/.env)
- **Code**:
  ```env
  SARVAM_API_KEY=sk_f8xoja48_S5qnmJrDQpZHxbZIJSBem8HK
  ```
- Loaded automatically at server startup via `require('dotenv').config()` in [server/server.js](file:///e:/Hackathons/niti-ai/NitiAI/server/server.js).

---

## 📜 Git Commit Audit (Branch `jay`)

- `c9b44b4`: `fix: update Sarvam API endpoints and TTS speaker for live execution`
- `6e0bbbd`: `refactor: retain only features 3 & 4 (live code explainer and tech debate) in proposal and codebase`
- `71fc50c`: `refactor: remove 5th feature (handwritten OCR) from proposal and codebase`
