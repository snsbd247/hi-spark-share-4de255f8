-- Create reseller_zones table
CREATE TABLE IF NOT EXISTS public.reseller_zones (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    reseller_id uuid REFERENCES public.resellers(id) ON DELETE CASCADE,
    name text NOT NULL,
    status text NOT NULL DEFAULT 'active',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add zone_id to customers table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS zone_id uuid REFERENCES public.reseller_zones(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reseller_zones_tenant ON public.reseller_zones(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reseller_zones_reseller ON public.reseller_zones(reseller_id);
CREATE INDEX IF NOT EXISTS idx_customers_zone ON public.customers(zone_id);

-- RLS
ALTER TABLE public.reseller_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to reseller_zones" ON public.reseller_zones
    FOR ALL USING (true) WITH CHECK (true);