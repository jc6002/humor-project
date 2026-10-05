import {adminClient,session,checkOrigin,failure,UUID} from '@/lib/arena/server';
import {buildPrompt,generateJoke,generationConfigured,providerFailure} from '@/lib/arena/providers';
import {TARGETS,ANGLES} from '@/lib/arena/types';
export const maxDuration=60;
export async function POST(request:Request) {
  try {
    checkOrigin(request);
    const {user}=await session();
    if(!generationConfigured()) throw new Error('Generation is not open yet. You can still vote on community battles.');
    const raw=await request.text();
    if(raw.length>2000) throw new Error('Request is too large.');
    const body=JSON.parse(raw);
    if(!UUID.test(body.requestId??'')||!TARGETS.includes(body.target)||!ANGLES.includes(body.angle)||typeof body.context!=='string'||body.context.length>200) throw new Error('Choose an AI target and angle, with up to 200 characters of context.');
    const db=adminClient();
    const prompt=buildPrompt(body.target,body.angle,body.context);
    const {data:reservation,error}=await db.rpc('arena_reserve',{p_user:user.id,p_request:body.requestId,p_target:body.target,p_angle:body.angle,p_context:body.context,p_prompt:prompt});
    if(error) throw new Error(error.message);
    if(reservation.existing) return Response.json({id:reservation.id,status:reservation.status});
    const outcomes=await Promise.allSettled([generateJoke('openai',prompt),generateJoke('gemini',prompt)]);
    const failures=outcomes.flatMap((result,i)=>result.status==='rejected'?[providerFailure(result.reason,i===0?'openai':'gemini')]:[]);
    const failed=failures.length>0;
    const outputs=outcomes.flatMap(result=>result.status==='fulfilled'?[result.value]:[]);
    if(failed) console.error('arena_generation_failed',{battleId:reservation.id,codes:failures.map(f=>f.code)});
    const {error:saveError}=await db.rpc('arena_finish',{p_battle:reservation.id,p_outputs:outputs,p_error:failed?failures.map(f=>f.code).join(','):null});
    if(saveError) throw new Error('The result could not be saved. Check your history before retrying.');
    if(failed) throw new Error(`${failures.map(f=>f.message).join(' ')} No successful-generation credit was used. Please try again later or vote on existing battles. Reference: ${reservation.id.slice(0,8)}.`);
    return Response.json({id:reservation.id,status:'ready'});
  } catch(error) {return failure(error);}
}
