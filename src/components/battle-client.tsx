'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import type { Battle, Quota } from '@/lib/arena/types';
import type { TrendingTopic } from '@/lib/arena/trending';

type Props = {
  signedIn: boolean;
  configured: boolean;
  initialQuota: Quota | null;
  initialBattle: Battle | null;
  initialTopic?: string;
  initialIsTrending?: boolean;
  initialTrending: TrendingTopic[];
  initialTrendSource: string;
  available: boolean;
};

async function api(path: string, body?: unknown) {
  const response = await fetch(
    path,
    body
      ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      : { cache: 'no-store' }
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? 'Please try again.');
  return data;
}

export function BattleClient({
  signedIn,
  configured,
  initialQuota,
  initialBattle,
  initialTopic,
  initialIsTrending,
  initialTrending,
  initialTrendSource,
  available,
}: Props) {
  const [battle, setBattle] = useState<Battle | null>(initialBattle);
  const [quota, setQuota] = useState<Quota | null>(initialQuota);
  const [busy, setBusy] = useState(false);
  const [syncingTrends, setSyncingTrends] = useState(false);
  const [trending, setTrending] = useState<TrendingTopic[]>(initialTrending);
  const [trendSourceLabel, setTrendSourceLabel] = useState(initialTrendSource);
  const [error, setError] = useState('');
  const [customTopic, setCustomTopic] = useState(initialTopic && !signedIn ? initialTopic : '');
  const [skippedIds, setSkippedIds] = useState<string[]>([]);
  const autoStarted = useRef(false);
  const topicTriggered = useRef(false);

  useEffect(() => {
    setBattle(initialBattle);
  }, [initialBattle]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (signedIn && available) {
        api('/api/arena/quota')
          .then((data) => setQuota(data.quota))
          .catch(() => {});
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [signedIn, available]);

  function redirectGuestToSignIn(nextPath: string) {
    window.location.href = `/auth/signin?next=${encodeURIComponent(nextPath)}`;
  }

  const nextBattle = useCallback(
    async (opts?: {
      skipCurrent?: boolean;
      forceNew?: boolean;
      customTopic?: string;
      isTrending?: boolean;
    }) => {
      if (!signedIn) {
        const dest = opts?.customTopic
          ? `/arena?topic=${encodeURIComponent(opts.customTopic)}${opts?.isTrending ? '&trending=1' : ''}`
          : '/arena';
        redirectGuestToSignIn(dest);
        return;
      }
      if (!available) return;
      setBusy(true);
      setError('');
      const nextSkips =
        opts?.skipCurrent && battle?.id ? Array.from(new Set([...skippedIds, battle.id])) : skippedIds;
      if (opts?.skipCurrent && battle?.id) {
        setSkippedIds(nextSkips);
      }
      const requestId = crypto.randomUUID();
      try {
        const data = await api('/api/arena/generate', {
          requestId,
          skipIds: nextSkips,
          forceNew: Boolean(opts?.forceNew),
          customTopic: opts?.customTopic?.trim() || undefined,
          isTrending: Boolean(opts?.isTrending),
        });
        setBattle(data.battle);
        if (data.quota) setQuota(data.quota);
        if (opts?.customTopic && !opts?.isTrending) setCustomTopic('');
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setBusy(false);
      }
    },
    [signedIn, available, battle, skippedIds]
  );

  useEffect(() => {
    if (signedIn && available && initialTopic && !topicTriggered.current) {
      topicTriggered.current = true;
      nextBattle({
        skipCurrent: true,
        forceNew: true,
        customTopic: initialTopic,
        isTrending: Boolean(initialIsTrending),
      });
      return;
    }
    if (signedIn && available && !initialBattle && !autoStarted.current) {
      autoStarted.current = true;
      nextBattle();
    }
  }, [signedIn, available, initialBattle, initialTopic, initialIsTrending, nextBattle]);

  async function vote(choice: 'left' | 'right' | 'tie' | 'bad') {
    if (!battle) return;
    if (!signedIn) {
      redirectGuestToSignIn(`/arena?id=${battle.id}`);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const data = await api('/api/arena/vote', { id: battle.id, choice });
      setBattle(data.battle);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function handleCustomSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customTopic.trim() || busy) return;
    if (!signedIn) {
      redirectGuestToSignIn(`/arena?topic=${encodeURIComponent(customTopic.trim())}`);
      return;
    }
    nextBattle({ skipCurrent: true, forceNew: true, customTopic: customTopic.trim() });
  }

  async function syncLiveHeadlines() {
    setSyncingTrends(true);
    try {
      const res = await fetch('/api/arena/trending?live=1', { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data.topics) && data.topics.length > 0) {
        setTrending(data.topics);
        setTrendSourceLabel(
          data.source === 'hackernews_live'
            ? `Live Hacker News Sync (${data.syncedAt})`
            : 'Daily Trending Tech Pool'
        );
      }
    } catch {
      // keep existing topics
    } finally {
      setSyncingTrends(false);
    }
  }

  const ready = battle?.status === 'ready' && battle.left && battle.right;
  const signInHref = `/auth/signin?next=${encodeURIComponent(
    battle?.id ? `/arena?id=${battle.id}` : initialTopic ? `/arena?topic=${encodeURIComponent(initialTopic)}` : '/arena'
  )}`;

  return (
    <div className="arena-stage">
      {!signedIn && (
        <div className="arena-statusbar" style={{ marginBottom: 14 }}>
          <div className="status-left">
            <span className="live-dot" />
            <span>
              GUEST PREVIEW MODE · READ REAL BLIND MATCHUPS BELOW — SIGN IN WITH GOOGLE WHEN READY TO VOTE OR GENERATE
            </span>
          </div>
          <a className="button button-small" href={signInHref}>
            Sign in to vote ↗
          </a>
        </div>
      )}

      <div className="challenge-panel">
        <form className="custom-topic-bar" onSubmit={handleCustomSubmit}>
          <span className="custom-topic-label">CUSTOM CHALLENGE</span>
          <input
            type="text"
            className="custom-topic-input"
            placeholder="Optional: type your own comedy prompt for GPT & Gemini (e.g., 'Columbia finals week at 4 AM')…"
            maxLength={240}
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            disabled={busy}
          />
          {signedIn && quota && (
            <span className="meta-label" title="Hourly custom generation quota">
              {quota.remaining}/5 left
            </span>
          )}
          <button
            type="submit"
            className="button button-small"
            disabled={
              busy ||
              !customTopic.trim() ||
              (signedIn && (!configured || (quota !== null && quota.remaining <= 0)))
            }
          >
            {signedIn ? 'Generate roast ↗' : 'Sign in & roast ↗'}
          </button>
        </form>

        <div className="trending-bar" aria-label="Trending Headlines Pool">
          <div className="trending-bar-header">
            <span className="custom-topic-label">
              <span className="live-dot" /> TRENDING TODAY · 1-CLICK HEADLINE ROAST
            </span>
            <div className="premise-badges">
              <span className="meta-label">{trendSourceLabel}</span>
              <button
                type="button"
                className="topic-chip"
                disabled={syncingTrends || busy}
                onClick={syncLiveHeadlines}
              >
                {syncingTrends ? 'Syncing HN…' : '↻ Sync live headlines'}
              </button>
            </div>
          </div>
          <div className="trending-chips">
            {trending.map((t) => (
              <button
                key={t.id}
                type="button"
                className="trending-chip"
                disabled={busy}
                onClick={() =>
                  nextBattle({
                    skipCurrent: true,
                    forceNew: true,
                    customTopic: t.headline,
                    isTrending: true,
                  })
                }
              >
                <span className="trending-chip-tag">{t.tag}</span>
                <span className="trending-chip-text">{t.headline}</span>
                <span className="trending-chip-arrow">{signedIn ? 'Roast ↗' : 'Sign in & roast ↗'}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}

      {busy && (!ready || battle?.choice) ? (
        <div className="battle-empty" role="status">
          <span className="spinner" />
          <h2>Setting up the next blind roast…</h2>
          <p>
            {customTopic
              ? `GPT and Gemini are both writing a joke on "${customTopic}"…`
              : 'Selecting a Prompt Chain from the live mix and loading an anonymous GPT vs. Gemini matchup.'}
          </p>
        </div>
      ) : ready ? (
        <>
          <div className="battle-heading">
            <span className="target-tag">{battle.angle || 'Tech comedy'}</span>
            {battle.context && <span className="scenario-text">“{battle.context}”</span>}
            <div className="premise-badges" style={{ marginLeft: 'auto' }}>
              {battle.choice && battle.flavor && (
                <span className="status-pill">Chain: {battle.flavor}</span>
              )}
              {(battle.source || battle.guestPreview) && (
                <span className="status-pill">
                  {battle.guestPreview
                    ? 'Community blind preview'
                    : battle.angle === 'Trending news roast'
                      ? 'Trending headline'
                      : battle.source === 'custom'
                        ? 'Custom topic'
                        : battle.source === 'fresh'
                          ? 'Freshly generated'
                          : 'Community pool'}
                </span>
              )}
            </div>
          </div>

          <div className="battle-pair">
            {(['left', 'right'] as const).map((side, i) => {
              const joke = battle[side]!;
              const revealed = Boolean(battle.choice);
              const isWinner = battle.choice === side;
              const deltaNum = typeof joke.delta === 'number' ? Math.round(joke.delta) : null;
              const deltaText =
                deltaNum !== null
                  ? deltaNum > 0
                    ? `+${deltaNum}`
                    : deltaNum < 0
                      ? `${deltaNum}`
                      : '±0'
                  : null;
              const deltaClass =
                deltaNum === null || deltaNum === 0
                  ? 'delta-neutral'
                  : deltaNum > 0
                    ? 'delta-pos'
                    : 'delta-neg';

              return (
                <article key={side} className={`battle-card ${isWinner ? 'card-winner' : ''}`}>
                  <div className="roast-card-top">
                    <span className="model-label">
                      {revealed ? `${joke.model} (${i === 0 ? 'A' : 'B'})` : `COMEDIAN ${i === 0 ? 'A' : 'B'}`}
                    </span>
                    {revealed && isWinner && <span className="status-pill pill-superadmin">Winner ★</span>}
                    {revealed && !isWinner && battle.choice === 'tie' && (
                      <span className="status-pill">Tie</span>
                    )}
                    {revealed && !isWinner && battle.choice === 'bad' && (
                      <span className="status-pill">Missed</span>
                    )}
                  </div>
                  <p className="joke-setup">{joke.setup}</p>
                  <p className="joke-punchline">{joke.punchline}</p>
                  {revealed ? (
                    <div className="reveal">
                      <div>
                        <strong>{joke.model}</strong> · {Math.round(joke.rating ?? 1000)} Elo
                        {deltaText && (
                          <span className={`elo-delta ${deltaClass}`}> ({deltaText})</span>
                        )}
                      </div>
                      <small>
                        {joke.version}
                        {joke.latencyMs ? ` · ${(joke.latencyMs / 1000).toFixed(2)}s` : ''}
                        {joke.flavor ? ` · ${joke.flavor}` : ''}
                      </small>
                      {(joke.clicheToAvoid || joke.comicTwist) && (
                        <div className="micro-cot-box">
                          {joke.clicheToAvoid && (
                            <div>
                              <span>Avoided cliché:</span> “{joke.clicheToAvoid}”
                            </div>
                          )}
                          {joke.comicTwist && (
                            <div>
                              <span>Planned twist:</span> “{joke.comicTwist}”
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button className="button" disabled={busy} onClick={() => vote(side)}>
                      {signedIn ? `${i === 0 ? 'A' : 'B'} is funnier` : `Sign in to vote ${i === 0 ? 'A' : 'B'} ↗`}
                    </button>
                  )}
                </article>
              );
            })}
          </div>

          {battle.choice ? (
            <div className="post-vote-bar">
              <p className="success-message" role="status">
                {battle.choice === 'left'
                  ? `Vote recorded — Comedian A (${battle.left?.model}) won! Elo ratings updated.`
                  : battle.choice === 'right'
                    ? `Vote recorded — Comedian B (${battle.right?.model}) won! Elo ratings updated.`
                    : battle.choice === 'tie'
                      ? 'Vote recorded (Tie). Elo ratings updated!'
                      : 'Vote recorded (Both missed — no Elo points awarded).'}
              </p>
              <div className="post-vote-actions">
                <button className="button" disabled={busy} onClick={() => nextBattle({ skipCurrent: true })}>
                  Next battle →
                </button>
              </div>
            </div>
          ) : (
            <div className="secondary-votes">
              <button disabled={busy} onClick={() => vote('tie')}>
                {signedIn ? 'It’s a tie' : 'Sign in · Tie'}
              </button>
              <button disabled={busy} onClick={() => vote('bad')}>
                {signedIn ? 'Both missed' : 'Sign in · Both missed'}
              </button>
              <button disabled={busy} onClick={() => nextBattle({ skipCurrent: true })}>
                {signedIn ? 'Skip →' : 'Sign in for more →'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="battle-empty">
          <span className="versus">A / B</span>
          <h2>{!signedIn ? 'Good taste deserves a vote.' : 'Ready for the next matchup?'}</h2>
          <p>
            {!signedIn
              ? 'Sign in with Google to judge blind AI roasts and automatically trigger new GPT vs Gemini matchups.'
              : 'Click below to get a blind matchup between GPT and Gemini.'}
          </p>
          {!signedIn ? (
            <Link className="button" href={signInHref}>
              Sign in with Google ↗
            </Link>
          ) : (
            <button className="button" onClick={() => nextBattle()} disabled={busy || !available}>
              Start battle →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
