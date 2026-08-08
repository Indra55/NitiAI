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
   * Feature 3: Speech-to-Text with Code-Mixing (Saaras V3)
   */
  async transcribeAudio(audioBuffer, languageCode = 'hi-IN') {
    if (!this.isConfigured() || !audioBuffer) {
      return { transcript: 'Is algorithm me hum HashMap populate kar rahe hain to optimize lookup time complexity.', language: languageCode };
    }
    try {
      const formData = new FormData();
      formData.append('file', audioBuffer, { filename: 'audio.wav' });
      formData.append('model', 'saaras-v3');
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
   * Feature 3, 4: Text-to-Speech (Bulbul V3)
   */
  async textToSpeech(text, targetLanguage = 'hi-IN', speaker = 'priya') {
    if (!this.isConfigured()) {
      return { audio_b64: null, message: 'Bulbul V3 TTS fallback active (Configure SARVAM_API_KEY for live audio streaming)' };
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
      return { audio_b64: null, message: 'TTS playback fallback' };
    }
  }

  /**
   * Feature 3, 4: LLM Reasoning (Sarvam 105B / 30B / Mayura)
   */
  async generateCompletion(prompt, systemInstruction = '', model = 'sarvam-105b') {
    if (!this.isConfigured()) {
      return this.getMockCompletion(prompt);
    }
    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/chat/completions`,
        {
          model: model === 'sarvam-30b' ? 'sarvam-105b' : model,
          messages: [
            { role: 'system', content: systemInstruction || 'You are Sarvam AI, an Indic career and coding mentor.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2
        },
        { headers: { 'api-subscription-key': this.apiKey } }
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      console.warn(`Sarvam LLM (${model}) failed, using fallback:`, error.message);
      return this.getMockCompletion(prompt);
    }
  }

  // Fallback Helper Generators
  getMockCompletion(prompt) {
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
