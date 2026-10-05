import {session,failure,UUID} from '@/lib/arena/server';
export async function GET(request:Request) {
  try {
    const {db}=await session();
    const params=new URL(request.url).searchParams;
    const id=params.get('id');const skip=params.get('skip');const requestId=params.get('request');
    if((id&&!UUID.test(id))||(skip&&!UUID.test(skip))||(requestId&&!UUID.test(requestId))) throw new Error('Invalid battle.');
    const {data,error}=requestId?await db.rpc('arena_request',{p_request:requestId}):await db.rpc('arena_battle',{p_id:id,p_skip:skip});
    if(error) throw new Error('The arena is unavailable. Please try again shortly.');
    const {data:quota}=await db.rpc('arena_quota');
    return Response.json({battle:data,quota},{headers:{'Cache-Control':'no-store'}});
  }catch(error){return failure(error);}
}
