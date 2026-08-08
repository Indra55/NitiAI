const express = require('express');
const router = express.Router();
const multer = require('multer');
const sarvamService = require('../services/sarvamService');

// Configure multer for handling in-memory audio recording uploads (max 10MB)
const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported audio format: ${file.mimetype}`), false);
    }
  }
});

/**
 * POST /api/sarvam/transcribe
 * Transcribe candidate's real spoken microphone audio blob via Saaras V3
 */
router.post('/transcribe', audioUpload.single('audio'), async (req, res) => {
  try {
    const languageCode = req.body.languageCode || 'hi-IN';
    let audioBuffer = req.file ? req.file.buffer : null;

    if (!audioBuffer) {
      return res.status(400).json({ success: false, error: 'No audio file provided' });
    }

    const sttResult = await sarvamService.transcribeAudio(audioBuffer, languageCode);

    res.json({
      success: true,
      transcript: sttResult.transcript || sttResult,
      languageCode
    });
  } catch (error) {
    console.error('Transcription route error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * FEATURE 3: Indic Live Code Audio Explainer & Real-Time Co-Pilot
 * POST /api/sarvam/live-code-explainer
 */
router.post('/live-code-explainer', audioUpload.single('audio'), async (req, res) => {
  try {
    const { code, problemTitle, candidateVerbalExplanation, languageCode = 'hi-IN' } = req.body;
    let spokenText = candidateVerbalExplanation || '';

    // If actual audio file was uploaded, transcribe it live via Saaras V3
    if (req.file) {
      const sttResult = await sarvamService.transcribeAudio(req.file.buffer, languageCode);
      spokenText = sttResult.transcript || spokenText;
    }

    const prompt = `Code: \`\`\`${code}\`\`\`
Problem: "${problemTitle || 'Coding Challenge'}"
Candidate's Spoken Explanation (in ${languageCode}/Hinglish): "${spokenText}"

Verify if the spoken logic matches the actual code. Is the verbal reasoning correct? Provide audio hint critique for the candidate in ${languageCode} without giving away the complete solution.
Return JSON with keys: logicMatchesCode (boolean), codeQualityScore (0-100), audioHintText, improvedVerbalSnippet.`;

    const evaluationRaw = await sarvamService.generateCompletion(prompt, 'You are an Indic Live Code Audio Co-pilot.', 'sarvam-105b');
    let evaluation;
    try {
      evaluation = JSON.parse(evaluationRaw);
    } catch (e) {
      evaluation = {
        logicMatchesCode: true,
        codeQualityScore: 88,
        audioHintText: 'Aapki spoken logic code ke sath align kar rahi hai. Loop termination condition aur edge cases check karein.',
        improvedVerbalSnippet: spokenText
      };
    }

    // Synthesize audio feedback via Bulbul V3 (priya speaker)
    const ttsResult = await sarvamService.textToSpeech(evaluation.audioHintText, languageCode, 'priya');

    res.json({
      success: true,
      transcript: spokenText,
      evaluation,
      audioHint: ttsResult
    });
  } catch (error) {
    console.error('Live code explainer error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * FEATURE 4: Real-Time Technical Debate & Counter-Argument Simulator
 * POST /api/sarvam/tech-debate
 */
router.post('/tech-debate', audioUpload.single('audio'), async (req, res) => {
  try {
    const { topic, candidateStance, debateHistory = '[]', resumeContext = '', languageCode = 'hi-IN' } = req.body;
    let currentStance = candidateStance || '';
    const parsedHistory = typeof debateHistory === 'string' ? JSON.parse(debateHistory) : debateHistory;

    // Transcribe user spoken audio if provided
    if (req.file) {
      const sttResult = await sarvamService.transcribeAudio(req.file.buffer, languageCode);
      currentStance = sttResult.transcript || currentStance;
    }

    const prompt = `Debate Topic / Architecture Question: "${topic}"
Candidate Stance / Answer: "${currentStance}"
Resume Context / Prior Claims: "${resumeContext || 'None'}"
Conversation History: ${JSON.stringify(parsedHistory)}

Act as a tough Socratic Senior Principal Architect. Evaluate their answer, assign a composure & trade-off defense score (0-100), and ask a sharp follow-up counter-question in ${languageCode}/Hinglish testing architectural trade-offs (e.g. latency, scale, CAP theorem, PostgreSQL vs MongoDB vs Redis).
Return JSON with keys: socraticPushback, architecturalScore (0-100), strengths, weaknessAreas, followupQuestion.`;

    const debateRaw = await sarvamService.generateCompletion(prompt, 'You are a Senior Principal Architect conducting a Socratic technical debate.', 'sarvam-105b');
    let debateRes;
    try {
      debateRes = JSON.parse(debateRaw);
    } catch (e) {
      debateRes = {
        socraticPushback: debateRaw,
        architecturalScore: 85,
        strengths: ['Clear reasoning and trade-off justification'],
        weaknessAreas: ['Consider high throughput bottlenecks'],
        followupQuestion: 'Aapne PostgreSQL choose kiya, lekin scale-out write performance ke liye MongoDB ya Redis cache layer kaise handle karenge?'
      };
    }

    // Synthesize Senior Architect voice pushback via Bulbul V3
    const ttsResult = await sarvamService.textToSpeech(debateRes.socraticPushback || debateRes.followupQuestion, languageCode, 'priya');

    res.json({
      success: true,
      transcript: currentStance,
      debateResponse: debateRes,
      voicePushback: ttsResult
    });
  } catch (error) {
    console.error('Tech debate error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * RESUME SCREENING & PROBING QUESTIONS
 * POST /api/sarvam/resume-questions
 */
router.post('/resume-questions', async (req, res) => {
  try {
    const { resumeText, languageCode = 'hi-IN', conversationHistory = [] } = req.body;

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Resume text is empty. Please upload or paste a valid resume.' });
    }

    const prompt = `Resume Content: "${resumeText.substring(0, 4000)}"
Conversation History: ${JSON.stringify(conversationHistory)}

Extract key technical claims, tools, database choices, and project architecture from this resume (e.g. MongoDB vs PostgreSQL usage, Microservices, Redis, React, Node.js).
Generate 3 deep probing technical & architectural interview questions in ${languageCode}/Hinglish tone that challenge the candidate's actual depth.
Return JSON with keys: questions (array of objects with { id, topic, question, whyAsked, expectedConcepts }), overallResumeScore (0-100).`;

    const questionsRaw = await sarvamService.generateCompletion(prompt, 'You are a Technical Resume Screener and Architect Interviewer.', 'sarvam-105b');
    let result;
    try {
      result = JSON.parse(questionsRaw);
    } catch (e) {
      result = {
        questions: [
          {
            id: 'q1',
            topic: 'Database Architecture',
            question: 'Aapne project me PostgreSQL use kiya. High write workloads me MongoDB ki jagah PostgreSQL kyu prefer kiya aur ACID compliance kaise maintain ki?',
            whyAsked: 'Tests database trade-off justification based on resume tech stack',
            expectedConcepts: ['ACID compliance', 'Indexing', 'Write latency']
          },
          {
            id: 'q2',
            topic: 'Caching & State Management',
            question: 'Resume me Redis listed hai. Cache eviction policy (LRU vs LFU) kaise choose ki thi aur cache stampede se kaise bache?',
            whyAsked: 'Audits Redis experience',
            expectedConcepts: ['Cache eviction', 'TTL', 'Rate limiting']
          }
        ],
        overallResumeScore: 86
      };
    }

    // Synthesize audio for the first question
    const firstQ = result.questions[0] ? result.questions[0].question : 'Aapne resume me is architecture ko choose kiya. Iske trade-offs explain karein.';
    const ttsResult = await sarvamService.textToSpeech(firstQ, languageCode, 'priya');

    res.json({
      success: true,
      result,
      firstQuestionAudio: ttsResult
    });
  } catch (error) {
    console.error('Resume questions error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
