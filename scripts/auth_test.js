const { chromium, firefox, webkit, devices } = require('playwright');

const BASE_URL = process.env.BASE_URL || 'http://localhost:4173';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const TARGETS = [
  { name: 'chromium-desktop', browserType: chromium, options: { viewport: { width: 1366, height: 900 } }, googleMode: 'popup' },
  { name: 'firefox-desktop', browserType: firefox, options: { viewport: { width: 1366, height: 900 } }, googleMode: 'popup' },
  { name: 'webkit-desktop', browserType: webkit, options: { viewport: { width: 1366, height: 900 } }, googleMode: 'redirect' },
  { name: 'chromium-android', browserType: chromium, options: { ...devices['Pixel 7'] }, googleMode: 'redirect' },
  { name: 'webkit-ios', browserType: webkit, options: { ...devices['iPhone 13'] }, googleMode: 'redirect' },
];

function shouldIgnoreError(text) {
  return /google\.firestore\.v1\.Firestore\/Listen\/channel/.test(text) && /(ERR_ABORTED|NS_BINDING_ABORTED|Load request cancelled)/.test(text);
}

async function testAdminLogin(context) {
  const page = await context.newPage();
  const errors = [];
  const warnings = [];
  page.on('pageerror', (error) => errors.push(`pageerror:${error.message}`));
  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'error' && !shouldIgnoreError(text)) errors.push(`console:${text}`);
    if (msg.type() === 'warning') warnings.push(text);
  });
  page.on('requestfailed', (request) => {
    const text = `${request.url()} => ${request.failure()?.errorText}`;
    if (!shouldIgnoreError(text)) errors.push(`requestfailed:${text}`);
  });

  await page.goto(`${BASE_URL}/admin.html`, { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(3000);
  await page.fill('#adminEmail', ADMIN_EMAIL);
  await page.fill('#adminPassword', ADMIN_PASSWORD);
  await page.click('button:has-text("دخول لوحة التحكم")');
  await page.waitForTimeout(6000);

  const bodyText = await page.locator('body').innerText();
  const success = /لوحة التحكم/.test(bodyText) && !/ليس لديك صلاحية|البريد الإلكتروني أو كلمة المرور غير صحيحة/.test(bodyText);
  const dashboardVisible = await page.locator('text=إضافة إعلان').count().catch(() => 0);

  await page.close();
  return { success: success || dashboardVisible > 0, errors, warnings: warnings.slice(0, 10) };
}

async function testGoogleAuthInitiation(context, mode) {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(`pageerror:${error.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console:${msg.text()}`);
  });
  await page.goto(`${BASE_URL}/index.html#login`, { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(3000);

  let initiated = false;
  let destination = 'none';
  try {
    if (mode === 'popup') {
      const [popup] = await Promise.all([
        page.waitForEvent('popup', { timeout: 10000 }),
        page.click('button:has-text("تسجيل بـ Google")')
      ]);
      await popup.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => null);
      destination = popup.url();
      initiated = /accounts\.google\.com|__/i.test(destination);
      await popup.close().catch(() => null);
    } else {
      await page.click('button:has-text("تسجيل بـ Google")');
      await page.waitForURL(/accounts\.google\.com|\/__\/auth\//, { timeout: 15000 }).catch(() => null);
      destination = page.url();
      initiated = /accounts\.google\.com|\/__\/auth\//i.test(destination);
    }
  } catch (error) {
    errors.push(`google-init:${error.message}`);
  }

  await page.close().catch(() => null);
  return { initiated, destination, errors };
}

(async () => {
  const results = [];
  for (const target of TARGETS) {
    const browser = await target.browserType.launch({ headless: true });
    const context = await browser.newContext(target.options);
    try {
      const adminLogin = await testAdminLogin(context);
      const googleFlow = await testGoogleAuthInitiation(context, target.googleMode);
      results.push({ target: target.name, adminLogin, googleFlow });
    } finally {
      await context.close();
      await browser.close();
    }
  }
  console.log(JSON.stringify(results, null, 2));
})();
