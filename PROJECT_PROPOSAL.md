# Product Topic Proposal: AI Joke Arena
### A Crowdsourced Blind A/B Rating & Entertainment Platform for Generative AI Satire

| Project Attribute | Specification Details |
| :--- | :--- |
| **Product Lead / Author** | Junjie Cheng (`jc6002@columbia.edu`) |
| **Course & Term** | COMS 6998: Designing for Generative AI (The Humor Project) • Fall 2026 |
| **Studio & Faculty** | Prof. Lydia Chilton • Computational Design Lab, Columbia University |
| **Document Classification** | Commercial Product Topic Proposal & PRD Specification (v2.0) |

---

## 1. Executive Summary & Product Vision

Generative AI has achieved remarkable utility in analytical tasks, coding, and workflow automation. However, in consumer entertainment and creative wit, existing AI products remain notoriously flat, corporate, and unengaging. When prompted for humor, commercial foundational models routinely produce predictable dad jokes, sterilized puns, or apologetic safety disclaimers that destroy comedic timing.

**AI Joke Arena** is a gamified, crowdsourced blind evaluation and entertainment platform designed to commercialize and benchmark machine humor. Positioned as the *"LMSYS Chatbot Arena for AI Comedy"*, the platform pits state-of-the-art Large Language Models head-to-head in blind, real-time comedic roast battles grounded in software engineering, startup culture, and generative AI failure modes.

Through frictionless pairwise voting, an instantaneous Elo leaderboard reveal, and a curated "Hall of Flame" showcase, AI Joke Arena transforms subjective humor evaluation into an addictive consumer product loop. Crucially, the platform operates on a **continuous, feedback-driven iteration engine**—using weekly studio peer critiques and behavioral user telemetry to iteratively refine prompt scaffolding, eliminate user friction, and benchmark model personality.

---

## 2. Market Opportunity & Problem Statement

### 2.1 The Problem: Why Commercial AI Humor is Broken
Current consumer applications of generative AI suffer from three severe product experience flaws when attempting humor:
1. **The Corporate Predictability Trap:** Autoregressive models conditioned for generic helpfulness favor high-probability tokens, defaulting to stale schoolyard puns (*"Why did the computer catch a cold? It left its Windows open!"*).
2. **Alignment Hedging & Moralizing:** Heavy RLHF/DPO safety guardrails cause models to prefix satire with patronizing disclaimers or append explanatory apologies, entirely neutralizing comedic misdirection.
3. **Verbosity Bias:** Models over-explain punchlines, violating the fundamental rule of comedy that communicative impact scales inversely with word count.

### 2.2 Target Market & Core User Personas
The tech ecosystem represents a massive, highly engaged, and culturally cohesive audience with an insatiable appetite for relatable satire:
- **Primary Persona: "The Vibe Coder / AI Engineer" (Age 20–35):** Spends 8+ hours a day wrangling AI coding assistants, debugging hallucinated APIs, and dealing with sprint burnout. Craves 30-second bites of dark, satirical humor during code builds and coffee breaks.
- **Secondary Persona: "The Tech Enthusiast & Slack Curator":** Active on Reddit (r/programmerhumor), Hacker News, and developer Discord/Slack channels. Actively seeks hilarious AI outputs to bookmark, screenshot, and share with colleagues.

### 2.3 Value Proposition
- **For Users:** A high-dopamine, 30-second entertainment break where they judge competing AI models, discover razor-sharp satire, and share viral one-liners.
- **For AI Developers & Creators:** An authenticated, crowd-vetted public leaderboard that objectively tracks which foundation models possess genuine creative wit, timing, and personality.

---

## 3. Core Product Experience & User Loops

The product architecture is engineered around a tight, high-retention loop connecting rapid-fire consumption, decisive evaluation, and social distribution.

```
       [ 1. Blind Battle Feed ]
        /                     \
[ Model A Roast ]      [ Model B Roast ]
        \                     /
       [ 2. Decisive Vote Cast ]
                  ↓
       [ 3. Instant Dopamine Reveal ]
       - Model Names Unmasked
       - Real-time Elo Delta Applied
       - Win Rate Statistics Displayed
                  ↓
       [ 4. Viral Social Distribution ]
       - 3-Vote Graduation into "Hall of Flame"
       - One-Click Social Sharing (X / Slack / Link)
       - Next Battle Pre-fetched (<300ms)
```

### 3.1 The Blind Arena (Zero-Friction Swipe / Vote)
- Evaluators are presented with a relatable developer/AI failure scenario (e.g., *"When your junior agent commits 4,000 lines of untested regex directly to main"*).
- Two competing models generate rival satirical takes, displayed on identical, unbranded cards (Card A vs. Card B).
- To prevent brand bias, all model metadata, provider latency differences, and styling cues are completely isolated on the server.
- Users cast a vote via one click or keyboard shortcut: **Card A**, **Card B**, **Both Good (Tie)**, or **Both Bad (Mutual Rejection)**.

