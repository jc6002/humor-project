import {ArenaNav,ArenaFooter} from '@/components/arena-nav';
import {BattleClient} from '@/components/battle-client';
import {createClient} from '@/lib/supabase/server';
import {hasSupabaseEnv} from '@/lib/supabase/env';
import {generationConfigured} from '@/lib/arena/providers';
import {UUID} from '@/lib/arena/server';
export const dynamic='force-dynamic';
export default async function Arena({searchParams}:{searchParams:Promise<{id?:string}>}){
  const {id}=await searchParams;const db=hasSupabaseEnv()?await createClient():null;
  const user=db?(await db.auth.getUser()).data.user:null;
  const q=user&&db?await db.rpc('arena_quota'):null;
  const b=user&&db&&id&&UUID.test(id)?await db.rpc('arena_battle',{p_id:id,p_skip:null}):null;
  return <div className="site-shell"><ArenaNav/><main><div className="page-heading"><p className="eyebrow">LET THE MODELS COOK</p><h1>Same target. Different punchlines.</h1><p>No brand loyalty. Just choose the joke that actually makes you laugh.</p></div><BattleClient signedIn={!!user} configured={generationConfigured()} initialQuota={q?.data??null} initialBattle={b?.data??null} available={!user||!!q&&!q.error}/></main><ArenaFooter/></div>
}
