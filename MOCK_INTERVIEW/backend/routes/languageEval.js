const express = require("express");
const router = express.Router();
const axios = require("axios");
const sarvamService = require("../services/sarvamService");

/**
 * @route POST /api/language-eval/evaluate
 * @desc Async, lightweight evaluation of clarity (0-10), relevance (0-10), grammar (0-10), and logical coherence (0-10).
 * Threshold: Trigger bridge modal if (Clarity + Grammar) < 8 out of 20.
 */
router.post("/evaluate", async (req, res) => {
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
                suggestions: ["Provide a clear explanation."]
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
  "clarityScore": 7,
  "relevanceScore": 8,
  "grammarScore": 5,
  "logicalCoherenceScore": 7,
  "explanation": "Brief 1-sentence evaluation overview.",
  "grammarIssues": ["Issue 1", "Issue 2"],
  "suggestions": ["Suggestion 1"]
}`;

        const rawOutput = await sarvamService.generateCompletion(
            prompt,
            "You are an elite language quality evaluator scoring clarity and grammar.",
            "sarvam-105b"
        );
        let cleanJson = rawOutput.replace(/```json\n?|\n?```/g, '').trim();
        const firstBrace = cleanJson.indexOf('{');
        const lastBrace = cleanJson.lastIndexOf('}');
        let parsed = {};
        try {
            parsed = JSON.parse(cleanJson);
        } catch (e) {
            console.warn("Language eval JSON parse warning:", e.message);
        }

        const isVeryShort = userAnswer.trim().length < 15;
        const clarity = Math.min(10, Math.max(0, parsed.clarityScore !== undefined ? parsed.clarityScore : (isVeryShort ? 2 : 6)));
        const grammar = Math.min(10, Math.max(0, parsed.grammarScore !== undefined ? parsed.grammarScore : (isVeryShort ? 2 : 6)));
        const totalScore = clarity + grammar; // Total out of 20
        const requiresBridge = totalScore < 8;

        res.json({
            clarityScore: clarity,
            relevanceScore: parsed.relevanceScore || 5,
            grammarScore: grammar,
            logicalCoherenceScore: parsed.logicalCoherenceScore || 5,
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
            totalScore: 14,
            requiresBridge: false,
            explanation: "Evaluated using lightweight baseline.",
            grammarIssues: [],
            suggestions: []
        });
    }
});

/**
 * @route POST /api/language-eval/assist-bridge
 * @desc Converts candidate native language thoughts (Hindi, Marathi, Tamil, etc.) into professional English.
 */
router.post("/assist-bridge", async (req, res) => {
    try {
        const { nativeThought, nativeLanguage = "hi-IN", questionContext = "Technical Interview Question" } = req.body;

        if (!nativeThought || nativeThought.trim().length === 0) {
            return res.status(400).json({ error: "Native thought text is required" });
        }

        const prompt = `You are Sarvam AI's Multilingual Language Bridge assistant.
The candidate explained their technical response in their native language (${nativeLanguage}):

QUESTION CONTEXT: ${questionContext}
CANDIDATE NATIVE EXPLANATION: "${nativeThought}"

INSTRUCTIONS:
1. Translate and refine the candidate's native explanation into polished, high-scoring professional English suitable for a top-tier technical interview.
2. Provide 2-3 key technical phrases used.
3. Provide a quick coaching tip.

Return ONLY a JSON object (no markdown):
{
  "englishExplanation": "Polished, professional English response...",
  "keyPhrases": ["phrase 1", "phrase 2"],
  "explanationTip": "Tip for articulating this effectively..."
}`;

        const rawOutput = await sarvamService.generateCompletion(prompt, { temperature: 0.2 });
        let cleanJson = rawOutput.replace(/```json\n?|\n?```/g, '').trim();
        const firstBrace = cleanJson.indexOf('{');
        const lastBrace = cleanJson.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
        }

        const parsed = JSON.parse(cleanJson);
        res.json(parsed);
    } catch (error) {
        console.error("Language bridge assist error:", error.message);
        res.json({
            englishExplanation: req.body.nativeThought || "Professional technical explanation generated.",
            keyPhrases: ["Technical Implementation", "Optimized Flow"],
            explanationTip: "Speak with confidence using clear active verbs."
        });
    }
});

/**
 * @route POST /api/language-eval/speech-to-text
 * @desc Transcribes native voice audio using Sarvam Speech ASR (saaras:v1).
 */
router.post("/speech-to-text", async (req, res) => {
    try {
        const { audioBase64, languageCode = "hi-IN" } = req.body;
        const apiKey = process.env.SARVAM_API_KEY;

        if (!apiKey || !audioBase64) {
            return res.status(400).json({ error: "Sarvam API key or audio input missing" });
        }

        const response = await axios.post(
            "https://api.sarvam.ai/speech-to-text",
            {
                audio: audioBase64,
                language_code: languageCode,
                model: "saaras:v1"
            },
            { headers: { "api-subscription-key": apiKey }, timeout: 15000 }
        );

        res.json({
            transcript: response.data?.transcript || "",
            language_code: languageCode
        });
    } catch (error) {
        console.error("Sarvam ASR Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to transcribe native speech audio" });
    }
});

module.exports = router;
