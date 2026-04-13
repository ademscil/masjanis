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

  // Jika semua 0 dan ini pertama kali load, retry sekali setelah 800ms
  if (allZero && !loadDashboardStats._retried) {
    loadDashboardStats._retried = true;
    setTimeout(() => {
      loadDashboardStats._retried = false;
      loadDashboardStats();
    }, 800);
  }
}
