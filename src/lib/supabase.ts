import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  'https://eqyoyrswqjqvsozttfxr.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxeW95cnN3cWpxdnNvenR0ZnhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwODY1NTcsImV4cCI6MjA5ODY2MjU1N30.kN-gkXz0Jteu00YmJ37W9T22K_FkwSqnhNvosQCvtic';

/**
 * Cookie-based storage adapter for the Supabase browser client.
 *
 * Storing the session in a cookie (rather than localStorage) lets the
 * Next.js middleware and API route handlers read the token server-side
 * without an extra round-trip to the client.
 */
function makeCookieStorage() {
  const esc = (k: string) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return {
    getItem(key: string): string | null {
      if (typeof document === 'undefined') return null;
      const m = document.cookie.match(new RegExp('(?:^|;\\s*)' + esc(key) + '=([^;]*)'));
      return m ? decodeURIComponent(m[1]) : null;
    },
    setItem(key: string, value: string): void {
      if (typeof document === 'undefined') return;
      const yr = 60 * 60 * 24 * 365;
      document.cookie = `${key}=${encodeURIComponent(value)}; path=/; SameSite=Lax; max-age=${yr}`;
    },
    removeItem(key: string): void {
      if (typeof document === 'undefined') return;
      document.cookie = `${key}=; path=/; max-age=0`;
    },
  };
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: makeCookieStorage(),
    persistSession: true,
    detectSessionInUrl: true,
  },
});
