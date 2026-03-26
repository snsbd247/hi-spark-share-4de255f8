const LOCAL_API_BASE_URL = "http://localhost:8000/api";

const envApiBaseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim().replace(/\/+$/, "") || "";
const isEnvLocalhost = /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(envApiBaseUrl);

const hostname = typeof window !== "undefined" ? window.location.hostname : "";
const isLocalHost = /^(localhost|127\.0\.0\.1)$/.test(hostname);

// Only treat as custom-domain-with-Laravel if VITE_API_URL is explicitly set to a non-localhost URL
const hasExplicitApiUrl = !!envApiBaseUrl && !isEnvLocalhost;

/**
 * API_BASE_URL resolution:
 * 1. If VITE_API_URL is set to a real (non-localhost) URL → use it (Laravel on custom server)
 * 2. If running on localhost → use VITE_API_URL or default localhost:8000
 * 3. Otherwise (any deployed domain: lovable.app, custom domains, etc.) → 
 *    use localhost placeholder which will always fail network request,
 *    triggering Supabase edge function fallback in apiDb.ts
 */
export const API_BASE_URL = (() => {
  if (hasExplicitApiUrl) return envApiBaseUrl;
  if (isLocalHost) return envApiBaseUrl || LOCAL_API_BASE_URL;
  return LOCAL_API_BASE_URL;
})();

export const API_PUBLIC_ROOT = API_BASE_URL.replace(/\/api$/, "");

/**
 * IS_LOVABLE_RUNTIME — enables Supabase edge function fallback.
 * True for ALL non-localhost deployments when no explicit Laravel API URL is configured.
 * This means ANY domain (lovable.app, custom domains, future domains) will
 * automatically use Supabase as the data source without any configuration.
 */
export const IS_LOVABLE_RUNTIME = !isLocalHost && !hasExplicitApiUrl;
