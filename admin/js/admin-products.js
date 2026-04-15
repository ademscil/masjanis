// ===== ADMIN PRODUCTS =====

function formatRupiah(amount) {
  if (!amount && amount !== 0) return '—';
  return 'Rp ' + Number(amount).toLocaleString('id-ID');
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function loadProducts() {
  const container = document.getElementById('productsList');
  if (!container) return;
  container.innerHTML = '<div class="table-empty">Memuat data produk…</div>';

  const { data, error } = await supabase
    .from('products')
    .select('id, name, description, price, original_price, category, emoji, badge_label, image_url, is_active, payment_url, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    container.innerHTML = `<div class="table-empty" style="color:#be123c">Gagal memuat produk: ${error.message}</div>`;
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = '<div class="table-empty">Belum ada produk. Klik "Tambah Produk" untuk memulai.</div>';
    return;
  }

  const rows = data.map(p => `
    <tr>
      <td>
        ${p.image_url
          ? `<img src="${p.image_url}" alt="" style="width:36px;height:36px;object-fit:cover;border-radius:6px;vertical-align:middle;margin-right:6px;">`
          : `<span style="font-size:1.4rem;vertical-align:middle;margin-right:6px;">${p.emoji || '🌿'}</span>`
        }${escHtml(p.name)}
      </td>
      <td>${escHtml(p.category)}</td>
      <td>${formatRupiah(p.price)}</td>
      <td>
        <span class="badge-active ${p.is_active ? 'on' : 'off'}">
          ${p.is_active ? 'Aktif' : 'Nonaktif'}
        </span>
      </td>
      <td>
        <div class="action-btns">
          <button class="btn-sm btn-edit"   onclick="editProduct('${p.id}')">Edit</button>
          <button class="btn-sm btn-delete" onclick="deleteProduct('${p.id}', '${escHtml(p.name).replace(/'/g, "\\'")}')">Hapus</button>
          <button class="btn-sm ${p.is_active ? 'btn-toggle-on' : 'btn-toggle-off'}"
                  onclick="toggleProductActive('${p.id}', ${p.is_active})">
            ${p.is_active ? 'Nonaktifkan' : 'Aktifkan'}
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  container.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Nama</th>
          <th>Kategori</th>
          <th>Harga</th>
          <th>Aktif</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function showProductForm(product = null) {
  document.getElementById('productId').value           = product?.id || '';
  document.getElementById('productName').value         = product?.name || '';
  document.getElementById('productSubtitle').value     = product?.subtitle || '';
  document.getElementById('productPrice').value        = product?.price ?? '';
  document.getElementById('productOriginalPrice').value = product?.original_price ?? '';
  document.getElementById('productCategory').value     = product?.category || 'suplemen';
  document.getElementById('productEmoji').value        = product?.emoji || '';
  document.getElementById('productBadge').value        = product?.badge_label || '';
  document.getElementById('productPaymentUrl').value   = product?.payment_url || '';
  document.getElementById('productActive').checked     = product ? product.is_active : true;
  document.getElementById('productFeatured').checked   = product ? (product.is_featured || false) : false;

  // Tab content fields
  document.getElementById('productManfaat').value     = product?.manfaat     || '';
  document.getElementById('productCaraPakai').value   = product?.cara_pakai  || '';
  document.getElementById('productPeringatan').value  = product?.peringatan  || '';
  document.getElementById('productSpesifikasi').value = product?.spesifikasi || '';

  // Init editor untuk tab content
  const tabFields = ['productManfaat','productCaraPakai','productPeringatan','productSpesifikasi'];
  const tabValues = {
    productManfaat:     product?.manfaat     || '',
    productCaraPakai:   product?.cara_pakai  || '',
    productPeringatan:  product?.peringatan  || '',
    productSpesifikasi: product?.spesifikasi || '',
  };
  tabFields.forEach(f => {
    initEditor(f).then(() => setEditorData(f, tabValues[f]));
  });

  // Reset image fields
  document.getElementById('uploadProductImage').value = '';
  document.getElementById('productImageUrl').value = product?.image_url || '';
  const prevImg = document.getElementById('previewProductImg');
  if (product?.image_url) {
    prevImg.src = product.image_url;
    prevImg.style.display = 'block';
  } else {
    prevImg.src = '';
    prevImg.style.display = 'none';
  }
  // Default ke tab URL jika sudah ada gambar, file jika belum
  switchUploadTab('product', product?.image_url ? 'url' : 'file');

  document.getElementById('productFormTitle').textContent = product ? 'Edit Produk' : 'Tambah Produk';

  const errEl = document.getElementById('productError');
  errEl.textContent = '';
  errEl.classList.remove('visible');

  document.getElementById('productForm').style.display = 'block';
  document.getElementById('productForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
  clearDirty();
  // Mark dirty saat ada perubahan
  document.getElementById('productForm').querySelectorAll('input,textarea,select').forEach(el => {
    el.addEventListener('input', markDirty, { once: false });
    el.addEventListener('change', markDirty, { once: false });
  });
  // Init editor
  initEditor('productDesc').then(() => setEditorData('productDesc', product?.description || ''));
}

function hideProductForm() {
  confirmDiscard(() => {
    document.getElementById('productForm').style.display = 'none';
    document.getElementById('productId').value = '';
  });
}

async function saveProduct() {
  const id          = document.getElementById('productId').value.trim();
  const name        = document.getElementById('productName').value.trim();
  const description = getEditorData('productDesc');
  const price       = parseInt(document.getElementById('productPrice').value, 10);
  const origPrice   = document.getElementById('productOriginalPrice').value;
  const category    = document.getElementById('productCategory').value;
  const emoji       = document.getElementById('productEmoji').value.trim();
  const badge_label = document.getElementById('productBadge').value.trim();
  const payment_url = document.getElementById('productPaymentUrl').value.trim();
  const is_active   = document.getElementById('productActive').checked;
  const is_featured = document.getElementById('productFeatured').checked;
  let   image_url   = document.getElementById('productImageUrl').value.trim();

  const errEl  = document.getElementById('productError');
  const saveBtn = document.getElementById('productSaveBtn');

  errEl.textContent = '';
  errEl.classList.remove('visible');

  if (!name) {
    errEl.textContent = 'Nama produk wajib diisi.';
    errEl.classList.add('visible');
    return;
  }
  if (isNaN(price) || price < 0) {
    errEl.textContent = 'Harga harus berupa angka yang valid.';
    errEl.classList.add('visible');
    return;
  }

  await new Promise(resolve => showConfirm(
        'Simpan Produk?',
        'Apakah Anda yakin ingin menyimpan perubahan ini?',
        resolve,
        '💾',
        'Ya, Simpan'
      ));
      saveBtn.disabled = true;
  saveBtn.textContent = 'Menyimpan…';

  try {
    // Upload foto produk jika ada file baru
    const imgFile = document.getElementById('uploadProductImage')?.files[0];
    if (imgFile) {
      const path = `products/${Date.now()}_${imgFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      image_url  = await uploadImage(imgFile, path);
      const prevImg = document.getElementById('previewProductImg');
      if (prevImg) { prevImg.src = image_url; prevImg.style.display = 'block'; }
    }

    const payload = {
      name,
      description: description || null,
      subtitle:    document.getElementById('productSubtitle').value.trim() || null,
      price,
      original_price: origPrice !== '' ? parseInt(origPrice, 10) : null,
      category,
      emoji: emoji || null,
      badge_label: badge_label || null,
      payment_url: payment_url || null,
      is_active,
      is_featured,
      manfaat:     getEditorData('productManfaat')     || null,
      cara_pakai:  getEditorData('productCaraPakai')   || null,
      peringatan:  getEditorData('productPeringatan')  || null,
      spesifikasi: getEditorData('productSpesifikasi') || null,
    };
    if (image_url) payload.image_url = image_url;

    let error;
    if (id) {
      ({ error } = await supabase.from('products').update(payload).eq('id', id));
    } else {
      ({ error } = await supabase.from('products').insert(payload));
    }

    if (error) throw error;

    clearDirty();
    hideProductForm();
    showToast('Produk berhasil disimpan ✓', 'success');
    await loadProducts();

  } catch (err) {
    errEl.textContent = 'Gagal menyimpan produk: ' + err.message;
    errEl.classList.add('visible');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Simpan';
  }
}

async function editProduct(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    showToast('Gagal memuat data produk: ' + (error?.message || 'Data tidak ditemukan'), 'error');
    return;
  }

  showProductForm(data);
}

