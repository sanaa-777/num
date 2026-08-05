// =============================================
// لوحة تحكم الأدمن - Admin Dashboard
// =============================================

const Admin = {
  // التحقق من صلاحيات الأدمن
  isAdmin() {
    return Auth.currentUser && Auth.currentUser.role === 'admin';
  },

  // إنشاء أدمن افتراضي (admin@yemendirectory.net / admin123)
  initDefaultAdmin() {
    const users = JSON.parse(localStorage.getItem('dy_users') || '[]');
    const hasAdmin = users.find(u => u.role === 'admin');
    if (!hasAdmin) {
      const admin = {
        id: 'admin_001',
        name: 'مدير النظام',
        email: 'admin@yemendirectory.net',
        phone: '777000000',
        avatar: 'https://ui-avatars.com/api/?name=Admin&background=dc2626&color=fff&size=128',
        role: 'admin',
        verified: true,
        suspended: false,
        createdAt: new Date().toISOString(),
      };
      users.push(admin);
      localStorage.setItem('dy_users', JSON.stringify(users));

      // كلمة مرور الأدمن
      const creds = JSON.parse(localStorage.getItem('dy_credentials') || '{}');
      creds['admin@yemendirectory.net'] = Auth._hashPassword('admin123');
      localStorage.setItem('dy_credentials', JSON.stringify(creds));
    }
  },

  // ====== إدارة المستخدمين ======
  getAllUsers() {
    return JSON.parse(localStorage.getItem('dy_users') || '[]');
  },

  toggleVerify(userId) {
    const users = this.getAllUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.verified = !user.verified;
      localStorage.setItem('dy_users', JSON.stringify(users));
      this.addNotification('verify', `تم ${user.verified ? 'توثيق' : 'إلغاء توثيق'} الحساب: ${user.name}`);
      return user.verified;
    }
    return false;
  },

  toggleSuspend(userId) {
    const users = this.getAllUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.suspended = !user.suspended;
      localStorage.setItem('dy_users', JSON.stringify(users));
      this.addNotification('suspend', `تم ${user.suspended ? 'إيقاف' : 'تفعيل'} الحساب: ${user.name}`);
      return user.suspended;
    }
    return false;
  },

  deleteUser(userId) {
    let users = this.getAllUsers();
    const user = users.find(u => u.id === userId);
    if (user && user.role !== 'admin') {
      users = users.filter(u => u.id !== userId);
      localStorage.setItem('dy_users', JSON.stringify(users));
      // حذف أماكن المستخدم
      let places = Data.getPlaces().filter(p => p.owner !== userId);
      localStorage.setItem('dy_places', JSON.stringify(places));
      this.addNotification('delete', `تم حذف الحساب: ${user.name}`);
      return true;
    }
    return false;
  },

  // ====== إدارة الأماكن ======
  getAllPlaces() {
    return Data.getPlaces();
  },

  verifyPlace(placeId) {
    const places = Data.getPlaces();
    const place = places.find(p => p.id === placeId);
    if (place) {
      place.verified = !place.verified;
      localStorage.setItem('dy_places', JSON.stringify(places));
      return place.verified;
    }
    return false;
  },

  featurePlace(placeId) {
    const places = Data.getPlaces();
    const place = places.find(p => p.id === placeId);
    if (place) {
      place.featured = !place.featured;
      localStorage.setItem('dy_places', JSON.stringify(places));
      return place.featured;
    }
    return false;
  },

  deletePlaceAdmin(placeId) {
    let places = Data.getPlaces();
    places = places.filter(p => p.id !== placeId);
    localStorage.setItem('dy_places', JSON.stringify(places));
    return true;
  },

  // ====== الإشعارات ======
  getNotifications() {
    return JSON.parse(localStorage.getItem('dy_admin_notifications') || '[]');
  },

  addNotification(type, message) {
    const notifs = this.getNotifications();
    notifs.unshift({
      id: 'notif_' + Date.now(),
      type,
      message,
      read: false,
      createdAt: new Date().toISOString()
    });
    // الاحتفاظ بآخر 50 إشعار فقط
    if (notifs.length > 50) notifs.length = 50;
    localStorage.setItem('dy_admin_notifications', JSON.stringify(notifs));
  },

  markNotificationsRead() {
    const notifs = this.getNotifications();
    notifs.forEach(n => n.read = true);
    localStorage.setItem('dy_admin_notifications', JSON.stringify(notifs));
  },

  getUnreadCount() {
    return this.getNotifications().filter(n => !n.read).length;
  },

  // إشعار طلب توثيق
  notifyVerificationRequest(userName, userId) {
    this.addNotification('request', `طلب توثيق جديد من: ${userName}`);
  },

  // إشعار نشاط جديد
  notifyNewPlace(placeName, userName) {
    this.addNotification('new_place', `نشاط جديد: ${placeName} بواسطة ${userName}`);
  },

  // ====== إحصائيات ======
  getStats() {
    const users = this.getAllUsers();
    const places = Data.getPlaces();
    return {
      totalUsers: users.length,
      verifiedUsers: users.filter(u => u.verified).length,
      suspendedUsers: users.filter(u => u.suspended).length,
      totalPlaces: places.length,
      verifiedPlaces: places.filter(p => p.verified).length,
      featuredPlaces: places.filter(p => p.featured).length,
      pendingRequests: this.getNotifications().filter(n => !n.read).length,
    };
  }
};
