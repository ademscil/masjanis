# Requirements Document

## Introduction

Fitur ini menambahkan CMS Admin Panel berbasis Supabase ke website HerbalNusa yang saat ini bersifat static HTML/CSS/JS. Tujuannya adalah memungkinkan admin mengelola konten (produk, artikel, kelas, download, dan pesan kontak) melalui antarmuka web tanpa menyentuh kode HTML, serta mengintegrasikan halaman-halaman publik agar mengambil data secara dinamis dari database Supabase.

Stack tetap: vanilla HTML/CSS/JS + Supabase JS SDK via CDN. Deploy: Netlify (frontend) + Supabase (backend/database).

---

## Glossary

- **CMS**: Content Management System — antarmuka admin untuk mengelola konten website.
- **Admin_Panel**: Halaman `admin/index.html` yang hanya dapat diakses setelah login admin.
- **Supabase**: Platform backend-as-a-service yang menyediakan database PostgreSQL, autentikasi, dan REST API.
- **Supabase_Client**: Instance Supabase JS SDK yang diinisialisasi dengan URL dan kunci API.
- **Public_Client**: Supabase_Client yang menggunakan `anon key` — digunakan di halaman publik.
- **Admin_Client**: Supabase_Client yang menggunakan `service_role key` — hanya digunakan di Admin_Panel.
- **RLS**: Row Level Security — kebijakan akses data di level baris pada Supabase.
- **Skeleton_Card**: Placeholder animasi yang ditampilkan saat data sedang dimuat dari Supabase.
- **Error_State**: Tampilan pesan kesalahan yang ditampilkan saat koneksi ke Supabase gagal.
- **Empty_State**: Tampilan pesan informatif yang ditampilkan saat tidak ada data yang tersedia.
- **CRUD**: Create, Read, Update, Delete — operasi dasar manajemen data.
- **is_active**: Kolom boolean pada setiap tabel konten yang menentukan apakah item ditampilkan di halaman publik.
- **contacts**: Tabel Supabase yang menyimpan pesan dari form kontak halaman `kontak.html`.
- **supabase-config.js**: File konfigurasi tunggal yang berisi `SUPABASE_URL` dan `SUPABASE_ANON_KEY`.

---

## Requirements

### Requirement 1: Konfigurasi Supabase Terpusat

**User Story:** Sebagai developer, saya ingin satu file konfigurasi terpusat untuk Supabase, agar saya dapat mengganti URL dan kunci API di satu tempat tanpa mengubah banyak file.

#### Acceptance Criteria

1. THE Website SHALL menyediakan file `supabase-config.js` di root project yang berisi variabel `SUPABASE_URL` dan `SUPABASE_ANON_KEY` sebagai placeholder yang dapat diganti.
2. THE Website SHALL memuat `supabase-config.js` sebelum script lain yang membutuhkan Supabase_Client di setiap halaman publik.
3. THE Admin_Panel SHALL menggunakan `service_role key` yang hanya didefinisikan di dalam file admin dan tidak pernah dimuat di halaman publik.
4. IF `SUPABASE_URL` atau `SUPABASE_ANON_KEY` bernilai placeholder atau kosong, THEN THE Public_Client SHALL menampilkan Error_State pada semua grid konten tanpa melempar uncaught exception.

---

### Requirement 2: Skema Database Supabase

**User Story:** Sebagai admin, saya ingin database yang terstruktur dengan baik, agar semua konten website dapat disimpan dan dikelola secara konsisten.

#### Acceptance Criteria

