const axios = require('axios');
const FormData = require('form-data');

const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
const SARVAM_BASE_URL = "https://api.sarvam.ai";

class SarvamVoiceService {
  constructor() {
    this.apiKey = SARVAM_API_KEY;
  }

  getHeaders() {
    return {
      "Content-Type": "application/json",
      "api-subscription-key": this.apiKey,
    };
  }

  /**
   * Text-to-Speech using Bulbul v3
   */
  async textToSpeech(text, languageCode = "en-IN", speaker = "ritu") {
    if (!this.apiKey) {
      throw new Error("SARVAM_API_KEY is not configured in backend .env");
    }

    try {
      const response = await axios.post(
        `${SARVAM_BASE_URL}/text-to-speech`,
        {
          inputs: [text.substring(0, 2500)],
          target_language_code: languageCode,
          model: "bulbul:v2",
          speaker: "anushka",
          pace: 1.0,
        },
        {
          headers: this.getHeaders(),
          timeout: 30000,
        }
      );

      const audios = response.data.audios;
      if (audios && audios.length > 0) {
        return audios[0]; // Base64 audio string
      }
      throw new Error("No audio returned from Sarvam TTS");
    } catch (error) {
      console.error("❌ Sarvam TTS Error:", error.response?.data || error.message);
      throw new Error(`Sarvam TTS failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Speech-to-Text using Saaras v3
   */
  async speechToText(audioBuffer, filename = "audio.wav", languageCode = "en-IN") {
    if (!this.apiKey) {
      throw new Error("SARVAM_API_KEY is not configured in backend .env");
    }

    try {
      const formData = new FormData();
      formData.append("file", audioBuffer, {
        filename: filename,
        contentType: "audio/wav",
      });
      formData.append("model", "saaras:v3");
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
      };
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || error.message || "";
      console.error("❌ Sarvam STT Error:", error.response?.data || error.message);

      if (errorMsg.includes("Audio duration exceeds the maximum limit") || errorMsg.includes("30 seconds")) {
        return {
          transcript: "Candidate turn exceeded the 30-second single audio limit. Please keep verbal answers under 25 seconds per turn.",
          languageCode: languageCode
        };
      }

      throw new Error(`Sarvam STT failed: ${errorMsg}`);
    }
  }

  /**
   * Multilingual Chat Completion using Sarvam-105b
   */
  async generateRecruiterTurn({ candidateTranscript, questions, conversationHistory, languageCode = "en-IN", activeRound = "technical" }) {
    if (!this.apiKey) {
      throw new Error("SARVAM_API_KEY is not configured in backend .env");
    }

    const languageNames = {
      "en-IN": "English",
      "hi-IN": "Hindi (हिंदी)",
      "ta-IN": "Tamil (தமிழ்)",
      "te-IN": "Telugu (తెలుగు)",
      "kn-IN": "Kannada (ಕನ್ನಡ)",
      "ml-IN": "Malayalam (മലയാളം)",
      "mr-IN": "Marathi (मराठी)",
      "bn-IN": "Bengali (বাংলা)",
      "gu-IN": "Gujarati (ગુજરાતી)",
      "pa-IN": "Punjabi (ਪੰਜਾਬੀ)",
    };

    const targetLang = languageNames[languageCode] || "English";

    const roundDescriptions = {
      technical: "TECHNICAL VIVA ROUND. Focus on data structures, algorithmic complexity, code design, and technical depth.",
      behavioral: "BEHAVIORAL ROUND. Focus on past experiences, STAR method (Situation, Task, Action, Result), leadership, and handling challenges.",
      cultural: "CULTURAL FIT ROUND. Focus on core work values, team collaboration, remote communication, ethics, and company culture alignment."
    };

    const roundGoal = roundDescriptions[activeRound] || roundDescriptions.technical;

    const systemPrompt = `You are Niti AI, an encouraging and expert interviewer.
You are conducting the ${roundGoal}
Speak in ${targetLang}.

Interview Questions List for this stage:
${questions.map((q, i) => `${i + 1}. [${(q.round || activeRound).toUpperCase()}] ${q.question || q}`).join("\n")}

INSTRUCTIONS:
1. Respond naturally in ${targetLang}.
2. Keep your spoken answer brief (1-3 conversational sentences).
3. Do NOT use markdown symbols, code blocks, or bullet points in spoken text.
4. Acknowledge what the candidate said, evaluate their input based on the current ${activeRound.toUpperCase()} criteria, and guide them to the next question.
5. If all questions in this round are covered, congratulate them and transition to the next phase smoothly.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-6).map(m => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.text
      })),
      { role: "user", content: candidateTranscript }
    ];

    try {
      const response = await axios.post(
        `${SARVAM_BASE_URL}/v1/chat/completions`,
        {
          model: "sarvam-105b",
          messages: messages,
          temperature: 0.3,
          max_tokens: 300,
        },
        {
          headers: this.getHeaders(),
          timeout: 25000,
        }
      );

      const aiResponseText = response.data.choices[0]?.message?.content || "Thank you. Let's continue.";

      // Synthesize spoken audio using Sarvam TTS
      let audioBase64 = null;
      try {
        audioBase64 = await this.textToSpeech(aiResponseText, languageCode, "ritu");
      } catch (ttsErr) {
        console.warn("⚠️ Sarvam TTS failed during turn generation:", ttsErr.message);
      }

      return {
        aiResponse: aiResponseText,
        audioBase64: audioBase64,
        languageCode: languageCode,
      };
    } catch (error) {
      console.error("❌ Sarvam Chat Error:", error.response?.data || error.message);
      throw new Error(`Sarvam Chat failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

module.exports = new SarvamVoiceService();
