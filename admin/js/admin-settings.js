// ===== ADMIN SETTINGS =====

const PAGES = ['shop', 'teori', 'kelas', 'download', 'kontak'];
const INFO_KEYS = ['address','phone','email','hours','instagram','youtube','facebook','tiktok'];

// Preview gambar sebelum upload
function previewUpload(input, previewId, urlInputId) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = document.getElementById(previewId);
    if (img) { img.src = e.target.result; img.style.display = 'block'; }
  };
  reader.readAsDataURL(file);
}

// Toggle antara tab Upload File dan Pakai URL
function switchUploadTab(key, mode) {
  const fileArea = document.getElementById(`tabFileArea_${key}`);
  const urlArea  = document.getElementById(`tabUrlArea_${key}`);
  const fileBtn  = document.getElementById(`tabFile_${key}`);
  const urlBtn   = document.getElementById(`tabUrl_${key}`);
  if (!fileArea || !urlArea) return;

  const activeStyle   = `padding:0.35rem 0.85rem;border-radius:var(--radius-sm);border:1.5px solid var(--green-mid);background:var(--green-mid);color:#fff;font-size:0.8rem;cursor:pointer;`;
  const inactiveStyle = `padding:0.35rem 0.85rem;border-radius:var(--radius-sm);border:1.5px solid var(--border);background:#fff;color:var(--text-mid);font-size:0.8rem;cursor:pointer;`;

  if (mode === 'file') {
    fileArea.style.display = 'block';
    urlArea.style.display  = 'none';
    if (fileBtn) fileBtn.style.cssText = activeStyle;
    if (urlBtn)  urlBtn.style.cssText  = inactiveStyle;
  } else {
    fileArea.style.display = 'none';
    urlArea.style.display  = 'block';
    if (fileBtn) fileBtn.style.cssText = inactiveStyle;
    if (urlBtn)  urlBtn.style.cssText  = activeStyle;
    // Jika ada URL tersimpan, tampilkan preview
    const urlInput = document.getElementById(`settingHeader_${key}`) || document.getElementById(`settingHeroImage`);
    const previewId = key === 'hero' ? 'previewHero' : `previewHeader_${key}`;
    const img = document.getElementById(previewId);
    if (urlInput?.value && img) { img.src = urlInput.value; img.style.display = 'block'; }
  }
}

// Upload file ke Supabase Storage pakai dataClient (service_role — bypass RLS)
async function uploadImage(file, path) {
  const { data, error } = await dataClient.storage
    .from('masjanis')
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  const { data: urlData } = dataClient.storage.from('masjanis').getPublicUrl(data.path);
  return urlData.publicUrl;
}

async function loadSettings() {
  const { data } = await dataClient.from('site_settings').select('key, value');
  if (!data) return;
  const map = Object.fromEntries(data.map(s => [s.key, s.value]));

  if (map.hero_image_url) document.getElementById('settingHeroImage').value = map.hero_image_url;
  if (map.hero_title)     document.getElementById('settingHeroTitle').value = map.hero_title;

  // Selalu init Quill untuk subtitle, set data setelah init selesai
  initEditor('settingHeroSubtitle').then(() => {
    setEditorData('settingHeroSubtitle', map.hero_subtitle || '');
  });

  PAGES.forEach(page => {
    const val = map[`page_header_${page}`];
    const el = document.getElementById(`settingHeader_${page}`);
    if (el && val) {
      el.value = val;
      const img = document.getElementById(`previewHeader_${page}`);
      if (img) { img.src = val; img.style.display = 'block'; }
    }
  });
}

