# Implementation Plan: masjanis-cms

## Overview

Website MasJanis — platform penjualan produk herbal dengan CMS berbasis Supabase.
Rebrand dari MasJanis ke MasJanis. Stack: vanilla HTML/CSS/JS + Supabase + Netlify.

**Status: Production-ready & deployed di masjanis.com**

---

## Completed Tasks

- [x] 1. Setup Supabase Database Schema dan RLS
  - `supabase/schema.sql` — DDL lengkap: products, articles, classes, downloads, contacts, site_settings
  - RLS policies: anon SELECT is_active=true, anon INSERT contacts, service_role bypass
  - `supabase/fix.sql` — ALTER TABLE untuk kolom image_url di semua tabel konten
  - `supabase/README.md` — panduan setup lengkap

- [x] 2. Konfigurasi Supabase
  - `supabase-config.js` — SUPABASE_URL, SUPABASE_ANON_KEY, isConfigured()
  - Singleton client `window._mjClient` di cms-loader.js untuk mencegah multiple instances

- [x] 3. CSS States
  - Skeleton card, error state, empty state di `styles.css`
  - CKEditor styling (min-height, bullet list fix)

- [x] 4. JavaScript Architecture
  - `main.js` — navbar, hamburger, fade-in, filter tabs, modals, contact form, smooth scroll, CMS helpers
  - `cms-loader.js` — loader terpusat: shop, teori, kelas, download, site info, active nav
  - `page-header-loader.js` — load gambar page header dari site_settings

- [x] 5. Admin Panel (`admin/index.html`)
  - Auth: login, logout, session persistence, sidebar hidden sebelum login
  - Dashboard: 5 stat cards
  - CRUD: Produk, Artikel, Kelas, Download (dengan upload gambar + CKEditor)
  - Pesan: inbox kontak dengan read/unread
  - Pengaturan: hero image, page header per halaman (upload/URL)
  - Informasi: alamat, telepon, email, jam operasional, sosmed
  - Pengguna: buat/hapus admin, ganti password

- [x] 6. Frontend Integration
  - shop.html — produk dari Supabase, filter kategori, payment modal
  - teori.html — artikel dari Supabase, filter + search
  - kelas.html — kelas dari Supabase, filter level
  - download.html — materi dari Supabase, filter kategori
  - kontak.html — form submit ke Supabase contacts
  - index.html — featured products + hero settings dari Supabase

- [x] 7. Branding & Assets
  - Logo MasJanis (`gambarlogo-removebg-preview.png`) di navbar, footer, CMS
  - Favicon pakai logo MasJanis
  - Footer logo invert putih untuk background gelap

- [x] 8. SEO & Deployment
  - sitemap.xml, robots.txt, meta tags
  - netlify.toml — cache headers, JS no-cache untuk selalu fresh
  - _redirects — URL routing tanpa .html extension

- [x] 9. Cleanup & Refactoring
  - Hapus file tidak terpakai (favicon.svg, logo.png, gambarlogo.png, script temp)
  - Refactor main.js ke fungsi-fungsi terpisah yang clean
  - Refactor cms-loader.js dengan loadGrid() wrapper, hapus parameter tidak terpakai
  - Fix copyright year, closing tag duplikat, data-page attribute konsisten
  - Update README.md

---

## Pending / Known Issues

- [ ] Kolom `image_url` di tabel articles, classes, downloads perlu ALTER TABLE manual:
  ```sql
  ALTER TABLE articles  ADD COLUMN IF NOT EXISTS image_url TEXT;
  ALTER TABLE classes   ADD COLUMN IF NOT EXISTS image_url TEXT;
  ALTER TABLE downloads ADD COLUMN IF NOT EXISTS image_url TEXT;
  ```
- [ ] CKEditor font family plugin membutuhkan build CKEditor custom (CDN classic tidak include fontFamily plugin)
- [ ] Navbar & footer masih hardcode di setiap halaman (kandidat refactor ke web components)

---

## File Structure

```
├── index.html, shop.html, teori.html, kelas.html, download.html, kontak.html, 404.html
├── styles.css          — stylesheet utama
├── main.js             — UI interactions
├── cms-loader.js       — Supabase data loader
├── page-header-loader.js
├── supabase-config.js
├── admin/index.html    — CMS admin panel
├── supabase/           — schema, fix SQL, README
├── gambarlogo-removebg-preview.png
├── netlify.toml, _redirects, robots.txt, sitemap.xml
└── README.md
```