1. THE Database SHALL memiliki tabel `products` dengan kolom: `id` (uuid, primary key), `name` (text, not null), `description` (text), `price` (integer, not null), `original_price` (integer), `category` (text, not null), `emoji` (text), `badge_label` (text), `is_active` (boolean, default true), `payment_url` (text), `created_at` (timestamptz, default now()).
2. THE Database SHALL memiliki tabel `articles` dengan kolom: `id` (uuid, primary key), `title` (text, not null), `excerpt` (text), `category` (text, not null), `read_time` (integer), `published_date` (date), `emoji` (text), `bg_class` (text), `is_active` (boolean, default true), `created_at` (timestamptz, default now()).
3. THE Database SHALL memiliki tabel `classes` dengan kolom: `id` (uuid, primary key), `title` (text, not null), `description` (text), `instructor` (text), `duration_hours` (integer), `video_count` (integer), `level` (text), `price` (integer, not null), `original_price` (integer), `emoji` (text), `bg_class` (text), `is_active` (boolean, default true), `created_at` (timestamptz, default now()).
4. THE Database SHALL memiliki tabel `downloads` dengan kolom: `id` (uuid, primary key), `title` (text, not null), `description` (text), `category` (text, not null), `file_size` (text), `file_url` (text), `emoji` (text), `is_active` (boolean, default true), `created_at` (timestamptz, default now()).
5. THE Database SHALL memiliki tabel `contacts` dengan kolom: `id` (uuid, primary key), `name` (text, not null), `email` (text, not null), `phone` (text), `subject` (text), `message` (text, not null), `is_read` (boolean, default false), `created_at` (timestamptz, default now()).
6. THE Database SHALL menerapkan kebijakan RLS pada setiap tabel sehingga: `anon` role hanya dapat melakukan SELECT pada baris dengan `is_active = true` di tabel `products`, `articles`, `classes`, dan `downloads`; `anon` role hanya dapat melakukan INSERT pada tabel `contacts`; `service_role` memiliki akses penuh (SELECT, INSERT, UPDATE, DELETE) pada semua tabel.

---

### Requirement 3: Login Admin

**User Story:** Sebagai admin, saya ingin halaman login yang aman, agar hanya saya yang dapat mengakses Admin_Panel.

#### Acceptance Criteria

1. THE Admin_Panel SHALL menampilkan form login dengan field email dan password sebelum menampilkan konten admin.
2. WHEN admin memasukkan kredensial yang valid, THE Admin_Panel SHALL mengautentikasi menggunakan Supabase Auth dan menampilkan dashboard admin.
3. IF admin memasukkan kredensial yang tidak valid, THEN THE Admin_Panel SHALL menampilkan pesan kesalahan yang deskriptif tanpa mereset field email.
4. WHILE sesi admin aktif, THE Admin_Panel SHALL mempertahankan status login saat halaman di-refresh menggunakan Supabase session persistence.
5. WHEN admin mengklik tombol logout, THE Admin_Panel SHALL menghapus sesi Supabase dan menampilkan kembali form login.
6. IF pengguna mengakses URL Admin_Panel tanpa sesi aktif, THEN THE Admin_Panel SHALL menampilkan form login dan menyembunyikan semua konten dashboard.

---

### Requirement 4: Dashboard Admin

**User Story:** Sebagai admin, saya ingin dashboard dengan statistik ringkas, agar saya dapat melihat gambaran umum konten website sekaligus.

#### Acceptance Criteria

1. WHEN admin berhasil login, THE Admin_Panel SHALL menampilkan dashboard dengan 5 kartu statistik: total produk aktif, total artikel aktif, total kelas aktif, total download aktif, dan jumlah pesan belum dibaca.
2. THE Admin_Panel SHALL menampilkan navigasi sidebar atau tab untuk berpindah antara: Dashboard, Produk, Artikel, Kelas, Download, dan Pesan.
3. WHEN admin mengklik item navigasi, THE Admin_Panel SHALL menampilkan panel yang sesuai tanpa memuat ulang halaman.
4. THE Admin_Panel SHALL menampilkan nama atau email admin yang sedang login di area header.

---

### Requirement 5: CRUD Produk

**User Story:** Sebagai admin, saya ingin mengelola produk di toko, agar konten shop.html selalu up-to-date tanpa mengubah HTML.

#### Acceptance Criteria

1. THE Admin_Panel SHALL menampilkan daftar semua produk dari tabel `products` dalam bentuk tabel dengan kolom: nama, kategori, harga, status aktif, dan aksi (edit, hapus, toggle aktif).
2. WHEN admin mengklik tombol tambah produk, THE Admin_Panel SHALL menampilkan form dengan field: nama, deskripsi, harga, harga asli, kategori (dropdown: suplemen/minuman/perawatan/paket), emoji, badge label, URL pembayaran, dan toggle is_active.
3. WHEN admin mengisi form dan mengklik simpan, THE Admin_Panel SHALL menyimpan produk baru ke tabel `products` dan memperbarui daftar produk.
4. WHEN admin mengklik edit pada produk, THE Admin_Panel SHALL menampilkan form yang sama dengan data produk yang sudah terisi.
5. WHEN admin mengklik hapus pada produk, THE Admin_Panel SHALL menampilkan konfirmasi sebelum menghapus produk dari tabel `products`.
6. WHEN admin mengklik toggle aktif pada produk, THE Admin_Panel SHALL memperbarui nilai `is_active` produk tersebut di database secara langsung.
7. IF operasi CRUD gagal karena kesalahan jaringan atau database, THEN THE Admin_Panel SHALL menampilkan pesan kesalahan yang deskriptif tanpa menutup form.

