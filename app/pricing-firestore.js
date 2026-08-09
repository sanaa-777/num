// =============================================
// Pricing Manager - Firestore Backend
// التسعيرات (عملات، معادن، بنزين، غذاء، مشفرات)
// =============================================

const Pricing = {
  _cache: null,
  _cacheTime: 0,
  _CACHE_TTL: 60000,

  categories: [
    { id: 'currencies', name: 'أسعار العملات', icon: 'banknote', color: '#eab308' },
    { id: 'metals', name: 'المعادن', icon: 'gem', color: '#f59e0b' },
    { id: 'fuel', name: 'البنزين', icon: 'fuel', color: '#ef4444' },
    { id: 'food', name: 'المواد الغذائية', icon: 'shopping-cart', color: '#22c55e' },
    { id: 'crypto', name: 'العملات المشفرة', icon: 'bitcoin', color: '#8b5cf6' }
  ],

  async getAll() {
    const now = Date.now();
    if (this._cache && (now - this._cacheTime) < this._CACHE_TTL) return this._cache;
    try {
      try {
        const snapshot = await db.collection('pricing').orderBy('sortOrder', 'asc').get();
        this._cache = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (idxErr) {
        const snapshot = await db.collection('pricing').get();
        this._cache = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      }
      this._cacheTime = now;
      return this._cache;
    } catch (e) {
      console.error('Pricing getAll error:', e);
      return this._cache || [];
    }
  },

  async getByCategory(category) {
    const all = await this.getAll();
    return all.filter(p => p.category === category && p.isActive !== false);
  },

  async getCount() {
    const all = await this.getAll();
    return all.filter(p => p.isActive !== false).length;
  },

  async getById(id) {
    try {
      const doc = await db.collection('pricing').doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (e) {
      console.error('Pricing getById error:', e);
      return null;
    }
  },

  async add(pricing) {
    try {
      const all = await this.getAll();
      const maxOrder = all.filter(p => p.category === pricing.category).reduce((max, p) => Math.max(max, p.sortOrder || 0), 0);
      const docRef = await db.collection('pricing').add({
        ...pricing,
        sortOrder: maxOrder + 1,
        isActive: true,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this._invalidateCache();
      return { id: docRef.id, ...pricing };
    } catch (e) {
      console.error('Pricing add error:', e);
      throw e;
    }
  },

  async update(id, data) {
    try {
      await db.collection('pricing').doc(id).update({
        ...data,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this._invalidateCache();
    } catch (e) {
      console.error('Pricing update error:', e);
      throw e;
    }
  },

  async delete(id) {
    try {
      await db.collection('pricing').doc(id).delete();
      this._invalidateCache();
    } catch (e) {
      console.error('Pricing delete error:', e);
      throw e;
    }
  },

  async toggleActive(id) {
    try {
      const doc = await db.collection('pricing').doc(id).get();
      if (!doc.exists) return false;
      const newStatus = !doc.data().isActive;
      await db.collection('pricing').doc(id).update({
        isActive: newStatus,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this._invalidateCache();
      return newStatus;
    } catch (e) {
      console.error('Pricing toggleActive error:', e);
      return false;
    }
  },

  async updateSortOrder(id, newOrder) {
    try {
      await db.collection('pricing').doc(id).update({
        sortOrder: newOrder,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this._invalidateCache();
    } catch (e) {
      console.error('Pricing updateSortOrder error:', e);
    }
  },

  _invalidateCache() { this._cache = null; this._cacheTime = 0; },

  getAllSync() { return this._cache || []; },
  getByCategorySync(category) {
    return (this._cache || []).filter(p => p.category === category && p.isActive !== false);
  },
  getCategoryInfo(categoryId) {
    return this.categories.find(c => c.id === categoryId);
  }
};
