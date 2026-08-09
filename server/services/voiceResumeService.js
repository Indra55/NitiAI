/**
 * Voice Resume Service
 * 
 * Wraps Sarvam AI APIs for the voice-based resume builder:
 * - Speech-to-Text (Saaras v3) — transcribe user's spoken words
 * - Text-to-Speech (Bulbul v3) — read AI questions aloud
 * - Translation (Mayura v1) — translate to/from English
 * - Chat Completion (Sarvam 105B) — structure raw speech into resume JSON
 */

const axios = require("axios");
const FormData = require("form-data");
const { spawn } = require("child_process");

const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
const SARVAM_BASE_URL = "https://api.sarvam.ai";

// Supported languages for STT/TTS
const SUPPORTED_LANGUAGES = {
  "hi-IN": "Hindi",
  "bn-IN": "Bengali",
  "kn-IN": "Kannada",
  "ml-IN": "Malayalam",
  "mr-IN": "Marathi",
  "od-IN": "Odia",
  "pa-IN": "Punjabi",
  "ta-IN": "Tamil",
  "te-IN": "Telugu",
  "en-IN": "English",
  "gu-IN": "Gujarati",
};

// Interview step definitions
const INTERVIEW_STEPS = [
  {
    id: "personal",
    title: "Personal Info",
    questions: {
      "en-IN": "Let's start building your resume! What's your full name, and can you share your email, phone number, and city?",
      "hi-IN": "चलिए आपका रिज़्यूमे बनाना शुरू करते हैं! आपका पूरा नाम क्या है? साथ ही अपना ईमेल, फ़ोन नंबर और शहर बताइए।",
    },
    fields: ["name", "email", "phone", "location"],
  },
  {
    id: "summary",
    title: "Professional Summary",
    questions: {
      "en-IN": "Great! Now tell me about yourself — what kind of work do you do? What's your current role or the role you're looking for?",
      "hi-IN": "बढ़िया! अब मुझे अपने बारे में बताइए — आप किस तरह का काम करते हैं? आपकी मौजूदा भूमिका क्या है या आप क्या ढूंढ रहे हैं?",
    },
    fields: ["title", "summary"],
  },
  {
    id: "education",
    title: "Education",
    questions: {
      "en-IN": "Where did you study? Tell me about your education — the degree, institution name, and when you graduated.",
      "hi-IN": "आपने कहाँ पढ़ाई की? अपनी शिक्षा के बारे में बताइए — डिग्री, कॉलेज का नाम, और कब पास किया।",
    },
    fields: ["education"],
  },
  {
    id: "experience",
    title: "Work Experience",
    questions: {
      "en-IN": "Now let's talk about your work experience. Tell me about your jobs — the company name, your role, how long you worked there, and what you did.",
      "hi-IN": "अब आपके काम के अनुभव के बारे में बात करते हैं। अपनी नौकरियों के बारे में बताइए — कंपनी का नाम, आपकी भूमिका, कितने समय तक काम किया, और क्या-क्या किया।",
    },
    fields: ["experience"],
  },
  {
    id: "skills",
    title: "Skills",
    questions: {
      "en-IN": "What skills and tools do you know? Tell me about your technical skills like programming languages, software, and also any soft skills.",
      "hi-IN": "आपको कौन-कौन से स्किल्स और टूल्स आते हैं? अपने टेक्निकल स्किल्स जैसे प्रोग्रामिंग लैंग्वेज, सॉफ्टवेयर और सॉफ्ट स्किल्स बताइए।",
    },
    fields: ["technical_skills", "soft_skills"],
  },
  {
    id: "projects",
    title: "Projects & Certifications",
    questions: {
      "en-IN": "Last one! Do you have any notable projects or certifications you'd like to include? Tell me about them.",
      "hi-IN": "आखिरी सवाल! क्या कोई खास प्रोजेक्ट्स या सर्टिफिकेशन हैं जो आप शामिल करना चाहेंगे? मुझे बताइए।",
    },
    fields: ["projects", "certifications"],
  },
];

