// ===== ADMIN CLASSES =====

async function loadClasses() {
  const container = document.getElementById('classesList');
  if (!container) return;
  container.innerHTML = '<div class="table-empty">Memuat data kelas…</div>';

  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    container.innerHTML = `<div class="table-empty" style="color:#be123c">Gagal memuat kelas: ${error.message}</div>`;
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = '<div class="table-empty">Belum ada kelas. Klik "Tambah Kelas" untuk memulai.</div>';
    return;
  }

  const rows = data.map(c => `
    <tr>
      <td>${c.emoji ? c.emoji + ' ' : ''}${escHtml(c.title)}</td>
      <td>${escHtml(c.instructor || '—')}</td>
      <td>${escHtml(c.level)}</td>
      <td>${formatRupiah(c.price)}</td>
      <td>
        <span class="badge-active ${c.is_active ? 'on' : 'off'}">
          ${c.is_active ? 'Aktif' : 'Nonaktif'}
        </span>
      </td>
      <td>
        <div class="action-btns">
          <button class="btn-sm btn-edit"   onclick="editClass('${c.id}')">Edit</button>
          <button class="btn-sm btn-delete" onclick="deleteClass('${c.id}', '${escHtml(c.title).replace(/'/g, "\\'")}')">Hapus</button>
          <button class="btn-sm ${c.is_active ? 'btn-toggle-on' : 'btn-toggle-off'}"
                  onclick="toggleClassActive('${c.id}', ${c.is_active})">
            ${c.is_active ? 'Nonaktifkan' : 'Aktifkan'}
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
          <th>Instruktur</th>
          <th>Level</th>
          <th>Harga</th>
          <th>Aktif</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function showClassForm(cls = null) {
  document.getElementById('classId').value            = cls?.id || '';
  document.getElementById('classTitle').value         = cls?.title || '';
  document.getElementById('classDesc').value          = cls?.description || '';
  document.getElementById('classInstructor').value    = cls?.instructor || '';
  document.getElementById('classDuration').value      = cls?.duration_hours ?? '';
  document.getElementById('classVideoCount').value    = cls?.video_count ?? '';
  document.getElementById('classLevel').value         = cls?.level || 'pemula';
  document.getElementById('classPrice').value         = cls?.price ?? '';
  document.getElementById('classOriginalPrice').value = cls?.original_price ?? '';
  document.getElementById('classEmoji').value         = cls?.emoji || '';
  document.getElementById('classActive').checked      = cls ? cls.is_active : true;

  document.getElementById('uploadClassImage').value = '';
  document.getElementById('classImageUrl').value = cls?.image_url || '';
  const prevImg = document.getElementById('previewClassImg');
  if (cls?.image_url) { prevImg.src = cls.image_url; prevImg.style.display = 'block'; }
  else { prevImg.src = ''; prevImg.style.display = 'none'; }
  switchUploadTab('class', cls?.image_url ? 'url' : 'file');

  document.getElementById('classFormTitle').textContent = cls ? 'Edit Kelas' : 'Tambah Kelas';
  const errEl = document.getElementById('classError');
  errEl.textContent = ''; errEl.classList.remove('visible');
  document.getElementById('classForm').style.display = 'block';
  document.getElementById('classForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
  // Init editor
  initEditor('classDesc').then(() => setEditorData('classDesc', cls?.description || ''));
}

function hideClassForm() {
  confirmDiscard(() => {
    document.getElementById('classForm').style.display = 'none';
    document.getElementById('classId').value = '';
  });
}

async function saveClass() {
  const id            = document.getElementById('classId').value.trim();
  const title         = document.getElementById('classTitle').value.trim();
  const description   = getEditorData('classDesc');
  const instructor    = document.getElementById('classInstructor').value.trim();
  const durationRaw   = document.getElementById('classDuration').value;
  const videoCountRaw = document.getElementById('classVideoCount').value;
  const level         = document.getElementById('classLevel').value;
  const price         = parseInt(document.getElementById('classPrice').value, 10);
  const origPriceRaw  = document.getElementById('classOriginalPrice').value;
  const emoji         = document.getElementById('classEmoji').value.trim();
  const is_active     = document.getElementById('classActive').checked;

  const errEl   = document.getElementById('classError');
  const saveBtn = document.getElementById('classSaveBtn');

  errEl.textContent = '';
  errEl.classList.remove('visible');

  if (!title) {
    errEl.textContent = 'Judul kelas wajib diisi.';
    errEl.classList.add('visible');
    return;
  }
  if (isNaN(price) || price < 0) {
    errEl.textContent = 'Harga harus berupa angka yang valid.';
    errEl.classList.add('visible');
    return;
  }

  const payload = {
    title,
    description: description || null,
    instructor: instructor || null,
    duration_hours: durationRaw !== '' ? parseInt(durationRaw, 10) : null,
    video_count: videoCountRaw !== '' ? parseInt(videoCountRaw, 10) : null,
    level,
    price,
    original_price: origPriceRaw !== '' ? parseInt(origPriceRaw, 10) : null,
    emoji: emoji || null,
    is_active,
  };

  await new Promise(resolve => showConfirm(
        'Simpan Kelas?',
        'Apakah Anda yakin ingin menyimpan perubahan ini?',
        resolve,
        '💾',
        'Ya, Simpan'
      ));
      saveBtn.disabled = true;
  saveBtn.textContent = 'Menyimpan…';

  try {
    const imgFile = document.getElementById('uploadClassImage')?.files[0];
    let image_url = document.getElementById('classImageUrl').value.trim();
    if (imgFile) {
      image_url = await uploadImage(imgFile, `classes/${Date.now()}_${imgFile.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`);
    }
    if (image_url) payload.image_url = image_url;

    let error;
    if (id) { ({ error } = await supabase.from('classes').update(payload).eq('id', id)); }
    else    { ({ error } = await supabase.from('classes').insert(payload)); }
    if (error) throw error;
    hideClassForm();
    showToast('Kelas berhasil disimpan ✓', 'success');
    await loadClasses();
  } catch (err) {
    errEl.textContent = 'Gagal menyimpan kelas: ' + err.message;
    errEl.classList.add('visible');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Simpan';
  }
}

async function editClass(id) {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    showToast('Gagal memuat data kelas: ' + (error?.message || 'Data tidak ditemukan'), 'error');
    return;
  }

  showClassForm(data);
}

async function deleteClass(id, title) {
  await new Promise(resolve => showConfirm('Hapus Kelas', `Hapus kelas "${title}"? Tindakan ini tidak dapat dibatalkan.`, resolve));
  // confirmed

  const { error } = await supabase.from('classes').delete().eq('id', id);

  if (error) {
    showToast('Gagal menghapus kelas: ' + error.message, 'error');
    return;
  }

  showToast('Kelas berhasil dihapus', 'success');
  await loadClasses();
}

async function toggleClassActive(id, currentValue) {
  const label = currentValue ? 'Nonaktifkan' : 'Aktifkan';
  const msg   = currentValue
    ? 'Kelas ini akan disembunyikan dari halaman publik.'
    : 'Kelas ini akan ditampilkan kembali di halaman publik.';
  await new Promise(resolve => showConfirm(label + ' Kelas', msg, resolve, currentValue ? '🔴' : '🟢'));
  // confirmed
  const { error } = await supabase
    .from('classes')
    .update({ is_active: !currentValue })
    .eq('id', id);

  if (error) {
    showToast('Gagal mengubah status kelas: ' + error.message, 'error');
    return;
  }
  showToast(`Kelas berhasil di${currentValue ? 'nonaktifkan' : 'aktifkan'}`, 'success');
  await loadClasses();
}
