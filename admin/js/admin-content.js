// ===== ADMIN CONTENT (TESTIMONIALS & FEATURES) =====

// Strip HTML tags untuk preview di tabel
function stripHtml(html, maxLen = 80) {
  const plain = String(html || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  return plain.length > maxLen ? plain.slice(0, maxLen).trimEnd() + '…' : plain;
}

// ===== TESTIMONI =====

async function loadTestimonials() {
  const container = document.getElementById('testimonialsList');
  if (!container) return;
  container.innerHTML = '<div class="table-empty">Memuat…</div>';
  const { data, error } = await supabase.from('testimonials').select('*').order('sort_order');
  if (error) { container.innerHTML = `<div class="table-empty" style="color:#be123c">Gagal: ${error.message}</div>`; return; }
  if (!data?.length) { container.innerHTML = '<div class="table-empty">Belum ada testimoni. Klik "Tambah Testimoni".</div>'; return; }
  const rows = data.map(t => `<tr>
    <td>${escHtml(t.name)}</td>
    <td>${escHtml(t.location || '—')}</td>
    <td>${'★'.repeat(t.rating)}</td>
    <td><span class="badge-active ${t.is_active ? 'on' : 'off'}">${t.is_active ? 'Aktif' : 'Nonaktif'}</span></td>
    <td><div class="action-btns">
      <button class="btn-sm btn-edit" onclick="editTestimonial('${t.id}')">Edit</button>
      <button class="btn-sm btn-delete" onclick="deleteTestimonial('${t.id}','${escHtml(t.name).replace(/'/g,"\\'")}')">Hapus</button>
      <button class="btn-sm ${t.is_active ? 'btn-toggle-on' : 'btn-toggle-off'}" onclick="toggleTestimonialActive('${t.id}',${t.is_active})">${t.is_active ? 'Nonaktifkan' : 'Aktifkan'}</button>
    </div></td></tr>`).join('');
  container.innerHTML = `<table class="admin-table"><thead><tr><th>Nama</th><th>Lokasi</th><th>Rating</th><th>Aktif</th><th>Aksi</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function showTestimonialForm(t = null) {
  document.getElementById('testimonialId').value       = t?.id || '';
  document.getElementById('testimonialName').value     = t?.name || '';
  document.getElementById('testimonialLocation').value = t?.location || '';
  document.getElementById('testimonialRating').value   = t?.rating || 5;
  document.getElementById('testimonialOrder').value    = t?.sort_order ?? 0;
  document.getElementById('testimonialContent').value  = t?.content || '';
  document.getElementById('testimonialActive').checked = t ? t.is_active : true;
  document.getElementById('testimonialFormTitle').textContent = t ? 'Edit Testimoni' : 'Tambah Testimoni';
  const errEl = document.getElementById('testimonialError');
  errEl.textContent = ''; errEl.classList.remove('visible');
  openFormInDrawer(
    t ? 'Edit Testimoni' : 'Tambah Testimoni',
    'testimonialForm',
    { id: 'testimonialSaveBtn', fn: 'saveTestimonial', label: 'Simpan Testimoni' },
    'hideTestimonialForm'
  );
  setTimeout(() => initEditorWithData('testimonialContent', t?.content || ''), 350);
}

function hideTestimonialForm() {
  closeDrawer();
}

async function saveTestimonial() {
  const id       = document.getElementById('testimonialId').value.trim();
  const name     = document.getElementById('testimonialName').value.trim();
  const location = document.getElementById('testimonialLocation').value.trim();
  const rating   = parseInt(document.getElementById('testimonialRating').value);
  const order    = parseInt(document.getElementById('testimonialOrder').value) || 0;
  const content  = getEditorData('testimonialContent');
  const is_active = document.getElementById('testimonialActive').checked;
  const errEl = document.getElementById('testimonialError');
  const saveBtn = document.getElementById('testimonialSaveBtn');
  errEl.textContent = ''; errEl.classList.remove('visible');
  if (!name || !content) { errEl.textContent = 'Nama dan isi testimoni wajib diisi.'; errEl.classList.add('visible'); return; }
  await new Promise(resolve => showConfirm(
        'Simpan Testimoni?',
        'Apakah Anda yakin ingin menyimpan perubahan ini?',
        resolve,
        '💾',
        'Ya, Simpan'
      ));
      saveBtn.disabled = true; saveBtn.textContent = 'Menyimpan…';
  const payload = { name, location: location || null, rating, sort_order: order, content, is_active };
  const { error } = id
    ? await supabase.from('testimonials').update(payload).eq('id', id)
    : await supabase.from('testimonials').insert(payload);
  saveBtn.disabled = false; saveBtn.textContent = 'Simpan';
  if (error) { errEl.textContent = 'Gagal: ' + error.message; errEl.classList.add('visible'); return; }
  hideTestimonialForm(); showToast('Testimoni berhasil disimpan ✓', 'success'); await loadTestimonials();
}

async function editTestimonial(id) {
  const { data, error } = await supabase.from('testimonials').select('*').eq('id', id).single();
  if (error || !data) { showToast('Gagal memuat data', 'error'); return; }
  showTestimonialForm(data);
}

async function deleteTestimonial(id, name) {
  await new Promise(resolve => showConfirm('Hapus Testimoni', `Hapus testimoni dari "${name}"?`, resolve));
  // confirmed
  await supabase.from('testimonials').delete().eq('id', id);
  await loadTestimonials();
}

async function toggleTestimonialActive(id, current) {
  const label = current ? 'Nonaktifkan' : 'Aktifkan';
  const msg   = current ? 'Testimoni ini akan disembunyikan dari halaman publik.' : 'Testimoni ini akan ditampilkan kembali.';
  await new Promise(resolve => showConfirm(label + ' Testimoni', msg, resolve, current ? '🔴' : '🟢'));
  await supabase.from('testimonials').update({ is_active: !current }).eq('id', id);
  showToast(`Testimoni berhasil di${current ? 'nonaktifkan' : 'aktifkan'}`, 'success');
  await loadTestimonials();
}

// ===== FITUR / KEUNGGULAN =====

async function loadFeatures() {
  const container = document.getElementById('featuresList');
  if (!container) return;
  container.innerHTML = '<div class="table-empty">Memuat…</div>';
  const { data, error } = await supabase.from('features').select('*').order('sort_order');
  if (error) { container.innerHTML = `<div class="table-empty" style="color:#be123c">Gagal: ${error.message}</div>`; return; }
  if (!data?.length) { container.innerHTML = '<div class="table-empty">Belum ada fitur. Klik "Tambah Fitur".</div>'; return; }
  const rows = data.map(f => `<tr>
    <td>${f.icon} ${escHtml(f.title)}</td>
    <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(stripHtml(f.description))}</td>
    <td><span class="badge-active ${f.is_active ? 'on' : 'off'}">${f.is_active ? 'Aktif' : 'Nonaktif'}</span></td>
    <td><div class="action-btns">
      <button class="btn-sm btn-edit" onclick="editFeature('${f.id}')">Edit</button>
      <button class="btn-sm btn-delete" onclick="deleteFeature('${f.id}','${escHtml(f.title).replace(/'/g,"\\'")}')">Hapus</button>
      <button class="btn-sm ${f.is_active ? 'btn-toggle-on' : 'btn-toggle-off'}" onclick="toggleFeatureActive('${f.id}',${f.is_active})">${f.is_active ? 'Nonaktifkan' : 'Aktifkan'}</button>
    </div></td></tr>`).join('');
  container.innerHTML = `<table class="admin-table"><thead><tr><th>Judul</th><th>Deskripsi</th><th>Aktif</th><th>Aksi</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function showFeatureForm(f = null) {
  document.getElementById('featureId').value    = f?.id || '';
  document.getElementById('featureIcon').value  = f?.icon || '🌿';
  document.getElementById('featureTitle').value = f?.title || '';
  document.getElementById('featureDesc').value  = f?.description || '';
  document.getElementById('featureOrder').value = f?.sort_order ?? 0;
  document.getElementById('featureActive').checked = f ? f.is_active : true;
  document.getElementById('featureFormTitle').textContent = f ? 'Edit Fitur' : 'Tambah Fitur';
  const errEl = document.getElementById('featureError');
  errEl.textContent = ''; errEl.classList.remove('visible');
  openFormInDrawer(
    f ? 'Edit Fitur' : 'Tambah Fitur',
    'featureForm',
    { id: 'featureSaveBtn', fn: 'saveFeature', label: 'Simpan Fitur' },
    'hideFeatureForm'
  );
  setTimeout(() => initEditorWithData('featureDesc', f?.description || ''), 350);
}

