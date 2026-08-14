// =============================================
// Events Manager - Firestore Backend
// الفعاليات
// =============================================

const Events = {
  _cache: null,
  _cacheTime: 0,
  _CACHE_TTL: 60000,

  _listener: null,
  
  async getAll() {
    if (this._listener) return this._cache || [];
    
    return new Promise((resolve) => {
      try {
        let query = db.collection('events');
        try { query = query.orderBy('createdAt', 'desc'); } catch(e) {}
        
        this._listener = query.onSnapshot((snapshot) => {
          this._cache = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          this._cacheTime = Date.now();
          
          // Debounced re-render to prevent flickering
          if (typeof App !== 'undefined' && App._initialized) {
            clearTimeout(this._renderDebounce);
            this._renderDebounce = setTimeout(function() { var v = App.currentView; if (["place","offer","job","event","editplace"].indexOf(v) === -1) App.render(); }, 300);
          }
          
          resolve(this._cache);
        }, (error) => {
          if (error.code === 'failed-precondition') {
            this._listener = null;
            let retryQuery = db.collection('events');
            this._listener = retryQuery.onSnapshot((snap) => {
              this._cache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
              this._cacheTime = Date.now();
              if (typeof App !== 'undefined' && App._initialized) { var _v = App.currentView; if (['place','offer','job','event','editplace'].indexOf(_v) === -1) App.render(); }
              resolve(this._cache);
            }, (retryErr) => {
              console.error('Events retry error:', retryErr);
              resolve(this._cache || []);
            });
            return;
          }
          console.error('Events listener error:', error);
          resolve(this._cache || []);
        });
      } catch (e) {
        console.error('Events getAll error:', e);
        resolve(this._cache || []);
      }
    });
  },

  async getActive() {
    const events = await this.getAll();
    const now = new Date();
    return events.filter(ev => {
      if (!ev.isActive) return false;
      if (ev.endDate && ev.endDate.toDate && ev.endDate.toDate() < now) return false;
      return true;
    });
  },

  async getActiveCount() {
    const active = await this.getActive();
    return active.length;
  },

  async getById(id) {
    try {
      const doc = await db.collection('events').doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (e) {
      console.error('Event getById error:', e);
      return null;
    }
  },

  async add(event) {
    try {
      const docRef = await db.collection('events').add({
        ...event,
        isActive: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this._invalidateCache();
      return { id: docRef.id, ...event };
    } catch (e) {
      console.error('Event add error:', e);
      throw e;
    }
  },

  async update(id, data) {
    try {
      await db.collection('events').doc(id).update({
        ...data,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this._invalidateCache();
    } catch (e) {
      console.error('Event update error:', e);
      throw e;
    }
  },

  async delete(id) {
    try {
      await db.collection('events').doc(id).delete();
      this._invalidateCache();
    } catch (e) {
      console.error('Event delete error:', e);
      throw e;
    }
  },

  async toggleActive(id) {
    try {
      const doc = await db.collection('events').doc(id).get();
      if (!doc.exists) return false;
      const newStatus = !doc.data().isActive;
      await db.collection('events').doc(id).update({
        isActive: newStatus,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this._invalidateCache();
      return newStatus;
    } catch (e) {
      console.error('Event toggleActive error:', e);
      return false;
    }
  },

  async uploadImage(file) {
    if (!ImageStorage.isConfigured()) {
      console.warn('Event uploadImage: ImageStorage not configured');
      return null;
    }
    try {
      const ownerSegment = (window.Auth && Auth.currentUser && Auth.currentUser.id) ? Auth.currentUser.id : 'admin';
      const result = await ImageStorage.upload(file, 'events/' + ownerSegment);
      return result.url;
    } catch (e) {
      console.error('Event uploadImage error:', e);
      return null;
    }
  },

  async cleanupExpired() {
    try {
      const events = await this.getAll();
      const now = new Date();
      const batch = db.batch();
      let count = 0;
      events.forEach(ev => {
        if (ev.endDate && ev.endDate.toDate && ev.endDate.toDate() < now) {
          batch.update(db.collection('events').doc(ev.id), { isActive: false, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
          count++;
        }
      });
      if (count > 0) await batch.commit();
      this._invalidateCache();
      return count;
    } catch (e) {
      console.error('Event cleanupExpired error:', e);
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
    const events = this._cache || [];
    const now = new Date();
    return events.filter(ev => {
      if (!ev.isActive) return false;
      if (ev.endDate && ev.endDate.toDate && ev.endDate.toDate() < now) return false;
      return true;
    });
  }
};
