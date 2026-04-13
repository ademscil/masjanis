# Tasks – HerbalNusa Website

## Status Legend
- ✅ Done
- 🔧 Fixed (bug ditemukan & diperbaiki)
- ⏳ Pending (butuh input dari owner)

---

## Phase 1 — Scaffolding & Shared Assets

| # | Task | Status |
|---|---|---|
| 1.1 | Buat `styles.css` dengan CSS variables, reset, navbar, buttons, cards, badges, grid, footer, modal, form, animasi, responsive | ✅ |
| 1.2 | Buat `main.js` dengan semua shared functionality | ✅ |
| 1.3 | Setup `netlify.toml` dengan security headers dan cache control | ✅ |
| 1.4 | Buat `_redirects` untuk clean URL dan 404 routing | ✅ |
| 1.5 | Buat `robots.txt` dan `sitemap.xml` | ✅ |

---

## Phase 2 — Halaman HTML

| # | Task | Status |
|---|---|---|
| 2.1 | `index.html` — Hero, Stats, Features, About, Testimonials, CTA, Footer | ✅ |
| 2.2 | `teori.html` — Topic chips, Search, Filter tabs, Article grid | ✅ |
| 2.3 | `kelas.html` — Promo banner, Filter tabs, Kelas grid | ✅ |
| 2.4 | `shop.html` — Filter tabs, Product grid, 8 Payment modals | ✅ |
| 2.5 | `download.html` — Stats row, Filter tabs, Download grid, Newsletter | ✅ |
| 2.6 | `kontak.html` — Info cards, Social grid, Form, Map placeholder, FAQ | ✅ |
| 2.7 | `404.html` — Branded error page | ✅ |

---

## Phase 3 — SEO & Meta

| # | Task | Status |
|---|---|---|
| 3.1 | Meta description, keywords, og:title, og:description di semua halaman | ✅ |
| 3.2 | Favicon emoji SVG di semua halaman | ✅ |
| 3.3 | Canonical URL di index.html | ✅ |

---

## Phase 4 — Bug Fixes

| # | Bug | Root Cause | Fix | Status |
|---|---|---|---|---|
| 4.1 | Filter tabs tidak bekerja di `teori.html` | `nextElementSibling` mengarah ke `.search-bar`, bukan `.article-grid` | Tambah `data-target="#articleGrid"` + fungsi `findFilterGrid()` di JS | 🔧 |
| 4.2 | Filter tabs tidak bekerja di `kelas.html` | `nextElementSibling` mengarah ke `.promo-banner` | Tambah `data-target="#kelasGrid"` | 🔧 |
| 4.3 | Filter tabs tidak bekerja di `download.html` | `nextElementSibling` mengarah ke `.stats-row` | Tambah `data-target=".download-grid"` | 🔧 |
| 4.4 | Topic chips di `teori.html` tidak berfungsi | Tidak ada event listener | Tambah handler di `main.js` dengan label→filter map | 🔧 |
| 4.5 | Double submit handler di `kontak.html` | Inline `<script>` + `main.js` keduanya attach `submit` listener | Hapus inline script, gunakan `data-bound` guard di `main.js` | 🔧 |
| 4.6 | Modal close button konflik | `onclick` inline + JS listener double-fire | `removeAttribute('onclick')` sebelum attach listener | 🔧 |
| 4.7 | Body scroll tidak terkunci saat modal buka | Tidak ada `overflow: hidden` | Tambah `document.body.style.overflow = 'hidden'` saat open, restore saat close | 🔧 |
| 4.8 | Search kosong tidak restore filter | Langsung hide semua card | Cek `q === ''` → trigger tab aktif | 🔧 |
| 4.9 | Hamburger bisa tertutup oleh outside-click listener sendiri | Tidak ada `stopPropagation` | Tambah `e.stopPropagation()` pada hamburger click | 🔧 |

---

## Phase 5 — Kustomisasi Owner (Pending)

| # | Task | Instruksi | Status |
|---|---|---|---|
| 5.1 | Pasang link pembayaran di Shop | Buka `shop.html`, cari `<!-- GANTI URL INI DENGAN LINK PEMBAYARAN ANDA -->` di setiap modal, ganti `div.payment-iframe-placeholder` dengan `<iframe src="URL_ANDA">` | ⏳ |
| 5.2 | Pasang Google Maps di Kontak | Buka `kontak.html`, cari `<!-- GANTI DENGAN EMBED GOOGLE MAPS -->`, ganti `div.map-wrap` dengan `<iframe src="EMBED_URL_MAPS">` | ⏳ |
| 5.3 | Update nama brand | Ganti semua "HerbalNusa" di semua file HTML | ⏳ |
| 5.4 | Update nomor telepon & email | Cari `+62 812-3456-7890` dan `info@herbalnusa.id` di semua file | ⏳ |
| 5.5 | Update alamat | Cari `Jl. Raya Herbal No. 88` di `kontak.html` | ⏳ |
| 5.6 | Update URL sitemap & canonical | Ganti `herbalnusa.netlify.app` dengan domain aktual di `sitemap.xml`, `robots.txt`, dan meta tag di `index.html` | ⏳ |
| 5.7 | Tambah link social media | Ganti `div.social-link` dengan `<a href="URL_SOSMED">` di footer dan kontak | ⏳ |
| 5.8 | Tambah file download nyata | Ganti `href="#"` pada tombol unduh di `download.html` dengan URL file aktual | ⏳ |
| 5.9 | Tambah link daftar kelas | Ganti `href="#"` pada tombol "Daftar Sekarang" di `kelas.html` dengan URL platform kelas | ⏳ |

---

## Cara Deploy

```
1. Buka netlify.com → daftar/login
2. Dashboard → drag & drop seluruh folder project
3. Dapat URL: https://nama-random.netlify.app
4. (Opsional) Site settings → Domain management → Add custom domain
```

Atau via GitHub:
```
1. Push folder ke repo GitHub baru
2. Netlify → Add new site → Import from GitHub → pilih repo → Deploy
3. Setiap push otomatis update website
```
