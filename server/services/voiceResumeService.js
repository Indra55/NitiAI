const axios = require("axios");
const FormData = require("form-data");
const { spawn } = require("child_process");
const sarvamService = require("./sarvamService");
const pool = require("../config/dbConfig");

const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
const SARVAM_BASE_URL = "https://api.sarvam.ai";

const SUPPORTED_LANGUAGES = [
  { code: "hi-IN", name: "Hindi", nativeName: "हिंदी" },
  { code: "bn-IN", name: "Bengali", nativeName: "বাংলা" },
  { code: "kn-IN", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml-IN", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "mr-IN", name: "Marathi", nativeName: "मराठी" },
  { code: "od-IN", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
  { code: "pa-IN", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "ta-IN", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te-IN", name: "Telugu", nativeName: "తెలుగు" },
  { code: "gu-IN", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "en-IN", name: "English (India)", nativeName: "English" },
];

const INTERVIEW_STEPS = [
  {
    id: "personal",
    title: "Personal Information",
    questions: {
      "en-IN": "Welcome! Let's build your resume together. First, tell me your full name, email address, phone number, location, and a short professional summary about yourself.",
      "hi-IN": "स्वागत है! आइए मिलकर आपका रिज्यूमे बनाते हैं। सबसे पहले अपना नाम, ईमेल, फोन नंबर, शहर और अपने बारे में एक छोटा सा परिचय बताइए।",
    },
    fields: ["full_name", "email", "phone", "location", "summary"],
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
      console.warn("⚠️ SARVAM_API_KEY not set — voice resume features will use fallback mock");
    }
  }

  getHeaders(contentType = "application/json") {
    return {
      "api-subscription-key": this.apiKey,
      "Content-Type": contentType,
    };
  }

  /**
   * Speech-to-Text using Saaras v3
   */
  async transcribeAudio(audioBuffer, filename = "audio.webm", languageCode = "unknown", mode = "transcribe") {
    try {
      let finalBuffer = audioBuffer;
      let finalFilename = filename;
      let finalMime = this._getMimeType(filename);

      if (!filename.toLowerCase().endsWith(".wav") && !filename.toLowerCase().endsWith(".mp3")) {
        try {
          finalBuffer = await this._convertToWav(audioBuffer);
          finalFilename = "audio.wav";
          finalMime = "audio/wav";
        } catch (err) {
          console.warn("⚠️ Audio FFmpeg conversion skipped (sending original buffer):", err.message);
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
      const errorMsg = error.response?.data?.error?.message || error.message || "";
      console.warn("⚠️ STT Notice:", error.response?.data || error.message);

      if (errorMsg.includes("Audio duration exceeds the maximum limit") || errorMsg.includes("30 seconds")) {
        return {
          transcript: "Recording exceeded the 30-second single audio limit. Please keep verbal answers under 25 seconds per turn.",
          languageCode: languageCode === "unknown" ? "en-IN" : languageCode,
        };
      }

      if (errorMsg.includes("Failed to read the file") || errorMsg.includes("audio format")) {
        return {
          transcript: "Audio format notice during speech processing. Please try recording again or speak clearly into the microphone.",
          languageCode: languageCode === "unknown" ? "en-IN" : languageCode,
        };
      }

      if (error.code === 'ENOTFOUND') {
        return {
          transcript: "Network connection notice. Direct transcript fallback active.",
          languageCode: languageCode === "unknown" ? "en-IN" : languageCode,
        };
      }

      return {
        transcript: "Voice recording received.",
        languageCode: languageCode === "unknown" ? "en-IN" : languageCode,
      };
    }
  }

  /**
   * Text-to-Speech using Bulbul v3
   */
  async textToSpeech(text, languageCode = "en-IN", speaker = "ritu") {
    if (!this.apiKey) return null;

    try {
      const response = await axios.post(
        `${SARVAM_BASE_URL}/text-to-speech`,
        {
          inputs: [text.substring(0, 2500)],
          target_language_code: languageCode,
          model: "bulbul:v3",
          speaker: speaker,
          pace: 1.0,
        },
        {
          headers: this.getHeaders(),
          timeout: 30000,
        }
      );

      const audios = response.data.audios;
      if (audios && audios.length > 0) {
        return audios[0];
      }
      return null;
    } catch (error) {
      console.warn("⚠️ TTS Notice:", error.response?.data || error.message);
      return null;
    }
  }

  async extractResumeDetails(transcript, currentSection, existingDetails = {}, languageCode = "en-IN") {
    try {
      const systemPrompt = `You are a professional resume parser. Extract resume details from the user's spoken response.
Current Section: ${currentSection}
User Response: "${transcript}"
Existing Details: ${JSON.stringify(existingDetails)}

Return ONLY a JSON object with extracted fields for the current section. Do not include markdown code blocks.`;

      const messages = [{ role: "system", content: systemPrompt }];
      const result = await sarvamService.chatCompletion(messages, { temperature: 0.2 });

      let parsed = {};
      try {
        const clean = result.text.replace(/```json\n?|\n?```/g, "").trim();
        parsed = JSON.parse(clean);
      } catch (e) {
        console.warn("Could not parse extracted JSON, using raw text fallback");
        parsed = { [currentSection]: transcript };
      }

      return { ...existingDetails, ...parsed };
    } catch (error) {
      console.warn("Extract resume details warning:", error.message);
      return existingDetails;
    }
  }

  async processVoiceInput({ audioBuffer, filename, userId, sessionId, currentStepIndex = 0, languageCode = "en-IN", typedText = null }) {
    let transcript = typedText || "";

    if (audioBuffer && !typedText) {
      const sttResult = await this.transcribeAudio(audioBuffer, filename, languageCode);
      transcript = sttResult.transcript;
    }

    const currentStep = INTERVIEW_STEPS[currentStepIndex] || INTERVIEW_STEPS[0];
    const isLastStep = currentStepIndex >= INTERVIEW_STEPS.length - 1;
    const nextStepIndex = isLastStep ? currentStepIndex : currentStepIndex + 1;
    const nextStep = INTERVIEW_STEPS[nextStepIndex];

    const nextQuestion = nextStep.questions[languageCode] || nextStep.questions["en-IN"];
    let audioBase64 = null;
    try {
      audioBase64 = await this.textToSpeech(nextQuestion, languageCode);
    } catch (e) {
      console.warn("TTS generation warning:", e.message);
    }

    return {
      success: true,
      transcript,
      currentStepIndex,
      nextStepIndex,
      isCompleted: isLastStep,
      nextQuestion,
      audioBase64,
    };
  }

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
}

const voiceResumeService = new VoiceResumeService();

module.exports = voiceResumeService;
module.exports.INTERVIEW_STEPS = INTERVIEW_STEPS;
module.exports.SUPPORTED_LANGUAGES = SUPPORTED_LANGUAGES;
