// ===== ADMIN EDITOR (QUILL) =====

const editors = {};

// Font families (Google Fonts)
const FONTS = ['Inter','Open Sans','Roboto','Lato','Nunito','Playfair Display','Merriweather','Georgia','Arial','Courier New'];
const SIZES = ['10px','12px','14px','16px','18px','20px','24px','28px','32px'];

// ID editor yang pakai toolbar kecil
const SMALL_EDITORS = [
  'productManfaat','productCaraPakai','productPeringatan','productSpesifikasi',
  'downloadDesc','testimonialContent','featureDesc','infoAboutBody','settingHeroSubtitle',
];

let _quillReady = false;
let TOOLBAR = null;
let TOOLBAR_SMALL = null;

function _initQuillFormats() {
  if (_quillReady) return true;
  if (typeof Quill === 'undefined') {
    console.warn('Quill not loaded yet');
    return false;
  }

  try {
    const Font = Quill.import('formats/font');
    Font.whitelist = FONTS.map(f => f.replace(/\s+/g, '-').toLowerCase());
    Quill.register(Font, true);

    const Size = Quill.import('attributors/style/size');
    Size.whitelist = SIZES;
    Quill.register(Size, true);

    // Inject font CSS ke head
    const style = document.createElement('style');
    style.textContent = FONTS.map(f => {
      const cls = f.replace(/\s+/g, '-').toLowerCase();
      return `.ql-font-${cls} { font-family: '${f}', sans-serif; }`;
    }).join('\n') + '\n' +
    SIZES.map(s => `.ql-size-${s} { font-size: ${s}; }`).join('\n');
    document.head.appendChild(style);

    const fontWhitelist = Font.whitelist;

    TOOLBAR = [
      [{ 'font': fontWhitelist }],
      [{ 'size': SIZES }],
      [{ 'header': [1, 2, 3, 4, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'blockquote'],
      ['clean'],
    ];

    TOOLBAR_SMALL = [
      [{ 'font': fontWhitelist }],
      [{ 'size': SIZES }],
      ['bold', 'italic', 'underline'],
      [{ 'color': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link'],
      ['clean'],
    ];

    _quillReady = true;
    return true;
  } catch(e) {
    console.warn('Quill format init failed:', e.message);
    return false;
  }
}

function initEditor(id) {
  if (editors[id]) return Promise.resolve();
  return new Promise((resolve) => {
    try {
      if (!_initQuillFormats()) { resolve(); return; }

      const container = document.getElementById(id + 'Editor');
      if (!container) { resolve(); return; }

      const isSmall = SMALL_EDITORS.includes(id);
      const quill = new Quill(container, {
        theme: 'snow',
        modules: { toolbar: isSmall ? TOOLBAR_SMALL : TOOLBAR },
        placeholder: '',
      });

      const qlEditor = container.querySelector('.ql-editor');
      if (qlEditor && isSmall) qlEditor.classList.add('small');

      quill.on('text-change', () => {
        const ta = document.getElementById(id);
        if (ta) ta.value = quill.root.innerHTML === '<p><br></p>' ? '' : quill.root.innerHTML;
      });

      editors[id] = quill;
      // Beri satu tick agar Quill selesai render sebelum setEditorData dipanggil
      setTimeout(resolve, 50);
    } catch(e) {
      console.warn('Quill init failed for', id, ':', e.message);
      resolve();
    }
  });
}

function setEditorData(id, html) {
  if (editors[id]) {
    if (html) {
      editors[id].clipboard.dangerouslyPasteHTML(0, html, 'silent');
    } else {
      editors[id].setText('');
    }
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

// Helper: init editor jika belum ada, lalu set data
// Selalu set data bahkan jika editor sudah ada (untuk edit produk berbeda)
function initEditorWithData(id, html) {
  if (editors[id]) {
    // Editor sudah ada — pakai clipboard API agar tidak di-reset Quill
    if (html) {
      editors[id].clipboard.dangerouslyPasteHTML(0, html, 'silent');
    } else {
      editors[id].setText('');
    }
    const ta = document.getElementById(id);
    if (ta) ta.value = html || '';
  } else {
    _initEditorAndSet(id, html);
  }
}

function _initEditorAndSet(id, html) {
  if (!_initQuillFormats()) return;
  const container = document.getElementById(id + 'Editor');
  if (!container) return;
  try {
    const isSmall = SMALL_EDITORS.includes(id);
    const quill = new Quill(container, {
      theme: 'snow',
      modules: { toolbar: isSmall ? TOOLBAR_SMALL : TOOLBAR },
      placeholder: '',
    });
    const qlEditor = container.querySelector('.ql-editor');
    if (qlEditor && isSmall) qlEditor.classList.add('small');

    if (html) quill.clipboard.dangerouslyPasteHTML(0, html, 'silent');

    quill.on('text-change', () => {
      const ta = document.getElementById(id);
      if (ta) ta.value = quill.root.innerHTML === '<p><br></p>' ? '' : quill.root.innerHTML;
    });

    const ta = document.getElementById(id);
    if (ta) ta.value = html || '';

    editors[id] = quill;
  } catch(e) {
    console.warn('Quill init failed for', id, ':', e.message);
  }
}

// Init Quill formats saat DOM ready (pastikan Quill CDN sudah load)
document.addEventListener('DOMContentLoaded', () => {
  _initQuillFormats();
});
