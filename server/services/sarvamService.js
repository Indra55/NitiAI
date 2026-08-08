const axios = require('axios');
const FormData = require('form-data');

/**
 * SarvamService - Unified client for Sarvam AI models
 * Supports:
 * - Sarvam Translate (22 Indian languages)
 * - Saaras V3 (Speech-to-Text with code-mixing)
 * - Bulbul V3 (Text-to-Speech across 11 Indian languages)
 * - Sarvam 105B / 30B / Mayura (Multilingual LLM reasoning & prompt completion)
 * - Sarvam Vision (3B Vision-Language OCR model)
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
   * Feature 1 & 7: Translate text into target Indic language (Sarvam Translate)
   */
  async translateContent(text, targetLang = 'hi-IN') {
    if (!this.isConfigured()) {
      return this.getMockTranslation(text, targetLang);
    }
    try {
      const response = await axios.post(
        `${this.baseUrl}/translate`,
        {
          input: text,
          target_language_code: targetLang,
          model: 'sarvam-translate'
        },
        { headers: { 'api-subscription-key': this.apiKey } }
      );
      return response.data;
    } catch (error) {
      console.warn('Sarvam Translate API call failed, using fallback:', error.message);
      return this.getMockTranslation(text, targetLang);
    }
  }

  /**
   * Feature 2, 3, 5: Speech-to-Text with Code-Mixing (Saaras V3)
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
   * Feature 2, 3, 5, 6: Text-to-Speech (Bulbul V3)
   */
  async textToSpeech(text, targetLanguage = 'hi-IN', speaker = 'meera') {
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
          model: 'bulbul-v3'
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
   * Feature 1, 2, 4, 5: LLM Reasoning (Sarvam 105B / 30B / Mayura)
   */
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

  /**
   * Feature 6: Handwritten Code OCR (Sarvam Vision)
   */
  async parseHandwrittenCode(imageBuffer) {
    if (!this.isConfigured() || !imageBuffer) {
      return {
        extractedText: 'function twoSum(nums, target) {\n  let map = new Map();\n  for(let i=0; i<nums.length; i++) {\n    let diff = target - nums[i];\n    if(map.has(diff)) return [map.get(diff), i];\n    map.set(nums[i], i);\n  }\n}',
        confidence: 0.94,
        marginNotes: 'Check boundary condition when nums is empty'
      };
    }
    try {
      const formData = new FormData();
      formData.append('file', imageBuffer, { filename: 'handwritten_code.png' });
      formData.append('model', 'sarvam-vision');

      const response = await axios.post(`${this.baseUrl}/vision/ocr`, formData, {
        headers: { ...formData.getHeaders(), 'api-subscription-key': this.apiKey }
      });
      return response.data;
    } catch (error) {
      console.warn('Sarvam Vision OCR failed, using fallback:', error.message);
      return {
        extractedText: 'function example() { console.log("Extracted handwritten code"); }',
        confidence: 0.88,
        marginNotes: 'Extracted via fallback OCR'
      };
    }
  }

  // Fallback Helper Generators
  getMockTranslation(text, targetLang) {
    return {
      translated_text: `[Sarvam Translate (${targetLang})]: ${text}`,
      source_language: 'en-IN',
      target_language: targetLang
    };
  }

  getMockCompletion(prompt) {
    if (prompt.includes('STAR')) {
      return JSON.stringify({
        situationScore: 85,
        taskScore: 90,
        actionScore: 88,
        resultScore: 82,
        overallScore: 86,
        feedback: 'Aapka response structured tha. Aapne situation aur action ko achha explain kiya. Result me quantified metrics add karne se score aur improve hoga.'
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
    if (prompt.includes('skill') || prompt.includes('Resume')) {
      return JSON.stringify({
        extractedSkills: ['Redis', 'Node.js', 'PostgreSQL', 'Docker'],
        probingQuestions: [
          { skill: 'Redis', question: 'Aapne resume me Redis caching likha hai. Aapne cache eviction policy (LRU vs LFU) kaise choose ki thi?' },
          { skill: 'Docker', question: 'Production multi-stage Docker builds me image size reduce karne ke liye aapne kya steps follow kiye?' }
        ]
      });
    }
    return `[Sarvam AI Response]: Focused Indic technical analysis for your query. Key recommendation: Focus on core logic and time complexity.`;
  }
}

module.exports = new SarvamService();
