-- Migration: Tambah kolom yang kurang di tabel products
-- Jalankan di Supabase SQL Editor

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS manfaat     TEXT,
  ADD COLUMN IF NOT EXISTS cara_pakai  TEXT,
  ADD COLUMN IF NOT EXISTS peringatan  TEXT,
  ADD COLUMN IF NOT EXISTS spesifikasi TEXT,
  ADD COLUMN IF NOT EXISTS subtitle    TEXT,
  ADD COLUMN IF NOT EXISTS aka         TEXT,
  ADD COLUMN IF NOT EXISTS kandungan   TEXT;

-- Verifikasi
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;
