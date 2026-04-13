// ===== ADMIN USERS =====

async function loadUsers() {
  const container = document.getElementById('usersList');
  if (!container) return;
  container.innerHTML = '<div class="table-empty">Memuat daftar admin…</div>';

  try {
    // Gunakan Admin API via service_role
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=50`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      }
    });
    const json = await res.json();
    const users = json.users || [];

    if (!users.length) {
      container.innerHTML = '<div class="table-empty">Belum ada pengguna terdaftar.</div>';
      return;
    }

    // Dapatkan email user yang sedang login untuk proteksi
    const { data: { user: me } } = await authClient.auth.getUser();

    const rows = users.map(u => {
      const isMe = u.id === me?.id;
      return `
        <tr>
          <td>${escHtml(u.email)}</td>
          <td>${u.last_sign_in_at ? formatDate(u.last_sign_in_at) : '—'}</td>
          <td>${formatDate(u.created_at)}</td>
          <td>
            <div class="action-btns">
              ${isMe
                ? '<span style="font-size:0.78rem;color:var(--text-light);">Akun Anda</span>'
                : `<button class="btn-sm btn-delete" onclick="deleteAdminUser('${u.id}','${escHtml(u.email).replace(/'/g,"\\'")}')">Hapus</button>`
              }
            </div>
          </td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Login Terakhir</th>
            <th>Dibuat</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  } catch (err) {
    container.innerHTML = `<div class="table-empty" style="color:#be123c">Gagal memuat pengguna: ${err.message}</div>`;
  }
}

async function deleteAdminUser(id, email) {
  await new Promise(resolve => showConfirm('Konfirmasi Hapus', `Hapus akun admin "${email}"? Tindakan ini tidak dapat dibatalkan.`, resolve));
  // confirmed

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${id}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      }
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.message || 'Gagal menghapus akun');
    }
    await loadUsers();
  } catch (err) {
    showToast('Gagal menghapus akun: ' + err.message, 'error');
  }
}

async function createAdminUser() {
  const email    = document.getElementById('inviteEmail').value.trim();
  const password = document.getElementById('invitePassword').value;
  const errEl    = document.getElementById('userInviteError');
  const succEl   = document.getElementById('userInviteSuccess');
  const btn      = document.getElementById('inviteBtn');

  errEl.textContent = ''; errEl.classList.remove('visible');
  succEl.style.display = 'none';

  if (!email) { errEl.textContent = 'Email wajib diisi.'; errEl.classList.add('visible'); return; }
  if (password.length < 8) { errEl.textContent = 'Password minimal 8 karakter.'; errEl.classList.add('visible'); return; }

  btn.disabled = true; btn.textContent = 'Membuat akun…';

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, email_confirm: true })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || json.msg || 'Gagal membuat akun');

    succEl.textContent = `✅ Akun admin untuk ${email} berhasil dibuat!`;
    succEl.style.display = 'block';
    document.getElementById('inviteEmail').value = '';
    document.getElementById('invitePassword').value = '';
    await loadUsers();
    setTimeout(() => { succEl.style.display = 'none'; }, 4000);
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.add('visible');
  } finally {
    btn.disabled = false; btn.textContent = 'Buat Akun Admin';
  }
}

// Alias untuk backward compatibility (HTML memanggil inviteUser)
async function inviteUser() {
  return createAdminUser();
}

async function changePassword() {
  const newPw  = document.getElementById('newPassword').value;
  const confPw = document.getElementById('confirmPassword').value;
  const errEl  = document.getElementById('changePwError');
  const succEl = document.getElementById('changePwSuccess');
  const btn    = document.getElementById('changePwBtn');

  errEl.textContent = ''; errEl.classList.remove('visible');
  succEl.style.display = 'none';

  if (newPw.length < 8) { errEl.textContent = 'Password minimal 8 karakter.'; errEl.classList.add('visible'); return; }
  if (newPw !== confPw) { errEl.textContent = 'Konfirmasi password tidak cocok.'; errEl.classList.add('visible'); return; }

  btn.disabled = true; btn.textContent = 'Menyimpan…';

  const { error } = await authClient.auth.updateUser({ password: newPw });

  btn.disabled = false; btn.textContent = 'Simpan Password Baru';

  if (error) {
    errEl.textContent = error.message;
    errEl.classList.add('visible');
    return;
  }

  succEl.textContent = '✅ Password berhasil diubah!';
  succEl.style.display = 'block';
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmPassword').value = '';
  setTimeout(() => { succEl.style.display = 'none'; }, 4000);
}
