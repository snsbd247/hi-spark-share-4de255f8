
-- Create payment_gateways table
CREATE TABLE public.payment_gateways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway_name text NOT NULL DEFAULT 'bkash',
  app_key text,
  app_secret text,
  username text,
  password text,
  base_url text DEFAULT 'https://tokenized.sandbox.bka.sh/v1.2.0-beta',
  environment text NOT NULL DEFAULT 'sandbox',
  merchant_number text,
  status text NOT NULL DEFAULT 'disconnected',
  last_connected_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(gateway_name)
);

-- Enable RLS
ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;

-- Super admins can manage
CREATE POLICY "Super admins can manage payment gateways"
ON public.payment_gateways FOR ALL TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Admins can view
CREATE POLICY "Admins can view payment gateways"
ON public.payment_gateways FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
