const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const authSource = fs.readFileSync('app/auth-firestore.js', 'utf8');
const appSource = fs.readFileSync('app/app.js', 'utf8');

function extractMethod(source, name) {
  const marker = `  ${name}(`;
  const asyncMarker = `  async ${name}(`;
  const start = source.indexOf(asyncMarker) !== -1 ? source.indexOf(asyncMarker) : source.indexOf(marker);
  assert.notEqual(start, -1, `method exists: ${name}`);
  const open = source.indexOf('{', start);
  assert.notEqual(open, -1, `method body exists: ${name}`);
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth++;
    if (source[i] === '}') depth--;
    if (depth === 0) return source.slice(start, i + 1);
  }
  assert.fail(`method closes: ${name}`);
}

function loadMethod(source, name, globals = {}) {
  return vm.runInNewContext(`({${extractMethod(source, name)}}).${name}`, globals);
}

async function main() {
  assert.match(authSource,
    /getRedirectResult\(\)\s*\.then\(\(result\) => this\._completeGoogleRedirect\(result\)\)\s*\.catch\(\(error\) =>[\s\S]*?this\._reportRedirectAuthError\(error\)/,
    'redirect result is completed and failures are surfaced');
  assert.match(authSource,
    /this\.currentUser && \['login', 'signup'\]\.includes\(route\) && App\._navigateHomeAfterAuth/,
    'a restored signed-in user is not left on login/signup');
  assert.match(appSource,
    /Auth\.currentUser && \['login', 'signup'\]\.includes\(initView\)/,
    'initial rendering redirects an already-authenticated visitor from auth pages');

  const navigation = [];
  const app = {
    _navigateHomeAfterAuth() { navigation.push('home'); },
    render() { navigation.push('render'); }
  };
  const complete = loadMethod(authSource, '_completeGoogleRedirect', { App: app });
  let normalized = null;
  const authContext = {
    async _normalizeSocialUser(user) {
      navigation.push('profile-saved');
      normalized = user;
      return { id: user.uid };
    }
  };
  assert.equal(await complete.call(authContext, null), null, 'no redirect result is a no-op');
  assert.deepEqual(navigation, [], 'no redirect result does not navigate');

  const redirectUser = { uid: 'google-user-1' };
  const result = await complete.call(authContext, { user: redirectUser });
  assert.equal(normalized, redirectUser, 'redirect user profile is normalized');
  assert.equal(result.id, 'google-user-1', 'normalized user is returned');
  assert.deepEqual(navigation, ['profile-saved', 'home'], 'successful redirect saves profile before navigating home');

  let errorText = '';
  let revealed = false;
  const errorElement = {
    querySelector() { return { set textContent(value) { errorText = value; } }; },
    classList: { remove(name) { if (name === 'hidden') revealed = true; } }
  };
  const globals = {
    location: { hash: '#signup' },
    document: { getElementById(id) { return id === 'signupError' ? errorElement : null; } },
    App: { showToast() { assert.fail('signup error should appear inline'); } }
  };
  const flush = loadMethod(authSource, '_flushRedirectAuthError', globals);
  const report = loadMethod(authSource, '_reportRedirectAuthError', globals);
  const reported = [];
  const errorContext = {
    _pendingRedirectAuthError: null,
    _handleError(error) { reported.push(error); },
    _flushRedirectAuthError: flush
  };
  const providerConflict = { code: 'auth/account-exists-with-different-credential' };
  report.call(errorContext, providerConflict);
  assert.equal(reported[0], providerConflict, 'redirect errors are recorded');
  assert.match(errorText, /حساب مسجل/, 'account/provider conflict has an actionable Arabic message');
  assert.doesNotMatch(errorText, /اربط Google من إعدادات حسابك/, 'error does not promise an unavailable account-linking flow');
  assert.equal(revealed, true, 'redirect failure is visible on the signup form');
  assert.equal(errorContext._pendingRedirectAuthError, null, 'displayed errors are cleared from pending state');

  console.log('PASS Google redirect regression checks');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
