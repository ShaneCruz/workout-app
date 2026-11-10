import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getPlanByDay } from '@/lib/db/plans';

export async function GET(request: NextRequest) {
  const day = request.nextUrl.searchParams.get('day');
  if (day === null) {
    return NextResponse.json({ error: 'day parameter required' }, { status: 400 });
  }

  const supabase = createServerClient();
  const plan = await getPlanByDay(supabase, parseInt(day));

  if (!plan) {
    return NextResponse.json({ error: 'No plan found for this day' }, { status: 404 });
  }

  return NextResponse.json(plan);
}
