/* ===== MASJANIS — MAIN JS ===== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initFadeIn();
  initFilterTabs();
  initTopicChips();
  initSearch();
  initModals();
  initContactForm();
  initSmoothScroll();
});

// ── Navbar ────────────────────────────────────────────────────
function initNavbar() {
  const navbar    = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });

    document.addEventListener('click', (e) => {
      if (navbar && !navbar.contains(e.target) && !mobileMenu.contains(e.target)) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      }
    });
  }
}

// ── Fade-in on scroll ─────────────────────────────────────────
function initFadeIn() {
  const els = document.querySelectorAll('.fade-in');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => observer.observe(el));
}

// ── Filter tabs ───────────────────────────────────────────────
function initFilterTabs() {
  document.querySelectorAll('.filter-tabs').forEach(tabGroup => {
    const targetId = tabGroup.dataset.target;
    const grid = targetId ? document.querySelector(targetId) : findFilterGrid(tabGroup);
    attachFilterTabs(tabGroup, grid);
  });
}

function findFilterGrid(tabGroup) {
  let el = tabGroup.nextElementSibling;
  while (el) {
    if (el.querySelector('[data-category]')) return el;
    el = el.nextElementSibling;
  }
  const parent = tabGroup.parentElement;
  if (parent) {
    const found = parent.querySelector('[data-category]');
    if (found) return found.parentElement;
  }
  return null;
}

function attachFilterTabs(tabGroup, grid) {
  if (!tabGroup || !grid) return;
  tabGroup.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      tabGroup.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;
      grid.querySelectorAll('[data-category]').forEach(item => {
        item.style.display = (filter === 'semua' || item.dataset.category === filter) ? '' : 'none';
      });
    });
  });
}

// ── Topic chips (teori.html) ──────────────────────────────────
function initTopicChips() {
  const topicMap = {
    'Tanaman Obat':       'tanaman-obat',
    'Ramuan Tradisional': 'ramuan',
    'Fitokimia':          'fitokimia',
    'Pengobatan Holistik':'holistik',
    'Jamu Nusantara':     'jamu',
    'Herbal Modern':      'modern',
  };

  document.querySelectorAll('.topic-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const filterVal = topicMap[chip.textContent.trim()];
      if (!filterVal) return;
      const tab = document.querySelector(`.filter-tab[data-filter="${filterVal}"]`);
      if (tab) {
        tab.click();
        tab.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });
}

// ── Search filter ─────────────────────────────────────────────
function initSearch() {
  const searchInput = document.querySelector('.search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) {
      const activeTab = document.querySelector('.filter-tab.active');
      if (activeTab) activeTab.click();
      return;
    }
    document.querySelectorAll('.searchable-card').forEach(card => {
      card.style.display = card.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}

// ── Modals ────────────────────────────────────────────────────
function initModals() {
  document.querySelectorAll('[data-modal]').forEach(trigger => {
    trigger.addEventListener('click', () => openModal(trigger.dataset.modal));
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeAllModals();
    });
  });

  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.removeAttribute('onclick');
    btn.addEventListener('click', closeAllModals);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
  });
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) { modal.classList.add('open'); document.body.style.overflow = 'hidden'; }
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  document.body.style.overflow = '';
}

// ── Contact form ──────────────────────────────────────────────
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form || form.dataset.bound) return;
  form.dataset.bound = 'true';

  const successMsg = document.getElementById('formSuccess');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const original = btn.innerHTML;
    btn.innerHTML = '⏳ Mengirim...';
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = original;
      btn.disabled = false;
      if (successMsg) {
        successMsg.classList.add('show');
        setTimeout(() => successMsg.classList.remove('show'), 5000);
      }
      form.reset();
    }, 1500);
  });
}

// ── Smooth scroll ─────────────────────────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ===== TOAST SYSTEM ===== */
function showToast(message, type = 'success', duration = 3000) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const item = document.createElement('div');
  item.className = `toast-item ${type}`;
  item.innerHTML = `<span>${icons[type] || '✅'}</span><span>${message}</span>`;
  container.appendChild(item);
  setTimeout(() => {
    item.classList.add('out');
    setTimeout(() => item.remove(), 260);
  }, duration);
}

/* ===== CMS HELPER FUNCTIONS ===== */

function renderSkeletons(container, count = 3) {
  container.innerHTML = Array(count).fill(`
    <div class="skeleton-card">
      <div class="skeleton skeleton-img"></div>
      <div class="skeleton-body">
        <div class="skeleton skeleton-line short"></div>
        <div class="skeleton skeleton-line"></div>
        <div class="skeleton skeleton-line medium"></div>
      </div>
    </div>
  `).join('');
}

function renderError(container, retryFn) {
  container.innerHTML = `
    <div class="state-error">
      <div class="state-icon">⚠️</div>
      <p>Gagal memuat konten. Silakan coba lagi.</p>
      <button class="btn btn-outline btn-sm" onclick="(${retryFn.toString()})()">Coba Lagi</button>
    </div>
  `;
}

function renderEmpty(container, message = 'Belum ada konten tersedia.') {
  container.innerHTML = `
    <div class="state-empty">
      <div class="state-icon">🌿</div>
      <p>${message}</p>
    </div>
  `;
}

async function fetchData(container, fetchFn, renderFn, retryFn) {
  renderSkeletons(container);
  try {
    const { data, error } = await fetchFn();
    if (error) throw error;
    if (!data || data.length === 0) { renderEmpty(container); return; }
    renderFn(container, data);
  } catch (err) {
    console.error(err);
    renderError(container, retryFn);
  }
}
