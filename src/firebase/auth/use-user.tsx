'use client';

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

const ONE_YEAR = 60 * 60 * 24 * 365;

function syncAuthCookies(accessToken: string | null) {
  if (typeof document === 'undefined') return;
  if (accessToken) {
    // Indicator cookie — tiny, always within limits, read by middleware
    document.cookie = `nex-auth=1; path=/; SameSite=Lax; max-age=${ONE_YEAR}`;
    // JWT cookie — ~800–1000 bytes, well within the 4 KB browser cookie limit
    document.cookie = `nex-token=${accessToken}; path=/; SameSite=Lax; max-age=${ONE_YEAR}`;
  } else {
    document.cookie = 'nex-auth=; path=/; max-age=0';
    document.cookie = 'nex-token=; path=/; max-age=0';
  }
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      syncAuthCookies(session?.access_token ?? null);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Keep cookies in sync with auth state (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        syncAuthCookies(session?.access_token ?? null);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
