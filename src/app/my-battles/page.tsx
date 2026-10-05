import Link from 'next/link';
import {redirect} from 'next/navigation';
import {ArenaNav,ArenaFooter} from '@/components/arena-nav';
import {createClient} from '@/lib/supabase/server';
export const dynamic='force-dynamic';
type Row={id:string;target:string;angle:string;status:string;created_at:string;voted:boolean};
export default async function History(){const db=await createClient();const {data:{user}}=await db.auth.getUser();if(!user)redirect('/auth/signin');const {data,error}=await db.rpc('arena_history');
  return <div className="site-shell"><ArenaNav/><main><div className="page-heading"><p className="eyebrow">YOUR COMEDY EXPERIMENTS</p><h1>My battles.</h1><p>Five fresh matchups per rolling hour. Every punchline has a paper trail.</p></div><div className="history-list">{error?<p className="notice">Your battle history is not available yet.</p>:data?.length?data.map((b:Row)=><article className="history-item" key={b.id}><div><strong>Roasting {b.target}</strong><p>{b.angle} · {new Date(b.created_at).toISOString().slice(0,16).replace('T',' ')} UTC</p><span className="status-pill">{b.voted?'Voted':b.status}</span></div><Link className="button button-outline" href={'/arena?id='+b.id}>{b.voted?'View result':b.status==='ready'?'Cast your vote':'View status'} ↗</Link></article>):<div className="battle-empty"><h2>Your first roast is waiting.</h2><p>Create a matchup and let two models take their best shot.</p><Link className="button" href="/arena">Enter the arena ↗</Link></div>}</div></main><ArenaFooter/></div>
}
