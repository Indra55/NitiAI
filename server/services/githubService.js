const axios = require('axios');
const { Pool } = require('pg');

// Initialize PostgreSQL pool using process.env.DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 3000,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=require') 
    ? { rejectUnauthorized: false } 
    : false
});

/**
 * GitHubService - 2-Tier Hybrid GitHub Indexing Engine & Database Persistence
 * Tier 1: In-Memory Commit SHA Caching & Inverted Hash Table (Tool -> Repos)
 * Tier 2: PostgreSQL Relational Property Graph Persistence & OAuth Token Management
 */
class GitHubService {
  constructor() {
    this.invertedIndex = new Map(); // ToolName -> Set(RepoName)
    this.repoGraphMemory = new Map(); // RepoName -> { tools, language, pushed_at }
    this.shaCache = new Map(); // RepoName -> CommitSHA/PushedAt
    this.userTokens = new Map(); // Username -> OAuth accessToken
    this.scanCache = new Map(); // Username -> Full Scan Data Object
  }

  /**
   * Initialize AI Training Data Table
   */
  async initTrainingTable() {
    if (process.env.DATABASE_URL) {
      try {
        const client = await pool.connect();
        try {
          await client.query(`
            CREATE TABLE IF NOT EXISTS ai_training_data (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id UUID,
              feature_name VARCHAR(100) NOT NULL,
              input_context JSONB NOT NULL,
              ai_output JSONB NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
          `);
        } finally {
          client.release();
        }
      } catch (dbErr) {
        console.warn(`[GitHubService] PostgreSQL training table init warning:`, dbErr.message);
      }
    }
  }

  /**
   * Save / update OAuth access token for a username in memory and PostgreSQL DB
   */
  async setAccessToken(username, token) {
    if (!username || !token) return;
    const key = username.toLowerCase().trim();
    this.userTokens.set(key, token);
    console.log(`[GitHubService] Cached OAuth token for user: "${key}"`);

    if (process.env.DATABASE_URL) {
      try {
        const client = await pool.connect();
        try {
          await client.query(`
            CREATE TABLE IF NOT EXISTS github_tokens (
              username VARCHAR(100) PRIMARY KEY,
              access_token TEXT NOT NULL,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
          `);

          await client.query(`
            INSERT INTO github_tokens (username, access_token, updated_at)
            VALUES ($1, $2, CURRENT_TIMESTAMP)
            ON CONFLICT (username) DO UPDATE SET 
              access_token = EXCLUDED.access_token,
              updated_at = CURRENT_TIMESTAMP;
          `, [key, token]);
          console.log(`[GitHubService] Persisted token for "${key}" in PostgreSQL github_tokens table.`);
        } finally {
          client.release();
        }
      } catch (dbErr) {
        console.warn(`[GitHubService] PostgreSQL token persistence warning:`, dbErr.message);
      }
    }
  }

  /**
   * Get cached OAuth access token for a username from memory or PostgreSQL DB
   */
  async getAccessToken(username) {
    if (!username) return null;
    const key = username.toLowerCase().trim();

    if (this.userTokens.has(key)) {
      return this.userTokens.get(key);
    }

    if (process.env.DATABASE_URL) {
      try {
        const client = await pool.connect();
        try {
          await client.query(`
            CREATE TABLE IF NOT EXISTS github_tokens (
              username VARCHAR(100) PRIMARY KEY,
              access_token TEXT NOT NULL,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
          `);

          const res = await client.query(`SELECT access_token FROM github_tokens WHERE LOWER(username) = $1`, [key]);
          if (res.rows.length > 0) {
            const token = res.rows[0].access_token;
            this.userTokens.set(key, token);
            return token;
          }
        } finally {
          client.release();
        }
      } catch (dbErr) {
        console.warn(`[GitHubService] PostgreSQL token retrieval warning:`, dbErr.message);
      }
    }

    return null;
  }

