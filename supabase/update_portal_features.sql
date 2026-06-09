-- ============================================================
-- Scouts Kriko-M — Supabase Database Schema Update
-- Voer dit script uit in Supabase → SQL Editor → New query
-- ============================================================

-- 1. Upgrade calendar table with branch (tak) attribute
ALTER TABLE calendar ADD COLUMN IF NOT EXISTS tak TEXT NOT NULL DEFAULT 'groep';

-- Ensure constraint allows 'groep' and the 4 branches
ALTER TABLE calendar DROP CONSTRAINT IF EXISTS calendar_tak_check;
ALTER TABLE calendar ADD CONSTRAINT calendar_tak_check CHECK (tak IN ('groep', 'kapoenen', 'welpen', 'jonggivers', 'givers'));

-- 2. Add camp address details for parents
ALTER TABLE kampen ADD COLUMN IF NOT EXISTS briefadres TEXT NOT NULL DEFAULT '';
ALTER TABLE kampen ADD COLUMN IF NOT EXISTS contact_info TEXT NOT NULL DEFAULT '';
