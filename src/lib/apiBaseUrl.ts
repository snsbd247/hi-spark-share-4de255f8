/**
 * API Base URL — Auto-detect per deployment target
 * Local dev → http://localhost:8000/api
 * VPS build → /api
 * cPanel build → /api/api
 */
import { IS_LOCAL_DEV } from '@/lib/environment';

const LOCAL_API = 'http://localhost:8000/api';
const IS_EXPLICIT_VPS = import.meta.env.VITE_DEPLOY_TARGET === 'vps';

export const API_BASE_URL = (() => {
  if (IS_LOCAL_DEV) return LOCAL_API;
  if (typeof window === 'undefined') return LOCAL_API;

  const apiPath = IS_EXPLICIT_VPS ? '/api' : '/api/api';
  return `${window.location.origin}${apiPath}`;
})();

export const API_PUBLIC_ROOT = API_BASE_URL.replace(/\/api$/, '');
