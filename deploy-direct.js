#!/usr/bin/env node
// =============================================
// Direct Firebase Hosting Deploy — zero npm deps
// Uses Node.js built-in crypto + https only
// =============================================

const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ====== CONFIG ======
const PROJECT_ID = 'deel-39f2e';
const SITE_ID = 'dalil-yemen-deel';
const SA_PATH = path.join(__dirname, 'service-account.json');

// Files to deploy (relative to project root)
const DEPLOY_FILES = [
  'index.html', 'admin.html', 'about.html', 'privacy.html', 'share.html', '404.html',
  'manifest.json', 'sw.js', 'firebase-messaging-sw.js', 'firebase.json',
  'app/firebase-config.js', 'app/auth-firestore.js', 'app/data-firestore.js',
  'app/admin-firestore.js', 'app/ads-firestore.js', 'app/offers-firestore.js',
  'app/jobs-firestore.js', 'app/events-firestore.js', 'app/pricing-firestore.js',
  'app/image-storage.js', 'app/error-tracker.js', 'app/app.js',
  'app/build-meta.js', 'app/version-manager.js', 'app/styles.css',
  'app/tailwind.css', 'app/lucide-local.js'
];

// ====== HELPERS ======
function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function httpsRequest(url, options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const data = Buffer.concat(chunks).toString();
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function getAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/firebase',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  }));
  const unsigned = `${header}.${payload}`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(unsigned);
  const signature = b64url(sign.sign(sa.private_key));
  const jwt = `${unsigned}.${signature}`;

  const res = await httpsRequest('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }, `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`);

  if (res.status !== 200) throw new Error(`Token error: ${JSON.stringify(res.data)}`);
  return res.data.access_token;
}

function uploadRequest(url, token, method, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const opts = {
      hostname: u.hostname, path: u.pathname + u.search, method,
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    };
    if (body) opts.headers['Content-Length'] = Buffer.byteLength(body);
    const req = https.request(opts, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const data = Buffer.concat(chunks).toString();
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  // Check service account
  if (!fs.existsSync(SA_PATH)) {
    console.error(`❌ Missing: ${SA_PATH}`);
    console.error('   Download your Firebase service account key and save it as service-account.json');
    process.exit(1);
  }

  const sa = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'));
  console.log(`📋 Project: ${sa.project_id}`);
  console.log(`📧 SA: ${sa.client_email}`);

  // Get access token
  console.log('🔑 Getting access token...');
  const token = await getAccessToken(sa);
  console.log('✅ Token acquired');

  // Read files
  console.log('📦 Reading files...');
  const files = {};
  let totalSize = 0;
  for (const rel of DEPLOY_FILES) {
    const fp = path.join(__dirname, rel);
    if (fs.existsSync(fp)) {
      const content = fs.readFileSync(fp);
      files[rel] = content.toString('base64');
      totalSize += content.length;
    }
  }
  console.log(`   ${Object.keys(files).length} files, ${(totalSize/1024).toFixed(0)} KB`);

  // Create version
  console.log('📝 Creating new version...');
  const versionRes = await uploadRequest(
    `https://firebasehosting.googleapis.com/v1beta1/sites/${SITE_ID}/versions`,
    token, 'POST', JSON.stringify({})
  );
  if (versionRes.status !== 200) {
    console.error('❌ Version create failed:', JSON.stringify(versionRes.data));
    process.exit(1);
  }
  const versionName = versionRes.data.name;
  console.log(`   Version: ${versionName}`);

  // Populate files
  console.log('📤 Populating files...');
  const populateBody = {};
  for (const [name, b64] of Object.entries(files)) {
    populateBody[`/${name}`] = { b64 };
  }
  const popRes = await uploadRequest(
    `https://firebasehosting.googleapis.com/v1beta1/${versionName}:populateFiles`,
    token, 'POST', JSON.stringify({ files: populateBody })
  );
  if (popRes.status !== 200) {
    console.error('❌ Populate failed:', JSON.stringify(popRes.data));
    process.exit(1);
  }
  console.log('✅ Files populated');

  // Finalize
  console.log('🔒 Finalizing version...');
  const finRes = await uploadRequest(
    `https://firebasehosting.googleapis.com/v1beta1/${versionName}`,
    token, 'PATCH', JSON.stringify({ status: 'FINALIZED' })
  );
  if (finRes.status !== 200) {
    console.error('❌ Finalize failed:', JSON.stringify(finRes.data));
    process.exit(1);
  }
  console.log('✅ Version finalized');

  // Release
  console.log('🚀 Releasing...');
  const relRes = await uploadRequest(
    `https://firebasehosting.googleapis.com/v1beta1/sites/${SITE_ID}/releases`,
    token, 'POST', JSON.stringify({ versionName })
  );
  if (relRes.status !== 200) {
    console.error('❌ Release failed:', JSON.stringify(relRes.data));
    process.exit(1);
  }
  console.log('✅ Released!');
  console.log(`🌐 https://${SITE_ID}.web.app`);
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
