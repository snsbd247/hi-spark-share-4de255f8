
-- Add plan expiry tracking columns to tenants
ALTER TABLE public.tenants 
  ADD COLUMN IF NOT EXISTS plan_expire_date date,
  ADD COLUMN IF NOT EXISTS grace_days integer NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS plan_id uuid,
  ADD COLUMN IF NOT EXISTS plan_expiry_message text DEFAULT 'আপনার প্ল্যানের মেয়াদ শীঘ্রই শেষ হচ্ছে। দয়া করে রিনিউ করুন।';

-- Subscription invoices table
CREATE TABLE IF NOT EXISTS public.subscription_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  plan_id uuid,
  subscription_id uuid,
  amount numeric NOT NULL DEFAULT 0,
  tax_amount numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  billing_cycle text NOT NULL DEFAULT 'monthly',
  due_date date,
  paid_date timestamp with time zone,
  payment_method text,
  transaction_id text,
  proration_credit numeric DEFAULT 0,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_access" ON public.subscription_invoices FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_access" ON public.subscription_invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);