  /**
   * Delete an OAuth access token from memory and PostgreSQL DB (for Re-authorization)
   */
  async deleteUserToken(username) {
    if (!username) return;
    const key = username.toLowerCase().trim();
    this.userTokens.delete(key);
    this.scanCache.delete(key);
    console.log(`[GitHubService] Deleted token and scan cache for "${key}".`);

    if (process.env.DATABASE_URL) {
      try {
        const client = await pool.connect();
        try {
          await client.query(`DELETE FROM github_tokens WHERE LOWER(username) = $1`, [key]);
          await client.query(`DELETE FROM github_scans WHERE LOWER(username) = $1`, [key]);
          console.log(`[GitHubService] Deleted token and scan record for "${key}" from PostgreSQL DB.`);
        } finally {
          client.release();
        }
      } catch (dbErr) {
        console.warn(`[GitHubService] PostgreSQL token deletion warning:`, dbErr.message);
      }
    }
  }

  /**
   * Validate a GitHub OAuth access token against GitHub API (/user endpoint)
   */
  async validateToken(token) {
    if (!token) return { valid: false };
    try {
      const response = await axios.get('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${token}`,
          'User-Agent': 'NitiAI-Career-Studio',
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      return {
        valid: true,
        user: response.data
      };
    } catch (err) {
      console.warn(`[GitHubService] Token validation failed:`, err.message);
      return { valid: false };
    }
  }

  /**
   * Check if input username exists in DB and has a valid authorized OAuth token
   */
  async checkUserToken(username) {
    if (!username) return { exists: false, hasValidToken: false, username: null, token: null };
    const key = username.toLowerCase().trim();
    const token = await this.getAccessToken(key);

    if (!token) {
      console.log(`[GitHubService] DB Lookup for "${key}": TOKEN NOT FOUND IN DB`);
      return { exists: false, hasValidToken: false, username: key, token: null };
    }

    console.log(`[GitHubService] DB Lookup for "${key}": TOKEN FOUND IN DB. Validating against GitHub API...`);
    const validation = await this.validateToken(token);

    if (!validation.valid) {
      console.warn(`[GitHubService] Token for "${key}" in DB is invalid or expired. Purging token...`);
      await this.deleteUserToken(key);
      return { exists: true, hasValidToken: false, username: key, token: null, expired: true };
    }

    return {
      exists: true,
      hasValidToken: true,
      username: key,
      token,
      profile: validation.user
    };
  }

  /**
   * Store complete scan & analysis results in Tier 1 Memory & Tier 2 PostgreSQL Database
   */
  async saveScanToDb(username, repos, analysis, targetRole = 'Senior Backend Engineer') {
    const key = username.toLowerCase().trim();
    const privateRepos = repos.filter(r => r.private);
    const publicRepos = repos.filter(r => !r.private);

    const scanData = {
      githubUsername: username,
      targetRole,
      reposCount: repos.length,
      privateReposCount: privateRepos.length,
      publicReposCount: publicRepos.length,
      repos: repos.map(r => ({
        id: r.id,
        name: r.name,
        private: r.private,
        language: r.language,
        detected_tools: r.detected_tools,
        impact_score: r.impact_score || 0,
        impact_reason: r.impact_reason || ''
      })),
      analysis,
      updated_at: new Date().toISOString()
    };

    this.scanCache.set(key, scanData);
    console.log(`[GitHubService] Saved scan for "${key}". Total Repos: ${repos.length} (${privateRepos.length} Private, ${publicRepos.length} Public)`);

    if (process.env.DATABASE_URL) {
      try {
        const client = await pool.connect();
        try {
          await client.query(`
            CREATE TABLE IF NOT EXISTS github_scans (
              username VARCHAR(100) PRIMARY KEY,
              repos_count INT NOT NULL,
              private_repos_count INT NOT NULL,
              public_repos_count INT NOT NULL,
              scan_json JSONB NOT NULL,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
          `);

          await client.query(`
            INSERT INTO github_scans (username, repos_count, private_repos_count, public_repos_count, scan_json, updated_at)
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
            ON CONFLICT (username) DO UPDATE SET 
              repos_count = EXCLUDED.repos_count,
              private_repos_count = EXCLUDED.private_repos_count,
              public_repos_count = EXCLUDED.public_repos_count,
              scan_json = EXCLUDED.scan_json,
              updated_at = CURRENT_TIMESTAMP;
          `, [key, repos.length, privateRepos.length, publicRepos.length, JSON.stringify(scanData)]);

          console.log(`[GitHubService] Persisted scan for "${key}" in PostgreSQL github_scans table.`);
        } finally {
          client.release();
        }
      } catch (dbErr) {
        console.warn(`[GitHubService] PostgreSQL scan persistence warning:`, dbErr.message);
      }
    }

    return scanData;
  }

  /**
   * Retrieve stored scan results from Tier 1 Memory or Tier 2 PostgreSQL Database
   */
  async getScanFromDb(username) {
    if (!username) return null;
    const key = username.toLowerCase().trim();

    if (this.scanCache.has(key)) {
      return this.scanCache.get(key);
    }

    if (process.env.DATABASE_URL) {
      try {
        const client = await pool.connect();
        try {
          const res = await client.query(`SELECT scan_json FROM github_scans WHERE LOWER(username) = $1`, [key]);
          if (res.rows.length > 0) {
            const scanData = res.rows[0].scan_json;
            this.scanCache.set(key, scanData);
            return scanData;
          }
        } finally {
          client.release();
        }
      } catch (dbErr) {
        console.warn(`[GitHubService] PostgreSQL scan retrieval warning:`, dbErr.message);
      }
    }

    return null;
  }

  /**
   * Fetch ALL public and private user repositories using GitHub API Pagination
   */
  async fetchUserRepositories(username, accessToken = null) {
    try {
      const activeToken = accessToken || await this.getAccessToken(username);
      let rawRepos = [];
      let page = 1;
      const perPage = 100;
      let hasMore = true;

      const headers = {
        'User-Agent': 'NitiAI-Career-Studio',
        'Accept': 'application/vnd.github.v3+json'
      };

      if (activeToken) {
        headers['Authorization'] = `token ${activeToken}`;
      }

      console.log(`[GitHubService] Fetching repos for "${username}". Using OAuth token: ${activeToken ? 'YES (Private + Public)' : 'NO (Public only)'}`);

      while (hasMore && page <= 10) {
        const url = activeToken
          ? `https://api.github.com/user/repos?affiliation=owner&sort=updated&per_page=${perPage}&page=${page}`
          : `https://api.github.com/users/${username}/repos?type=owner&sort=updated&per_page=${perPage}&page=${page}`;

        try {
          const response = await axios.get(url, { headers });
          const pageData = response.data;

          if (!Array.isArray(pageData) || pageData.length === 0) {
            hasMore = false;
            break;
          }

          // Filter to strictly include repositories owned by the candidate handle
          const ownedPageData = pageData.filter(repo => {
            if (!repo.owner || !repo.owner.login) return true;
            return repo.owner.login.toLowerCase() === username.toLowerCase();
          });

          rawRepos = rawRepos.concat(ownedPageData);
          console.log(`[GitHubService] Page ${page} returned ${pageData.length} repos (${ownedPageData.length} owned). Total accumulated: ${rawRepos.length}`);

          if (pageData.length < perPage) {
            hasMore = false;
          } else {
            page++;
          }
        } catch (pageErr) {
          console.warn(`[GitHubService] Page ${page} fetch warning for ${url}:`, pageErr.message);
          if (activeToken && page === 1) {
            console.log(`[GitHubService] Token fetch failed. Retrying public repos endpoint for user "${username}"...`);
            delete headers['Authorization'];
            const fallbackUrl = `https://api.github.com/users/${username}/repos?type=owner&sort=updated&per_page=${perPage}&page=1`;
            const fallbackRes = await axios.get(fallbackUrl, { headers });
            rawRepos = (fallbackRes.data || []).filter(repo => {
              if (!repo.owner || !repo.owner.login) return true;
              return repo.owner.login.toLowerCase() === username.toLowerCase();
            });
          }
          hasMore = false;
          break;
        }
      }

      // Deduplicate repositories by repo ID / full_name and enforce strict owner filtering
      const uniqueReposMap = new Map();
      rawRepos.forEach(r => {
        if (!r.owner || !r.owner.login || r.owner.login.toLowerCase() === username.toLowerCase()) {
          uniqueReposMap.set(r.id || r.full_name, r);
        }
      });
      const deduplicatedRepos = Array.from(uniqueReposMap.values());

      const repoSummaries = deduplicatedRepos.map(repo => {
        const detectedTools = new Set();
        if (repo.language) detectedTools.add(repo.language);
        if (repo.topics && Array.isArray(repo.topics)) {
          repo.topics.forEach(t => detectedTools.add(t));
        }

        const nameLower = repo.name.toLowerCase();
        const descLower = (repo.description || '').toLowerCase();
        if (nameLower.includes('api') || descLower.includes('node') || descLower.includes('express')) {
          detectedTools.add('Node.js');
          detectedTools.add('Express');
        }
        if (nameLower.includes('react') || descLower.includes('react')) detectedTools.add('React');
        if (nameLower.includes('next') || descLower.includes('next')) detectedTools.add('Next.js');
        if (nameLower.includes('python') || descLower.includes('python') || descLower.includes('django') || descLower.includes('fastapi')) {
          detectedTools.add('Python');
          detectedTools.add('FastAPI');
        }
        if (descLower.includes('postgres') || descLower.includes('sql') || nameLower.includes('db')) detectedTools.add('PostgreSQL');
        if (descLower.includes('mongo') || descLower.includes('nosql')) detectedTools.add('MongoDB');
        if (descLower.includes('redis') || descLower.includes('cache')) detectedTools.add('Redis');
        if (descLower.includes('docker') || nameLower.includes('docker')) detectedTools.add('Docker');
        if (descLower.includes('nginx') || nameLower.includes('nginx')) detectedTools.add('Nginx');
        if (descLower.includes('rust') || nameLower.includes('rust')) detectedTools.add('Rust');
        if (descLower.includes('go') || nameLower.includes('go')) detectedTools.add('Go');

        return {
          id: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          private: Boolean(repo.private),
          description: repo.description || 'No description provided',
          language: repo.language || 'TypeScript',
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          pushed_at: repo.pushed_at,
          commit_sha: repo.pushed_at,
          detected_tools: Array.from(detectedTools)
        };
      });

      // Sort repoSummaries by engagement for README fetching (Top 10)
      repoSummaries.sort((a, b) => {
        const scoreA = (a.stars || 0) * 2 + (a.forks || 0);
        const scoreB = (b.stars || 0) * 2 + (b.forks || 0);
        return scoreB - scoreA;
      });

      // Fetch READMEs for top 10 engaged repositories
      const topReposForReadme = repoSummaries.slice(0, 10);
      await Promise.allSettled(topReposForReadme.map(async (repo) => {
        try {
          const readmeUrl = `https://api.github.com/repos/${username}/${repo.name}/readme`;
          const readmeRes = await axios.get(readmeUrl, { headers });
          if (readmeRes.data && readmeRes.data.content) {
            const decodedReadme = Buffer.from(readmeRes.data.content, 'base64').toString('utf-8');
            // Append a 1000 character snippet of the README
            repo.description = `${repo.description}\n\nREADME Snippet:\n${decodedReadme.substring(0, 1000)}`;
          }
        } catch (e) {
          // Ignore errors, likely 404 no readme
        }
      }));

      console.log(`[GitHubService] Summarized ${repoSummaries.length} total repos for "${username}". Fetched READMEs for up to 10. Private count: ${repoSummaries.filter(r => r.private).length}, Public count: ${repoSummaries.filter(r => !r.private).length}`);

      return repoSummaries;
    } catch (error) {
      console.error(`GitHub REST API fetch error for user ${username}:`, error.message);
      if (error.response) {
        console.error(`GitHub API Status: ${error.response.status}, Data:`, error.response.data);
      }
      throw new Error(`Failed to fetch GitHub repositories for ${username}: ${error.message}`);
    }
  }

  /**
   * Deep Audit all Public and Private Repositories for a candidate
   * Extracts detailed descriptions, README snippets, and tool breakdowns for every public & private repo
   */
  async deepAuditRepositories(username, token = null) {
    const key = (username || '').toLowerCase().trim();
    const accessToken = token || await this.getAccessToken(key);
    const repos = await this.fetchUserRepositories(username, accessToken);

    const publicRepos = repos.filter(r => !r.private);
    const privateRepos = repos.filter(r => r.private);

    const techFrequencyMap = {};
    repos.forEach(r => {
      (r.detected_tools || []).forEach(tool => {
        techFrequencyMap[tool] = (techFrequencyMap[tool] || 0) + 1;
      });
    });

    const repoAudits = repos.map(r => ({
      name: r.name,
      fullName: r.fullName,
      visibility: r.private ? 'Private 🔒' : 'Public 🌐',
      isPrivate: r.private,
      description: r.description || 'No description provided on GitHub.',
      language: r.language || 'TypeScript',
      stars: r.stars || 0,
      forks: r.forks || 0,
      pushedAt: r.pushed_at,
      detectedTools: r.detected_tools || []
    }));

    return {
      username,
      totalRepositories: repos.length,
      publicCount: publicRepos.length,
      privateCount: privateRepos.length,
      hasAuthenticatedToken: Boolean(accessToken),
      techFrequency: techFrequencyMap,
      repositories: repoAudits
    };
  }

  /**
   * 2-Tier Hybrid Graph Indexer
   * Tier 1: In-Memory SHA Caching & Inverted Hash Mapping ($O(1)$)
   * Tier 2: PostgreSQL Relational Property Graph Persistence
   */
  async syncHybridGraph(userId = null, username, repos) {
    const indexedReposCount = repos.length;
    let newReposIndexed = 0;
    let cachedReposSkipped = 0;

    for (const repo of repos) {
      if (this.shaCache.get(repo.name) === repo.pushed_at) {
        cachedReposSkipped++;
        continue;
      }
      this.shaCache.set(repo.name, repo.pushed_at);
      newReposIndexed++;

      const toolsSet = new Set(repo.detected_tools || []);
      this.repoGraphMemory.set(repo.name, {
        name: repo.name,
        isPrivate: repo.private,
        tools: toolsSet,
        language: repo.language,
        pushed_at: repo.pushed_at
      });

      for (const tool of toolsSet) {
        if (!this.invertedIndex.has(tool)) {
          this.invertedIndex.set(tool, new Set());
        }
        this.invertedIndex.get(tool).add(repo.name);
      }
    }

    let dbStatus = 'Tier 1 In-Memory Graph Active';
    if (process.env.DATABASE_URL) {
      try {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');

          await client.query(`
            CREATE TABLE IF NOT EXISTS github_repositories (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id UUID,
              repo_name VARCHAR(255) NOT NULL,
              is_private BOOLEAN DEFAULT FALSE,
              language VARCHAR(100),
              commit_sha VARCHAR(255),
              pushed_at TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              CONSTRAINT unique_repo_name UNIQUE (repo_name)
            );
            ALTER TABLE github_repositories ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE;

            CREATE TABLE IF NOT EXISTS tech_tools (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              tool_name VARCHAR(100) UNIQUE NOT NULL,
              category VARCHAR(100) NOT NULL
            );
            CREATE TABLE IF NOT EXISTS repo_tools (
              repo_id UUID REFERENCES github_repositories(id) ON DELETE CASCADE,
              tool_id UUID REFERENCES tech_tools(id) ON DELETE CASCADE,
              PRIMARY KEY (repo_id, tool_id)
            );
            CREATE INDEX IF NOT EXISTS idx_repo_tools_tool ON repo_tools(tool_id);
            CREATE INDEX IF NOT EXISTS idx_repo_tools_repo ON repo_tools(repo_id);
          `);

          for (const repo of repos.slice(0, 50)) {
            const repoRes = await client.query(`
              INSERT INTO github_repositories (repo_name, is_private, language, commit_sha)
              VALUES ($1, $2, $3, $4)
              ON CONFLICT (repo_name) DO UPDATE SET commit_sha = EXCLUDED.commit_sha, is_private = EXCLUDED.is_private
              RETURNING id;
            `, [repo.name, repo.private || false, repo.language, repo.pushed_at]);

            const repoId = repoRes.rows[0].id;

            for (const toolName of repo.detected_tools || []) {
              const toolRes = await client.query(`
                INSERT INTO tech_tools (tool_name, category)
                VALUES ($1, $2)
                ON CONFLICT (tool_name) DO UPDATE SET tool_name = EXCLUDED.tool_name
                RETURNING id;
              `, [toolName, 'General']);

              const toolId = toolRes.rows[0].id;

              await client.query(`
                INSERT INTO repo_tools (repo_id, tool_id)
                VALUES ($1, $2)
                ON CONFLICT DO NOTHING;
              `, [repoId, toolId]);
            }
          }

          await client.query('COMMIT');
          dbStatus = 'Successfully Persisted in PostgreSQL (Neon DB)';
        } catch (dbErr) {
          await client.query('ROLLBACK');
          dbStatus = `PostgreSQL Sync Warning: ${dbErr.message}`;
        } finally {
          client.release();
        }
      } catch (poolErr) {
        dbStatus = `PostgreSQL Connection Skipped (Tier 1 In-Memory Active): ${poolErr.message}`;
      }
    }

    return {
      indexedReposCount,
      newReposIndexed,
      cachedReposSkipped,
      invertedToolsCount: this.invertedIndex.size,
      dbStatus
    };
  }

