const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('admin.html', 'utf8');
const backend = fs.readFileSync('app/admin-firestore.js', 'utf8');
const rules = fs.readFileSync('firestore.rules', 'utf8');

assert.match(html, /deleteSelectedPlaces\(\)/, 'admin can delete selected activities');
assert.match(html, /deleteAllPlaces\(\)/, 'admin can delete all activities');
assert.match(html, /deleteSelectedUsers\(\)/, 'admin can delete selected user profiles');
assert.match(html, /لا يحذف حساب Firebase Authentication ولا يحظره/, 'user deletion limitation is disclosed');
assert.match(html, /لن يتم إرسال إشعارات لأصحابها/, 'permanent deletion confirmation promises no owner notifications');
assert.match(html, /اكتب كلمة «حذف»/, 'destructive actions require typed confirmation');

const userDeleteStart = backend.indexOf('  async deleteUser(userId) {');
const userDeleteEnd = backend.indexOf('\n  },', userDeleteStart);
assert.ok(userDeleteStart >= 0 && userDeleteEnd > userDeleteStart, 'deleteUser implementation exists');
const userDelete = backend.slice(userDeleteStart, userDeleteEnd);
assert.match(userDelete, /await userRef\.delete\(\)/, 'user profile is removed from Firestore');
assert.doesNotMatch(userDelete, /suspended|setPlaceActive|addNotification/, 'user deletion neither suspends, disables listings, nor sends notifications');
assert.match(userDelete, /authAccountDeleted: false/, 'code explicitly reports Firebase Authentication account is not deleted');
assert.match(backend, /async deleteAllPlacesPermanently\(\)/, 'backend supports complete listing deletion');
assert.match(backend, /_deletePlaceCascade\(placeId\)/, 'listing deletion removes associated Firestore data');
assert.match(backend, /this\._deleteQueryDocuments\(db\.collection\('reviews'\)/, 'listing deletion removes associated reviews');
assert.match(backend, /this\._deleteQueryDocuments\(db\.collection\('favorites'\)/, 'listing deletion removes associated favorites');
assert.match(backend, /_recalculatePlaceRating\(placeId\)/, 'user deletion recalculates ratings on surviving places');
assert.match(backend, /async deletePlaceAdmin\(placeId\)\s*\{\s*return this\.deletePlacePermanently\(placeId\);/, 'legacy delete entry point now performs deletion rather than suspension');
assert.match(rules, /match \/reviews\/\{reviewId\}[\s\S]*?allow delete: if isAdmin\(\);/, 'only admins gain review deletion');
assert.match(rules, /match \/favorites\/\{favId\}[\s\S]*?allow delete: if isAdmin\(\) \|\|/, 'admins can delete favorites as part of deletion');

console.log('PASS admin deletion regression checks');
