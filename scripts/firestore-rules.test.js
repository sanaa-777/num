const fs = require('node:fs');
const path = require('node:path');
const {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails
} = require('@firebase/rules-unit-testing');
const {
  doc, setDoc, addDoc, updateDoc, deleteDoc, getDoc, getDocs,
  collection, query, where, limit, Timestamp, serverTimestamp
} = require('firebase/firestore');

const projectId = 'deel-39f2e-rules-tests';
const rules = fs.readFileSync(path.join(__dirname, '..', 'firestore.rules'), 'utf8');
const listingCollections = ['events', 'jobs', 'offers'];

function listing(owner, overrides = {}) {
  const startDate = Timestamp.fromDate(new Date('2026-10-01T10:00:00Z'));
  const endDate = Timestamp.fromDate(new Date('2026-10-02T18:00:00Z'));
  return {
    owner,
    title: 'اختبار سجل صالح',
    description: 'وصف اختباري مختصر',
    startDate,
    endDate,
    location: 'صنعاء',
    status: 'pending',
    isActive: false,
    featured: false,
    verified: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    ...overrides
  };
}

function userProfile(email, overrides = {}) {
  return {
    name: 'مستخدم اختبار', email, phone: '', avatar: '', coverImage: null,
    role: 'user', verified: false, suspended: false, bio: '', location: '',
    website: '', createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    ...overrides
  };
}

function place(owner, overrides = {}) {
  return {
    owner, name: 'نشاط اختباري', category: 'cat_test', subcategory: 'sub_test',
    city: 'صنعاء', description: 'وصف النشاط', address: 'شارع الاختبار',
    phone: '777123456', whatsapp: '', email: null, facebook: null, instagram: null,
    telegram: null, website: null, openTime: null, closeTime: null, workDays: null,
    lat: null, lng: null, images: ['https://res.cloudinary.com/test/image.jpg'],
    image: null, verified: false, featured: false, isActive: false, status: 'pending',
    views: 0, reviews: 0, rating: 0, adminNote: '',
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    ...overrides
  };
}

function review(placeId, userId, overrides = {}) {
  return {
    placeId, userId, userName: 'مستخدم اختبار', userAvatar: '', rating: 5,
    comment: 'تجربة جيدة', createdAt: serverTimestamp(), ...overrides
  };
}

function editablePlaceData() {
  return {
    name: 'نشاط اختباري', category: 'cat_test', subcategory: 'sub_test', city: 'صنعاء',
    description: 'وصف النشاط', address: 'شارع الاختبار', phone: '777123456', whatsapp: '',
    email: '', facebook: '', instagram: '', telegram: '', website: '', openTime: '',
    closeTime: '', workDays: [], images: [], lat: '', lng: ''
  };
}

async function seed(env) {
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, 'users/admin'), { name: 'مدير', email: 'admin@example.com', role: 'admin' });
    await setDoc(doc(db, 'users/seed-admin'), { name: 'مدير اختباري', email: 'seed-admin@example.com', role: 'admin' });
    await setDoc(doc(db, 'users/owner'), { ...userProfile('owner@example.com'), role: 'user' });
    await setDoc(doc(db, 'users/other'), { ...userProfile('other@example.com'), role: 'user' });
    await setDoc(doc(db, 'categories/cat_test'), { active: true, subIds: ['sub_test'] });
    await setDoc(doc(db, 'places/approved-place'), place('owner', {
      status: 'approved', isActive: true, createdAt: Timestamp.now(), updatedAt: Timestamp.now()
    }));
    await setDoc(doc(db, 'places/pending-place'), place('owner'));
    await setDoc(doc(db, 'places/rejected-place'), place('owner', {
      status: 'rejected', isActive: false, createdAt: Timestamp.now(), updatedAt: Timestamp.now()
    }));
    await setDoc(doc(db, 'reviews/legacy-review'), review('approved-place', 'owner'));
    await setDoc(doc(db, 'notifications/owner-note'), {
      userId: 'owner', type: 'admin', message: 'رسالة اختبار', read: false,
      createdAt: Timestamp.now()
    });
  });
}

