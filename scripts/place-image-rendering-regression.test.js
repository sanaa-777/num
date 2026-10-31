const assert = require('node:assert/strict');
const fs = require('node:fs');

const appSource = fs.readFileSync('app/app.js', 'utf8');
const hosting = JSON.parse(fs.readFileSync('firebase.json', 'utf8'));

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

console.log('PASS place-image rendering, format fallback, and CSP regression checks');
