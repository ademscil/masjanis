# MasJanis — Website & CMS

Website MasJanis dengan CMS berbasis Supabase. Deploy di Netlify.

**Stack:** Vanilla HTML/CSS/JS · Supabase (database & storage) · Netlify (hosting + CI/CD)

---

## Struktur Project

```
├── index.html                          → Beranda
├── 404.html                            → Halaman error
├── pages/
│   ├── shop.html                       → Toko produk
│   ├── product-detail.html             → Detail produk (slug URL)
│   ├── teori.html                      → Artikel teori
│   ├── teori-detail.html               → Detail artikel (slug URL)
│   ├── kelas.html                      → Daftar kelas online
│   ├── kelas-detail.html               → Detail kelas (slug URL)
│   ├── download.html                   → Download center
│   └── kontak.html                     → Halaman kontak + FAQ + Google Maps
│
├── assets/
│   ├── css/
│   │   ├── styles.css                  → Stylesheet global
│   │   ├── quill-content.css           → Styling konten Quill di halaman publik
│   │   ├── pages/                      → CSS per halaman
│   │   └── admin/admin.css             → CSS admin panel
│   ├── js/
│   │   ├── cms-loader.js               → Load semua konten dari Supabase
│   │   ├── main.js                     → Navbar, modal, animasi
│   │   ├── page-header-loader.js       → Load gambar page header dari CMS
│   │   └── supabase-config.js          → Konfigurasi Supabase (URL + anon key)
│   └── img/
│       └── gambarlogo-removebg-preview.png
│
├── admin/
│   ├── index.html                      → CMS Admin Panel (login + dashboard)
│   └── js/
│       ├── admin-config.js             → Supabase keys + panel titles
│       ├── admin-ui.js                 → Sidebar, toast, confirm dialog, Quill init
│       ├── admin-dashboard.js          → Statistik dashboard
│       ├── admin-products.js           → CRUD produk
│       ├── admin-articles.js           → CRUD artikel
│       ├── admin-classes.js            → CRUD kelas
│       ├── admin-downloads.js          → CRUD download
│       ├── admin-contacts.js           → Inbox pesan kontak
│       ├── admin-content.js            → Testimoni, Fitur, FAQ
│       ├── admin-settings.js           → Pengaturan hero, page header, promo banner
│       └── admin-users.js              → Manajemen akun admin
│
├── supabase/
│   ├── schema.sql                      → DDL lengkap + default data
│   ├── fix_template_text.sql           → Update teks template di site_settings
│   ├── fix_contacts_rls.sql            → RLS policy untuk form kontak
│   ├── migration_download_count.sql    → Tambah kolom download_count
│   ├── migration_featured.sql          → Tambah kolom is_featured di products
│   └── README.md                       → Panduan setup Supabase
│
├── .github/workflows/
│   ├── ci.yml                          → Validasi HTML (push semua branch)
│   ├── deploy.yml                      → Deploy ke Netlify (push main)
│   └── preview.yml                     → Preview deploy (push development)
│
├── netlify.toml                        → Headers, cache, CSP
├── _redirects                          → URL routing Netlify (clean URLs)
├── robots.txt                          → SEO
└── sitemap.xml                         → SEO sitemap
```

---

## Setup

### 1. Supabase
1. Buat project di [supabase.com](https://supabase.com)
2. Jalankan `supabase/schema.sql` di SQL Editor
3. Jalankan migration files sesuai urutan jika diperlukan
4. Buat bucket storage bernama `masjanis` (Public: ON)
5. Isi kredensial di `assets/js/supabase-config.js` (anon key) dan `admin/js/admin-config.js` (service role key)

### 2. Deploy ke Netlify
- Connect repo GitHub → build settings kosong → publish directory `.`
- Set secrets: `NETLIFY_AUTH_TOKEN` dan `NETLIFY_SITE_ID` di GitHub repo settings

---

## CMS Admin

Akses di `/admin` — login dengan akun Supabase Auth.

| Panel | Fungsi |
|---|---|
| Dashboard | Statistik konten |
| Produk | CRUD produk + tandai produk unggulan |
| Artikel | CRUD artikel teori |
| Kelas | CRUD kelas online |
| Download | CRUD materi download |
| Pesan | Inbox form kontak |
| Pengaturan | Hero beranda + page header tiap halaman + promo banner |
| Testimoni | CRUD testimoni |
| Fitur | CRUD kartu keunggulan di beranda |
| FAQ | CRUD FAQ di halaman kontak |
| Informasi | Tentang kami, kontak, sosmed, Google Maps embed, footer |
| Pengguna | Manajemen akun admin |

---

## Workflow Git

```
feature/nama → development → main
```

- Push ke `development` → preview deploy otomatis via GitHub Actions
- Merge ke `main` → deploy production otomatis ke Netlify

---

## Payment

Pembayaran via [Mayar.id](https://masjanis.myr.id) — buka tab baru (bukan iframe).
URL pattern: `https://masjanis.myr.id/pl/[slug-produk]`
