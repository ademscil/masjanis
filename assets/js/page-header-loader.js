// page-header-loader.js
// Load gambar page-header dari Supabase site_settings
// Reuse window._mjClient agar tidak ada multiple GoTrueClient instances

(function() {
  document.addEventListener('DOMContentLoaded', async () => {
    if (typeof isConfigured !== 'function' || !isConfigured()) return;

    const pageKey = document.body.dataset.page;
    if (!pageKey) return;

    try {
      // Reuse client dari cms-loader.js jika ada, buat baru jika belum
      const client = window._mjClient || window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
      });
      if (!window._mjClient) window._mjClient = client;

      const { data } = await client
        .from('site_settings')
        .select('value')
        .eq('key', `page_header_${pageKey}`)
        .single();

      if (data?.value) {
        const header = document.querySelector('.page-header');
        if (header) {
          header.style.backgroundImage =
            `linear-gradient(135deg, rgba(45,106,79,0.85) 0%, rgba(64,145,108,0.7) 100%), url('${data.value}')`;
          header.style.backgroundSize = 'cover';
          header.style.backgroundPosition = 'center';
        }
      }
    } catch (e) { /* gagal load, pakai default */ }
  });
})();
