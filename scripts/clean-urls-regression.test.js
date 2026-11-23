const assert = require('node:assert/strict');
const fs = require('node:fs');

const read = (file) => fs.readFileSync(file, 'utf8');
const appSource = read('app/app.js');
const versionSource = read('app/version-manager.js');
const stampSource = read('scripts/stamp-build.js');
const indexSource = read('index.html');
const sitemapSource = read('sitemap.xml');
const robotsSource = read('robots.txt');
const firebase = JSON.parse(read('firebase.json'));

assert.match(appSource, /getCurrentRoute\(\)/, 'the app resolves routes from clean paths');
assert.match(appSource, /_routeToPath\(route\)/, 'legacy routes convert to path URLs');
assert.match(appSource, /_syncCleanRouteUrl\(hash\)/, 'legacy hashes are normalized on navigation');
assert.match(appSource, /const search = queryIndex < 0 \? url\.search : target\.slice\(queryIndex\)/, 'query parameters embedded in a legacy hash are preserved when converted');
assert.match(appSource, /searchParams\.has\('q'\)/, 'clean search pages read their q parameter');
assert.match(appSource, /_normalizeRouteLinks\(app\)/, 'rendered internal links use clean paths');
assert.match(appSource, /addEventListener\('popstate'/, 'browser back and forward are handled');
assert.doesNotMatch(appSource, /Path-to-hash redirect/, 'clean detail paths are not redirected back to hashes');

assert.match(versionSource, /removeLegacyDocumentVersion\(\)/, 'old document-level v= parameters are removed');
assert.match(versionSource, /url\.searchParams\.delete\('v'\)/, 'reloads do not retain a build query parameter');
assert.doesNotMatch(versionSource, /searchParams\.set\('v'/, 'the version manager never adds v= to page URLs');
assert.match(stampSource, /stampHtmlAssets/, 'build stamping is scoped to HTML asset references');
assert.ok(stampSource.includes('(?:css|js)'), 'only CSS and JavaScript receive version query parameters');
assert.ok(stampSource.includes('(?:json|png|jpe?g|svg|ico|webp)'), 'static non-code assets have build query parameters stripped');

assert.equal(firebase.hosting.cleanUrls, true, 'Firebase Hosting serves clean static page URLs');
const rewriteSources = new Set(firebase.hosting.rewrites.map((rewrite) => rewrite.source));
for (const route of ['/place/**', '/category/**', '/subcategory/**', '/home', '/search', '/offers', '/jobs', '/events', '/pricing', '/login', '/signup', '/profile', '/favorites', '/notifications', '/myplaces', '/myads', '/add']) {
  assert.ok(rewriteSources.has(route), `Firebase rewrite exists for ${route}`);
}
for (const route of ['/admin', '/admin.html']) {
  const adminHeaders = firebase.hosting.headers.find((rule) => rule.source === route);
  assert.ok(adminHeaders, `${route} retains dedicated headers`);
  assert.ok(adminHeaders.headers.some((header) => header.key === 'Cache-Control' && /no-store/.test(header.value)), `${route} stays non-cacheable`);
  assert.ok(adminHeaders.headers.some((header) => header.key === 'Content-Security-Policy'), `${route} CSP remains configured`);
}

assert.match(indexSource, /<link rel="canonical" href="https:\/\/dalil-yemen-deel\.web\.app\/"\s*\/?>/, 'homepage canonical is the clean production root');
assert.match(indexSource, /dalil-yemen-deel\.web\.app\/search\?q=\{search_term_string\}/, 'SearchAction uses the clean search path');
assert.doesNotMatch(sitemapSource, /#|\?v=/, 'sitemap contains no hash routes or build-version queries');
assert.match(sitemapSource, /https:\/\/dalil-yemen-deel\.web\.app\//, 'sitemap uses the canonical production host');
assert.match(robotsSource, /Disallow: \/admin(?:\r?\n|$)/, 'the clean admin URL remains excluded from crawlers');

for (const file of ['index.html', 'admin.html', 'about.html', 'privacy.html']) {
  const source = read(file);
  const versionedUrls = source.match(/(?:src|href)=["'][^"']+\?v=[^"']+["']/g) || [];
  for (const reference of versionedUrls) {
    assert.match(reference, /\.(?:css|js)\?v=/, `${file}: only stylesheet and script assets carry v=`);
  }
}

console.log('PASS clean URL regression checks');
