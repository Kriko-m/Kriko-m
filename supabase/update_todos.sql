-- ============================================================
--  Scouts Kriko-M — Update: TODO checklist table
--  Voer dit script uit in Supabase → SQL Editor → New query
-- ============================================================

CREATE TABLE IF NOT EXISTS todos (
  id          TEXT        PRIMARY KEY DEFAULT 'todo_' || gen_random_uuid(),
  title       TEXT        NOT NULL,
  month       SMALLINT    NOT NULL CHECK (month BETWEEN 1 AND 12),
  completed   BOOLEAN     NOT NULL DEFAULT false,
  tak         TEXT        NOT NULL CHECK (tak IN ('groep','kapoenen','welpen','jonggivers','givers')),
  werkjaar    TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexen voor snelle selectie
CREATE INDEX IF NOT EXISTS todos_tak_month_idx ON todos(tak, month);
CREATE INDEX IF NOT EXISTS todos_werkjaar_idx ON todos(werkjaar);

-- Enable RLS
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
