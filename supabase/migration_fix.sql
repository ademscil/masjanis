-- ============================================================
-- Tambah kolom tab content untuk produk
-- Jalankan di Supabase SQL Editor
-- ============================================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS manfaat     TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS cara_pakai  TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS peringatan  TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS spesifikasi TEXT;
