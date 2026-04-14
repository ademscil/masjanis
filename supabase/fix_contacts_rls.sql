-- Fix RLS policy untuk tabel contacts
-- Izinkan anon INSERT ke contacts

-- Hapus policy lama jika ada
DROP POLICY IF EXISTS "public insert contacts" ON contacts;
DROP POLICY IF EXISTS "anon insert contacts" ON contacts;

-- Buat policy baru yang benar
CREATE POLICY "public insert contacts"
  ON contacts
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Pastikan RLS aktif
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Buat tabel FAQ
CREATE TABLE IF NOT EXISTS faqs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read active faqs" ON faqs;
CREATE POLICY "public read active faqs"
  ON faqs FOR SELECT TO anon
  USING (is_active = true);

-- Insert FAQ default dari konten yang sudah ada
INSERT INTO faqs (question, answer, sort_order) VALUES
  ('Berapa lama pengiriman produk?', 'Pengiriman ke seluruh Indonesia memakan waktu 2–5 hari kerja tergantung lokasi. Tersedia layanan ekspres untuk pengiriman lebih cepat.', 1),
  ('Apakah produk sudah tersertifikasi BPOM?', 'Ya, seluruh produk MasJanis telah mendapatkan izin edar dari BPOM dan sertifikasi Halal dari MUI.', 2),
  ('Bagaimana cara mendaftar kelas online?', 'Klik tombol "Daftar Sekarang" pada kelas yang diminati, lakukan pembayaran, dan akses materi langsung melalui platform kami.', 3),
  ('Apakah ada garansi uang kembali?', 'Kami memberikan garansi kepuasan 30 hari untuk produk fisik. Untuk kelas online, berlaku garansi 7 hari setelah pembelian.', 4),
  ('Bisakah saya menjadi reseller produk MasJanis?', 'Tentu! Kami membuka program reseller dan dropshipper. Hubungi kami melalui email kerjasama@masjanis.com untuk informasi lebih lanjut.', 5),
  ('Apakah konsultasi herbal tersedia?', 'Ya, kami menyediakan layanan konsultasi herbal online dengan herbalis bersertifikat. Jadwalkan sesi melalui halaman kontak ini.', 6)
ON CONFLICT DO NOTHING;
