// page-header-loader.js
// Load gambar, tag, judul, subtitle page-header dari Supabase site_settings

(function() {
  document.addEventListener('DOMContentLoaded', async () => {
    if (typeof isConfigured !== 'function' || !isConfigured()) return;

    const pageKey = document.body.dataset.page;
    if (!pageKey) return;

    try {
      const client = window._mjClient || window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
      });
      if (!window._mjClient) window._mjClient = client;

      // Ambil semua keys untuk halaman ini sekaligus
      const keys = [
        `page_header_${pageKey}`,
        `page_header_${pageKey}_tag`,
        `page_header_${pageKey}_title`,
        `page_header_${pageKey}_subtitle`,
      ];

      const { data } = await client
        .from('site_settings')
        .select('key,value')
        .in('key', keys);

      if (!data?.length) return;
      const map = Object.fromEntries(data.map(r => [r.key, r.value]));

      const header = document.querySelector('.page-header');
      if (!header) return;

      // Set background image
      const imgUrl = map[`page_header_${pageKey}`];
      if (imgUrl) {
        header.style.backgroundImage =
          `linear-gradient(135deg, rgba(45,106,79,0.85) 0%, rgba(64,145,108,0.7) 100%), url('${imgUrl}')`;
        header.style.backgroundSize = 'cover';
        header.style.backgroundPosition = 'center';
      }

      // Set tag
      const tag = map[`page_header_${pageKey}_tag`];
      if (tag) {
        let tagEl = header.querySelector('.page-header-tag');
        if (!tagEl) {
          tagEl = document.createElement('div');
          tagEl.className = 'page-header-tag';
          header.insertBefore(tagEl, header.firstChild);
        }
        tagEl.textContent = tag;
      }

      // Set judul
      const title = map[`page_header_${pageKey}_title`];
      if (title) {
        const h1 = header.querySelector('h1');
        if (h1) h1.textContent = title;
      }

      // Set subtitle
      const subtitle = map[`page_header_${pageKey}_subtitle`];
      if (subtitle) {
        const p = header.querySelector('p');
        if (p) p.innerHTML = subtitle;
      }

    } catch (e) { /* gagal load, pakai default */ }
  });
})();
