import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getExercisePRs } from '@/lib/personal-records';

export async function GET(request: NextRequest) {
  const exerciseId = request.nextUrl.searchParams.get('exerciseId');
  if (!exerciseId) {
    return NextResponse.json({ error: 'exerciseId required' }, { status: 400 });
  }

  const supabase = createServerClient();
  const prs = await getExercisePRs(supabase, exerciseId);
  return NextResponse.json(prs);
}
