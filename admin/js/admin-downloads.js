// ===== ADMIN DOWNLOADS =====

function previewDownloadFile(input) {
  const file = input.files[0];
  const statusEl = document.getElementById('downloadFileStatus');
  if (!file) { if (statusEl) statusEl.textContent = ''; return; }
  if (statusEl) statusEl.textContent = `📎 File dipilih: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
  // Clear URL field saat file dipilih
  document.getElementById('downloadFileUrl').value = '';
}

async function loadDownloads() {
  const container = document.getElementById('downloadsList');
  if (!container) return;
  container.innerHTML = '<div class="table-empty">Memuat data download…</div>';

  const { data, error } = await supabase
    .from('downloads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    container.innerHTML = `<div class="table-empty" style="color:#be123c">Gagal memuat download: ${error.message}</div>`;
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = '<div class="table-empty">Belum ada download. Klik "Tambah Download" untuk memulai.</div>';
    return;
  }

  const rows = data.map(dl => `
    <tr>
      <td>${dl.emoji ? dl.emoji + ' ' : ''}${escHtml(dl.title)}</td>
      <td>${escHtml(dl.category)}</td>
      <td>${escHtml(dl.file_size || '—')}</td>
      <td>
        <span class="badge-active ${dl.is_active ? 'on' : 'off'}">
          ${dl.is_active ? 'Aktif' : 'Nonaktif'}
        </span>
      </td>
      <td>
        <div class="action-btns">
          <button class="btn-sm btn-edit"   onclick="editDownload('${dl.id}')">Edit</button>
          <button class="btn-sm btn-delete" onclick="deleteDownload('${dl.id}', '${escHtml(dl.title).replace(/'/g, "\\'")}')">Hapus</button>
          <button class="btn-sm ${dl.is_active ? 'btn-toggle-on' : 'btn-toggle-off'}"
                  onclick="toggleDownloadActive('${dl.id}', ${dl.is_active})">
            ${dl.is_active ? 'Nonaktifkan' : 'Aktifkan'}
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  container.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Judul</th>
          <th>Kategori</th>
          <th>Ukuran File</th>
          <th>Aktif</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function showDownloadForm(dl = null) {
  const formEl = document.getElementById('downloadForm');
  if (formEl && !document.body.contains(formEl)) {
    document.getElementById('panelDownloads').appendChild(formEl);
  }
  document.getElementById('downloadId').value       = dl?.id || '';
  document.getElementById('downloadTitle').value    = dl?.title || '';
  document.getElementById('downloadDesc').value     = dl?.description || '';
  document.getElementById('downloadCategory').value = dl?.category || 'ebook';
  document.getElementById('downloadFileSize').value = dl?.file_size || '';
  document.getElementById('downloadFileUrl').value  = dl?.file_url || '';
  document.getElementById('downloadEmoji').value    = dl?.emoji || '';
  document.getElementById('downloadActive').checked = dl ? dl.is_active : true;

  document.getElementById('uploadDownloadFile').value = '';
  const statusEl = document.getElementById('downloadFileStatus');
  if (statusEl) statusEl.textContent = '';
  document.getElementById('uploadDownloadImage').value = '';
  document.getElementById('downloadImageUrl').value = dl?.image_url || '';
  const prevImg = document.getElementById('previewDownloadImg');
  if (dl?.image_url) { prevImg.src = dl.image_url; prevImg.style.display = 'block'; }
  else { prevImg.src = ''; prevImg.style.display = 'none'; }
  switchUploadTab('dlimg', dl?.image_url ? 'url' : 'file');

  document.getElementById('downloadFormTitle').textContent = dl ? 'Edit Download' : 'Tambah Download';
  const errEl = document.getElementById('downloadError');
  errEl.textContent = ''; errEl.classList.remove('visible');
  openFormInDrawer(
    dl ? 'Edit Download' : 'Tambah Download',
    'downloadForm',
    { id: 'downloadSaveBtn', fn: 'saveDownload', label: 'Simpan Download' },
    'hideDownloadForm'
  );
  setTimeout(() => initEditorWithData('downloadDesc', dl?.description || ''), 350);
}

function hideDownloadForm() {
  const uploadInput = document.getElementById('uploadDownloadFile');
  if (uploadInput) uploadInput.value = '';
  const statusEl2 = document.getElementById('downloadFileStatus');
  if (statusEl2) statusEl2.textContent = '';
  document.getElementById('downloadId').value = '';
  closeDrawer();
}

