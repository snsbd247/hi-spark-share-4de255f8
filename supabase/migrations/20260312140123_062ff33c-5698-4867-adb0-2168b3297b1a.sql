-- Add white-label branding columns to general_settings
ALTER TABLE public.general_settings
  ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#2563eb',
  ADD COLUMN IF NOT EXISTS favicon_url text,
  ADD COLUMN IF NOT EXISTS login_logo_url text,
  ADD COLUMN IF NOT EXISTS support_email text,
  ADD COLUMN IF NOT EXISTS support_phone text;