-- ============================================================
-- MasJanis CMS — Supabase Schema
-- Jalankan seluruh file ini di SQL Editor Supabase
-- ============================================================

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE products (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  description    TEXT,
  price          INTEGER NOT NULL,
  original_price INTEGER,
  category       TEXT NOT NULL,
  emoji          TEXT,
  badge_label    TEXT,
  image_url      TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  payment_url    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ARTICLES
-- ============================================================
CREATE TABLE articles (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  excerpt        TEXT,
  category       TEXT NOT NULL,
  read_time      INTEGER,
  published_date DATE,
  emoji          TEXT,
  bg_class       TEXT CHECK (bg_class IN ('bg1','bg2','bg3','bg4','bg5','bg6')),
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- CLASSES
-- ============================================================
CREATE TABLE classes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  description    TEXT,
  instructor     TEXT,
  duration_hours INTEGER,
  video_count    INTEGER,
  level          TEXT NOT NULL,
  price          INTEGER NOT NULL,
  original_price INTEGER,
  emoji          TEXT,
  bg_class       TEXT CHECK (bg_class IN ('bg1','bg2','bg3','bg4','bg5','bg6')),
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- DOWNLOADS
-- ============================================================
CREATE TABLE downloads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  category    TEXT NOT NULL,
  file_size   TEXT,
  file_url    TEXT,
  emoji       TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- CONTACTS
-- ============================================================
CREATE TABLE contacts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT,
  subject    TEXT,
  message    TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE products  ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts  ENABLE ROW LEVEL SECURITY;

-- anon: SELECT only active rows (content tables)
CREATE POLICY "public read active products"
  ON products FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "public read active articles"
  ON articles FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "public read active classes"
  ON classes FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "public read active downloads"
  ON downloads FOR SELECT TO anon
  USING (is_active = true);

-- anon: INSERT only on contacts
CREATE POLICY "public insert contacts"
  ON contacts FOR INSERT TO anon
  WITH CHECK (true);

-- service_role bypasses RLS by default in Supabase
-- (no additional policies needed for admin operations)

-- ============================================================
-- SITE SETTINGS (hero & global config)
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- anon: bisa baca semua settings
CREATE POLICY "public read site_settings"
  ON site_settings FOR SELECT TO anon
  USING (true);

-- Insert default hero settings
INSERT INTO site_settings (key, value) VALUES
  ('hero_image_url', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=80'),
  ('hero_title', 'Temukan Kekuatan Alam untuk Kesehatan Anda'),
  ('hero_subtitle', 'Warisan leluhur yang telah teruji ribuan tahun, kini hadir dalam formula modern berbasis riset ilmiah.')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- ALTER TABLE — tambah kolom image_url (aman jika sudah ada)
-- ============================================================
ALTER TABLE products  ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE articles  ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE classes   ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE downloads ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ============================================================
-- STORAGE BUCKETS
-- Jalankan di SQL Editor SETELAH membuat bucket via Dashboard:
-- 1. Buka Storage > New Bucket
-- 2. Nama: "images", Public: ON
-- ============================================================

-- Policy: siapa saja bisa baca file publik di bucket images
-- (otomatis jika bucket di-set Public via Dashboard)

-- Policy: hanya authenticated user (admin) yang bisa upload
INSERT INTO storage.buckets (id, name, public)
VALUES ('masjanis', 'masjanis', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "admin upload images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'masjanis');

CREATE POLICY "admin update images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'masjanis');

CREATE POLICY "public read images"
  ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'masjanis');

-- ============================================================
-- TESTIMONIALS
-- ============================================================
CREATE TABLE IF NOT EXISTS testimonials (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  location   TEXT,
  avatar     TEXT,
  rating     INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  content    TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read active testimonials"
  ON testimonials FOR SELECT TO anon
  USING (is_active = true);

-- ============================================================
-- FEATURES (Keunggulan)
-- ============================================================
CREATE TABLE IF NOT EXISTS features (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icon       TEXT NOT NULL DEFAULT '🌿',
  title      TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read active features"
  ON features FOR SELECT TO anon
  USING (is_active = true);

-- ============================================================
-- SITE SETTINGS — tambahan keys
-- ============================================================
INSERT INTO site_settings (key, value) VALUES
  -- Hero
  ('hero_tag',              '🌿 MasJanis'),
  ('hero_btn1_text',        '🛒 Jelajahi Produk'),
  ('hero_btn1_url',         'shop.html'),
  ('hero_btn2_text',        '📖 Pelajari Teori'),
  ('hero_btn2_url',         'teori.html'),
  -- Stats bar (index)
  ('stat1_num',             '500+'),
  ('stat1_label',           'Produk Herbal'),
  ('stat2_num',             '50K+'),
  ('stat2_label',           'Pelanggan Puas'),
  ('stat3_num',             '100+'),
  ('stat3_label',           'Artikel Riset'),
  ('stat4_num',             '15+'),
  ('stat4_label',           'Tahun Pengalaman'),
  -- About section
  ('about_title',           'Tentang MasJanis'),
  ('about_body',            'Atur konten tentang kami melalui Admin → Informasi.'),
  ('about_image_url',       ''),
  -- Features section title
  ('features_title',        'Mengapa Memilih MasJanis?'),
  ('features_subtitle',     'Kami menggabungkan kearifan lokal dengan standar ilmiah modern.'),
  -- Testimonials section title
  ('testimonials_title',    'Apa Kata Pelanggan Kami'),
  ('testimonials_subtitle', 'Ribuan pelanggan telah merasakan manfaat nyata dari produk MasJanis.'),
  -- CTA Banner
  ('cta_title',             'Mulai Perjalanan Sehat Anda Hari Ini'),
  ('cta_subtitle',          'Bergabunglah dengan ribuan orang yang telah merasakan manfaat produk MasJanis.'),
  ('cta_btn1_text',         '🛒 Belanja Sekarang'),
  ('cta_btn1_url',          'shop.html'),
  ('cta_btn2_text',         '📚 Lihat Kelas'),
  ('cta_btn2_url',          'kelas.html'),
  -- Promo banner (kelas.html)
  ('promo_active',          'true'),
  ('promo_title',           '🎉 Promo Spesial! Diskon hingga 50%'),
  ('promo_subtitle',        'Berlaku untuk semua kelas. Gunakan kode: HERBAL50'),
  ('promo_code',            'HERBAL50'),
  -- Download stats
  ('dl_stat1_num',          '48+'),
  ('dl_stat1_label',        'Total Materi'),
  ('dl_stat2_num',          '12K+'),
  ('dl_stat2_label',        'Total Unduhan'),
  ('dl_stat3_num',          '100%'),
  ('dl_stat3_label',        'Gratis'),
  ('dl_stat4_num',          '4'),
  ('dl_stat4_label',        'Kategori'),
  -- Kontak
  ('map_embed_url',         ''),
  ('whatsapp',              ''),
  ('footer_tagline',        'MasJanis — Atur tagline ini melalui Admin → Informasi.')
ON CONFLICT (key) DO NOTHING;
