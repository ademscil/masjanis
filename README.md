# MasJanis — Website Herbal

Website penjualan produk herbal dengan CMS berbasis Supabase. Deploy di Netlify.

**Stack:** Vanilla HTML/CSS/JS + Supabase (database & storage) + Netlify (hosting)

---

## Struktur Project

```
├── index.html                        → Beranda
├── shop.html                         → Toko produk
├── teori.html                        → Artikel teori herbal
├── kelas.html                        → Daftar kelas online
├── download.html                     → Download center
├── kontak.html                       → Halaman kontak
├── 404.html                          → Halaman error
│
├── styles.css                        → Stylesheet utama
├── main.js                           → Navbar, modal, filter, scroll
├── cms-loader.js                     → Load konten dari Supabase (shop, teori, kelas, download)
├── page-header-loader.js             → Load gambar page header dari Supabase
├── supabase-config.js                → Konfigurasi Supabase (URL + anon key)
│
├── admin/
│   └── index.html                    → CMS Admin Panel
│
├── supabase/
│   ├── schema.sql                    → DDL lengkap database
│   ├── fix.sql                       → ALTER TABLE untuk kolom image_url
│   └── README.md                     → Panduan setup Supabase
│
├── gambarlogo-removebg-preview.png   → Logo MasJanis (transparent)
├── netlify.toml                      → Konfigurasi Netlify (headers, cache)
├── _redirects                        → URL routing Netlify
├── robots.txt                        → SEO robots
└── sitemap.xml                       → SEO sitemap
```

---

## Setup

### 1. Supabase
Ikuti panduan lengkap di `supabase/README.md`:
1. Buat project Supabase
2. Jalankan `supabase/schema.sql` di SQL Editor
3. Jalankan `supabase/fix.sql` untuk kolom image_url
4. Buat bucket storage bernama `masjanis` (Public: ON)
5. Isi kredensial di `supabase-config.js` dan `admin/index.html`

### 2. Deploy ke Netlify
- **Drag & Drop:** Buka [app.netlify.com](https://app.netlify.com) → drag folder project
- **Via GitHub:** Connect repo → build settings kosong → publish directory `.`

---

## CMS Admin

Akses di `/admin` — login dengan akun Supabase Auth.

Panel yang tersedia:
- **Dashboard** — statistik konten
- **Produk** — CRUD produk toko
- **Artikel** — CRUD artikel teori
- **Kelas** — CRUD kelas online
- **Download** — CRUD materi download
- **Pesan** — inbox form kontak
- **Pengaturan** — gambar hero & page header
- **Informasi** — alamat, telepon, email, jam, sosmed
- **Pengguna** — manajemen akun admin

---

## Konfigurasi

Edit `supabase-config.js` untuk kredensial publik (anon key).
Edit `admin/index.html` bagian script untuk service_role key.
