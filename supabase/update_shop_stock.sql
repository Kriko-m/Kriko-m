-- ============================================================
--  Scouts Kriko-M — Webshop Stock / Voorraad Kolom
--  Uitvoeren in Supabase → SQL Editor → New query
-- ============================================================

-- 1. Voeg JSONB stock kolom toe aan shop_products
ALTER TABLE shop_products 
ADD COLUMN IF NOT EXISTS stock JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 2. Voeg stock_deducted boolean kolom toe aan orders om dubbele aftrek te voorkomen
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS stock_deducted BOOLEAN NOT NULL DEFAULT false;
