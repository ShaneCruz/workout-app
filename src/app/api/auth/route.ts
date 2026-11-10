import { NextRequest, NextResponse } from 'next/server';
import { verifyPin, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const { pin } = await request.json();

  if (!pin) {
    return NextResponse.json({ error: 'PIN required' }, { status: 400 });
  }

  const valid = await verifyPin(pin);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
  }

  await setAuthCookie();
  return NextResponse.json({ success: true });
}
