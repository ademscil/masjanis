-- Tambah kolom download_count ke tabel downloads
-- Jalankan di Supabase SQL Editor
ALTER TABLE downloads ADD COLUMN IF NOT EXISTS download_count INTEGER NOT NULL DEFAULT 0;

-- Buat fungsi RPC untuk increment download_count secara aman
CREATE OR REPLACE FUNCTION increment_download_count(download_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE downloads SET download_count = download_count + 1 WHERE id = download_id;
END;
$$;

-- Grant akses ke anon (public bisa increment)
GRANT EXECUTE ON FUNCTION increment_download_count(UUID) TO anon;
