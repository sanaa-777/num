// =============================================
// Jobs Manager - Firestore Backend
// الوظائف
// =============================================

const Jobs = {
  _cache: null,
  _cacheTime: 0,
  _CACHE_TTL: 60000,

  _listener: null,
  
  async getAll() {
    if (this._listener) return this._cache || [];
    
    return new Promise((resolve) => {
      try {
        let query = db.collection('jobs');
        try { query = query.orderBy('createdAt', 'desc'); } catch(e) {}
        
        this._listener = query.onSnapshot((snapshot) => {
          this._cache = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          this._cacheTime = Date.now();
          
          if (typeof App !== 'undefined' && App._initialized) {
            App.render();
          }
          
          resolve(this._cache);
        }, (error) => {
          if (error.code === 'failed-precondition') {
            this._listener = null;
            let retryQuery = db.collection('jobs');
            this._listener = retryQuery.onSnapshot((snap) => {
              this._cache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
              this._cacheTime = Date.now();
              if (typeof App !== 'undefined' && App._initialized) App.render();
              resolve(this._cache);
            }, (retryErr) => {
              console.error('Jobs retry error:', retryErr);
              resolve(this._cache || []);
            });
            return;
          }
          console.error('Jobs listener error:', error);
          resolve(this._cache || []);
        });
      } catch (e) {
        console.error('Jobs getAll error:', e);
        resolve(this._cache || []);
      }
    });
  },

  async getActive() {
    const jobs = await this.getAll();
    const now = new Date();
    return jobs.filter(j => {
      if (!j.isActive) return false;
      if (j.endDate && j.endDate.toDate && j.endDate.toDate() < now) return false;
      return true;
    });
  },

  async getActiveCount() {
    const active = await this.getActive();
    return active.length;
  },

  async getById(id) {
    try {
      const doc = await db.collection('jobs').doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (e) {
      console.error('Job getById error:', e);
      return null;
    }
  },

  async add(job) {
    try {
      const docRef = await db.collection('jobs').add({
        ...job,
        isActive: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this._invalidateCache();
      return { id: docRef.id, ...job };
    } catch (e) {
      console.error('Job add error:', e);
      throw e;
    }
  },

  async update(id, data) {
    try {
      await db.collection('jobs').doc(id).update({
        ...data,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this._invalidateCache();
    } catch (e) {
      console.error('Job update error:', e);
      throw e;
    }
  },

  async delete(id) {
    try {
      await db.collection('jobs').doc(id).delete();
      this._invalidateCache();
    } catch (e) {
      console.error('Job delete error:', e);
      throw e;
    }
  },

  async toggleActive(id) {
    try {
      const doc = await db.collection('jobs').doc(id).get();
      if (!doc.exists) return false;
      const newStatus = !doc.data().isActive;
      await db.collection('jobs').doc(id).update({
        isActive: newStatus,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this._invalidateCache();
      return newStatus;
    } catch (e) {
      console.error('Job toggleActive error:', e);
      return false;
    }
  },

  async uploadImage(file) {
    try {
      const compressed = await this._compressImage(file, 800);
      const blob = await fetch(compressed).then(r => r.blob());
      const ownerSegment = (window.Auth && Auth.currentUser && Auth.currentUser.id) ? Auth.currentUser.id : 'admin';
      const fileName = `jobs/${ownerSegment}/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
      const ref = storage.ref(fileName);
      await ref.put(blob, { contentType: 'image/jpeg', cacheControl: 'public,max-age=31536000,immutable' });
      return await ref.getDownloadURL();
    } catch (e) {
      console.error('Job uploadImage error:', e);
      return null;
    }
  },

  async cleanupExpired() {
    try {
      const jobs = await this.getAll();
      const now = new Date();
      const batch = db.batch();
      let count = 0;
      jobs.forEach(j => {
        if (j.endDate && j.endDate.toDate && j.endDate.toDate() < now) {
          batch.update(db.collection('jobs').doc(j.id), { isActive: false, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
          count++;
        }
      });
      if (count > 0) await batch.commit();
      this._invalidateCache();
      return count;
    } catch (e) {
      console.error('Job cleanupExpired error:', e);
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
    const jobs = this._cache || [];
    const now = new Date();
    return jobs.filter(j => {
      if (!j.isActive) return false;
      if (j.endDate && j.endDate.toDate && j.endDate.toDate() < now) return false;
      return true;
    });
  }
};
