import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://geeqgdjgykixomfbzwkr.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlZXFnZGpneWtpeG9tZmJ6d2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3MzU3MjcsImV4cCI6MjEwMTMxMTcyN30.wgWBGoHRQaz9uZ6R9Om2JHTCM072i-m9B-KVbcu3WMQ';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

// Standard public Supabase client for client-side and public queries
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin Supabase client with Service Role Key for backend seeder & privileged operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export default supabase;
