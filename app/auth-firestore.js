// =============================================
// Auth System - Firebase Auth Backend
// يحل محل auth.js القديم (localStorage)
// =============================================

const Auth = {
  currentUser: null,
  _authListenerAttached: false,
  _initResolve: null,

  // ====== التهيئة (تستدعى مرة واحدة) ======
  init() {
    return new Promise((resolve) => {
      this._initResolve = resolve;
      if (this._authListenerAttached) { resolve(this.currentUser); return; }
      this._authListenerAttached = true;

      try {
      auth.onAuthStateChanged(async (user) => {
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

        // تحديث الواجهة إذا كان التطبيق مُحمّلاً
        if (typeof App !== 'undefined' && App.render) {
          App.render();
        }
      });
      } catch(e) {
        console.log('Auth listener error:', e.message);
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
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      const userDoc = await db.collection('users').doc(user.uid).get();
      const userData = userDoc.exists ? userDoc.data() : {};

      if (userData.suspended) {
        await auth.signOut();
        throw new Error('تم إيقاف هذا الحساب. تواصل مع الإدارة');
      }

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
      throw this._handleError(error);
    }
  },

  // ====== تسجيل الدخول بـ Google ======
  async loginWithGoogle() {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const userCredential = await auth.signInWithPopup(provider);
      const user = userCredential.user;

      const userDoc = await db.collection('users').doc(user.uid).get();

      if (!userDoc.exists) {
        await db.collection('users').doc(user.uid).set({
          name: user.displayName || 'مستخدم',
          email: user.email,
          phone: user.phoneNumber || '',
          avatar: user.photoURL,
          coverImage: null,
          role: 'user',
          verified: false,
          suspended: false,
          bio: '',
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }

      const userData = userDoc.exists ? userDoc.data() : {};
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
      throw this._handleError(error);
    }
  },

  // ====== تسجيل الخروج ======
  async logout() {
    try {
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

      await db.collection('users').doc(user.uid).update({
        ...data,
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
    try {
      const user = auth.currentUser;
      const compressed = await this._compressImage(file, 400);
      const blob = await fetch(compressed).then(r => r.blob());
      const ref = storage.ref(`avatars/${user.uid}`);
      await ref.put(blob);
      const url = await ref.getDownloadURL();
      await this.updateProfile({ avatar: url });
      return url;
    } catch (e) {
      console.error('uploadAvatar error:', e);
    }
  },

  // ====== رفع صورة الغلاف ======
  async uploadCover(file) {
    if (!this.currentUser) return;
    try {
      const user = auth.currentUser;
      const compressed = await this._compressImage(file, 800);
      const blob = await fetch(compressed).then(r => r.blob());
      const ref = storage.ref(`covers/${user.uid}`);
      await ref.put(blob);
      const url = await ref.getDownloadURL();
      await this.updateProfile({ coverImage: url });
      return url;
    } catch (e) {
      console.error('uploadCover error:', e);
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

  // ====== مساعدات ======
  isVerified() {
    return this.currentUser && this.currentUser.verified;
  },

  isAdmin() {
    return this.currentUser && this.currentUser.role === 'admin';
  },

  async _notifyAdmin(type, message) {
    try {
      // إرسال إشعار لجميع الأدمنات
      const adminsSnap = await db.collection('users').where('role', '==', 'admin').get();
      for (const adminDoc of adminsSnap.docs) {
        await db.collection('notifications').add({
          userId: adminDoc.id,
          type, message,
          read: false,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
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
      'auth/user-not-found': 'البريد الإلكتروني غير مسجل',
      'auth/wrong-password': 'كلمة المرور غير صحيحة',
      'auth/too-many-requests': 'محاولات كثيرة، حاول لاحقاً',
      'auth/network-request-failed': 'خطأ في الاتصال بالشبكة',
      'auth/popup-closed-by-user': 'تم إغلاق نافذة تسجيل الدخول',
      'auth/popup-blocked': 'تم حظر النافذة المنبثقة',
      'auth/invalid-credential': 'بيانات الدخول غير صحيحة'
    };
    return new Error(messages[error.code] || error.message || 'حدث خطأ غير متوقع');
  }
};
