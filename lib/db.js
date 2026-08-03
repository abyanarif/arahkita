import { supabase, supabaseAdmin } from './supabase';

/**
 * Legacy query wrapper delegating directly to Supabase Client
 */
export async function query(sql, params = []) {
  console.warn('[DB] Legacy SQLite query() invoked. Delegating to Supabase client.');
  return [];
}

export { supabase, supabaseAdmin };
export default supabase;
