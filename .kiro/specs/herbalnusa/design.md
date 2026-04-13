# Design – HerbalNusa Website

## Stack
- **HTML5** — semantic markup, multi-page (MPA)
- **CSS3** — custom properties, grid, flexbox, animations
- **Vanilla JS** — ES6+, no framework, no build step
- **Hosting** — Netlify (free tier, static)

---

## Struktur File

```
/
├── index.html          Beranda
├── teori.html          Teori Herbal
├── kelas.html          List Kelas
├── shop.html           Toko + Payment Modal
├── download.html       Download Center
├── kontak.html         Kontak + FAQ
├── 404.html            Error page
├── styles.css          Shared stylesheet
├── main.js             Shared JavaScript
├── netlify.toml        Deploy config + security headers
├── _redirects          URL routing
├── robots.txt          SEO
└── sitemap.xml         SEO
```

---

## Design System

### Color Palette (CSS Variables)
```css
--green-dark:  #2d6a4f   /* Primary — navbar, buttons, headings */
--green-mid:   #40916c   /* Secondary — hover states, gradients */
--green-light: #74c69d   /* Accent — decorative elements */
--green-pale:  #d8f3dc   /* Background tint — badges, icons */
--gold:        #d4a017   /* Highlight — CTA buttons, prices */
--gold-light:  #f0c040   /* Gold hover / hero accent */
--text-dark:   #1a1a2e   /* Body text */
--text-mid:    #4a4a6a   /* Secondary text */
--text-light:  #7a7a9a   /* Placeholder, meta */
--white:       #ffffff
--off-white:   #f8f9fa   /* Section alt background */
--border:      #e0e0e0
```

### Typography
- **Headings**: Playfair Display (serif) — 400, 600, 700
- **Body**: Inter (sans-serif) — 400, 500, 600, 700
- Base size: 16px, fluid headings via `clamp()`

### Spacing & Shape
- Border radius: `--radius: 12px`, `--radius-sm: 8px`
- Section padding: `5rem 2rem` (desktop), `3.5rem 1.25rem` (mobile)
- Card shadow: `0 4px 20px rgba(0,0,0,0.08)` → hover `0 8px 32px rgba(0,0,0,0.14)`

### Buttons
| Class | Style |
|---|---|
| `.btn-primary` | Hijau gelap, hover hijau mid |
| `.btn-outline` | Border hijau, hover fill |
| `.btn-gold` | Emas, hover emas terang |
| `.btn-white` | Putih, hover pale green |
| `.btn-sm` | Padding lebih kecil |

### Badges
`.badge-green`, `.badge-gold`, `.badge-blue`, `.badge-red`, `.badge-purple`

---

## Arsitektur JavaScript (main.js)

### Modul-modul dalam satu file:

```
1. Navbar scroll effect
   └── toggle class .scrolled saat scrollY > 20

2. Hamburger menu
   ├── toggle .open pada hamburger + mobile-menu
   ├── tutup saat link diklik
   └── tutup saat klik di luar (stopPropagation pada hamburger)

3. Active nav link
   └── cocokkan pathname dengan href, tambah class .active

4. Fade-in on scroll
   └── IntersectionObserver, threshold 0.12, stagger 80ms per item

5. Filter tabs
   ├── Resolusi target grid via data-target="#id" atau findFilterGrid()
   ├── findFilterGrid() — walk nextElementSibling, lalu parent
   └── Toggle display '' / 'none' pada [data-category] items

6. Topic chips (teori.html)
   └── Map label → filter value, trigger .filter-tab.click()

7. Search filter (teori.html)
   ├── Input kosong → restore tab aktif
   └── Ada query → filter .searchable-card berdasarkan textContent

8. Modal
   ├── [data-modal] trigger → tambah .open + lock body scroll
   ├── .modal-close → removeAttribute('onclick') + closeAllModals()
   ├── Backdrop click → closeAllModals()
   └── Escape key → closeAllModals()

9. Contact form
   ├── Guard data-bound untuk cegah double-binding
   ├── Submit → loading state → reset → show #formSuccess
   └── formSuccess hilang setelah 5 detik

10. Smooth scroll
    └── a[href^="#"] → scrollIntoView smooth (skip href="#")
```

### Resolusi Filter Grid
Problem: `nextElementSibling` tidak reliable karena ada elemen lain (search bar, promo banner, stats row) di antara `.filter-tabs` dan grid target.

Solusi: `data-target` attribute pada setiap `.filter-tabs`:
```html
<div class="filter-tabs" data-target="#articleGrid">
<div class="filter-tabs" data-target="#kelasGrid">
<div class="filter-tabs" data-target=".shop-grid">
<div class="filter-tabs" data-target=".download-grid">
```
Fallback: `findFilterGrid()` walk DOM jika `data-target` tidak ada.

---

## Layout per Halaman

### index.html
```
Navbar
Hero (min-height: 92vh, bg gradient + Unsplash image)
Stats Bar (4 kolom, bg green-dark)
Features (grid-3)
About (grid-2: image | text)
Testimonials (grid-3)
CTA Banner
Footer (grid: 2fr 1fr 1fr 1fr)
```

### teori.html
```
Navbar
Page Header
Topics Section (6 chips, bg green-dark)
Section:
  Search Bar
  Filter Tabs [data-target="#articleGrid"]
  Article Grid (grid-3) #articleGrid
Footer
```

### kelas.html
```
Navbar
Page Header
Section:
  Promo Banner
  Filter Tabs [data-target="#kelasGrid"]
  Kelas Grid (grid-3) #kelasGrid
Footer
```

### shop.html
```
Navbar
Page Header
Section:
  Filter Tabs [data-target=".shop-grid"]
  Shop Grid (grid-4) .shop-grid
8× Payment Modal (modal-overlay)
Footer
```

### download.html
```
Navbar
Page Header
Section:
  Stats Row (grid-4)
  Filter Tabs [data-target=".download-grid"]
  Download Grid (grid-4) .download-grid
Newsletter CTA
Footer
```

### kontak.html
```
Navbar
Page Header
Section (kontak-layout: 1fr 1.6fr):
  Left: Info Cards + Social Grid
  Right: Form Card
Map Section (placeholder)
FAQ Section (grid-2)
Footer
```

---

## Responsive Breakpoints

| Breakpoint | Perubahan |
|---|---|
| ≤1200px | shop-grid: 4→3 col, download-grid: 4→3 col |
| ≤1024px | grid-4: 4→2 col, kelas-grid: 3→2 col, article-grid: 3→2 col, footer: 4→2 col |
| ≤900px | shop-grid: 3→2 col, download-grid: 3→2 col, kontak-layout: 2→1 col |
| ≤768px | nav-links hidden, hamburger visible, grid-3/2: →1 col, section padding berkurang |
| ≤600px | kelas-grid: 2→1 col, article-grid: 2→1 col |
| ≤480px | grid-4: 2→1 col, shop-grid: 2→1 col, download-grid: 2→1 col |

---

## Modal Design (Shop)

```
.modal-overlay (fixed, inset 0, rgba backdrop, z-index 2000)
  └── .modal (max-width 600px, max-height 90vh, scroll)
        ├── .modal-header (judul produk + tombol ✕)
        └── .modal-body (padding 0)
              ├── .payment-iframe-wrap
              │     └── iframe ATAU placeholder div
              └── .payment-info (🔒 security note)
```

Animasi masuk: `scale(0.9) translateY(20px)` → `scale(1) translateY(0)`, 0.3s ease.
