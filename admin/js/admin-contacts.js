// ===== ADMIN CONTACTS =====

function formatDate(isoStr) {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

async function loadContacts() {
  const container = document.getElementById('contactsList');
  if (!container) return;
  container.innerHTML = '<div class="table-empty">Memuat data pesan…</div>';

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    container.innerHTML = `<div class="table-empty" style="color:#be123c">Gagal memuat pesan: ${error.message}</div>`;
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = '<div class="table-empty">Belum ada pesan masuk.</div>';
    return;
  }

  const rows = data.map(c => `
    <tr class="${c.is_read ? '' : 'contact-unread'}">
      <td>${escHtml(c.name)}</td>
      <td>${escHtml(c.email)}</td>
      <td>${escHtml(c.subject || '—')}</td>
      <td>${formatDate(c.created_at)}</td>
      <td>
        <span class="${c.is_read ? 'badge-read' : 'badge-unread'}">
          ${c.is_read ? 'Dibaca' : 'Belum Dibaca'}
        </span>
      </td>
      <td>
        <div class="action-btns">
          <button class="btn-sm btn-view"   onclick="viewContact('${c.id}')">Lihat</button>
          <button class="btn-sm btn-delete" onclick="deleteContact('${c.id}', '${escHtml(c.name).replace(/'/g, "\\'")}')">Hapus</button>
        </div>
      </td>
    </tr>
  `).join('');

  container.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Nama</th>
          <th>Email</th>
          <th>Subjek</th>
          <th>Tanggal</th>
          <th>Status</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

async function viewContact(id) {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    showToast('Gagal memuat pesan: ' + (error?.message || 'Data tidak ditemukan'), 'error');
    return;
  }

  // Populate detail view
  document.getElementById('cdName').textContent    = data.name || '—';
  document.getElementById('cdEmail').textContent   = data.email || '—';
  document.getElementById('cdPhone').textContent   = data.phone || '—';
  document.getElementById('cdSubject').textContent = data.subject || '—';
  document.getElementById('cdMessage').textContent = data.message || '—';

  // Show detail, hide list
  document.getElementById('contactsList').style.display  = 'none';
  document.getElementById('contactDetail').style.display = 'block';

  // Auto-mark as read if not yet read
  if (!data.is_read) {
    await supabase.from('contacts').update({ is_read: true }).eq('id', id);
    // Refresh list in background so unread count updates
    loadContacts();
    loadDashboardStats();
  }
}

async function markContactRead(id) {
  await supabase.from('contacts').update({ is_read: true }).eq('id', id);
  await loadContacts();
}

async function deleteContact(id, name) {
  await new Promise(resolve => showConfirm('Hapus Pesan', `Hapus pesan dari "${name}"? Tindakan ini tidak dapat dibatalkan.`, resolve));
  // confirmed

  const { error } = await supabase.from('contacts').delete().eq('id', id);

  if (error) {
    showToast('Gagal menghapus pesan: ' + error.message, 'error');
    return;
  }

  await loadContacts();
}

function closeContactDetail() {
  document.getElementById('contactDetail').style.display = 'none';
  document.getElementById('contactsList').style.display  = 'block';
}
