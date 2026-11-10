import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createSession, getRecentSessions, getSessionWithLogs } from '@/lib/db/sessions';

export async function POST(request: NextRequest) {
  const { planId } = await request.json();
  if (!planId) {
    return NextResponse.json({ error: 'planId required' }, { status: 400 });
  }

  const supabase = createServerClient();
  const session = await createSession(supabase, planId);
  return NextResponse.json(session);
}

export async function GET(request: NextRequest) {
  const supabase = createServerClient();
  const sessionId = request.nextUrl.searchParams.get('id');

  if (sessionId) {
    const session = await getSessionWithLogs(supabase, sessionId);
    return NextResponse.json(session);
  }

  const limit = parseInt(request.nextUrl.searchParams.get('limit') ?? '10');
  const sessions = await getRecentSessions(supabase, limit);
  return NextResponse.json(sessions);
}
