const axios = require('axios');

class MockInterviewSarvamService {
  constructor() {
    this.apiKey = process.env.SARVAM_API_KEY || '';
    this.baseUrl = process.env.SARVAM_BASE_URL || 'https://api.sarvam.ai';
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async generateCompletion(prompt, systemInstruction = '', model = 'sarvam-105b') {
    if (!this.isConfigured()) {
      return this.getMockCompletion(prompt);
    }
    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/chat/completions`,
        {
          model: model,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2
        },
        { headers: { 'api-subscription-key': this.apiKey } }
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      console.warn(`MockInterview Sarvam LLM error:`, error.message);
      return this.getMockCompletion(prompt);
    }
  }

  async textToSpeech(text, targetLanguage = 'hi-IN') {
    if (!this.isConfigured()) {
      return { audio_b64: null, message: 'Bulbul V3 TTS fallback active' };
    }
    try {
      const response = await axios.post(
        `${this.baseUrl}/text-to-speech`,
        {
          inputs: [text],
          target_language_code: targetLanguage,
          speaker: 'anushka',
          model: 'bulbul:v2'
        },
        { headers: { 'api-subscription-key': this.apiKey } }
      );
      return response.data;
    } catch (error) {
      return { audio_b64: null, message: error.message };
    }
  }

  getMockCompletion(prompt) {
    if (prompt.includes('Language Bridge') || prompt.includes('CANDIDATE NATIVE EXPLANATION')) {
      return JSON.stringify({
        englishExplanation: "To optimize database queries under high throughput, I implement indexed B-tree lookups combined with a Redis caching layer to achieve sub-millisecond retrieval latencies.",
        keyPhrases: ["indexed B-tree lookups", "Redis caching layer", "sub-millisecond retrieval latencies"],
        explanationTip: "Use active verbs like 'implement', 'combine', and 'achieve' to articulate technical depth."
      });
    }

    if (prompt.includes('clarityScore') || prompt.includes('grammarScore')) {
      return JSON.stringify({
        clarityScore: 3,
        relevanceScore: 4,
        grammarScore: 3,
        logicalCoherenceScore: 3,
        explanation: "Grammar mistakes and incomplete phrasing obscured the technical explanation.",
        grammarIssues: ["Missing verb structure", "Incomplete sentence"],
        suggestions: ["Use complete active sentences", "State the core technical mechanism explicitly"]
      });
    }

    if (prompt.includes('dsa') || prompt.includes('voice') || prompt.includes('multi-round interview')) {
      const wantsDSA = !prompt.includes('SKIP DSA Questions');
      return JSON.stringify({
        dsa: wantsDSA ? [
          {
            title: "Longest Substring Without Repeating Characters",
            description: "Given a string s, find the length of the longest substring without repeating characters.",
            difficulty: "Medium",
            example: { input: "s = \"abcabcbb\"", output: "3" },
            testCases: [
              { input: "abcabcbb", output: "3" },
              { input: "bbbbb", output: "1" },
              { input: "pwwkew", output: "3" }
            ],
            boilerplates: {
              javascript: "function lengthOfLongestSubstring(s) {\n  // Write your code here\n};",
              python: "def lengthOfLongestSubstring(s: str) -> int:\n    pass",
              cpp: "int lengthOfLongestSubstring(string s) {\n    return 0;\n}"
            }
          }
        ] : [],
        voice: [
          { question: "Walk me through how you design low-latency REST APIs for high scale.", answer: "Use connection pooling, Redis caching, indexing, and asynchronous job queues.", round: "technical" },
          { question: "Tell me about a time you resolved a major bug in production under high pressure.", answer: "Discuss structured debugging, isolation, rollback strategy, and root-cause analysis.", round: "behavioral" },
          { question: "How do you align with team coding standards and conduct peer code reviews?", answer: "Highlight constructive feedback, automated linting, and clear communication.", round: "cultural" }
        ]
      });
    }

    if (prompt.includes('STAR')) {
      return JSON.stringify({
        situationScore: 88, taskScore: 85, actionScore: 90, resultScore: 80, overallScore: 86,
        feedback: 'Aapne response me STAR method ko achhi tarah se apply kiya hai.'
      });
    }
    if (prompt.includes('Socratic') || prompt.includes('debate')) {
      return JSON.stringify({
        socraticPushback: 'Aapne Microservices architecture choose ki. Lekin high-volume database transactions ke liye eventual consistency kaise maintain karenge?',
        architecturalScore: 87
      });
    }
    return JSON.stringify({
      englishSummary: 'The candidate demonstrated strong algorithmic reasoning and clear technical explanation.',
      indicSummary: 'Ummidvaar ne behtar takneeki tark aur spashth samvaad prashant kiya.',
      strengths: ['Algorithmic efficiency', 'Code structure'],
      improvementAreas: ['System design edge cases'],
      hiringRecommendation: 'Strong Hire'
    });
  }
}

module.exports = new MockInterviewSarvamService();