class VoiceResumeService {
  constructor() {
    this.apiKey = SARVAM_API_KEY;
    if (!this.apiKey) {
      console.warn("⚠️ SARVAM_API_KEY not set — voice resume features will be disabled");
    }
  }

  /**
   * Get common headers for Sarvam API calls
   */
  getHeaders(contentType = "application/json") {
    return {
      "api-subscription-key": this.apiKey,
      "Content-Type": contentType,
    };
  }

  /**
   * Speech-to-Text using Saaras v3
   * Transcribes audio buffer to text, with optional translation mode
   * 
   * @param {Buffer} audioBuffer - Raw audio data
   * @param {string} filename - Original filename for format detection
   * @param {string} languageCode - BCP-47 language code (e.g., "hi-IN") or "unknown" for auto-detect
   * @param {string} mode - "transcribe" | "translate" (translate = to English)
   * @returns {Promise<{transcript: string, languageCode: string}>}
   */
  async transcribeAudio(audioBuffer, filename = "audio.webm", languageCode = "unknown", mode = "transcribe") {
    try {
      // Ensure the audio is in WAV format since Sarvam STT struggles with WebM
      let finalBuffer = audioBuffer;
      let finalFilename = filename;
      let finalMime = this._getMimeType(filename);

      if (!filename.toLowerCase().endsWith(".wav") && !filename.toLowerCase().endsWith(".mp3")) {
        console.log(`🎙️ Converting ${filename} to WAV for STT...`);
        try {
          finalBuffer = await this._convertToWav(audioBuffer);
          finalFilename = "audio.wav";
          finalMime = "audio/wav";
          console.log(`✅ Conversion successful (${finalBuffer.length} bytes)`);
        } catch (err) {
          console.warn("⚠️ Audio conversion failed, proceeding with original buffer:", err.message);
        }
      }

      const formData = new FormData();
      formData.append("file", finalBuffer, {
        filename: finalFilename,
        contentType: finalMime,
      });
      formData.append("model", "saaras:v3");
      formData.append("mode", mode);
      if (languageCode && languageCode !== "unknown") {
        formData.append("language_code", languageCode);
      }

      const response = await axios.post(
        `${SARVAM_BASE_URL}/speech-to-text`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            "api-subscription-key": this.apiKey,
          },
          timeout: 30000,
        }
      );

