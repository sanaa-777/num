// ============================================================
// Cloudflare Worker — Open Graph Proxy for Dalil Yemen
// ============================================================
// Provides proper OG meta tags for WhatsApp/Facebook/Telegram
// crawlers, which don't execute JavaScript.
//
// Free tier: 100,000 requests/day, no payment card needed.
//
// SETUP:
//   1. Go to https://dash.cloudflare.com → sign up (free)
//   2. Workers & Pages → Create Application → Create Worker
//   3. Name: og-dalil-yemen
//   4. Paste this entire code → Deploy
//   5. Copy the worker URL (e.g. og-dalil-yemen.xxx.workers.dev)
//   6. Update SHARE_BASE_URL in app/app.js to that URL
// ============================================================

const FIREBASE_PROJECT = 'deel-39f2e';
const FIREBASE_API_KEY = 'AIzaSyBAGdUGSb1tAVNA_PC6LbNM_jTG6P6VdG4';
const SPA_BASE = 'https://dalil-yemen-deel.web.app';
const DEFAULT_IMAGE = 'https://dalil-yemen-deel.web.app/assets/branding/og-image.jpg';
const SITE_NAME = 'الدليل اليمني التجاري';

// Collection mapping
const COLLECTIONS = {
  place: 'places',
  offer: 'offers',
  job: 'jobs',
  event: 'events',
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\//, '').replace(/\/$/, '');

    // Parse: type/id
    const parts = path.split('/');
    const type = parts[0];
    const id = parts[1];

    if (!type || !id || !COLLECTIONS[type]) {
      return Response.redirect(SPA_BASE, 302);
    }

    try {
      // Fetch item from Firestore REST API (public read)
      const collection = COLLECTIONS[type];
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/${collection}/${id}`;

      const resp = await fetch(firestoreUrl);
      if (!resp.ok) {
        return Response.redirect(`${SPA_BASE}/#${type}/${id}`, 302);
      }

      const doc = await resp.json();
      const f = doc.fields || {};

      // Extract fields
      const title = f.title?.stringValue || f.name?.stringValue || SITE_NAME;
      const description = f.description?.stringValue || f.bio?.stringValue || `${SITE_NAME} - الدليل الشامل للأعمال والأماكن في اليمن`;

      // Get image: try 'image' field, then 'imageUrl', then 'images' array, then default
      let image = f.image?.stringValue || f.imageUrl?.stringValue || '';
      if (!image && f.images?.arrayValue?.values?.length > 0) {
        image = f.images.arrayValue.values[0].stringValue || '';
      }
      if (!image) {
        image = DEFAULT_IMAGE;
      }

      // Build canonical share URL
      const shareUrl = `${SPA_BASE}/${type}/${id}`;

      // Determine type label in Arabic
      const typeLabels = {
        place: 'نشاط',
        offer: 'عرض',
        job: 'وظيفة',
        event: 'فعالية',
      };
      const typeLabel = typeLabels[type] || '';

      // Build HTML with OG tags
      const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} | ${SITE_NAME}</title>

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${escapeHtml(shareUrl)}">
  <meta property="og:locale" content="ar_YE">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">

  <!-- Redirect to SPA -->
  <noscript>
    <meta http-equiv="refresh" content="0;url=${SPA_BASE}/#${type}/${id}">
  </noscript>
</head>
<body>
  <p>جاري التحميل...</p>
  <script>
    // Redirect to SPA with hash routing
    window.location.replace('${SPA_BASE}/#${type}/${id}');
  </script>
</body>
</html>`;

      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (err) {
      // On error, redirect to SPA
      return Response.redirect(`${SPA_BASE}/#${type}/${id}`, 302);
    }
  },
};

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
