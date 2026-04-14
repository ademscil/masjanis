# Implementation Plan: masjanis-cms

## Overview

Website MasJanis — platform edukasi & penjualan produk TCM/herbal dengan CMS berbasis Supabase.
Stack: vanilla HTML/CSS/JS + Supabase + Netlify. CI/CD via GitHub Actions.

**Status: Production-ready & deployed di masjanis.com**

---

## Completed Tasks

- [x] 1. Setup Supabase Database Schema dan RLS
  - `supabase/schema.sql` — DDL lengkap: products, articles, classes, downloads, contacts, site_settings, testimonials, features, faqs
  - RLS policies: anon SELECT is_active=true, anon INSERT contacts, service_role bypass
  - Migration files: download_count, is_featured, fix_contacts_rls
  - `supabase/README.md` — panduan setup lengkap

- [x] 2. Refactor Besar — Struktur Folder
  - HTML halaman dipindah ke `pages/`
  - CSS dipecah ke `assets/css/pages/` dan `assets/css/admin/`
  - JS admin dipecah ke `admin/js/admin-*.js` (12 file)
  - Assets ke `assets/`

- [x] 3. CMS Admin Panel (`admin/index.html` + `admin/js/`)
  - Auth: login, logout, session persistence
  - Dashboard: stat cards
  - CRUD: Produk (+ is_featured), Artikel, Kelas, Download
  - Pesan: inbox kontak read/unread
  - Pengaturan: hero beranda + page header per halaman (upload/URL) + promo banner kelas & shop
  - Testimoni, Fitur/Keunggulan, FAQ — CRUD lengkap
  - Informasi: tentang kami (+ gambar), kontak, sosmed, Google Maps embed, footer tagline/copyright/column titles
  - Pengguna: buat/hapus admin
  - Quill editor di semua textarea rich text
  - Confirm dialog sebelum simpan/hapus/toggle
  - Color picker bg_class untuk artikel & kelas
  - Category manager untuk produk, artikel, kelas

- [x] 4. Frontend — Halaman Publik
  - `index.html` — featured products slider, hero CMS, about CMS, features CMS, testimonials CMS
  - `pages/shop.html` — produk dari Supabase, filter kategori, payment modal Mayar.id
  - `pages/product-detail.html` — detail produk via slug URL, tabs konten, related products
  - `pages/teori.html` — artikel dari Supabase, filter + search
  - `pages/teori-detail.html` — detail artikel, konten Quill, related articles
  - `pages/kelas.html` — kelas dari Supabase, filter level, promo banner
  - `pages/kelas-detail.html` — detail kelas, enroll button Mayar.id
  - `pages/download.html` — materi dari Supabase, filter, download counter
  - `pages/kontak.html` — form submit ke Supabase, FAQ dari DB, Google Maps embed

- [x] 5. CMS Loader (`assets/js/cms-loader.js`)
  - Singleton Supabase client `window._mjClient`
  - initFeaturedProducts, initShop, initTeori, initKelas, initDownload
  - initTestimonials, initFeatures, initFaq
  - initSiteInfo — footer tagline, copyright, column titles, social links, hero, CTA, promo banner, Google Maps, about section
  - openPaymentModal — konfirmasi → buka tab baru Mayar.id
  - trackDownload — increment download_count via RPC

- [x] 6. Page Header Loader (`assets/js/page-header-loader.js`)
  - Load gambar + tag + title + subtitle per halaman dari site_settings

- [x] 7. CI/CD GitHub Actions
  - `ci.yml` — validasi HTML semua branch
  - `deploy.yml` — deploy ke Netlify saat push main
  - `preview.yml` — preview deploy saat push development

- [x] 8. Payment Integration
  - Mayar.id — buka tab baru (bukan iframe, X-Frame-Options block)
  - URL pattern: `https://masjanis.myr.id/pl/[slug]`
  - 7 produk + 2 kelas sudah diinsert dengan payment_url

- [x] 9. Cleanup & Polish
  - Hapus semua teks template "herbal nusantara" dari HTML dan database
  - Hapus stats bar dari beranda
  - Perbaiki jarak section di semua halaman
  - CSP header: unsafe-eval hanya untuk /admin/ (Quill requirement)
  - Footer fully CMS: tagline, copyright, column titles
  - About section gambar CMS-able
  - Google Maps embed: auto-convert URL format + validasi admin

---

## Known Issues / Pending

- [ ] Google Maps short link `maps.app.goo.gl` tidak bisa di-embed (browser limitation) — user perlu pakai URL embed resmi dari Google Maps → Share → Embed a map
- [ ] Navbar & footer masih hardcode di setiap halaman (kandidat refactor ke web components atau server-side include)
- [ ] sitemap.xml masih hardcode — idealnya di-generate otomatis dari DB

---

## File Structure

```
├── index.html                    → Beranda
├── 404.html
├── pages/                        → Semua halaman publik
├── assets/css/                   → Stylesheet (global + per halaman + admin)
├── assets/js/                    → cms-loader, main, page-header-loader, supabase-config
├── assets/img/                   → Logo
├── admin/index.html              → CMS Admin Panel
├── admin/js/admin-*.js           → 12 modul admin
├── supabase/                     → Schema SQL + migration files
├── .github/workflows/            → CI/CD
├── netlify.toml                  → Headers, cache, CSP
├── _redirects                    → Clean URL routing
└── README.md
```
