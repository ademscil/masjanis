-- Fix: hapus semua teks template "herbal nusantara" dari site_settings
-- Jalankan di Supabase SQL Editor

UPDATE site_settings SET value = '🌿 MasJanis'
  WHERE key = 'hero_tag';

UPDATE site_settings SET value = 'Selamat Datang di MasJanis'
  WHERE key = 'hero_title';

UPDATE site_settings SET value = 'Atur konten ini melalui Admin → Pengaturan.'
  WHERE key = 'hero_subtitle' AND value LIKE '%nusantara%';

UPDATE site_settings SET value = 'Tentang MasJanis'
  WHERE key = 'about_title' AND value LIKE '%Nusantara%';

UPDATE site_settings SET value = 'Atur deskripsi tentang kami melalui Admin → Informasi.'
  WHERE key = 'about_body' AND value LIKE '%nusantara%';

UPDATE site_settings SET value = 'Mengapa Memilih MasJanis?'
  WHERE key = 'features_title';

UPDATE site_settings SET value = 'Atur deskripsi ini melalui Admin → Pengaturan.'
  WHERE key = 'features_subtitle' AND value LIKE '%nusantara%';

UPDATE site_settings SET value = 'Apa Kata Pelanggan Kami'
  WHERE key = 'testimonials_title';

UPDATE site_settings SET value = 'Atur deskripsi ini melalui Admin → Pengaturan.'
  WHERE key = 'testimonials_subtitle' AND value LIKE '%nusantara%';

UPDATE site_settings SET value = 'Mulai Perjalanan Sehat Anda Hari Ini'
  WHERE key = 'cta_title';

UPDATE site_settings SET value = 'Bergabunglah dengan ribuan orang yang telah merasakan manfaat produk MasJanis.'
  WHERE key = 'cta_subtitle';

UPDATE site_settings SET value = 'MasJanis'
  WHERE key = 'footer_tagline' AND value LIKE '%nusantara%';

-- Verifikasi hasilnya
SELECT key, value FROM site_settings
WHERE value LIKE '%nusantara%' OR value LIKE '%Nusantara%';
