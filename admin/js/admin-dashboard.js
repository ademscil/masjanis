// ===== ADMIN DASHBOARD =====

async function loadDashboardStats() {
  const configs = [
    { id: 'statProducts',  table: 'products',  filter: { col: 'is_active', val: true  } },
    { id: 'statArticles',  table: 'articles',  filter: { col: 'is_active', val: true  } },
    { id: 'statClasses',   table: 'classes',   filter: { col: 'is_active', val: true  } },
    { id: 'statDownloads', table: 'downloads', filter: { col: 'is_active', val: true  } },
    { id: 'statUnread',    table: 'contacts',  filter: { col: 'is_read',   val: false } },
  ];

  let allZero = true;
  for (const { id, table, filter } of configs) {
    const el = document.getElementById(id)?.querySelector('.stat-number');
    if (!el) continue;
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id', { count: 'exact' })
        .eq(filter.col, filter.val);
      if (error) {
        console.warn(`[dashboard] ${table}:`, error.message);
        el.textContent = '0';
      } else {
        const count = data?.length ?? 0;
        el.textContent = count;
        if (count > 0) allZero = false;
      }
    } catch (e) {
      console.warn(`[dashboard] ${table} exception:`, e);
      el.textContent = '0';
    }
  }

  // Load visitor stats dari page_views
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
    const todayStart    = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const [res30d, resToday] = await Promise.all([
      supabase.from('page_views').select('id', { count: 'exact' }).gte('created_at', thirtyDaysAgo),
      supabase.from('page_views').select('id', { count: 'exact' }).gte('created_at', todayStart),
    ]);

    const el30d   = document.getElementById('statVisitors')?.querySelector('.stat-number');
    const elToday = document.getElementById('statVisitorsToday')?.querySelector('.stat-number');
    if (el30d)   el30d.textContent   = res30d.data?.length   ?? 0;
    if (elToday) elToday.textContent = resToday.data?.length ?? 0;
    if ((res30d.data?.length ?? 0) > 0) allZero = false;
  } catch(e) {
    console.warn('[dashboard] page_views:', e);
  }

  // Jika semua 0 dan ini pertama kali load, retry sekali setelah 800ms
  if (allZero && !loadDashboardStats._retried) {
    loadDashboardStats._retried = true;
    setTimeout(() => {
      loadDashboardStats._retried = false;
      loadDashboardStats();
    }, 800);
  }
}
