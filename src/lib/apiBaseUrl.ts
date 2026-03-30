/**
 * API Base URL — Only used for Laravel API (cPanel / local dev)
 */
import { IS_LOCAL_DEV } from '@/lib/environment';

const LOCAL_API = 'http://localhost:8000/api';
const envUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim().replace(/\/+$/, '') || '';

export const API_BASE_URL = (() => {
  if (envUrl) return envUrl;
  if (IS_LOCAL_DEV) return LOCAL_API;
  if (typeof window !== 'undefined') return `${window.location.origin}/api/api`;
  return LOCAL_API;
})();

export const API_PUBLIC_ROOT = API_BASE_URL.replace(/\/api$/, '');
