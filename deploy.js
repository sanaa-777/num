#!/usr/bin/env node
var https = require('https');
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var zlib = require('zlib');

var SA_PATH = '/home/work/.openclaw/workspace/deel-39f2e-firebase-adminsdk-fbsvc-a63e97561a.json';
var sa = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'));
var SITE = 'dalil-yemen-deel';

function toBase64Url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function jwtSign(payload, privateKey) {
  var header = { alg: 'RS256', typ: 'JWT' };
  var enc = toBase64Url(Buffer.from(JSON.stringify(header))) + '.' + toBase64Url(Buffer.from(JSON.stringify(payload)));
  var sig = crypto.createSign('RSA-SHA256').update(enc).sign(privateKey);
  return enc + '.' + toBase64Url(sig);
}
function getAccessToken() {
  var now = Math.floor(Date.now() / 1000);
  var claim = { iss: sa.client_email, scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 };
  return httpPost('oauth2.googleapis.com', '/token',
    'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + jwtSign(claim, sa.private_key),
    { 'Content-Type': 'application/x-www-form-urlencoded' }).then(function(b) { return b.access_token; });
}
function httpPost(host, urlPath, body, headers) {
  return new Promise(function(resolve, reject) {
    var data = typeof body === 'string' ? body : JSON.stringify(body);
    var opts = { hostname: host, path: urlPath, method: 'POST',
      headers: Object.assign({}, headers || {}, { 'Content-Length': Buffer.byteLength(data) }) };
    var req = https.request(opts, function(res) {
      var d = ''; res.on('data', function(c) { d += c; }); res.on('end', function() {
        try { resolve(JSON.parse(d)); } catch(e) { resolve(d); }
      });
    });
    req.on('error', reject); req.write(data); req.end();
  });
}
function httpPatch(host, urlPath, obj, token) {
  return new Promise(function(resolve, reject) {
    var data = JSON.stringify(obj);
    var opts = { hostname: host, path: urlPath, method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token,
        'Content-Length': Buffer.byteLength(data) } };
    var req = https.request(opts, function(res) {
      var d = ''; res.on('data', function(c) { d += c; }); res.on('end', function() {
        try { resolve(JSON.parse(d)); } catch(e) { resolve(d); }
      });
    });
    req.on('error', reject); req.write(data); req.end();
  });
}
function httpPostRaw(urlStr, data, contentType, token) {
  return new Promise(function(resolve, reject) {
    var url = new URL(urlStr);
    var opts = { hostname: url.hostname, path: url.pathname + url.search, method: 'POST',
      headers: { 'Content-Type': contentType, 'Content-Length': data.length,
        'Authorization': 'Bearer ' + token } };
    var req = https.request(opts, function(res) {
      var d = ''; res.on('data', function(c) { d += c; }); res.on('end', function() { resolve(d); });
    });
    req.on('error', reject); req.write(data); req.end();
  });
}

// Firebase hash: gzip the file, SHA256 of gzipped content, hex format
function gzipHash(filePath) {
  var content = fs.readFileSync(filePath);
  var gzipped = zlib.gzipSync(content, { level: 9 });
  return crypto.createHash('sha256').update(gzipped).digest('hex');
}
function gzipBuffer(filePath) {
  return zlib.gzipSync(fs.readFileSync(filePath), { level: 9 });
}

var IGNORE = { '.git':1, 'node_modules':1, 'apk-contents':1, 'dist':1, 'docs':1, 'web-app':1, '.github':1, 'deploy.js':1, 'package-lock.json':1 };
function collectFiles(dir, base) {
  base = base || '';
  var files = [];
  var entries = fs.readdirSync(dir, { withFileTypes: true });
  for (var i = 0; i < entries.length; i++) {
    var ent = entries[i];
    if (IGNORE[ent.name]) continue;
    var rel = base ? base + '/' + ent.name : ent.name;
    if (ent.isDirectory()) {
      files = files.concat(collectFiles(path.join(dir, ent.name), rel));
    } else if (ent.name.charAt(0) !== '.') {
      files.push({ rel: rel, abs: path.join(dir, ent.name) });
    }
  }
  return files;
}

async function deploy() {
  console.log('1. Getting token...');
  var token = await getAccessToken();
  console.log('   OK');

  console.log('2. Creating version...');
  var verResp = await httpPost('firebasehosting.googleapis.com',
    '/v1beta1/sites/' + SITE + '/versions', '{}', {
    'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
  if (verResp.error) { console.error('ERROR:', verResp.error); process.exit(1); }
  var versionName = verResp.name;
  console.log('   ' + versionName);

  var files = collectFiles('.');
  console.log('3. Hashing ' + files.length + ' files...');

  var filesObj = {};
  var hashMap = {};
  var gzipMap = {};
  for (var i = 0; i < files.length; i++) {
    var f = files[i];
    var h = gzipHash(f.abs);
    filesObj['/' + f.rel] = h;
    hashMap[h] = f;
    gzipMap[h] = gzipBuffer(f.abs);
  }

  console.log('4. Populating files...');
  var popResp = await httpPost('firebasehosting.googleapis.com',
    '/v1beta1/' + versionName + ':populateFiles', JSON.stringify({ files: filesObj }), {
    'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
  if (popResp.error) { console.error('ERROR:', JSON.stringify(popResp.error)); process.exit(1); }

  var uploadUrl = popResp.uploadUrl;
  var hashes = popResp.uploadRequiredHashes || [];
  console.log('   ' + hashes.length + ' files to upload');

  for (var j = 0; j < hashes.length; j++) {
    var hash = hashes[j];
    var local = hashMap[hash];
    if (!local) { console.log('   SKIP: ' + hash); continue; }
    var gz = gzipMap[hash];
    // Upload to uploadUrl/<hash> with Content-Encoding: gzip
    await httpPostRaw(uploadUrl + '/' + hash, gz, 'application/octet-stream', token);
    console.log('   ' + local.rel);
  }

  console.log('5. Finalizing...');
  await httpPatch('firebasehosting.googleapis.com',
    '/v1beta1/' + versionName, { status: 'FINALIZED' }, token);
  console.log('   OK');

  console.log('6. Releasing...');
  var relResp = await httpPost('firebasehosting.googleapis.com',
    '/v1beta1/projects/-/sites/' + SITE + '/channels/live/releases?versionName=' + encodeURIComponent(versionName), '{}', {
    'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
  if (relResp.error) { console.error('Release ERROR:', relResp.error); }
  console.log('   DONE -> https://dalil-yemen-deel.web.app');
}

deploy().catch(function(e) { console.error('FAILED:', e.message || e); process.exit(1); });
