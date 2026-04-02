
-- Add admin cost and profit tracking to sms_logs
ALTER TABLE public.sms_logs ADD COLUMN IF NOT EXISTS admin_cost numeric DEFAULT 0;
ALTER TABLE public.sms_logs ADD COLUMN IF NOT EXISTS profit numeric DEFAULT 0;

-- Add admin_cost_rate to sms_settings for Super Admin to set their GreenWeb cost rate
ALTER TABLE public.sms_settings ADD COLUMN IF NOT EXISTS admin_cost_rate numeric DEFAULT 0.25;
