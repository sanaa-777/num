const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const imageStorageSource = fs.readFileSync('app/image-storage.js', 'utf8');
const appSource = fs.readFileSync('app/app.js', 'utf8');

// The submit path must convert the selected data URL safely, consume real
// XMLHttpRequest progress, and fail closed rather than submitting without images.
assert.match(appSource, /ImageStorage\._dataURLtoBlob\(dataUrl\)/);
assert.doesNotMatch(appSource, /fetch\(dataUrl\)/);
const submitMatch = appSource.match(/async submitPlace\(\) \{([\s\S]*?)\n  \},\n\n  \/\/ ====== EDIT PLACE/);
assert.ok(submitMatch, 'submitPlace implementation exists');
const submitSource = submitMatch[1];
assert.match(submitSource, /ImageStorage\.upload\(blob,[\s\S]*?\(event\) => setProgress\(event\.percent\)\)/,
  'submitPlace displays real upload progress');
assert.match(submitSource, /Math\.min\(99, totalPercent\)/,
  'upload progress stays below 100% until the server confirms the upload');
assert.match(submitSource, /setProgress\(100, true\)/,
  '100% is shown only after the upload request succeeds');
assert.ok(submitSource.indexOf('new Error(`تعذر رفع الصورة') < submitSource.indexOf('await Data.addPlace('),
  'image upload must complete successfully before the Firestore write begins');
assert.ok(submitSource.indexOf('اكتمل رفع الصور، جاري إرسال النشاط إلى الإدارة') < submitSource.indexOf('await Data.addPlace('),
  'the UI explicitly transitions from image upload to Firestore submission');
assert.match(appSource, /id="placeUploadStatus"[\s\S]*?role="progressbar"/,
  'add-place form includes an accessible upload progress bar');
assert.match(submitSource, /new Error\(`تعذر رفع الصورة/,
  'an image upload failure aborts submission');
assert.doesNotMatch(submitSource, /console\.error\('Image upload failed:'/,
  'image upload failure is not swallowed');
assert.match(submitSource, /تم إرسال طلبك إلى الإدارة للمراجعة بنجاح/,
  'unverified users receive review confirmation after saving');

// Cloudinary's connection test uses a valid, non-empty base64 image.
const tinyPng = imageStorageSource.match(/var TINY_PNG = '([^']+)'/);
assert.ok(tinyPng, 'Cloudinary test PNG constant exists');
const encodedPng = tinyPng[1].split(',')[1];
assert.ok(encodedPng.length % 4 === 0, 'test PNG base64 has valid padding');
assert.ok(Buffer.from(encodedPng, 'base64').length > 32, 'test PNG decodes to non-empty bytes');

let xhrMode = 'success';
class FakeXHR {
  constructor() {
    this.upload = {};
    this.status = 0;
    this.responseText = '';
  }
  open(method, url, async) { this.method = method; this.url = url; this.async = async; }
  send(body) {
    this.body = body;
    if (xhrMode === 'timeout') {
      setTimeout(() => this.ontimeout && this.ontimeout(), 0);
      return;
    }
    if (xhrMode === 'http-error') {
      setTimeout(() => {
        this.status = 401;
        this.responseText = JSON.stringify({ error: { message: 'Invalid upload preset' } });
        this.onload && this.onload();
      }, 0);
      return;
    }
    setTimeout(() => {
      if (this.upload.onprogress) this.upload.onprogress({ lengthComputable: true, loaded: 50, total: 100 });
      if (this.upload.onprogress) this.upload.onprogress({ lengthComputable: true, loaded: 100, total: 100 });
      this.status = 200;
      this.responseText = JSON.stringify({
        secure_url: 'https://res.cloudinary.com/test/image/upload/test.jpg',
        public_id: 'test-image', width: 32, height: 32
      });
      this.onload && this.onload();
    }, 0);
  }
}

const imageStorage = vm.runInNewContext(`${imageStorageSource}\n;ImageStorage;`, {
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  Blob,
  File,
  FormData,
  XMLHttpRequest: FakeXHR,
  atob,
  setTimeout,
  clearTimeout,
  console
});

async function main() {
  const blob = imageStorage._dataURLtoBlob(tinyPng[1]);
  assert.equal(blob.type, 'image/png');
  assert.ok(blob.size > 32);

  const progress = [];
  xhrMode = 'success';
  const result = await imageStorage.upload(blob, 'regression-test', (event) => progress.push(event.percent));
  assert.deepEqual(progress, [50, 100], 'real upload progress is surfaced to the caller');
  assert.equal(result.publicId, 'test-image');
  assert.match(result.url, /f_auto,q_auto/);

  xhrMode = 'http-error';
  await assert.rejects(
    imageStorage.upload(blob, 'regression-test'),
    /Invalid upload preset/
  );

  xhrMode = 'timeout';
  await assert.rejects(
    imageStorage.upload(blob, 'regression-test'),
    /انتهت مهلة رفع الصورة/
  );

  console.log('PASS image-upload progress, failure, and timeout regression checks');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
