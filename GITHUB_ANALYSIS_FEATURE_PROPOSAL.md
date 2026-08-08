# 🐙 Architectural Blueprint: GitHub Account Analysis, Roadmap Recommendations & Project-Based Probing

## Executive Summary

This architecture blueprint defines the **most efficient, scalable, and lightweight design** to analyze a user's public and private GitHub repositories (via OAuth / GitHub REST API), feed repository insights into NitiAI's **Roadmap Feature**, and automatically generate **Project-Based Interview Probing Questions** (Tool Implementation, Architectural Justification, and Tool Comparisons).

---

## 🏗️ 1. System Architecture & Data Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     GitHub Integration Pipeline                                 │
├───────────────────────────────┬─────────────────────────────────┬───────────────────────────────┤
│ 1. CONNECT & FETCH            │ 2. METADATA & PARSING           │ 3. SARVAM AI ANALYSIS         │
├───────────────────────────────┼─────────────────────────────────┼───────────────────────────────┤
│ • Public: Username input      │ • Language breakdown API        │ • Tech Stack Auditor          │
│ • Private: GitHub OAuth2      │ • Base64 README parser          │ • Roadmap Gap Identifier      │
│   (scope: repo, read:user)   │ • Manifests: package.json,      │ • Probing Question Generator  │
│                               │   requirements.txt, docker,     │   (Tool Implementation,       │
│                               │   go.mod                        │   Justification, Comparisons) │
└───────────────────────────────┴─────────────────────────────────┴───────────────────────────────┘
```

---

## ⚡ 2. The 4-Step Efficient Implementation Workflow

### Step 1: OAuth & Lightweight Metadata Fetching (No Full Git Clones)
> **Efficiency Strategy**: Cloning full git repositories is slow, heavy, and consumes unnecessary CPU/disk. Instead, query GitHub's REST / GraphQL API for lightweight file trees and dependency manifests.

1. **Authentication**:
   - **Public Repos**: User inputs GitHub handle (`/users/{username}/repos`).
   - **Private Repos**: User clicks **Connect GitHub** via GitHub OAuth2 (`https://github.com/login/oauth/authorize?scope=repo,read:user`). Token `gho_...` is encrypted and stored in DB/session.
2. **API Endpoint Data Pulled**:
   - `GET /user/repos?sort=updated&per_page=30`: Gets list of repos.
   - `GET /repos/{owner}/{repo}/languages`: Exact byte breakdown of languages.
   - `GET /repos/{owner}/{repo}/readme`: Decodes `README.md`.
   - `GET /repos/{owner}/{repo}/contents/{manifest}`: Fetches dependency manifests (`package.json`, `requirements.txt`, `go.mod`, `docker-compose.yml`).

### Step 2: Caching & Tech Stack Aggregator Service
> **Caching Strategy**: Cache GitHub metadata in Redis / PostgreSQL (`user_github_profiles` table) with a 24-hour TTL or GitHub Webhook trigger (`push` event) to avoid rate limits and reduce response latency to **< 300ms**.

**Extracted Profile Schema**:
```json
{
  "github_username": "jaydalvi",
  "total_repos": 14,
  "top_languages": ["TypeScript", "Python", "Go"],
  "detected_tools": ["Next.js", "Express", "PostgreSQL", "Redis", "Docker", "TailwindCSS"],
  "repositories_summary": [
    {
      "name": "niti-ai",
      "tech_stack": ["Next.js", "Node.js", "PostgreSQL", "Sarvam AI"],
      "has_tests": false,
      "has_docker": false,
      "readme_summary": "Multilingual AI career & coding ecosystem"
    },
    {
      "name": "ecommerce-backend",
      "tech_stack": ["Node.js", "MongoDB", "Redis"],
      "has_tests": true,
      "has_docker": true,
      "readme_summary": "High-throughput e-commerce REST API"
    }
  ]
}
```

---

## 💡 Step 3: Integration into NitiAI Roadmap Feature

