# AI Joke Arena — Week 4

Independent Week 4 version on branch `week4-arena`, based on Week 3 commit `097c86c`. Google login and profiles are shared; Arena has additive tables and a separate Vercel project.

## Features

- Home: model Elo rankings and top community-rated AI roasts.
- GPT and Gemini generate blind A/B pairs about AI models.
- Five successful pairs per signed-in user per rolling hour; historical community voting does not consume generation credits.
- One vote per user per battle; identities revealed after voting. Elo K=16; ties and both-unfunny votes count as draws.
- Battles close after five votes or 24 hours. Top jokes require three decisive votes and a majority of wins, ordered by a smoothed win ratio.
- Supabase stores prompts, outputs, votes, model versions, usage, and rating events. No seed votes.

## Setup

1. Run `npm install` and copy `.env.example` to `.env.local`.
2. Configure Supabase and provider credentials on the server only.
3. New databases: apply `supabase/schema.sql`, then `supabase/arena.sql`. Existing Week 3 database: apply only `supabase/arena.sql`.
4. Add the deployment's `/auth/callback` to Supabase's existing redirect allowlist.
5. Enable `arena_limits.enabled` and set `GENERATION_ENABLED=true` when ready.
6. Run `npm run dev`.

Models: `gpt-6-luna` with reasoning off, and `gemini-3.1-flash-lite` with minimal thinking. Each request calls both providers once, with 1,024 output tokens maximum and no automatic retries.

## Access and cost controls

All Arena tables enable RLS and revoke raw anonymous/authenticated access. Restricted database functions enforce authentication, atomic quotas, anonymous presentations, vote deduplication, and Elo transactions. Generation writes require the server-only service-role key.

Initial site limits: 20 attempts per UTC day and 100 total attempts. Per account: five successful pairs per rolling hour, eight attempts per hour, one active request, and a 30-second cooldown. Failed calls count toward attempt limits. Request caps do not guarantee a currency spending cap; provider billing controls are separate. Limits can be adjusted in `arena_limits`.

## Deployment

GitHub: https://github.com/jc6002/humor-project/tree/week4-arena

Separate Vercel project: `humor-project-week4`, published through the CLI. Configure variables from `.env.example` in Vercel and submit the immutable deployment URL to the course website.

See `AI_JOKE_ARENA_PLAN.md` for planning background. Isolated database checks are available through `npm run test:db`; they do not create production votes.
