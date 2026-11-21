const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('admin.html', 'utf8');
const backend = fs.readFileSync('app/admin-firestore.js', 'utf8');

assert.doesNotMatch(html, /Admin\.initDefaultAdmin\s*\(/,
  'admin page must not call a removed or insecure default-admin initializer');
assert.doesNotMatch(backend, /initDefaultAdmin\s*\(/,
  'browser admin backend must not define a self-promotion initializer');
assert.match(html, /if \(Auth\.currentUser && Auth\.currentUser\.role === 'admin'\)\s*\{\s*await this\.showAdminPanel\(\);/,
  'existing authenticated admin is verified before the dashboard is shown');
assert.match(html, /if \(!user \|\| user\.role !== 'admin'\)\s*\{/,
  'login rejects accounts without the admin role');
assert.match(html, /Data\._invalidateCache\(\);\s*await AdminPanel\.render\(\);/,
  'dashboard refreshes data and renders without default-admin creation');

console.log('PASS admin initialization regression checks');
