'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { TopJoke } from '@/lib/arena/types';

export function HallOfFlame({ jokes }: { jokes: TopJoke[] }) {
  const [modelFilter, setModelFilter] = useState<'ALL' | 'Gemini' | 'GPT'>('ALL');
  const [angleFilter, setAngleFilter] = useState<string>('ALL');

  const angles = useMemo(() => {
    const counts = new Map<string, number>();
    for (const j of jokes) {
      const a = j.angle || (j.target === 'Custom Topic' ? 'Custom challenge' : 'Tech roast');
      counts.set(a, (counts.get(a) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name]) => name);
  }, [jokes]);

  const filtered = useMemo(() => {
    return jokes.filter((j) => {
      if (modelFilter !== 'ALL' && j.model !== modelFilter) return false;
      const a = j.angle || (j.target === 'Custom Topic' ? 'Custom challenge' : 'Tech roast');
      if (angleFilter !== 'ALL' && a !== angleFilter) return false;
      return true;
    });
  }, [jokes, modelFilter, angleFilter]);

  if (!jokes.length) {
    return (
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
    );
  }

  return (
    <>
      <div className="premise-badges" style={{ marginBottom: 18 }}>
        {(['ALL', 'Gemini', 'GPT'] as const).map((m) => (
          <button
            key={m}
            type="button"
            className={`topic-chip ${modelFilter === m ? 'chip-active' : ''}`}
            onClick={() => setModelFilter(m)}
          >
            {m === 'ALL' ? `All Winners (${jokes.length})` : `${m} Winners`}
          </button>
        ))}
        {angles.length > 1 && (
          <>
            <span className="meta-label" style={{ margin: '0 4px' }}>
              ·
            </span>
            <button
              type="button"
              className={`topic-chip ${angleFilter === 'ALL' ? 'chip-active' : ''}`}
              onClick={() => setAngleFilter('ALL')}
            >
              All Angles
            </button>
            {angles.map((a) => (
              <button
                key={a}
                type="button"
                className={`topic-chip ${angleFilter === a ? 'chip-active' : ''}`}
                onClick={() => setAngleFilter(a)}
              >
                {a}
              </button>
            ))}
          </>
        )}
      </div>

      {filtered.length ? (
        <div className="roast-grid">
          {filtered.map((j, i) => (
            <article className="roast-card" key={j.id}>
              <div className="roast-card-top">
                <span>#{String(i + 1).padStart(2, '0')}</span>
                <div className="premise-badges">
                  {j.flavor && <span className="status-pill">{j.flavor}</span>}
                  <span className="target-tag">
                    {j.angle || (j.target === 'Custom Topic' ? 'Custom challenge' : 'Tech roast')}
                  </span>
                </div>
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
        <p className="notice">No winning jokes match that filter yet — try another filter or judge a battle!</p>
      )}
    </>
  );
}
