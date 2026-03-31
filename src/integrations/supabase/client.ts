/**
 * Database client — Dual-mode: Supabase SDK for Lovable preview, Laravel API for production.
 */
import { IS_LOVABLE } from '@/lib/environment';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://udxrzqpivtzunnfenmyd.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkeHJ6cXBpdnR6dW5uZmVubXlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NjM3OTAsImV4cCI6MjA4ODUzOTc5MH0.cqupkjIjdIcF-g_WDBtmKpSXqMoL09TVPtWsV5XY0ps";

// In Lovable preview: use real Supabase SDK
// In production: use Laravel API wrapper (apiDb)
let db: any;
let supabase: any;
let apiDb: any;

if (IS_LOVABLE) {
  const client = createClient(SUPABASE_URL, SUPABASE_KEY);
  db = client;
  supabase = client;
  apiDb = client;
} else {
  // Lazy import to avoid loading apiDb code in Lovable preview
  // apiDb depends on axios/api which would fail without Laravel backend
  const { apiDb: laravelDb } = await import('@/lib/apiDb');
  db = laravelDb;
  supabase = laravelDb;
  apiDb = laravelDb;
}

export { apiDb, db, supabase };
export default apiDb;
