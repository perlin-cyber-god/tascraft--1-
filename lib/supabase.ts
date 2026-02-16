import { createClient } from '@supabase/supabase-js';

// Access environment variables securely
// Vite exposes environment variables via import.meta.env
// Variables must be prefixed with VITE_ to be exposed to the browser
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
