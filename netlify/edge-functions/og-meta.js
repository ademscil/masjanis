/**
 * Netlify Edge Function: og-meta.js
 * Intercepts requests to detail pages and injects correct OG meta tags
 * so WhatsApp/Facebook/Twitter previews show the right image.
 *
 * Handles: /teori-detail/*, /product-detail/*, /kelas-detail/*
 */

const SUPABASE_URL  = 'https://xauxhkzuadhdeddbcsdl.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhdXhoa3p1YWRoZGVkZGJjc2RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MDk3MDIsImV4cCI6MjA5MTI4NTcwMn0.TImpvJ0O9K3opSyVeHK4CoKDsBFjhEk118RoC0pWUwo';
const SITE_URL      = 'https://masjanis.com';
const DEFAULT_IMAGE = 'https://masjanis.com/assets/img/gambarlogo-removebg-preview.png';

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i').replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u').replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/\s+/g, '-').replace(/-+/g, '-');
}

async function fetchFromSupabase(table, titleField, slug) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=*&is_active=eq.true`;
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_ANON,
      'Authorization': `Bearer ${SUPABASE_ANON}`,
    }
  });
  if (!res.ok) return null;
  const rows = await res.json();
  return rows.find(r => slugify(r[titleField]) === slug) || null;
}

function stripHtml(html) {
  return String(html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200);
}

function injectMeta(html, { title, description, image, url }) {
  const safeTitle = title.replace(/"/g, '&quot;');
  const safeDesc  = description.replace(/"/g, '&quot;');
  const meta = `
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDesc}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${url}" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDesc}" />
  <meta name="twitter:image" content="${image}" />`;

  // Replace empty og meta tags that JS would fill
  let result = html
    .replace(/<meta property="og:title" content="" id="ogTitle" \/>/, `<meta property="og:title" content="${safeTitle}" id="ogTitle" />`)
    .replace(/<meta property="og:description" content="" id="ogDesc" \/>/, `<meta property="og:description" content="${safeDesc}" id="ogDesc" />`)
    .replace(/<meta property="og:image" content="" id="ogImage" \/>/, `<meta property="og:image" content="${image}" id="ogImage" />`)
    .replace(/<title>[^<]*<\/title>/, `<title>${safeTitle} – MasJanis</title>`)
    .replace(/<meta name="description" content="" id="metaDesc" \/>/, `<meta name="description" content="${safeDesc}" id="metaDesc" />`);

  // Also inject full set before </head> as fallback
  result = result.replace('</head>', `${meta}\n</head>`);
  return result;
}

export default async function handler(request, context) {
  const url      = new URL(request.url);
  const pathname = url.pathname;

  // Only process detail pages
  const teoriMatch   = pathname.match(/^\/teori-detail\/(.+)$/);
  const productMatch = pathname.match(/^\/product-detail\/(.+)$/);
  const kelasMatch   = pathname.match(/^\/kelas-detail\/(.+)$/);

  if (!teoriMatch && !productMatch && !kelasMatch) {
    return context.next();
  }

  // Only inject for crawlers (WhatsApp, Facebook, Twitter, Telegram, etc.)
  const ua = request.headers.get('user-agent') || '';
  const isCrawler = /facebookexternalhit|whatsapp|twitterbot|telegrambot|linkedinbot|slackbot|discordbot|googlebot|bingbot|applebot|curl|wget/i.test(ua);

  if (!isCrawler) {
    return context.next();
  }

  try {
    let item = null;
    let titleField = 'title';

    if (teoriMatch) {
      item = await fetchFromSupabase('articles', 'title', teoriMatch[1]);
    } else if (productMatch) {
      item = await fetchFromSupabase('products', 'name', productMatch[1]);
      titleField = 'name';
    } else if (kelasMatch) {
      item = await fetchFromSupabase('classes', 'title', kelasMatch[1]);
    }

    if (!item) return context.next();

    // Get the original HTML response
    const response = await context.next();
    const html     = await response.text();

    const title       = item[titleField] || item.title || item.name || 'MasJanis';
    const description = stripHtml(item.excerpt || item.description || '');
    const image       = item.image_url || DEFAULT_IMAGE;
    const pageUrl     = `${SITE_URL}${pathname}`;

    const injected = injectMeta(html, { title, description, image, url: pageUrl });

    return new Response(injected, {
      status: response.status,
      headers: {
        ...Object.fromEntries(response.headers),
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=300', // cache 5 menit untuk crawler
      },
    });

  } catch (e) {
    console.error('[og-meta]', e);
    return context.next();
  }
}

export const config = {
  path: ['/teori-detail/*', '/product-detail/*', '/kelas-detail/*'],
};
