import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const COOKIE_NAME = 'workout_pin';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export async function verifyPin(pin: string): Promise<boolean> {
  const hash = process.env.APP_PIN_HASH!;
  return bcrypt.compare(pin, hash);
}

export async function setAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === 'authenticated';
}

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}