---

### Requirement 6: CRUD Artikel

**User Story:** Sebagai admin, saya ingin mengelola artikel teori herbal, agar konten teori.html dapat diperbarui tanpa menyentuh kode.

#### Acceptance Criteria

1. THE Admin_Panel SHALL menampilkan daftar semua artikel dari tabel `articles` dengan kolom: judul, kategori, tanggal terbit, status aktif, dan aksi.
2. WHEN admin mengklik tambah artikel, THE Admin_Panel SHALL menampilkan form dengan field: judul, excerpt, kategori (dropdown: tanaman-obat/ramuan/fitokimia/holistik/jamu/modern), waktu baca (menit), tanggal terbit, emoji, bg_class (dropdown: bg1–bg6), dan toggle is_active.
3. WHEN admin menyimpan artikel baru, THE Admin_Panel SHALL menyimpan data ke tabel `articles` dan memperbarui daftar.
4. WHEN admin mengklik edit artikel, THE Admin_Panel SHALL menampilkan form dengan data artikel yang sudah terisi.
5. WHEN admin mengklik hapus artikel, THE Admin_Panel SHALL menampilkan konfirmasi sebelum menghapus dari tabel `articles`.
6. WHEN admin mengklik toggle aktif artikel, THE Admin_Panel SHALL memperbarui nilai `is_active` artikel tersebut secara langsung.

---

### Requirement 7: CRUD Kelas

**User Story:** Sebagai admin, saya ingin mengelola kelas online, agar konten kelas.html dapat diperbarui tanpa menyentuh kode.

#### Acceptance Criteria

1. THE Admin_Panel SHALL menampilkan daftar semua kelas dari tabel `classes` dengan kolom: judul, instruktur, level, harga, status aktif, dan aksi.
2. WHEN admin mengklik tambah kelas, THE Admin_Panel SHALL menampilkan form dengan field: judul, deskripsi, instruktur, durasi (jam), jumlah video, level (dropdown: pemula/menengah/lanjutan), harga, harga asli, emoji, bg_class (dropdown: bg1–bg6), dan toggle is_active.
3. WHEN admin menyimpan kelas baru, THE Admin_Panel SHALL menyimpan data ke tabel `classes` dan memperbarui daftar.
4. WHEN admin mengklik edit kelas, THE Admin_Panel SHALL menampilkan form dengan data kelas yang sudah terisi.
5. WHEN admin mengklik hapus kelas, THE Admin_Panel SHALL menampilkan konfirmasi sebelum menghapus dari tabel `classes`.
6. WHEN admin mengklik toggle aktif kelas, THE Admin_Panel SHALL memperbarui nilai `is_active` kelas tersebut secara langsung.

---

### Requirement 8: CRUD Download

**User Story:** Sebagai admin, saya ingin mengelola materi download, agar konten download.html dapat diperbarui tanpa menyentuh kode.

#### Acceptance Criteria

1. THE Admin_Panel SHALL menampilkan daftar semua item download dari tabel `downloads` dengan kolom: judul, kategori, ukuran file, status aktif, dan aksi.
2. WHEN admin mengklik tambah download, THE Admin_Panel SHALL menampilkan form dengan field: judul, deskripsi, kategori (dropdown: ebook/panduan/infografis/video), ukuran file, URL file, emoji, dan toggle is_active.
3. WHEN admin menyimpan download baru, THE Admin_Panel SHALL menyimpan data ke tabel `downloads` dan memperbarui daftar.
4. WHEN admin mengklik edit download, THE Admin_Panel SHALL menampilkan form dengan data download yang sudah terisi.
5. WHEN admin mengklik hapus download, THE Admin_Panel SHALL menampilkan konfirmasi sebelum menghapus dari tabel `downloads`.
6. WHEN admin mengklik toggle aktif download, THE Admin_Panel SHALL memperbarui nilai `is_active` item tersebut secara langsung.

