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
    // Tier 1 In-Memory Caches & Inverted Index
    this.invertedIndex = new Map(); // ToolName -> Set(RepoName)
    this.repoGraphMemory = new Map(); // RepoName -> { tools, language, pushed_at }
    this.shaCache = new Map(); // RepoName -> CommitSHA/PushedAt
    this.userTokens = new Map(); // Username -> OAuth accessToken
    this.scanCache = new Map(); // Username -> Full Scan Data Object
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
          const res = await client.query(`SELECT access_token FROM github_tokens WHERE username = $1`, [key]);
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
          await client.query(`DELETE FROM github_tokens WHERE username = $1`, [key]);
          await client.query(`DELETE FROM github_scans WHERE username = $1`, [key]);
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
   * Check if user has a valid authorized OAuth token
   */
  async checkUserToken(username) {
    if (!username) return { hasValidToken: false, username: null, token: null };
    const token = await this.getAccessToken(username);
    if (!token) {
      return { hasValidToken: false, username, token: null };
    }

    const validation = await this.validateToken(token);
    if (!validation.valid) {
      // Token is expired or revoked, delete it
      await this.deleteUserToken(username);
      return { hasValidToken: false, username, token: null };
    }

    return {
      hasValidToken: true,
      username: validation.user.login,
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
        detected_tools: r.detected_tools
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
          const res = await client.query(`SELECT scan_json FROM github_scans WHERE username = $1`, [key]);
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
          ? `https://api.github.com/user/repos?visibility=all&sort=updated&per_page=${perPage}&page=${page}`
          : `https://api.github.com/users/${username}/repos?sort=updated&per_page=${perPage}&page=${page}`;

        try {
          const response = await axios.get(url, { headers });
          const pageData = response.data;

          if (!Array.isArray(pageData) || pageData.length === 0) {
            hasMore = false;
            break;
          }

          rawRepos = rawRepos.concat(pageData);
          console.log(`[GitHubService] Page ${page} returned ${pageData.length} repos. Total accumulated: ${rawRepos.length}`);

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
            const fallbackUrl = `https://api.github.com/users/${username}/repos?sort=updated&per_page=${perPage}&page=1`;
            const fallbackRes = await axios.get(fallbackUrl, { headers });
            rawRepos = fallbackRes.data || [];
          }
          hasMore = false;
          break;
        }
      }

      const repoSummaries = rawRepos.map(repo => {
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

      console.log(`[GitHubService] Summarized ${repoSummaries.length} total repos for "${username}". Private count: ${repoSummaries.filter(r => r.private).length}, Public count: ${repoSummaries.filter(r => !r.private).length}`);

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
}

module.exports = new GitHubService();
