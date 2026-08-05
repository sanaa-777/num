// =============================================
// التطبيق الرئيسي - Main App
// =============================================

const App = {
  currentView: 'home',
  searchQuery: '',
  selectedCategory: null,
  selectedCity: null,

  init() {
    Auth.checkAuth();
    this.render();
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  },

  handleRoute() {
    const hash = location.hash.slice(1) || 'home';
    const [view, ...params] = hash.split('/');
    this.currentView = view;
    if (view === 'place' && params[0]) this.showPlace(params[0]);
    else if (view === 'category' && params[0]) this.showCategory(params[0]);
    else if (view === 'city' && params[0]) this.showCity(params[0]);
    else this.render();
  },

  // ====== RENDER MAIN ======
  render() {
    const app = document.getElementById('app');
    const user = Auth.currentUser;

    app.innerHTML = `
      ${this.renderHeader(user)}
      ${this.currentView === 'home' ? this.renderHome() : ''}
      ${this.currentView === 'search' ? this.renderSearch() : ''}
      ${this.currentView === 'add' ? this.renderAddPlace() : ''}
      ${this.currentView === 'favorites' ? this.renderFavorites() : ''}
      ${this.currentView === 'profile' ? this.renderProfile() : ''}
      ${this.currentView === 'myplaces' ? this.renderMyPlaces() : ''}
      ${this.currentView === 'login' ? this.renderLogin() : ''}
      ${this.currentView === 'signup' ? this.renderSignup() : ''}
      ${this.renderFooter()}
      ${this.renderModals()}
    `;
    this.attachEvents();
  },

  // ====== HEADER ======
  renderHeader(user) {
    return `
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="#home" class="flex items-center gap-3 no-underline">
          <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <span class="text-white font-bold text-xl">د</span>
          </div>
          <h1 class="text-xl font-bold text-gray-900 m-0 hidden sm:block">دليل اليمن</h1>
        </a>
        <div class="flex-1 max-w-md mx-4 hidden md:block">
          <div class="relative">
            <input type="text" id="headerSearch" placeholder="ابحث عن مكان أو خدمة..."
              class="w-full px-4 py-2 pr-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              value="${this.searchQuery}">
            <svg class="absolute right-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
        </div>
        <nav class="flex items-center gap-2">
          <a href="#home" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 no-underline">الرئيسية</a>
          <a href="#search" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 no-underline">بحث</a>
          ${user ? `
            <a href="#add" class="px-3 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 no-underline">+ إضافة</a>
            <a href="#myplaces" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 no-underline">مواقعي</a>
            <a href="#favorites" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 no-underline">♡</a>
            <div class="relative group">
              <button class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100">
                <img src="${user.avatar}" class="w-7 h-7 rounded-full" alt="">
                <span class="text-sm font-medium hidden lg:block">${user.name}</span>
              </button>
              <div class="absolute left-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-2 w-48 hidden group-hover:block">
                <a href="#profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 no-underline">الملف الشخصي</a>
                <a href="#myplaces" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 no-underline">مواقعي</a>
                <hr class="my-1 border-gray-100">
                <button onclick="Auth.logout()" class="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50">تسجيل الخروج</button>
              </div>
            </div>
          ` : `
            <a href="#login" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 no-underline">دخول</a>
            <a href="#signup" class="px-3 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 no-underline">حساب جديد</a>
          `}
        </nav>
      </div>
    </header>`;
  },

  // ====== HOME ======
  renderHome() {
    const stats = Data.getStats();
    const places = Data.getPlaces();
    const featured = places.filter(p => p.featured || p.verified).slice(0, 8);
    const latest = places.slice(0, 6);

    return `
    <!-- Hero -->
    <section class="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white py-16 relative overflow-hidden">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div class="absolute bottom-10 left-10 w-80 h-80 bg-yellow-500 rounded-full blur-3xl"></div>
      </div>
      <div class="max-w-7xl mx-auto px-4 text-center relative z-10">
        <h2 class="text-4xl md:text-5xl font-bold mb-4">🇾🇪 اكتشف اليمن</h2>
        <p class="text-lg text-blue-100 mb-8 max-w-xl mx-auto">الدليل الشامل للأعمال والأماكن في جميع أنحاء اليمن</p>
        <div class="max-w-xl mx-auto">
          <div class="flex bg-white rounded-2xl shadow-2xl overflow-hidden">
            <input type="text" id="heroSearch" placeholder="ابحث عن مكان، خدمة، أونشاط..." class="flex-1 px-6 py-4 text-gray-900 placeholder:text-gray-400 focus:outline-none text-base">
            <button onclick="App.doSearch()" class="bg-yellow-500 hover:bg-yellow-600 text-white px-6 font-semibold transition-colors">🔍 بحث</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="bg-white py-6 border-b">
      <div class="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div><div class="text-2xl font-bold text-blue-600">${stats.places.toLocaleString()}+</div><div class="text-sm text-gray-500">مكان مسجل</div></div>
        <div><div class="text-2xl font-bold text-blue-600">${stats.users.toLocaleString()}+</div><div class="text-sm text-gray-500">مستخدم</div></div>
        <div><div class="text-2xl font-bold text-blue-600">${stats.reviews.toLocaleString()}+</div><div class="text-sm text-gray-500">مراجعة</div></div>
        <div><div class="text-2xl font-bold text-blue-600">${stats.cities}</div><div class="text-sm text-gray-500">مدينة</div></div>
      </div>
    </section>

    <!-- Categories -->
    <section class="py-12">
      <div class="max-w-7xl mx-auto px-4">
        <h3 class="text-2xl font-bold text-gray-900 mb-6">📂 التصنيفات</h3>
        <div class="grid grid-cols-4 sm:grid-cols-8 gap-3">
          ${Data.categories.map(c => `
            <a href="#category/${c.id}" class="bg-white rounded-xl p-3 text-center hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border border-gray-100 no-underline">
              <div class="text-3xl mb-1">${c.icon}</div>
              <div class="text-xs font-medium text-gray-700">${c.name}</div>
            </a>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Featured -->
    <section class="bg-white py-12">
      <div class="max-w-7xl mx-auto px-4">
        <h3 class="text-2xl font-bold text-gray-900 mb-6">⭐ أماكن مميزة</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          ${featured.map(p => this.renderPlaceCard(p)).join('')}
        </div>
      </div>
    </section>

    <!-- Cities -->
    <section class="py-12">
      <div class="max-w-7xl mx-auto px-4">
        <h3 class="text-2xl font-bold text-gray-900 mb-6">🏙️ المدن</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          ${Data.cities.slice(0, 12).map(c => {
            const count = Data.getPlaces().filter(p => p.city === c.id).length;
            return `
            <a href="#city/${c.id}" class="bg-white rounded-xl p-4 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border border-gray-100 no-underline">
              <div class="text-lg font-bold text-gray-900">${c.name}</div>
              <div class="text-xs text-gray-500">${count} مكان</div>
            </a>`;
          }).join('')}
        </div>
      </div>
    </section>

    <!-- Latest -->
    <section class="bg-white py-12">
      <div class="max-w-7xl mx-auto px-4">
        <h3 class="text-2xl font-bold text-gray-900 mb-6">🆕 أحدث الأماكن</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          ${latest.map(p => this.renderPlaceCard(p)).join('')}
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="bg-gradient-to-r from-yellow-500 to-yellow-600 py-12">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <h3 class="text-2xl font-bold text-white mb-3">📍 أضف مكانك مجاناً</h3>
        <p class="text-yellow-100 mb-6">سجّل عملك في دليل اليمن واحصل على المزيد من العملاء</p>
        <a href="${Auth.currentUser ? '#add' : '#signup'}" class="bg-white text-yellow-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-xl inline-block no-underline">🚀 ابدأ الآن</a>
      </div>
    </section>`;
  },

  // ====== PLACE CARD ======
  renderPlaceCard(p) {
    const cat = Data.categories.find(c => c.id === p.category);
    const city = Data.cities.find(c => c.id === p.city);
    const isFav = Auth.currentUser && Data.isFavorite(Auth.currentUser.id, p.id);
    return `
    <div class="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer" onclick="location.hash='place/${p.id}'">
      <div class="h-36 bg-gradient-to-br from-blue-400 to-blue-600 relative flex items-center justify-center">
        <span class="text-6xl opacity-50">${cat ? cat.icon : '📍'}</span>
        ${p.verified ? '<div class="absolute top-2 right-2 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs">✓ موثّق</div>' : ''}
        ${p.featured ? '<div class="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-0.5 rounded-full text-xs">⭐ مميز</div>' : ''}
        ${Auth.currentUser ? `<button onclick="event.stopPropagation();App.toggleFav('${p.id}')" class="absolute bottom-2 left-2 text-2xl ${isFav ? 'text-red-500' : 'text-white'}">${isFav ? '❤️' : '♡'}</button>` : ''}
      </div>
      <div class="p-3">
        <h4 class="font-bold text-gray-900 text-sm mb-1 truncate">${p.name}</h4>
        <div class="text-xs text-gray-500 mb-2">${cat ? cat.icon + ' ' + cat.name : ''} • ${city ? '📍 ' + city.name : ''}</div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1">
            <span class="text-yellow-500 text-sm">⭐</span>
            <span class="font-bold text-sm text-gray-900">${p.rating || '0'}</span>
            <span class="text-xs text-gray-400">(${p.reviews || 0})</span>
          </div>
          <span class="text-xs text-gray-400">${p.views || 0} 👁️</span>
        </div>
      </div>
    </div>`;
  },

  // ====== SEARCH ======
  renderSearch() {
    const results = Data.search(this.searchQuery, this.selectedCategory, this.selectedCity);
    return `
    <section class="py-8">
      <div class="max-w-7xl mx-auto px-4">
        <div class="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
          <div class="flex flex-col md:flex-row gap-3">
            <input type="text" id="searchInput" value="${this.searchQuery}" placeholder="ابحث عن مكان أوخدمة..."
              class="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <select id="searchCat" class="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none">
              <option value="">جميع التصنيفات</option>
              ${Data.categories.map(c => `<option value="${c.id}" ${this.selectedCategory === c.id ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('')}
            </select>
            <select id="searchCity" class="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none">
              <option value="">جميع المدن</option>
              ${Data.cities.map(c => `<option value="${c.id}" ${this.selectedCity === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
            <button onclick="App.doSearch()" class="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700">🔍 بحث</button>
          </div>
        </div>
        <div class="mb-4 text-gray-500 text-sm">تم العثور على ${results.length} نتيجة</div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          ${results.length ? results.map(p => this.renderPlaceCard(p)).join('') : '<div class="col-span-4 text-center py-12 text-gray-400">لا توجد نتائج</div>'}
        </div>
      </div>
    </section>`;
  },

  // ====== PLACE DETAILS ======
  renderPlaceDetails(p) {
    const cat = Data.categories.find(c => c.id === p.category);
    const city = Data.cities.find(c => c.id === p.city);
    const reviews = Data.getReviews(p.id);
    const isFav = Auth.currentUser && Data.isFavorite(Auth.currentUser.id, p.id);
    const isOwner = Auth.currentUser && p.owner === Auth.currentUser.id;

    return `
    <section class="py-8">
      <div class="max-w-4xl mx-auto px-4">
        <a href="#home" class="text-blue-600 hover:underline mb-4 inline-block">← العودة</a>
        <div class="bg-white rounded-2xl overflow-hidden border border-gray-100">
          <div class="h-56 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center relative">
            <span class="text-8xl opacity-30">${cat ? cat.icon : '📍'}</span>
            ${p.verified ? '<div class="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">✓ موثّق</div>' : ''}
          </div>
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h2 class="text-2xl font-bold text-gray-900">${p.name}</h2>
                <div class="flex items-center gap-3 mt-2 text-sm text-gray-500">
                  ${cat ? `<span>${cat.icon} ${cat.name}</span>` : ''}
                  ${city ? `<span>📍 ${city.name}</span>` : ''}
                </div>
              </div>
              <div class="flex gap-2">
                ${Auth.currentUser ? `<button onclick="App.toggleFav('${p.id}')" class="text-2xl ${isFav ? 'text-red-500' : 'text-gray-400'}">${isFav ? '❤️' : '♡'}</button>` : ''}
                ${isOwner ? `<button onclick="App.deletePlaceConfirm('${p.id}')" class="text-red-500 hover:text-red-700">🗑️</button>` : ''}
              </div>
            </div>
            <div class="flex items-center gap-4 mb-4">
              <div class="flex items-center gap-1"><span class="text-yellow-500">⭐</span><span class="font-bold">${p.rating || '0'}</span><span class="text-gray-400 text-sm">(${p.reviews || 0} مراجعة)</span></div>
              <span class="text-gray-400 text-sm">${p.views || 0} مشاهدة</span>
            </div>
            ${p.description ? `<p class="text-gray-600 mb-6 leading-relaxed">${p.description}</p>` : ''}
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              ${p.phone ? `<a href="tel:${p.phone}" class="bg-green-500 text-white py-3 rounded-xl text-center font-semibold hover:bg-green-600 no-underline">📞 اتصال</a>` : ''}
              ${p.whatsapp ? `<a href="https://wa.me/967${p.whatsapp}" target="_blank" class="bg-green-600 text-white py-3 rounded-xl text-center font-semibold hover:bg-green-700 no-underline">💬 واتساب</a>` : ''}
              ${p.email ? `<a href="mailto:${p.email}" class="bg-blue-500 text-white py-3 rounded-xl text-center font-semibold hover:bg-blue-600 no-underline">📧 إيميل</a>` : ''}
              ${p.address ? `<button onclick="window.open('https://maps.google.com/?q=${encodeURIComponent(p.address)}','_blank')" class="bg-gray-100 text-gray-700 py-3 rounded-xl text-center font-semibold hover:bg-gray-200">📍 خريطة</button>` : ''}
            </div>
            ${p.address ? `<div class="bg-gray-50 rounded-xl p-4 mb-6"><strong>📍 العنوان:</strong> ${p.address}</div>` : ''}
          </div>
        </div>

        <!-- Reviews -->
        <div class="bg-white rounded-2xl p-6 mt-4 border border-gray-100">
          <h3 class="text-xl font-bold mb-4">⭐ المراجعات (${reviews.length})</h3>
          ${Auth.currentUser ? `
            <div class="bg-gray-50 rounded-xl p-4 mb-4">
              <div class="flex items-center gap-2 mb-3">
                <span class="text-sm font-medium">تقييمك:</span>
                <div id="ratingStars" class="flex gap-1">${[1,2,3,4,5].map(i => `<button onclick="App.setRating(${i})" class="text-2xl text-gray-300 hover:text-yellow-500" data-star="${i}">⭐</button>`).join('')}</div>
              </div>
              <textarea id="reviewComment" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20" rows="2" placeholder="اكتب مراجعتك..."></textarea>
              <button onclick="App.submitReview('${p.id}')" class="mt-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700">إرسال</button>
            </div>
          ` : '<p class="text-gray-400 text-sm mb-4"><a href="#login" class="text-blue-600">سجّل دخول</a> لكتابة مراجعة</p>'}
          ${reviews.length ? reviews.map(r => `
            <div class="border-b border-gray-100 py-3 last:border-0">
              <div class="flex items-center justify-between mb-1">
                <span class="font-semibold text-sm">${r.userName}</span>
                <span class="text-yellow-500 text-sm">${'⭐'.repeat(r.rating)}</span>
              </div>
              <p class="text-gray-600 text-sm">${r.comment}</p>
              <span class="text-xs text-gray-400">${new Date(r.createdAt).toLocaleDateString('ar')}</span>
            </div>
          `).join('') : '<p class="text-gray-400 text-center py-4">لا توجد مراجعات بعد</p>'}
        </div>
      </div>
    </section>`;
  },

  // ====== ADD PLACE ======
  renderAddPlace() {
    if (!Auth.currentUser) {
      return `<section class="py-16 text-center"><div class="max-w-md mx-auto"><h3 class="text-xl font-bold mb-4">سجّل دخول أولاً</h3><a href="#login" class="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold inline-block no-underline">تسجيل الدخول</a></div></section>`;
    }
    return `
    <section class="py-8">
      <div class="max-w-2xl mx-auto px-4">
        <h3 class="text-2xl font-bold text-gray-900 mb-6">📍 إضافة مكان جديد</h3>
        <div class="bg-white rounded-2xl p-6 border border-gray-100">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">اسم المكان *</label>
              <input type="text" id="placeName" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="مثال: مطعم البركة">
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">التصنيف *</label>
                <select id="placeCategory" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none">
                  <option value="">اختر التصنيف</option>
                  ${Data.categories.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">المدينة *</label>
                <select id="placeCity" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none">
                  <option value="">اختر المدينة</option>
                  ${Data.cities.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
              <textarea id="placeDesc" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20" rows="3" placeholder="وصف المكان والخدمات المقدمة..."></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
              <input type="text" id="placeAddress" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="الشارع، المدينة">
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                <input type="tel" id="placePhone" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="777123456">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">رقم واتساب</label>
                <input type="tel" id="placeWhatsapp" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="777123456">
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
              <input type="email" id="placeEmail" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="info@example.com">
            </div>
            <button onclick="App.submitPlace()" class="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">✅ إضافة المكان</button>
          </div>
        </div>
      </div>
    </section>`;
  },

  // ====== LOGIN ======
  renderLogin() {
    return `
    <section class="py-16">
      <div class="max-w-md mx-auto px-4">
        <div class="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <h3 class="text-2xl font-bold text-center mb-6">تسجيل الدخول</h3>
          <div id="loginError" class="hidden bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm"></div>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
              <input type="email" id="loginEmail" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="example@gmail.com">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
              <input type="password" id="loginPassword" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="••••••••">
            </div>
            <button onclick="App.doLogin()" class="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">دخول</button>
            <div class="relative my-4">
              <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-200"></div></div>
              <div class="relative flex justify-center"><span class="bg-white px-4 text-sm text-gray-400">أو</span></div>
            </div>
            <button onclick="App.doGoogleLogin()" class="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 flex items-center justify-center gap-2">
              <svg class="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              تسجيل بـ Google
            </button>
            <p class="text-center text-sm text-gray-500">ليس لديك حساب؟ <a href="#signup" class="text-blue-600 font-semibold">سجّل الآن</a></p>
          </div>
        </div>
      </div>
    </section>`;
  },

  // ====== SIGNUP ======
  renderSignup() {
    return `
    <section class="py-16">
      <div class="max-w-md mx-auto px-4">
        <div class="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <h3 class="text-2xl font-bold text-center mb-6">إنشاء حساب جديد</h3>
          <div id="signupError" class="hidden bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm"></div>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل *</label>
              <input type="text" id="signupName" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="محمد أحمد">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني *</label>
              <input type="email" id="signupEmail" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="example@gmail.com">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
              <input type="tel" id="signupPhone" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="777123456">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">كلمة المرور *</label>
              <input type="password" id="signupPassword" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="6 أحرف على الأقل">
            </div>
            <button onclick="App.doSignup()" class="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">إنشاء الحساب</button>
            <div class="relative my-4">
              <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-200"></div></div>
              <div class="relative flex justify-center"><span class="bg-white px-4 text-sm text-gray-400">أو</span></div>
            </div>
            <button onclick="App.doGoogleLogin()" class="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 flex items-center justify-center gap-2">
              <svg class="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              التسجيل بـ Google
            </button>
            <p class="text-center text-sm text-gray-500">لديك حساب بالفعل؟ <a href="#login" class="text-blue-600 font-semibold">سجّل دخول</a></p>
          </div>
        </div>
      </div>
    </section>`;
  },

  // ====== PROFILE ======
  renderProfile() {
    if (!Auth.currentUser) return this.renderLogin();
    const u = Auth.currentUser;
    return `
    <section class="py-8">
      <div class="max-w-2xl mx-auto px-4">
        <div class="bg-white rounded-2xl p-6 border border-gray-100">
          <div class="flex items-center gap-4 mb-6">
            <img src="${u.avatar}" class="w-16 h-16 rounded-full" alt="">
            <div>
              <h3 class="text-xl font-bold">${u.name}</h3>
              <p class="text-gray-500 text-sm">${u.email}</p>
              <span class="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">${u.role === 'admin' ? 'مشرف' : 'مستخدم'}</span>
            </div>
          </div>
          <div class="space-y-4">
            <div><label class="block text-sm font-medium text-gray-700 mb-1">الاسم</label><input type="text" id="profileName" value="${u.name}" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"></div>
            <div><label class="block text-sm font-medium text-gray-700 mb-1">الهاتف</label><input type="tel" id="profilePhone" value="${u.phone || ''}" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"></div>
            <button onclick="App.updateProfile()" class="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700">حفظ التعديلات</button>
          </div>
        </div>
      </div>
    </section>`;
  },

  // ====== MY PLACES ======
  renderMyPlaces() {
    if (!Auth.currentUser) return this.renderLogin();
    const myPlaces = Data.getPlaces().filter(p => p.owner === Auth.currentUser.id);
    return `
    <section class="py-8">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold">مواقعي (${myPlaces.length})</h3>
          <a href="#add" class="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 no-underline">+ إضافة مكان</a>
        </div>
        ${myPlaces.length ? `
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            ${myPlaces.map(p => this.renderPlaceCard(p)).join('')}
          </div>
        ` : '<div class="text-center py-12 text-gray-400">لم تضف أي مكان بعد<br><a href="#add" class="text-blue-600">أضف مكانك الأول</a></div>'}
      </div>
    </section>`;
  },

  // ====== FAVORITES ======
  renderFavorites() {
    if (!Auth.currentUser) return this.renderLogin();
    const favs = Data.getFavorites(Auth.currentUser.id);
    return `
    <section class="py-8">
      <div class="max-w-7xl mx-auto px-4">
        <h3 class="text-2xl font-bold mb-6">♡ المفضلة (${favs.length})</h3>
        ${favs.length ? `
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            ${favs.map(p => this.renderPlaceCard(p)).join('')}
          </div>
        ` : '<div class="text-center py-12 text-gray-400">لا توجد أماكن مفضلة</div>'}
      </div>
    </section>`;
  },

  // ====== CATEGORY VIEW ======
  showCategory(catId) {
    this.selectedCategory = catId;
    this.currentView = 'search';
    this.render();
  },

  showCity(cityId) {
    this.selectedCity = cityId;
    this.currentView = 'search';
    this.render();
  },

  showPlace(placeId) {
    const place = Data.getPlaces().find(p => p.id === placeId);
    if (!place) { location.hash = 'home'; return; }
    // Increment views
    place.views = (place.views || 0) + 1;
    localStorage.setItem('dy_places', JSON.stringify(Data.getPlaces()));
    const app = document.getElementById('app');
    app.innerHTML = this.renderHeader(Auth.currentUser) + this.renderPlaceDetails(place) + this.renderFooter();
    this.attachEvents();
  },

  // ====== FOOTER ======
  renderFooter() {
    return `
    <footer class="bg-gray-900 text-gray-300 py-8 mt-8">
      <div class="max-w-7xl mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div class="flex items-center gap-2 mb-3"><div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><span class="text-white font-bold">د</span></div><span class="text-white font-bold">دليل اليمن</span></div>
            <p class="text-sm text-gray-400">الدليل الشامل للأعمال والأماكن في اليمن</p>
          </div>
          <div>
            <h5 class="text-white font-semibold mb-3">روابط</h5>
            <ul class="space-y-1 text-sm"><li><a href="#home" class="hover:text-white no-underline text-gray-400">الرئيسية</a></li><li><a href="#search" class="hover:text-white no-underline text-gray-400">البحث</a></li><li><a href="#add" class="hover:text-white no-underline text-gray-400">أضف مكانك</a></li></ul>
          </div>
          <div>
            <h5 class="text-white font-semibold mb-3">تواصل</h5>
            <p class="text-sm text-gray-400">📧 info@yemendirectory.net</p>
          </div>
        </div>
        <div class="border-t border-gray-800 mt-6 pt-6 text-center text-sm text-gray-500">© 2024 دليل اليمن</div>
      </div>
    </footer>`;
  },

  // ====== MODALS ======
  renderModals() { return ''; },

  // ====== EVENTS ======
  attachEvents() {
    const heroSearch = document.getElementById('heroSearch');
    if (heroSearch) {
      heroSearch.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.doSearch(); });
    }
    const headerSearch = document.getElementById('headerSearch');
    if (headerSearch) {
      headerSearch.addEventListener('keypress', (e) => { if (e.key === 'Enter') { this.searchQuery = headerSearch.value; this.currentView = 'search'; this.render(); }});
    }
  },

  // ====== ACTIONS ======
  doSearch() {
    const input = document.getElementById('heroSearch') || document.getElementById('searchInput');
    this.searchQuery = input ? input.value : '';
    this.selectedCategory = document.getElementById('searchCat')?.value || null;
    this.selectedCity = document.getElementById('searchCity')?.value || null;
    this.currentView = 'search';
    this.render();
  },

  doLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errDiv = document.getElementById('loginError');
    try {
      Auth.login(email, password);
      errDiv.classList.add('hidden');
      location.hash = 'home';
      this.render();
    } catch (e) {
      errDiv.textContent = e.message;
      errDiv.classList.remove('hidden');
    }
  },

  doSignup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;
    const errDiv = document.getElementById('signupError');
    if (!name || !email || !password) {
      errDiv.textContent = 'يرجى ملء جميع الحقول المطلوبة';
      errDiv.classList.remove('hidden');
      return;
    }
    if (password.length < 6) {
      errDiv.textContent = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
      errDiv.classList.remove('hidden');
      return;
    }
    try {
      Auth.signup(name, email, password, phone);
      errDiv.classList.add('hidden');
      location.hash = 'home';
      this.render();
    } catch (e) {
      errDiv.textContent = e.message;
      errDiv.classList.remove('hidden');
    }
  },

  async doGoogleLogin() {
    try {
      await Auth.loginWithGoogle();
      location.hash = 'home';
      this.render();
    } catch (e) {
      alert(e.message);
    }
  },

  submitPlace() {
    const name = document.getElementById('placeName').value;
    const category = document.getElementById('placeCategory').value;
    const city = document.getElementById('placeCity').value;
    if (!name || !category || !city) {
      alert('يرجى ملء الحقول المطلوبة (الاسم، التصنيف، المدينة)');
      return;
    }
    const place = Data.addPlace({
      name,
      category,
      city,
      description: document.getElementById('placeDesc').value,
      address: document.getElementById('placeAddress').value,
      phone: document.getElementById('placePhone').value,
      whatsapp: document.getElementById('placeWhatsapp').value,
      email: document.getElementById('placeEmail').value,
      owner: Auth.currentUser.id,
      verified: false,
      featured: false,
      images: [Data.categories.find(c => c.id === category)?.icon || '📍']
    });
    alert('✅ تم إضافة المكان بنجاح!');
    location.hash = 'place/' + place.id;
  },

  toggleFav(placeId) {
    if (!Auth.currentUser) { location.hash = 'login'; return; }
    Data.toggleFavorite(Auth.currentUser.id, placeId);
    this.render();
  },

  setRating(stars) {
    document.querySelectorAll('#ratingStars button').forEach(btn => {
      const s = parseInt(btn.dataset.star);
      btn.className = s <= stars ? 'text-2xl text-yellow-500' : 'text-2xl text-gray-300';
    });
    this._selectedRating = stars;
  },

  submitReview(placeId) {
    if (!this._selectedRating) { alert('يرجى اختيار تقييم'); return; }
    const comment = document.getElementById('reviewComment').value;
    if (!comment) { alert('يرجىكتابة تعليق'); return; }
    Data.addReview(placeId, Auth.currentUser.id, Auth.currentUser.name, this._selectedRating, comment);
    this._selectedRating = 0;
    this.showPlace(placeId);
  },

  deletePlaceConfirm(id) {
    if (confirm('هل أنت متأكد من حذف هذا المكان؟')) {
      Data.deletePlace(id);
      alert('تم الحذف بنجاح');
      location.hash = 'myplaces';
    }
  },

  updateProfile() {
    const name = document.getElementById('profileName').value;
    const phone = document.getElementById('profilePhone').value;
    Auth.updateProfile({ name, phone });
    alert('تم تحديث الملف الشخصي');
    this.render();
  }
};

// Start
document.addEventListener('DOMContentLoaded', () => App.init());
