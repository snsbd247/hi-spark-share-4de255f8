
-- Drop the event trigger first, then its function
DROP EVENT TRIGGER IF EXISTS ensure_rls;
DROP FUNCTION IF EXISTS public.rls_auto_enable() CASCADE;
