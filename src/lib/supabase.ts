import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase environment variables are missing! Database persistence will not function until they are configured.');
}

// Dynamically create a client with optional Clerk JWT to satisfy RLS policies
export const getSupabase = (clerkToken?: string | null) => {
  const options: any = {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  };

  if (clerkToken) {
    options.global = {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    };
  }

  return createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseKey || 'placeholder-key',
    options
  );
};

// Export fallback singleton client
export const supabase = getSupabase();
