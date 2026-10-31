const assert = require('node:assert/strict');
const fs = require('node:fs');

const appSource = fs.readFileSync('app/app.js', 'utf8');
const hosting = JSON.parse(fs.readFileSync('firebase.json', 'utf8'));
const indexSource = fs.readFileSync('index.html', 'utf8');
const workerSource = fs.readFileSync('sw.js', 'utf8');

const imageUrlsMatch = appSource.match(/getPlaceImageUrls\(place\)\s*\{([\s\S]*?)\n  \},/);
assert.ok(imageUrlsMatch, 'place image URL normalizer exists');
const getPlaceImageUrls = new Function('place', imageUrlsMatch[1]);
assert.deepEqual(
  getPlaceImageUrls({ images: ['https://cdn.test/a.jpg', 'https://cdn.test/a.jpg'], image: 'https://cdn.test/b.jpg' }),
  ['https://cdn.test/a.jpg', 'https://cdn.test/b.jpg'],
  'image arrays are deduplicated and the legacy singular image field is retained'
);

const jpegMatch = appSource.match(/_cloudinaryJpegFallback\(url\)\s*\{([\s\S]*?)\n  \},/);
assert.ok(jpegMatch, 'Cloudinary JPEG fallback exists');
const cloudinaryJpegFallback = new Function('url', jpegMatch[1]);
assert.equal(
  cloudinaryJpegFallback('https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/v123/folder/a.jpg'),
  'https://res.cloudinary.com/demo/image/upload/f_jpg,q_auto/v123/folder/a.jpg',
  'automatic WebP/AVIF delivery falls back to a broadly supported JPEG'
);
assert.equal(
  cloudinaryJpegFallback('https://res.cloudinary.com/demo/image/upload/v123/folder/a.jpg'),
  'https://res.cloudinary.com/demo/image/upload/f_jpg,q_auto/v123/folder/a.jpg',
  'an untransformed Cloudinary URL receives an explicit display transformation'
);
assert.equal(cloudinaryJpegFallback('https://example.com/a.jpg'), null,
  'non-Cloudinary images are not rewritten');

const cardMatch = appSource.match(/renderPlaceCard\(p\)\s*\{([\s\S]*?)\n  \},/);
assert.ok(cardMatch, 'the shared activity-card renderer exists');
assert.match(cardMatch[1], /getPlaceImageUrls\(p\)/,
  'cards use the normalized plural and legacy singular image fields');
assert.match(cardMatch[1], /_cloudinaryJpegFallback\(firstImage\)/,
  'homepage, category, recommendation, and search cards request compatible JPEGs');
assert.match(cardMatch[1], /handlePlaceCardImageError\(this\)/,
  'card failures reveal a real placeholder rather than hiding the image silently');
assert.match(cardMatch[1], /data-place-image-fallback/,
  'cards provide a visible fallback behind the image');
assert.doesNotMatch(cardMatch[1], /onerror="this\.style\.display='none'"/,
  'the shared card renderer never silently hides failures');
assert.ok((appSource.match(/_cloudinaryJpegFallback\(imageUrl\)/g) || []).length >= 2,
  'My Places and My Advertisements use the same compatible URL strategy');

const cardErrorMatch = appSource.match(/handlePlaceCardImageError\(img\)\s*\{([\s\S]*?)\n  \},/);
assert.ok(cardErrorMatch, 'the generic activity-card error handler exists');
assert.match(cardErrorMatch[1], /data-place-image-fallback/,
  'failed cards reveal their contextual placeholder');

const galleryStart = appSource.indexOf('id="placeGallery"');
const galleryEnd = appSource.indexOf('${place.verified', galleryStart);
assert.notEqual(galleryStart, -1, 'place details gallery exists');
assert.notEqual(galleryEnd, -1, 'gallery template has a bounded end');
const gallery = appSource.slice(galleryStart, galleryEnd);
assert.match(gallery, /object-contain/, 'gallery preserves the full image aspect ratio');
assert.match(gallery, /_cloudinaryJpegFallback\(placeImages\[0\]\)/,
  'the first Cloudinary image is requested as JPEG for broad browser compatibility');
assert.match(gallery, /onerror="App\.handlePlaceGalleryImageError\(this\)"/,
  'failed source images use an explicit recovery path');
assert.match(gallery, /placeGalleryFallback/, 'failed images show a visible fallback instead of a blank card');
assert.doesNotMatch(gallery, /onerror="this\.style\.display='none'"/,
  'gallery errors are not silently hidden');
assert.match(appSource, /img\.src = this\._cloudinaryJpegFallback\(this\._galleryImages\[index\]\) \|\| this\._galleryImages\[index\];/,
  'manual gallery navigation uses the same compatible Cloudinary image URL');

const recoveryMatch = appSource.match(/async handlePlaceGalleryImageError\(img\)\s*\{([\s\S]*?)\n  \},\n  galleryGoTo/);
assert.ok(recoveryMatch, 'gallery error recovery exists');
assert.match(recoveryMatch[1], /mode: 'cors'/, 'recovery uses CORS for Cloudinary');
assert.match(recoveryMatch[1], /credentials: 'omit'/, 'image requests do not send user credentials');
assert.match(recoveryMatch[1], /URL\.createObjectURL\(blob\)/, 'successful fetches become displayable blob URLs');
assert.match(recoveryMatch[1], /contentType\.startsWith\('image\/'\)/,
  'non-image responses are rejected');
assert.match(recoveryMatch[1], /AbortController/, 'fallback requests have a bounded timeout');

const mainPolicy = hosting.hosting.headers.find(entry => entry.source === '**')
  .headers.find(header => header.key === 'Content-Security-Policy').value;
const imgSrc = mainPolicy.split(';').find(directive => directive.trim().startsWith('img-src'));
const connectSrc = mainPolicy.split(';').find(directive => directive.trim().startsWith('connect-src'));
assert.match(imgSrc, /https:\/\/res\.cloudinary\.com/, 'Cloudinary is allowed as an image source');
assert.match(imgSrc, /blob:/, 'recovered object URLs are allowed as image sources');
assert.match(connectSrc, /https:\/\/res\.cloudinary\.com/,
  'CSP allows the CORS fetch used to recover a failed image element');

assert.match(workerSource,
  /url\.hostname === 'res\.cloudinary\.com'[\s\S]*event\.request\.destination === 'image'[\s\S]*return;/,
  'Cloudinary image requests bypass opaque Service Worker proxy/cache handling');
assert.match(indexSource, /DY_VERSION_ACTIVATED/,
  'open tabs detect that the Service Worker activated a newer build');
assert.match(indexSource, /dy-sw-reloaded-/,
  'the update reload is guarded to happen only once per build');
assert.match(indexSource, /sw\.js\?build=/,
  'Service Worker registrations use a clean versioned URL');
for (const path of ['/', '/index.html', '/sw.js']) {
  const header = hosting.hosting.headers.find(entry => entry.source === path)
    ?.headers.find(entry => entry.key === 'Cache-Control');
  assert.ok(header && /no-store/.test(header.value), `${path} bypasses browser/CDN stale caching`);
}
const appScriptCache = hosting.hosting.headers.find(entry => entry.source === '/app/*.js')
  ?.headers.find(entry => entry.key === 'Cache-Control');
assert.ok(appScriptCache && /no-store/.test(appScriptCache.value),
  'app scripts are revalidated instead of serving stale builds');

console.log('PASS place-image rendering, format fallback, and CSP regression checks');
