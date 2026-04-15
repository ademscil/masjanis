/**
 * cms-loader.js — MasJanis
 * Loader terpusat untuk semua halaman customer.
 * Satu Supabase client (window._mjClient) dipakai bersama semua modul.
 */
(function () {
  'use strict';

  // ── Supabase client (singleton) ───────────────────────────────
  function getClient() {
    if (!window._mjClient && typeof isConfigured === 'function' && isConfigured()) {
      window._mjClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
      });
    }
    return window._mjClient || null;
  }

  // ── HTML helpers ──────────────────────────────────────────────
  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Strip HTML dan truncate untuk preview card
  function plainText(html, maxLen = 120) {
    const plain = String(html || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return plain.length > maxLen ? plain.slice(0, maxLen).trimEnd() + '...' : plain;
  }

  // ── Map URL normalizer ────────────────────────────────────────
  // Konversi berbagai format URL Google Maps ke format embed iframe.
  // Juga kembalikan originalUrl untuk tombol "Buka di Maps".
  function normalizeMapUrl(url) {
    if (!url) return null;
    url = url.trim();

    // Sudah format embed — langsung pakai
    if (url.includes('google.com/maps/embed')) return url;

    // Ekstrak koordinat dari URL biasa: @lat,lng atau ?ll=lat,lng
    const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ||
                       url.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) {
      const lat = coordMatch[1];
      const lng = coordMatch[2];
      // Gunakan /maps/search/ embed — tidak butuh API key, tampilkan pin merah
      return `https://www.google.com/maps?q=${lat},${lng}&output=embed`;
    }

    // Ekstrak nama place dari URL /maps/place/NamaLokasi/
    const placeMatch = url.match(/maps\/place\/([^/@?]+)/);
    if (placeMatch) {
      const place = decodeURIComponent(placeMatch[1]).replace(/\+/g, ' ');
      return `https://www.google.com/maps?q=${encodeURIComponent(place)}&output=embed`;
    }

    // Ekstrak ?q= atau &q=
    const qMatch = url.match(/[?&]q=([^&]+)/);
    if (qMatch) {
      return `https://www.google.com/maps?q=${qMatch[1]}&output=embed`;
    }

    // Short link atau format tidak dikenal — tidak bisa dikonversi client-side
    return null;
  }

  // ── Slug helper ───────────────────────────────────────────────
  function slugify(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i').replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u').replace(/[ñ]/g, 'n')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/[\s]+/g, '-')
      .replace(/-+/g, '-');
  }

  // Expose globally so detail pages can use it
  window._mjSlugify = slugify;

  function loadingHtml() {
    return `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-light);">⏳ Memuat data...</div>`;
  }

  function emptyHtml(msg) {
    return `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-light);">🌿 ${esc(msg)}</div>`;
  }

  function errHtml(msg, retryFn) {
    return `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:#be123c;">
      ⚠️ ${esc(msg)}<br>
      <button class="btn btn-outline btn-sm" onclick="${retryFn}" style="margin-top:1rem;">Coba Lagi</button>
    </div>`;
  }

  function reattachFilters(grid) {
    const tabGroup = document.querySelector('.filter-tabs');
    if (!tabGroup || !grid) return;
    tabGroup.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        tabGroup.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const f = tab.dataset.filter;
        grid.querySelectorAll('[data-category]').forEach(el => {
          el.style.display = (f === 'semua' || el.dataset.category === f) ? '' : 'none';
        });
      });
    });
  }

  // ── Fetch wrapper ─────────────────────────────────────────────
  function loadGrid(gridId, queryFn, renderFn, retryFnName) {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    const db = getClient();
    if (!db) { grid.innerHTML = emptyHtml('Database belum dikonfigurasi.'); return; }

    grid.innerHTML = loadingHtml();
    queryFn(db)
      .then(({ data, error }) => {
        if (error) throw error;
        if (!data?.length) { grid.innerHTML = emptyHtml('Belum ada konten tersedia.'); return; }
        grid.innerHTML = data.map(renderFn).join('');
        reattachFilters(grid);
        grid.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
      })
      .catch(e => {
        console.error(gridId, e);
        grid.innerHTML = errHtml(e.message, retryFnName + '()');
      });
  }

  // ── Featured Products (index.html) ───────────────────────────
  function initFeaturedProducts() {
    loadGrid(
      'featuredProductsGrid',
      db => db.from('products').select('*').eq('is_active', true).eq('is_featured', true).order('created_at', { ascending: false }).limit(4),
      renderFeaturedProduct,
      'initFeaturedProducts'
    );
  }

  function renderFeaturedProduct(p) {
    const price  = p.price ? 'Rp ' + Number(p.price).toLocaleString('id-ID') : 'Gratis';
    const orig   = p.original_price ? 'Rp ' + Number(p.original_price).toLocaleString('id-ID') : '';
    const badge  = p.badge_label ? `<span class="product-badge">${esc(p.badge_label)}</span>` : '';
    const bgMap  = { suplemen: 'bg1', minuman: 'bg2', perawatan: 'bg5', paket: 'bg3' };
    const bg     = bgMap[p.category] || 'bg1';
    const imgEl  = p.image_url
      ? `<img src="${p.image_url}" alt="${esc(p.name)}" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;display:block;">`
      : `<span style="font-size:3.5rem;">${p.emoji || '🌿'}</span>`;
    const detailUrl = `/product-detail/${slugify(p.name)}`;
    const desc = plainText(p.description, 80);

    return `
      <a href="${detailUrl}" class="product-card fade-in" data-category="${p.category}" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;">
        <div class="product-img ${bg}" style="position:relative;overflow:hidden;">${imgEl}${badge}</div>
        <div class="product-body">
          <h3>${esc(p.name)}</h3>
          <p>${esc(desc)}</p>
          <div class="product-footer">
            <div class="product-price">
              ${orig ? `<span class="original">${orig}</span>` : ''}${price}
            </div>
            <span class="btn btn-outline btn-sm">Lihat Detail →</span>
          </div>
        </div>
      </a>`;
  }

  // ── Shop ──────────────────────────────────────────────────────
  function initShop() {
    loadGrid(
      'productsGrid',
      db => db.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false }),
      renderProduct,
      'initShop'
    );
  }

  function renderProduct(p) {
    const price  = p.price ? 'Rp ' + Number(p.price).toLocaleString('id-ID') : '';
    const orig   = p.original_price ? 'Rp ' + Number(p.original_price).toLocaleString('id-ID') : '';
    const badge  = p.badge_label ? `<span class="product-badge">${esc(p.badge_label)}</span>` : '';
    const bgMap  = { suplemen: 'bg1', minuman: 'bg2', perawatan: 'bg5', paket: 'bg3' };
    const bg     = bgMap[p.category] || 'bg1';
    const imgEl  = p.image_url
      ? `<img src="${p.image_url}" alt="${esc(p.name)}" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;">`
      : `<span style="font-size:3.5rem;">${p.emoji || '🌿'}</span>`;
    const detailUrl = `/product-detail/${slugify(p.name)}`;

    return `
      <a href="${detailUrl}" class="product-card fade-in" data-category="${p.category}" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;">
        <div class="product-img ${bg}" style="position:relative;overflow:hidden;">${imgEl}${badge}</div>
        <div class="product-body">
          <h3>${esc(p.name)}</h3>
          <p>${plainText(p.description)}</p>
          <div class="product-footer">
            <div class="product-price">
              ${orig ? `<span class="original">${orig}</span>` : ''}${price}
            </div>
            <span class="btn btn-primary btn-sm">Lihat Detail</span>
          </div>
        </div>
      </a>`;
  }

  window.openPaymentModal = function (p) {
    const name = (p.emoji || '') + ' ' + (p.name || p.title || '');
    const payUrl = p.payment_url;

    if (!payUrl) {
      // Tidak ada URL pembayaran
      const modal  = document.getElementById('paymentModal');
      const nameEl = document.getElementById('modalProductName');
      const wrap   = document.getElementById('modalIframeWrap');
      if (nameEl) nameEl.textContent = name;
      if (wrap) wrap.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--text-light);">Link pembayaran belum tersedia.</div>`;
      if (modal) { modal.classList.add('open'); document.body.style.overflow = 'hidden'; }
      return;
    }

    // Mayar.id tidak support iframe embed — buka di tab baru
    // Tampilkan modal konfirmasi dulu
    const modal  = document.getElementById('paymentModal');
    const nameEl = document.getElementById('modalProductName');
    const wrap   = document.getElementById('modalIframeWrap');
    if (nameEl) nameEl.textContent = name;
    if (wrap) wrap.innerHTML = `
      <div style="text-align:center;padding:2rem 1.5rem;">
        <div style="font-size:3rem;margin-bottom:1rem;">🛒</div>
        <h3 style="font-size:1.1rem;color:var(--text-dark);margin-bottom:0.5rem;">${name}</h3>
        <p style="color:var(--text-mid);font-size:0.9rem;margin-bottom:1.5rem;">
          Anda akan diarahkan ke halaman pembayaran aman Mayar.id
        </p>
        <a href="${payUrl}" target="_blank" rel="noopener noreferrer"
           class="btn btn-primary"
           style="display:inline-flex;align-items:center;gap:0.5rem;justify-content:center;width:100%;padding:0.9rem;"
           onclick="document.getElementById('paymentModal').classList.remove('open');document.body.style.overflow='';">
          💳 Lanjut ke Pembayaran
        </a>
        <p style="color:var(--text-light);font-size:0.78rem;margin-top:1rem;">
          🔒 Pembayaran diproses oleh Mayar.id — platform pembayaran terpercaya
        </p>
      </div>`;
    if (modal) { modal.classList.add('open'); document.body.style.overflow = 'hidden'; }
  };

  // ── Teori ─────────────────────────────────────────────────────
  function initTeori() {
    loadGrid(
      'articlesGrid',
      db => db.from('articles').select('*').eq('is_active', true).order('published_date', { ascending: false, nullsFirst: false }),
      renderArticle,
      'initTeori'
    );
  }

  function renderArticle(a) {
    const bgMap  = { 'tanaman-obat':'bg1', 'ramuan':'bg2', 'fitokimia':'bg3', 'holistik':'bg4', 'jamu':'bg5', 'modern':'bg6' };
    const catMap = { 'tanaman-obat':'Tanaman Obat', 'ramuan':'Ramuan', 'fitokimia':'Fitokimia', 'holistik':'Holistik', 'jamu':'Jamu', 'modern':'Modern' };
    const bg     = a.bg_class || bgMap[a.category] || 'bg1';
    // Label kategori: pakai map jika ada, fallback ke capitalize raw value
    const catLabel = catMap[a.category] || a.category.replace(/-/g,' ').replace(/\b\w/g, c => c.toUpperCase());
    const time = a.read_time ? `<span>⏱ ${a.read_time} menit baca</span>` : '';
    const date = a.published_date
      ? `<span>📅 ${new Date(a.published_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>`
      : '';
    const imgEl = a.image_url
      ? `<img src="${a.image_url}" alt="${esc(a.title)}" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;display:block;">`
      : `<span style="font-size:3.5rem;">${a.emoji || '🌿'}</span>`;

    // Strip HTML tags dari excerpt untuk tampilan card (plain text)
    const plainExcerpt = plainText(a.excerpt);

    return `
      <a href="/teori-detail/${slugify(a.title)}" class="article-card searchable-card fade-in visible" data-category="${a.category}" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;">
        <div class="article-img ${bg}" style="position:relative;overflow:hidden;">${imgEl}</div>
        <div class="article-body">
          <span class="badge badge-green">${esc(catLabel)}</span>
          <h3>${esc(a.title)}</h3>
          <p class="article-excerpt">${esc(plainExcerpt)}</p>
          <div class="article-meta">${time}${date}</div>
          <span class="btn btn-outline btn-sm" style="margin-top:auto;">Baca Selengkapnya</span>
        </div>
      </a>`;
  }

  // ── Kelas ─────────────────────────────────────────────────────
  function initKelas() {
    loadGrid(
      'classesGrid',
      db => db.from('classes').select('*').eq('is_active', true).order('created_at', { ascending: false }),
      renderKelas,
      'initKelas'
    );
  }

  function renderKelas(c) {
    const bgMap = { 'pemula':'bg1', 'menengah':'bg2', 'lanjutan':'bg3' };
    const bg    = c.bg_class || bgMap[c.level] || 'bg1';
    const price = c.price ? 'Rp ' + Number(c.price).toLocaleString('id-ID') : '';
    const orig  = c.original_price ? 'Rp ' + Number(c.original_price).toLocaleString('id-ID') : '';
    const lvl   = { pemula: 'Pemula', menengah: 'Menengah', lanjutan: 'Lanjutan' }[c.level]
                  || c.level.replace(/-/g,' ').replace(/\b\w/g, ch => ch.toUpperCase());
    const imgEl = c.image_url
      ? `<img src="${c.image_url}" alt="${esc(c.title)}" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;">`
      : `<span style="font-size:4rem;">${c.emoji || '🎓'}</span>`;

    return `
      <a href="/kelas-detail/${slugify(c.title)}" class="kelas-card fade-in" data-category="${c.level}" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;">
        <div class="kelas-img ${bg}" style="position:relative;overflow:hidden;">
          ${imgEl}
          <span class="level-badge level-${c.level}">${lvl}</span>
        </div>
        <div class="kelas-body">
          <h3>${esc(c.title)}</h3>
          <div class="kelas-meta">
            ${c.instructor ? `<span>👤 ${esc(c.instructor)}</span>` : ''}
            ${c.duration_hours ? `<span>⏱ ${c.duration_hours} jam</span>` : ''}
            ${c.video_count ? `<span>🎬 ${c.video_count} video</span>` : ''}
          </div>
          <p class="kelas-desc">${plainText(c.description)}</p>
          <div class="kelas-footer">
            <div class="kelas-price">
              ${orig ? `<span class="original">${orig}</span>` : ''}${price}
            </div>
            <span class="btn btn-primary btn-sm">Lihat Detail</span>
          </div>
        </div>
      </a>`;
  }

  // ── Download ──────────────────────────────────────────────────
  function initDownload() {
    loadGrid(
      'downloadsGrid',
      db => db.from('downloads').select('*').eq('is_active', true).order('created_at', { ascending: false }),
      renderDownload,
      'initDownload'
    );
    initDownloadStats();
  }

  function initDownloadStats() {
    const db = getClient();
    if (!db) return;
    const totalEl    = document.getElementById('dlStatTotal');
    const kategoriEl = document.getElementById('dlStatKategori');
    const unduhanEl  = document.getElementById('dlStatUnduhan');
    if (!totalEl && !kategoriEl && !unduhanEl) return;

    db.from('downloads').select('id, category, download_count').eq('is_active', true)
      .then(({ data }) => {
        if (!data) return;
        if (totalEl) totalEl.textContent = data.length;
        if (kategoriEl) {
          const uniqueCategories = new Set(data.map(d => d.category)).size;
          kategoriEl.textContent = uniqueCategories;
        }
        if (unduhanEl) {
          const total = data.reduce((sum, d) => sum + (d.download_count || 0), 0);
          unduhanEl.textContent = total >= 1000
            ? (total / 1000).toFixed(1).replace('.0', '') + 'K+'
            : total.toString();
        }
      });
  }

  function renderDownload(d) {
    const btn = d.file_url
      ? `<a href="${d.file_url}" target="_blank" rel="noopener noreferrer" class="btn-download"
           onclick="trackDownload('${d.id}')">⬇ Unduh</a>`
      : `<button class="btn-download" disabled style="opacity:.5;cursor:not-allowed;">Segera Hadir</button>`;

    return `
      <div class="download-card ${d.category} fade-in" data-category="${d.category}">
        <div class="download-icon">${d.emoji || '📄'}</div>
        <h3>${esc(d.title)}</h3>
        <p>${plainText(d.description, 100)}</p>
        <div class="download-meta">
          ${d.file_size ? `<span class="size">📦 ${d.file_size}</span>` : '<span></span>'}
          ${btn}
        </div>
      </div>`;
  }

  // ── Site info (footer dinamis) ────────────────────────────────
  function initSiteInfo() {
    const db = getClient();
    if (!db) return;

    db.from('site_settings').select('key,value')
      .then(({ data }) => {
        if (!data) return;
        const s = Object.fromEntries(data.map(r => [r.key, r.value]));

        const set = (attr, text, href) => {
          // Sanitasi href: ganti relative .html ke clean path
          if (href && !href.startsWith('http') && !href.startsWith('/') && !href.startsWith('#') && !href.startsWith('tel:') && !href.startsWith('mailto:')) {
            href = '/' + href.replace(/\.html$/, '');
          }
          document.querySelectorAll(`[data-site="${attr}"]`).forEach(el => {
            if (el.tagName === 'A') {
              if (href) el.href = href;
              if (text) el.textContent = text;
            } else {
              // Gunakan innerHTML untuk field yang bisa berisi HTML (subtitle, deskripsi)
              if (text) {
                const htmlFields = ['hero_subtitle','cta_subtitle','features_subtitle','testimonials_subtitle'];
                if (htmlFields.includes(attr)) {
                  el.innerHTML = text;
                } else {
                  el.textContent = text;
                }
              }
            }
          });
        };

        // Kontak & footer
        if (s.address)   set('address',   '📍 ' + s.address);
        if (s.phone)     set('phone',     '📞 ' + s.phone,     'tel:' + s.phone.replace(/\s/g, ''));
        if (s.email)     set('email',     '✉️ ' + s.email,     'mailto:' + s.email);
        if (s.hours)     set('hours',     '⏰ ' + s.hours);
        if (s.instagram) set('instagram', null, s.instagram);
        if (s.youtube)   set('youtube',   null, s.youtube);
        if (s.facebook)  set('facebook',  null, s.facebook);
        if (s.tiktok)    set('tiktok',    null, s.tiktok);

        // Stats bar (index)
        ['stat1_num','stat1_label','stat2_num','stat2_label',
         'stat3_num','stat3_label','stat4_num','stat4_label'].forEach(k => {
          if (s[k]) set(k, s[k]);
        });

        // Download stats
        ['dl_stat1_num','dl_stat1_label','dl_stat2_num','dl_stat2_label',
         'dl_stat3_num','dl_stat3_label','dl_stat4_num','dl_stat4_label'].forEach(k => {
          if (s[k]) set(k, s[k]);
        });

        // Hero text
        if (s.hero_tag)      set('hero_tag',      s.hero_tag);
        if (s.hero_title)    set('hero_title',     s.hero_title);
        if (s.hero_subtitle) set('hero_subtitle',  s.hero_subtitle);
        if (s.hero_btn1_text) set('hero_btn1_text', s.hero_btn1_text, s.hero_btn1_url);
        if (s.hero_btn2_text) set('hero_btn2_text', s.hero_btn2_text, s.hero_btn2_url);

        // Features section title
        if (s.features_title)    set('features_title',    s.features_title);
        if (s.features_subtitle) set('features_subtitle', s.features_subtitle);

        // Testimonials section title
        if (s.testimonials_title)    set('testimonials_title',    s.testimonials_title);
        if (s.testimonials_subtitle) set('testimonials_subtitle', s.testimonials_subtitle);

        // CTA banner
        if (s.cta_title)    set('cta_title',    s.cta_title);
        if (s.cta_subtitle) set('cta_subtitle', s.cta_subtitle);
        if (s.cta_btn1_text) set('cta_btn1_text', s.cta_btn1_text, s.cta_btn1_url);
        if (s.cta_btn2_text) set('cta_btn2_text', s.cta_btn2_text, s.cta_btn2_url);

        // Promo banner (kelas.html & shop.html)
        const promoBanner = document.getElementById('promoBanner');
        if (promoBanner) {
          const page = document.body.dataset.page;
          const isShop  = page === 'shop';
          const active  = isShop ? s.promo_shop_active  : s.promo_active;
          const title   = isShop ? s.promo_shop_title   : s.promo_title;
          const subtitle= isShop ? s.promo_shop_subtitle: s.promo_subtitle;

          if (active === 'false') {
            promoBanner.style.display = 'none';
          } else {
            promoBanner.style.display = '';
            if (title)    set('promo_title',    title);
            if (subtitle) set('promo_subtitle', subtitle);
          }
        }

        // Map embed (kontak.html)
        const mapWrap = document.getElementById('mapEmbed');
        if (mapWrap && s.map_embed_url) {
          const rawUrl   = s.map_embed_url;
          const embedUrl = normalizeMapUrl(rawUrl);
          // URL untuk tombol "Buka di Maps" — pakai URL asli agar langsung ke titik
          const openUrl  = rawUrl.includes('google.com/maps/embed')
            ? rawUrl.replace('output=embed', '').replace('/embed?', '?')
            : rawUrl;
          if (embedUrl) {
            mapWrap.innerHTML = `
              <iframe src="${embedUrl}" width="100%" height="380"
                style="border:0;border-radius:var(--radius);"
                allowfullscreen loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"></iframe>
              <div style="text-align:right;margin-top:0.4rem;">
                <a href="${openUrl}" target="_blank" rel="noopener"
                   style="font-size:0.78rem;color:var(--green-mid);text-decoration:none;">
                  🗺️ Buka di Google Maps →
                </a>
              </div>`;
          } else {
            // Short link — tidak bisa di-embed, tampilkan tombol buka langsung
            mapWrap.innerHTML = `
              <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.75rem;padding:2.5rem;color:var(--text-light);text-align:center;">
                <span style="font-size:2.5rem;">🗺️</span>
                <p style="margin:0;font-size:0.9rem;">Klik tombol di bawah untuk melihat lokasi kami.</p>
                <a href="${rawUrl}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">
                  🗺️ Buka di Google Maps →
                </a>
              </div>`;
          }
        }

        // Footer tagline
        if (s.footer_tagline) {
          document.querySelectorAll('[data-site="footer_tagline"]').forEach(el => {
            el.textContent = s.footer_tagline;
          });
        }

        // Footer copyright
        if (s.footer_copyright) {
          document.querySelectorAll('[data-site="footer_copyright"]').forEach(el => {
            el.textContent = s.footer_copyright;
          });
        }

        // Footer column titles
        ['footer_col2_title','footer_col3_title','footer_col4_title'].forEach(k => {
          if (s[k]) document.querySelectorAll(`[data-site="${k}"]`).forEach(el => { el.textContent = s[k]; });
        });

        // Trust badges (product-detail.html)
        const trustWrap = document.getElementById('trustBadges');
        if (trustWrap && s.trust_badges) {
          try {
            const badges = JSON.parse(s.trust_badges);
            if (Array.isArray(badges) && badges.length) {
              trustWrap.innerHTML = badges.map(b => `<div class="trust-badge">${esc(b)}</div>`).join('');
            }
          } catch(e) {}
        }

        // About section (index.html)
        const aboutTitle = document.getElementById('aboutTitle');
        const aboutBody  = document.getElementById('aboutBody');
        const aboutImg   = document.getElementById('aboutImg');
        if (aboutTitle && s.about_title) aboutTitle.textContent = s.about_title;
        if (aboutBody  && s.about_body)  aboutBody.innerHTML    = s.about_body;
        if (aboutImg   && s.about_image_url) {
          aboutImg.innerHTML = `<img src="${s.about_image_url}" alt="Tentang Kami" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;display:block;border-radius:var(--radius);">`;
          aboutImg.style.position = 'relative';
          aboutImg.style.overflow = 'hidden';
          aboutImg.style.fontSize = '0'; // sembunyikan emoji fallback
        }
      });
  }

  // ── Testimonials ──────────────────────────────────────────────
  function initTestimonials() {
    const grid = document.getElementById('testimonialsGrid');
    if (!grid) return;
    const db = getClient();
    if (!db) return;

    db.from('testimonials').select('*').eq('is_active', true).order('sort_order')
      .then(({ data }) => {
        if (!data?.length) return; // fallback ke hardcode
        grid.innerHTML = data.map(t => {
          const stars = '★'.repeat(t.rating) + '☆'.repeat(5 - t.rating);
          const initials = t.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
          const avatar = t.avatar
            ? `<img src="${t.avatar}" alt="${esc(t.name)}" style="width:46px;height:46px;border-radius:50%;object-fit:cover;">`
            : `<div class="author-avatar">${initials}</div>`;
          return `
            <div class="testimonial-card fade-in visible">
              <div class="stars">${stars}</div>
              <p class="testimonial-text">${t.content}</p>
              <div class="testimonial-author">
                ${avatar}
                <div class="author-info">
                  <strong>${esc(t.name)}</strong>
                  <span>${esc(t.location || '')}</span>
                </div>
              </div>
            </div>`;
        }).join('');
      });
  }

  // ── Features ──────────────────────────────────────────────────
  function initFeatures() {
    const grid = document.getElementById('featuresGrid');
    if (!grid) return;
    const db = getClient();
    if (!db) return;

    db.from('features').select('*').eq('is_active', true).order('sort_order')
      .then(({ data }) => {
        if (!data?.length) return; // fallback ke hardcode
        grid.innerHTML = data.map(f => `
          <div class="feature-card fade-in visible">
            <div class="feature-icon">${f.icon}</div>
            <h3>${esc(f.title)}</h3>
            <p>${f.description}</p>
          </div>`).join('');
      });
  }

  // ── Track download click ──────────────────────────────────────
  window.trackDownload = function(id) {
    const db = getClient();
    if (!db || !id) return;
    db.rpc('increment_download_count', { download_id: id }).then(() => {
      // Update counter di UI jika ada
      const unduhanEl = document.getElementById('dlStatUnduhan');
      if (unduhanEl) {
        const current = parseInt(unduhanEl.textContent.replace(/[^0-9]/g, '')) || 0;
        const next = current + 1;
        unduhanEl.textContent = next >= 1000
          ? (next / 1000).toFixed(1).replace('.0', '') + 'K+'
          : next.toString();
      }
    });
  };

  // ── Active nav ────────────────────────────────────────────────
  function setActiveNav() {
    const pageName = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
      const href = (link.getAttribute('href') || '').replace('.html', '').replace(/^\//, '') || 'index';
      if (href === pageName) link.classList.add('active');
    });
  }

  // ── FAQ ──────────────────────────────────────────────────────
  function initFaq() {
    const grid = document.getElementById('faqGrid');
    if (!grid) return;
    const db = getClient();
    if (!db) return;

    db.from('faqs').select('*').eq('is_active', true).order('sort_order')
      .then(({ data }) => {
        if (!data?.length) return; // fallback ke hardcode
        grid.innerHTML = data.map(f => `
          <div class="faq-item fade-in visible">
            <h4>${esc(f.question)}</h4>
            <p>${f.answer}</p>
          </div>`).join('');
      });
  }

  // ── Page View Tracker ────────────────────────────────────────
  function trackPageView() {
    const db = getClient();
    if (!db) return;
    if (window.location.pathname.startsWith('/admin')) return;
    const page     = window.location.pathname || '/';
    const referrer = document.referrer ? (() => { try { return new URL(document.referrer).hostname; } catch(e) { return null; } })() : null;
    db.from('page_views').insert({ page, referrer }).then(() => {});
  }

  // ── Visitor Counter (beranda) ─────────────────────────────────
  function initVisitorCounter() {
    const el = document.getElementById('visitorCount');
    if (!el) return;
    const db = getClient();
    if (!db) return;
    db.from('page_views').select('id', { count: 'exact', head: true })
      .then(({ count }) => {
        if (count == null) return;
        el.textContent = count >= 1000
          ? (count / 1000).toFixed(1).replace('.0', '') + 'K+'
          : count.toLocaleString('id-ID');
      });
  }

  // ── Auto-init ─────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    setActiveNav();
    initSiteInfo();
    initFeaturedProducts();
    initShop();
    initTeori();
    initKelas();
    initDownload();
    initTestimonials();
    initFeatures();
    initFaq();
    trackPageView();
    initVisitorCounter();
  });

})();