  /**
   * Graph-Driven Dynamic Question Generator (No Static Fallbacks & Zero Sarvam API Credits Used)
   */
  generateGraphDrivenQuestions(targetRole, repos) {
    const probingQuestions = [];

    const toolPairs = [
      ['PostgreSQL', 'MongoDB'],
      ['Redis', 'BullMQ'],
      ['FastAPI', 'Express'],
      ['Docker', 'Nginx'],
      ['TypeScript', 'Rust'],
      ['Go', 'TypeScript'],
      ['Python', 'TypeScript'],
      ['Java', 'C++'],
      ['JavaScript', 'TypeScript']
    ];

    let qIndex = 1;
    for (const [t1, t2] of toolPairs) {
      if (this.invertedIndex.has(t1) && this.invertedIndex.has(t2)) {
        const repoA = Array.from(this.invertedIndex.get(t1))[0];
        const repoB = Array.from(this.invertedIndex.get(t2))[0];
        probingQuestions.push({
          id: `gh_${qIndex++}`,
          repoName: `${repoA} vs ${repoB}`,
          toolComparison: `${t1} vs ${t2}`,
          question: `In project "${repoA}" you utilized ${t1}, whereas in "${repoB}" you implemented ${t2}. For a ${targetRole} role, what architectural trade-offs determined your choice between ${t1} and ${t2}?`,
          expectedConcepts: [`${t1} architecture`, `${t2} trade-offs`, 'System latency', 'Data consistency']
        });
      }
    }

    if (probingQuestions.length === 0) {
      repos.slice(0, 5).forEach((repo, i) => {
        if (repo.detected_tools && repo.detected_tools.length > 0) {
          probingQuestions.push({
            id: `gh_${i+1}`,
            repoName: repo.name,
            toolComparison: repo.detected_tools.join(', '),
            question: `In repository "${repo.name}" (${repo.language}), how did you structure your ${repo.detected_tools[0]} setup to maintain scalability for a ${targetRole} position?`,
            expectedConcepts: [`${repo.detected_tools[0]} configuration`, 'Scalability', 'Clean architecture']
          });
        }
      });
    }

    return probingQuestions;
  }