### 3.2 Instant Dopamine & Elo Rating Reveal
- Immediately upon voting, the curtain drops: Card A and Card B flip to reveal model identities (e.g., *Gemini 2.5 Flash* vs. *GPT-4o*).
- An animated badge updates both models' live Elo ratings using an atomic Bradley-Terry calculation ($K=16$).
- Users instantly see whether their judgment aligned with the broader crowd consensus.

### 3.3 The "Hall of Flame" (Viral Showcase)
- Individual jokes that reach a threshold of **3 decisive community votes** graduate into the public Hall of Flame.
- Jokes are ranked via empirical Bayes Laplace-smoothed win rates, giving users a constantly updating digest of the funniest AI-generated roasts.
- Each item features one-click copy links and social card embeds formatted for Twitter/X and developer Slack channels.

### 3.4 Admin Operations & Telemetry Suite
- A centralized control panel for founders and community operators to monitor live platform health.
- Real-time cross-model win/loss matrices, prompt failure tracking, user quota consumption, and full content CRUD (purge low-quality generations or inject curated test battles).

---

## 4. The Feedback-Driven Product Iteration Engine

In accordance with commercial product studio methodology, AI Joke Arena is built through weekly feedback cycles involving real user testing, studio peer critiques, and telemetry analysis. Every major architectural decision was born directly out of user feedback:

### Iteration 1: Overcoming the Dad Joke Crisis (Prompt Scaffolding)
- **User Feedback / Problem:** In early user testing of the MVP, evaluators rated over 42% of battles as *"Both Bad"*. Users complained: *"These sound like AI trying to tell jokes at a corporate retreat"* and *"Why is it always a pun about cache or bugs?"*
- **Product Pivot:** We developed **Micro-Chain-of-Thought (Micro-CoT) Anti-Cliché Scaffolding**. The prompt forces the model to generate and explicitly discard the most obvious pun before writing the final roast, while strictly constraining output length to 15–42 words.
- **Outcome:** The "Both Bad" mutual rejection rate plummeted from 42% to 14% in subsequent studio testing, dramatically improving user engagement.

### Iteration 2: Eliminating Latency & Cold-Start Friction (Hybrid Matchmaking)
- **User Feedback / Problem:** Live dual-API generation caused a 4-to-6-second loading spinner between battles. Evaluators reported drop-offs: *"I just want to vote quickly; waiting for two LLMs to generate in real-time kills the flow."* Furthermore, new battles were starved of votes while older battles accumulated redundant votes.
- **Product Pivot:** We engineered **Stochastic Hybrid Matchmaking (60/40 Queue)**:
  - **60% Community Pool:** Instantly serves pre-generated battles nearing the 3-vote graduation threshold (`ORDER BY votes DESC, RANDOM()`), delivering sub-300ms page transitions.
  - **40% Live Generation:** Triggers fresh, real-time battles from a rotating bank of developer prompts.
  - Reduced the graduation threshold from 10 votes to **3 decisive votes** to accelerate content flow.
- **Outcome:** Evaluator session length increased from 3.2 battles to 8.7 battles per session, with zero user dropout due to loading latency.

### Iteration 3: Creator Governance & Telemetry (The Week 6 Operations Suite)
- **User Feedback / Problem:** As battle volume grew, studio peers noted occasional edge-case model hallucinations, empty outputs, or prompts that consistently produced unfunny outputs. Operators had no visibility into model failure modes without digging into raw database tables.
- **Product Pivot:** We built a comprehensive **Admin Operations & Telemetry Dashboard** equipped with cross-model win matrices, rejection analytics across error taxonomies, and instant CRUD moderation tools secured behind Google OAuth superadmin verification.
- **Outcome:** Operators can now identify underperforming prompt templates within minutes and purge low-quality generations with one click.

---

## 5. Product Milestone Roadmap

The development cadence follows a structured weekly sprint schedule, moving systematically from core infrastructure to advanced viral growth:

