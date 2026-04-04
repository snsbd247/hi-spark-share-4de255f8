
-- Fix: Replace global unique constraints with tenant-scoped composite unique indexes

-- 1. accounts: drop global unique on code, add (tenant_id, code) composite
ALTER TABLE public.accounts DROP CONSTRAINT IF EXISTS accounts_code_key;
DROP INDEX IF EXISTS accounts_code_key;
CREATE UNIQUE INDEX idx_accounts_tenant_code ON public.accounts (tenant_id, code) WHERE tenant_id IS NOT NULL;

-- 2. payment_gateways: drop global unique on gateway_name (composite already exists but global one blocks)
ALTER TABLE public.payment_gateways DROP CONSTRAINT IF EXISTS payment_gateways_gateway_name_key;
DROP INDEX IF EXISTS payment_gateways_gateway_name_key;
