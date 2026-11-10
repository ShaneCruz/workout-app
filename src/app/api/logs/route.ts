import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { logSet, getLastSessionLogs } from '@/lib/db/logs';
import { checkAndUpdatePR } from '@/lib/personal-records';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const supabase = createServerClient();

  const log = await logSet(supabase, body);

  // Check for PR if this is a strength exercise with weight
  let pr = null;
  if (body.weight && body.reps) {
    pr = await checkAndUpdatePR(
      supabase,
      body.exercise_id,
      body.session_id,
      body.weight,
      body.reps
    );
  }

  return NextResponse.json({ log, pr });
}

export async function GET(request: NextRequest) {
  const exerciseId = request.nextUrl.searchParams.get('exerciseId');
  const sessionId = request.nextUrl.searchParams.get('sessionId');

  if (!exerciseId || !sessionId) {
    return NextResponse.json({ error: 'exerciseId and sessionId required' }, { status: 400 });
  }

  const supabase = createServerClient();
  const logs = await getLastSessionLogs(supabase, exerciseId, sessionId);
  return NextResponse.json(logs);
}