async function saveDownload() {
  const id          = document.getElementById('downloadId').value.trim();
  const title       = document.getElementById('downloadTitle').value.trim();
  const description = getEditorData('downloadDesc');
  const category    = document.getElementById('downloadCategory').value;
  const file_size   = document.getElementById('downloadFileSize').value.trim();
  let   file_url    = document.getElementById('downloadFileUrl').value.trim();
  const emoji       = document.getElementById('downloadEmoji').value.trim();
  const is_active   = document.getElementById('downloadActive').checked;

  const errEl   = document.getElementById('downloadError');
  const saveBtn = document.getElementById('downloadSaveBtn');

  errEl.textContent = '';
  errEl.classList.remove('visible');

  if (!title) {
    errEl.textContent = 'Judul download wajib diisi.';
    errEl.classList.add('visible');
    return;
  }

  await new Promise(resolve => showConfirm(
        'Simpan Download?',
        'Apakah Anda yakin ingin menyimpan perubahan ini?',
        resolve,
        '💾',
        'Ya, Simpan'
      ));
      saveBtn.disabled = true;
  saveBtn.textContent = 'Menyimpan…';

  try {
    // Upload file jika ada
    const uploadInput = document.getElementById('uploadDownloadFile');
    const uploadFile  = uploadInput?.files[0];
    if (uploadFile) {
      const path = `downloads/${Date.now()}_${uploadFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      file_url   = await uploadImage(uploadFile, path);
      // Auto-fill ukuran file
      if (!file_size) {
        const kb = uploadFile.size / 1024;
        document.getElementById('downloadFileSize').value =
          kb >= 1024 ? (kb / 1024).toFixed(1) + ' MB' : kb.toFixed(0) + ' KB';
      }
      const statusEl = document.getElementById('downloadFileStatus');
      if (statusEl) statusEl.textContent = '✅ File berhasil diupload';
    }

    const payload = {
      title,
      description: description || null,
      category,
      file_size: document.getElementById('downloadFileSize').value.trim() || null,
      file_url: file_url || null,
      emoji: emoji || null,
      is_active,
    };

    // Upload thumbnail image jika ada
    const imgFile = document.getElementById('uploadDownloadImage')?.files[0];
    let image_url = document.getElementById('downloadImageUrl').value.trim();
    if (imgFile) {
      image_url = await uploadImage(imgFile, `downloads/thumb_${Date.now()}_${imgFile.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`);
    }
    if (image_url) payload.image_url = image_url;

    let error;
    if (id) {
      ({ error } = await supabase.from('downloads').update(payload).eq('id', id));
    } else {
      ({ error } = await supabase.from('downloads').insert(payload));
    }

    if (error) throw error;

    hideDownloadForm();
    await loadDownloads();

  } catch (err) {
    errEl.textContent = 'Gagal menyimpan download: ' + err.message;
    errEl.classList.add('visible');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Simpan';
  }
}

async function editDownload(id) {
  const { data, error } = await supabase
    .from('downloads')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    showToast('Gagal memuat data download: ' + (error?.message || 'Data tidak ditemukan'), 'error');
    return;
  }

  showDownloadForm(data);
}

async function deleteDownload(id, title) {
  await new Promise(resolve => showConfirm('Hapus Download', `Hapus download "${title}"? Tindakan ini tidak dapat dibatalkan.`, resolve));
  // confirmed

  const { error } = await supabase.from('downloads').delete().eq('id', id);

  if (error) {
    showToast('Gagal menghapus download: ' + error.message, 'error');
    return;
  }

  showToast('Download berhasil dihapus', 'success');
  await loadDownloads();
}

async function toggleDownloadActive(id, currentValue) {
  const label = currentValue ? 'Nonaktifkan' : 'Aktifkan';
  const msg   = currentValue
    ? 'Download ini akan disembunyikan dari halaman publik.'
    : 'Download ini akan ditampilkan kembali di halaman publik.';
  await new Promise(resolve => showConfirm(label + ' Download', msg, resolve, currentValue ? '🔴' : '🟢'));
  // confirmed
  const { error } = await supabase
    .from('downloads')
    .update({ is_active: !currentValue })
    .eq('id', id);

  if (error) {
    showToast('Gagal mengubah status download: ' + error.message, 'error');
    return;
  }
  showToast(`Download berhasil di${currentValue ? 'nonaktifkan' : 'aktifkan'}`, 'success');
  await loadDownloads();
}
