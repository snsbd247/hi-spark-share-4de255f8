/**
 * Session-scoped storage for auth tokens.
 * Uses sessionStorage so sessions expire when browser closes.
 * Falls back gracefully if sessionStorage is unavailable.
 */

const store = typeof window !== 'undefined' ? window.sessionStorage : null;

export const sessionStore = {
  getItem(key: string): string | null {
    try { return store?.getItem(key) ?? null; } catch { return null; }
  },
  setItem(key: string, value: string): void {
    try { store?.setItem(key, value); } catch {}
  },
  removeItem(key: string): void {
    try { store?.removeItem(key); } catch {}
  },
};
