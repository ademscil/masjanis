# Setup Supabase untuk MasJanis CMS

Ikuti langkah-langkah berikut untuk menghubungkan website MasJanis dengan Supabase.

---

## Langkah 1: Buat Project Supabase

1. Buka [https://supabase.com](https://supabase.com) dan login (atau daftar jika belum punya akun).
2. Klik tombol **New Project**.
3. Isi detail project:
   - **Name**: `masjanis-cms` (atau nama lain sesuai keinginan)
   - **Database Password**: buat password yang kuat dan simpan di tempat aman
   - **Region**: pilih yang paling dekat dengan lokasi Anda (misalnya `Southeast Asia`)
4. Klik **Create new project** dan tunggu hingga project selesai dibuat (sekitar 1–2 menit).

---

## Langkah 2: Jalankan Schema SQL

1. Di dashboard Supabase, buka menu **SQL Editor** di sidebar kiri.
2. Klik **New query**.
3. Buka file `supabase/schema.sql` dari project ini, salin seluruh isinya.
4. Tempel (paste) ke SQL Editor Supabase.
5. Klik tombol **Run** (atau tekan `Ctrl+Enter` / `Cmd+Enter`).
6. Pastikan tidak ada pesan error. Jika berhasil, Anda akan melihat pesan `Success. No rows returned`.
7. Verifikasi tabel berhasil dibuat: buka menu **Table Editor** di sidebar — Anda seharusnya melihat 5 tabel: `products`, `articles`, `classes`, `downloads`, `contacts`.

---

## Langkah 3: Ambil Kredensial API

1. Di dashboard Supabase, buka menu **Project Settings** → **API**.
2. Catat dua nilai berikut:
   - **Project URL** — contoh: `https://xyzxyzxyz.supabase.co`
   - **anon / public key** — kunci panjang yang dimulai dengan `eyJ...`
3. Buka file `supabase-config.js` di root project ini.
4. Ganti nilai placeholder:
   ```js
   const SUPABASE_URL = 'https://xyzxyzxyz.supabase.co';   // ganti dengan Project URL Anda
   const SUPABASE_ANON_KEY = 'eyJ...';                      // ganti dengan anon key Anda
   ```
5. Simpan file.

> **Penting:** `anon key` aman untuk diekspos di frontend karena dilindungi oleh RLS. Jangan pernah menaruh `service_role key` di file publik.

---

## Langkah 4: Buat User Admin via Supabase Auth

1. Di dashboard Supabase, buka menu **Authentication** → **Users**.
2. Klik tombol **Add user** → **Create new user**.
3. Isi:
   - **Email**: alamat email admin Anda
   - **Password**: password yang kuat
4. Klik **Create user**.
5. User ini akan digunakan untuk login ke `admin/index.html`.

---

## Langkah 5: Konfigurasi Admin Panel

1. Buka file `admin/index.html`.
2. Temukan bagian konfigurasi Supabase di dalam script:
   ```js
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_SERVICE_KEY = 'YOUR_SERVICE_ROLE_KEY';
   ```
3. Ganti `YOUR_SUPABASE_URL` dengan Project URL yang sama seperti di Langkah 3.
4. Untuk `service_role key`: buka **Project Settings** → **API** → salin nilai **service_role / secret key**.
5. Ganti `YOUR_SERVICE_ROLE_KEY` dengan nilai tersebut.

> **Peringatan:** `service_role key` memiliki akses penuh ke database dan melewati RLS. File `admin/index.html` **tidak boleh** dapat diakses publik tanpa autentikasi.

---

## Langkah 6: Setup Storage Bucket (untuk Upload Gambar & File)

Fitur upload gambar (hero, page header) dan upload file download membutuhkan Supabase Storage.

1. Di dashboard Supabase, buka menu **Storage**.
2. Klik **New bucket**.
3. Isi:
   - **Name**: `images`
   - **Public bucket**: ✅ ON (centang)
4. Klik **Save**.
5. Jalankan bagian SQL Storage di `schema.sql` (bagian paling bawah) di SQL Editor untuk menambahkan policies upload.

Setelah bucket dibuat, fitur upload di panel **Pengaturan** (gambar hero & page header) dan panel **Download** (upload file) akan berfungsi.

---

## Verifikasi Setup

Setelah semua langkah selesai:

- Buka website di browser — halaman `shop.html`, `teori.html`, `kelas.html`, `download.html` seharusnya menampilkan Empty_State (karena database masih kosong).
- Buka `admin/index.html` — seharusnya muncul form login.
- Login dengan email dan password yang dibuat di Langkah 4.
- Tambahkan beberapa produk/artikel melalui admin panel.
- Refresh halaman publik — konten seharusnya muncul.

---

## Troubleshooting

| Masalah | Kemungkinan Penyebab | Solusi |
|---|---|---|
| Halaman publik menampilkan Error_State | `supabase-config.js` belum diisi | Isi `SUPABASE_URL` dan `SUPABASE_ANON_KEY` |
| Admin panel tidak bisa login | Email/password salah atau user belum dibuat | Cek menu Authentication → Users di Supabase |
| Data tidak muncul di halaman publik | RLS memblokir akses | Pastikan `schema.sql` sudah dijalankan dengan benar |
| Error saat menjalankan schema.sql | Tabel sudah ada sebelumnya | Tambahkan `DROP TABLE IF EXISTS` sebelum `CREATE TABLE`, atau hapus tabel lama via Table Editor |
