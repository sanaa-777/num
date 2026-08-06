const { chromium, firefox, webkit, devices } = require('playwright');

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4173';
const TARGETS = [
  { name: 'chromium-desktop', browserType: chromium, options: { viewport: { width: 1366, height: 900 } } },
  { name: 'firefox-desktop', browserType: firefox, options: { viewport: { width: 1366, height: 900 } } },
  { name: 'webkit-desktop', browserType: webkit, options: { viewport: { width: 1366, height: 900 } } },
  { name: 'chromium-android', browserType: chromium, options: { ...devices['Pixel 7'] } },
  { name: 'webkit-ios', browserType: webkit, options: { ...devices['iPhone 13'] } },
];

async function testPage(context, pagePath) {
  const page = await context.newPage();
  const errors = [];
  const consoleWarnings = [];

  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') errors.push(`console:${type}: ${text}`);
    if (type === 'warning') consoleWarnings.push(`console:${type}: ${text}`);
  });
  page.on('requestfailed', (request) => {
    errors.push(`requestfailed: ${request.url()} => ${request.failure()?.errorText}`);
  });

  const url = `${BASE_URL}${pagePath}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForLoadState('load', { timeout: 45000 }).catch(() => null);
  await page.waitForTimeout(3000);
  const bodyText = await page.locator('body').innerText();
  const title = await page.title();
  const hasErrorCard = /تعذر|خطأ في تحميل/.test(bodyText);
  const hasMainLoader = /جاري تحميل/.test(bodyText) && bodyText.trim().length < 120;

  await page.close();

  return {
    path: pagePath,
    title,
    hasErrorCard,
    hasMainLoader,
    errorCount: errors.length,
    warningCount: consoleWarnings.length,
    errors: errors.slice(0, 10),
    warnings: consoleWarnings.slice(0, 10)
  };
}

(async () => {
  const results = [];
  for (const target of TARGETS) {
    const browser = await target.browserType.launch({ headless: true });
    const context = await browser.newContext(target.options);
    try {
      const home = await testPage(context, '/index.html');
      const admin = await testPage(context, '/admin.html');
      results.push({
        target: target.name,
        home,
        admin
      });
    } finally {
      await context.close();
      await browser.close();
    }
  }
  console.log(JSON.stringify(results, null, 2));
})();