async function testListings(env) {
  for (const name of listingCollections) {
    const userDb = env.authenticatedContext('user-1', { email: 'user1@example.com' }).firestore();
    const otherDb = env.authenticatedContext('user-2', { email: 'user2@example.com' }).firestore();
    const admin = env.authenticatedContext('seed-admin', { email: 'admin@example.com' }).firestore();
    const ref = doc(userDb, `${name}/user-created-${name}`);

    await assertFails(setDoc(ref, listing('user-1', { status: 'approved', isActive: true })));
    await assertFails(setDoc(ref, listing('user-2')));
    await assertSucceeds(setDoc(ref, listing('user-1')));
    await assertFails(updateDoc(ref, { status: 'approved' }));
    await assertFails(updateDoc(ref, { isActive: true }));
    await assertFails(updateDoc(ref, { featured: true }));
    await assertFails(updateDoc(ref, { verified: true }));
    await assertFails(updateDoc(ref, { owner: 'user-2' }));
    await assertSucceeds(updateDoc(ref, { description: 'وصف محدث' }));

    const adminRef = doc(admin, `${name}/admin-managed-${name}`);
    await assertSucceeds(setDoc(adminRef, listing('admin-owner', {
      status: 'approved', isActive: true, featured: true, verified: true
    })));
    await assertSucceeds(updateDoc(adminRef, {
      status: 'approved', isActive: true, featured: true, verified: true
    }));
    await assertSucceeds(deleteDoc(adminRef));

    await assertFails(addDoc(collection(otherDb, name), listing('user-1', { title: 'x'.repeat(201) })));
    await assertFails(addDoc(collection(otherDb, name), listing('user-2', {
      endDate: Timestamp.fromDate(new Date('2026-09-30T18:00:00Z'))
    })));
  }
}

