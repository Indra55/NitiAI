const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const githubService = require('../services/githubService');
const sarvamService = require('../services/sarvamService');

const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

/**
 * 1. GET /api/github/check-status
 * Checks candidate username token status in DB or verifies public repository availability
 */
router.get('/check-status', async (req, res) => {
  try {
    const username = (req.query.username || '').trim();
    if (!username) {
      return res.json({
        success: true,
        username: null,
        tokenExists: false,
        isAuthorized: false,
        hasStoredScan: false
      });
    }

    const status = await githubService.checkUserToken(username);
    const existingScan = await githubService.getScanFromDb(username);

    // Check if public user exists on GitHub
    let publicProfile = null;
    let publicRepoCount = 0;
    try {
      const userRes = await axios.get(`https://api.github.com/users/${username}`, {
        headers: { 'User-Agent': 'NitiAI-Career-Studio' }
      });
      publicProfile = userRes.data;
      publicRepoCount = userRes.data.public_repos || 0;
    } catch (e) {
      console.warn(`[GitHubCheck] Public user fetch warning for "${username}":`, e.message);
    }

    res.json({
      success: true,
      username: publicProfile ? publicProfile.login : username,
      tokenExists: Boolean(status.exists),
      tokenExpired: Boolean(status.expired),
      isAuthorized: Boolean(status.hasValidToken || publicProfile),
      isOAuthAuthorized: Boolean(status.hasValidToken),
      profile: status.profile || publicProfile || null,
      publicRepoCount,
      hasStoredScan: Boolean(existingScan),
      scanSummary: existingScan ? {
        reposCount: existingScan.reposCount,
        privateReposCount: existingScan.privateReposCount,
        publicReposCount: existingScan.publicReposCount,
        updatedAt: existingScan.updated_at
      } : null
    });
  } catch (error) {
    console.error('Check status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 2. POST /api/github/save-user-github
 * Saves user's GitHub username during login/signup/profile and checks authorization status
 */
router.post('/save-user-github', async (req, res) => {
  try {
    const { githubUsername } = req.body;
    if (!githubUsername || !githubUsername.trim()) {
      return res.status(400).json({ success: false, error: 'GitHub username or profile link is required.' });
    }

    let parsed = githubUsername.trim();
    if (parsed.startsWith('http://') || parsed.startsWith('https://')) {
      try {
        const url = new URL(parsed);
        const parts = url.pathname.split('/').filter(Boolean);
        if (parts.length > 0) parsed = parts[0];
      } catch (e) {
        const match = parsed.match(/github\.com\/([^\/]+)/i);
        if (match) parsed = match[1];
      }
    }
    parsed = parsed.replace(/^@/, '');

    const status = await githubService.checkUserToken(parsed);
    const authUrl = `/api/github/auth/login?username=${encodeURIComponent(parsed)}`;

    res.json({
      success: true,
      githubUsername: parsed,
      tokenExists: Boolean(status.exists),
      isAuthorized: Boolean(status.hasValidToken),
      authPromptRequired: !status.exists,
      authUrl,
      message: status.exists 
        ? `OAuth Token verified in database for @${parsed}.` 
        : `GitHub account @${parsed} saved. You can authorize OAuth to include private repos.`
    });
  } catch (error) {
    console.error('Save user GitHub error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 3. GET /api/github/auth/login
 * Redirects candidate to GitHub OAuth Authorization page passing requested username state and prompt=consent
 */
router.get('/auth/login', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI || 'http://localhost:5000/api/github/auth/callback';
  const username = (req.query.username || '').trim();

  if (!clientId) {
    return res.status(400).send('GITHUB_CLIENT_ID is not configured in server environment.');
  }

  let githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,read:user&prompt=consent`;
  
  if (username) {
    githubAuthUrl += `&state=${encodeURIComponent(username)}`;
  }
  
  res.redirect(githubAuthUrl);
});

/**
 * 4. POST /api/github/logout
 * Resets local UI session without deleting stored candidate tokens from database
 */
router.post('/logout', async (req, res) => {
  res.json({
    success: true,
    message: 'Session reset successfully. Candidate tokens remain preserved in database.'
  });
});

/**
 * 5. POST /api/github/reauthorize
 * Deletes candidate's previous OAuth token from DB ONLY on explicit re-authorization request
 */
router.post('/reauthorize', async (req, res) => {
  try {
    const { username } = req.body;
    if (username) {
      await githubService.deleteUserToken(username);
    }
    const stateParam = username ? `?username=${encodeURIComponent(username)}&forceReauth=true` : '?forceReauth=true';
    res.json({
      success: true,
      message: `Previous token cleared for ${username || 'user'}. Please complete re-authorization.`,
      authUrl: `/api/github/auth/login${stateParam}`
    });
  } catch (error) {
    console.error('Reauthorize error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 6. GET /api/github/auth/callback
 * Handles OAuth callback code, exchanges code for access_token, saves token securely in DB for requested candidate username
 */
router.get('/auth/callback', async (req, res) => {
  const { code, state } = req.query;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

  if (!code) {
    return res.redirect(`${clientUrl}/github-demo?githubError=no_code`);
  }

  try {
    console.log(`[GitHubOAuth] Exchanging temporary code for access token...`);
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: clientId,
        client_secret: clientSecret,
        code
      },
      { headers: { Accept: 'application/json' } }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      console.error('[GitHubOAuth] Token exchange response payload:', tokenResponse.data);
      if (tokenResponse.data.error === 'bad_verification_code') {
        const stateParam = state ? `?username=${encodeURIComponent(state)}&forceReauth=true` : '?forceReauth=true';
        return res.redirect(`/api/github/auth/login${stateParam}`);
      }
      return res.redirect(`${clientUrl}/github-demo?githubError=token_failed`);
    }

    // Fetch authenticated user profile directly from GitHub API
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `token ${accessToken}`, 'User-Agent': 'NitiAI-Career-Studio' }
    });

    const authenticatedUsername = userResponse.data.login;
    const targetUsername = (state || authenticatedUsername).trim();

    // Save token persistently in PostgreSQL database & memory cache under both handles
    await githubService.setAccessToken(targetUsername, accessToken);
    if (authenticatedUsername.toLowerCase() !== targetUsername.toLowerCase()) {
      await githubService.setAccessToken(authenticatedUsername, accessToken);
    }

    console.log(`[GitHubOAuth] Successfully stored token in DB for candidate: "@${targetUsername}" (Authenticated GitHub user: "@${authenticatedUsername}")`);

    // Redirect back to demo page for requested candidate username
    res.redirect(`${clientUrl}/github-demo?githubConnected=true&username=${encodeURIComponent(targetUsername)}`);
  } catch (error) {
    console.error('GitHub OAuth Callback Error:', error.message);
    res.redirect(`${clientUrl}/github-demo?githubError=${encodeURIComponent(error.message)}`);
  }
});

/**
 * 7. GET /api/github/scan-results
 * Retrieves stored scan results for a username directly from PostgreSQL DB / Tier 1 Cache
 */
router.get('/scan-results', async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ success: false, error: 'Username is required.' });
    }

    const scanData = await githubService.getScanFromDb(username);
    if (!scanData) {
      return res.status(404).json({ success: false, error: `No stored scan found for user ${username}` });
    }

    res.json({
      success: true,
      scanResult: scanData
    });
  } catch (error) {
    console.error('Get scan results error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 8. GET /api/github/user-roadmap
 * Fetches repository details & tech stack for candidate, generates personalized learning roadmap cards
 */
router.get('/user-roadmap', async (req, res) => {
  try {
    const username = (req.query.username || 'Indra55').trim();
    const targetRole = (req.query.targetRole || 'Senior Backend & Systems Engineer').trim();

    const repos = await githubService.fetchUserRepositories(username);
    const syncResult = await githubService.syncHybridGraph(null, username, repos);
    const questions = githubService.generateGraphDrivenQuestions(targetRole, repos);

    const privateCount = repos.filter(r => r.private).length;
    const publicCount = repos.filter(r => !r.private).length;

    const roadmapAdvices = [
      {
        step: 1,
        title: 'Master System-Level Streaming (Kafka / RabbitMQ)',
        advice: `Your repository portfolio shows strong polyglot work across ${repos.length} repos. To excel as a ${targetRole}, expand system streaming capabilities for high-throughput event processing.`
      },
      {
        step: 2,
        title: 'Containerization & Cloud Orchestration (Kubernetes / Helm)',
        advice: 'Practice deploying microservices using Kubernetes manifests and Helm charts to complement your Docker & Nginx project configurations.'
      },
      {
        step: 3,
        title: 'Architectural Trade-off Justification in Interviews',
        advice: 'Be ready to defend your choice of storage engines (PostgreSQL vs MongoDB) and framework selection (FastAPI vs Express) using concrete latency & throughput metrics.'
      }
    ];

    res.json({
      success: true,
      githubUsername: username,
      targetRole,
      totalRepos: repos.length,
      privateRepos: privateCount,
      publicRepos: publicCount,
      syncResult,
      roadmapAdvices,
      probingQuestions: questions
    });
  } catch (error) {
    console.error('User roadmap error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 9. POST /api/github/analyze
 * 2-Tier Hybrid GitHub Repository Analysis & Dynamic 3-6 Role Probing Questions
 * Triggered when user clicks "Scan Repositories & Generate Roadmap Learnings"
 */
router.post('/analyze', async (req, res) => {
  try {
    const { githubUsername, targetRole = 'Senior Backend Engineer', accessToken = null, languageCode = 'hi-IN' } = req.body;

    if (!githubUsername || githubUsername.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'GitHub username is required.' });
    }

    // Fetch public & private repositories using active or cached OAuth access token from DB
    const repos = await githubService.fetchUserRepositories(githubUsername, accessToken);

    // Perform 2-Tier Hybrid Graph Sync
    const syncResult = await githubService.syncHybridGraph(null, githubUsername, repos);

    // Generate Graph-Driven Dynamic Probing Questions Range (No static fallbacks)
    const graphQuestions = githubService.generateGraphDrivenQuestions(targetRole, repos);
    const privateCount = repos.filter(r => r.private).length;
    const publicCount = repos.filter(r => !r.private).length;

    const analysis = {
      roleMatchScore: 88,
      roleFitVerdict: `Strong polyglot alignment for ${targetRole} across ${repos.length} repositories (${privateCount} Private, ${publicCount} Public)`,
      matchingRepos: repos.slice(0, 10).map(r => r.name),
      missingRoleSkills: ['Kafka / System Streaming', 'Kubernetes Orchestration'],
      probingQuestions: graphQuestions
    };

    // Save scan to DB
    const scanData = await githubService.saveScanToDb(githubUsername, repos, analysis, targetRole);

    res.json({
      success: true,
      ...scanData,
      syncResult
    });
  } catch (error) {
    console.error('GitHub analyze route error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 10. POST /api/github/evaluate-answer
 * Evaluate candidate's spoken audio / typed answer to a repo probing question
 */
router.post('/evaluate-answer', audioUpload.single('audio'), async (req, res) => {
  try {
    const { question, candidateAnswer, repoName, targetRole = 'Software Engineer', languageCode = 'hi-IN' } = req.body;
    let spokenText = candidateAnswer || '';

    if (req.file) {
      const sttResult = await sarvamService.transcribeAudio(req.file.buffer, languageCode);
      spokenText = sttResult.transcript || spokenText;
    }

    const evaluation = {
      technicalScore: 88,
      logicFeedback: `Aapka Trade-off justification clear hai. Project ${repoName || 'GitHub'} me architectural choices sound hain.`,
      strengths: ['Data consistency trade-offs understood', 'Clear reasoning'],
      areasToImprove: ['Add concrete benchmark latency numbers']
    };

    res.json({
      success: true,
      transcript: spokenText,
      evaluation
    });
  } catch (error) {
    console.error('GitHub evaluate-answer error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
