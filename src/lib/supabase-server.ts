import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  'https://eqyoyrswqjqvsozttfxr.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxeW95cnN3cWpxdnNvenR0ZnhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwODY1NTcsImV4cCI6MjA5ODY2MjU1N30.kN-gkXz0Jteu00YmJ37W9T22K_FkwSqnhNvosQCvtic';

// Derive project ref from URL → "eqyoyrswqjqvsozttfxr"
const projectRef = supabaseUrl.match(/\/\/([^.]+)\./)?.[1] ?? '';
export const SESSION_COOKIE = `sb-${projectRef}-auth-token`;

function extractToken(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    return typeof parsed?.access_token === 'string' ? parsed.access_token : null;
  } catch {
    return null;
  }
}

/**
 * For API Route Handlers — reads the session cookie via next/headers and
 * returns the verified Supabase user, or null if the session is missing/invalid.
 */
export async function getRouteUser() {
  try {
    const cookieStore = await cookies();
    const token = extractToken(cookieStore.get(SESSION_COOKIE)?.value);
    if (!token) return null;
    const client = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error } = await client.auth.getUser(token);
    return error ? null : user;
  } catch {
    return null;
  }
}

/**
 * For middleware — reads directly from the NextRequest (next/headers is
 * unavailable in the Edge runtime). Returns true if a parseable token exists.
 * Full JWT verification happens per-route via getRouteUser().
 */
export function hasValidSessionCookie(request: NextRequest): boolean {
  const raw = request.cookies.get(SESSION_COOKIE)?.value;
  return extractToken(raw) !== null;
}

/** Standard 401 response. */
export function unauthorized(): NextResponse {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