async function testUsers(env) {
  const owner = env.authenticatedContext('owner', { email: 'owner@example.com' }).firestore();
  const other = env.authenticatedContext('other', { email: 'other@example.com' }).firestore();
  const admin = env.authenticatedContext('admin', { email: 'admin@example.com' }).firestore();
  const anonymous = env.unauthenticatedContext().firestore();

  await assertSucceeds(getDoc(doc(owner, 'users/owner')));
  await assertFails(getDoc(doc(owner, 'users/other')));
  await assertFails(getDoc(doc(anonymous, 'users/owner')));
  await assertSucceeds(getDoc(doc(admin, 'users/owner')));
  await assertSucceeds(getDocs(collection(admin, 'users')));

  const newUser = env.authenticatedContext('new-user', { email: 'new@example.com' }).firestore();
  await assertSucceeds(setDoc(doc(newUser, 'users/new-user'), userProfile('new@example.com')));
  await assertFails(setDoc(doc(other, 'users/other-admin'), userProfile('other@example.com', { role: 'admin' })));
  await assertFails(updateDoc(doc(owner, 'users/owner'), { role: 'admin' }));
  await assertFails(updateDoc(doc(owner, 'users/owner'), { verified: true }));
  await assertFails(updateDoc(doc(owner, 'users/owner'), { suspended: true }));
  await assertSucceeds(updateDoc(doc(owner, 'users/owner'), { name: 'اسم جديد', updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(doc(admin, 'users/owner'), { role: 'admin' }));
  await assertSucceeds(updateDoc(doc(admin, 'users/owner'), { verified: true, updatedAt: serverTimestamp() }));
}

async function testPlaces(env) {
  const owner = env.authenticatedContext('owner', { email: 'owner@example.com' }).firestore();
  const other = env.authenticatedContext('other', { email: 'other@example.com' }).firestore();
  const admin = env.authenticatedContext('admin', { email: 'admin@example.com' }).firestore();
  const anonymous = env.unauthenticatedContext().firestore();

  await assertSucceeds(getDoc(doc(anonymous, 'places/approved-place')));
  await assertFails(getDoc(doc(anonymous, 'places/pending-place')));
  await assertFails(getDoc(doc(anonymous, 'places/rejected-place')));
  await assertSucceeds(getDoc(doc(owner, 'places/pending-place')));
  await assertFails(getDoc(doc(other, 'places/pending-place')));
  await assertSucceeds(getDoc(doc(admin, 'places/pending-place')));

  const publicQuery = query(collection(anonymous, 'places'), where('status', '==', 'approved'), where('isActive', '==', true));
  const publicResults = await assertSucceeds(getDocs(publicQuery));
  if (publicResults.docs.some((d) => d.id !== 'approved-place')) throw new Error('Public query returned a non-approved place');
  await assertFails(getDocs(collection(anonymous, 'places')));

  const createRef = doc(owner, 'places/new-owner-place');
  await assertSucceeds(setDoc(createRef, place('owner')));
  await assertFails(setDoc(doc(owner, 'places/forged-owner'), place('other')));
  await assertFails(setDoc(doc(owner, 'places/self-approved'), place('owner', { status: 'approved', isActive: true })));
  await assertFails(setDoc(doc(owner, 'places/self-verified'), place('owner', { verified: true })));
  await assertFails(setDoc(doc(owner, 'places/injected-field'), place('owner', { role: 'admin' })));
  await assertFails(setDoc(doc(owner, 'places/oversized-name'), place('owner', { name: 'ن'.repeat(161) })));

  await assertSucceeds(updateDoc(doc(owner, 'places/pending-place'), {
    description: 'وصف محدث', updatedAt: serverTimestamp()
  }));
  await assertFails(updateDoc(doc(owner, 'places/pending-place'), {
    status: 'approved', updatedAt: serverTimestamp()
  }));
  await assertFails(updateDoc(doc(owner, 'places/pending-place'), {
    verified: true, updatedAt: serverTimestamp()
  }));
  await assertFails(updateDoc(doc(owner, 'places/pending-place'), {
    isActive: true, updatedAt: serverTimestamp()
  }));
  await assertFails(updateDoc(doc(other, 'places/pending-place'), {
    description: 'محاولة تعديل', updatedAt: serverTimestamp()
  }));
  await assertSucceeds(updateDoc(doc(admin, 'places/pending-place'), {
    status: 'approved', isActive: true, reviewedAt: serverTimestamp(), updatedAt: serverTimestamp()
  }));
  await assertSucceeds(getDoc(doc(anonymous, 'places/pending-place')));
}

async function testReviews(env) {
  const owner = env.authenticatedContext('owner', { email: 'owner@example.com' }).firestore();
  const other = env.authenticatedContext('other', { email: 'other@example.com' }).firestore();
  const anonymous = env.unauthenticatedContext().firestore();
  const reviewId = 'approved-place_other';
  const reviewRef = doc(other, `reviews/${reviewId}`);

  await assertSucceeds(getDocs(query(
    collection(anonymous, 'reviews'),
    where('placeId', '==', 'approved-place'), where('userId', '==', 'owner'), limit(1)
  )));
  await assertSucceeds(setDoc(reviewRef, review('approved-place', 'other')));
  await assertFails(setDoc(doc(other, 'reviews/fake-user'), review('approved-place', 'owner')));
  await assertFails(setDoc(doc(other, 'reviews/approved-place_other-duplicate'), review('approved-place', 'other')));
  await assertFails(setDoc(doc(other, 'reviews/approved-place_other-bad-rating'), review('approved-place', 'other', { rating: 6 })));
  await assertFails(setDoc(doc(other, 'reviews/approved-place_other-bad-comment'), review('approved-place', 'other', { comment: 'x'.repeat(2001) })));
  await assertFails(setDoc(doc(other, 'reviews/approved-place_other-inactive'), review('pending-place', 'other')));
  await assertSucceeds(getDoc(doc(anonymous, `reviews/${reviewId}`)));
  await assertFails(updateDoc(doc(owner, `reviews/${reviewId}`), { rating: 1 }));
  await assertFails(deleteDoc(doc(owner, `reviews/${reviewId}`)));
  await assertFails(updateDoc(reviewRef, { userId: 'owner' }));
  await assertFails(updateDoc(reviewRef, { placeId: 'pending-place' }));
  await assertSucceeds(updateDoc(reviewRef, { rating: 4, comment: 'تحديث مسموح' }));
  await assertFails(deleteDoc(reviewRef));
}

async function testPlaceEdits(env) {
  const owner = env.authenticatedContext('owner', { email: 'owner@example.com' }).firestore();
  const other = env.authenticatedContext('other', { email: 'other@example.com' }).firestore();
  const admin = env.authenticatedContext('admin', { email: 'admin@example.com' }).firestore();
  const edit = {
    placeId: 'pending-place', owner: 'owner', ownerName: 'مستخدم اختبار', status: 'pending',
    proposedData: editablePlaceData(), currentData: editablePlaceData(),
    placeName: 'نشاط اختباري', adminNote: '',
    createdAt: serverTimestamp(), updatedAt: serverTimestamp()
  };
  const ownerEdit = doc(owner, 'place_edits/owner-edit');
  await assertSucceeds(setDoc(ownerEdit, edit));
  await assertSucceeds(getDoc(ownerEdit));
  await assertFails(getDoc(doc(other, 'place_edits/owner-edit')));
  await assertFails(setDoc(doc(other, 'place_edits/forged-edit'), { ...edit, owner: 'owner' }));
  await assertFails(setDoc(doc(owner, 'place_edits/forged-status'), { ...edit, status: 'approved' }));
  await assertSucceeds(getDocs(query(collection(owner, 'place_edits'), where('owner', '==', 'owner'))));
  await assertSucceeds(getDocs(query(collection(admin, 'place_edits'), where('status', '==', 'pending'))));
  await assertFails(updateDoc(ownerEdit, { status: 'approved' }));
  await assertSucceeds(deleteDoc(ownerEdit));
}

async function testNotificationsAndLoginAttempts(env) {
  const owner = env.authenticatedContext('owner', { email: 'owner@example.com' }).firestore();
  const other = env.authenticatedContext('other', { email: 'other@example.com' }).firestore();
  const admin = env.authenticatedContext('admin', { email: 'admin@example.com' }).firestore();
  const anonymous = env.unauthenticatedContext().firestore();

  await assertFails(getDocs(collection(owner, 'login_attempts')));
  await assertFails(getDoc(doc(owner, 'login_attempts/owner@example.com')));
  await assertFails(setDoc(doc(owner, 'login_attempts/owner@example.com'), { count: 1 }));
  await assertFails(getDocs(collection(admin, 'login_attempts')));

  await assertSucceeds(getDoc(doc(owner, 'notifications/owner-note')));
  await assertFails(getDoc(doc(other, 'notifications/owner-note')));
  await assertFails(setDoc(doc(owner, 'notifications/self-created'), {
    userId: 'owner', type: 'admin', message: 'رسالة', read: false, createdAt: serverTimestamp()
  }));
  await assertFails(setDoc(doc(owner, 'notifications/forged-note'), {
    userId: 'other', type: 'admin', message: 'رسالة', read: false, createdAt: serverTimestamp()
  }));
  await assertFails(setDoc(doc(owner, 'notifications/user-created'), {
    userId: 'owner', type: 'admin', message: 'رسالة', read: false, createdAt: serverTimestamp()
  }));
  await assertSucceeds(updateDoc(doc(owner, 'notifications/owner-note'), { read: true }));

  await assertFails(getDocs(collection(owner, 'admin_notifications')));
  await assertFails(getDocs(collection(anonymous, 'admin_notifications')));
  await assertSucceeds(getDocs(collection(admin, 'admin_notifications')));
  await assertSucceeds(setDoc(doc(owner, 'admin_notifications/owner-request'), {
    type: 'request', message: 'طلب مساعدة', read: false,
    createdAt: serverTimestamp(), createdBy: 'owner'
  }));
  await assertFails(setDoc(doc(owner, 'admin_notifications/forged-approval'), {
    type: 'approve', message: 'تمت الموافقة', read: false,
    createdAt: serverTimestamp(), createdBy: 'owner'
  }));
  await assertFails(setDoc(doc(owner, 'admin_notifications/forged-request'), {
    type: 'request', message: 'طلب', read: false,
    createdAt: serverTimestamp(), createdBy: 'other'
  }));
  await assertFails(updateDoc(doc(owner, 'admin_notifications/owner-request'), { read: true }));
  await assertSucceeds(updateDoc(doc(admin, 'admin_notifications/owner-request'), { read: true }));
}

async function main() {
  const env = await initializeTestEnvironment({ projectId, firestore: { rules } });
  try {
    await seed(env);
    await testListings(env);
    await testUsers(env);
    await testPlaces(env);
    await testReviews(env);
    await testPlaceEdits(env);
    await testNotificationsAndLoginAttempts(env);
    console.log('Firestore Rules tests passed: listings, users, places, reviews, place_edits, notifications, login_attempts');
  } finally {
    await env.cleanup();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
