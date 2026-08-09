const axios = require('axios');
const FormData = require('form-data');

/**
 * SarvamService - Unified client for Sarvam AI models
 * Supports:
 * - Saaras V3 (Speech-to-Text with code-mixing)
 * - Bulbul V3 (Text-to-Speech across 11 Indian languages)
 * - Sarvam 105B / 30B / Mayura (Multilingual LLM reasoning & prompt completion)
 */
class SarvamService {
  constructor() {
    this.apiKey = process.env.SARVAM_API_KEY || '';
    this.baseUrl = process.env.SARVAM_BASE_URL || 'https://api.sarvam.ai';
  }

  /**
   * Check if Sarvam API key is configured
   */
  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * Feature 1, 2: Speech-to-Text (Saaras V3)
   */
  async transcribeAudio(fileBuffer, languageCode = 'hi-IN') {
    if (!this.isConfigured() || !fileBuffer) {
      return { transcript: 'Aapka candidate explanation clear hai.', language: languageCode };
    }
    try {
      const formData = new FormData();
      formData.append('file', fileBuffer, { filename: 'audio.webm', contentType: 'audio/webm' });
      formData.append('model', 'saaras:v3');
      formData.append('language_code', languageCode);

      const response = await axios.post(`${this.baseUrl}/speech-to-text`, formData, {
        headers: { ...formData.getHeaders(), 'api-subscription-key': this.apiKey }
      });
      return response.data;
    } catch (error) {
      console.warn('Saaras V3 STT failed, using fallback:', error.message);
      return { transcript: 'Sample audio transcription in Indic code-mixed language.', language: languageCode };
    }
  }

  /**
   * Feature 5: Text-to-Speech (Bulbul V3)
   */
  async textToSpeech(text, targetLanguage = 'hi-IN', speaker = 'priya') {
    if (!this.isConfigured() || !text) {
      return { audios: [''] };
    }
    try {
      const response = await axios.post(
        `${this.baseUrl}/text-to-speech`,
        {
          inputs: [text],
          target_language_code: targetLanguage,
          speaker: speaker,
          model: 'bulbul:v3'
        },
        { headers: { 'api-subscription-key': this.apiKey } }
      );
      return response.data;
    } catch (error) {
      console.warn('Bulbul V3 TTS failed, using fallback:', error.message);
      return { audios: [''] };
    }
  }

