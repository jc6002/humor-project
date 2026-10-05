import {adminClient,session,checkOrigin,failure,UUID} from '@/lib/arena/server';
import {buildPrompt,generateJoke,generationConfigured} from '@/lib/arena/providers';
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
    const failed=outcomes.some(result=>result.status==='rejected');
    const outputs=outcomes.flatMap(result=>result.status==='fulfilled'?[result.value]:[]);
    const {error:saveError}=await db.rpc('arena_finish',{p_battle:reservation.id,p_outputs:outputs,p_error:failed?'provider_failed':null});
    if(saveError) throw new Error('The result could not be saved. Check your history before retrying.');
    if(failed) throw new Error('One of the models could not finish. Your successful-generation credit was restored; this attempt still counts toward the safety limit.');
    return Response.json({id:reservation.id,status:'ready'});
  } catch(error) {return failure(error);}
}
