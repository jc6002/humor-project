# The Laugh List — Week 3 Auth

This Next.js app extends the Week 2 Supabase joke list with Google authentication, user profiles, avatar uploads, and a members-only route.

## What is included

- Google OAuth with a PKCE callback at `/auth/callback`
- Cookie-based server authentication using `@supabase/ssr`
- A `profiles` row created automatically for each new `auth.users` row
- A first-login prompt for first and last name
- Profile editing and image uploads to a public `avatars` Storage bucket
- Server- and proxy-protected `/members` and `/profile` routes
- Row Level Security policies that limit profile edits and uploads to the signed-in user

## Local setup

Install dependencies and create `.env.local`:

```bash
npm install
```

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL Editor. The script is safe to run more than once.

In Supabase Authentication:

1. Enable Google and enter the Google OAuth client ID and secret.
2. Add `http://localhost:3000/auth/callback` to the redirect allow list for local testing.
3. Add the production `/auth/callback` URL and the appropriate Vercel preview wildcard.

In the Google OAuth web client, use the Supabase callback shown on the Google provider panel, which looks like:

```text
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

Start the app:

```bash
npm run dev
```

## Checks

```bash
npm run lint
npm run build
```
