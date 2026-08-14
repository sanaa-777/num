// =============================================
// Ads Manager - Firestore Backend
// يحل محل ads.js القديم (localStorage)
// =============================================

const Ads = {
  _cache: null,
  _cacheTime: 0,
  _CACHE_TTL: 60000,

  // ====== جلب الإعلانات ======
  async getAll() {
    const now = Date.now();
    if (this._cache && (now - this._cacheTime) < this._CACHE_TTL) return this._cache;
    try {
      const snapshot = await db.collection('ads').orderBy('createdAt', 'desc').get();
      this._cache = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      this._cacheTime = now;
      return this._cache;
    } catch (e) {
      console.error('Ads getAll error:', e);
      return this._cache || [];
    }
  },

  // نسخة متزامنة للتوافق
  getAllSync() { return this._cache || []; },

  _invalidateCache() { this._cache = null; this._cacheTime = 0; },

  // ====== إضافة إعلان ======
  async add(ad) {
    try {
      const docRef = await db.collection('ads').add({
        ...ad,
        views: 0,
        clicks: 0,
        isActive: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this._invalidateCache();
      return { id: docRef.id, ...ad };
    } catch (e) {
      console.error('Ads add error:', e);
      throw e;
    }
  },

  // ====== تحديث إعلان ======
  async update(id, data) {
    try {
      await db.collection('ads').doc(id).update({
        ...data,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this._invalidateCache();
    } catch (e) {
      console.error('Ads update error:', e);
    }
  },

  // ====== حذف إعلان ======
  async delete(id) {
    try {
      await db.collection('ads').doc(id).delete();
      this._invalidateCache();
    } catch (e) {
      console.error('Ads delete error:', e);
    }
  },

  // ====== تبديل الحالة ======
  async toggleActive(id) {
    try {
      const doc = await db.collection('ads').doc(id).get();
      if (!doc.exists) return false;
      const newStatus = !doc.data().isActive;
      await db.collection('ads').doc(id).update({
        isActive: newStatus,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this._invalidateCache();
      return newStatus;
    } catch (e) {
      console.error('Ads toggleActive error:', e);
      return false;
    }
  },

  // ====== الإعلانات النشطة حسب الموضع ======
  async getActiveByPosition(position) {
    const ads = await this.getAll();
    const now = new Date();
    return ads.filter(ad => {
      if (!ad.isActive) return false;
      if (ad.publishDate && ad.publishDate.toDate && ad.publishDate.toDate() > now) return false;
      if (ad.expireDate && ad.expireDate.toDate && ad.expireDate.toDate() < now) return false;
      return ad.position === position;
    });
  },

  // نسخة متزامنة
  getActiveByPositionSync(position) {
    const ads = this.getAllSync();
    const now = new Date();
    return ads.filter(ad => {
      if (!ad.isActive) return false;
      // Check scheduling
      if (ad.startDate && ad.startDate.toDate && ad.startDate.toDate() > now) return false;
      if (ad.endDate && ad.endDate.toDate && ad.endDate.toDate() < now) return false;
      return ad.position === position;
    });
  },

  // ====== تسجيل المشاهدة/النقر ======
  async recordView(id) {
    try {
      await db.collection('ads').doc(id).update({
        views: firebase.firestore.FieldValue.increment(1)
      });
    } catch (e) {
      ErrorTracker.capture(e, { operation: 'ads.record_view', requestData: { adId: id } });
    }
  },

  async recordClick(id) {
    try {
      await db.collection('ads').doc(id).update({
        clicks: firebase.firestore.FieldValue.increment(1)
      });
    } catch (e) {
      ErrorTracker.capture(e, { operation: 'ads.record_click', requestData: { adId: id } });
    }
  },

  // ====== رفع صورة الإعلان ======
  async uploadImage(file) {
    if (!ImageStorage.isConfigured()) {
      console.warn('Ads uploadImage: ImageStorage not configured');
      return null;
    }
    try {
      const ownerSegment = (window.Auth && Auth.currentUser && Auth.currentUser.id) ? Auth.currentUser.id : 'admin';
      const result = await ImageStorage.upload(file, 'ads/' + ownerSegment);
      return result.url;
    } catch (e) {
      console.error('Ads uploadImage error:', e);
      return null;
    }
  },

  // ====== مواضع الإعلانات ======
  positions: [
    { id: 'header', name: 'أعلى الصفحة (Header)', icon: 'arrow-up', description: 'يظهر أسفل شريط التنقل العلوي' },
    { id: 'below_hero', name: 'أسفل الهيرو', icon: 'image', description: 'يظهر أسفل قسم الترحيب الرئيسي' },
    { id: 'between_sections', name: 'بين الأقسام', icon: 'columns', description: 'يظهر بين أقسام الصفحة الرئيسية' },
    { id: 'above_places', name: 'فوق الأماكن', icon: 'layout-grid', description: 'يظهر فوق شبكة الأماكن المميزة' },
    { id: 'inside_places', name: 'بين البطاقات', icon: 'grid-3x3', description: 'يظهر داخل شبكة الأماكن' },
    { id: 'place_detail', name: 'صفحة المكان', icon: 'file-text', description: 'يظهر داخل صفحة تفاصيل المكان' },
    { id: 'sidebar', name: 'الشريط الجانبي', icon: 'panel-right', description: 'يظهر في الجانب (سطح المكتب فقط)' },
    { id: 'footer', name: 'أسفل الصفحة (Footer)', icon: 'arrow-down', description: 'يظهر فوق الفوتر' },
  ],

  sizes: [
    { id: 'banner', name: 'بانر عريض', width: '100%', height: '90px', aspect: '728/90' },
    { id: 'rectangle', name: 'مستطيل متوسط', width: '300px', height: '250px', aspect: '300/250' },
    { id: 'square', name: 'مربع', width: '250px', height: '250px', aspect: '1/1' },
    { id: 'leaderboard', name: 'لوحة قيادة', width: '100%', height: '60px', aspect: '728/60' },
    { id: 'responsive', name: 'متجاوب', width: '100%', height: 'auto', aspect: 'auto' },
  ],

  // ====== الإحصائيات ======
  async getStats() {
    const ads = await this.getAll();
    return {
      total: ads.length,
      active: ads.filter(a => a.isActive).length,
      inactive: ads.filter(a => !a.isActive).length,
      totalViews: ads.reduce((s, a) => s + (a.views || 0), 0),
      totalClicks: ads.reduce((s, a) => s + (a.clicks || 0), 0),
    };
  },

  // ====== عرض الإعلان ======
  renderAd(ad, containerClass = '') {
    if (!ad || !ad.images || ad.images.length === 0) return '';
    const hasMultiple = ad.images.length > 1;
    const sliderId = 'slider_' + ad.id;
    // Aspect ratio based on ad size
    const aspectMap = { banner: '728/90', leaderboard: '728/60', square: '1/1', rectangle: '300/250' };
    const aspect = aspectMap[ad.size] || '16/9';
    const clickHandler = ad.linkUrl ? `onclick="Ads.recordClick('${ad.id}');window.open('${ad.linkUrl.replace(/'/g, "\\'")}','${ad.linkTarget || '_blank'}')"` : '';
    
    let imagesHtml = '';
    if (hasMultiple) {
      imagesHtml = `<div id="${sliderId}" class="ad-slider" style="aspect-ratio:${aspect}">
        ${ad.images.map((img, i) => `<img src="${img}" alt="" loading="${i === 0 ? 'eager' : 'lazy'}" fetchpriority="${i === 0 ? 'high' : 'low'}" class="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${i === 0 ? 'opacity-100' : 'opacity-0'}" data-slide="${i}">`).join('')}
        <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          ${ad.images.map((_, i) => `<button onclick="event.stopPropagation();Ads.goToSlide('${sliderId}',${i})" class="w-2 h-2 rounded-full ${i===0?'bg-white':'bg-white/60'}" data-dot="${i}"></button>`).join('')}
        </div>
        <button onclick="event.stopPropagation();Ads.prevSlide('${sliderId}')" class="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50"><i data-lucide="chevron-left" class="w-4 h-4"></i></button>
        <button onclick="event.stopPropagation();Ads.nextSlide('${sliderId}')" class="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50"><i data-lucide="chevron-right" class="w-4 h-4"></i></button>
      </div>`;
    } else {
      imagesHtml = `<img src="${ad.images[0]}" alt="" loading="eager" fetchpriority="high" class="w-full object-cover" style="aspect-ratio:${aspect}">`;
    }

    return `<div class="ad-container ${containerClass}" ${clickHandler} data-ad-id="${ad.id}">
      ${imagesHtml}
      <div class="ad-badge">إعلان</div>
    </div>`;
  },

  // ====== السلايدر ======
  sliders: {},
  initSlider(sliderId, ad) {
    if (!ad.images || ad.images.length <= 1) return;
    this.sliders[sliderId] = { current: 0, total: ad.images.length, timer: null, duration: ad.sliderDuration || 4000 };
    this.startAutoSlide(sliderId);
  },
  startAutoSlide(sliderId) {
    const slider = this.sliders[sliderId];
    if (!slider) return;
    clearInterval(slider.timer);
    slider.timer = setInterval(() => this.nextSlide(sliderId), slider.duration);
  },
  goToSlide(sliderId, index) {
    const slider = this.sliders[sliderId];
    const container = document.getElementById(sliderId);
    if (!slider || !container) return;
    slider.current = index;
    container.querySelectorAll('[data-slide]').forEach((s, i) => {
      s.classList.toggle('opacity-100', i === index);
      s.classList.toggle('opacity-0', i !== index);
    });
    container.querySelectorAll('[data-dot]').forEach((d, i) => {
      d.classList.toggle('bg-white', i === index);
      d.classList.toggle('bg-white/60', i !== index);
    });
    this.startAutoSlide(sliderId);
  },
  nextSlide(sliderId) { const s = this.sliders[sliderId]; if (s) this.goToSlide(sliderId, (s.current + 1) % s.total); },
  prevSlide(sliderId) { const s = this.sliders[sliderId]; if (s) this.goToSlide(sliderId, (s.current - 1 + s.total) % s.total); },
  initAllSliders() {
    const ads = (this._cache || []).filter(a => a.isActive && a.images && a.images.length > 1);
    ads.forEach(ad => this.initSlider('slider_' + ad.id, ad));
  },

  // ====== عرض الإعلانات في المواضع ======
  renderPosition(position) {
    const ads = this.getActiveByPositionSync(position);
    if (!ads.length) return '';
    return ads.map(ad => {
      this.recordView(ad.id);
      return this.renderAd(ad);
    }).join('');
  }
};
