export type TrendingTopic = {
  id: string;
  headline: string;
  tag: string;
  source: string;
  url?: string;
  syncedAt: string;
};

export const CURATED_TRENDING: TrendingTopic[] = [
  {
    id: 'trend-1',
    headline: 'Developer ships "100% AI-written SaaS" on X; production database wiped 11 minutes later',
    tag: 'Viral Tech News',
    source: 'HN Front Page',
    syncedAt: 'Daily Sync',
  },
  {
    id: 'trend-2',
    headline: 'Tech giant announces 47th model naming scheme with three decimals and a Greek letter',
    tag: 'AI Release Drama',
    source: 'HN Front Page',
    syncedAt: 'Daily Sync',
  },
  {
    id: 'trend-3',
    headline: 'Startup replaces customer support with AI agent that offers 90% refunds on "ignore previous instructions"',
    tag: 'Prompt Injection',
    source: 'HN Front Page',
    syncedAt: 'Daily Sync',
  },
  {
    id: 'trend-4',
    headline: 'CS course bans AI autocomplete; students rediscover that arrays are 0-indexed',
    tag: 'Campus & Engineering',
    source: 'Trending Feed',
    syncedAt: 'Daily Sync',
  },
];

export async function getTrendingTopics(live = true): Promise<{
  topics: TrendingTopic[];
  source: 'hackernews_live' | 'daily_trending_pool';
  syncedAt: string;
}> {
  if (live) {
    try {
      const res = await fetch('https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=8', {
        signal: AbortSignal.timeout(3200),
        headers: { Accept: 'application/json' },
        next: { revalidate: 1800 },
      });
      if (res.ok) {
        const json = (await res.json()) as {
          hits?: Array<{ objectID: string; title?: string; url?: string }>;
        };
        const hits = (json.hits ?? []).filter(
          (h) => h.title && h.title.length >= 20 && h.title.length <= 160
        );
        if (hits.length >= 4) {
          const syncedAt = `${new Date().toISOString().slice(11, 16)} UTC`;
          const topics: TrendingTopic[] = hits.slice(0, 4).map((h, i) => ({
            id: `hn-${h.objectID || i}`,
            headline: h.title!,
            tag: `HN #${i + 1}`,
            source: 'Hacker News Live',
            url: h.url,
            syncedAt,
          }));
          return { topics, source: 'hackernews_live', syncedAt };
        }
      }
    } catch {
      // Graceful fallback when offline or rate-limited
    }
  }

  return {
    topics: CURATED_TRENDING,
    source: 'daily_trending_pool',
    syncedAt: 'Daily Sync',
  };
}
