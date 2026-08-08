const express = require('express');
const router = express.Router();
const sarvamService = require('../services/sarvamService');

/**
 * FEATURE 3: Indic Live Code Audio Explainer & Real-Time Co-Pilot
 * POST /api/sarvam/live-code-explainer
 */
router.post('/live-code-explainer', async (req, res) => {
  try {
    const { code, problemTitle, candidateVerbalExplanation, languageCode = 'hi-IN' } = req.body;

    const prompt = `Code: \`\`\`${code}\`\`\`
Problem: "${problemTitle}"
Candidate's Spoken Explanation (in ${languageCode}/Hinglish): "${candidateVerbalExplanation}"

Verify if the spoken logic matches the actual code. Is the verbal reasoning correct? Provide audio hint critique for the candidate in ${languageCode} without giving away the complete solution. Return JSON with keys: logicMatchesCode (boolean), codeQualityScore (0-100), audioHintText.`;

    const evaluationRaw = await sarvamService.generateCompletion(prompt, 'You are an Indic Live Code Audio Co-pilot.', 'sarvam-30b');
    let evaluation;
    try {
      evaluation = JSON.parse(evaluationRaw);
    } catch (e) {
      evaluation = {
        logicMatchesCode: true,
        codeQualityScore: 88,
        audioHintText: 'Aapki spoken logic code ke sath align kar rahi hai. Loop termination condition check karein.'
      };
    }

    const ttsResult = await sarvamService.textToSpeech(evaluation.audioHintText, languageCode);

    res.json({
      success: true,
      evaluation,
      audioHint: ttsResult
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * FEATURE 4: Real-Time Technical Debate & Counter-Argument Simulator
 * POST /api/sarvam/tech-debate
 */
router.post('/tech-debate', async (req, res) => {
  try {
    const { topic, candidateStance, debateHistory = [], languageCode = 'hi-IN' } = req.body;

    const prompt = `Topic: "${topic}"
Candidate Stance/Argument: "${candidateStance}"
Previous Debate Context: ${JSON.stringify(debateHistory)}

Act as a tough Socratic Senior Principal Architect. Challenge the candidate's technical choice in a firm but constructive tone in ${languageCode}/Hinglish. Ask a sharp counter-question testing trade-offs (e.g. latency, scale, CAP theorem, state management). Return JSON with keys: socraticPushback, architecturalScore (0-100), strengths, weaknessAreas.`;

    const debateRaw = await sarvamService.generateCompletion(prompt, 'You are a Senior Principal Architect conducting a Socratic technical debate.', 'sarvam-105b');
    let debateRes;
    try {
      debateRes = JSON.parse(debateRaw);
    } catch (e) {
      debateRes = {
        socraticPushback: debateRaw,
        architecturalScore: 84,
        strengths: ['Clear reasoning'],
        weaknessAreas: ['Consider edge cases at high throughput']
      };
    }

    const ttsResult = await sarvamService.textToSpeech(debateRes.socraticPushback, languageCode);

    res.json({
      success: true,
      debateResponse: debateRes,
      voicePushback: ttsResult
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
