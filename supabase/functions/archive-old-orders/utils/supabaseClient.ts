
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export const initSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials');
  }
  
  // Initialize Supabase client with the service role key
  return createClient(supabaseUrl, supabaseServiceKey);
};
