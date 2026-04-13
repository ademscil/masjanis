-- Tambah kolom is_featured ke tabel products
-- Jalankan di Supabase SQL Editor
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

-- Update RLS: anon bisa baca produk featured
-- (sudah tercakup oleh policy "public read active products" yang ada)
