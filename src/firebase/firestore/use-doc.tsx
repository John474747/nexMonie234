'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * useDoc - Real-time Supabase Document (Row) Subscriber
 */
export function useDoc<T = any>(config: { table: string; id: string } | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!config || !config.id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      const { data: result, error: err } = await supabase
        .from(config.table)
        .select('*')
        .eq('id', config.id)
        .maybeSingle();

      if (err) {
        if (!err.message.includes('Could not find the table')) {
          console.error(`Supabase error fetching doc from ${config.table}:`, err.message, err.details);
        }
        setError(err);
      } else {
        setData(result);
      }
      setLoading(false);
    };

    fetchData();

    const channel = supabase
      .channel(`${config.table}_row_${config.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: config.table,
          filter: `id=eq.${config.id}`,
        },
        (payload) => {
          setData(payload.new as T);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [config?.table, config?.id]);

  return { data, loading, error };
}
