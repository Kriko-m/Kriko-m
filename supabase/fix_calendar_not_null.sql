-- ============================================================
--  Scouts Kriko-M — Fix: calendar column NOT NULL constraints
--  Voer dit script uit in Supabase → SQL Editor → New query
--  indien gewenst om NULL waarden toe te laten op optionele velden.
-- ============================================================

ALTER TABLE calendar ALTER COLUMN document_url DROP NOT NULL;
ALTER TABLE calendar ALTER COLUMN external_link_url DROP NOT NULL;
ALTER TABLE calendar ALTER COLUMN facebook_event_url DROP NOT NULL;
ALTER TABLE calendar ALTER COLUMN facebook_post_url DROP NOT NULL;
ALTER TABLE calendar ALTER COLUMN banner_image DROP NOT NULL;
ALTER TABLE calendar ALTER COLUMN datum_tot DROP NOT NULL;
