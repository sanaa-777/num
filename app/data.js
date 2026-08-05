// =============================================
// البيانات - Data Store
// =============================================

const Data = {
  // التصنيفات
  categories: [
    { id: 'cat_1', name: 'مطاعم', icon: '🍽️', color: '#ef4444' },
    { id: 'cat_2', name: 'فنادق', icon: '🏨', color: '#8b5cf6' },
    { id: 'cat_3', name: 'عيادات', icon: '🏥', color: '#10b981' },
    { id: 'cat_4', name: 'صيدليات', icon: '💊', color: '#f59e0b' },
    { id: 'cat_5', name: 'متاجر', icon: '🛍️', color: '#3b82f6' },
    { id: 'cat_6', name: 'خدمات', icon: '🔧', color: '#6366f1' },
    { id: 'cat_7', name: 'تعليم', icon: '📚', color: '#ec4899' },
    { id: 'cat_8', name: 'ترفيه', icon: '🎮', color: '#14b8a6' },
    { id: 'cat_9', name: 'سيارات', icon: '🚗', color: '#f97316' },
    { id: 'cat_10', name: 'عقارات', icon: '🏠', color: '#06b6d4' },
    { id: 'cat_11', name: 'أطعمة', icon: '🥘', color: '#84cc16' },
    { id: 'cat_12', name: 'ملابس', icon: '👗', color: '#a855f7' },
    { id: 'cat_13', name: 'إلكترونيات', icon: '📱', color: '#0ea5e9' },
    { id: 'cat_14', name: 'יופי', icon: '💇', color: '#e11d48' },
    { id: 'cat_15', name: 'رياضة', icon: '⚽', color: '#22c55e' },
    { id: 'cat_16', name: 'قانونية', icon: '⚖️', color: '#78716c' },
  ],

  // المدن
  cities: [
    { id: 'city_1', name: 'صنعاء', region: 'اليمن' },
    { id: 'city_2', name: 'عدن', region: 'اليمن' },
    { id: 'city_3', name: 'تعز', region: 'اليمن' },
    { id: 'city_4', name: 'الحديدة', region: 'اليمن' },
    { id: 'city_5', name: 'إب', region: 'اليمن' },
    { id: 'city_6', name: 'حضرموت', region: 'اليمن' },
    { id: 'city_7', name: 'مأرب', region: 'اليمن' },
    { id: 'city_8', name: 'لحج', region: 'اليمن' },
    { id: 'city_9', name: 'الضالع', region: 'اليمن' },
    { id: 'city_10', name: 'شبوة', region: 'اليمن' },
    { id: 'city_11', name: 'المهرة', region: 'اليمن' },
    { id: 'city_12', name: 'حجة', region: 'اليمن' },
    { id: 'city_13', name: 'عمران', region: 'اليمن' },
    { id: 'city_14', name: 'صعدة', region: 'اليمن' },
    { id: 'city_15', name: 'الجوف', region: 'اليمن' },
    { id: 'city_16', name: 'ذمار', region: 'اليمن' },
    { id: 'city_17', name: 'البيضاء', region: 'اليمن' },
    { id: 'city_18', name: 'أبين', region: 'اليمن' },
    { id: 'city_19', name: 'المحويت', region: 'اليمن' },
    { id: 'city_20', name: 'سقطرى', region: 'اليمن' },
    { id: 'city_21', name: 'ريمة', region: 'اليمن' },
    { id: 'city_22', name: 'عمران', region: 'اليمن' },
  ],

  // الأماكن الافتراضية
  defaultPlaces: [
    {
      id: 'p_1', name: 'مطعم البركة', category: 'cat_1', city: 'city_1',
      description: 'مطعم يمني تقليدي يقدم أشهى المأكولات اليمنية الأصيلة. مندي، مظبي، حنيذ، م Saltah وغيرها.',
      phone: '777123456', whatsapp: '777123456', email: 'info@albaraka.com',
      address: 'شارع الزبيري، صنعاء', rating: 4.8, reviews: 234, views: 5600,
      verified: true, featured: true, images: ['🍽️'],
      owner: 'system', createdAt: '2024-01-15'
    },
    {
      id: 'p_2', name: 'فندق القصر', category: 'cat_2', city: 'city_2',
      description: 'فندق فاخر 4 نجوم في قلب عدن. إطلالة بحرية خلابة، غرف مجهزة بالكامل، مطعم عالمي.',
      phone: '777234567', whatsapp: '777234567', email: 'info@alqasr-hotel.com',
      address: 'كريتر، عدن', rating: 4.6, reviews: 189, views: 4200,
      verified: true, featured: true, images: ['🏨'],
      owner: 'system', createdAt: '2024-02-20'
    },
    {
      id: 'p_3', name: 'عيادة الشفاء الطبية', category: 'cat_3', city: 'city_3',
      description: 'عيادة متعددة التخصصات. طب عام، أسنان، جلدية، أطفال. أحدث الأجهزة والتقنيات.',
      phone: '777345678', whatsapp: '777345678', email: 'info@alshifa.com',
      address: 'شارع جمال، تعز', rating: 4.9, reviews: 312, views: 7800,
      verified: true, featured: true, images: ['🏥'],
      owner: 'system', createdAt: '2024-03-10'
    },
    {
      id: 'p_4', name: 'صيدلية الحياة', category: 'cat_4', city: 'city_1',
      description: 'صيدلية شاملة تعمل 24 ساعة. أدوية، مستحضرات تجميل، مكملات غذائية.',
      phone: '777456789', whatsapp: '777456789',
      address: 'شارع الستين، صنعاء', rating: 4.7, reviews: 156, views: 3200,
      verified: true, featured: false, images: ['💊'],
      owner: 'system', createdAt: '2024-04-05'
    },
    {
      id: 'p_5', name: 'مجمع التسوق الحديث', category: 'cat_5', city: 'city_1',
      description: 'أكبر مجمع تجاري في صنعاء. ماركات عالمية، مطاعم، ألعاب أطفال، سينما.',
      phone: '777567890', whatsapp: '777567890', email: 'info@modern-mall.com',
      address: 'شارع الربات، صنعاء', rating: 4.5, reviews: 420, views: 12000,
      verified: true, featured: true, images: ['🛍️'],
      owner: 'system', createdAt: '2024-05-15'
    },
    {
      id: 'p_6', name: 'مطعم اليمان', category: 'cat_1', city: 'city_2',
      description: 'مطعم بحري مميز في عدن. أسماك طازة، مندي، مظبي.',
      phone: '777678901', whatsapp: '777678901',
      address: 'العاصمة عدن', rating: 4.4, reviews: 98, views: 2100,
      verified: false, featured: false, images: ['🐟'],
      owner: 'system', createdAt: '2024-06-01'
    },
    {
      id: 'p_7', name: 'مكتبة المعرفة', category: 'cat_7', city: 'city_1',
      description: 'مكتبة شاملة. كتب، قرطاسية، طباعة، توصيل. خصومات للطلاب.',
      phone: '777789012', whatsapp: '777789012',
      address: 'شارع الستين، صنعاء', rating: 4.3, reviews: 67, views: 1500,
      verified: false, featured: false, images: ['📚'],
      owner: 'system', createdAt: '2024-06-20'
    },
    {
      id: 'p_8', name: 'نادي اللياقة', category: 'cat_15', city: 'city_1',
      description: 'صالة رياضية متكاملة. أجهزة حديثة، مدربين محترفين، حمام سباحة.',
      phone: '777890123', whatsapp: '777890123',
      address: 'شارع حدة، صنعاء', rating: 4.6, reviews: 145, views: 3800,
      verified: true, featured: false, images: ['🏋️'],
      owner: 'system', createdAt: '2024-07-10'
    },
  ],

  // الأماكن (مستخدمين + افتراضية)
  getPlaces() {
    const userPlaces = JSON.parse(localStorage.getItem('dy_places') || 'null');
    if (userPlaces) return userPlaces;
    localStorage.setItem('dy_places', JSON.stringify(this.defaultPlaces));
    return this.defaultPlaces;
  },

  // إضافة مكان
  addPlace(place) {
    const places = this.getPlaces();
    place.id = 'p_' + Date.now();
    place.createdAt = new Date().toISOString();
    place.views = 0;
    place.reviews = 0;
    place.rating = 0;
    places.unshift(place);
    localStorage.setItem('dy_places', JSON.stringify(places));
    return place;
  },

  // حذف مكان
  deletePlace(id) {
    let places = this.getPlaces();
    places = places.filter(p => p.id !== id);
    localStorage.setItem('dy_places', JSON.stringify(places));
  },

  // البحث
  search(query, categoryId, cityId) {
    let places = this.getPlaces();
    if (query) {
      const q = query.toLowerCase();
      places = places.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.address && p.address.toLowerCase().includes(q))
      );
    }
    if (categoryId) places = places.filter(p => p.category === categoryId);
    if (cityId) places = places.filter(p => p.city === cityId);
    return places;
  },

  // المفضلة
  toggleFavorite(userId, placeId) {
    const favs = JSON.parse(localStorage.getItem('dy_favorites') || '{}');
    if (!favs[userId]) favs[userId] = [];
    const idx = favs[userId].indexOf(placeId);
    if (idx === -1) {
      favs[userId].push(placeId);
    } else {
      favs[userId].splice(idx, 1);
    }
    localStorage.setItem('dy_favorites', JSON.stringify(favs));
    return favs[userId].includes(placeId);
  },

  isFavorite(userId, placeId) {
    const favs = JSON.parse(localStorage.getItem('dy_favorites') || '{}');
    return favs[userId] ? favs[userId].includes(placeId) : false;
  },

  getFavorites(userId) {
    const favs = JSON.parse(localStorage.getItem('dy_favorites') || '{}');
    const favIds = favs[userId] || [];
    const places = this.getPlaces();
    return places.filter(p => favIds.includes(p.id));
  },

  // المراجعات
  addReview(placeId, userId, userName, rating, comment) {
    const reviews = JSON.parse(localStorage.getItem('dy_reviews') || '[]');
    reviews.push({
      id: 'rev_' + Date.now(),
      placeId, userId, userName, rating, comment,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('dy_reviews', JSON.stringify(reviews));

    // Update place rating
    const places = this.getPlaces();
    const place = places.find(p => p.id === placeId);
    if (place) {
      const placeReviews = reviews.filter(r => r.placeId === placeId);
      place.rating = (placeReviews.reduce((a, r) => a + r.rating, 0) / placeReviews.length).toFixed(1);
      place.reviews = placeReviews.length;
      localStorage.setItem('dy_places', JSON.stringify(places));
    }
  },

  getReviews(placeId) {
    const reviews = JSON.parse(localStorage.getItem('dy_reviews') || '[]');
    return reviews.filter(r => r.placeId === placeId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // إحصائيات
  getStats() {
    const places = this.getPlaces();
    const users = JSON.parse(localStorage.getItem('dy_users') || '[]');
    const reviews = JSON.parse(localStorage.getItem('dy_reviews') || '[]');
    return {
      places: places.length,
      users: users.length,
      reviews: reviews.length,
      cities: this.cities.length
    };
  }
};
