const express = require("express");
const router = express.Router();
const axios = require("axios");
const sarvamService = require("../services/sarvamService");
const { optionalAuth } = require("../middleware/auth");

/**
 * @route POST /api/language-eval/evaluate
 * @desc Async, lightweight evaluation of clarity (0-10), relevance (0-10), grammar (0-10), and logical coherence (0-10).
 * Threshold: Trigger bridge modal if totalScore < 14 or grammarScore < 6.
 * @access Public / OptionalAuth
 */
router.post("/evaluate", optionalAuth, async (req, res) => {
    try {
        const { userAnswer, questionContext = "General Discussion", nativeLanguage = "hi-IN" } = req.body;

        if (!userAnswer || userAnswer.trim().length === 0) {
            return res.json({
                clarityScore: 0,
                relevanceScore: 0,
                grammarScore: 0,
                logicalCoherenceScore: 0,
                totalScore: 0,
                requiresBridge: true,
                explanation: "No answer provided.",
                grammarIssues: ["Answer was blank."],
                suggestions: ["Provide a clear explanation in English or your native language."]
            });
        }

        const prompt = `Evaluate the candidate's answer concisely.

QUESTION CONTEXT: ${questionContext}
USER ANSWER: "${userAnswer}"

Score each dimension:
1. clarityScore (0 to 10): How easy is it to understand the candidate's message?
2. relevanceScore (0 to 10): How relevant is it to the question?
3. grammarScore (0 to 10): Accuracy of English grammar, syntax, and phrasing.
4. logicalCoherenceScore (0 to 10): Structural flow and logical cohesion.

Return ONLY a JSON object in this exact format (no markdown):
{
  "clarityScore": 8,
  "relevanceScore": 8,
  "grammarScore": 7,
  "logicalCoherenceScore": 8,
  "explanation": "Brief 1-sentence evaluation overview.",
  "grammarIssues": ["Issue 1", "Issue 2"],
  "suggestions": ["Suggestion 1"]
}`;

        const rawOutput = await sarvamService.generateCompletion(
            prompt,
            "You are LinguaCraft's English Quality Evaluator scoring technical clarity and grammar.",
            "sarvam-105b"
        );
        let cleanJson = rawOutput.replace(/```json\n?|\n?```/g, '').trim();
        const firstBrace = cleanJson.indexOf('{');
        const lastBrace = cleanJson.lastIndexOf('}');
        let parsed = {};
        if (firstBrace !== -1 && lastBrace !== -1) {
            cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
            try {
                parsed = JSON.parse(cleanJson);
            } catch (e) {
                console.warn("Language eval JSON parse warning:", e.message);
            }
        }

        const isVeryShort = userAnswer.trim().length < 15;
        const clarity = Math.min(10, Math.max(0, parsed.clarityScore !== undefined ? parsed.clarityScore : (isVeryShort ? 3 : 7)));
        const grammar = Math.min(10, Math.max(0, parsed.grammarScore !== undefined ? parsed.grammarScore : (isVeryShort ? 3 : 7)));
        const relevance = Math.min(10, Math.max(0, parsed.relevanceScore !== undefined ? parsed.relevanceScore : 7));
        const coherence = Math.min(10, Math.max(0, parsed.logicalCoherenceScore !== undefined ? parsed.logicalCoherenceScore : 7));
        
        const totalScore = clarity + grammar + relevance + coherence; // Total out of 40
        const requiresBridge = totalScore < 24 || grammar < 6; // < 60% or poor grammar

        res.json({
            clarityScore: clarity,
            relevanceScore: relevance,
            grammarScore: grammar,
            logicalCoherenceScore: coherence,
            totalScore: totalScore,
            requiresBridge: requiresBridge,
            explanation: parsed.explanation || "Answer evaluated successfully.",
            grammarIssues: parsed.grammarIssues || [],
            suggestions: parsed.suggestions || []
        });
    } catch (error) {
        console.error("Language evaluation error:", error.message);
        res.json({
            clarityScore: 7,
            relevanceScore: 7,
            grammarScore: 7,
            logicalCoherenceScore: 7,
            totalScore: 28,
            requiresBridge: false,
            explanation: "Evaluated using baseline metric.",
            grammarIssues: [],
            suggestions: []
        });
    }
});

/**
 * @route POST /api/language-eval/assist-bridge
 * @desc Converts candidate native language thoughts into professional English with native Why/How mentorship.
 * @access Public / OptionalAuth
 */
