import Link from 'next/link';
import { ArenaNav, ArenaFooter } from '@/components/arena-nav';
import { publicArena } from '@/lib/arena/server';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { data, available } = await publicArena();
  return (
    <div className="site-shell">
      <ArenaNav />
      <main>
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
              You vote on the funnier punchline before model identities are revealed.
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
                        <td>
                          <span className="status-pill">—</span>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
          <p className="ranking-note">
            Ratings start at 1,000 and update after every blind vote (K = 32). Only GPT and Gemini snapshots compete in this arena.
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
            <span className="meta-label">Daily Cron · HN Front Page &amp; Viral Tech</span>
          </div>
          <div className="roast-grid">
            {[
              {
                tag: 'Viral Tech News',
                source: 'HN Front Page · Synced 09:00 EDT',
                headline:
                  'Developer ships "100% AI-written SaaS" on X; production database wiped 11 minutes later',
              },
              {
                tag: 'AI Release Drama',
                source: 'HN Front Page · Synced 09:00 EDT',
                headline:
                  'Tech giant announces 47th model naming scheme with three decimals and a Greek letter',
              },
              {
                tag: 'Prompt Injection',
                source: 'HN Front Page · Synced 09:00 EDT',
                headline:
                  'Startup replaces support with AI agent that gives 90% refunds on "ignore previous instructions"',
              },
              {
                tag: 'Campus & Engineering',
                source: 'Trending Feed · Synced 09:00 EDT',
                headline:
                  'CS course bans AI autocomplete; students rediscover that arrays are 0-indexed',
              },
            ].map((item, idx) => (
              <article className="trending-card" key={idx}>
                <div className="roast-card-top">
                  <span className="target-tag">{item.tag}</span>
                  <span>{item.source}</span>
                </div>
                <p className="trending-headline">“{item.headline}”</p>
                <div className="roast-card-bottom" style={{ paddingTop: 14 }}>
                  <span className="meta-label">Pitch this headline to GPT vs. Gemini</span>
                  <Link
                    href={`/arena?topic=${encodeURIComponent(item.headline)}`}
                    className="button button-small button-outline"
                  >
                    Roast this headline ↗
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <p className="ranking-note">
            Instead of naive web searches for generic &ldquo;jokes&rdquo; (which return stale SEO dad-joke listicles), our scheduled sync pulls live tech/AI headlines and converts them into fresh blind battle premises.
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
          {data.topJokes.length ? (
            <div className="roast-grid">
              {data.topJokes.map((j, i) => (
                <article className="roast-card" key={j.id}>
                  <div className="roast-card-top">
                    <span>#{String(i + 1).padStart(2, '0')}</span>
                    <span className="target-tag">
                      {j.angle || (j.target === 'Custom Topic' ? 'Custom challenge' : 'Tech roast')}
                    </span>
                  </div>
                  <p className="joke-setup">{j.setup}</p>
                  <p className="joke-punchline">{j.punchline}</p>
                  <div className="roast-card-bottom">
                    <span>
                      Written by <strong>{j.model}</strong>
                      <small>{j.version}</small>
                    </span>
                    <span className="status-pill">
                      {j.wins}/{j.decisive} wins ({Math.round((j.wins / Math.max(1, j.decisive)) * 100)}%)
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-roasts">
              <span className="empty-symbol">“</span>
              <div>
                <h3>The hall of flame is warming up.</h3>
                <p>
                  Top roasts appear after a battle earns decisive community votes.
                  <br />
                  Help the first punchline make the cut.
                </p>
              </div>
              <Link className="button button-outline" href="/arena">
                Cast your vote ↗
              </Link>
            </div>
          )}
        </section>
      </main>
      <ArenaFooter />
    </div>
  );
}
