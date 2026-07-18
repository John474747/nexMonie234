import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  'https://eqyoyrswqjqvsozttfxr.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxeW95cnN3cWpxdnNvenR0ZnhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwODY1NTcsImV4cCI6MjA5ODY2MjU1N30.kN-gkXz0Jteu00YmJ37W9T22K_FkwSqnhNvosQCvtic';

/**
 * Browser Supabase client.
 *
 * Deliberately uses the default localStorage storage — NOT a cookie adapter.
 * The Supabase session JSON can be 3–4 KB, which silently exceeds the browser
 * per-cookie limit (~4 KB) and causes writes to be dropped, breaking auth.
 *
 * Two lightweight indicator cookies are synced separately in useUser via
 * onAuthStateChange so that Next.js middleware and API route handlers can
 * inspect the session server-side without hitting the size limit:
 *   nex-auth  → "1" when authenticated, empty on sign-out  (middleware check)
 *   nex-token → JWT access token only                       (API route verify)
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
  },
});
