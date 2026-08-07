/**
 * Voice Resume Routes
 * 
 * Endpoints for the voice-based resume builder feature.
 * Uses Sarvam AI for STT, TTS, Translation, and AI structuring.
 */

const express = require("express");
const router = express.Router();
const multer = require("multer");
const voiceResumeService = require("../services/voiceResumeService");
const { INTERVIEW_STEPS, SUPPORTED_LANGUAGES } = require("../services/voiceResumeService");

// Configure multer for audio file uploads (in-memory)
const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "audio/webm",
      "audio/wav",
      "audio/mpeg",
      "audio/mp3",
      "audio/ogg",
      "audio/flac",
      "audio/mp4",
      "audio/aac",
      "audio/opus",
      "audio/x-wav",
      "audio/x-m4a",
      "video/webm", // Some browsers report webm audio as video/webm
    ];
    if (allowedMimes.includes(file.mimetype) || file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported audio format: ${file.mimetype}`), false);
    }
  },
});

/**
 * POST /api/voice-resume/start-session
 * 
 * Initialize a voice resume session. Returns the first question
 * and optionally TTS audio for it.
 * 
 * Body: { language?: string, enableTTS?: boolean }
 * Response: { sessionId, question, questionAudio?, languages, totalSteps }
 */
router.post("/start-session", async (req, res) => {
  try {
    const { language = "en-IN", enableTTS = false } = req.body || {};

    // Get the first question
    const question = voiceResumeService.getStepQuestion(0, language);
    let aiResponse = question.text;

    // Translate to the selected language if not English and not pre-defined
    if (language !== "en-IN" && language !== "hi-IN") {
      try {
        const translation = await voiceResumeService.translateText(aiResponse, "en-IN", language);
        aiResponse = translation.translatedText;
      } catch (err) {
        console.warn("⚠️ Translation for initial question failed:", err.message);
      }
    }

    let questionAudio = null;
    if (enableTTS) {
      try {
        questionAudio = await voiceResumeService.textToSpeech(aiResponse, language);
      } catch (ttsErr) {
        console.warn("⚠️ TTS for first question failed:", ttsErr.message);
      }
    }

    // Generate a simple session ID
    const sessionId = `vr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    res.json({
      success: true,
      sessionId,
      aiResponse,
      aiResponseAudio: questionAudio,
      languages: SUPPORTED_LANGUAGES,
    });
  } catch (error) {
    console.error("❌ Start session error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/voice-resume/process-audio
 * 
 * Accept an audio recording, transcribe it, translate (if needed),
 * structure into resume JSON, and return the next question.
 * 
 * Body: multipart/form-data
 *   - audio: audio file
 *   - language: BCP-47 language code
 *   - currentResumeData: JSON string of accumulated resume data
 *   - conversationHistory: JSON string of chat history
 *   - enableTTS: boolean string
 * 
 * Response: { originalTranscript, englishTranscript, extractedData, aiResponse, aiResponseAudio? }
 */
router.post("/process-audio", audioUpload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No audio file provided" });
    }

    const {
      language = "unknown",
      currentResumeData = "{}",
      conversationHistory = "[]",
      enableTTS = "false",
    } = req.body;

    const parsedResumeData = JSON.parse(currentResumeData);
    const parsedHistory = JSON.parse(conversationHistory);

    console.log(`🎤 Processing conversational audio`);
    console.log(`   Audio: ${req.file.originalname}, Size: ${req.file.size} bytes, MIME: ${req.file.mimetype}`);

    // Process the voice input through the full pipeline
    const result = await voiceResumeService.processVoiceInput(
      req.file.buffer,
      req.file.originalname || "recording.webm",
      language,
      parsedHistory,
      parsedResumeData
    );

    // Use the explicitly selected language for the AI's response to prevent switching mid-way
    const effectiveLanguage = language !== "unknown" ? language : (result.detectedLanguage || "en-IN");

    let aiResponseAudio = null;
    if (enableTTS === "true" && result.aiResponse) {
      try {
        let textToSpeak = result.aiResponse;
        
        // Translate AI response back to user language if not English
        if (effectiveLanguage !== "en-IN") {
           const translation = await voiceResumeService.translateText(result.aiResponse, "en-IN", effectiveLanguage);
           textToSpeak = translation.translatedText;
        }

        aiResponseAudio = await voiceResumeService.textToSpeech(
          textToSpeak,
          effectiveLanguage
        );
      } catch (ttsErr) {
        console.warn("⚠️ TTS for AI response failed:", ttsErr.message);
      }
    }

    res.json({
      success: true,
      originalTranscript: result.originalTranscript,
      englishTranscript: result.englishTranscript,
      detectedLanguage: result.detectedLanguage,
      extractedData: result.extractedData,
      aiResponse: result.aiResponse,
      aiResponseAudio,
    });
  } catch (error) {
    console.error("❌ Process audio error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/voice-resume/tts
 * 
 * Generate TTS audio for arbitrary text (e.g., re-reading a question)
 * 
 * Body: { text, language, speaker? }
 * Response: { audio } (base64-encoded)
 */
router.post("/tts", async (req, res) => {
  try {
    const { text, language = "en-IN", speaker = "ritu" } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, error: "No text provided" });
    }

    const audio = await voiceResumeService.textToSpeech(text, language, speaker);

    res.json({
      success: true,
      audio,
    });
  } catch (error) {
    console.error("❌ TTS error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/voice-resume/languages
 * 
 * Return list of supported languages
 */
router.get("/languages", (req, res) => {
  res.json({
    success: true,
    languages: SUPPORTED_LANGUAGES,
    steps: INTERVIEW_STEPS.map((s) => ({
      id: s.id,
      title: s.title,
      fields: s.fields,
    })),
  });
});

/**
 * POST /api/voice-resume/translate-question
 * 
 * Translate a question to the user's language
 * 
 * Body: { stepIndex, targetLanguage }
 */
router.post("/translate-question", async (req, res) => {
  try {
    const { stepIndex = 0, targetLanguage = "hi-IN" } = req.body;

    const question = voiceResumeService.getStepQuestion(stepIndex, "en-IN");
    if (!question) {
      return res.status(400).json({ success: false, error: "Invalid step index" });
    }

    // Check if we have a pre-translated version
    const step = INTERVIEW_STEPS[stepIndex];
    if (step.questions[targetLanguage]) {
      return res.json({
        success: true,
        translatedText: step.questions[targetLanguage],
        originalText: question.text,
      });
    }

    // Otherwise translate on-the-fly
    const translation = await voiceResumeService.translateText(
      question.text,
      "en-IN",
      targetLanguage
    );

    res.json({
      success: true,
      translatedText: translation.translatedText,
      originalText: question.text,
    });
  } catch (error) {
    console.error("❌ Translate question error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
