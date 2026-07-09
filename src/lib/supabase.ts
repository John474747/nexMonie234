import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqyoyrswqjqvsozttfxr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxeW95cnN3cWpxdnNvenR0ZnhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwODY1NTcsImV4cCI6MjA5ODY2MjU1N30.kN-gkXz0Jteu00YmJ37W9T22K_FkwSqnhNvosQCvtic';

// The frontend strictly uses the public anon key.
// All financial logic is moved to Edge Functions or RPCs.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
