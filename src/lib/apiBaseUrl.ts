/**
 * API Base URL — Auto-detection for multi-domain cPanel deployment
 *
 * Resolution order:
 * 1. VITE_API_URL env var (explicit override)
 * 2. localhost → http://localhost:8000/api (local dev)
 * 3. Lovable preview (*.lovable.app) → no Laravel API, uses Supabase
 * 4. Any other domain → auto-detect: https://<current-domain>/api/api
 *    (same build works on ANY cPanel domain without rebuilding)
 */

const LOCAL_API_BASE_URL = "http://localhost:8000/api";

const envApiBaseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim().replace(/\/+$/, "") || "";
const isEnvLocalhost = /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(envApiBaseUrl);

const hostname = typeof window !== "undefined" ? window.location.hostname : "";
const isLocalHost = /^(localhost|127\.0\.0\.1)$/.test(hostname);
const isLovablePreview = hostname.endsWith(".lovable.app") || hostname.endsWith(".lovableproject.com");

// Explicit non-localhost API URL from env
const hasExplicitApiUrl = !!envApiBaseUrl && !isEnvLocalhost;

/**
 * IS_CPANEL_PRODUCTION — true when running on a real domain (not localhost, not Lovable)
 * In this mode, ALL data goes through Laravel API. No Supabase connection.
 */
export const IS_CPANEL_PRODUCTION = !isLocalHost && !isLovablePreview;

/**
 * IS_LOVABLE_RUNTIME — true only on Lovable preview domains
 * In this mode, Supabase is used directly as the data source.
 */
export const IS_LOVABLE_RUNTIME = isLovablePreview;

/**
 * API_BASE_URL resolution:
 * 1. Explicit VITE_API_URL → use it
 * 2. localhost → localhost:8000/api
 * 3. Lovable preview → localhost placeholder (Supabase handles data)
 * 4. Any cPanel domain → auto-detect from current domain
 */
export const API_BASE_URL = (() => {
  if (hasExplicitApiUrl) return envApiBaseUrl;
  if (isLocalHost) return envApiBaseUrl || LOCAL_API_BASE_URL;
  if (isLovablePreview) return LOCAL_API_BASE_URL;
  // Auto-detect for cPanel: https://<domain>/api/api
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/api`;
  }
  return LOCAL_API_BASE_URL;
})();

export const API_PUBLIC_ROOT = API_BASE_URL.replace(/\/api$/, "");
