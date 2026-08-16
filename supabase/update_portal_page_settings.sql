-- Migration: Add portal page backgrounds & title columns to settings table
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS home_title_leiding TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS home_subtitle_leiding TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS home_title_groepsleiding TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS home_subtitle_groepsleiding TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS home_bg_type TEXT DEFAULT 'photo';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS home_bg_value TEXT DEFAULT '/images/hero-nieuw.webp';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS echos_bg_type TEXT DEFAULT 'color';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS echos_bg_value TEXT DEFAULT '#EEF5F1';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS docs_bg_type TEXT DEFAULT 'color';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS docs_bg_value TEXT DEFAULT '#EEF5F1';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS agenda_bg_type TEXT DEFAULT 'color';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS agenda_bg_value TEXT DEFAULT '#EEF5F1';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS beheer_bg_type TEXT DEFAULT 'color';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS beheer_bg_value TEXT DEFAULT '#EEF5F1';