---

### Requirement 9: Manajemen Pesan Kontak

**User Story:** Sebagai admin, saya ingin melihat dan mengelola pesan dari form kontak, agar tidak ada pesan pengunjung yang terlewat.

#### Acceptance Criteria

1. THE Admin_Panel SHALL menampilkan daftar semua pesan dari tabel `contacts` diurutkan dari yang terbaru, dengan kolom: nama, email, subjek, tanggal, status baca, dan aksi lihat.
2. WHEN admin mengklik lihat pada pesan, THE Admin_Panel SHALL menampilkan detail lengkap pesan termasuk nama, email, telepon, subjek, dan isi pesan.
3. WHEN admin membuka detail pesan yang belum dibaca, THE Admin_Panel SHALL memperbarui nilai `is_read` menjadi `true` secara otomatis.
4. THE Admin_Panel SHALL menampilkan indikator visual (misalnya badge atau warna berbeda) untuk membedakan pesan yang belum dibaca dari yang sudah dibaca.
5. WHEN admin mengklik hapus pesan, THE Admin_Panel SHALL menampilkan konfirmasi sebelum menghapus dari tabel `contacts`.

---

### Requirement 10: Integrasi Frontend — shop.html

**User Story:** Sebagai pengunjung, saya ingin melihat produk yang dikelola admin, agar informasi produk selalu akurat dan terkini.

#### Acceptance Criteria

1. WHEN halaman `shop.html` dimuat, THE Public_Client SHALL mengambil semua produk dengan `is_active = true` dari tabel `products` dan merendernya sebagai kartu produk.
2. THE Public_Client SHALL menampilkan Skeleton_Card selama data produk sedang dimuat.
3. IF pengambilan data produk gagal, THEN THE Public_Client SHALL menampilkan Error_State dengan pesan "Gagal memuat produk. Silakan coba lagi." di area grid produk.
4. IF tidak ada produk aktif di database, THEN THE Public_Client SHALL menampilkan Empty_State dengan pesan "Belum ada produk tersedia." di area grid produk.
5. WHEN data produk berhasil dimuat, THE Public_Client SHALL mempertahankan fungsionalitas filter tab (semua/suplemen/minuman/perawatan/paket) berdasarkan kolom `category`.
6. WHEN pengunjung mengklik tombol "Beli Sekarang" pada produk yang memiliki `payment_url`, THE Public_Client SHALL membuka modal pembayaran dengan iframe yang mengarah ke `payment_url` tersebut.

---

### Requirement 11: Integrasi Frontend — teori.html

**User Story:** Sebagai pengunjung, saya ingin membaca artikel herbal yang dikelola admin, agar konten selalu segar dan relevan.

#### Acceptance Criteria

1. WHEN halaman `teori.html` dimuat, THE Public_Client SHALL mengambil semua artikel dengan `is_active = true` dari tabel `articles` diurutkan berdasarkan `published_date` terbaru dan merendernya sebagai kartu artikel.
2. THE Public_Client SHALL menampilkan Skeleton_Card selama data artikel sedang dimuat.
3. IF pengambilan data artikel gagal, THEN THE Public_Client SHALL menampilkan Error_State di area grid artikel.
4. IF tidak ada artikel aktif, THEN THE Public_Client SHALL menampilkan Empty_State di area grid artikel.
5. WHEN data artikel berhasil dimuat, THE Public_Client SHALL mempertahankan fungsionalitas filter tab berdasarkan kolom `category` dan fungsionalitas search berdasarkan teks kartu artikel.

---

### Requirement 12: Integrasi Frontend — kelas.html

**User Story:** Sebagai pengunjung, saya ingin melihat kelas yang tersedia, agar saya dapat mendaftar kelas yang sesuai kebutuhan.

#### Acceptance Criteria

1. WHEN halaman `kelas.html` dimuat, THE Public_Client SHALL mengambil semua kelas dengan `is_active = true` dari tabel `classes` dan merendernya sebagai kartu kelas.
2. THE Public_Client SHALL menampilkan Skeleton_Card selama data kelas sedang dimuat.
3. IF pengambilan data kelas gagal, THEN THE Public_Client SHALL menampilkan Error_State di area grid kelas.
4. IF tidak ada kelas aktif, THEN THE Public_Client SHALL menampilkan Empty_State di area grid kelas.
5. WHEN data kelas berhasil dimuat, THE Public_Client SHALL mempertahankan fungsionalitas filter tab berdasarkan kolom `level` (pemula/menengah/lanjutan).

