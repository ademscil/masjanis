# Requirements – HerbalNusa Website

## Overview
Website penjualan obat herbal Indonesia berbasis static HTML/CSS/JS, siap deploy ke Netlify (gratis). Terinspirasi dari meandqi.com namun fokus pada produk herbal nusantara.

---

## Functional Requirements

### FR-01 · Navigasi Global
- Navbar sticky di semua halaman dengan logo dan 6 menu: Beranda, Teori, List Kelas, Shop, Download Center, Kontak
- Hamburger menu responsif untuk mobile (≤768px)
- Active state otomatis berdasarkan halaman aktif
- Navbar menampilkan shadow saat di-scroll

### FR-02 · Beranda (index.html)
- Hero section dengan headline, subheadline, dan 2 CTA button
- Stats bar: jumlah produk, pelanggan, artikel, tahun pengalaman
- 3 feature card: Produk Alami, Berbasis Riset, Terpercaya
- About section dengan daftar keunggulan
- 3 testimonial card dengan nama dan asal kota
- CTA banner menuju Shop dan List Kelas
- Footer lengkap dengan navigasi, produk, kontak, dan social links

### FR-03 · Teori (teori.html)
- Topic chips (6 topik) yang terhubung ke filter artikel
- Search bar real-time untuk mencari artikel berdasarkan teks
- Filter tabs: Semua, Tanaman Obat, Ramuan Tradisional, Fitokimia, Pengobatan Holistik, Jamu Nusantara, Herbal Modern
- Grid artikel (min. 9 artikel) dengan badge kategori, tanggal, estimasi baca, dan tombol "Baca Selengkapnya"
- Filter dan search bekerja secara independen

### FR-04 · List Kelas (kelas.html)
- Promo banner dengan kode diskon
- Filter tabs: Semua, Pemula, Menengah, Lanjutan
- Grid kelas (min. 8 kelas) dengan: level badge, nama instruktur, durasi, jumlah video, harga coret + harga diskon, tombol "Daftar Sekarang"

### FR-05 · Shop (shop.html)
- Filter tabs: Semua, Suplemen, Minuman, Perawatan, Paket
- Grid produk (min. 8 produk) dengan: badge kategori, nama, deskripsi, harga, tombol "Beli Sekarang"
- Setiap tombol "Beli Sekarang" membuka modal pembayaran
- Modal berisi iframe placeholder dengan komentar `<!-- GANTI URL INI DENGAN LINK PEMBAYARAN ANDA -->`
- Modal dapat ditutup via: tombol ✕, klik backdrop, atau tekan Escape
- Body scroll terkunci saat modal terbuka

### FR-06 · Download Center (download.html)
- Stats row: total materi, total unduhan, gratis, jumlah kategori
- Filter tabs: Semua, E-Book, Panduan, Infografis, Video
- Grid download (min. 12 item) dengan: ikon, badge, judul, deskripsi, ukuran file, tombol unduh
- Warna aksen berbeda per kategori (hijau/emas/biru/merah)
- Newsletter signup form di bagian bawah

### FR-07 · Kontak (kontak.html)
- 4 info card: Alamat, Telepon & WhatsApp, Email, Jam Operasional
- 6 social media item: Instagram, Facebook, YouTube, TikTok, Telegram, Twitter/X
- Form kontak: Nama, Email, Telepon, Subjek (dropdown), Pesan — semua tervalidasi HTML5
- Pesan sukses muncul setelah submit, form di-reset, pesan hilang setelah 5 detik
- Placeholder Google Maps embed
- FAQ grid (6 pertanyaan, 2 kolom)

### FR-08 · Halaman 404
- Halaman error branded dengan tombol kembali ke Beranda dan ke Shop

---

## Non-Functional Requirements

### NFR-01 · Performa
- Tidak ada framework JS (vanilla only) — load time minimal
- Google Fonts di-preconnect
- Cache-Control header via netlify.toml: CSS/JS immutable 1 tahun, HTML no-cache

### NFR-02 · Responsivitas
- Mobile-first, breakpoint: 480px, 768px, 900px, 1024px, 1200px
- Hamburger menu aktif di ≤768px
- Grid menyesuaikan kolom sesuai lebar layar

### NFR-03 · SEO
- Meta description, keywords, og:title, og:description di setiap halaman
- Favicon emoji SVG
- robots.txt dan sitemap.xml
- Canonical URL

### NFR-04 · Keamanan
- Security headers via netlify.toml: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy

### NFR-05 · Aksesibilitas
- Semua tombol punya label yang jelas
- Kontras warna memadai (teks gelap di background terang)
- Navigasi keyboard berfungsi (Escape menutup modal)

### NFR-06 · Deploy
- Static files — tidak butuh server/backend
- Siap deploy ke Netlify via drag & drop atau GitHub integration
- `_redirects` untuk clean URL dan custom 404
