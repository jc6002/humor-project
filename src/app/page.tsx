import Link from 'next/link';
import { ArenaNav, ArenaFooter } from '@/components/arena-nav';
import { HallOfFlame } from '@/components/hall-of-flame';
import { publicArena } from '@/lib/arena/server';
import { getTrendingTopics } from '@/lib/arena/trending';

export const dynamic = 'force-dynamic';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ authError?: string }>;
}) {
  const [{ authError }, { data, available }, trendingFeed] = await Promise.all([
    searchParams,
    publicArena(),
    getTrendingTopics(true),
  ]);

  return (
    <div className="site-shell">
      <ArenaNav />
      <main>
        {authError === 'domain_restricted' && (
          <p className="error-message" role="alert" style={{ marginTop: 22 }}>
            Sign-in restricted: your account’s email domain is not currently in the Allowed Signup Domains list or Whitelisted E-mail Addresses. Contact an administrator to request access.
          </p>
        )}
        {authError === 'signin' && (
          <p className="error-message" role="alert" style={{ marginTop: 22 }}>
            Google sign-in could not be started right now. Please try again.
          </p>
        )}

        <section className="home-intro">
          <div>
            <p className="eyebrow">
              <span className="live-dot" /> BLIND AI COMEDY BENCHMARK · GPT VS GEMINI
            </p>
            <h1>
              Great models.
              <br />
              <span className="muted-heading">Questionable jokes.</span>
            </h1>
            <p className="intro-copy">
              GPT and Gemini go head-to-head in anonymous two-liner comedy battles.
              <br />
              You vote on the funnier punchline before model identities and micro-thoughts are revealed.
            </p>
            <div className="hero-actions">
              <Link href="/arena" className="button">
                Enter the arena ↗
              </Link>
              <a href="#top-roasts" className="text-link">
                Read the top roasts ↓
              </a>
            </div>
          </div>
          <aside className="arena-ticket" aria-label="Matchup overview">
            <div className="ticket-top">
              <span>BLIND MATCHUP</span>
              <span>GPT VS GEMINI</span>
            </div>
            <div className="matchup">
              <span className="model-orb gpt">G</span>
              <span className="versus">VS</span>
              <span className="model-orb gemini">✦</span>
            </div>
            <div className="matchup-labels">
              <span>GPT</span>
              <span>Gemini</span>
            </div>
            <div className="ticket-bottom">
              <span>Same scenario. Hidden identities.</span>
              <strong>ONE FUNNIER PUNCHLINE.</strong>
            </div>
          </aside>
        </section>

        <section className="ranking-section" aria-labelledby="rankings">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE CROWD HAS SPOKEN</p>
              <h2 id="rankings">Live Elo Leaderboard</h2>
            </div>
            <span className="meta-label">
              {data.stats.votes} votes · {data.stats.battles} battles
            </span>
          </div>
          <div className="table-scroll">
            <table className="ranking-table">
              <thead>
                <tr>
                  <th scope="col">RANK</th>
                  <th scope="col">MODEL</th>
                  <th scope="col">ELO SCORE</th>
                  <th scope="col">WIN / LOSS / TIE</th>
                  <th scope="col">BATTLES</th>
                  <th scope="col">AVG LATENCY</th>
                  <th scope="col">WIN RATE</th>
                </tr>
              </thead>
              <tbody>
                {data.models.length
                  ? data.models.map((m, i) => {
                      const decisive = m.wins + m.losses;
                      const winRate = decisive > 0 ? `${Math.round((m.wins / decisive) * 100)}%` : '—';
                      return (
                        <tr key={m.id}>
                          <td className="rank-number">
                            {String(
                              data.models.findIndex((x) => Math.round(x.rating) === Math.round(m.rating)) + 1
                            ).padStart(2, '0')}
                          </td>
                          <td>
                            <div className="model-cell">
                              <span className={`model-avatar ${m.name === 'GPT' ? 'gpt' : 'gemini'}`}>
                                {m.name === 'GPT' ? 'G' : '✦'}
                              </span>
                              <span>
                                <strong>{m.name}</strong>
                                <small>{m.version}</small>
                              </span>
                              {i === 0 && (
                                <span className="crown" title="Highest current Elo">
                                  ♛
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="elo">{Math.round(m.rating)}</td>
                          <td className="record">
                            {m.wins} / {m.losses} / {m.ties}
                          </td>
                          <td>{m.battles}</td>
                          <td className="record">
                            {m.avg_latency_ms ? `${(m.avg_latency_ms / 1000).toFixed(2)}s` : '—'}
                          </td>
                          <td>
                            <span className={`status-pill ${i === 0 ? 'pill-superadmin' : ''}`}>
                              {winRate}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  : ['GPT', 'Gemini'].map((name, i) => (
                      <tr key={name}>
                        <td className="rank-number">—</td>
                        <td>
                          <div className="model-cell">
                            <span className={`model-avatar ${i === 0 ? 'gpt' : 'gemini'}`}>
                              {i === 0 ? 'G' : '✦'}
                            </span>
                            <span>
                              <strong>{name}</strong>
                              <small>First matchup coming soon</small>
                            </span>
                          </div>
                        </td>
                        <td className="elo dim">—</td>
                        <td className="dim">—</td>
                        <td>0</td>
                        <td className="dim">—</td>
                        <td>
                          <span className="status-pill">—</span>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
          <p className="ranking-note">
            Ratings start at 1,000 and update after every blind vote. Prompts are dynamically steered by our multi-chain Prompt Chain Mix.
          </p>
          {(() => {
            const gptWins = data.models
              .filter((m) => m.name === 'GPT')
              .reduce((acc, m) => acc + m.wins, 0);
            const geminiWins = data.models
              .filter((m) => m.name === 'Gemini')
              .reduce((acc, m) => acc + m.wins, 0);
            const totalDecisive = gptWins + geminiWins;
            const gptPct = totalDecisive > 0 ? Math.round((gptWins / totalDecisive) * 100) : 50;
            const geminiPct = 100 - gptPct;
            const totalTies = Math.round(
              data.models.reduce((acc, m) => acc + m.ties, 0) / 2
            );
            return (
              <div className="analytics-strip" aria-label="Multi-dimensional roast breakdown">
                <div className="analytics-card">
                  <div>
                    <p className="eyebrow" style={{ marginBottom: 6 }}>
                      HEAD-TO-HEAD FAMILY SPLIT
                    </p>
                    <h3>GPT vs. Gemini Decisive Win Share</h3>
                  </div>
                  <div className="win-share-bar">
                    <div className="win-share-gpt" style={{ width: `${gptPct}%` }}>
                      GPT ({gptWins}W · {gptPct}%)
                    </div>
                    <div className="win-share-gemini" style={{ width: `${geminiPct}%` }}>
                      Gemini ({geminiWins}W · {geminiPct}%)
                    </div>
                  </div>
                </div>
                <div className="analytics-card">
                  <div>
                    <p className="eyebrow" style={{ marginBottom: 6 }}>
                      CROWD TELEMETRY
                    </p>
                    <h3>Matchup Decisiveness &amp; Pool Depth</h3>
                  </div>
                  <div className="analytics-mini-grid">
                    <div className="analytics-stat">
                      <strong>{totalDecisive}</strong>
                      <small>Decisive picks</small>
                    </div>
                    <div className="analytics-stat">
                      <strong>{totalTies}</strong>
                      <small>Dead-heat ties</small>
                    </div>
                    <div className="analytics-stat">
                      <strong>{data.models.length}</strong>
                      <small>Competing snapshots</small>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {data.categoryStats && data.categoryStats.length > 0 && (
            <div className="analytics-card" style={{ marginTop: 18 }}>
              <div className="custom-topic-header">
                <div>
                  <p className="eyebrow" style={{ marginBottom: 6 }}>
                    COMEDY ANGLE BREAKDOWN
                  </p>
                  <h3>Which model wins each humor scenario?</h3>
                </div>
                <span className="meta-label">Decisive wins &amp; crowd groan rate by angle</span>
              </div>
              <div className="category-grid">
                {data.categoryStats.slice(0, 6).map((c) => {
                  const dec = c.gpt_wins + c.gemini_wins;
                  const gPct = dec > 0 ? Math.round((c.gpt_wins / dec) * 100) : 50;
                  const groanPct = c.total_votes > 0 ? Math.round((c.groans / c.total_votes) * 100) : 0;
                  return (
                    <div className="category-stat-card" key={c.angle}>
                      <div className="roast-card-top">
                        <strong style={{ color: 'var(--foreground)', fontFamily: 'var(--font-sans)', fontSize: 14 }}>
                          {c.angle}
                        </strong>
                        <span>{c.total_votes} votes</span>
                      </div>
                      <div className="win-share-bar" style={{ height: 26, fontSize: 11 }}>
                        <div className="win-share-gpt" style={{ width: `${gPct}%` }}>
                          GPT {c.gpt_wins}W
                        </div>
                        <div className="win-share-gemini" style={{ width: `${100 - gPct}%` }}>
                          Gemini {c.gemini_wins}W
                        </div>
                      </div>
                      <div className="roast-card-top" style={{ fontSize: 11 }}>
                        <span>{c.ties} ties</span>
                        <span>Groan rate: {groanPct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!available && (
            <p className="notice">The arena is being prepared. Rankings will appear once the first real battles are ready.</p>
          )}
        </section>

        <section className="top-section" id="trending-pool" aria-labelledby="trending-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                <span className="live-dot" /> SCHEDULED TRENDING HUMOR &amp; NEWS SYNC
              </p>
              <h2 id="trending-heading">Today’s trending tech premises.</h2>
            </div>
            <span className="meta-label">
              {trendingFeed.source === 'hackernews_live'
                ? `Live Hacker News Sync · ${trendingFeed.syncedAt}`
                : 'Daily Trending Feed · HN & Tech'}
            </span>
          </div>
          <div className="roast-grid">
            {trendingFeed.topics.map((item) => (
              <article className="trending-card" key={item.id}>
                <div className="roast-card-top">
                  <span className="target-tag">{item.tag}</span>
                  <span>
                    {item.source} · {item.syncedAt}
                  </span>
                </div>
                <p className="trending-headline">“{item.headline}”</p>
                <div className="roast-card-bottom" style={{ paddingTop: 14 }}>
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-link"
                      style={{ fontSize: 12 }}
                    >
                      Source story ↗
                    </a>
                  ) : (
                    <span className="meta-label">Pitch this headline to GPT vs. Gemini</span>
                  )}
                  <Link
                    href={`/arena?topic=${encodeURIComponent(item.headline)}&trending=1`}
                    className="button button-small button-outline"
                  >
                    Roast this headline ↗
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <p className="ranking-note">
            Synced automatically from live Hacker News front-page stories so GPT and Gemini roast real breaking tech news rather than stale SEO joke lists.
          </p>
        </section>

        <section className="top-section" id="top-roasts" aria-labelledby="roasts" style={{ paddingBottom: 48 }}>
          <div className="section-heading">
            <div>
              <p className="eyebrow">HALL OF FLAME</p>
              <h2 id="roasts">The punchlines that landed.</h2>
            </div>
            <Link href="/arena" className="text-link">
              Judge a blind battle ↗
            </Link>
          </div>
          <HallOfFlame jokes={data.topJokes} />
        </section>
      </main>
      <ArenaFooter />
    </div>
  );
}
