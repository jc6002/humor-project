# AI Joke Arena — Week 7 (Consumer App)

Consumer-facing blind 1v1 comedy benchmark (`humor-project`) pitting **GPT** against **Gemini** on live tech & campus scenarios, powered by a dynamically weighted **Prompt Chain Mix** and full **LLM Observability** managed in `humor-project-admin`.

---

## What's New in Week 7

1. **Dynamic Multi-Step Prompt Chain Steering**:
   - Every fresh generation dynamically samples an active flavor from `public.prompt_chains` weighted by `mix_weight`, injects ordered `public.prompt_chain_steps`, enforces active `public.comedy_terms` (banned clichés + comedy glossary), and pulls gold few-shot examples from `public.ai_generation_examples`.
   - Every provider call logs raw JSON outputs, HTTP status, latency, and input/output/reasoning token telemetry to `public.llm_responses`.

2. **Incognito / Guest Blind Preview & Seamless Return-to-Battle OAuth**:
   - Signed-out and Incognito visitors on `/arena` can immediately preview real blind matchups via `arena_guest_battle` (with zero model-identity leakage) before signing in.
   - `/auth/signin` and `/auth/callback` preserve `?next=` redirects and enforce `public.allowed_signup_domains` and `public.whitelisted_emails` (including automatic `is_superadmin` elevation for flagged emails).

3. **Post-Vote "Behind the Punchline" Micro-Observability**:
   - After casting a blind vote on `/arena`, cards reveal each model's Prompt Chain flavor, latency, Elo delta, and pre-generation Micro-CoT (`clicheToAvoid` and `comicTwist`).

4. **Unified Live Hacker News Trending Feed & Interactive Hall of Flame**:
   - Homepage (`/`) and `/arena` share `src/lib/arena/trending.ts`, fetching live Hacker News top stories with one-click `"Roast this headline ↗"` deep links.
   - Homepage renders **Comedy Angle Breakdown** win-share & groan-rate cards (`categoryStats`) and interactive **Hall of Flame** filter chips (`All`, `Gemini`, `GPT`, and top humor angles).

---

## Setup & Database Migration

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure `.env.local` (same Supabase project as `humor-project-admin`):
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   OPENAI_API_KEY=sk-...
   GEMINI_API_KEY=AIza...

   OPENAI_MODEL=gpt-6-luna,gpt-5.6-luna
   GEMINI_MODEL=gemini-3-flash-preview
   GENERATION_ENABLED=true
   ```
3. Run the additive Week 7 SQL migration once in the **Supabase SQL Editor**:
   - Open `supabase/week7_migration.sql` and click **Run** (100% additive and backwards-compatible with Weeks 5 & 6; backfills `public.llm_responses` from existing `arena_generations`).
4. Start the app:
   ```bash
   npm run dev
   ```
5. In Vercel **Project Settings → Deployment Protection**, disable **Vercel Authentication** so commit-specific URLs open cleanly in Incognito Mode.
