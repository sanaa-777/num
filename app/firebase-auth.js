// =============================================
// Firebase Auth - نظام المصادقة
// =============================================

const FirebaseAuth = {
  currentUser: null,

  // تسجيل بالبريد الإلكتروني
  async signup(email, password, name, phone) {
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // تحديث الملف الشخصي
      await user.updateProfile({
        displayName: name,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&size=128`
      });

      // إنشاء مستند المستخدم في Firestore
      await db.collection('users').doc(user.uid).set({
        name: name,
        email: email,
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
      await user.sendEmailVerification();

      this.currentUser = {
        uid: user.uid,
        name: name,
        email: email,
        phone: phone || '',
        avatar: user.photoURL,
        role: 'user',
        verified: false
      };

      return this.currentUser;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // تسجيل الدخول بالبريد
  async login(email, password) {
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // جلب بيانات المستخدم من Firestore
      const userDoc = await db.collection('users').doc(user.uid).get();
      const userData = userDoc.data();

      if (userData && userData.suspended) {
        await auth.signOut();
        throw new Error('تم إيقاف هذا الحساب. تواصل مع الإدارة');
      }

      this.currentUser = {
        uid: user.uid,
        name: userData?.name || user.displayName,
        email: user.email,
        phone: userData?.phone || '',
        avatar: userData?.avatar || user.photoURL,
        role: userData?.role || 'user',
        verified: userData?.verified || false
      };

      return this.currentUser;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // تسجيل الدخول بـ Google
  async loginWithGoogle() {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const userCredential = await auth.signInWithPopup(provider);
      const user = userCredential.user;

      // التحقق من وجود المستخدم
      const userDoc = await db.collection('users').doc(user.uid).get();

      if (!userDoc.exists) {
        // إنشاء مستخدم جديد
        await db.collection('users').doc(user.uid).set({
          name: user.displayName,
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

      const userData = userDoc.data() || {};

      this.currentUser = {
        uid: user.uid,
        name: userData.name || user.displayName,
        email: user.email,
        phone: userData.phone || '',
        avatar: userData.avatar || user.photoURL,
        role: userData.role || 'user',
        verified: userData.verified || false
      };

      return this.currentUser;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // تسجيل الخروج
  async logout() {
    await auth.signOut();
    this.currentUser = null;
  },

  // مراقبة حالة المصادقة
  onAuthStateChanged(callback) {
    return auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await db.collection('users').doc(user.uid).get();
        const userData = userDoc.data() || {};

        this.currentUser = {
          uid: user.uid,
          name: userData.name || user.displayName,
          email: user.email,
          phone: userData.phone || '',
          avatar: userData.avatar || user.photoURL,
          role: userData.role || 'user',
          verified: userData.verified || false
        };
      } else {
        this.currentUser = null;
      }
      callback(this.currentUser);
    });
  },

  // تحديث الملف الشخصي
  async updateProfile(data) {
    if (!this.currentUser) return;

    const user = auth.currentUser;
    if (!user) return;

    // تحديث في Firestore
    await db.collection('users').doc(user.uid).update({
      ...data,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // تحديث في Auth إذا تغير الاسم أو الصورة
    if (data.name || data.avatar) {
      await user.updateProfile({
        displayName: data.name || user.displayName,
        photoURL: data.avatar || user.photoURL
      });
    }

    Object.assign(this.currentUser, data);
  },

  // رفع صورة الملف الشخصي
  async uploadAvatar(file) {
    if (!this.currentUser) return;

    const user = auth.currentUser;
    const storageRef = storage.ref(`avatars/${user.uid}`);
    const snapshot = await storageRef.put(file);
    const downloadURL = await snapshot.ref.getDownloadURL();

    await this.updateProfile({ avatar: downloadURL });
    return downloadURL;
  },

  // رفع صورة الغلاف
  async uploadCover(file) {
    if (!this.currentUser) return;

    const user = auth.currentUser;
    const storageRef = storage.ref(`covers/${user.uid}`);
    const snapshot = await storageRef.put(file);
    const downloadURL = await snapshot.ref.getDownloadURL();

    await this.updateProfile({ coverImage: downloadURL });
    return downloadURL;
  },

  // معالجة الأخطاء
  handleError(error) {
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
      'auth/popup-blocked': 'تم حظر النافذة المنبثقة'
    };

    return ErrorTracker.createUserError(error, {
      operation: 'firebase_auth',
      code: error.code || 'AUTH-UNEXPECTED',
      userMessage: messages[error.code] || error.message || 'تعذر إكمال عملية المصادقة حالياً'
    });
  },

  // التحقق من حالة المستخدم
  isVerified() {
    return this.currentUser && this.currentUser.verified;
  },

  isAdmin() {
    return this.currentUser && this.currentUser.role === 'admin';
  }
};
