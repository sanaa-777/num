// =============================================
// Admin Dashboard - Firestore Backend
// يحل محل admin.js القديم (localStorage)
// =============================================

const Admin = {
  // ====== التحقق من صلاحيات الأدمن ======
  isAdmin() {
    return Auth.currentUser && Auth.currentUser.role === 'admin';
  },

  // ====== تهيئة الأدمن الافتراضي (مرة واحدة) ======
  async initDefaultAdmin() {
    try {
      const adminsSnap = await db.collection('users').where('role', '==', 'admin').limit(1).get();
      if (!adminsSnap.empty) return; // يوجد أدمن بالفعل

      // إنشاء أدمن افتراضي باستخدام Firebase Auth
      // ملاحظة: يتم إنشاؤه فقط إذا لم يكن موجوداً
      const adminEmail = 'admin@yemendirectory.net';
      const adminPassword = 'Admin@' + Date.now().toString(36); // كلمة مرور عشوائية آمنة

      try {
        const cred = await auth.createUserWithEmailAndPassword(adminEmail, adminPassword);
        await cred.user.updateProfile({ displayName: 'مدير النظام' });

        await db.collection('users').doc(cred.user.uid).set({
          name: 'مدير النظام',
          email: adminEmail,
          phone: '777000000',
          avatar: 'https://ui-avatars.com/api/?name=Admin&background=dc2626&color=fff&size=128',
          role: 'admin',
          verified: true,
          suspended: false,
          bio: 'حساب الإدارة الرئيسي',
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log('Default admin created:', adminEmail);
        // ⚠️ احفظ كلمة المرور في مكان آمن
        console.log('Admin password:', adminPassword);
      } catch (e) {
        if (e.code === 'auth/email-already-in-use') {
          console.log('Admin account already exists');
        } else {
          console.error('Create admin error:', e);
        }
      }
    } catch (e) {
      console.error('initDefaultAdmin error:', e);
    }
  },

  // ====== إدارة المستخدمين ======
  async getAllUsers() {
    try {
      const snapshot = await db.collection('users').orderBy('createdAt', 'desc').get();
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error('getAllUsers error:', e);
      return [];
    }
  },

  async toggleVerify(userId) {
    try {
      const userRef = db.collection('users').doc(userId);
      const doc = await userRef.get();
      if (!doc.exists) return false;

      const newStatus = !doc.data().verified;
      await userRef.update({
        verified: newStatus,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      await this.addNotification('verify', `تم ${newStatus ? 'توثيق' : 'إلغاء توثيق'} الحساب: ${doc.data().name}`);
      return newStatus;
    } catch (e) {
      console.error('toggleVerify error:', e);
      return false;
    }
  },

  async toggleSuspend(userId) {
    try {
      const userRef = db.collection('users').doc(userId);
      const doc = await userRef.get();
      if (!doc.exists) return false;

      const newStatus = !doc.data().suspended;
      await userRef.update({
        suspended: newStatus,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      await this.addNotification('suspend', `تم ${newStatus ? 'إيقاف' : 'تفعيل'} الحساب: ${doc.data().name}`);
      return newStatus;
    } catch (e) {
      console.error('toggleSuspend error:', e);
      return false;
    }
  },

  async deleteUser(userId) {
    try {
      const userRef = db.collection('users').doc(userId);
      const doc = await userRef.get();
      if (!doc.exists) return false;
      if (doc.data().role === 'admin') return false; // لا نحذف الأدمن

      // حذف أماكن المستخدم
      const placesSnap = await db.collection('places').where('owner', '==', userId).get();
      const batch = db.batch();
      placesSnap.docs.forEach(d => batch.update(d.ref, { isActive: false }));
      batch.update(userRef, { suspended: true, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
      await batch.commit();

      await this.addNotification('delete', `تم حذف الحساب: ${doc.data().name}`);
      return true;
    } catch (e) {
      console.error('deleteUser error:', e);
      return false;
    }
  },

  // ====== إدارة الأماكن ======
  async getAllPlaces() {
    try {
      const snapshot = await db.collection('places').orderBy('createdAt', 'desc').get();
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error('getAllPlaces error:', e);
      return [];
    }
  },

  async verifyPlace(placeId) {
    try {
      const ref = db.collection('places').doc(placeId);
      const doc = await ref.get();
      if (!doc.exists) return false;
      const newStatus = !doc.data().verified;
      await ref.update({ verified: newStatus, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
      Data._invalidateCache();
      return newStatus;
    } catch (e) {
      console.error('verifyPlace error:', e);
      return false;
    }
  },

  async featurePlace(placeId) {
    try {
      const ref = db.collection('places').doc(placeId);
      const doc = await ref.get();
      if (!doc.exists) return false;
      const newStatus = !doc.data().featured;
      await ref.update({ featured: newStatus, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
      Data._invalidateCache();
      return newStatus;
    } catch (e) {
      console.error('featurePlace error:', e);
      return false;
    }
  },

  async deletePlaceAdmin(placeId) {
    try {
      await db.collection('places').doc(placeId).update({
        isActive: false,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      Data._invalidateCache();
      return true;
    } catch (e) {
      console.error('deletePlaceAdmin error:', e);
      return false;
    }
  },

  async approvePlace(placeId, note) {
    try {
      await db.collection('places').doc(placeId).update({
        status: 'approved',
        adminNote: note || '',
        reviewedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      Data._invalidateCache();
      await this.addNotification('approve', `تمت الموافقة على مكان: ${placeId}`);
      return true;
    } catch (e) {
      console.error('approvePlace error:', e);
      return false;
    }
  },

  async rejectPlace(placeId, note) {
    try {
      await db.collection('places').doc(placeId).update({
        status: 'rejected',
        adminNote: note || '',
        reviewedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      Data._invalidateCache();
      await this.addNotification('reject', `تم رفض مكان: ${placeId}`);
      return true;
    } catch (e) {
      console.error('rejectPlace error:', e);
      return false;
    }
  },

  // ====== الإشعارات ======
  async getNotifications() {
    try {
      // جلب إشعارات الأدمن (global notifications)
      const snapshot = await db.collection('admin_notifications')
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error('getNotifications error:', e);
      return [];
    }
  },

  async addNotification(type, message) {
    try {
      await db.collection('admin_notifications').add({
        type, message,
        read: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (e) {
      console.error('addNotification error:', e);
    }
  },

  async markNotificationsRead() {
    try {
      const snapshot = await db.collection('admin_notifications')
        .where('read', '==', false).get();
      const batch = db.batch();
      snapshot.docs.forEach(d => batch.update(d.ref, { read: true }));
      await batch.commit();
    } catch (e) {
      console.error('markNotificationsRead error:', e);
    }
  },

  async getUnreadCount() {
    try {
      const snapshot = await db.collection('admin_notifications')
        .where('read', '==', false).get();
      return snapshot.size;
    } catch (e) {
      return 0;
    }
  },

  // ====== الإحصائيات ======
  async getStats() {
    try {
      const [usersSnap, placesSnap, verifiedPlacesSnap, featuredPlacesSnap, pendingSnap] = await Promise.all([
        db.collection('users').get(),
        db.collection('places').where('isActive', '==', true).get(),
        db.collection('places').where('isActive', '==', true).where('verified', '==', true).get(),
        db.collection('places').where('isActive', '==', true).where('featured', '==', true).get(),
        db.collection('admin_notifications').where('read', '==', false).get()
      ]);

      const users = usersSnap.docs.map(d => d.data());
      return {
        totalUsers: usersSnap.size,
        verifiedUsers: users.filter(u => u.verified).length,
        suspendedUsers: users.filter(u => u.suspended).length,
        totalPlaces: placesSnap.size,
        verifiedPlaces: verifiedPlacesSnap.size,
        featuredPlaces: featuredPlacesSnap.size,
        pendingRequests: pendingSnap.size,
      };
    } catch (e) {
      console.error('getStats error:', e);
      return { totalUsers: 0, verifiedUsers: 0, suspendedUsers: 0, totalPlaces: 0, verifiedPlaces: 0, featuredPlaces: 0, pendingRequests: 0 };
    }
  },

  // ====== إشعارات التوثيق ======
  async notifyVerificationRequest(userName, userId) {
    await this.addNotification('request', `طلب توثيق جديد من: ${userName}`);
  },

  async notifyNewPlace(placeName, userName) {
    await this.addNotification('new_place', `نشاط جديد: ${placeName} بواسطة ${userName}`);
  }
};