      return {
        transcript: response.data.transcript,
        languageCode: response.data.language_code || languageCode,
        requestId: response.data.request_id,
      };
    } catch (error) {
      console.error("❌ STT Error:", error.response?.data || error.message);
      throw new Error(`Speech-to-text failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Text-to-Speech using Bulbul v3
   * Converts text to speech, returns base64-encoded audio
   * 
   * @param {string} text - Text to convert
   * @param {string} languageCode - BCP-47 language code
   * @param {string} speaker - Voice name (e.g., "ritu", "aditya")
   * @returns {Promise<string>} Base64-encoded audio
   */
  async textToSpeech(text, languageCode = "en-IN", speaker = "ritu") {
    try {
      const response = await axios.post(
        `${SARVAM_BASE_URL}/text-to-speech`,
        {
          text: text.substring(0, 2500), // Bulbul v3 max 2500 chars
          language_code: languageCode,
          model: "bulbul:v3",
          speaker: speaker,
          pace: 1.0,
        },
        {
          headers: this.getHeaders(),
          timeout: 30000,
        }
      );

      // Response contains audios array of base64 strings
      const audios = response.data.audios;
      if (audios && audios.length > 0) {
        return audios.join(""); // Concatenate all audio chunks
      }
      throw new Error("No audio data in response");
    } catch (error) {
      console.error("❌ TTS Error:", error.response?.data || error.message);
      throw new Error(`Text-to-speech failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Translate text using Mayura v1
   * 
   * @param {string} text - Input text
   * @param {string} sourceLanguage - Source BCP-47 code
   * @param {string} targetLanguage - Target BCP-47 code
   * @returns {Promise<{translatedText: string, sourceLanguageCode: string}>}
   */
  async translateText(text, sourceLanguage = "auto", targetLanguage = "en-IN") {
    try {
      const response = await axios.post(
        `${SARVAM_BASE_URL}/translate`,
        {
          input: text.substring(0, 1000), // Mayura v1 max 1000 chars
          source_language_code: sourceLanguage,
          target_language_code: targetLanguage,
          model: "mayura:v1",
          mode: "formal",
        },
        {
          headers: this.getHeaders(),
          timeout: 15000,
        }
      );

      return {
        translatedText: response.data.translated_text,
        sourceLanguageCode: response.data.source_language_code,
      };
    } catch (error) {
      console.error("❌ Translation Error:", error.response?.data || error.message);
      throw new Error(`Translation failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Conversational Agent: Analyzes transcript, updates resume data, and generates next question
   */
  async processConversationalTurn(transcript, conversationHistory = [], currentResumeData = {}) {
    const systemPrompt = `You are a friendly, professional AI recruiter conducting a voice interview to build a resume.
You will be provided with:
1. The current state of the user's resume (JSON)
2. The recent conversation history
3. The latest transcript of what the user just said

Your job is to return a JSON object containing TWO things:
1. "extracted_data": A JSON object containing ANY new or corrected resume fields extracted from the user's latest transcript. If the user corrects something (e.g. "change my title to X"), output the corrected data. If there is no new data, return an empty object {}.
2. "ai_response": Your natural, conversational spoken reply to the user. Acknowledge what they said, then ask for the next missing piece of information (Name/Email/Phone/Location, Professional Summary, Education, Experience, Skills, Projects). Use one concise sentence, maximum 24 words. DO NOT use markdown or bullet points.

IMPORTANT:
- Output strictly JSON.
- If the user corrects past info, ensure extracted_data reflects it.
- Format arrays properly and use reasonable date formats.
- The user is speaking, so interpret informal language gracefully.

Return format:
{
  "extracted_data": { 
     "name": "...", 
     "experience": [...],
     // etc
  },
  "ai_response": "..."
}`;

    const userPrompt = `CURRENT RESUME DATA:
${JSON.stringify(currentResumeData)}

RECENT CONVERSATION HISTORY:
${JSON.stringify(conversationHistory.slice(-6))}

LATEST USER TRANSCRIPT:
"${transcript}"`;

    try {
      const response = await axios.post(
        `${SARVAM_BASE_URL}/v1/chat/completions`,
        {
          model: "sarvam-105b",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.1,
          max_tokens: 600,
        },
        {
          headers: this.getHeaders(),
          timeout: 30000,
        }
      );

      const message = response.data.choices?.[0]?.message;
      const rawContent = message?.content ?? response.data.choices?.[0]?.text ?? response.data.output_text;
      const content = Array.isArray(rawContent)
        ? rawContent.map((part) => typeof part === "string" ? part : part?.text || "").join("")
        : rawContent;
      if (!content) throw new Error("Empty response from chat completion");

      const jsonContent = String(content).replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
      const parsed = JSON.parse(jsonContent);
      return parsed;
    } catch (error) {
      console.error("❌ Conversational AI Error Details:");
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", JSON.stringify(error.response.data, null, 2));
      } else {
        console.error(error.message);
      }
      // Keep the call moving even if the model returns an empty/malformed completion.
      // Capture the common personal-info patterns locally so the current answer is not lost.
      const fallbackData = {};
      const nameMatch = transcript.match(/(?:my\s+)?(?:full\s+)?name\s+is\s+([a-z][a-z .'-]{1,80})/i);
      const emailMatch = transcript.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i);
      const phoneMatch = transcript.match(/(?:\+?\d[\d\s().-]{7,}\d)/);
      if (nameMatch) fallbackData.name = nameMatch[1].trim().replace(/[.,]$/, "");
      if (emailMatch) fallbackData.email = emailMatch[0];
      if (phoneMatch) fallbackData.phone = phoneMatch[0].trim();
      return {
        extracted_data: fallbackData,
        ai_response: fallbackData.name
          ? `Thanks, ${fallbackData.name}. What email address should I use for your resume?`
          : "Thanks, I got that. Tell me a little more about your experience."
      };
    }
  }

  /**
   * Get the interview question for a step, optionally translated
   */
  getStepQuestion(stepIndex, languageCode = "en-IN") {
    if (stepIndex >= INTERVIEW_STEPS.length) return null;
    const step = INTERVIEW_STEPS[stepIndex];
    // Return pre-translated if available, otherwise English
    return {
      text: step.questions[languageCode] || step.questions["en-IN"],
      stepId: step.id,
      stepTitle: step.title,
      stepIndex: stepIndex,
      totalSteps: INTERVIEW_STEPS.length,
      fields: step.fields,
    };
  }

  /**
   * Full processing pipeline for a single conversational turn:
   * Audio → STT → Translate (if needed) → Conversational LLM → Return
   */
  async processVoiceInput(audioBuffer, filename, languageCode = "unknown", conversationHistory = [], currentResumeData = {}) {
    console.log(`🎤 Processing voice input, language: ${languageCode}`);

    // Step 1: Transcribe audio
    const sttResult = await this.transcribeAudio(audioBuffer, filename, languageCode, "transcribe");
    console.log(`📝 Transcript (${sttResult.languageCode}): ${sttResult.transcript}`);

    // Step 2: If not English, also get English translation for structuring
    let englishTranscript = sttResult.transcript;
    const detectedLang = sttResult.languageCode;

    if (detectedLang && detectedLang !== "en-IN") {
      try {
        const translateResult = await this.translateText(
          sttResult.transcript,
          detectedLang,
          "en-IN"
        );
        englishTranscript = translateResult.translatedText;
        console.log(`🌐 Translated to English: ${englishTranscript}`);
      } catch (err) {
        console.warn("⚠️ Translation failed, using original transcript:", err.message);
      }
    }

    // Step 3: Pass to Conversational AI to extract data AND generate response
    const aiResult = await this.processConversationalTurn(englishTranscript, conversationHistory, currentResumeData);

    return {
      originalTranscript: sttResult.transcript,
      detectedLanguage: detectedLang,
      englishTranscript,
      extractedData: aiResult.extracted_data || {},
      aiResponse: aiResult.ai_response || "Got it. What's next?",
      requestId: sttResult.requestId,
    };
  }

  // ==================== Private Helpers ====================

  /**
   * Convert an audio buffer to a WAV buffer (16kHz, mono) using ffmpeg
   * 
   * @param {Buffer} inputBuffer - The original audio buffer
   * @returns {Promise<Buffer>} - The converted WAV buffer
   */
  _convertToWav(inputBuffer) {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn("ffmpeg", [
        "-i", "pipe:0",
        "-f", "wav",
        "-ar", "16000",
        "-ac", "1",
        "pipe:1"
      ]);
      const chunks = [];
      ffmpeg.stdout.on("data", (chunk) => chunks.push(chunk));
      ffmpeg.on("close", (code) => {
        if (code === 0) {
          resolve(Buffer.concat(chunks));
        } else {
          reject(new Error(`ffmpeg exited with code ${code}`));
        }
      });
      ffmpeg.on("error", (err) => reject(err));
      ffmpeg.stdin.write(inputBuffer);
      ffmpeg.stdin.end();
    });
  }

  _getMimeType(filename) {
    const ext = filename.split(".").pop()?.toLowerCase();
    const mimeMap = {
      wav: "audio/wav",
      mp3: "audio/mpeg",
      webm: "audio/webm",
      ogg: "audio/ogg",
      flac: "audio/flac",
      m4a: "audio/mp4",
      aac: "audio/aac",
      opus: "audio/opus",
    };
    return mimeMap[ext] || "audio/webm";
  }

  // _getExtractionPrompt and _fallbackExtraction removed as they are obsolete
}

// Export singleton + constants
const voiceResumeService = new VoiceResumeService();

module.exports = voiceResumeService;
module.exports.INTERVIEW_STEPS = INTERVIEW_STEPS;
module.exports.SUPPORTED_LANGUAGES = SUPPORTED_LANGUAGES;
