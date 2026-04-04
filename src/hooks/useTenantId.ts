import { useAuth } from "@/contexts/AuthContext";

/**
 * Simple hook to get tenantId for query scoping.
 * Returns tenantId string or undefined (super admin / no tenant).
 */
export function useTenantId() {
  const { user } = useAuth();
  return user?.tenant_id;
}

/**
 * Helper to add tenant_id filter to a Supabase query builder.
 */
export function scopeByTenant(query: any, tenantId?: string) {
  if (tenantId) return query.eq("tenant_id", tenantId);
  return query;
}
