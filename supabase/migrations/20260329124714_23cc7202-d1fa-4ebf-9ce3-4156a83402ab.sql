
-- Divisions table
CREATE TABLE public.geo_divisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  bn_name text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.geo_divisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_access" ON public.geo_divisions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_access" ON public.geo_divisions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Districts table
CREATE TABLE public.geo_districts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  division_id uuid NOT NULL REFERENCES public.geo_divisions(id) ON DELETE CASCADE,
  name text NOT NULL,
  bn_name text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(division_id, name)
);
ALTER TABLE public.geo_districts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_access" ON public.geo_districts FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_access" ON public.geo_districts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Upazilas table
CREATE TABLE public.geo_upazilas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id uuid NOT NULL REFERENCES public.geo_districts(id) ON DELETE CASCADE,
  name text NOT NULL,
  bn_name text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(district_id, name)
);
ALTER TABLE public.geo_upazilas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_access" ON public.geo_upazilas FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_access" ON public.geo_upazilas FOR ALL TO authenticated USING (true) WITH CHECK (true);
