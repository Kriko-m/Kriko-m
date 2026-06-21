-- ============================================================
-- Scouts Kriko-M — Supabase Database Schema Update
-- Run this script in Supabase → SQL Editor → New query
-- ============================================================

-- Add portal_backgrounds column to settings table to persist tak portal page backgrounds
ALTER TABLE settings ADD COLUMN IF NOT EXISTS portal_backgrounds JSONB NOT NULL DEFAULT '{}';
