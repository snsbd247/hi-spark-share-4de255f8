-- Fix core_connections RLS: add permissive access policies matching other fiber tables
CREATE POLICY "anon_access" ON public.core_connections FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_access" ON public.core_connections FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Drop the restrictive tenant isolation policy that uses auth.uid() incorrectly
DROP POLICY IF EXISTS "Tenant isolation for core_connections" ON public.core_connections;