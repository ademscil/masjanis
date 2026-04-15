// ===== ADMIN UI =====

// ===== SHOW / HIDE VIEWS =====
function showLoginView() {
  document.getElementById('loginView').style.display = 'flex';
  document.getElementById('dashboardView').hidden = true;
}

function showDashboardView(user) {
  document.getElementById('loginView').style.display = 'none';
  document.getElementById('dashboardView').hidden = false;

  // Display admin name/email
  const name = user?.user_metadata?.full_name || user?.email || 'Admin';
  document.getElementById('adminName').textContent = name;

  // Update avatar initial
  const avatar = document.querySelector('.user-avatar');
  if (avatar) avatar.textContent = name.charAt(0).toUpperCase();

  // Hanya show dashboard jika belum ada panel aktif
  const activePanel = document.querySelector('.admin-panel:not([hidden])');
  if (!activePanel) {
    showPanel('panelDashboard');
  } else {
    // Panel sudah aktif (misal setelah tab switch) — reload stats jika di dashboard
    const dashPanel = document.getElementById('panelDashboard');
    if (dashPanel && !dashPanel.hidden) {
      setTimeout(() => {
        if (typeof loadDashboardStats === 'function') loadDashboardStats();
      }, 100);
    }
  }
}

// ===== PANEL NAVIGATION =====
function showPanel(panelId) {
  // Hide all panels
  document.querySelectorAll('.admin-panel').forEach(p => { p.hidden = true; });

  // Show target panel
  const target = document.getElementById(panelId);
  if (target) target.hidden = false;

  // Update header title
  const titleEl = document.getElementById('panelTitle');
  if (titleEl) titleEl.textContent = PANEL_TITLES[panelId] || '';

  // Update active nav link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.panel === panelId);
  });

  // Hook for panel data loading
  loadPanelData(panelId);
}

function loadPanelData(panelId) {
  if (panelId === 'panelDashboard') setTimeout(() => {
    if (typeof loadDashboardStats === 'function') loadDashboardStats();
  }, 50);
  if (panelId === 'panelProducts')  { loadProducts(); loadCategoriesFromDB(); }
  if (panelId === 'panelArticles')  { loadArticles(); loadCategoriesFromDB(); }
  if (panelId === 'panelClasses')   { loadClasses(); loadCategoriesFromDB(); }
  if (panelId === 'panelDownloads') { loadDownloads(); loadCategoriesFromDB(); }
  if (panelId === 'panelContacts')  loadContacts();
  if (panelId === 'panelSettings')     loadSettings();
  if (panelId === 'panelTestimonials') loadTestimonials();
  if (panelId === 'panelFeatures')     loadFeatures();
  if (panelId === 'panelFaq')          loadFaqs();
  if (panelId === 'panelInfo')         loadInfo();
  if (panelId === 'panelUsers')        loadUsers();
}

// ===== AUTH: LOGIN =====
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email    = document.getElementById('emailInput').value.trim();
  const password = document.getElementById('passwordInput').value;
  const errorEl  = document.getElementById('loginError');
  const loginBtn = document.getElementById('loginBtn');

  // Clear previous error
  errorEl.textContent = '';
  errorEl.classList.remove('visible');

  loginBtn.disabled = true;
  loginBtn.textContent = 'Memproses...';

  const { data, error } = await authClient.auth.signInWithPassword({ email, password });

  loginBtn.disabled = false;
  loginBtn.textContent = 'Masuk';

  if (error) {
    errorEl.textContent = error.message || 'Login gagal. Periksa email dan password Anda.';
    errorEl.classList.add('visible');
    return;
  }

  if (data?.user) {
    showDashboardView(data.user);
  }
});

// ===== AUTH: LOGOUT =====
async function handleLogout() {
  await authClient.auth.signOut();
  showLoginView();
}

// ===== AUTH: SESSION PERSISTENCE =====
authClient.auth.onAuthStateChange((event, session) => {
  // TOKEN_REFRESHED = hanya refresh token di background, jangan reset UI
  if (event === 'TOKEN_REFRESHED') return;

  if (session?.user) {
    showDashboardView(session.user);
  } else {
    showLoginView();
  }
});

// ===== AUTH: CHECK SESSION ON LOAD =====
// Tunggu DOMContentLoaded agar semua script modul sudah ter-load
document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await authClient.auth.getSession();
  if (session?.user) {
    showDashboardView(session.user);
  } else {
    showLoginView();
  }
});

// ===== TOAST SYSTEM =====
function showToast(message, type = 'success', duration = 3000) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || '✅'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('out');
    setTimeout(() => toast.remove(), 260);
  }, duration);
}