The extracted GitHub profile is compared against the user's target job role (e.g. **Senior Backend Engineer** or **Full Stack Developer**):

1. **Gap Analysis**:
   - Candidate claims interest in DevOps/Cloud, but 0 of 14 repos contain Dockerfiles or CI/CD GitHub Actions workflows.
   - Candidate uses PostgreSQL in Repo A and MongoDB in Repo B, but lacks Kafka/event streaming.
2. **Dynamic Roadmap Recommendations**:
   - **Action Item**: *"We analyzed your GitHub (`14 repos`). You built an e-commerce API using MongoDB, but modern Senior Backend roles require SQL ACID & Caching. We added **Redis Cache Eviction & PostgreSQL Query Optimization** to your personalized NitiAI Learning Roadmap!"*

---

## 🎙️ Step 4: GitHub Project-Based Probing Questions (Indic Interview Studio)

Feed the extracted project tools directly into Sarvam AI (`Sarvam 105B` LLM & `Bulbul V3` Voice Dictation) to ask 3 targeted question types:

### Type 1: Tool Implementation & Architecture
- **Question**: *"In your repository `ecommerce-backend`, how did you implement Redis caching for product catalog endpoints to prevent cache stampedes?"*

### Type 2: Architectural Justification
- **Question**: *"In your project `niti-ai`, you chose PostgreSQL for relational storage, whereas in `ecommerce-backend` you used MongoDB. What architectural trade-offs led to using MongoDB instead of PostgreSQL for the e-commerce checkout flow?"*

### Type 3: Tool Comparison & Engineering Principles
- **Question**: *"Comparing `PostgreSQL` (used in `niti-ai`) and `MongoDB` (used in `ecommerce-backend`), how do their write latency and data consistency models compare under high concurrent traffic?"*

---

## 🛠️ API & Database Schema Specification

### Database Schema (`user_github_analysis`)
```sql
CREATE TABLE IF NOT EXISTS user_github_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_policy(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  github_username VARCHAR(255) NOT NULL,
  access_token_encrypted TEXT,
  repos_metadata JSONB NOT NULL,
  detected_tools JSONB NOT NULL,
  roadmap_recommendations JSONB NOT NULL,
  probing_questions JSONB NOT NULL,
  analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Express Backend Route (`server/routes/githubAnalysis.js`)
```javascript
const express = require('express');
const router = express.Router();
const axios = require('axios');
const sarvamService = require('../services/sarvamService');

// POST /api/github/analyze
router.post('/analyze', async (req, res) => {
  try {
    const { githubUsername, accessToken } = req.body;
    
    // 1. Fetch lightweight repo list & manifests from GitHub API
    const headers = accessToken ? { Authorization: `token ${accessToken}` } : {};
    const reposRes = await axios.get(`https://api.github.com/users/${githubUsername}/repos?per_page=20`, { headers });
    
    const repoSummaries = reposRes.data.map(repo => ({
      name: repo.name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count
    }));

    // 2. Sarvam 105B LLM Repository Analysis & Question Generation
    const prompt = `Analyze these GitHub repositories for user ${githubUsername}: ${JSON.stringify(repoSummaries)}.
Generate 3 comparative and tool-implementation interview questions comparing tools used across projects.
Return JSON with keys: detectedTools, roadmapGaps, probingQuestions.`;

    const aiAnalysisRaw = await sarvamService.generateCompletion(prompt, 'You are a Senior GitHub Codebase Auditor.', 'sarvam-105b');
    const aiAnalysis = JSON.parse(aiAnalysisRaw);

    res.json({ success: true, githubUsername, analysis: aiAnalysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

---

## 🚀 Key Efficiency Advantages

1. **Zero Disk Overhead**: Uses GitHub API REST JSON endpoints instead of cloning raw source files.
2. **Instant Sub-Second Execution**: Caching dependency trees eliminates redundant network calls.
3. **High Hackathon Impact**: Links real developer code directly into NitiAI's **Indic Voice Interview Studio** and **Learning Roadmap**!
