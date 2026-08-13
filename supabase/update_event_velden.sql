-- ============================================================
--  Scouts Kriko-M — Update: velden voor evenementen
--  Voer dit script uit in Supabase → SQL Editor → New query
-- ============================================================

ALTER TABLE calendar
  ADD COLUMN IF NOT EXISTS datum_tot          TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS banner_image       TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS facebook_event_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS facebook_post_url  TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS external_link_url  TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS document_url       TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_evenement       BOOLEAN NOT NULL DEFAULT false;
