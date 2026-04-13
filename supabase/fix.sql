-- ============================================================
-- MasJanis — FIX SQL
-- Jalankan file ini di Supabase SQL Editor
-- ============================================================

-- 1. Tambah kolom image_url ke products (jika belum ada)
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Drop storage policies lama yang pakai 'authenticated'
--    (service_role sudah bypass RLS secara default, tidak perlu policy)
DROP POLICY IF EXISTS "admin upload images"  ON storage.objects;
DROP POLICY IF EXISTS "admin update images"  ON storage.objects;
DROP POLICY IF EXISTS "public read images"   ON storage.objects;

-- 3. Pastikan bucket masjanis ada dan public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('masjanis', 'masjanis', true, 10485760, null)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 4. Policy baca publik untuk bucket masjanis
CREATE POLICY "masjanis public read"
  ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'masjanis');

-- 5. Policy upload untuk service_role (sudah bypass by default, tapi eksplisit lebih aman)
CREATE POLICY "masjanis service upload"
  ON storage.objects FOR INSERT TO service_role
  WITH CHECK (bucket_id = 'masjanis');

CREATE POLICY "masjanis service update"
  ON storage.objects FOR UPDATE TO service_role
  USING (bucket_id = 'masjanis');

CREATE POLICY "masjanis service delete"
  ON storage.objects FOR DELETE TO service_role
  USING (bucket_id = 'masjanis');
