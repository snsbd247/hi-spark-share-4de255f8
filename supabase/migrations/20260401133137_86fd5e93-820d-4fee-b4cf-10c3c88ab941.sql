
-- Add geo-location fields to login_histories
ALTER TABLE public.login_histories 
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision,
  ADD COLUMN IF NOT EXISTS user_agent text,
  ADD COLUMN IF NOT EXISTS is_suspicious boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS suspicious_reason text;

-- Add user_agent and module to audit_logs for enhanced tracking
ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS tenant_id uuid,
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS ip_address text,
  ADD COLUMN IF NOT EXISTS user_agent text,
  ADD COLUMN IF NOT EXISTS module text;

-- Add geo and last_activity to admin_sessions
ALTER TABLE public.admin_sessions
  ADD COLUMN IF NOT EXISTS last_activity timestamp with time zone DEFAULT now(),
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS city text;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_login_histories_suspicious ON public.login_histories(is_suspicious) WHERE is_suspicious = true;
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON public.audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_module ON public.audit_logs(module);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_status_activity ON public.admin_sessions(status, last_activity);
