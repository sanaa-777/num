const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const dataSource = fs.readFileSync('app/data-firestore.js', 'utf8');
const appSource = fs.readFileSync('app/app.js', 'utf8');
const context = { console, setTimeout, clearTimeout };
vm.runInNewContext(`${dataSource}\nglobalThis.__Data = Data;`, context);
const Data = context.__Data;

const places = [
  { id: 'arabic', name: 'متجر صنعاء', city: 'city_1', category: 'cat_1', status: 'approved', phone: '٠٧٧٧ ١٢٣ ٤٥٦', whatsapp: '' },
  { id: 'persian', name: 'مركز عدن', city: 'city_2', category: 'cat_2', status: 'approved', phone: '۰۷۷۷-۱۲۳-۴۵۷', whatsapp: '' },
  { id: 'western', name: 'شركة تعز', city: 'city_3', category: 'cat_3', status: 'approved', phone: '967 777 123 458', whatsapp: '00967777123458' },
  { id: 'pending', name: 'نشاط غير معتمد', city: 'city_1', category: 'cat_1', status: 'pending', phone: '777123459', whatsapp: '' }
];
Data._placesCache = places;
Data.getPlaces = async () => places.filter(place => place.status === 'approved');
const ids = rows => Array.from(rows, row => row.id);

async function run() {
  assert.equal(Data.normalizeDigits('٠١٢٣٤٥٦٧٨٩'), '0123456789');
  assert.equal(Data.normalizeDigits('۰۱۲۳۴۵۶۷۸۹'), '0123456789');
  assert.equal(Data.normalizePhone('+٩٦٧ (٧٧٧) ١٢٣-٤٥٦'), '967777123456');
  assert.equal(Data.normalizePhoneForSearch('٠٧٧٧١٢٣٤٥٨'), Data.normalizePhoneForSearch('+٩٦٧ ٧٧٧ ١٢٣ ٤٥٨'));
  assert.equal(Data.normalizeArabic('مُتجر ۱۲۳'), 'مُتجر 123');

  assert.deepEqual(ids(await Data.search('0777123456')), ['arabic']);
  assert.deepEqual(ids(await Data.search('٠٧٧٧ ١٢٣ ٤٥٧')), ['persian']);
  assert.deepEqual(ids(await Data.search('۰۷۷۷ ۱۲۳ ۴۵۸')), ['western']);
  assert.deepEqual(ids(await Data.search('12345')).sort(), ['arabic', 'persian', 'western']);
  assert.deepEqual(ids(Data.searchSync('٠٧٧٧١٢٣٤٥٦')), ['arabic']);
  assert.deepEqual(ids(Data.quickSearch('۰۷۷۷۱۲۳۴۵۷').filter(x => x.type === 'place')), ['persian']);
  assert.equal(Data.matchesPhoneQuery(places[0], '77'), false, 'short numeric input does not cause broad phone matches');
  assert.deepEqual(ids(await Data.search('مركز')), ['persian'], 'text search remains functional');

  const sanitizerBody = appSource.match(/_sanitizeWhatsApp\(num\)\s*\{([\s\S]*?)\n  \},/);
  assert.ok(sanitizerBody, 'WhatsApp sanitizer exists');
  const sanitizer = vm.runInNewContext(`(function(num) {${sanitizerBody[1]}\n})`, { Data });
  assert.equal(sanitizer('٠٧٧٧ ١٢٣ ٤٥٦'), '967777123456');
  assert.equal(sanitizer('+967 777 123 456'), '967777123456');

  console.log('PASS phone search regression checks: Arabic-Indic, Persian, Western digits, phone/WhatsApp fields, suggestions, and WhatsApp links');
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
