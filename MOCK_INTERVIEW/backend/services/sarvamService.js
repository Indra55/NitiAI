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
        `${this.baseUrl}/chat/completions`,
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
          speaker: 'meera',
          model: 'bulbul-v3'
        },
        { headers: { 'api-subscription-key': this.apiKey } }
      );
      return response.data;
    } catch (error) {
      return { audio_b64: null, message: error.message };
    }
  }

  getMockCompletion(prompt) {
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
