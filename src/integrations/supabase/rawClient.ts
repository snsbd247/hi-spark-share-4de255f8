/**
 * Raw Supabase client — always connects directly to Supabase.
 * Used internally by apiDb as a fallback and for Lovable preview mode.
 * Components should import from `client.ts` instead.
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://udxrzqpivtzunnfenmyd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkeHJ6cXBpdnR6dW5uZmVubXlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NjM3OTAsImV4cCI6MjA4ODUzOTc5MH0.cqupkjIjdIcF-g_WDBtmKpSXqMoL09TVPtWsV5XY0ps";

export const supabaseRaw = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

export { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY };
