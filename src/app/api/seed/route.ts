import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { seedDatabase } from '@/lib/db/seed';

export async function POST() {
  const supabase = createServerClient();
  const result = await seedDatabase(supabase);
  return NextResponse.json(result);
}
