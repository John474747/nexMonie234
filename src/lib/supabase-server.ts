import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  'https://eqyoyrswqjqvsozttfxr.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxeW95cnN3cWpxdnNvenR0ZnhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwODY1NTcsImV4cCI6MjA5ODY2MjU1N30.kN-gkXz0Jteu00YmJ37W9T22K_FkwSqnhNvosQCvtic';

/**
 * For API Route Handlers — reads the nex-token cookie (JWT only, set by
 * useUser on the client) and verifies it with Supabase. Returns the
 * authenticated user or null.
 */
export async function getRouteUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('nex-token')?.value;
    if (!token) return null;
    const client = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error } = await client.auth.getUser(token);
    return error ? null : user;
  } catch {
    return null;
  }
}

/**
 * For middleware (Edge runtime) — lightweight check that the nex-auth
 * indicator cookie is present. Full JWT verification happens per-route
 * via getRouteUser().
 */
export function hasValidSessionCookie(request: NextRequest): boolean {
  return request.cookies.get('nex-auth')?.value === '1';
}

/** Standard 401 response. */
export function unauthorized(): NextResponse {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
