/**
 * Smart client — automatically switches between:
 * - Laravel API wrapper (any cPanel domain — completely self-contained, no Supabase)
 * - Real Supabase client (only on Lovable preview *.lovable.app)
 *
 * Same build works on ANY domain without rebuilding.
 * Each cPanel domain uses its own MySQL database — complete data isolation.
 *
 * Import: import { supabase } from "@/integrations/supabase/client";
 */
import { supabaseRaw } from './rawClient';
import { apiDb } from '@/lib/apiDb';
import { IS_LOVABLE_RUNTIME } from '@/lib/apiBaseUrl';

/**
 * On Lovable preview (*.lovable.app) → real Supabase client
 * On ANY other domain (cPanel production) → Laravel API wrapper (no Supabase)
 * On localhost → Laravel API wrapper (local Laravel dev)
 */
export const supabase: any = IS_LOVABLE_RUNTIME ? supabaseRaw : apiDb;
