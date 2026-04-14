// ===== ADMIN ARTICLES =====

async function loadArticles() {
  const container = document.getElementById('articlesList');
  if (!container) return;
  container.innerHTML = '<div class="table-empty">Memuat data artikel…</div>';

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    container.innerHTML = `<div class="table-empty" style="color:#be123c">Gagal memuat artikel: ${error.message}</div>`;
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = '<div class="table-empty">Belum ada artikel. Klik "Tambah Artikel" untuk memulai.</div>';
    return;
  }

  const rows = data.map(a => `
    <tr>
      <td>${a.emoji ? a.emoji + ' ' : ''}${escHtml(a.title)}</td>
      <td>${escHtml(a.category)}</td>
      <td>${a.published_date || '—'}</td>
      <td>
        <span class="badge-active ${a.is_active ? 'on' : 'off'}">
          ${a.is_active ? 'Aktif' : 'Nonaktif'}
        </span>
      </td>
      <td>
        <div class="action-btns">
          <button class="btn-sm btn-edit"   onclick="editArticle('${a.id}')">Edit</button>
          <button class="btn-sm btn-delete" onclick="deleteArticle('${a.id}', '${escHtml(a.title).replace(/'/g, "\\'")}')">Hapus</button>
          <button class="btn-sm ${a.is_active ? 'btn-toggle-on' : 'btn-toggle-off'}"
                  onclick="toggleArticleActive('${a.id}', ${a.is_active})">
            ${a.is_active ? 'Nonaktifkan' : 'Aktifkan'}
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
          <th>Tanggal Terbit</th>
          <th>Aktif</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function showArticleForm(article = null) {
  document.getElementById('articleId').value            = article?.id || '';
  document.getElementById('articleTitle').value         = article?.title || '';
  document.getElementById('articleExcerpt').value       = article?.excerpt || '';
  document.getElementById('articleCategory').value      = article?.category || 'tanaman-obat';
  document.getElementById('articleReadTime').value      = article?.read_time ?? '';
  document.getElementById('articlePublishedDate').value = article?.published_date || '';
  document.getElementById('articleEmoji').value         = article?.emoji || '';
  document.getElementById('articleActive').checked      = article ? article.is_active : true;

  document.getElementById('uploadArticleImage').value = '';
  document.getElementById('articleImageUrl').value = article?.image_url || '';
  const prevImg = document.getElementById('previewArticleImg');
  if (article?.image_url) { prevImg.src = article.image_url; prevImg.style.display = 'block'; }
  else { prevImg.src = ''; prevImg.style.display = 'none'; }
  switchUploadTab('article', article?.image_url ? 'url' : 'file');

  document.getElementById('articleFormTitle').textContent = article ? 'Edit Artikel' : 'Tambah Artikel';
  const errEl = document.getElementById('articleError');
  errEl.textContent = ''; errEl.classList.remove('visible');
  document.getElementById('articleForm').style.display = 'block';
  document.getElementById('articleForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
  // Init editor
  initEditor('articleExcerpt').then(() => setEditorData('articleExcerpt', article?.excerpt || ''));
}

function hideArticleForm() {
  confirmDiscard(() => {
    document.getElementById('articleForm').style.display = 'none';
    document.getElementById('articleId').value = '';
  });
}

async function saveArticle() {
  const id            = document.getElementById('articleId').value.trim();
  const title         = document.getElementById('articleTitle').value.trim();
  const excerpt       = getEditorData('articleExcerpt');
  const category      = document.getElementById('articleCategory').value;
  const readTimeRaw   = document.getElementById('articleReadTime').value;
  const publishedDate = document.getElementById('articlePublishedDate').value;
  const emoji         = document.getElementById('articleEmoji').value.trim();
  const is_active     = document.getElementById('articleActive').checked;

  const errEl   = document.getElementById('articleError');
  const saveBtn = document.getElementById('articleSaveBtn');

  errEl.textContent = '';
  errEl.classList.remove('visible');

  if (!title) {
    errEl.textContent = 'Judul artikel wajib diisi.';
    errEl.classList.add('visible');
    return;
  }

  await new Promise(resolve => showConfirm(
        'Simpan Artikel?',
        'Apakah Anda yakin ingin menyimpan perubahan ini?',
        resolve,
        '💾',
        'Ya, Simpan'
      ));
      saveBtn.disabled = true;
  saveBtn.textContent = 'Menyimpan…';

  try {
    const imgFile = document.getElementById('uploadArticleImage')?.files[0];
    let image_url = document.getElementById('articleImageUrl').value.trim();
    if (imgFile) {
      image_url = await uploadImage(imgFile, `articles/${Date.now()}_${imgFile.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`);
    }

    const payload = {
      title,
      excerpt: excerpt || null,
      category,
      read_time: readTimeRaw !== '' ? parseInt(readTimeRaw, 10) : null,
      published_date: publishedDate || null,
      emoji: emoji || null,
      is_active,
    };
    if (image_url) payload.image_url = image_url;

    let error;
    if (id) {
      ({ error } = await supabase.from('articles').update(payload).eq('id', id));
    } else {
      ({ error } = await supabase.from('articles').insert(payload));
    }
    if (error) throw error;
    hideArticleForm();
    showToast('Artikel berhasil disimpan ✓', 'success');
    await loadArticles();
  } catch (err) {
    errEl.textContent = 'Gagal menyimpan artikel: ' + err.message;
    errEl.classList.add('visible');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Simpan';
  }
}

async function editArticle(id) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    showToast('Gagal memuat data artikel: ' + (error?.message || 'Data tidak ditemukan'), 'error');
    return;
  }

  showArticleForm(data);
}

async function deleteArticle(id, title) {
  await new Promise(resolve => showConfirm('Hapus Artikel', `Hapus artikel "${title}"? Tindakan ini tidak dapat dibatalkan.`, resolve));
  // confirmed

  const { error } = await supabase.from('articles').delete().eq('id', id);

  if (error) {
    showToast('Gagal menghapus artikel: ' + error.message, 'error');
    return;
  }

  showToast('Artikel berhasil dihapus', 'success');
  await loadArticles();
}

async function toggleArticleActive(id, currentValue) {
  const label = currentValue ? 'Nonaktifkan' : 'Aktifkan';
  const msg   = currentValue
    ? 'Artikel ini akan disembunyikan dari halaman publik.'
    : 'Artikel ini akan ditampilkan kembali di halaman publik.';
  await new Promise(resolve => showConfirm(label + ' Artikel', msg, resolve, currentValue ? '🔴' : '🟢'));
  // confirmed
  const { error } = await supabase
    .from('articles')
    .update({ is_active: !currentValue })
    .eq('id', id);

  if (error) {
    showToast('Gagal mengubah status artikel: ' + error.message, 'error');
    return;
  }
  showToast(`Artikel berhasil di${currentValue ? 'nonaktifkan' : 'aktifkan'}`, 'success');
  await loadArticles();
}
