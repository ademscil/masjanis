-- Migration: Tabel page_views untuk visitor counter
-- Jalankan di Supabase SQL Editor

CREATE TABLE IF NOT EXISTS page_views (
  id         BIGSERIAL PRIMARY KEY,
  page       TEXT NOT NULL,          -- path halaman, misal '/', '/shop', '/teori'
  referrer   TEXT,                   -- dari mana visitor datang
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index untuk query cepat
CREATE INDEX IF NOT EXISTS idx_page_views_page       ON page_views(page);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);

-- RLS: anon bisa INSERT (track visit), tidak bisa SELECT
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public insert page_views"
  ON page_views FOR INSERT TO anon
  WITH CHECK (true);

-- service_role bisa SELECT untuk dashboard admin
-- (service_role bypass RLS by default)

-- View untuk summary per halaman (opsional, untuk query mudah)
CREATE OR REPLACE VIEW page_views_summary AS
SELECT
  page,
  COUNT(*)                                          AS total_views,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days'  THEN 1 END) AS views_7d,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) AS views_30d,
  MAX(created_at)                                   AS last_visit
FROM page_views
GROUP BY page
ORDER BY total_views DESC;
