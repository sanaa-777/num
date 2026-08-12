// =============================================
// Offers Manager - Firestore Backend
// العروض الترويجية
// =============================================

const Offers = {
  _cache: null,
  _cacheTime: 0,
  _CACHE_TTL: 60000,

  _listener: null,
  
  async getAll() {
    if (this._listener) return this._cache || [];
    
    return new Promise((resolve) => {
      try {
        let query = db.collection('offers');
        try { query = query.orderBy('createdAt', 'desc'); } catch(e) {}
        
        this._listener = query.onSnapshot((snapshot) => {
          this._cache = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          this._cacheTime = Date.now();
          
          // Debounced re-render to prevent flickering
          if (typeof App !== 'undefined' && App._initialized) {
            clearTimeout(this._renderDebounce);
            this._renderDebounce = setTimeout(function() { App.render(); }, 300);
          }
          
          resolve(this._cache);
        }, (error) => {
          if (error.code === 'failed-precondition') {
            this._listener = null;
            let retryQuery = db.collection('offers');
            this._listener = retryQuery.onSnapshot((snap) => {
              this._cache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
              this._cacheTime = Date.now();
              if (typeof App !== 'undefined' && App._initialized) App.render();
              resolve(this._cache);
            }, (retryErr) => {
              console.error('Offers retry error:', retryErr);
              resolve(this._cache || []);
            });
            return;
          }
          console.error('Offers listener error:', error);
          resolve(this._cache || []);
        });
      } catch (e) {
        console.error('Offers getAll error:', e);
        resolve(this._cache || []);
      }
    });
  },

  async getActive() {
    const offers = await this.getAll();
    const now = new Date();
    return offers.filter(o => {
      if (!o.isActive) return false;
      if (o.endDate && o.endDate.toDate && o.endDate.toDate() < now) return false;
      return true;
    });
  },

  async getActiveCount() {
    const active = await this.getActive();
    return active.length;
  },

  async getById(id) {
    try {
      const doc = await db.collection('offers').doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (e) {
      console.error('Offer getById error:', e);
      return null;
    }
  },

  async add(offer) {
    try {
      const docRef = await db.collection('offers').add({
        ...offer,
        isActive: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this._invalidateCache();
      return { id: docRef.id, ...offer };
    } catch (e) {
      console.error('Offer add error:', e);
      throw e;
    }
  },

  async update(id, data) {
    try {
      await db.collection('offers').doc(id).update({
        ...data,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this._invalidateCache();
    } catch (e) {
      console.error('Offer update error:', e);
      throw e;
    }
  },

  async delete(id) {
    try {
      await db.collection('offers').doc(id).delete();
      this._invalidateCache();
    } catch (e) {
      console.error('Offer delete error:', e);
      throw e;
    }
  },

  async toggleActive(id) {
    try {
      const doc = await db.collection('offers').doc(id).get();
      if (!doc.exists) return false;
      const newStatus = !doc.data().isActive;
      await db.collection('offers').doc(id).update({
        isActive: newStatus,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this._invalidateCache();
      return newStatus;
    } catch (e) {
      console.error('Offer toggleActive error:', e);
      return false;
    }
  },

  async uploadImage(file) {
    if (!ImageStorage.isConfigured()) {
      console.warn('Offer uploadImage: ImageStorage not configured');
      return null;
    }
    try {
      const ownerSegment = (window.Auth && Auth.currentUser && Auth.currentUser.id) ? Auth.currentUser.id : 'admin';
      const result = await ImageStorage.upload(file, 'offers/' + ownerSegment);
      return result.url;
    } catch (e) {
      console.error('Offer uploadImage error:', e);
      return null;
    }
  },

  async cleanupExpired() {
    try {
      const offers = await this.getAll();
      const now = new Date();
      const batch = db.batch();
      let count = 0;
      offers.forEach(o => {
        if (o.endDate && o.endDate.toDate && o.endDate.toDate() < now) {
          batch.update(db.collection('offers').doc(o.id), { isActive: false, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
          count++;
        }
      });
      if (count > 0) await batch.commit();
      this._invalidateCache();
      return count;
    } catch (e) {
      console.error('Offer cleanupExpired error:', e);
      return 0;
    }
  },

  _invalidateCache() { this._cache = null; this._cacheTime = 0; },

  _compressImage(file, maxWidth) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width, h = img.height;
          if (w > maxWidth) { h = (maxWidth / w) * h; w = maxWidth; }
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  },

  getAllSync() { return this._cache || []; },
  getActiveSync() {
    const offers = this._cache || [];
    const now = new Date();
    return offers.filter(o => {
      if (!o.isActive) return false;
      if (o.endDate && o.endDate.toDate && o.endDate.toDate() < now) return false;
      return true;
    });
  }
};
