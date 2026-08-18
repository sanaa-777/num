// =============================================
// Auth System - Firebase Auth Backend
// يحل محل auth.js القديم (localStorage)
// =============================================

const Auth = {
  currentUser: null,
  _authListenerAttached: false,
  _initResolve: null,

  // ====== Login Rate Limiting (Dual-Layer) ======
  // Layer 1: In-memory (fast, UX feedback) — resets on page refresh
  // Layer 2: Firestore (persistent, harder to bypass) — survives refresh
  // Layer 3: Firebase Auth server-side IP blocking (automatic, cannot be bypassed)
  _loginAttempts: {},
  _MAX_ATTEMPTS: 5,
  _WINDOW_MS: 300000,
  _LOCKOUT_BASE: 30000,
  _MAX_LOCKOUT: 900000,

  _getRateLimitKey(email) {
    return (email || '').toLowerCase().trim();
  },

  async _checkRateLimit(email) {
    const key = this._getRateLimitKey(email);
    if (!key) return { allowed: true };

    // Layer 1: Check in-memory (fast path)
    const memEntry = this._loginAttempts[key];
    if (memEntry) {
      const now = Date.now();
      if (memEntry.lockedUntil && now < memEntry.lockedUntil) {
        const remainingSec = Math.ceil((memEntry.lockedUntil - now) / 1000);
        return { allowed: false, message: `تم إيقاف الدخول مؤقتاً. حاول بعد ${remainingSec} ثانية` };
      }
      if (now - memEntry.firstAttempt > this._WINDOW_MS) {
        delete this._loginAttempts[key];
      } else if (memEntry.count >= this._MAX_ATTEMPTS) {
        const lockoutMultiplier = Math.pow(2, memEntry.lockoutCount || 0);
        const lockoutDuration = Math.min(this._LOCKOUT_BASE * lockoutMultiplier, this._MAX_LOCKOUT);
        memEntry.lockedUntil = now + lockoutDuration;
        memEntry.lockoutCount = (memEntry.lockoutCount || 0) + 1;
        return { allowed: false, message: `تم إيقاف الدخول مؤقتاً. حاول بعد ${Math.ceil(lockoutDuration / 1000)} ثانية` };
      }
    }

    // Layer 2: Check Firestore (persistent, cross-session)
    try {
      const doc = await db.collection('login_attempts').doc(key).get();
      if (doc.exists) {
        const data = doc.data();
        const now = Date.now();
        // Check lockout
        if (data.lockedUntil && data.lockedUntil.toMillis && data.lockedUntil.toMillis() > now) {
          const remainingSec = Math.ceil((data.lockedUntil.toMillis() - now) / 1000);
          // Sync to memory
          this._loginAttempts[key] = {
            count: data.count || 0,
            firstAttempt: data.firstAttempt ? data.firstAttempt.toMillis() : now,
            lastAttempt: now,
            lockedUntil: data.lockedUntil.toMillis(),
            lockoutCount: data.lockoutCount || 0
          };
          return { allowed: false, message: `تم إيقاف الدخول مؤقتاً. حاول بعد ${remainingSec} ثانية` };
        }
        // Check window
        const firstAttemptMs = data.firstAttempt ? data.firstAttempt.toMillis() : 0;
        if (firstAttemptMs && (now - firstAttemptMs) > this._WINDOW_MS) {
          // Window expired — clean up
          try { await db.collection('login_attempts').doc(key).delete(); } catch(e) {}
        } else if (data.count >= this._MAX_ATTEMPTS) {
          // Apply lockout in Firestore
          const lockoutMultiplier = Math.pow(2, data.lockoutCount || 0);
          const lockoutDuration = Math.min(this._LOCKOUT_BASE * lockoutMultiplier, this._MAX_LOCKOUT);
          const lockoutUntil = new Date(now + lockoutDuration);
          try {
            await db.collection('login_attempts').doc(key).update({
              lockedUntil: firebase.firestore.Timestamp.fromDate(lockoutUntil),
              lockoutCount: (data.lockoutCount || 0) + 1
            });
          } catch(e) {}
          // Sync to memory
          this._loginAttempts[key] = {
            count: data.count,
            firstAttempt: firstAttemptMs,
            lastAttempt: now,
            lockedUntil: lockoutUntil.getTime(),
            lockoutCount: (data.lockoutCount || 0) + 1
          };
          return { allowed: false, message: `تم إيقاف الدخول مؤقتاً. حاول بعد ${Math.ceil(lockoutDuration / 1000)} ثانية` };
        }
      }
    } catch (e) {
      // Firestore check failed — fall through to allow (memory check already passed)
      console.warn('Rate limit Firestore check failed:', e.message);
    }

    return { allowed: true };
  },

  async _recordFailedAttempt(email) {
    const key = this._getRateLimitKey(email);
    if (!key) return;
    const now = Date.now();

    // Layer 1: Update memory
    const memEntry = this._loginAttempts[key];
    if (!memEntry || (now - memEntry.firstAttempt > this._WINDOW_MS)) {
      this._loginAttempts[key] = {
        count: 1, firstAttempt: now, lastAttempt: now,
        lockedUntil: null, lockoutCount: memEntry ? memEntry.lockoutCount : 0
      };
    } else {
      memEntry.count++;
      memEntry.lastAttempt = now;
    }

    // Layer 2: Update Firestore (persistent)
    try {
      const docRef = db.collection('login_attempts').doc(key);
      const doc = await docRef.get();
      if (!doc.exists || (doc.data().firstAttempt && (now - doc.data().firstAttempt.toMillis()) > this._WINDOW_MS)) {
        await docRef.set({
          email: key,
          count: 1,
          firstAttempt: firebase.firestore.FieldValue.serverTimestamp(),
          lastAttempt: firebase.firestore.FieldValue.serverTimestamp(),
          lockedUntil: null,
          lockoutCount: doc.exists ? (doc.data().lockoutCount || 0) : 0
        });
      } else {
        await docRef.update({
          count: firebase.firestore.FieldValue.increment(1),
          lastAttempt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
    } catch (e) {
      console.warn('Rate limit Firestore write failed:', e.message);
    }
  },

  async _clearFailedAttempts(email) {
    const key = this._getRateLimitKey(email);
    if (!key) return;
    // Clear memory
    delete this._loginAttempts[key];
    // Clear Firestore
    try { await db.collection('login_attempts').doc(key).delete(); } catch(e) {}
  },

  // ====== التهيئة (تستدعى مرة واحدة) ======
  init() {
    return new Promise((resolve) => {
      this._initResolve = resolve;
      if (this._authListenerAttached) { resolve(this.currentUser); return; }
      this._authListenerAttached = true;

      // Handle redirect result from Google Sign-In
      auth.getRedirectResult().then((result) => {
        if (result && result.user) {
          console.log('Google redirect sign-in successful');
          this._normalizeSocialUser(result.user).then(() => {
            if (typeof App !== 'undefined' && App.render) App.render();
          });
        }
      }).catch((error) => {
        console.warn('Redirect result error:', error.code);
      });

      // Timeout: إذا لم يستجب Firebase خلال 8 ثوانٍ
      const timeout = setTimeout(() => {
        console.warn('Auth init timeout - continuing without auth');
        if (this._initResolve) {
          this._initResolve(null);
          this._initResolve = null;
        }
      }, 8000);

      try {
        auth.onAuthStateChanged(async (user) => {
          clearTimeout(timeout);
          if (user) {
            try {
              const userDoc = await db.collection('users').doc(user.uid).get();
              const userData = userDoc.exists ? userDoc.data() : {};

              this.currentUser = {
                id: user.uid,
                uid: user.uid,
                name: userData.name || user.displayName || 'مستخدم',
                email: user.email,
                phone: userData.phone || '',
                avatar: userData.avatar || user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=3b82f6&color=fff&size=128`,
                coverImage: userData.coverImage || null,
                role: userData.role || 'user',
                verified: userData.verified || false,
                suspended: userData.suspended || false,
                bio: userData.bio || '',
                location: userData.location || '',
                website: userData.website || '',
                createdAt: userData.createdAt
              };

              // إذا كان موقوفاً
              if (userData.suspended) {
                await auth.signOut();
                this.currentUser = null;
              }
            } catch (e) {
              console.error('Auth state error:', e);
              this.currentUser = {
                id: user.uid, uid: user.uid,
                name: user.displayName || 'مستخدم',
                email: user.email,
                avatar: user.photoURL || '',
                role: 'user', verified: false
              };
            }
          } else {
            this.currentUser = null;
          }

          if (this._initResolve) {
            this._initResolve(this.currentUser);
            this._initResolve = null;
          }

          // Start notification listener for logged-in users
          if (this.currentUser) {
            this._startNotifListener();
            // Start my-places listener so My Places page has data immediately
            if (typeof Data !== 'undefined' && Data.getMyPlaces) {
              Data.getMyPlaces(this.currentUser.id).catch(() => {});
            }
          } else {
            this._stopNotifListener();
            if (typeof Data !== 'undefined') Data._stopMyPlacesListener();
          }

          // تحديث الواجهة إذا كان التطبيق مُحمّلاً
          // لا تمسح صفحات التفاصيل — تدير محتواها بنفسها
          if (typeof App !== 'undefined' && App.render) {
            const v = App.currentView;
            if (!['place', 'offer', 'job', 'event', 'editplace'].includes(v)) {
              App.render();
            }
          }
        });
      } catch (e) {
        console.error('Auth listener error:', e.message);
        resolve(null);
      }
    });
  },

  // ====== التحقق من المصادقة (لتوافق الكود القديم) ======
  checkAuth() {
    return this.currentUser;
  },

  // ====== تسجيل حساب جديد ======
  async signup(name, email, password, phone) {
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // تحديث الملف الشخصي في Firebase Auth
      await user.updateProfile({
        displayName: name,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&size=128`
      });

      // إنشاء مستند المستخدم في Firestore
      await db.collection('users').doc(user.uid).set({
        name, email,
        phone: phone || '',
        avatar: user.photoURL,
        coverImage: null,
        role: 'user',
        verified: false,
        suspended: false,
        bio: '',
        location: '',
        website: '',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      // إرسال بريد تحقق
      try { await user.sendEmailVerification(); } catch (e) { console.log('Email verification skipped'); }

      // إشعار الأدمن
      await this._notifyAdmin('request', `طلب توثيق جديد من: ${name}`);

      this.currentUser = {
        id: user.uid, uid: user.uid,
        name, email,
        phone: phone || '',
        avatar: user.photoURL,
        role: 'user', verified: false
      };

      return this.currentUser;
    } catch (error) {
      throw this._handleError(error);
    }
  },

  // ====== تسجيل الدخول ======
  async login(email, password) {
    // Check rate limit (both memory + Firestore)
    const rateCheck = await this._checkRateLimit(email);
    if (!rateCheck.allowed) {
      const err = new Error(rateCheck.message);
      err.code = 'auth/too-many-attempts';
      throw this._handleError(err);
    }

    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      const userDoc = await db.collection('users').doc(user.uid).get();
      const userData = userDoc.exists ? userDoc.data() : {};

      if (userData.suspended) {
        await auth.signOut();
        // Use generic message — don't reveal account status
        throw new Error('بيانات الدخول غير صحيحة');
      }

      // Clear failed attempts on successful login
      await this._clearFailedAttempts(email);

      this.currentUser = {
        id: user.uid, uid: user.uid,
        name: userData.name || user.displayName,
        email: user.email,
        phone: userData.phone || '',
        avatar: userData.avatar || user.photoURL,
        role: userData.role || 'user',
        verified: userData.verified || false
      };

      return this.currentUser;
    } catch (error) {
      // Record failed attempt for credential errors
      if (error.code && (
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/invalid-email'
      )) {
        await this._recordFailedAttempt(email);
      }
      throw this._handleError(error);
    }
  },

  // ====== تسجيل الدخول بـ Google ======
  async loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const userCredential = await auth.signInWithPopup(provider);
      return await this._normalizeSocialUser(userCredential.user);
    } catch (error) {
      // ربط الحساب: إذا كان البريد مسجل بطريقة أخرى
      if (error && error.code === 'auth/account-exists-with-different-credential') {
        try {
          const email = error.email || (error.customData && error.customData.email);
          if (email) {
            const methods = await auth.fetchSignInMethodsForEmail(email);
            if (methods && methods.length > 0) {
              // المستخدم مسجل بكلمة مرور — نطلب منه الدخول بكلمة المرور ثم نربط الحساب
              throw this._handleError({
                code: 'auth/account-exists-with-different-credential',
                message: 'هذا البريد مسجل بطريقة أخرى. سجّل دخول بالإيميل وكلمة المرور أولاً ثم يمكنك ربط حساب Google من الملف الشخصي.'
              });
            }
          }
        } catch (linkErr) {
          if (linkErr.code === 'auth/account-exists-with-different-credential') throw linkErr;
          // fallback
        }
      }
      // popup blocked or internal error — نحاول redirect كخيار أخير
      if (error && (error.code === 'auth/popup-blocked' || error.code === 'auth/operation-not-supported-in-this-environment' || error.code === 'auth/internal-error' || error.code === 'auth/cancelled-popup-request')) {
        try {
          await auth.signInWithRedirect(provider);
          return { redirecting: true };
        } catch (redirectError) {
          throw this._handleError(redirectError);
        }
      }
      throw this._handleError(error);
    }
  },

  // ====== تسجيل الخروج ======
  async logout() {
    try {
      this._stopNotifListener();
      if (typeof Data !== 'undefined') Data._stopMyPlacesListener();
      await auth.signOut();
      this.currentUser = null;
      if (typeof App !== 'undefined' && App.render) App.render();
    } catch (e) {
      console.error('Logout error:', e);
      this.currentUser = null;
    }
  },

  // ====== تحديث الملف الشخصي ======
  async updateProfile(data) {
    if (!this.currentUser) return;
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Defense-in-depth: strip protected fields client-side
      // (Firestore rules also enforce this, but don't send them at all)
      var protectedFields = ['role', 'verified', 'suspended', 'createdAt'];
      var safeData = {};
      for (var key in data) {
        if (data.hasOwnProperty(key) && protectedFields.indexOf(key) === -1) {
          safeData[key] = data[key];
        }
      }

      await db.collection('users').doc(user.uid).update({
        ...safeData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      if (data.name || data.avatar) {
        await user.updateProfile({
          displayName: data.name || user.displayName,
          photoURL: data.avatar || user.photoURL
        });
      }

      Object.assign(this.currentUser, data);
    } catch (e) {
      console.error('updateProfile error:', e);
    }
  },

  // ====== رفع صورة الملف الشخصي ======
  async uploadAvatar(file) {
    if (!this.currentUser) return;
    if (!ImageStorage.isConfigured()) {
      console.warn('uploadAvatar: ImageStorage not configured');
      return null;
    }
    try {
      const result = await ImageStorage.upload(file, 'avatars/' + this.currentUser.id);
      await this.updateProfile({ avatar: result.url });
      return result.url;
    } catch (e) {
      console.error('uploadAvatar error:', e);
      return null;
    }
  },

  // ====== رفع صورة الغلاف ======
  async uploadCover(file) {
    if (!this.currentUser) return;
    if (!ImageStorage.isConfigured()) {
      console.warn('uploadCover: ImageStorage not configured');
      return null;
    }
    try {
      const result = await ImageStorage.upload(file, 'covers/' + this.currentUser.id);
      await this.updateProfile({ coverImage: result.url });
      return result.url;
    } catch (e) {
      console.error('uploadCover error:', e);
      return null;
    }
  },

  // ====== إعادة تعيين كلمة المرور ======
  async resetPassword(email) {
    try {
      await auth.sendPasswordResetEmail(email);
      return true;
    } catch (error) {
      throw this._handleError(error);
    }
  },

  async _normalizeSocialUser(user) {
    const userRef = db.collection('users').doc(user.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        name: user.displayName || 'مستخدم',
        email: user.email,
        phone: user.phoneNumber || '',
        avatar: user.photoURL,
        coverImage: null,
        role: 'user',
        verified: false,
        suspended: false,
        bio: '',
        location: '',
        website: '',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
        providerId: (user.providerData && user.providerData[0] && user.providerData[0].providerId) || 'google.com'
      }, { merge: true });
    } else {
      const existing = userDoc.data();
      await userRef.set({
        email: user.email,
        avatar: user.photoURL || existing.avatar || '',
        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
        providerId: (user.providerData && user.providerData[0] && user.providerData[0].providerId) || existing.providerId || 'google.com',
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    }

    const freshDoc = await userRef.get();
    const userData = freshDoc.exists ? freshDoc.data() : {};
    this.currentUser = {
      id: user.uid,
      uid: user.uid,
      name: userData.name || user.displayName || 'مستخدم',
      email: user.email,
      phone: userData.phone || '',
      avatar: userData.avatar || user.photoURL,
      role: userData.role || 'user',
      verified: userData.verified || false
    };

    return this.currentUser;
  },

  // ====== Unified Notification System ======
  _notifListener: null,
  _unreadCount: 0,
  _notifCallbacks: [],

  getUnreadCount() {
    return this._unreadCount;
  },

  onUnreadCountChange(callback) {
    this._notifCallbacks.push(callback);
    // Immediately call with current count
    callback(this._unreadCount);
    return () => {
      this._notifCallbacks = this._notifCallbacks.filter(cb => cb !== callback);
    };
  },

  _notifyCountListeners() {
    this._notifCallbacks.forEach(cb => {
      try { cb(this._unreadCount); } catch(e) {}
    });
  },

  _startNotifListener() {
    if (!this.currentUser) return;
    if (this._notifListener) { this._notifListener(); this._notifListener = null; }

    try {
      this._notifListener = db.collection('notifications')
        .where('userId', '==', this.currentUser.id)
        .where('read', '==', false)
        .onSnapshot((snapshot) => {
          this._unreadCount = snapshot.size;
          this._notifyCountListeners();
        }, (error) => {
          console.warn('Notification listener error:', error.message);
          // Fallback: one-time count
          db.collection('notifications')
            .where('userId', '==', this.currentUser.id)
            .where('read', '==', false)
            .get()
            .then(snap => { this._unreadCount = snap.size; this._notifyCountListeners(); })
            .catch(() => {});
        });
    } catch (e) {
      console.warn('Notification listener setup failed:', e.message);
    }
  },

  _stopNotifListener() {
    if (this._notifListener) {
      this._notifListener();
      this._notifListener = null;
    }
    this._unreadCount = 0;
    this._notifyCountListeners();
  },

  async markNotificationRead(notifId) {
    try {
      await db.collection('notifications').doc(notifId).update({ read: true });
      // Optimistically decrement count
      if (this._unreadCount > 0) {
        this._unreadCount--;
        this._notifyCountListeners();
      }
    } catch (e) {
      console.error('markNotificationRead error:', e);
    }
  },

  async markAllNotificationsRead() {
    if (!this.currentUser) return;
    try {
      const snap = await db.collection('notifications')
        .where('userId', '==', this.currentUser.id)
        .where('read', '==', false)
        .get();
      if (snap.empty) return;
      const batch = db.batch();
      snap.docs.forEach(d => batch.update(d.ref, { read: true }));
      await batch.commit();
      this._unreadCount = 0;
      this._notifyCountListeners();
    } catch (e) {
      console.error('markAllNotificationsRead error:', e);
    }
  },

  // ====== مساعدات ======
  isVerified() {
    return this.currentUser && this.currentUser.verified;
  },

  isAdmin() {
    return this.currentUser && this.currentUser.role === 'admin';
  },

  async _notifyAdmin(type, message) {
    try {
      // Write to admin_notifications (not notifications) because
      // regular users cannot create notifications for other users.
      // admin_notifications allows any authenticated user to create.
      await db.collection('admin_notifications').add({
        type, message,
        read: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (e) {
      console.error('_notifyAdmin error:', e);
    }
  },

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

  _handleError(error) {
    const messages = {
      'auth/email-already-in-use': 'البريد الإلكتروني مسجل مسبقاً',
      'auth/invalid-email': 'بريد إلكتروني غير صالح',
      'auth/operation-not-allowed': 'عملية غير مسموحة',
      'auth/weak-password': 'كلمة المرور ضعيفة (6 أحرف على الأقل)',
      'auth/user-disabled': 'تم تعطيل هذا الحساب',
      'auth/user-not-found': 'بيانات الدخول غير صحيحة',
      'auth/wrong-password': 'بيانات الدخول غير صحيحة',
      'auth/invalid-credential': 'بيانات الدخول غير صحيحة',
      'auth/too-many-requests': 'محاولات كثيرة، حاول لاحقاً',
      'auth/network-request-failed': 'خطأ في الاتصال بالشبكة',
      'auth/popup-closed-by-user': 'تم إغلاق نافذة تسجيل الدخول',
      'auth/popup-blocked': 'تم حظر النافذة المنبثقة',
      'auth/cancelled-popup-request': 'تم إلغاء محاولة تسجيل الدخول',
      'auth/operation-not-supported-in-this-environment': 'المتصفح لا يدعم هذه الطريقة',
      'auth/web-storage-unsupported': 'المتصفح لا يدعم التخزين المطلوب',
      'auth/missing-initial-state': 'حدث خطأ في عملية تسجيل الدخول، يرجى المحاولة مرة أخرى',
      'auth/account-exists-with-different-credential': 'يوجد حساب بنفس البريد الإلكتروني بطريقة دخول مختلفة',
      'auth/too-many-attempts': 'محاولات كثيرة، حاول لاحقاً'
    };
    return ErrorTracker.createUserError(error, {
      operation: 'auth.firebase',
      code: error.code || 'AUTH-UNEXPECTED',
      userMessage: messages[error.code] || error.message || 'تعذر إكمال عملية المصادقة حالياً'
    });
  }
};
