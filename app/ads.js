// =============================================
// نظام إدارة الإعلانات - Ads Manager
// =============================================

const Ads = {
  // ====== بيانات الإعلانات ======
  getAll() {
    return JSON.parse(localStorage.getItem('dy_ads') || '[]');
  },

  save(ads) {
    localStorage.setItem('dy_ads', JSON.stringify(ads));
  },

  // إضافة إعلان جديد
  add(ad) {
    const ads = this.getAll();
    ad.id = 'ad_' + Date.now();
    ad.createdAt = new Date().toISOString();
    ad.updatedAt = ad.createdAt;
    ad.views = 0;
    ad.clicks = 0;
    ads.unshift(ad);
    this.save(ads);
    return ad;
  },

  // تعديل إعلان
  update(id, data) {
    const ads = this.getAll();
    const idx = ads.findIndex(a => a.id === id);
    if (idx !== -1) {
      Object.assign(ads[idx], data, { updatedAt: new Date().toISOString() });
      this.save(ads);
      return ads[idx];
    }
    return null;
  },

  // حذف إعلان
  delete(id) {
    const ads = this.getAll().filter(a => a.id !== id);
    this.save(ads);
  },

  // تبديل حالة الإعلان
  toggleActive(id) {
    const ads = this.getAll();
    const ad = ads.find(a => a.id === id);
    if (ad) {
      ad.isActive = !ad.isActive;
      ad.updatedAt = new Date().toISOString();
      this.save(ads);
      return ad.isActive;
    }
    return false;
  },

  // الحصول على الإعلانات النشطة حسب الموضع
  getActiveByPosition(position) {
    const now = new Date();
    return this.getAll().filter(ad => {
      if (!ad.isActive) return false;
      if (ad.publishDate && new Date(ad.publishDate) > now) return false;
      if (ad.expireDate && new Date(ad.expireDate) < now) return false;
      return ad.position === position;
    });
  },

  // تسجيل مشاهدة
  recordView(id) {
    const ads = this.getAll();
    const ad = ads.find(a => a.id === id);
    if (ad) {
      ad.views = (ad.views || 0) + 1;
      this.save(ads);
    }
  },

  // تسجيل نقرة
  recordClick(id) {
    const ads = this.getAll();
    const ad = ads.find(a => a.id === id);
    if (ad) {
      ad.clicks = (ad.clicks || 0) + 1;
      this.save(ads);
    }
  },

  // ضغط الصورة وتحويلها لـ Base64
  compressImage(file, maxWidth = 1200) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width;
          let h = img.height;
          if (w > maxWidth) {
            h = (maxWidth / w) * h;
            w = maxWidth;
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
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

  // ====== أحجام الإعلانات ======
  sizes: [
    { id: 'banner', name: 'بانر عريض', width: '100%', height: '90px', aspect: '728/90' },
    { id: 'rectangle', name: 'مستطيل متوسط', width: '300px', height: '250px', aspect: '300/250' },
    { id: 'square', name: 'مربع', width: '250px', height: '250px', aspect: '1/1' },
    { id: 'leaderboard', name: 'لوحة قيادة', width: '100%', height: '60px', aspect: '728/60' },
    { id: 'responsive', name: 'متجاوب', width: '100%', height: 'auto', aspect: 'auto' },
  ],

  // ====== إحصائيات ======
  getStats() {
    const ads = this.getAll();
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

    return `
    <div class="ad-container ${containerClass} relative overflow-hidden rounded-xl bg-white border border-gray-100 ${ad.linkUrl ? 'cursor-pointer' : ''}"
         onclick="${ad.linkUrl ? `Ads.recordClick('${ad.id}');window.open('${ad.linkUrl}','_blank')` : ''}"
         data-ad-id="${ad.id}">
      ${hasMultiple ? `
        <div id="${sliderId}" class="ad-slider relative" style="aspect-ratio:${ad.size === 'banner' ? '728/90' : ad.size === 'leaderboard' ? '728/60' : ad.size === 'square' ? '1/1' : ad.size === 'rectangle' ? '300/250' : '16/9'}">
          ${ad.images.map((img, i) => `
            <img src="${img}" alt="${ad.title || 'إعلان'}" loading="lazy"
                 class="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${i === 0 ? 'opacity-100' : 'opacity-0'}"
                 data-slide="${i}">
          `).join('')}
          <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            ${ad.images.map((_, i) => `<button onclick="event.stopPropagation();Ads.goToSlide('${sliderId}',${i})" class="w-2 h-2 rounded-full bg-white/60 hover:bg-white transition-colors" data-dot="${i}"></button>`).join('')}
          </div>
          <button onclick="event.stopPropagation();Ads.prevSlide('${sliderId}')" class="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50"><i data-lucide="chevron-left" class="w-4 h-4"></i></button>
          <button onclick="event.stopPropagation();Ads.nextSlide('${sliderId}')" class="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50"><i data-lucide="chevron-right" class="w-4 h-4"></i></button>
        </div>
      ` : `
        <img src="${ad.images[0]}" alt="${ad.title || 'إعلان'}" loading="lazy"
             class="w-full object-cover" style="aspect-ratio:${ad.size === 'banner' ? '728/90' : ad.size === 'leaderboard' ? '728/60' : ad.size === 'square' ? '1/1' : ad.size === 'rectangle' ? '300/250' : '16/9'}">
      `}
      ${ad.title ? `<div class="absolute top-2 right-2 bg-black/50 text-white text-[9px] px-2 py-0.5 rounded">إعلان</div>` : ''}
    </div>`;
  },

  // ====== السلايدر ======
  sliders: {},

  initSlider(sliderId, ad) {
    if (!ad.images || ad.images.length <= 1) return;
    this.sliders[sliderId] = {
      current: 0,
      total: ad.images.length,
      timer: null,
      duration: ad.sliderDuration || 4000
    };
    this.startAutoSlide(sliderId);
  },

  startAutoSlide(sliderId) {
    const slider = this.sliders[sliderId];
    if (!slider) return;
    clearInterval(slider.timer);
    slider.timer = setInterval(() => {
      this.nextSlide(sliderId);
    }, slider.duration);
  },

  goToSlide(sliderId, index) {
    const slider = this.sliders[sliderId];
    const container = document.getElementById(sliderId);
    if (!slider || !container) return;

    slider.current = index;
    const slides = container.querySelectorAll('[data-slide]');
    const dots = container.querySelectorAll('[data-dot]');

    slides.forEach((s, i) => {
      s.classList.toggle('opacity-100', i === index);
      s.classList.toggle('opacity-0', i !== index);
    });
    dots.forEach((d, i) => {
      d.classList.toggle('bg-white', i === index);
      d.classList.toggle('bg-white/60', i !== index);
    });

    this.startAutoSlide(sliderId);
  },

  nextSlide(sliderId) {
    const slider = this.sliders[sliderId];
    if (!slider) return;
    this.goToSlide(sliderId, (slider.current + 1) % slider.total);
  },

  prevSlide(sliderId) {
    const slider = this.sliders[sliderId];
    if (!slider) return;
    this.goToSlide(sliderId, (slider.current - 1 + slider.total) % slider.total);
  },

  // تهيئة جميع السلايدرات بعد الرندر
  initAllSliders() {
    const ads = this.getAll().filter(a => a.isActive && a.images && a.images.length > 1);
    ads.forEach(ad => {
      const sliderId = 'slider_' + ad.id;
      this.initSlider(sliderId, ad);
    });
  },

  // ====== عرض الإعلانات في المواضع ======
  renderPosition(position) {
    const ads = this.getActiveByPosition(position);
    if (!ads.length) return '';

    return ads.map(ad => {
      // تسجيل المشاهدة
      this.recordView(ad.id);
      return this.renderAd(ad);
    }).join('');
  }
};