// ===== CUSTOM CONFIRM DIALOG =====
function showConfirm(title, message, onConfirm, icon = '🗑️', okLabel = null) {
  const overlay = document.getElementById('confirmOverlay');
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMessage').textContent = message;
  document.getElementById('confirmIcon').textContent = icon;

  // Label tombol OK dinamis berdasarkan icon/aksi
  const okBtn = document.getElementById('confirmOkBtn');
  if (okLabel) {
    okBtn.textContent = okLabel;
  } else if (icon === '🔴') {
    okBtn.textContent = 'Ya, Nonaktifkan';
    okBtn.style.background = '#b45309';
  } else if (icon === '🟢') {
    okBtn.textContent = 'Ya, Aktifkan';
    okBtn.style.background = '#2d6a4f';
  } else {
    okBtn.textContent = 'Ya, Hapus';
    okBtn.style.background = '#be123c';
  }

  overlay.classList.add('open');

  const cancelBtn = document.getElementById('confirmCancelBtn');
  const close = () => {
    overlay.classList.remove('open');
    okBtn.style.background = '';
  };
  const newOk = okBtn.cloneNode(true);
  newOk.style.background = okBtn.style.background;
  okBtn.parentNode.replaceChild(newOk, okBtn);
  newOk.addEventListener('click', () => { close(); onConfirm(); });
  cancelBtn.onclick = close;
  overlay.onclick = (e) => { if (e.target === overlay) close(); };
}

// ===== UNSAVED CHANGES TRACKING =====
let _formDirty = false;
function markDirty() { _formDirty = true; }
function clearDirty() { _formDirty = false; }

function confirmDiscard(onConfirm) {
  if (!_formDirty) { onConfirm(); return; }
  showConfirm(
    'Buang Perubahan?',
    'Ada perubahan yang belum disimpan. Yakin ingin menutup form ini?',
    () => { clearDirty(); onConfirm(); },
    '⚠️'
  );
}

// ===== CATEGORY / LEVEL MANAGER =====
// Key di site_settings: 'product_categories' dan 'class_levels' (JSON array)
const CAT_DEFAULTS = {
  product: [
    { value: 'suplemen', label: 'Suplemen' },
    { value: 'minuman',  label: 'Minuman'  },
    { value: 'perawatan',label: 'Perawatan'},
    { value: 'paket',    label: 'Paket'    },
  ],
  class: [
    { value: 'pemula',   label: 'Pemula'   },
    { value: 'menengah', label: 'Menengah' },
    { value: 'lanjutan', label: 'Lanjutan' },
  ],
};

