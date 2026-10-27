import { NextResponse } from 'next/server';
import { getTrendingTopics } from '@/lib/arena/trending';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const live = searchParams.get('live') !== '0';
  const result = await getTrendingTopics(live);
  return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
}
