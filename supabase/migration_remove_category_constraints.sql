-- Migration: Hapus CHECK constraint pada kolom category/level
-- agar kategori bisa dikelola bebas dari CMS (Category Manager)
-- Jalankan di Supabase SQL Editor

ALTER TABLE products  DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE articles  DROP CONSTRAINT IF EXISTS articles_category_check;
ALTER TABLE classes   DROP CONSTRAINT IF EXISTS classes_level_check;
ALTER TABLE downloads DROP CONSTRAINT IF EXISTS downloads_category_check;

-- Verifikasi: pastikan constraint sudah tidak ada
SELECT conname, conrelid::regclass
FROM pg_constraint
WHERE contype = 'c'
  AND conrelid::regclass::text IN ('products','articles','classes','downloads');
