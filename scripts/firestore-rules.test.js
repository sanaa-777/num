const fs = require('node:fs');
const path = require('node:path');
const {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails
} = require('@firebase/rules-unit-testing');
const { doc, setDoc, addDoc, updateDoc, deleteDoc, collection, Timestamp } = require('firebase/firestore');

const projectId = 'deel-39f2e-rules-tests';
const rules = fs.readFileSync(path.join(__dirname, '..', 'firestore.rules'), 'utf8');
const collections = ['events', 'jobs', 'offers'];

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

async function main() {
  const env = await initializeTestEnvironment({ projectId, firestore: { rules } });
  try {
    await env.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users/seed-admin'), { role: 'admin' });
    });

    for (const name of collections) {
      const userDb = env.authenticatedContext('user-1').firestore();
      const otherDb = env.authenticatedContext('user-2').firestore();
      const admin = env.authenticatedContext('seed-admin').firestore();
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

      await assertFails(addDoc(collection(otherDb, name), listing('user-1', {
        title: 'x'.repeat(201)
      })));
      await assertFails(addDoc(collection(otherDb, name), listing('user-2', {
        endDate: Timestamp.fromDate(new Date('2026-09-30T18:00:00Z'))
      })));
    }

    console.log(`Firestore Rules tests passed for: ${collections.join(', ')}`);
  } finally {
    await env.cleanup();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
