const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const imageStorageSource = fs.readFileSync('app/image-storage.js', 'utf8');
const appSource = fs.readFileSync('app/app.js', 'utf8');

// Regression: the production flow must decode the canvas data URL directly.
assert.match(appSource, /ImageStorage\._dataURLtoBlob\(dataUrl\)/);
assert.doesNotMatch(appSource, /fetch\(dataUrl\)/);

// Regression: the built-in Cloudinary connection test must use valid base64.
const tinyPng = imageStorageSource.match(/var TINY_PNG = '([^']+)'/);
assert.ok(tinyPng, 'Cloudinary test PNG constant exists');
const encodedPng = tinyPng[1].split(',')[1];
assert.ok(encodedPng.length % 4 === 0, 'test PNG base64 has valid padding');
assert.ok(Buffer.from(encodedPng, 'base64').length > 32, 'test PNG decodes to non-empty bytes');

// Run ImageStorage in an isolated browser-like context and verify the data URL
// conversion plus user-visible timeout behavior without contacting Cloudinary.
const imageStorage = vm.runInNewContext(`${imageStorageSource}\n;ImageStorage;`, {
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  Blob,
  File,
  FormData,
  atob,
  AbortController,
  setTimeout,
  clearTimeout,
  console,
  fetch: (_url, options) => new Promise((_resolve, reject) => {
    options.signal.addEventListener('abort', () => {
      const error = new Error('aborted');
      error.name = 'AbortError';
      reject(error);
    });
  })
});

const blob = imageStorage._dataURLtoBlob(tinyPng[1]);
assert.equal(blob.type, 'image/png');
assert.ok(blob.size > 32);

(async () => {
  imageStorage.UPLOAD_TIMEOUT_MS = 20;
  await assert.rejects(
    imageStorage.upload(blob, 'regression-test'),
    /انتهت مهلة رفع الصورة/
  );
  console.log('PASS image-upload regression checks');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