function hideFeatureForm() {
  closeDrawer();
}

async function saveFeature() {
  const id    = document.getElementById('featureId').value.trim();
  const icon  = document.getElementById('featureIcon').value.trim() || '🌿';
  const title = document.getElementById('featureTitle').value.trim();
  const desc  = getEditorData('featureDesc');
  const order = parseInt(document.getElementById('featureOrder').value) || 0;
  const is_active = document.getElementById('featureActive').checked;
  const errEl = document.getElementById('featureError');
  const saveBtn = document.getElementById('featureSaveBtn');
  errEl.textContent = ''; errEl.classList.remove('visible');
  if (!title || !desc) { errEl.textContent = 'Judul dan deskripsi wajib diisi.'; errEl.classList.add('visible'); return; }
  await new Promise(resolve => showConfirm(
        'Simpan Fitur?',
        'Apakah Anda yakin ingin menyimpan perubahan ini?',
        resolve,
        '💾',
        'Ya, Simpan'
      ));
      saveBtn.disabled = true; saveBtn.textContent = 'Menyimpan…';
  const payload = { icon, title, description: desc, sort_order: order, is_active };
  const { error } = id
    ? await supabase.from('features').update(payload).eq('id', id)
    : await supabase.from('features').insert(payload);
  saveBtn.disabled = false; saveBtn.textContent = 'Simpan';
  if (error) { errEl.textContent = 'Gagal: ' + error.message; errEl.classList.add('visible'); return; }
  hideFeatureForm(); showToast('Fitur berhasil disimpan ✓', 'success'); await loadFeatures();
}

