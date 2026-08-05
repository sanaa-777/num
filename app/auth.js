// =============================================
// نظام المصادقة - Auth System
// =============================================

const Auth = {
  currentUser: null,
  users: JSON.parse(localStorage.getItem('dy_users') || '[]'),

  // تسجيل حساب جديد بالبريد
  signup(name, email, password, phone) {
    if (this.users.find(u => u.email === email)) {
      throw new Error('البريد الإلكتروني مسجل مسبقاً');
    }
    const user = {
      id: 'user_' + Date.now(),
      name,
      email,
      phone: phone || '',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&size=128`,
      role: 'user',
      createdAt: new Date().toISOString(),
      favorites: [],
      places: []
    };
    // Store password separately for security
    const credentials = JSON.parse(localStorage.getItem('dy_credentials') || '{}');
    credentials[email] = this._hashPassword(password);
    localStorage.setItem('dy_credentials', JSON.stringify(credentials));

    this.users.push(user);
    localStorage.setItem('dy_users', JSON.stringify(this.users));
    this.currentUser = user;
    localStorage.setItem('dy_current_user', JSON.stringify(user));
    return user;
  },

  // تسجيل الدخول بالبريد
  login(email, password) {
    const credentials = JSON.parse(localStorage.getItem('dy_credentials') || '{}');
    const hashedPass = credentials[email];
    if (!hashedPass || hashedPass !== this._hashPassword(password)) {
      throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }
    const user = this.users.find(u => u.email === email);
    if (!user) throw new Error('المستخدم غير موجود');
    this.currentUser = user;
    localStorage.setItem('dy_current_user', JSON.stringify(user));
    return user;
  },

  // تسجيل الدخول بـ Google (OAuth)
  loginWithGoogle() {
    // Simulate Google login with popup
    return new Promise((resolve) => {
      const email = prompt('أدخل بريدك الإلكتروني Gmail:');
      if (!email || !email.includes('@')) {
        throw new Error('بريد إلكتروني غير صالح');
      }
      let user = this.users.find(u => u.email === email);
      if (!user) {
        const name = email.split('@')[0].replace(/[._]/g, ' ');
        user = this.signup(name, email, 'google_auth_' + Date.now(), '');
      }
      this.currentUser = user;
      localStorage.setItem('dy_current_user', JSON.stringify(user));
      resolve(user);
    });
  },

  // تسجيل الخروج
  logout() {
    this.currentUser = null;
    localStorage.removeItem('dy_current_user');
    App.render();
  },

  // التحقق من حالة الدخول
  checkAuth() {
    const saved = localStorage.getItem('dy_current_user');
    if (saved) {
      this.currentUser = JSON.parse(saved);
      this.users = JSON.parse(localStorage.getItem('dy_users') || '[]');
    }
    return this.currentUser;
  },

  // تحديث الملف الشخصي
  updateProfile(data) {
    if (!this.currentUser) return;
    Object.assign(this.currentUser, data);
    const idx = this.users.findIndex(u => u.id === this.currentUser.id);
    if (idx !== -1) this.users[idx] = this.currentUser;
    localStorage.setItem('dy_users', JSON.stringify(this.users));
    localStorage.setItem('dy_current_user', JSON.stringify(this.currentUser));
  },

  // تشفير بسيط (للاستخمال المحلي فقط)
  _hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 'h_' + Math.abs(hash).toString(36);
  }
};
