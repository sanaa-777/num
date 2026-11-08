'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'tailwind.input.css'), 'utf8');
const config = require(path.join(root, 'tailwind.config.cjs'));
const htmlPages = ['index.html', 'admin.html', 'about.html', 'privacy.html', '404.html'];
const checkedSources = ['app/styles.css', 'app/app.js', 'app/ads.js', 'admin.html'];
const expectedWeights = ['400', '500', '600', '700'];
const faces = [...css.matchAll(/@font-face\s*\{([^}]+)\}/g)].map((match) => match[1]);

assert.equal(faces.length, expectedWeights.length, 'Expected one locally hosted face per selected Arabic weight');
for (const weight of expectedWeights) {
  const face = faces.find((block) => new RegExp(`font-weight:\\s*${weight};`).test(block));
  assert.ok(face, `Missing IBM Plex Sans Arabic weight ${weight}`);
  assert.match(face, /font-display:\s*swap;/, `Weight ${weight} must not block text rendering`);
  assert.match(face, new RegExp(`ibm-plex-sans-arabic-${weight}\\.woff2`), `Weight ${weight} must be loaded locally`);
}

assert.equal(config.theme.extend.fontFamily.sans[0], 'IBM Plex Sans Arabic');
assert.equal(config.theme.extend.fontFamily.arabic[0], 'IBM Plex Sans Arabic');
assert.match(css, /--font-arabic:\s*"IBM Plex Sans Arabic"/);
assert.match(css, /line-height:\s*1\.72/);
assert.match(css, /line-height:\s*1\.78/);
assert.match(css, /font-weight:\s*600/);

for (const page of htmlPages) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  assert.match(html, /rel="preload"[^>]+ibm-plex-sans-arabic-400\.woff2/, `${page} should preload the local regular face`);
  assert.doesNotMatch(html, /fonts\.googleapis\.com\/css2\?family=/, `${page} should not depend on Google Fonts at runtime`);
  assert.doesNotMatch(html, /Noto Kufi Arabic/, `${page} should not override the unified Arabic font`);
  assert.doesNotMatch(html, /font-size:\s*9px\b/, `${page} should not use micro-sized text`);
}

for (const filename of checkedSources) {
  const source = fs.readFileSync(path.join(root, filename), 'utf8');
  assert.doesNotMatch(source, /Noto Kufi Arabic/, `${filename} should use the unified family`);
  assert.doesNotMatch(source, /text-\[(?:8|9)px\]/, `${filename} should not contain unreadably small text utilities`);
  assert.doesNotMatch(source, /font-size:\s*9px\b/, `${filename} should not use micro-sized text`);
}

const fontDirectory = path.join(root, 'assets', 'fonts');
let totalBytes = 0;
for (const weight of expectedWeights) {
  const file = path.join(fontDirectory, `ibm-plex-sans-arabic-${weight}.woff2`);
  const data = fs.readFileSync(file);
  assert.equal(data.subarray(0, 4).toString('ascii'), 'wOF2', `Invalid WOFF2 asset for weight ${weight}`);
  totalBytes += data.length;
}
assert.ok(totalBytes < 200_000, `Arabic font assets should stay compact (got ${totalBytes} bytes)`);
assert.match(fs.readFileSync(path.join(fontDirectory, 'OFL.txt'), 'utf8'), /SIL OPEN FONT LICENSE/i);

console.log(`Typography regression checks passed; ${faces.length} local weights, ${totalBytes} bytes total.`);
