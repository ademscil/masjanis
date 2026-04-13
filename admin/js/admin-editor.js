// ===== ADMIN EDITOR (QUILL) =====

const editors = {};

// Font families (Google Fonts)
const FONTS = ['Inter','Open Sans','Roboto','Lato','Nunito','Playfair Display','Merriweather','Georgia','Arial','Courier New'];
const SIZES = ['10px','12px','14px','16px','18px','20px','24px','28px','32px'];

// Register font & size ke Quill
const Font = Quill.import('formats/font');
Font.whitelist = FONTS.map(f => f.replace(/\s+/g, '-').toLowerCase());
Quill.register(Font, true);

const Size = Quill.import('attributors/style/size');
Size.whitelist = SIZES;
Quill.register(Size, true);

// Tambah CSS font ke head agar font tampil di editor
(function() {
  const style = document.createElement('style');
  style.textContent = FONTS.map(f => {
    const cls = f.replace(/\s+/g, '-').toLowerCase();
    return `.ql-font-${cls} { font-family: '${f}', sans-serif; }`;
  }).join('\n') + '\n' +
  SIZES.map(s => `.ql-size-${s} { font-size: ${s}; }`).join('\n');
  document.head.appendChild(style);
})();

const TOOLBAR = [
  [{ 'font': Font.whitelist }],
  [{ 'size': SIZES }],
  [{ 'header': [1, 2, 3, 4, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
  [{ 'indent': '-1' }, { 'indent': '+1' }],
  ['link', 'blockquote'],
  ['clean'],
];

const TOOLBAR_SMALL = [
  [{ 'font': Font.whitelist }],
  [{ 'size': SIZES }],
  ['bold', 'italic', 'underline'],
  [{ 'color': [] }],
  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
  ['link'],
  ['clean'],
];

// ID editor yang pakai toolbar kecil
const SMALL_EDITORS = [
  'productManfaat','productCaraPakai','productPeringatan','productSpesifikasi',
  'downloadDesc','testimonialContent','featureDesc','infoAboutBody','settingHeroSubtitle',
];

function initEditor(id) {
  if (editors[id]) return Promise.resolve();
  return new Promise((resolve) => {
    try {
      const container = document.getElementById(id + 'Editor');
      if (!container) { resolve(); return; }
      const isSmall = SMALL_EDITORS.includes(id);
      const quill = new Quill(container, {
        theme: 'snow',
        modules: { toolbar: isSmall ? TOOLBAR_SMALL : TOOLBAR },
        placeholder: '',
      });
      // Ukuran editor
      const qlEditor = container.querySelector('.ql-editor');
      if (qlEditor && isSmall) qlEditor.classList.add('small');
      // Sync ke textarea
      quill.on('text-change', () => {
        const ta = document.getElementById(id);
        if (ta) ta.value = quill.root.innerHTML === '<p><br></p>' ? '' : quill.root.innerHTML;
      });
      editors[id] = quill;
      resolve();
    } catch(e) {
      console.warn('Quill init failed for', id, ':', e.message);
      resolve();
    }
  });
}

function setEditorData(id, html) {
  if (editors[id]) {
    editors[id].root.innerHTML = html || '';
    // Sync textarea
    const ta = document.getElementById(id);
    if (ta) ta.value = html || '';
  } else {
    const ta = document.getElementById(id);
    if (ta) ta.value = html || '';
  }
}

function getEditorData(id) {
  if (editors[id]) {
    const html = editors[id].root.innerHTML;
    return html === '<p><br></p>' ? '' : html;
  }
  const ta = document.getElementById(id);
  return ta ? ta.value : '';
}

// Init semua editor saat halaman load
document.addEventListener('DOMContentLoaded', () => {
  // Editor di-init saat form pertama kali dibuka (lazy)
});

// Patch references — kept for compatibility
const _origShowProductForm = typeof showProductForm !== 'undefined' ? showProductForm : null;
const _patchProductForm = () => {
  initEditor('productDesc').then(() => {
    const val = document.getElementById('productDesc').value;
    setEditorData('productDesc', val);
  });
};

const _origShowArticleForm = typeof showArticleForm !== 'undefined' ? showArticleForm : null;
const _patchArticleForm = () => {
  initEditor('articleExcerpt').then(() => {
    const val = document.getElementById('articleExcerpt').value;
    setEditorData('articleExcerpt', val);
  });
};

const _origShowClassForm = typeof showClassForm !== 'undefined' ? showClassForm : null;
const _patchClassForm = () => {
  initEditor('classDesc').then(() => {
    const val = document.getElementById('classDesc').value;
    setEditorData('classDesc', val);
  });
};

const _origShowDownloadForm = typeof showDownloadForm !== 'undefined' ? showDownloadForm : null;
const _patchDownloadForm = () => {
  initEditor('downloadDesc').then(() => {
    const val = document.getElementById('downloadDesc').value;
    setEditorData('downloadDesc', val);
  });
};

const _origShowTestimonialForm = typeof showTestimonialForm !== 'undefined' ? showTestimonialForm : null;
const _patchTestimonialForm = () => {
  initEditor('testimonialContent').then(() => {
    const val = document.getElementById('testimonialContent').value;
    setEditorData('testimonialContent', val);
  });
};

const _origShowFeatureForm = typeof showFeatureForm !== 'undefined' ? showFeatureForm : null;
const _patchFeatureForm = () => {
  initEditor('featureDesc').then(() => {
    const val = document.getElementById('featureDesc').value;
    setEditorData('featureDesc', val);
  });
};

const _origLoadInfo = typeof loadInfo !== 'undefined' ? loadInfo : null;
