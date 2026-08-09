// =============================================
// Firebase Database - قاعدة البيانات
// =============================================

const FirebaseDB = {
  // ====== الأماكن ======

  // جلب جميع الأماكن
  async getPlaces(filters = {}) {
    let query = db.collection('places').where('isActive', '==', true).where('status', '==', 'approved');

    if (filters.category) {
      query = query.where('category', '==', filters.category);
    }
    if (filters.city) {
      query = query.where('city', '==', filters.city);
    }
    if (filters.subcategory) {
      query = query.where('subcategory', '==', filters.subcategory);
    }

    query = query.orderBy('createdAt', 'desc');

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // جلب مكان واحد
  async getPlace(id) {
    const doc = await db.collection('places').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  // إضافة مكان جديد
  async addPlace(placeData, userId) {
    const docRef = await db.collection('places').add({
      ...placeData,
      owner: userId,
      verified: false,
      featured: false,
      isActive: true,
      status: 'pending',
      views: 0,
      rating: 0,
      reviews: 0,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    return docRef.id;
  },

  // تحديث مكان
  async updatePlace(id, data) {
    await db.collection('places').doc(id).update({
      ...data,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  },

  // حذف مكان (تعطيل)
  async deletePlace(id) {
    await db.collection('places').doc(id).update({
      isActive: false,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  },

  // زيادة المشاهدات
  async incrementViews(id) {
    await db.collection('places').doc(id).update({
      views: firebase.firestore.FieldValue.increment(1)
    });
  },

  // جلب أماكن المستخدم
  async getUserPlaces(userId) {
    const snapshot = await db.collection('places')
      .where('owner', '==', userId)
      .where('isActive', '==', true)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // ====== المراجعات ======

  // إضافة مراجعة
  async addReview(placeId, userId, userName, rating, comment) {
    await db.collection('reviews').add({
      placeId: placeId,
      userId: userId,
      userName: userName,
      rating: rating,
      comment: comment,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // تحديث متوسط التقييم
    await this.updatePlaceRating(placeId);
  },

  // جلب مراجعات مكان
  async getReviews(placeId) {
    const snapshot = await db.collection('reviews')
      .where('placeId', '==', placeId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // تحديث متوسط التقييم
  async updatePlaceRating(placeId) {
    const reviews = await this.getReviews(placeId);
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    await db.collection('places').doc(placeId).update({
      rating: Math.round(avgRating * 10) / 10,
      reviews: reviews.length,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  },

  // ====== المفضلة ======

  // إضافة/إزالة من المفضلة
  async toggleFavorite(userId, placeId) {
    const favRef = db.collection('favorites').doc(`${userId}_${placeId}`);
    const doc = await favRef.get();

    if (doc.exists) {
      await favRef.delete();
      return false;
    } else {
      await favRef.set({
        userId: userId,
        placeId: placeId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return true;
    }
  },

  // التحقق من المفضلة
  async isFavorite(userId, placeId) {
    const doc = await db.collection('favorites').doc(`${userId}_${placeId}`).get();
    return doc.exists;
  },

  // جلب المفضلة
  async getFavorites(userId) {
    const snapshot = await db.collection('favorites')
      .where('userId', '==', userId)
      .get();

    const placeIds = snapshot.docs.map(doc => doc.data().placeId);

    if (placeIds.length === 0) return [];

    // جلب الأماكن
    const places = [];
    for (const placeId of placeIds) {
      const place = await this.getPlace(placeId);
      if (place) places.push(place);
    }

    return places;
  },

  // ====== البحث ======

  async search(query, filters = {}) {
    // البحث النصي ( Firestore لا يدعم Full-text search مباشرة)
    // نستخدم طريقة بديلة مع indexing

    let places = await this.getPlaces(filters);

    if (query) {
      const q = query.toLowerCase();
      places = places.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.address && p.address.toLowerCase().includes(q))
      );
    }

    return places;
  },

  // ====== الإشعارات ======

  // إرسال إشعار
  async sendNotification(userId, title, body, data = {}) {
    await db.collection('notifications').add({
      userId: userId,
      title: title,
      body: body,
      data: data,
      read: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  },

  // جلب الإشعارات
  async getNotifications(userId) {
    const snapshot = await db.collection('notifications')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // تحديد كمقروء
  async markAsRead(notificationId) {
    await db.collection('notifications').doc(notificationId).update({
      read: true
    });
  },

  // ====== التصنيفات ======

  // جلب التصنيفات
  async getCategories() {
    const snapshot = await db.collection('categories')
      .orderBy('sortOrder', 'asc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // ====== المدن ======

  // جلب المدن
  async getCities() {
    const snapshot = await db.collection('cities')
      .orderBy('name', 'asc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // ====== رفع الصور ======

  async uploadImage(file, path) {
    const storageRef = storage.ref(path);
    const snapshot = await storageRef.put(file);
    return await snapshot.ref.getDownloadURL();
  },

  async uploadPlaceImage(placeId, file) {
    const fileName = `${Date.now()}_${file.name}`;
    return await this.uploadImage(file, `places/${placeId}/${fileName}`);
  },

  // ====== الإحصائيات ======

  async getStats() {
    const placesSnapshot = await db.collection('places').where('isActive', '==', true).get();
    const usersSnapshot = await db.collection('users').get();
    const reviewsSnapshot = await db.collection('reviews').get();

    return {
      places: placesSnapshot.size,
      users: usersSnapshot.size,
      reviews: reviewsSnapshot.size,
      cities: 21,
      categories: 18
    };
  }
};