async function openCategoryManager(type) {
  const isProduct  = type === 'product';
  const isArticle  = type === 'article';
  const isDownload = type === 'download';
  const selectId   = isProduct ? 'productCategory' : isArticle ? 'articleCategory' : isDownload ? 'downloadCategory' : 'classLevel';
  const settingKey = isProduct ? 'product_categories' : isArticle ? 'article_categories' : isDownload ? 'download_categories' : 'class_levels';
  const title      = isProduct ? 'Kelola Kategori Produk' : isArticle ? 'Kelola Kategori Artikel' : isDownload ? 'Kelola Kategori Download' : 'Kelola Level Kelas';
  const icon       = isProduct ? '🏷️' : isArticle ? '📝' : isDownload ? '📥' : '🎓';

  // Ambil data dari DB atau pakai default dari select saat ini
  let items = [];
  try {
    const { data } = await dataClient.from('site_settings').select('value').eq('key', settingKey).maybeSingle();
    if (data?.value) items = JSON.parse(data.value);
  } catch(e) {}
  if (!items.length) {
    items = Array.from(document.getElementById(selectId).options).map(o => ({ value: o.value, label: o.text }));
  }

  // Hapus modal lama jika ada
  document.getElementById('catManagerOverlay')?.remove();

  const modal = document.createElement('div');
  modal.id = 'catManagerOverlay';
  modal.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;
    display:flex;align-items:center;justify-content:center;padding:1rem;`;

  const renderRows = (list) => list.map((item, idx) => `
    <div style="display:flex;align-items:center;gap:0.6rem;padding:0.5rem 0;border-bottom:1px solid #f0f0f0;" data-idx="${idx}">
      <span style="width:24px;text-align:center;color:#aaa;font-size:0.8rem;flex-shrink:0;">${idx + 1}</span>
      <input type="text" value="${item.label}"
        style="flex:1;padding:0.55rem 0.75rem;border:1.5px solid var(--border);border-radius:6px;font-size:0.875rem;font-family:inherit;outline:none;"
        onfocus="this.style.borderColor='var(--green-mid)'" onblur="this.style.borderColor='var(--border)'"
        onchange="catMgrUpdate(${idx}, this.value)" />
      <button onclick="catMgrDelete(${idx})"
        style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:#fee2e2;color:#be123c;border:none;border-radius:6px;cursor:pointer;font-size:1rem;flex-shrink:0;"
        title="Hapus">✕</button>
    </div>`).join('');

  modal.innerHTML = `
    <div style="background:#fff;border-radius:14px;width:100%;max-width:440px;box-shadow:0 8px 40px rgba(0,0,0,0.2);overflow:hidden;">
      <div style="padding:1.25rem 1.5rem;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;justify-content:space-between;">
        <h3 style="font-size:1rem;font-weight:700;color:var(--text-dark);margin:0;">${icon} ${title}</h3>
        <button onclick="document.getElementById('catManagerOverlay').remove()"
          style="width:28px;height:28px;border:none;background:#f5f5f5;border-radius:50%;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;">✕</button>
      </div>
      <div style="padding:1rem 1.5rem;max-height:300px;overflow-y:auto;" id="catMgrList">
        ${renderRows(items)}
      </div>
      <div style="padding:0.75rem 1.5rem;border-top:1px solid #f0f0f0;display:flex;gap:0.6rem;">
        <input type="text" id="catMgrNewName" placeholder="Tambah nama baru..."
          style="flex:1;padding:0.55rem 0.75rem;border:1.5px solid var(--border);border-radius:6px;font-size:0.875rem;font-family:inherit;outline:none;"
          onfocus="this.style.borderColor='var(--green-mid)'" onblur="this.style.borderColor='var(--border)'"
          onkeydown="if(event.key==='Enter'){catMgrAdd();}" />
        <button onclick="catMgrAdd()"
          style="padding:0.55rem 1rem;background:var(--green-dark);color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:0.875rem;font-weight:600;white-space:nowrap;">
          + Tambah
        </button>
      </div>
      <div style="padding:0.75rem 1.5rem;border-top:1px solid #f0f0f0;display:flex;gap:0.6rem;justify-content:flex-end;">
        <button onclick="document.getElementById('catManagerOverlay').remove()"
          style="padding:0.55rem 1.1rem;background:#f5f5f5;color:var(--text-mid);border:none;border-radius:6px;cursor:pointer;font-size:0.875rem;">
          Batal
        </button>
        <button onclick="catMgrSave()"
          style="padding:0.55rem 1.25rem;background:var(--green-dark);color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:0.875rem;font-weight:600;">
          💾 Simpan
        </button>
      </div>
    </div>`;

  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

  // State
  modal._items    = [...items];
  modal._selectId = selectId;
  modal._settingKey = settingKey;
  modal._renderRows = renderRows;
}

function catMgrUpdate(idx, newLabel) {
  const modal = document.getElementById('catManagerOverlay');
  if (!modal) return;
  modal._items[idx].label = newLabel;
}

function catMgrDelete(idx) {
  const modal = document.getElementById('catManagerOverlay');
  if (!modal) return;
  modal._items.splice(idx, 1);
  document.getElementById('catMgrList').innerHTML = modal._renderRows(modal._items);
}

function catMgrAdd() {
  const modal = document.getElementById('catManagerOverlay');
  const input = document.getElementById('catMgrNewName');
  if (!modal || !input) return;
  const label = input.value.trim();
  if (!label) { showToast('Masukkan nama terlebih dahulu', 'warning'); input.focus(); return; }
  const value = label.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (modal._items.find(i => i.value === value)) {
    showToast('Nama ini sudah ada', 'warning'); return;
  }
  modal._items.push({ value, label });
  document.getElementById('catMgrList').innerHTML = modal._renderRows(modal._items);
  input.value = '';
  input.focus();
}

async function catMgrSave() {
  const modal = document.getElementById('catManagerOverlay');
  if (!modal) return;
  const items      = modal._items;
  const selectId   = modal._selectId;
  const settingKey = modal._settingKey;

  if (!items.length) { showToast('Minimal harus ada 1 opsi', 'warning'); return; }

  try {
    // Simpan ke site_settings
    const { error } = await dataClient.from('site_settings')
      .upsert({ key: settingKey, value: JSON.stringify(items) }, { onConflict: 'key' });
    if (error) throw error;

    // Update dropdown di form — hanya jika select ada di DOM (form mungkin belum dibuka)
    const select = document.getElementById(selectId);
    if (select) {
      const currentVal = select.value;
      select.innerHTML = items.map(i => `<option value="${i.value}">${i.label}</option>`).join('');
      if (items.find(i => i.value === currentVal)) select.value = currentVal;
    }

    showToast('Berhasil disimpan ✓', 'success');
    modal.remove();
  } catch(e) {
    showToast('Gagal menyimpan: ' + e.message, 'error');
  }
}

// Load kategori dari DB saat panel produk/kelas/download dibuka
async function loadCategoriesFromDB() {
  try {
    const { data } = await dataClient.from('site_settings')
      .select('key,value')
      .in('key', ['product_categories', 'class_levels', 'article_categories', 'download_categories']);
    if (!data) return;
    data.forEach(row => {
      const items = JSON.parse(row.value || '[]');
      if (!items.length) return;
      const selectId = row.key === 'product_categories'  ? 'productCategory'
                     : row.key === 'article_categories'  ? 'articleCategory'
                     : row.key === 'download_categories' ? 'downloadCategory'
                     : 'classLevel';
      const select = document.getElementById(selectId);
      if (!select) return;
      const current = select.value;
      select.innerHTML = items.map(i => `<option value="${i.value}">${i.label}</option>`).join('');
      if (items.find(i => i.value === current)) select.value = current;
    });
  } catch(e) { /* silent */ }
}
