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
      if (!Auth.currentUser) return;
      if (Auth.currentUser.email !== 'admin@yemendirectory.net') return;
      const userRef = db.collection('users').doc(Auth.currentUser.id);
      const userDoc = await userRef.get();
      if (userDoc.exists && userDoc.data().role === 'admin') return; // Already admin
      // Create or update admin document (Firestore rule allows admin email to set own role)
      await userRef.set({
        name: Auth.currentUser.name || 'مدير النظام',
        email: 'admin@yemendirectory.net',
        phone: '',
        avatar: Auth.currentUser.avatar || '',
        role: 'admin',
        verified: true,
        suspended: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      Auth.currentUser.role = 'admin';
      Auth.currentUser.verified = true;
      console.log('Admin role ensured in Firestore');
    } catch (e) {
      console.error('initDefaultAdmin error:', e.message);
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

  async toggleActive(userId) {
    try {
      const userRef = db.collection('users').doc(userId);
      const doc = await userRef.get();
      if (!doc.exists) return false;

      const currentActive = doc.data().active || false;
      const newActive = !currentActive;
      await userRef.update({
        active: newActive,
        // If activating, remove suspension
        suspended: newActive ? false : doc.data().suspended,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      await this.addNotification('activate', `تم ${newActive ? 'تفعيل' : 'إلغاء تفعيل'} الحساب: ${doc.data().name}`);
      return newActive;
    } catch (e) {
      console.error('toggleActive error:', e);
      return false;
    }
  },

  async deleteUser(userId) {
    try {
      const userRef = db.collection('users').doc(userId);
      const doc = await userRef.get();
      if (!doc.exists) return false;
      if (doc.data().role === 'admin') return false;

      const placesSnap = await db.collection('places').where('owner', '==', userId).get();
      const batch = db.batch();
      placesSnap.docs.forEach(d => batch.update(d.ref, {
        isActive: false,
        status: d.data().status === 'approved' ? 'approved' : 'rejected',
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }));
      batch.update(userRef, { suspended: true, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
      await batch.commit();

      await this.addNotification('delete', `تم تعطيل الحساب: ${doc.data().name}`);
      return true;
    } catch (e) {
      console.error('deleteUser error:', e);
      return false;
    }
  },

  // ====== إدارة الأماكن ======
  async getAllPlaces() {
    try {
      try {
        const snapshot = await db.collection('places').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (idxErr) {
        const snapshot = await db.collection('places').get();
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      }
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

  async setPlaceActive(placeId, isActive, note) {
    try {
      const ref = db.collection('places').doc(placeId);
      await ref.update({
        isActive: isActive,
        adminNote: note || '',
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        reviewedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      Data._invalidateCache();
      await this.addNotification(isActive ? 'reactivate' : 'suspend_place', `${isActive ? 'تمت إعادة تفعيل' : 'تم تعليق'} النشاط: ${placeId}`);
      return true;
    } catch (e) {
      console.error('setPlaceActive error:', e);
      return false;
    }
  },

  async deletePlaceAdmin(placeId) {
    return this.setPlaceActive(placeId, false, 'تم تعطيل النشاط بواسطة الإدارة');
  },

  async approvePlace(placeId, note) {
    try {
      const ref = db.collection('places').doc(placeId);
      const doc = await ref.get();
      if (!doc.exists) return false;
      const place = doc.data();
      await ref.update({
        status: 'approved',
        isActive: true,
        adminNote: note || '',
        reviewedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      Data._invalidateCache();
      await this.addNotification('approve', `تمت الموافقة على نشاط: ${place.name || placeId}`);
      // Notify the user
      if (place.owner) {
        try {
          await db.collection('notifications').add({
            userId: place.owner,
            type: 'admin',
            message: `✅ تمت الموافقة على نشاطك "${place.name || ''}"${note ? ' - ملاحظة: ' + note : ''}`,
            read: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        } catch (notifErr) { console.error('User notification error:', notifErr); }
      }
      return true;
    } catch (e) {
      console.error('approvePlace error:', e);
      return false;
    }
  },

  async rejectPlace(placeId, note) {
    try {
      const ref = db.collection('places').doc(placeId);
      const doc = await ref.get();
      if (!doc.exists) return false;
      const place = doc.data();
      await ref.update({
        status: 'rejected',
        isActive: false,
        adminNote: note || '',
        reviewedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      Data._invalidateCache();
      await this.addNotification('reject', `تم رفض نشاط: ${place.name || placeId}`);
      // Notify the user
      if (place.owner) {
        try {
          await db.collection('notifications').add({
            userId: place.owner,
            type: 'admin',
            message: `❌ تم رفض نشاطك "${place.name || ''}"${note ? ' - السبب: ' + note : ''}`,
            read: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        } catch (notifErr) { console.error('User notification error:', notifErr); }
      }
      return true;
    } catch (e) {
      console.error('rejectPlace error:', e);
      return false;
    }
  },

  // ====== الإشعارات ======
  async getNotifications() {
    try {
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
      const [usersSnap, placesSnap, unreadSnap, offersSnap, jobsSnap, eventsSnap, pricingSnap] = await Promise.all([
        db.collection('users').get(),
        db.collection('places').get(),
        db.collection('admin_notifications').where('read', '==', false).get(),
        db.collection('offers').get().catch(()=>({size:0,docs:[]})),
        db.collection('jobs').get().catch(()=>({size:0,docs:[]})),
        db.collection('events').get().catch(()=>({size:0,docs:[]})),
        db.collection('pricing').get().catch(()=>({size:0,docs:[]}))
      ]);

      const users = usersSnap.docs.map(d => d.data());
      const places = placesSnap.docs.map(d => d.data());
      const activePlaces = places.filter(p => p.isActive !== false);
      const approvedPlaces = places.filter(p => p.status === 'approved' && p.isActive !== false);
      const pendingPlaces = places.filter(p => p.status === 'pending');
      const rejectedPlaces = places.filter(p => p.status === 'rejected');
      const inactivePlaces = places.filter(p => p.isActive === false);
      const verifiedPlaces = approvedPlaces.filter(p => p.verified);
      const featuredPlaces = approvedPlaces.filter(p => p.featured);

      return {
        totalUsers: usersSnap.size,
        verifiedUsers: users.filter(u => u.verified).length,
        suspendedUsers: users.filter(u => u.suspended).length,
        totalPlaces: placesSnap.size,
        activePlaces: activePlaces.length,
        approvedPlaces: approvedPlaces.length,
        pendingPlaces: pendingPlaces.length,
        rejectedPlaces: rejectedPlaces.length,
        inactivePlaces: inactivePlaces.length,
        verifiedPlaces: verifiedPlaces.length,
        featuredPlaces: featuredPlaces.length,
        unreadNotifications: unreadSnap.size,
        totalOffers: offersSnap.size,
        totalJobs: jobsSnap.size,
        totalEvents: eventsSnap.size,
        totalPricing: pricingSnap.size
      };
    } catch (e) {
      console.error('getStats error:', e);
      return {
        totalUsers: 0, verifiedUsers: 0, suspendedUsers: 0,
        totalPlaces: 0, activePlaces: 0, approvedPlaces: 0,
        pendingPlaces: 0, rejectedPlaces: 0, inactivePlaces: 0,
        verifiedPlaces: 0, featuredPlaces: 0, unreadNotifications: 0,
        totalOffers: 0, totalJobs: 0, totalEvents: 0, totalPricing: 0
      };
    }
  },

  async notifyVerificationRequest(userName, userId) {
    await this.addNotification('request', `طلب توثيق جديد من: ${userName}`);
  },

  async notifyNewPlace(placeName, userName) {
    await this.addNotification('new_place', `نشاط جديد: ${placeName} بواسطة ${userName}`);
  },

  _unreadCount: 0,
  getUnreadCountSync() { return this._unreadCount; },
  async refreshUnreadCount() {
    try {
      const snap = await Promise.race([
        db.collection('admin_notifications').where('read', '==', false).get(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
      ]);
      this._unreadCount = snap.size;
    } catch(e) { this._unreadCount = 0; }
  },

  // ====== Place Edits (Edit-with-Review) ======
  async getPendingPlaceEdits() {
    try {
      const snap = await db.collection('place_edits')
        .where('status', '==', 'pending')
        .get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error('getPendingPlaceEdits error:', e);
      return [];
    }
  },

  async getAllPlaceEdits() {
    try {
      const snap = await db.collection('place_edits').get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error('getAllPlaceEdits error:', e);
      return [];
    }
  },

  async approvePlaceEdit(editId, adminNote) {
    try {
      const editRef = db.collection('place_edits').doc(editId);
      const editDoc = await editRef.get();
      if (!editDoc.exists) return false;
      const edit = editDoc.data();
      if (edit.status !== 'pending') return false;

      // Apply proposed data to the original place
      const placeRef = db.collection('places').doc(edit.placeId);
      const placeDoc = await placeRef.get();
      if (!placeDoc.exists) return false;

      const proposed = edit.proposedData;
      await placeRef.update({
        name: proposed.name || '',
        category: proposed.category || '',
        subcategory: proposed.subcategory || '',
        city: proposed.city || '',
        description: proposed.description || '',
        address: proposed.address || '',
        phone: proposed.phone || '',
        whatsapp: proposed.whatsapp || '',
        email: proposed.email || '',
        facebook: proposed.facebook || '',
        instagram: proposed.instagram || '',
        telegram: proposed.telegram || '',
        website: proposed.website || '',
        openTime: proposed.openTime || '',
        closeTime: proposed.closeTime || '',
        workDays: proposed.workDays || [],
        images: proposed.images || [],
        lat: proposed.lat || '',
        lng: proposed.lng || '',
        adminNote: adminNote || '',
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      // Mark edit as approved
      await editRef.update({
        status: 'approved',
        adminNote: adminNote || '',
        reviewedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      Data._invalidateCache();
      await this.addNotification('approve_edit', `تمت الموافقة على تعديل: ${edit.placeName || edit.placeId}`);

      // Notify the owner
      if (edit.owner) {
        try {
          await db.collection('notifications').add({
            userId: edit.owner,
            type: 'admin',
            message: `✅ تمت الموافقة على تعديل نشاطك "${edit.placeName || ''}". التغييرات أصبحت مرئية الآن.${adminNote ? ' ملاحظة: ' + adminNote : ''}`,
            read: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        } catch (e) { console.error('Notify owner error:', e); }
      }
      return true;
    } catch (e) {
      console.error('approvePlaceEdit error:', e);
      return false;
    }
  },

  async rejectPlaceEdit(editId, adminNote) {
    try {
      const editRef = db.collection('place_edits').doc(editId);
      const editDoc = await editRef.get();
      if (!editDoc.exists) return false;
      const edit = editDoc.data();

      await editRef.update({
        status: 'rejected',
        adminNote: adminNote || '',
        reviewedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      await this.addNotification('reject_edit', `تم رفض تعديل: ${edit.placeName || edit.placeId}`);

      // Notify the owner
      if (edit.owner) {
        try {
          await db.collection('notifications').add({
            userId: edit.owner,
            type: 'admin',
            message: `❌ تم رفض تعديل نشاطك "${edit.placeName || ''}".${adminNote ? ' السبب: ' + adminNote : ''}`,
            read: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        } catch (e) { console.error('Notify owner error:', e); }
      }
      return true;
    } catch (e) {
      console.error('rejectPlaceEdit error:', e);
      return false;
    }
  }
};
