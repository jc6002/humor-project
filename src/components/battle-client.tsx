'use client';
import {useState,useEffect,useCallback} from 'react';
import Link from 'next/link';
import {ANGLES,TARGETS,type Battle,type Quota} from '@/lib/arena/types';
type Props={signedIn:boolean;configured:boolean;initialQuota:Quota|null;initialBattle:Battle|null;available:boolean};
async function api(path:string,body?:unknown){
  const response=await fetch(path,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{cache:'no-store'});
  const data=await response.json();if(!response.ok) throw new Error(data.error??'Please try again.');return data;
}
export function BattleClient({signedIn,configured,initialQuota,initialBattle,available}:Props){
  const [battle,setBattle]=useState<Battle|null>(initialBattle);const [quota,setQuota]=useState(initialQuota);
  const [target,setTarget]=useState<string>(TARGETS[0]);const [angle,setAngle]=useState<string>(ANGLES[0]);const [context,setContext]=useState('');
  const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [generating,setGenerating]=useState(false);
  const [now,setNow]=useState(0);
  useEffect(()=>{const timer=setInterval(()=>{setNow(Date.now());if(signedIn&&available)api('/api/arena/quota').then(data=>setQuota(data.quota)).catch(()=>{});},15000);return ()=>clearInterval(timer)},[signedIn,available]);
  const load=useCallback(async(query='')=>{const data=await api('/api/arena/battle'+query);setBattle(data.battle);setQuota(data.quota);return data.battle as Battle|null;},[]);
  // Refreshing an in-flight request only checks its persisted status. It never generates again.
  useEffect(()=>{
    if(!signedIn||!available) return;
    const pending=sessionStorage.getItem('arena-pending');
    if(!pending) return;
    let stopped=false;let timer:ReturnType<typeof setTimeout>;let checks=0;
    async function recover(){
      if(++checks>50){sessionStorage.removeItem('arena-pending');return;}
      try{const result=await api('/api/arena/battle?request='+encodeURIComponent(pending!));
        if(stopped)return;
        if(result.battle){setBattle(result.battle);setQuota(result.quota);}
        if(!result.battle||result.battle.status==='generating'){timer=setTimeout(recover,4000);}
        else{sessionStorage.removeItem('arena-pending');}
      }catch{if(!stopped)timer=setTimeout(recover,8000);}
    }
    timer=setTimeout(recover,1000);
    return ()=>{stopped=true;clearTimeout(timer)};
  },[signedIn,available]);
  async function next(){setBusy(true);setError('');try{await load(battle?.id?'?skip='+battle.id:'')}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
  async function generate(){
    setBusy(true);setGenerating(true);setError('');const requestId=crypto.randomUUID();sessionStorage.setItem('arena-pending',requestId);
    try{const result=await api('/api/arena/generate',{requestId,target,angle,context});await load('?id='+result.id);sessionStorage.removeItem('arena-pending');}
    catch(e){setError((e as Error).message);try{const result=await api('/api/arena/battle?request='+requestId);setQuota(result.quota);if(result.battle)setBattle(result.battle);if(!result.battle||result.battle.status!=='generating')sessionStorage.removeItem('arena-pending');}catch{/* History remains the recovery path. */}}
    finally{setBusy(false);setGenerating(false)}
  }
  async function vote(choice:string){if(!battle)return;setBusy(true);setError('');try{const data=await api('/api/arena/vote',{id:battle.id,choice});setBattle(data.battle)}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
  const recovery=quota?.nextRecovery?new Date(quota.nextRecovery).getTime():null;
  const ready=battle?.status==='ready'&&battle.left&&battle.right;
  return <div className="arena-layout"><aside className="generator-panel"><h2>Make a matchup.</h2><div className="quota"><strong>{signedIn&&quota?quota.remaining:'5'}</strong><span> / 5 fresh battles per hour</span><small>{recovery?(now?`Next credit in ${Math.max(0,Math.ceil((recovery-now)/60000))} min`:'Credits recover on a rolling 60-minute window.'):'Each battle = two original AI jokes.'}</small></div><label htmlFor="target">WHO’S GETTING ROASTED?</label><select id="target" value={target} onChange={e=>setTarget(e.target.value)}>{TARGETS.map(t=><option key={t}>{t}</option>)}</select><label htmlFor="angle">PICK AN ANGLE</label><select id="angle" value={angle} onChange={e=>setAngle(e.target.value)}>{ANGLES.map(t=><option key={t}>{t}</option>)}</select><label htmlFor="context">SET THE SCENE <span>(OPTIONAL)</span></label><textarea id="context" maxLength={200} placeholder="An AI coding assistant breaks production on Friday…" value={context} onChange={e=>setContext(e.target.value)}/><p className="panel-note">{context.length}/200 · Keep it about AI models.</p>{signedIn?<button className="button" onClick={generate} disabled={busy||!configured||!available||quota?.remaining===0||quota?.attemptsRemaining===0||quota?.busy||battle?.status==='generating'}>{generating?'Writing punchlines…':'Generate a battle ↗'}</button>:<Link className="button" href="/auth/signin">Sign in to generate ↗</Link>}<p className="panel-note">One prompt. GPT vs Gemini. Identities stay hidden until you vote.</p>{!configured&&<p className="notice">New generations are not open yet. Existing community battles remain available.</p>}<p className="panel-note">Your 5-per-hour limit covers new generations only. Keep voting on existing battles at no extra AI cost.</p></aside>
    <section className="battle-area" aria-label="Blind battle"><div className="battle-toolbar"><span>BLIND BATTLE · HUMAN JUDGES ONLY</span><button onClick={next} disabled={!signedIn||busy||!available}>Find a community battle ↗</button></div>{error&&<p role="alert" className="error-message">{error}</p>}
    {generating||battle?.status==='generating'?<div className="battle-empty" role="status"><span className="spinner"/><h2>Two models. One fragile ego.</h2><p>Both models are writing. You’ll see their jokes together when they’re ready. Refreshing will not charge another generation.</p><button className="button button-outline" onClick={()=>load(battle?.id?'?id='+battle.id:'').catch(e=>setError(e.message))} disabled={busy}>Check progress</button><Link className="text-link" href="/my-battles">View generation history ↗</Link></div>:
    ready?<><div className="battle-heading"><span className="target-tag">Roasting {battle.target}</span><strong>{battle.angle}</strong></div>{battle.context&&<p className="panel-note">Scene: {battle.context}</p>}<div className="battle-pair">{(['left','right'] as const).map((side,i)=>{const joke=battle[side]!;return <article key={side} className="battle-card"><span className="model-label">{battle.choice?joke.model:`COMEDIAN ${i===0?'A':'B'}`}</span><p className="joke-setup">{joke.setup}</p><p className="joke-punchline">{joke.punchline}</p>{battle.choice?<div className="reveal">{joke.model} · {Math.round(joke.rating??1000)} Elo<small>{joke.version}</small></div>:<button className="button button-outline" disabled={busy} onClick={()=>vote(side)}>{i===0?'A':'B'} is funnier</button>}</article>})}</div>{battle.choice?<><p className="success-message" role="status">Vote saved. {battle.choice==='left'?'You picked A.':battle.choice==='right'?'You picked B.':battle.choice==='tie'?'You called a tie.':'Both missed the mark.'} The models’ Elo ratings have been updated.</p><button className="button" disabled={busy} onClick={next}>Next community battle ↗</button><details className="prompt-details"><summary>See the prompt both models received</summary><pre>{battle.prompt}</pre></details></>:<div className="secondary-votes"><button disabled={busy} onClick={()=>vote('tie')}>It’s a tie</button><button disabled={busy} onClick={()=>vote('bad')}>Both missed</button><button disabled={busy} onClick={next}>Skip →</button></div>}</>:
    <div className="battle-empty"><span className="versus">A / B</span><h2>{!signedIn?'Good taste deserves a vote.':battle?.status==='failed'?'That generation didn’t land.':battle?.status==='closed'?'This battle has wrapped up.':'Your next laugh starts here.'}</h2><p>{!signedIn?'Sign in with Google to generate AI roasts and judge anonymous battles.':battle?.status==='failed'?'Your successful-generation credit is restored. You can try again, subject to the hourly attempt limit.':'Generate a fresh matchup or find an existing community battle. You can judge more than five battles—the limit only applies to new generations.'}</p>{!signedIn?<Link className="button" href="/auth/signin">Sign in to vote ↗</Link>:<button className="button button-outline" onClick={next} disabled={busy||!available}>Browse community battles ↗</button>}{signedIn&&!battle&&<p className="panel-note">If no battles are available, start the first one or come back for new matchups.</p>}</div>}
    </section></div>
}
