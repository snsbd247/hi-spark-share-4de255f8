/**
 * Smart Supabase client — automatically switches between:
 * - Real Supabase client (Lovable preview / development)
 * - Laravel API wrapper (cPanel production when VITE_API_URL is set)
 *
 * All components should import from this file:
 *   import { supabase } from "@/integrations/supabase/client";
 */

const envApiBaseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim().replace(/\/+$/, "") || "";
const isEnvLocalhost = /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(envApiBaseUrl);
const hasExplicitApiUrl = !!envApiBaseUrl && !isEnvLocalhost;

let supabase: any;

if (hasExplicitApiUrl) {
  // cPanel production mode — use Laravel API wrapper (no Supabase)
  const { apiDb } = await import('@/lib/apiDb');
  supabase = apiDb;
} else {
  // Lovable preview / local dev — use real Supabase client
  const { supabaseRaw } = await import('./rawClient');
  supabase = supabaseRaw;
}

export { supabase };
