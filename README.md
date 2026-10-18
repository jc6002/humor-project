# AI Joke Arena — Week 6

> **Product Proposal & Feedback Iteration Update**  
> Course: COMS 6998: Designing for Generative AI (The Humor Project) • Fall 2026  
> Author: Junjie Cheng (`jc6002@columbia.edu`)

---

## Overview

AI Joke Arena is a gamified, crowdsourced blind evaluation benchmark for frontier LLM humor. Based on user and studio feedback documented in the **Product Topic Proposal** (*"AI Joke Arena: a crowd-sourced humor benchmark for frontier LLMs"*), Week 6 implements all planned feedback iterations, dynamic multi-model pairing, real-time internet trending topic sync, and multi-dimensional comedy analytics.

---

## What's New in Week 6

### 1. Custom Topic Challenge (`/arena`)
- Evaluators can now break out of pre-set scenarios by typing into the **Custom Topic Input**:
  > *"Have a topic in mind? Challenge both models..."*
- Submitting an custom topic immediately orchestrates a fresh head-to-head blind roast battle between GPT and Gemini on user-supplied premises, campus inside jokes, or viral memes.

### 2. Scheduled Trending Premise Sync (`/api/arena/trending` & Daily Cron)
- Replaces static jokes with real-time internet humor.
- Integrates with the public **Hacker News Front-Page API** to fetch top tech/AI headlines daily.
- Configured via [`vercel.json`](file:///d:/The%20Humor%20Project/humor-project/vercel.json) with automated daily cron (`0 13 * * *`), with fallback to a curated daily trending pool.
- Users can click any trending headline pill on `/arena` to trigger an instant battle on breaking tech news.

### 3. Dynamic Multi-Model Pairing (4 Matching Combinations)
- Solved the static single-model limitation (`GEMINI 3 preview vs GPT 6`).
- Both OpenAI and Gemini now support comma-separated dynamic pools:
  - **OpenAI Pool**: `gpt-6-luna`, `gpt-5.6-luna`
  - **Gemini Pool**: `gemini-3-flash-preview`, `gemini-3.1-flash-lite`
- Each new battle stochastically pairs one OpenAI model and one Gemini model with 50/50 cryptographic Left/Right card shuffling, producing 4 diverse matchup permutations:
  1. `GPT-6 Luna` ⚔️ `Gemini 3 Flash Preview`
  2. `GPT-6 Luna` ⚔️ `Gemini 3.1 Flash Lite`
  3. `GPT-5.6 Luna` ⚔️ `Gemini 3 Flash Preview`
  4. `GPT-5.6 Luna` ⚔️ `Gemini 3.1 Flash Lite`
- Updated Gemini thinking configuration to `thinkingConfig: { thinkingLevel: 'MINIMAL' }`, preventing token truncation while maintaining fast latency.

### 4. Multi-Dimensional Leaderboard & Category Analytics (`/`)
- Upgraded the homepage to showcase deep comparative comedy analytics:
  - **Head-to-Head Family Win Share**: Visual split bar tracking decisive win percentage between GPT and Gemini families.
  - **Crowd Telemetry**: Decisive picks, dead-heat ties, and competing snapshot breakdown.
  - **Angle & Category Splits**: Real-time breakdown of votes, GPT wins, Gemini wins, ties, and groan rates across comedy angles (Refusals, Hallucinations, Coding Disasters, etc.).
  - **Hall of Flame Showcase**: Community-curated top jokes graduating at 3 decisive votes.

### 5. Week 6 Database Migration (`supabase/week6_migration.sql`)
- Additive, 100% backward-compatible migration.
- Adds `is_superadmin` and `email` to `public.profiles` with privilege escalation prevention triggers.
- Enhances `arena_public()` RPC for category statistics.
- Fixes `arena_history()` so community battles voted on by the user properly appear in `/my-battles`.

---

## System Architecture

```
[ Unauthenticated Evaluator ] ──> Blind 1v1 Arena ──> Google OAuth
[ Evaluator Casts Vote ]     ──> Reveals Identities + Live Elo Shifts (+8 / -8)
[ 3-Vote Community Threshold]──> Graduates to Homepage "Hall of Flame"
[ Admin Operations Suite ]   ──> humor-project-admin (Independent Repo & App)
```

---

## Setup & Configuration

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment template:
   ```bash
   cp .env.example .env.local
   ```

3. Configure credentials in `.env.local`:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   OPENAI_API_KEY=sk-...
   GEMINI_API_KEY=AIza...

   # Comma-separated model pools
   OPENAI_MODEL=gpt-6-luna,gpt-5.6-luna
   GEMINI_MODEL=gemini-3-flash-preview,gemini-3.1-flash-lite
   GENERATION_ENABLED=true
   ```

4. Apply database migrations in Supabase SQL Editor:
   - For fresh setup: `supabase/schema.sql`, `supabase/arena.sql`, `supabase/week6_migration.sql`.
   - For existing Week 5 database: run `supabase/week6_migration.sql`.

5. Start development server:
   ```bash
   npm run dev
   ```

---

## Verification & Testing

```bash
node tests/battle-flow.mjs   # Tests hybrid matchmaker, custom topics, and error recovery
npm run build                # Validates production Next.js compilation (Turbopack)
```

---

## Deployment & Repository Isolation

- **Week 4 (Frozen Submission)**: Branch `week4-arena` on Vercel project `humor-project-week4`.
- **Week 5 / 6 (Joke Lab)**: Branch `main` and `week5-arena` on Vercel project `humor-project-week3`.
- **Week 6 (Admin Panel)**: Dedicated repository and Vercel project `humor-project-admin`.
