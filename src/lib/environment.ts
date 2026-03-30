/**
 * Environment Detection
 * 
 * Lovable preview → uses Supabase directly (own database)
 * cPanel / localhost → uses Laravel API (own database)
 */

const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

/** Running inside Lovable preview (*.lovable.app) */
export const IS_LOVABLE = /\.lovable\.app$/.test(hostname) || /\.lovableproject\.com$/.test(hostname);

/** Running on localhost or private network IP */
export const IS_LOCAL_DEV =
  /^(localhost|127\.0\.0\.1)$/.test(hostname) ||
  /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname);

/** Running on cPanel production (any domain that's not Lovable or local) */
export const IS_CPANEL = !IS_LOVABLE && !IS_LOCAL_DEV && hostname !== '';
