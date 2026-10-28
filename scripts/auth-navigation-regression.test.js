const assert = require('node:assert/strict');
const fs = require('node:fs');

const appSource = fs.readFileSync('app/app.js', 'utf8');
const authSource = fs.readFileSync('app/auth-firestore.js', 'utf8');

function methodBetween(startMarker, endMarker) {
  const start = appSource.indexOf(startMarker);
  const end = appSource.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(start, -1, `method exists: ${startMarker}`);
  assert.notEqual(end, -1, `end marker exists: ${endMarker}`);
  return appSource.slice(start, end);
}

const login = methodBetween('async doLogin()', 'async doResetPassword()');
const signup = methodBetween('async doSignup()', 'async doGoogleLogin()');
const googleLogin = methodBetween('async doGoogleLogin()', '// ====== IMAGE GALLERY ======');

for (const [name, source] of [
  ['email login', login],
  ['signup', signup],
  ['Google login', googleLogin]
]) {
  assert.match(source, /this\._beginAuthNavigation\(\)/, `${name} marks pending home navigation`);
  assert.match(source, /this\._navigateHomeAfterAuth\(\)/, `${name} uses centralized home navigation`);
  assert.doesNotMatch(source, /this\.render\(\)/, `${name} does not force a duplicate full render`);
}

assert.match(appSource, /_lastRenderedUserId = user\?\.id \|\| null/,
  'render records which user was rendered');
assert.match(authSource, /const target = App\._authNavigationTarget/,
  'auth state listener consumes the pending navigation target');
assert.match(authSource, /App\._lastRenderedUserId !== \(this\.currentUser\?\.id \|\| null\)/,
  'auth listener avoids a second render when the target user is already rendered');

console.log('PASS auth-navigation regression checks');
