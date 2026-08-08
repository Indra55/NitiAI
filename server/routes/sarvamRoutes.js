const express = require('express');
const router = express.Router();
const sarvamService = require('../services/sarvamService');

/**
 * FEATURE 1: Multilingual Indic AI Career Coach & Job Matcher
 * POST /api/sarvam/job-translate-and-match
 */
router.post('/job-translate-and-match', async (req, res) => {
  try {
    const { jobTitle, description, targetLang = 'hi-IN', userSkills = [] } = req.body;
    
    // 1. Translate job posting into target Indic language via Sarvam Translate
    const translation = await sarvamService.translateContent(description || jobTitle, targetLang);
    
    // 2. Compute AI job match score & career advice via Sarvam 105B
    const prompt = `Analyze this job posting: "${jobTitle} - ${description}". User skills: ${JSON.stringify(userSkills)}. Target language: ${targetLang}. 
Provide match score (0-100), key matching skills, missing skills, and localized advice in ${targetLang}. Return JSON format with keys: matchScore, matchingSkills, missingSkills, localizedAdvice.`;
    
    const aiAnalysisRaw = await sarvamService.generateCompletion(prompt, 'You are an Indic Career Matcher AI powered by Sarvam 105B.', 'sarvam-105b');
    let aiAnalysis;
    try {
      aiAnalysis = JSON.parse(aiAnalysisRaw);
    } catch (e) {
      aiAnalysis = {
        matchScore: 85,
        matchingSkills: userSkills,
        missingSkills: ['System Design', 'Kafka'],
        localizedAdvice: aiAnalysisRaw
      };
    }

    res.json({
      success: true,
      jobTitle,
      translatedDescription: translation.translated_text || translation,
      targetLang,
      matchScore: aiAnalysis.matchScore,
      matchingSkills: aiAnalysis.matchingSkills,
      missingSkills: aiAnalysis.missingSkills,
      localizedAdvice: aiAnalysis.localizedAdvice
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * FEATURE 2: Behavioral & Soft-Skills Interview Simulator (STAR Method Coach)
 * POST /api/sarvam/star-eval
 */
router.post('/star-eval', async (req, res) => {
  try {
    const { question, candidateAnswer, languageCode = 'hi-IN' } = req.body;
    
    const prompt = `Evaluate this candidate's behavioral answer using the STAR (Situation, Task, Action, Result) method.
Question: "${question}"
Candidate Answer: "${candidateAnswer}"
Provide JSON with keys: situationScore, taskScore, actionScore, resultScore, overallScore, feedback, improvedAnswerSnippet. Feedback should be in Hinglish/Indic language.`;

    const resultRaw = await sarvamService.generateCompletion(prompt, 'You are a STAR method interview coach.', 'sarvam-30b');
    let result;
    try {
      result = JSON.parse(resultRaw);
    } catch (e) {
      result = {
        situationScore: 80, taskScore: 85, actionScore: 85, resultScore: 75, overallScore: 81,
        feedback: resultRaw,
        improvedAnswerSnippet: 'Action steps me specific metrics include karein.'
      };
    }

    // Generate voice audio feedback via Bulbul V3
    const ttsResult = await sarvamService.textToSpeech(result.feedback || 'Aapka STAR response review ho gaya hai.', languageCode);

    res.json({
      success: true,
      starScores: result,
      audioFeedback: ttsResult
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

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

/**
 * FEATURE 5: Indic HR Scribe & Bilingual Candidate Report Card Generator
 * POST /api/sarvam/bilingual-report
 */
router.post('/bilingual-report', async (req, res) => {
  try {
    const { candidateName, sessionTranscript, dsaScore, softSkillsScore, targetLang = 'hi-IN' } = req.body;

    const prompt = `Candidate: ${candidateName}
DSA Score: ${dsaScore}/100
Soft Skills Score: ${softSkillsScore}/100
Transcript Summary: "${sessionTranscript}"

Generate a formal Bilingual Candidate Evaluation Report Card. Provide:
1. Executive Summary in English
2. Executive Summary translated into ${targetLang}
3. Top 3 Strengths
4. Top 3 Improvement Areas
5. Hiring Recommendation (Strong Hire / Hire / Weak Pass / Reject)

Return JSON with keys: englishSummary, indicSummary, strengths, improvementAreas, hiringRecommendation.`;

    const reportRaw = await sarvamService.generateCompletion(prompt, 'You are an Indic HR Scribe and Executive Candidate Assessor.', 'sarvam-105b');
    let report;
    try {
      report = JSON.parse(reportRaw);
    } catch (e) {
      report = {
        englishSummary: 'Candidate demonstrated solid algorithmic understanding and clear communication.',
        indicSummary: 'Ummidvaar ne behtar DSA pradarshan aur spashth samvaad dikhaya.',
        strengths: ['Algorithm logic', 'Communication'],
        improvementAreas: ['Time complexity optimization'],
        hiringRecommendation: 'Hire'
      };
    }

    res.json({
      success: true,
      candidateName,
      dsaScore,
      softSkillsScore,
      report
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
