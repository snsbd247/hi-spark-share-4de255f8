/**
 * Environment Detection — Smart switching between Lovable preview and Laravel backend
 *
 * Priority:
 * 1. VITE_DEPLOY_TARGET=vps → forces VPS/cPanel mode (Laravel API)
 * 2. Known Lovable domains → Lovable mode (Supabase edge functions)
 * 3. VITE_SUPABASE_PROJECT_ID present + non-localhost → Lovable mode
 * 4. Localhost/private IP → local dev mode (Laravel API)
 * 5. Any other domain → cPanel/VPS mode (Laravel API)
 */

const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

/** Explicit VPS/cPanel deploy flag — overrides all other detection */
const isExplicitVps = import.meta.env.VITE_DEPLOY_TARGET === 'vps';

/** Lovable sets this env var automatically at build time for every project */
const hasLovableBuildMarker = !!import.meta.env.VITE_SUPABASE_PROJECT_ID;

/** Running on a known Lovable preview/published domain */
const isLovableDomain =
  hostname.endsWith('.lovableproject.com') ||
  hostname.endsWith('.lovable.app') ||
  hostname.endsWith('.lovable.dev');

/** Running on localhost or private network IP */
export const IS_LOCAL_DEV =
  !isExplicitVps && !isLovableDomain && (
    /^(localhost|127\.0\.0\.1)$/.test(hostname) ||
    /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname)
  );

/**
 * Running on Lovable hosting (preview, published, OR custom domain).
 * If VITE_DEPLOY_TARGET=vps is set, this is always false — forces Laravel API usage.
 */
export const IS_LOVABLE = !isExplicitVps && (isLovableDomain || (hasLovableBuildMarker && !IS_LOCAL_DEV));

/** Running on production VPS/cPanel with Laravel backend */
export const IS_CPANEL = isExplicitVps || (!IS_LOCAL_DEV && !IS_LOVABLE && hostname !== '');

/** Whether a real Laravel backend is available */
export const HAS_BACKEND = IS_LOCAL_DEV || IS_CPANEL;
