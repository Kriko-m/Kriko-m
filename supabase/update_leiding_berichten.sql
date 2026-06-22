-- Berichten feed voor de leiding home page
-- Paste into Supabase → SQL Editor → New query and run.

CREATE TABLE IF NOT EXISTS leiding_berichten (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  content     text        NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  author_naam text        NOT NULL,
  author_email text       NOT NULL,
  created_at  timestamptz DEFAULT now() NOT NULL
);
