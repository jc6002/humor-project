import { ArenaNav, ArenaFooter } from '@/components/arena-nav';
import { BattleClient } from '@/components/battle-client';
import { createClient } from '@/lib/supabase/server';
import { hasSupabaseEnv } from '@/lib/supabase/env';
import { generationConfigured } from '@/lib/arena/providers';
import { UUID } from '@/lib/arena/server';
import { getTrendingTopics } from '@/lib/arena/trending';

export const dynamic = 'force-dynamic';

export default async function Arena({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; topic?: string; trending?: string }>;
}) {
  const [{ id, topic, trending }, trendingFeed] = await Promise.all([
    searchParams,
    getTrendingTopics(true),
  ]);

  const db = hasSupabaseEnv() ? await createClient() : null;
  const user = db ? (await db.auth.getUser()).data.user : null;
  const validId = id && UUID.test(id) ? id : null;

  const q = user && db ? await db.rpc('arena_quota') : null;
  let initialBattle = null;

  if (user && db) {
    const b = await db.rpc('arena_battle', { p_id: validId, p_skip: null });
    initialBattle = b.data ?? null;
  } else if (db) {
    // Allow Incognito / signed-out visitors to preview a real blind battle immediately
    const guestRes = await db.rpc('arena_guest_battle', { p_id: validId });
    initialBattle = guestRes.data ?? null;
  }

  return (
    <div className="site-shell">
      <ArenaNav />
      <main>
        <div className="page-heading">
          <p className="eyebrow">BLIND ROAST ARENA · GPT VS GEMINI</p>
          <h1>Two models. One blind taste test.</h1>
          <p>
            Topics, prompt flavors, and model positions are randomized automatically—or pick a live trending headline or custom challenge below.
          </p>
        </div>
        <BattleClient
          signedIn={!!user}
          configured={generationConfigured()}
          initialQuota={q?.data ?? null}
          initialBattle={initialBattle}
          initialTopic={topic}
          initialIsTrending={trending === '1'}
          initialTrending={trendingFeed.topics}
          initialTrendSource={
            trendingFeed.source === 'hackernews_live'
              ? `Live Hacker News Sync (${trendingFeed.syncedAt})`
              : 'Daily Trending Tech Pool'
          }
          available={!user || Boolean(q && !q.error)}
        />
      </main>
      <ArenaFooter />
    </div>
  );
}