async function deleteProduct(id, name) {
  await new Promise(resolve => showConfirm('Hapus Produk', `Hapus produk "${name}"? Tindakan ini tidak dapat dibatalkan.`, resolve));
  // confirmed

  const { error } = await supabase.from('products').delete().eq('id', id);

  if (error) {
    showToast('Gagal menghapus produk: ' + error.message, 'error');
    return;
  }

  showToast('Produk berhasil dihapus', 'success');
  await loadProducts();
}

async function toggleProductActive(id, currentValue) {
  const label = currentValue ? 'Nonaktifkan' : 'Aktifkan';
  const msg   = currentValue
    ? 'Produk ini akan disembunyikan dari halaman publik.'
    : 'Produk ini akan ditampilkan kembali di halaman publik.';
  await new Promise(resolve => showConfirm(label + ' Produk', msg, resolve, currentValue ? '🔴' : '🟢'));
  // confirmed
  const { error } = await supabase
    .from('products')
    .update({ is_active: !currentValue })
    .eq('id', id);

  if (error) {
    showToast('Gagal mengubah status produk: ' + error.message, 'error');
    return;
  }
  showToast(`Produk berhasil di${currentValue ? 'nonaktifkan' : 'aktifkan'}`, 'success');
  await loadProducts();
}

function previewProductImage(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = document.getElementById('previewProductImg');
    if (img) { img.src = e.target.result; img.style.display = 'block'; }
  };
  reader.readAsDataURL(file);
  // Clear URL field
  document.getElementById('productImageUrl').value = '';
}

// Generic image preview untuk artikel, kelas, download
function previewGenericImage(input, previewId, urlInputId) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = document.getElementById(previewId);
    if (img) { img.src = e.target.result; img.style.display = 'block'; }
  };
  reader.readAsDataURL(file);
  const urlEl = document.getElementById(urlInputId);
  if (urlEl) urlEl.value = '';
}