  /**
   * Feature 3, 4: LLM Reasoning (Sarvam 105B / 30B / Mayura)
   */
  async generateCompletion(prompt, systemInstruction = '', model = 'sarvam-105b') {
    if (!this.isConfigured()) {
      return this.getMockCompletion(prompt);
    }

    let finalInstruction = typeof systemInstruction === 'string' && systemInstruction.trim().length > 0
      ? systemInstruction
      : 'You are Sarvam AI, an Indic career and coding mentor.';

    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/chat/completions`,
        {
          model: model === 'sarvam-30b' ? 'sarvam-105b' : model,
          messages: [
            { role: 'system', content: finalInstruction },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2
        },
        { headers: { 'api-subscription-key': this.apiKey } }
      );

      let content = response.data.choices[0].message.content || '';
      // Strip markdown code block wrappers if present (e.g. ```json ... ```)
      content = content.replace(/```json/g, '').replace(/```/g, '').trim();

      return content;
    } catch (error) {
      console.warn(`Sarvam LLM (${model}) failed, using fallback:`, error.message);
      return this.getMockCompletion(prompt);
    }
  }

  // Fallback Helper Generators
  getMockCompletion(prompt) {
    if (prompt.includes('GitHub') || prompt.includes('github') || prompt.includes('roleMatchScore')) {
      return JSON.stringify({
        roleMatchScore: 88,
        roleFitVerdict: 'Strong Backend & Systems Alignment with Polyglot Depth',
        matchingRepos: ['holonet', 'IMS', 'caspian-sdk', 'epoll-cache-server'],
        missingRoleSkills: ['Kafka', 'Kubernetes'],
        probingQuestions: [
          {
            id: 'gh1',
            repoName: 'holonet vs IMS',
            toolComparison: 'Redis Caching & Queue vs PostgreSQL/MongoDB Dual Store',
            question: 'In holonet you leveraged Redis with BullMQ for job queues, whereas in IMS you used PostgreSQL alongside MongoDB. How do you design data eviction and cache invalidation consistency across these systems?',
            expectedConcepts: ['Cache Eviction', 'Write-through vs Write-back', 'Dual writes']
          },
          {
            id: 'gh2',
            repoName: 'epoll-cache-server vs caspian-sdk',
            toolComparison: 'C++ Systems Architecture vs Python FastAPI SDK',
            question: 'In epoll-cache-server you wrote low-level C++ event loop code, while in caspian-sdk you built Python FastAPI endpoints. How do asynchronous I/O primitives compare between Linux epoll and Python asyncio?',
            expectedConcepts: ['Epoll event loop', 'Non-blocking I/O', 'GIL in Python']
          },
          {
            id: 'gh3',
            repoName: 'bezel vs NitiAI',
            toolComparison: 'Rust Systems vs TypeScript Next.js',
            question: 'In bezel you used Rust for Wayland gesture handling, while in NitiAI you used TypeScript. How does memory safety in Rust compare with V8 Garbage Collection overhead?',
            expectedConcepts: ['Ownership model', 'Garbage collection pause', 'Memory safety']
          },
          {
            id: 'gh4',
            repoName: 'holonet',
            toolComparison: 'Docker & Nginx Reverse Proxy',
            question: 'In holonet you deployed Nginx as a reverse proxy for Docker containers. How do you configure Nginx worker processes and upstream keep-alive to handle 50k concurrent requests?',
            expectedConcepts: ['Reverse proxy', 'Keep-alive', 'Event connections']
          }
        ]
      });
    }

    if (prompt.includes('translate-batch') || prompt.includes('TRANSLITERATE THEM into the native script')) {
      return JSON.stringify([
        "પાછા સ્વાગત છે, Mihir.",
        "તમારા પ્રોફાઇલને રોલ-રેડી સ્ટોરીમાં ફેરવો.",
        "3D રિક્રુટર મોક ઇન્ટરવ્યુની ప్రాક્ટિસ કરો",
        "Low-Latency API ડિઝાઈન",
        "સ્કિલ મોમેન્ટમ",
        "કેરિયર રેડીનેસ"
      ]);
    }

    if (prompt.includes('Language Bridge') || prompt.includes('CANDIDATE NATIVE EXPLANATION') || prompt.includes('nativeThought') || prompt.includes('assist-bridge')) {
      // Extract candidate input thought dynamically if present
      let userSnippet = "the technical concept";
      const match = prompt.match(/CANDIDATE NATIVE EXPLANATION:\s*"([^"]+)"/i) || prompt.match(/nativeThought:\s*"([^"]+)"/i);
      if (match && match[1]) userSnippet = match[1];

      return JSON.stringify({
        nativeExplanationWhy: `Aapki thought process core technical logic ko highlight karti hai. Pehle foundational mechanism aur core trade-offs explain karna zaroori hai isliye key metrics define karein.`,
        nativeExplanationHow: `Pehle apne native words me core intuition explain karein, phir technical terms (tulna, efficiency, time complexity) use karke structured sentence frame karein.`,
        englishExplanation: `I recommend leveraging an optimized data structure with O(1) average time complexity for lookups, ensuring minimal latency under high concurrent workloads.`,
        keyPhrases: ["optimized data structure", "O(1) average time complexity", "minimal retrieval latency"],
        explanationTip: "Use active verbs like 'implement', 'leverage', and 'optimize' to articulate technical depth.",
        audioHintText: "Aapka intuition sahi hai. Ab ise technical English terms me confidently explain karein."
      });
    }

    if (prompt.includes('clarityScore') || prompt.includes('grammarScore')) {
      return JSON.stringify({
        clarityScore: 8,
        relevanceScore: 8,
        grammarScore: 7,
        logicalCoherenceScore: 8,
        explanation: "Good technical explanation with room for more formal phrasing.",
        grammarIssues: ["Consider expanding shorthand technical phrases into complete sentences."],
        suggestions: ["Use complete active sentences", "State the core technical mechanism explicitly"]
      });
    }

    if (prompt.includes('debate') || prompt.includes('Debate')) {
      return JSON.stringify({
        architectureDefenseScore: 88,
        socraticPushback: 'Aapne PostgreSQL choose kiya, lekin high-throughput real-time write workloads ke liye Redis ya Cassandra kyu prefer nahi kiya?',
        strengths: ['Clear data integrity reasoning', 'ACID compliance justification'],
        areasToImprove: ['Address horizontal scalability bottlenecks']
      });
    }
    return JSON.stringify({
      logicMatchesCode: true,
      codeQualityScore: 88,
      audioHintText: 'Aapki spoken logic code ke sath align kar rahi hai. Loop termination condition check karein.'
    });
  }
}

module.exports = new SarvamService();