  /**
   * Deep Repository AI Audit powered by Sarvam AI (sarvam-105b)
   * Analyzes README, language breakdown, and repo structure to output:
   * 1. Changes to make
   * 2. What to build next
   * 3. What can be built better
   */
  async analyzeRepoDeepCode(username, repoName, targetRole = 'Senior Software Engineer') {
    const key = username.toLowerCase().trim();
    const token = await this.getAccessToken(key);

    const headers = {
      'User-Agent': 'NitiAI-Career-Studio',
      'Accept': 'application/vnd.github.v3+json'
    };
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }

    let repoData = {};
    let readmeText = "";
    let languages = {};

    try {
      const repoRes = await axios.get(`https://api.github.com/repos/${username}/${repoName}`, { headers });
      repoData = repoRes.data || {};
    } catch (e) {
      console.warn(`[GitHubService] Could not fetch repo details for ${username}/${repoName}:`, e.message);
    }

    try {
      const langRes = await axios.get(`https://api.github.com/repos/${username}/${repoName}/languages`, { headers });
      languages = langRes.data || {};
    } catch (e) {
      console.warn(`[GitHubService] Could not fetch languages for ${username}/${repoName}:`, e.message);
    }

    try {
      const readmeRes = await axios.get(`https://api.github.com/repos/${username}/${repoName}/readme`, { headers });
      if (readmeRes.data && readmeRes.data.content) {
        readmeText = Buffer.from(readmeRes.data.content, 'base64').toString('utf-8').substring(0, 1500);
      }
    } catch (e) {
      console.warn(`[GitHubService] README not available for ${username}/${repoName}`);
    }

    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
      return this.getFallbackRepoAudit(repoName, targetRole);
    }

    const prompt = `
You are a Principal AI Architect performing a technical repository audit for candidate "${username}".
Target Role: "${targetRole}"
Repository: "${repoName}"
Description: "${repoData.description || 'No description'}"
Languages Breakdown: ${JSON.stringify(languages)}
Topics/Tags: ${JSON.stringify(repoData.topics || [])}
README Excerpt:
"""
${readmeText || 'No README provided'}
"""

Provide a structured, highly actionable code analysis JSON with 3 distinct arrays:
1. "changes_to_make": 3 specific code refactoring, bug fixes, or testing improvements.
2. "what_to_build_next": 3 high-impact features, microservices, or integrations to build next.
3. "what_can_be_built_better": 3 architecture, database, or performance upgrades.

Return ONLY valid JSON format matching:
{
  "repoName": "${repoName}",
  "changes_to_make": [
    { "title": "...", "description": "...", "impact": "High" },
    { "title": "...", "description": "...", "impact": "Medium" },
    { "title": "...", "description": "...", "impact": "High" }
  ],
  "what_to_build_next": [
    { "title": "...", "description": "...", "category": "Feature" },
    { "title": "...", "description": "...", "category": "Integration" },
    { "title": "...", "description": "...", "category": "Microservice" }
  ],
  "what_can_be_built_better": [
    { "area": "Architecture", "current": "...", "recommendation": "..." },
    { "area": "Performance", "current": "...", "recommendation": "..." },
    { "area": "Database / State", "current": "...", "recommendation": "..." }
  ]
}
`;

    try {
      const sarvamRes = await axios.post("https://api.sarvam.ai/v1/chat/completions", {
        model: "sarvam-105b",
        messages: [
          { role: "system", content: "You are an expert tech lead. Return ONLY valid JSON format without markdown wrapper." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3
      }, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        timeout: 20000
      });

      const content = sarvamRes.data?.choices?.[0]?.message?.content;
      if (content) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
      return this.getFallbackRepoAudit(repoName, targetRole);
    } catch (err) {
      console.warn(`[GitHubService] Sarvam AI deep repo audit error for ${repoName}:`, err.message);
      return this.getFallbackRepoAudit(repoName, targetRole);
    }
  }

  getFallbackRepoAudit(repoName, targetRole) {
    return {
      repoName,
      changes_to_make: [
        { title: "Implement Comprehensive Unit & Integration Tests", description: "Add Jest / PyTest suite to cover core API handlers and edge case validation.", impact: "High" },
        { title: "Enforce Strict TypeScript / Type Annotations", description: "Eliminate implicit 'any' types and add runtime payload validation with Zod / Pydantic.", impact: "Medium" },
        { title: "Structured Error & Security Logging", description: "Replace standard console.log statements with structured JSON logger (Pino / Winston).", impact: "High" }
      ],
      what_to_build_next: [
        { title: "Redis Caching Layer for Hot Endpoints", description: "Cache frequent read operations with sub-10ms latency fallback.", category: "Performance" },
        { title: "Asynchronous Background Job Queue", description: "Move heavy processing tasks to BullMQ / Celery worker queue.", category: "Microservice" },
        { title: "CI/CD GitHub Actions Workflow", description: "Automate linting, unit testing, and Docker image build/push on every pull request.", category: "DevOps" }
      ],
      what_can_be_built_better: [
        { area: "Architecture", current: "Monolithic file organization", recommendation: "Modularize into clean layer architecture (Controllers, Services, Repositories)." },
        { area: "Database / State", current: "Direct SQL queries without pooling", recommendation: "Use connection pooling with Neon DB / PgBouncer for high concurrency." },
        { area: "Performance", current: "Synchronous blocking IO operations", recommendation: "Migrate heavy async calculations to background worker threads." }
      ]
    };
  }

  /**
   * Ranks candidate's GitHub projects based on relevance to their Resume profile
   * Uses Sarvam AI if available, otherwise heuristic fallback.
   */
  async rankProjectsAgainstProfile(username, repos, resumeText) {
    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey || !resumeText || repos.length === 0) {
      // Heuristic fallback: sort by stars, forks, then private/public
      return [...repos].sort((a, b) => {
        const scoreA = (a.stars || 0) * 2 + (a.forks || 0) + (a.private ? 0 : 1);
        const scoreB = (b.stars || 0) * 2 + (b.forks || 0) + (b.private ? 0 : 1);
        return scoreB - scoreA;
      }).map((repo, i) => ({
        ...repo,
        impact_score: Math.max(100 - i * 10, 10),
        impact_reason: "Ranked based on repository engagement (stars/forks)."
      }));
    }

    const reposData = repos.map(r => ({ name: r.name, description: r.description, language: r.language, tools: r.detected_tools }));
    const prompt = `
You are an expert tech recruiter and principal engineer. 
I have a candidate's resume and a list of their GitHub repositories.
I need you to score and rank these repositories (from 0 to 100) based on how impactful and relevant they are to the candidate's stated experience and skills in their resume.

Candidate Resume Excerpt:
"""
${resumeText.substring(0, 3000)}
"""

GitHub Repositories:
${JSON.stringify(reposData)}

Return ONLY a valid JSON array of objects, with each object containing:
- "name": repository name
- "impact_score": integer from 0 to 100
- "impact_reason": brief 1-sentence explanation of why it fits their profile.
Do NOT include markdown formatting wrappers, just the raw JSON array.
`;

    try {
      const sarvamRes = await axios.post("https://api.sarvam.ai/v1/chat/completions", {
        model: "sarvam-105b",
        messages: [
          { role: "system", content: "You are an expert tech lead. Return ONLY valid JSON format." },
          { role: "user", content: prompt }
        ],
        temperature: 0.2
      }, {
        headers: {
          "api-subscription-key": apiKey,
          "Content-Type": "application/json"
        },
        timeout: 25000
      });

      let content = sarvamRes.data?.choices?.[0]?.message?.content;
      if (content) {
        // Strip markdown code block wrappers if present
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        const rankings = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
        
        // Merge rankings into repos
        const rankedRepos = repos.map(repo => {
          const rankInfo = rankings.find(r => r.name === repo.name);
          return {
            ...repo,
            impact_score: rankInfo?.impact_score || 50,
            impact_reason: rankInfo?.impact_reason || "Analyzed for profile fit."
          };
        });

        // Sort by impact score descending
        rankedRepos.sort((a, b) => (b.impact_score || 0) - (a.impact_score || 0));
        return rankedRepos;
      }
    } catch (err) {
      console.warn(`[GitHubService] Sarvam AI ranking error for ${username}:`, err.message);
    }
    
    // Fallback if Sarvam fails
    return [...repos].sort((a, b) => {
        const scoreA = (a.stars || 0) * 2 + (a.forks || 0);
        const scoreB = (b.stars || 0) * 2 + (b.forks || 0);
        return scoreB - scoreA;
      }).map((repo, i) => ({
        ...repo,
        impact_score: Math.max(100 - i * 10, 10),
        impact_reason: "Ranked based on repository engagement."
    }));
  }
}

// Initialize tables on startup
const service = new GitHubService();
service.initTrainingTable();
module.exports = service;
