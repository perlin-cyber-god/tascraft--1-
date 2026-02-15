import { createClient } from '@supabase/supabase-js';

// Access environment variables securely
// Note: In a real Vite environment, these would be import.meta.env.VITE_SUPABASE_URL
// We use process.env here as a fallback or for compatible runners.
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