| Sprint / Milestone | Product Deliverables | Feedback & User Testing Focus |
| :--- | :--- | :--- |
| **Week 3** | **Foundations & User Onboarding**<br>• Supabase DB setup & Google OAuth integration<br>• User profile persistence & quota tracking<br>• Responsive, dark-mode mobile/desktop shell | • Authenticated onboarding friction<br>• Session persistence across reloads<br>• Mobile viewport responsiveness |
| **Week 4** | **Core Comparative Arena (MVP)**<br>• Dual-model API orchestration (OpenAI & Gemini)<br>• Double-blind A/B voting interface<br>• Atomic Elo rating engine ($K=16$)<br>• Vercel production deployment | • Voting affordances and card layout<br>• Feedback on blind unmasking animation<br>• Establishing baseline model win rates |
| **Week 5** | **Humor Scaffolding & Smart Matchmaking**<br>• Micro-CoT anti-cliché prompt scaffolding<br>• Flagship model integration (Gemini 2.5 Flash, GPT-4o)<br>• Stochastic hybrid 60/40 queue matchmaking<br>• Hall of Flame 3-vote graduation showcase | • Testing reduction in "Both Bad" votes<br>• Latency benchmarks (<300ms transitions)<br>• Hall of Flame content quality validation |
| **Week 6** | **Admin Operations & Telemetry Suite**<br>• Real-time model win/loss matrix dashboard<br>• Error taxonomy & rejection rate analytics<br>• Full content lifecycle CRUD & test injection<br>• Role-based access control (Superadmin gate) | • Operator usability during live evaluations<br>• Anomaly detection in model win curves<br>• Rapid content curation and moderation |
| **Weeks 7–8** | **Multimodal Satire & Visual Memes**<br>• Automatic pairing of winning punchlines with memes<br>• Image generation / meme canvas rendering<br>• Multimodal side-by-side battle interface | • Visual humor resonance vs. text-only<br>• Meme template relevance testing<br>• Mobile image load performance |
| **Weeks 9–12** | **Viral Distribution & Public Launch**<br>• One-click Slack/Discord bot integrations<br>• User-submitted battle scenarios & creator credit<br>• Public API for live community Elo leaderboards<br>• Final capstone showcase & public launch | • Viral conversion rates from shared links<br>• Community scenario submission quality<br>• Longitudinal model Elo convergence |

---

## 6. Business Viability, Unit Economics & Cost Controls

To ensure commercial feasibility, the product is architected for extreme cost efficiency and abuse resilience:

```
[ Unauthenticated Visitor ] ──> 5 Free Battles / Hour  ──> Prompts Google Sign-In
[ Authenticated User ]      ──> 20 Battles / Hour       ──> Unlocks Hall of Flame Bookmarks
[ Upstream Fallback Cache ] ──> Fallback on 429 / 500   ──> Zero Error Screen Disruptions
```

- **Ultra-Low Unit Economics (<$0.001 per battle):** Utilizing high-speed, cost-effective models (e.g., `gemini-2.5-flash` at \$0.075/1M input tokens) combined with strict 42-word output limits keeps the raw API cost of a complete two-model battle under **\$0.0008**.
- **Tiered Quota Throttling:** Strict 60-minute rolling rate limits protect API budgets while creating natural scarcity that drives user sign-ups.
- **Fail-Safe Caching:** If upstream LLM providers return rate limit errors (HTTP 429) or service outages, the matchmaker instantaneously switches to serving unrated battles from the pre-generated database pool, guaranteeing 100% platform uptime.
- **Commercial Monetization Potential:**
  - *Sponsored Tech Battles:* Tech companies sponsor topical roast battles (e.g., *"Kubernetes vs. Docker"*) for developer brand awareness.
  - *Enterprise Personality Benchmarking:* B2B subscription for AI labs seeking qualitative human alignment telemetry on custom fine-tunes.

---

## 7. Key Product Metrics & Success Criteria (KPIs)

The success of the platform is tracked against actionable product and engagement metrics:

| Metric Category | Key Performance Indicator (KPI) | Target Benchmark |
| :--- | :--- | :--- |
| **User Engagement** | Average Battles per Session | $\ge$ 8 battles / session |
| **Evaluation Quality** | Mutual Rejection ("Both Bad") Rate | $\le$ 15% of total votes |
| **Product Latency** | Pre-generated Battle Transition Time | $\le$ 300 ms |
| **Retention & Virality** | Hall of Flame Social Share Conversion | $\ge$ 5% of graduated views |
| **Model Differentiation** | Statistically Significant Elo Separation | $\Delta \text{Elo} \ge 120$ between tiers |
| **Cost Efficiency** | Blended API Cost per Finished Battle | $\le$ \$0.001 USD |

---

## 8. Risk Management & Product Safeguards

| Potential Risk | Impact / Likelihood | Product Mitigation Strategy |
| :--- | :--- | :--- |
| **Upstream API Outages or Spikes** | High / Medium | Automatic fallback to cached database battle pool; zero user-facing error downtime. |
| **Voter Brand & Position Bias** | High / Low | Cryptographic left/right card shuffling; total stripping of model metadata in transit; uniform typography. |
| **Runaway Generation Costs** | Critical / Low | Hard token caps (max 400 tokens per battle), rolling hourly user quotas, and global budget kill switches. |
| **Cold-Start Battle Pool Sparsity** | Medium / Low | 3-vote graduation threshold combined with prioritized 60% hybrid queue matching for near-threshold items. |
| **Admin Panel Security Breach** | Critical / Low | Multi-layered defense: Next.js middleware session check + Postgres Row-Level Security verification (`is_superadmin`). |

---

## 9. Conclusion

AI Joke Arena addresses a clear, unserved commercial opportunity in the generative AI landscape: transforming the evaluation of machine wit from a sterile benchmark into an engaging, feedback-driven consumer product. By pairing gamified blind pairwise battles with disciplined weekly product iterations, the platform creates an entertaining user experience while generating valuable human alignment telemetry for the next generation of creative AI products.
