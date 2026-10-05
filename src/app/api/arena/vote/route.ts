import {session,checkOrigin,failure,UUID} from '@/lib/arena/server';
export async function POST(request:Request) {
  try {
    checkOrigin(request);
    const {db}=await session();
    const raw=await request.text();if(raw.length>500) throw new Error('Request is too large.');
    const {id,choice}=JSON.parse(raw);
    if(!UUID.test(id??'')||!['left','right','tie','bad'].includes(choice)) throw new Error('Invalid vote.');
    const {data,error}=await db.rpc('arena_vote',{p_battle:id,p_choice:choice});
    if(error) throw new Error(error.message);
    return Response.json({battle:data},{headers:{'Cache-Control':'no-store'}});
  }catch(error){return failure(error);}
}