async function editFeature(id) {
  const { data, error } = await supabase.from('features').select('*').eq('id', id).single();
  if (error || !data) { showToast('Gagal memuat data', 'error'); return; }
  showFeatureForm(data);
}

async function deleteFeature(id, title) {
  await new Promise(resolve => showConfirm('Hapus Fitur', `Hapus fitur "${title}"?`, resolve));
  // confirmed
  await supabase.from('features').delete().eq('id', id);
  await loadFeatures();
}

async function toggleFeatureActive(id, current) {
  const label = current ? 'Nonaktifkan' : 'Aktifkan';
  const msg   = current ? 'Fitur ini akan disembunyikan dari halaman publik.' : 'Fitur ini akan ditampilkan kembali.';
  await new Promise(resolve => showConfirm(label + ' Fitur', msg, resolve, current ? '🔴' : '🟢'));
  await supabase.from('features').update({ is_active: !current }).eq('id', id);
  showToast(`Fitur berhasil di${current ? 'nonaktifkan' : 'aktifkan'}`, 'success');
  await loadFeatures();
}

// ===== FAQ CRUD =====

async function loadFaqs() {
  const container = document.getElementById('faqList');
  if (!container) return;
  container.innerHTML = '<div class="table-empty">Memuat…</div>';
  const { data, error } = await supabase.from('faqs').select('*').order('sort_order');
  if (error) { container.innerHTML = `<div class="table-empty" style="color:#be123c">Gagal: ${error.message}</div>`; return; }
  if (!data?.length) { container.innerHTML = '<div class="table-empty">Belum ada FAQ. Klik "Tambah FAQ".</div>'; return; }
  const rows = data.map(f => `<tr>
    <td style="max-width:300px;">${escHtml(f.question)}</td>
    <td style="max-width:300px;color:var(--text-mid);font-size:0.85rem;">${escHtml(stripHtml(f.answer))}</td>
    <td>${f.sort_order}</td>
    <td><span class="badge-active ${f.is_active?'on':'off'}">${f.is_active?'Aktif':'Nonaktif'}</span></td>
    <td>
      <div class="action-btns">
        <button class="btn-sm btn-edit" onclick="editFaq('${f.id}')">Edit</button>
        <button class="btn-sm btn-delete" onclick="deleteFaq('${f.id}','${escHtml(f.question).replace(/'/g,"\\'")}')">Hapus</button>
        <button class="btn-sm ${f.is_active?'btn-toggle-on':'btn-toggle-off'}" onclick="toggleFaqActive('${f.id}',${f.is_active})">
          ${f.is_active?'Nonaktifkan':'Aktifkan'}
        </button>
      </div>
    </td>
  </tr>`).join('');
  container.innerHTML = `<table class="admin-table"><thead><tr><th>Pertanyaan</th><th>Jawaban</th><th>Urutan</th><th>Aktif</th><th>Aksi</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function showFaqForm(f = null) {
  document.getElementById('faqId').value       = f?.id || '';
  document.getElementById('faqQuestion').value = f?.question || '';
  document.getElementById('faqAnswer').value   = f?.answer || '';
  document.getElementById('faqOrder').value    = f?.sort_order ?? 0;
  document.getElementById('faqActive').checked = f ? f.is_active : true;
  document.getElementById('faqFormTitle').textContent = f ? 'Edit FAQ' : 'Tambah FAQ';
  const errEl = document.getElementById('faqError');
  errEl.textContent = ''; errEl.classList.remove('visible');
  openFormInDrawer(
    f ? 'Edit FAQ' : 'Tambah FAQ',
    'faqForm',
    { id: 'faqSaveBtn', fn: 'saveFaq', label: 'Simpan FAQ' },
    'hideFaqForm'
  );
}

function hideFaqForm() {
  document.getElementById('faqId').value = '';
  closeDrawer();
}

async function saveFaq() {
  const id       = document.getElementById('faqId').value.trim();
  const question = document.getElementById('faqQuestion').value.trim();
  const answer   = document.getElementById('faqAnswer').value.trim();
  const order    = parseInt(document.getElementById('faqOrder').value) || 0;
  const active   = document.getElementById('faqActive').checked;
  const errEl    = document.getElementById('faqError');
  const saveBtn  = document.getElementById('faqSaveBtn');

  errEl.textContent = ''; errEl.classList.remove('visible');
  if (!question) { errEl.textContent = 'Pertanyaan wajib diisi.'; errEl.classList.add('visible'); return; }
  if (!answer)   { errEl.textContent = 'Jawaban wajib diisi.'; errEl.classList.add('visible'); return; }

  await new Promise(resolve => showConfirm('Simpan FAQ?', 'Apakah Anda yakin ingin menyimpan FAQ ini?', resolve, '💾', 'Ya, Simpan'));

  saveBtn.disabled = true; saveBtn.textContent = 'Menyimpan…';
  const payload = { question, answer, sort_order: order, is_active: active };
  const { error } = id
    ? await supabase.from('faqs').update(payload).eq('id', id)
    : await supabase.from('faqs').insert(payload);
  saveBtn.disabled = false; saveBtn.textContent = 'Simpan';
  if (error) { errEl.textContent = 'Gagal: ' + error.message; errEl.classList.add('visible'); return; }
  showToast('FAQ berhasil disimpan ✓', 'success');
  hideFaqForm();
  await loadFaqs();
}

async function editFaq(id) {
  const { data, error } = await supabase.from('faqs').select('*').eq('id', id).single();
  if (error || !data) { showToast('Gagal memuat data', 'error'); return; }
  showFaqForm(data);
}

async function deleteFaq(id, question) {
  await new Promise(resolve => showConfirm('Hapus FAQ', `Hapus FAQ "${question}"?`, resolve));
  await supabase.from('faqs').delete().eq('id', id);
  showToast('FAQ berhasil dihapus', 'success');
  await loadFaqs();
}

async function toggleFaqActive(id, current) {
  const label = current ? 'Nonaktifkan' : 'Aktifkan';
  await new Promise(resolve => showConfirm(label + ' FAQ', current ? 'FAQ ini akan disembunyikan.' : 'FAQ ini akan ditampilkan kembali.', resolve, current ? '🔴' : '🟢'));
  await supabase.from('faqs').update({ is_active: !current }).eq('id', id);
  showToast(`FAQ berhasil di${current?'nonaktifkan':'aktifkan'}`, 'success');
  await loadFaqs();
}
