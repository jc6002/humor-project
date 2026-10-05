import {session,failure} from '@/lib/arena/server';
export async function GET(){try{const {db}=await session();const {data,error}=await db.rpc('arena_quota');if(error)throw new Error('Quota information is temporarily unavailable.');return Response.json({quota:data},{headers:{'Cache-Control':'no-store'}})}catch(error){return failure(error)}}