async function saveSettings() {
  const errEl     = document.getElementById('settingsError');
  const successEl = document.getElementById('settingsSuccess');
  errEl.textContent = ''; errEl.classList.remove('visible');
  successEl.style.display = 'none';

  const saveBtn = document.querySelector('#panelSettings .btn-save');
  if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = '⏳ Menyimpan...'; }

  try {
    // Upload hero image jika ada file baru
    const heroFile = document.getElementById('uploadHeroImage')?.files[0];
    if (heroFile) {
      const url = await uploadImage(heroFile, `hero/hero_${Date.now()}.${heroFile.name.split('.').pop()}`);
      document.getElementById('settingHeroImage').value = url;
      const img = document.getElementById('previewHero');
      if (img) { img.src = url; img.style.display = 'block'; }
    }

    // Upload page header images jika ada file baru
    for (const page of PAGES) {
      const file = document.getElementById(`uploadHeader_${page}`)?.files[0];
      if (file) {
        const url = await uploadImage(file, `headers/${page}_${Date.now()}.${file.name.split('.').pop()}`);
        document.getElementById(`settingHeader_${page}`).value = url;
        const img = document.getElementById(`previewHeader_${page}`);
        if (img) { img.src = url; img.style.display = 'block'; }
      }
    }

    // Kumpulkan semua nilai untuk disimpan
    const updates = [
      { key: 'hero_image_url', value: document.getElementById('settingHeroImage').value.trim() },
      { key: 'hero_title',     value: document.getElementById('settingHeroTitle').value.trim() },
      { key: 'hero_subtitle',  value: getEditorData('settingHeroSubtitle') },
      ...PAGES.map(page => ({
        key: `page_header_${page}`,
        value: document.getElementById(`settingHeader_${page}`)?.value?.trim() || ''
      }))
    ].filter(u => u.value);

    for (const item of updates) {
      const { error } = await dataClient
        .from('site_settings')
        .upsert({ key: item.key, value: item.value }, { onConflict: 'key' });
      if (error) throw error;
    }

    successEl.style.display = 'block';
    setTimeout(() => { successEl.style.display = 'none'; }, 3000);

  } catch (err) {
    errEl.textContent = 'Gagal menyimpan: ' + err.message;
    errEl.classList.add('visible');
  } finally {
    if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = '💾 Simpan Semua Pengaturan'; }
  }
}

async function loadInfo() {
  const { data } = await dataClient.from('site_settings').select('key,value');
  if (!data) return;
  const map = Object.fromEntries(data.map(s => [s.key, s.value]));
  document.getElementById('infoAboutTitle').value = map.about_title || '';
  document.getElementById('infoAboutBody').value  = map.about_body  || '';
  initEditor('infoAboutBody').then(() => setEditorData('infoAboutBody', map.about_body || ''));
  document.getElementById('infoAddress').value   = map.address   || '';
  document.getElementById('infoPhone').value     = map.phone     || '';
  document.getElementById('infoEmail').value     = map.email     || '';
  document.getElementById('infoHours').value     = map.hours     || '';
  document.getElementById('infoInstagram').value = map.instagram || '';
  document.getElementById('infoYoutube').value   = map.youtube   || '';
  document.getElementById('infoFacebook').value  = map.facebook  || '';
  document.getElementById('infoTiktok').value    = map.tiktok    || '';
}

async function saveInfo() {
  const errEl  = document.getElementById('infoError');
  const succEl = document.getElementById('infoSuccess');
  const btn    = document.querySelector('#panelInfo .btn-save');
  errEl.textContent = ''; errEl.classList.remove('visible');
  succEl.style.display = 'none';
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Menyimpan...'; }

  const vals = {
    about_title: document.getElementById('infoAboutTitle').value.trim(),
    about_body:  getEditorData('infoAboutBody'),
    address:   document.getElementById('infoAddress').value.trim(),
    phone:     document.getElementById('infoPhone').value.trim(),
    email:     document.getElementById('infoEmail').value.trim(),
    hours:     document.getElementById('infoHours').value.trim(),
    instagram: document.getElementById('infoInstagram').value.trim(),
    youtube:   document.getElementById('infoYoutube').value.trim(),
    facebook:  document.getElementById('infoFacebook').value.trim(),
    tiktok:    document.getElementById('infoTiktok').value.trim(),
  };

  try {
    const upserts = Object.entries(vals)
      .filter(([, v]) => v !== '')
      .map(([key, value]) => ({ key, value }));
    if (upserts.length) {
      const { error } = await dataClient.from('site_settings')
        .upsert(upserts, { onConflict: 'key' });
      if (error) throw error;
    }
    showToast('Informasi berhasil disimpan', 'success');
    succEl.style.display = 'block';
    setTimeout(() => { succEl.style.display = 'none'; }, 3000);
  } catch (err) {
    errEl.textContent = 'Gagal menyimpan: ' + err.message;
    errEl.classList.add('visible');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '💾 Simpan Informasi'; }
  }
}
