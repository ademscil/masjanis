/**
 * footer-loader.js — MasJanis
 * Inject footer yang konsisten ke semua halaman.
 * Cukup tambahkan <div id="siteFooter"></div> dan load script ini.
 */
(function () {
  'use strict';

  const FOOTER_HTML = `
<footer class="footer">
  <div class="footer-grid">
    <div class="footer-brand">
      <a href="/" class="nav-logo">
        <img src="/assets/img/gambarlogo-removebg-preview.png" alt="MasJanis" style="height:56px;width:auto;object-fit:contain;" />
      </a>
      <p data-site="footer_tagline">MasJanis</p>
      <div class="social-links">
        <a class="social-link" href="#" data-site="instagram" target="_blank" rel="noopener" title="Instagram">&#128248;</a>
        <a class="social-link" href="#" data-site="facebook" target="_blank" rel="noopener" title="Facebook">&#128101;</a>
        <a class="social-link" href="#" data-site="youtube" target="_blank" rel="noopener" title="YouTube">&#9654;&#65039;</a>
        <a class="social-link" href="#" data-site="tiktok" target="_blank" rel="noopener" title="TikTok">&#127925;</a>
      </div>
    </div>
    <div class="footer-col">
      <h4 data-site="footer_col2_title">Navigasi</h4>
      <ul>
        <li><a href="/">Beranda</a></li>
        <li><a href="/teori">Teori Herbal</a></li>
        <li><a href="/kelas">List Kelas</a></li>
        <li><a href="/shop">Toko</a></li>
        <li><a href="/download">Download Center</a></li>
        <li><a href="/kontak">Kontak</a></li>
      </ul>
    </div>
    <div class="footer-col" id="footerCol3">
      <h4 data-site="footer_col3_title">Produk</h4>
      <ul>
        <li><a href="/shop">Suplemen</a></li>
        <li><a href="/shop">Minuman</a></li>
        <li><a href="/shop">Perawatan</a></li>
        <li><a href="/kelas">Kelas Online</a></li>
        <li><a href="/download">E-Book</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4 data-site="footer_col4_title">Kontak</h4>
      <ul>
        <li><a href="#" data-site="address">&#128205; Jakarta, Indonesia</a></li>
        <li><a href="tel:+6281234567890" data-site="phone">&#128222; +62 812-3456-7890</a></li>
        <li><a href="mailto:info@masjanis.com" data-site="email">&#9993;&#65039; info@masjanis.com</a></li>
        <li><a href="#" data-site="hours">&#9200; Sen&ndash;Sab, 08.00&ndash;17.00</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <p data-site="footer_copyright">&copy; 2026 MasJanis. Semua hak dilindungi. | Dibuat dengan &#128154; untuk kesehatan Indonesia</p>
  </div>
</footer>`;

  function injectFooter() {
    // Cari placeholder atau ganti footer yang sudah ada
    const placeholder = document.getElementById('siteFooter');
    if (placeholder) {
      placeholder.outerHTML = FOOTER_HTML;
      return;
    }
    // Fallback: ganti footer existing jika ada
    const existing = document.querySelector('footer.footer');
    if (existing) {
      existing.outerHTML = FOOTER_HTML;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFooter);
  } else {
    injectFooter();
  }
})();