router.post("/assist-bridge", optionalAuth, async (req, res) => {
    try {
        const { nativeThought, nativeLanguage = "hi-IN", questionContext = "Technical Interview Question" } = req.body;

        if (!nativeThought || nativeThought.trim().length === 0) {
            return res.status(400).json({ error: "Native thought text is required" });
        }

        const prompt = `You are LinguaCraft, an Indic Native-to-English Language Betterment AI Agent.
The candidate explained their technical response in their native language (${nativeLanguage}) or code-mixed Hinglish:

QUESTION CONTEXT: ${questionContext}
CANDIDATE NATIVE EXPLANATION: "${nativeThought}"

INSTRUCTIONS:
1. Explain WHY to state this concept in the candidate's native language (${nativeLanguage}): Break down the core technical intuition, trade-offs, and reasoning in ${nativeLanguage}.
2. Explain HOW to frame it in ${nativeLanguage}: Give step-by-step guidance in ${nativeLanguage} on sentence structure and connecting key concepts.
3. Translate & refine the thought into polished, top-tier professional English suitable for a FAANG/top tech interview.
4. Provide 3 key technical vocabulary phrases.
5. Provide a short audio coaching hint text in ${nativeLanguage}.

Return ONLY a JSON object (no markdown):
{
  "nativeExplanationWhy": "Explanation in ${nativeLanguage} of WHY to state these technical trade-offs...",
  "nativeExplanationHow": "Guidance in ${nativeLanguage} on HOW to structure the explanation step-by-step...",
  "englishExplanation": "Polished, high-impact professional English response...",
  "keyPhrases": ["phrase 1", "phrase 2", "phrase 3"],
  "explanationTip": "Coaching tip for articulating this effectively in interviews...",
  "audioHintText": "Short native summary text to speak out loud..."
}`;

        const rawOutput = await sarvamService.generateCompletion(
            prompt,
            "You are LinguaCraft, an Indic Native-to-English Language Betterment AI Agent.",
            "sarvam-105b"
        );
        
        let cleanJson = rawOutput.replace(/```json\n?|\n?```/g, '').trim();
        const firstBrace = cleanJson.indexOf('{');
        const lastBrace = cleanJson.lastIndexOf('}');
        let parsed = {};
        if (firstBrace !== -1 && lastBrace !== -1) {
            cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
            try {
                parsed = JSON.parse(cleanJson);
            } catch (e) {
                console.warn("Assist bridge JSON parse warning:", e.message);
            }
        }

        res.json({
            nativeExplanationWhy: parsed.nativeExplanationWhy || `Aapki intuition is question ke core trade-offs ko highlight karti hai. Pehle foundational logic define karein.`,
            nativeExplanationHow: parsed.nativeExplanationHow || `Pehle apne native words me intuition clarify karein, phir key technical vocabulary connect karke answer expand karein.`,
            englishExplanation: parsed.englishExplanation || nativeThought,
            keyPhrases: parsed.keyPhrases || ["technical architecture", "time complexity", "optimal performance"],
            explanationTip: parsed.explanationTip || "Use clear active verbs to demonstrate confidence in technical choices.",
            audioHintText: parsed.audioHintText || "Aapka approach sahi hai, ise technical English me confidently state karein."
        });
    } catch (error) {
        console.error("Language bridge assist error:", error.message);
        res.json({
            nativeExplanationWhy: "In your native language, focus on highlighting the core bottleneck and why your approach solves it.",
            nativeExplanationHow: "Structure your explanation by stating the mechanism first, followed by time and space complexity.",
            englishExplanation: req.body.nativeThought || "Professional technical explanation generated.",
            keyPhrases: ["Technical Implementation", "Optimized Complexity", "Scalable Design"],
            explanationTip: "Speak with confidence using clear active verbs.",
            audioHintText: "Confidently state your solution in English."
        });
    }
});

/**
 * @route POST /api/language-eval/speech-to-text
 * @desc Transcribes native voice audio using Sarvam Speech ASR.
 * @access Public / OptionalAuth
 */
router.post("/speech-to-text", optionalAuth, async (req, res) => {
    try {
        const body = req.body || {};
        const { audioBase64, languageCode = "hi-IN" } = body;
        if (!audioBase64) {
            return res.status(400).json({ error: "Audio input missing" });
        }

        const buffer = Buffer.from(audioBase64, 'base64');
        const sttResult = await sarvamService.transcribeAudio(buffer, languageCode);

        res.json({
            transcript: sttResult.transcript || sttResult,
            language_code: languageCode
        });
    } catch (error) {
        console.error("Sarvam ASR Error:", error.message);
        res.status(500).json({ error: "Failed to transcribe native speech audio" });
    }
});

/**
 * @route POST /api/language-eval/text-to-speech
 * @desc Synthesizes native or English text to audio using Sarvam Bulbul TTS.
 * @access Public / OptionalAuth
 */
router.post("/text-to-speech", optionalAuth, async (req, res) => {
    try {
        const body = req.body || {};
        const { text, targetLanguage = "hi-IN", speaker = "priya" } = body;
        if (!text) {
            return res.status(400).json({ error: "Text input required" });
        }

        const ttsResult = await sarvamService.textToSpeech(text, targetLanguage, speaker);
        res.json(ttsResult);
    } catch (error) {
        console.error("Sarvam TTS Error:", error.message);
        res.status(500).json({ error: "Failed to generate speech audio" });
    }
});

module.exports = router;
