'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * useCollection - Real-time Supabase Table Subscriber
 */
export function useCollection<T = any>(config: { 
  table: string; 
  userId?: string; 
  order?: string; 
  limit?: number;
  filter?: { column: string; value: any };
} | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!config) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      let query = supabase.from(config.table).select('*');
      
      if (config.userId) {
        const userColumn = config.table === 'profiles' ? 'id' : 'user_id';
        query = query.eq(userColumn, config.userId);
      }
      
      if (config.filter) {
        query = query.eq(config.filter.column, config.filter.value);
      }
      
      if (config.order) {
        query = query.order(config.order, { ascending: false });
      }
      
      if (config.limit) {
        query = query.limit(config.limit);
      }

      const { data: results, error: err } = await query;

      if (err) {
        // Only log if it's not a "missing table" error (which is expected during initial setup)
        if (!err.message.includes('Could not find the table')) {
          console.error(`Supabase error fetching ${config.table}:`, err.message, err.details, err.hint);
        }
        setError(err);
        setData([]); // Ensure data is empty on error
      } else {
        setData(results || []);
      }
      setLoading(false);
    };

    fetchData();

    const realtimeFilter = config.userId 
      ? `${config.table === 'profiles' ? 'id' : 'user_id'}=eq.${config.userId}` 
      : undefined;

    const channel = supabase
      .channel(`${config.table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: config.table,
          ...(realtimeFilter ? { filter: realtimeFilter } : {}),
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [config?.table, config?.userId, config?.order, config?.limit, JSON.stringify(config?.filter)]);

  return { data, loading, error };
}
