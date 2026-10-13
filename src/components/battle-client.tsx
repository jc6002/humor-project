'use client';
import {useState,useEffect,useCallback} from 'react';
import Link from 'next/link';
import type {Battle,Quota} from '@/lib/arena/types';

type Props={
  signedIn:boolean;
  configured:boolean;
  initialQuota:Quota|null;
  initialBattle:Battle|null;
  available:boolean;
};

async function api(path:string,body?:unknown){
  const response=await fetch(
    path,
    body
      ? {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}
      : {cache:'no-store'}
  );
  const data=await response.json();
  if(!response.ok) throw new Error(data.error??'Please try again.');
  return data;
}

export function BattleClient({signedIn,configured,initialQuota,initialBattle,available}:Props){
  const [battle,setBattle]=useState<Battle|null>(initialBattle);
  const [quota,setQuota]=useState<Quota|null>(initialQuota);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [skippedIds,setSkippedIds]=useState<string[]>([]);
  const [now,setNow]=useState(()=>Date.now());

  useEffect(()=>{
    const timer=setInterval(()=>{
      setNow(Date.now());
      if(signedIn&&available){
        api('/api/arena/quota').then(data=>setQuota(data.quota)).catch(()=>{});
      }
    },15000);
    return ()=>clearInterval(timer);
  },[signedIn,available]);

  const nextBattle=useCallback(async(opts?:{skipCurrent?:boolean;forceNew?:boolean})=>{
    if(!signedIn||!available) return;
    setBusy(true);
    setError('');
    const nextSkips = opts?.skipCurrent && battle?.id
      ? Array.from(new Set([...skippedIds, battle.id]))
      : skippedIds;
    if(opts?.skipCurrent && battle?.id) {
      setSkippedIds(nextSkips);
    }
    const requestId=crypto.randomUUID();
    try {
      const data=await api('/api/arena/generate',{
        requestId,
        skipIds:nextSkips,
        forceNew:Boolean(opts?.forceNew),
      });
      setBattle(data.battle);
      if(data.quota) setQuota(data.quota);
    } catch(e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  },[signedIn,available,battle,skippedIds]);

  async function vote(choice:'left'|'right'|'tie'|'bad'){
    if(!battle) return;
    setBusy(true);
    setError('');
    try {
      const data=await api('/api/arena/vote',{id:battle.id,choice});
      setBattle(data.battle);
    } catch(e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const recovery=quota?.nextRecovery?new Date(quota.nextRecovery).getTime():null;
  const ready=battle?.status==='ready'&&battle.left&&battle.right;

  return (
    <div className="arena-stage">
      <div className="arena-statusbar">
        <div className="status-left">
          <span className="live-dot"/>
          <span>BLIND MATCHMAKER · AUTO-MIXING COMMUNITY &amp; FRESH AI ROASTS</span>
        </div>
        {signedIn && quota && (
          <div className="status-quota">
            <strong>{quota.remaining} / 5</strong>
            <span>fresh generation credits/hr</span>
            {recovery && recovery > now && (
              <small>· +1 in {Math.max(1,Math.ceil((recovery-now)/60000))}m</small>
            )}
            {!configured && <small>· generation paused</small>}
          </div>
        )}
      </div>

      {error && <p role="alert" className="error-message">{error}</p>}

      {busy && (!ready || battle?.choice) ? (
        <div className="battle-empty" role="status">
          <span className="spinner"/>
          <h2>Setting up the next blind roast…</h2>
          <p>Picking a random AI scenario or pulling an open community matchup needing your decisive vote.</p>
        </div>
      ) : ready ? (
        <>
          <div className="battle-heading">
            <span className="target-tag">Roasting {battle.target}</span>
            <strong>{battle.angle}</strong>
            {battle.source && (
              <span className="status-pill">
                {battle.source === 'fresh' ? 'Freshly generated' : 'Community matchup'}
              </span>
            )}
          </div>
          {battle.context && <p className="panel-note">Premise: {battle.context}</p>}

          <div className="battle-pair">
            {(['left','right'] as const).map((side,i)=>{
              const joke=battle[side]!;
              const revealed=Boolean(battle.choice);
              const isWinner=battle.choice===side;
              const brandClass=revealed?(joke.model==='GPT'?'card-gpt':'card-gemini'):'';
              const deltaNum=typeof joke.delta==='number'?Math.round(joke.delta):null;
              const deltaText=deltaNum!==null?(deltaNum>=0?`+${deltaNum}`:`${deltaNum}`):null;

              return (
                <article key={side} className={`battle-card ${brandClass} ${isWinner?'card-winner':''}`}>
                  <div className="roast-card-top">
                    <span className="model-label">
                      {revealed ? `${joke.model} (${i===0?'A':'B'})` : `COMEDIAN ${i===0?'A':'B'}`}
                    </span>
                    {revealed && isWinner && <span className="status-pill">Your pick ★</span>}
                  </div>
                  <p className="joke-setup">{joke.setup}</p>
                  <p className="joke-punchline">{joke.punchline}</p>
                  {revealed ? (
                    <div className="reveal">
                      <div>
                        <strong>{joke.model}</strong> · {Math.round(joke.rating??1000)} Elo
                        {deltaText && (
                          <span className={`elo-delta ${deltaNum!>=0?'delta-pos':'delta-neg'}`}>
                            {' '}({deltaText})
                          </span>
                        )}
                      </div>
                      <small>{joke.version}</small>
                    </div>
                  ) : (
                    <button
                      className="button button-outline"
                      disabled={busy}
                      onClick={()=>vote(side)}
                    >
                      {i===0?'A':'B'} is funnier
                    </button>
                  )}
                </article>
              );
            })}
          </div>

          {battle.choice ? (
            <div className="post-vote-bar">
              <p className="success-message" role="status">
                Vote recorded ({battle.choice==='left'?'Comedian A won':battle.choice==='right'?'Comedian B won':battle.choice==='tie'?'Tie':'Both missed'}). Elo ratings updated!
              </p>
              <div className="post-vote-actions">
                <button className="button" disabled={busy} onClick={()=>nextBattle({skipCurrent:true})}>
                  Next battle →
                </button>
              </div>
              {battle.prompt && (
                <details className="prompt-details">
                  <summary>View scenario &amp; prompt</summary>
                  <pre>{battle.prompt}</pre>
                </details>
              )}
            </div>
          ) : (
            <div className="secondary-votes">
              <button disabled={busy} onClick={()=>vote('tie')}>It’s a tie</button>
              <button disabled={busy} onClick={()=>vote('bad')}>Both missed</button>
              <button disabled={busy} onClick={()=>nextBattle({skipCurrent:true})}>Skip →</button>
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
              : 'Click below to get a blind matchup—automatically mixing community battles that need another vote with fresh random AI roasts.'}
          </p>
          {!signedIn ? (
            <Link className="button" href="/auth/signin">Sign in with Google ↗</Link>
          ) : (
            <button className="button" onClick={()=>nextBattle()} disabled={busy||!available}>
              Start battle →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