---

### Requirement 13: Integrasi Frontend — download.html

**User Story:** Sebagai pengunjung, saya ingin mengunduh materi herbal yang dikelola admin, agar saya mendapatkan file yang valid dan terkini.

#### Acceptance Criteria

1. WHEN halaman `download.html` dimuat, THE Public_Client SHALL mengambil semua item dengan `is_active = true` dari tabel `downloads` dan merendernya sebagai kartu download.
2. THE Public_Client SHALL menampilkan Skeleton_Card selama data download sedang dimuat.
3. IF pengambilan data download gagal, THEN THE Public_Client SHALL menampilkan Error_State di area grid download.
4. IF tidak ada item download aktif, THEN THE Public_Client SHALL menampilkan Empty_State di area grid download.
5. WHEN data download berhasil dimuat, THE Public_Client SHALL mempertahankan fungsionalitas filter tab berdasarkan kolom `category` (ebook/panduan/infografis/video).
6. WHEN pengunjung mengklik tombol unduh pada item yang memiliki `file_url`, THE Public_Client SHALL membuka `file_url` di tab baru.

---

### Requirement 14: Integrasi Frontend — kontak.html

**User Story:** Sebagai pengunjung, saya ingin mengirim pesan melalui form kontak, agar pesan saya tersimpan dan dapat dibaca admin.

#### Acceptance Criteria

1. WHEN pengunjung mengisi dan mengirim form kontak, THE Public_Client SHALL menyimpan data (nama, email, telepon, subjek, pesan) ke tabel `contacts` menggunakan `anon key`.
2. WHEN penyimpanan pesan berhasil, THE Public_Client SHALL menampilkan pesan sukses dan mereset form, konsisten dengan perilaku yang sudah ada.
3. IF penyimpanan pesan gagal karena kesalahan jaringan atau validasi, THEN THE Public_Client SHALL menampilkan pesan kesalahan yang deskriptif tanpa mereset form.
4. THE Public_Client SHALL memvalidasi bahwa field nama, email, dan pesan tidak kosong sebelum mengirim ke Supabase.

---

### Requirement 15: Integrasi Frontend — index.html

**User Story:** Sebagai pengunjung, saya ingin melihat produk unggulan di beranda, agar saya mendapat gambaran produk terbaik HerbalNusa.

#### Acceptance Criteria

1. WHEN halaman `index.html` dimuat, THE Public_Client SHALL mengambil maksimal 4 produk dengan `is_active = true` dari tabel `products` dan merendernya di section produk unggulan beranda.
2. THE Public_Client SHALL menampilkan Skeleton_Card selama data produk unggulan sedang dimuat.
3. IF pengambilan data gagal atau tidak ada produk aktif, THEN THE Public_Client SHALL menyembunyikan section produk unggulan tanpa menampilkan error yang mengganggu tampilan beranda.

---

### Requirement 16: Loading, Error, dan Empty States

**User Story:** Sebagai pengunjung, saya ingin mendapat umpan balik visual yang jelas saat konten sedang dimuat atau tidak tersedia, agar pengalaman browsing tetap nyaman.

#### Acceptance Criteria

1. THE Public_Client SHALL menampilkan minimal 3 Skeleton_Card dengan animasi pulse/shimmer di setiap grid konten sebelum data selesai dimuat.
2. THE Skeleton_Card SHALL memiliki dimensi dan layout yang menyerupai kartu konten asli untuk menghindari layout shift.
3. WHEN data berhasil dimuat, THE Public_Client SHALL mengganti semua Skeleton_Card dengan kartu konten asli.
4. THE Error_State SHALL menampilkan ikon, pesan deskriptif dalam Bahasa Indonesia, dan tombol "Coba Lagi" yang memicu ulang pengambilan data.
5. THE Empty_State SHALL menampilkan ikon dan pesan informatif dalam Bahasa Indonesia yang menjelaskan bahwa belum ada konten tersedia.
6. WHEN pengunjung mengklik tombol "Coba Lagi" pada Error_State, THE Public_Client SHALL mencoba kembali pengambilan data dari Supabase.
