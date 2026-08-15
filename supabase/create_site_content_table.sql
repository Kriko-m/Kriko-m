-- SQL Migration: Create site_content table & RLS policies
-- Run this query in Supabase -> SQL Editor -> New query

CREATE TABLE IF NOT EXISTS public.site_content (
  key TEXT PRIMARY KEY,
  page TEXT NOT NULL,
  section TEXT NOT NULL,
  title TEXT,
  content TEXT,
  image_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Allow public read access to site_content
CREATE POLICY "Public read access for site_content"
  ON public.site_content
  FOR SELECT
  USING (true);

-- Allow authenticated admins and groepsleiding to modify site_content
CREATE POLICY "Leiding write access for site_content"
  ON public.site_content
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'groepsleiding')
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'groepsleiding')
  );
