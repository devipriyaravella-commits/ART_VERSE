import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = (): boolean => {
  if (!supabaseUrl || !supabaseAnonKey) return false;
  if (!supabaseUrl.startsWith('https://')) return false;
  if (supabaseUrl.includes('placeholder')) return false;
  // Accept classic JWT anon key (eyJ...) or new Supabase publishable key (sb_publishable_...)
  const isValidKey =
    supabaseAnonKey.length > 20 &&
    (supabaseAnonKey.startsWith('eyJ') || supabaseAnonKey.startsWith('sb_publishable_'));
  return isValidKey;
};

// Fallback dummy URL and anon key to prevent createClient from throwing on initialization
const validUrl = isSupabaseConfigured() ? supabaseUrl! : 'https://placeholder.supabase.co';
const validKey = isSupabaseConfigured() ? supabaseAnonKey! : 'placeholder-anon-key-artverse-0000000000000000000000';

export const supabase = createClient<Database>(validUrl, validKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

/**
 * Checks connection to the Supabase project
 */
export const checkSupabaseConnection = async (): Promise<{
  connected: boolean;
  configured: boolean;
  url?: string;
  error?: string;
}> => {
  if (!isSupabaseConfigured()) {
    return {
      connected: false,
      configured: false,
      error: 'Supabase credentials not configured or incomplete.'
    };
  }

  try {
    const { error } = await supabase.auth.getSession();
    if (error) {
      return {
        connected: false,
        configured: true,
        url: supabaseUrl,
        error: error.message
      };
    }
    return {
      connected: true,
      configured: true,
      url: supabaseUrl
    };
  } catch (err: any) {
    return {
      connected: false,
      configured: true,
      url: supabaseUrl,
      error: err?.message || 'Network error reaching Supabase.'
    };
  }
};
