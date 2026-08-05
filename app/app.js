// =============================================
// التطبيق الرئيسي - Main App (مع أقسام فرعية)
// =============================================

const App = {
  currentView: 'home',
  searchQuery: '',
  selectedCategory: null,
  selectedSubCategory: null,
  selectedCity: null,
  _selectedRating: 0,

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
    else if (view === 'category' && params[0]) this.showCategoryPage(params[0]);
    else if (view === 'subcategory' && params[0]) this.showSubCategoryPage(params[0], params[1]);
    else if (view === 'city' && params[0]) { this.selectedCity = params[0]; this.currentView = 'search'; this.render(); }
    else this.render();
  },

  render() {
    const app = document.getElementById('app');
    const user = Auth.currentUser;
    app.innerHTML = `
      <div class="min-h-screen bg-gray-50">
        ${this.renderHeader(user)}
        <main>
          ${this.currentView === 'home' ? this.renderHome() : ''}
          ${this.currentView === 'search' ? this.renderSearch() : ''}
          ${this.currentView === 'add' ? this.renderAddPlace() : ''}
          ${this.currentView === 'favorites' ? this.renderFavorites() : ''}
          ${this.currentView === 'profile' ? this.renderProfile() : ''}
          ${this.currentView === 'myplaces' ? this.renderMyPlaces() : ''}
          ${this.currentView === 'login' ? this.renderLogin() : ''}
          ${this.currentView === 'signup' ? this.renderSignup() : ''}
          ${this.currentView === 'category' ? this.renderCategoryPage() : ''}
          ${this.currentView === 'subcategory' ? this.renderSubCategoryPage() : ''}
        </main>
        ${this.renderFooter()}
      </div>
    `;
    this.attachEvents();
  },

  // ====== HEADER (متجاوب للموبايل) ======
  renderHeader(user) {
    return `
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-3 py-2.5 flex items-center justify-between gap-2">
        <a href="#home" class="flex items-center gap-2 shrink-0">
          <div class="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center"><span class="text-white font-bold text-lg">د</span></div>
          <h1 class="text-lg font-bold text-gray-900 m-0 hidden sm:block">دليل اليمن</h1>
        </a>
        <div class="flex-1 max-w-sm mx-2 hidden md:block">
          <div class="relative">
            <input type="text" id="headerSearch" placeholder="ابحث..." class="w-full px-3 py-2 pr-9 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" value="${this.searchQuery}">
            <svg class="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
        </div>
        <nav class="flex items-center gap-1">
          <a href="#home" class="px-2 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100">الرئيسية</a>
          <a href="#search" class="px-2 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100">بحث</a>
          ${user ? `
            <a href="#add" class="px-2 py-1.5 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700">+ إضافة</a>
            <div class="relative group">
              <button class="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-gray-100">
                <img src="${user.avatar}" class="w-6 h-6 rounded-full" alt="">
                <span class="text-xs font-medium hidden lg:block max-w-[60px] truncate">${user.name}</span>
              </button>
              <div class="absolute left-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-2 w-44 hidden group-hover:block z-50">
                <a href="#profile" class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">الملف الشخصي</a>
                <a href="#myplaces" class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">مواقعي</a>
                <a href="#favorites" class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">المفضلة</a>
                <hr class="my-1 border-gray-100">
                <button onclick="Auth.logout()" class="w-full text-right px-3 py-2 text-sm text-red-600 hover:bg-red-50">تسجيل الخروج</button>
              </div>
            </div>
          ` : `
            <a href="#login" class="px-2 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100">دخول</a>
            <a href="#signup" class="px-2 py-1.5 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700">حساب جديد</a>
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
    <section class="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white py-12 md:py-16 relative overflow-hidden">
      <div class="absolute inset-0 opacity-10"><div class="absolute top-10 right-10 w-48 h-48 bg-white rounded-full blur-3xl"></div><div class="absolute bottom-10 left-10 w-64 h-64 bg-yellow-500 rounded-full blur-3xl"></div></div>
      <div class="max-w-7xl mx-auto px-4 text-center relative z-10">
        <h2 class="text-3xl md:text-5xl font-bold mb-3">🇾🇪 اكتشف اليمن</h2>
        <p class="text-base md:text-lg text-blue-100 mb-6 max-w-xl mx-auto">الدليل الشامل للأعمال والأماكن في جميع أنحاء اليمن</p>
        <div class="max-w-xl mx-auto">
          <div class="flex bg-white rounded-xl shadow-2xl overflow-hidden">
            <input type="text" id="heroSearch" placeholder="ابحث عن مكان، خدمة، أونشاط..." class="flex-1 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none text-sm md:text-base">
            <button onclick="App.doSearch()" class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 md:px-6 font-semibold transition-colors text-sm">🔍 بحث</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="bg-white py-4 border-b">
      <div class="max-w-7xl mx-auto px-4 grid grid-cols-4 gap-2 text-center">
        <div><div class="text-lg md:text-2xl font-bold text-blue-600">${stats.places}+</div><div class="text-[10px] md:text-xs text-gray-500">مكان</div></div>
        <div><div class="text-lg md:text-2xl font-bold text-blue-600">${stats.users}+</div><div class="text-[10px] md:text-xs text-gray-500">مستخدم</div></div>
        <div><div class="text-lg md:text-2xl font-bold text-blue-600">${stats.reviews}+</div><div class="text-[10px] md:text-xs text-gray-500">مراجعة</div></div>
        <div><div class="text-lg md:text-2xl font-bold text-blue-600">${stats.categories}</div><div class="text-[10px] md:text-xs text-gray-500">قسم</div></div>
      </div>
    </section>

    <!-- الأقسام الرئيسية (شبكة للموبايل) -->
    <section class="py-6 md:py-10">
      <div class="max-w-7xl mx-auto px-3">
        <h3 class="text-lg md:text-xl font-bold text-gray-900 mb-4">📂 الأقسام الرئيسية</h3>
        <div class="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-3">
          ${Data.categories.map(c => {
            const count = places.filter(p => p.category === c.id).length;
            return `
            <a href="#category/${c.id}" class="bg-white rounded-xl p-2 md:p-3 text-center hover:shadow-md transition-all cursor-pointer border border-gray-100 active:scale-95">
              <div class="text-2xl md:text-3xl mb-1">${c.icon}</div>
              <div class="text-[10px] md:text-xs font-medium text-gray-700 leading-tight">${c.name}</div>
              <div class="text-[9px] text-gray-400 mt-0.5">${count}</div>
            </a>`;
          }).join('')}
        </div>
      </div>
    </section>

    <!-- الأماكن المميزة -->
    <section class="bg-white py-6 md:py-10">
      <div class="max-w-7xl mx-auto px-3">
        <h3 class="text-lg md:text-xl font-bold text-gray-900 mb-4">⭐ أماكن مميزة</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          ${featured.map(p => this.renderPlaceCard(p)).join('')}
        </div>
      </div>
    </section>

    <!-- المدن -->
    <section class="py-6 md:py-10">
      <div class="max-w-7xl mx-auto px-3">
        <h3 class="text-lg md:text-xl font-bold text-gray-900 mb-4">🏙️ المدن</h3>
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2">
          ${Data.cities.map(c => {
            const count = places.filter(p => p.city === c.id).length;
            return `<a href="#city/${c.id}" class="bg-white rounded-lg p-2 md:p-3 text-center hover:shadow-md transition-all cursor-pointer border border-gray-100"><div class="text-sm font-bold text-gray-900">${c.name}</div><div class="text-[10px] text-gray-400">${count} مكان</div></a>`;
          }).join('')}
        </div>
      </div>
    </section>

    <!-- أحدث الأماكن -->
    <section class="bg-white py-6 md:py-10">
      <div class="max-w-7xl mx-auto px-3">
        <h3 class="text-lg md:text-xl font-bold text-gray-900 mb-4">🆕 أحدث الأماكن</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          ${latest.map(p => this.renderPlaceCard(p)).join('')}
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="bg-gradient-to-r from-yellow-500 to-yellow-600 py-8 md:py-12">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <h3 class="text-xl md:text-2xl font-bold text-white mb-2">📍 أضف مكانك مجاناً</h3>
        <p class="text-yellow-100 mb-4 text-sm">سجّل عملك في دليل اليمن واحصل على المزيد من العملاء</p>
        <a href="${Auth.currentUser ? '#add' : '#signup'}" class="bg-white text-yellow-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-xl inline-block text-sm">🚀 ابدأ الآن</a>
      </div>
    </section>`;
  },

  // ====== PLACE CARD ======
  renderPlaceCard(p) {
    const cat = Data.categories.find(c => c.id === p.category);
    const sub = p.subcategory ? Data.getSubCategory(p.subcategory) : null;
    const city = Data.cities.find(c => c.id === p.city);
    const isFav = Auth.currentUser && Data.isFavorite(Auth.currentUser.id, p.id);
    return `
    <div class="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all cursor-pointer active:scale-[0.98]" onclick="location.hash='place/${p.id}'">
      <div class="h-28 md:h-36 bg-gradient-to-br from-blue-400 to-blue-600 relative flex items-center justify-center">
        <span class="text-4xl md:text-5xl opacity-40">${cat ? cat.icon : '📍'}</span>
        ${p.verified ? '<div class="absolute top-1.5 right-1.5 bg-green-500 text-white px-1.5 py-0.5 rounded text-[9px] font-medium">✓ موثّق</div>' : ''}
        ${p.featured ? '<div class="absolute top-1.5 left-1.5 bg-yellow-500 text-white px-1.5 py-0.5 rounded text-[9px] font-medium">⭐</div>' : ''}
        ${Auth.currentUser ? `<button onclick="event.stopPropagation();App.toggleFav('${p.id}')" class="absolute bottom-1.5 left-1.5 text-lg ${isFav ? 'text-red-500' : 'text-white/80'}">${isFav ? '❤️' : '♡'}</button>` : ''}
      </div>
      <div class="p-2 md:p-3">
        <h4 class="font-bold text-gray-900 text-xs md:text-sm mb-0.5 truncate">${p.name}</h4>
        <div class="text-[10px] md:text-xs text-gray-500 truncate">${sub ? sub.icon + ' ' + sub.name : (cat ? cat.icon + ' ' + cat.name : '')} • ${city ? city.name : ''}</div>
        <div class="flex items-center justify-between mt-1.5">
          <div class="flex items-center gap-0.5"><span class="text-yellow-500 text-xs">⭐</span><span class="font-bold text-xs">${p.rating || '0'}</span><span class="text-[9px] text-gray-400">(${p.reviews || 0})</span></div>
          <span class="text-[9px] text-gray-400">${p.views || 0} 👁️</span>
        </div>
      </div>
    </div>`;
  },

  // ====== صفحة القسم الرئيسي (مع أقسام فرعية) ======
  renderCategoryPage() {
    const cat = Data.categories.find(c => c.id === this.selectedCategory);
    if (!cat) return '<div class="text-center py-12 text-gray-400">القسم غير موجود</div>';
    const places = Data.getPlaces().filter(p => p.category === cat.id);

    return `
    <section class="py-6 md:py-8">
      <div class="max-w-7xl mx-auto px-3">
        <a href="#home" class="text-blue-600 hover:underline mb-4 inline-block text-sm">← الرئيسية</a>
        <div class="flex items-center gap-3 mb-6">
          <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-3xl">${cat.icon}</div>
          <div>
            <h2 class="text-xl md:text-2xl font-bold text-gray-900">${cat.name}</h2>
            <p class="text-sm text-gray-500">${cat.subs.length} قسم فرعي • ${places.length} مكان</p>
          </div>
        </div>

        <!-- الأقسام الفرعية (شبكة للموبايل) -->
        <div class="bg-white rounded-xl p-3 md:p-4 mb-6 border border-gray-100">
          <h3 class="text-sm font-bold text-gray-700 mb-3">📋 الأقسام الفرعية</h3>
          <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            ${cat.subs.map(sub => {
              const subCount = places.filter(p => p.subcategory === sub.id).length;
              return `
              <a href="#subcategory/${cat.id}/${sub.id}" class="bg-gray-50 rounded-lg p-2 text-center hover:bg-blue-50 transition-colors cursor-pointer border border-gray-100 active:scale-95">
                <div class="text-xl mb-0.5">${sub.icon}</div>
                <div class="text-[10px] md:text-xs font-medium text-gray-700 leading-tight">${sub.name}</div>
                <div class="text-[9px] text-gray-400">${subCount}</div>
              </a>`;
            }).join('')}
          </div>
        </div>

        <!-- الأماكن في هذا القسم -->
        <h3 class="text-sm font-bold text-gray-700 mb-3">📍 جميع الأماكن (${places.length})</h3>
        ${places.length ? `
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            ${places.map(p => this.renderPlaceCard(p)).join('')}
          </div>
        ` : '<div class="text-center py-8 text-gray-400 bg-white rounded-xl border border-gray-100">لا توجد أماكن في هذا القسم بعد</div>'}
      </div>
    </section>`;
  },

  // ====== صفحة القسم الفرعي ======
  renderSubCategoryPage() {
    const subInfo = Data.getSubCategory(this.selectedSubCategory);
    if (!subInfo) return '<div class="text-center py-12 text-gray-400">القسم غير موجود</div>';
    const cat = subInfo.parent;
    const places = Data.getPlaces().filter(p => p.subcategory === this.selectedSubCategory);

    return `
    <section class="py-6 md:py-8">
      <div class="max-w-7xl mx-auto px-3">
        <div class="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <a href="#home" class="text-blue-600 hover:underline">الرئيسية</a>
          <span>←</span>
          <a href="#category/${cat.id}" class="text-blue-600 hover:underline">${cat.name}</a>
          <span>←</span>
          <span class="text-gray-700">${subInfo.name}</span>
        </div>
        <div class="flex items-center gap-3 mb-6">
          <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-3xl">${subInfo.icon}</div>
          <div>
            <h2 class="text-xl md:text-2xl font-bold text-gray-900">${subInfo.name}</h2>
            <p class="text-sm text-gray-500">${cat.icon} ${cat.name} • ${places.length} مكان</p>
          </div>
        </div>

        <!-- فلتر المدينة -->
        <div class="bg-white rounded-xl p-3 mb-4 border border-gray-100 flex flex-wrap gap-2">
          <button onclick="App.filterSubCatCity(null)" class="px-3 py-1.5 rounded-lg text-xs font-medium ${!this.selectedCity ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}">الكل</button>
          ${Data.cities.slice(0, 10).map(c => {
            const count = places.filter(p => p.city === c.id).length;
            if (count === 0) return '';
            return `<button onclick="App.filterSubCatCity('${c.id}')" class="px-3 py-1.5 rounded-lg text-xs font-medium ${this.selectedCity === c.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}">${c.name} (${count})</button>`;
          }).join('')}
        </div>

        ${places.length ? `
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            ${places.filter(p => !this.selectedCity || p.city === this.selectedCity).map(p => this.renderPlaceCard(p)).join('')}
          </div>
        ` : '<div class="text-center py-8 text-gray-400 bg-white rounded-xl border border-gray-100">لا توجد أماكن في هذا القسم</div>'}
      </div>
    </section>`;
  },

  filterSubCatCity(cityId) {
    this.selectedCity = cityId;
    this.render();
  },

  // ====== SEARCH ======
  renderSearch() {
    const results = Data.search(this.searchQuery, this.selectedCategory, this.selectedSubCategory, this.selectedCity);
    return `
    <section class="py-6 md:py-8">
      <div class="max-w-7xl mx-auto px-3">
        <div class="bg-white rounded-xl p-3 mb-4 shadow-sm border border-gray-100">
          <div class="flex flex-col gap-2">
            <input type="text" id="searchInput" value="${this.searchQuery}" placeholder="ابحث عن مكان أو خدمة..." class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm">
            <div class="flex gap-2">
              <select id="searchCat" class="flex-1 px-2 py-2 rounded-lg border border-gray-200 focus:outline-none text-xs">
                <option value="">جميع الأقسام</option>
                ${Data.categories.map(c => `<option value="${c.id}" ${this.selectedCategory === c.id ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('')}
              </select>
              <select id="searchCity" class="flex-1 px-2 py-2 rounded-lg border border-gray-200 focus:outline-none text-xs">
                <option value="">جميع المدن</option>
                ${Data.cities.map(c => `<option value="${c.id}" ${this.selectedCity === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
              </select>
              <button onclick="App.doSearch()" class="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-xs">🔍</button>
            </div>
          </div>
        </div>
        <div class="mb-3 text-gray-500 text-xs">تم العثور على ${results.length} نتيجة</div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          ${results.length ? results.map(p => this.renderPlaceCard(p)).join('') : '<div class="col-span-4 text-center py-12 text-gray-400">لا توجد نتائج</div>'}
        </div>
      </div>
    </section>`;
  },

  // ====== PLACE DETAILS ======
  showPlace(placeId) {
    const place = Data.getPlaces().find(p => p.id === placeId);
    if (!place) { location.hash = 'home'; return; }
    place.views = (place.views || 0) + 1;
    localStorage.setItem('dy_places', JSON.stringify(Data.getPlaces()));
    const cat = Data.categories.find(c => c.id === place.category);
    const sub = place.subcategory ? Data.getSubCategory(place.subcategory) : null;
    const city = Data.cities.find(c => c.id === place.city);
    const reviews = Data.getReviews(place.id);
    const isFav = Auth.currentUser && Data.isFavorite(Auth.currentUser.id, place.id);
    const isOwner = Auth.currentUser && place.owner === Auth.currentUser.id;

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="min-h-screen bg-gray-50">
        ${this.renderHeader(Auth.currentUser)}
        <section class="py-4 md:py-8">
          <div class="max-w-4xl mx-auto px-3">
            <div class="flex items-center gap-2 text-xs text-gray-500 mb-3">
              <a href="#home" class="text-blue-600 hover:underline">الرئيسية</a>
              ${cat ? `<span>←</span><a href="#category/${cat.id}" class="text-blue-600 hover:underline">${cat.name}</a>` : ''}
              ${sub ? `<span>←</span><a href="#subcategory/${cat.id}/${sub.id}" class="text-blue-600 hover:underline">${sub.name}</a>` : ''}
            </div>
            <div class="bg-white rounded-xl overflow-hidden border border-gray-100">
              <div class="h-40 md:h-56 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center relative">
                <span class="text-6xl md:text-8xl opacity-30">${cat ? cat.icon : '📍'}</span>
                ${place.verified ? '<div class="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">✓ موثّق</div>' : ''}
              </div>
              <div class="p-4 md:p-6">
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <h2 class="text-xl md:text-2xl font-bold text-gray-900">${place.name}</h2>
                    <div class="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-gray-500">
                      ${sub ? `<span class="bg-gray-100 px-2 py-0.5 rounded">${sub.icon} ${sub.name}</span>` : (cat ? `<span class="bg-gray-100 px-2 py-0.5 rounded">${cat.icon} ${cat.name}</span>` : '')}
                      ${city ? `<span>📍 ${city.name}</span>` : ''}
                    </div>
                  </div>
                  <div class="flex gap-2">
                    ${Auth.currentUser ? `<button onclick="App.toggleFav('${place.id}')" class="text-2xl ${isFav ? 'text-red-500' : 'text-gray-400'}">${isFav ? '❤️' : '♡'}</button>` : ''}
                    ${isOwner ? `<button onclick="App.deletePlaceConfirm('${place.id}')" class="text-red-500 hover:text-red-700 text-sm">🗑️</button>` : ''}
                  </div>
                </div>
                <div class="flex items-center gap-3 mb-3 text-sm">
                  <span class="text-yellow-500">⭐</span><span class="font-bold">${place.rating || '0'}</span><span class="text-gray-400 text-xs">(${place.reviews || 0})</span>
                  <span class="text-gray-400 text-xs">${place.views || 0} 👁️</span>
                </div>
                ${place.description ? `<p class="text-gray-600 mb-4 text-sm leading-relaxed">${place.description}</p>` : ''}
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  ${place.phone ? `<a href="tel:${place.phone}" class="bg-green-500 text-white py-2.5 rounded-lg text-center font-semibold hover:bg-green-600 text-xs">📞 اتصال</a>` : ''}
                  ${place.whatsapp ? `<a href="https://wa.me/967${place.whatsapp}" target="_blank" class="bg-green-600 text-white py-2.5 rounded-lg text-center font-semibold hover:bg-green-700 text-xs">💬 واتساب</a>` : ''}
                  ${place.email ? `<a href="mailto:${place.email}" class="bg-blue-500 text-white py-2.5 rounded-lg text-center font-semibold hover:bg-blue-600 text-xs">📧 إيميل</a>` : ''}
                  ${place.address ? `<button onclick="window.open('https://maps.google.com/?q=${encodeURIComponent(place.address)}','_blank')" class="bg-gray-100 text-gray-700 py-2.5 rounded-lg text-center font-semibold hover:bg-gray-200 text-xs">📍 خريطة</button>` : ''}
                </div>
                ${place.address ? `<div class="bg-gray-50 rounded-lg p-3 mb-4 text-sm"><strong>📍 العنوان:</strong> ${place.address}</div>` : ''}
              </div>
            </div>
            <!-- Reviews -->
            <div class="bg-white rounded-xl p-4 md:p-6 mt-3 border border-gray-100">
              <h3 class="text-lg font-bold mb-3">⭐ المراجعات (${reviews.length})</h3>
              ${Auth.currentUser ? `
                <div class="bg-gray-50 rounded-lg p-3 mb-3">
                  <div class="flex items-center gap-1 mb-2"><span class="text-xs font-medium">تقييمك:</span>
                    ${[1,2,3,4,5].map(i => `<button onclick="App.setRating(${i})" class="text-xl text-gray-300 hover:text-yellow-500" data-star="${i}">⭐</button>`).join('')}
                  </div>
                  <textarea id="reviewComment" class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none text-sm" rows="2" placeholder="اكتب مراجعتك..."></textarea>
                  <button onclick="App.submitReview('${place.id}')" class="mt-2 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700">إرسال</button>
                </div>
              ` : '<p class="text-gray-400 text-xs mb-3"><a href="#login" class="text-blue-600">سجّل دخول</a> لكتابة مراجعة</p>'}
              ${reviews.length ? reviews.map(r => `
                <div class="border-b border-gray-100 py-2 last:border-0">
                  <div class="flex items-center justify-between mb-0.5"><span class="font-semibold text-xs">${r.userName}</span><span class="text-yellow-500 text-xs">${'⭐'.repeat(r.rating)}</span></div>
                  <p class="text-gray-600 text-xs">${r.comment}</p>
                  <span class="text-[10px] text-gray-400">${new Date(r.createdAt).toLocaleDateString('ar')}</span>
                </div>
              `).join('') : '<p class="text-gray-400 text-center py-3 text-xs">لا توجد مراجعات</p>'}
            </div>
          </div>
        </section>
        ${this.renderFooter()}
      </div>
    `;
    this.attachEvents();
  },

  // ====== ADD PLACE (مع أقسام فرعية) ======
  renderAddPlace() {
    if (!Auth.currentUser) return `<section class="py-12 text-center"><div class="max-w-md mx-auto"><h3 class="text-lg font-bold mb-3">سجّل دخول أولاً</h3><a href="#login" class="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold inline-block text-sm">تسجيل الدخول</a></div></section>`;
    return `
    <section class="py-6 md:py-8">
      <div class="max-w-2xl mx-auto px-3">
        <h3 class="text-xl font-bold text-gray-900 mb-4">📍 إضافة مكان جديد</h3>
        <div class="bg-white rounded-xl p-4 md:p-6 border border-gray-100">
          <div class="space-y-3">
            <div><label class="block text-xs font-medium text-gray-700 mb-1">اسم المكان *</label><input type="text" id="placeName" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" placeholder="مثال: مطعم البركة"></div>
            <div class="grid grid-cols-2 gap-3">
              <div><label class="block text-xs font-medium text-gray-700 mb-1">القسم الرئيسي *</label><select id="placeCategory" onchange="App.updateSubCategories()" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-xs"><option value="">اختر القسم</option>${Data.categories.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('')}</select></div>
              <div><label class="block text-xs font-medium text-gray-700 mb-1">القسم الفرعي *</label><select id="placeSubCategory" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-xs"><option value="">اختر القسم الفرعي</option></select></div>
            </div>
            <div><label class="block text-xs font-medium text-gray-700 mb-1">المدينة *</label><select id="placeCity" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-xs"><option value="">اختر المدينة</option>${Data.cities.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select></div>
            <div><label class="block text-xs font-medium text-gray-700 mb-1">الوصف</label><textarea id="placeDesc" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm" rows="3" placeholder="وصف المكان..."></textarea></div>
            <div><label class="block text-xs font-medium text-gray-700 mb-1">العنوان</label><input type="text" id="placeAddress" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm" placeholder="الشارع، المدينة"></div>
            <div class="grid grid-cols-2 gap-3">
              <div><label class="block text-xs font-medium text-gray-700 mb-1">رقم الهاتف</label><input type="tel" id="placePhone" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm" placeholder="777123456"></div>
              <div><label class="block text-xs font-medium text-gray-700 mb-1">رقم واتساب</label><input type="tel" id="placeWhatsapp" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm" placeholder="777123456"></div>
            </div>
            <div><label class="block text-xs font-medium text-gray-700 mb-1">البريد الإلكتروني</label><input type="email" id="placeEmail" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm" placeholder="info@example.com"></div>
            <button onclick="App.submitPlace()" class="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors text-sm">✅ إضافة المكان</button>
          </div>
        </div>
      </div>
    </section>`;
  },

  updateSubCategories() {
    const catId = document.getElementById('placeCategory').value;
    const subSelect = document.getElementById('placeSubCategory');
    const cat = Data.categories.find(c => c.id === catId);
    subSelect.innerHTML = '<option value="">اختر القسم الفرعي</option>' + (cat ? cat.subs.map(s => `<option value="${s.id}">${s.icon} ${s.name}</option>`).join('') : '');
  },

  // ====== LOGIN ======
  renderLogin() {
    return `
    <section class="py-10 md:py-16">
      <div class="max-w-md mx-auto px-3">
        <div class="bg-white rounded-xl p-6 md:p-8 border border-gray-100 shadow-sm">
          <h3 class="text-xl font-bold text-center mb-5">تسجيل الدخول</h3>
          <div id="loginError" class="hidden bg-red-50 text-red-600 p-2.5 rounded-lg mb-3 text-xs"></div>
          <div class="space-y-3">
            <div><label class="block text-xs font-medium text-gray-700 mb-1">البريد الإلكتروني</label><input type="email" id="loginEmail" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" placeholder="example@gmail.com"></div>
            <div><label class="block text-xs font-medium text-gray-700 mb-1">كلمة المرور</label><input type="password" id="loginPassword" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" placeholder="••••••••"></div>
            <button onclick="App.doLogin()" class="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 text-sm">دخول</button>
            <div class="relative my-3"><div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-200"></div></div><div class="relative flex justify-center"><span class="bg-white px-3 text-xs text-gray-400">أو</span></div></div>
            <button onclick="App.doGoogleLogin()" class="w-full bg-white border-2 border-gray-200 text-gray-700 py-2.5 rounded-lg font-bold hover:bg-gray-50 flex items-center justify-center gap-2 text-sm">
              <svg class="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              تسجيل بـ Google
            </button>
            <p class="text-center text-xs text-gray-500">ليس لديك حساب؟ <a href="#signup" class="text-blue-600 font-semibold">سجّل الآن</a></p>
          </div>
        </div>
      </div>
    </section>`;
  },

  // ====== SIGNUP ======
  renderSignup() {
    return `
    <section class="py-10 md:py-16">
      <div class="max-w-md mx-auto px-3">
        <div class="bg-white rounded-xl p-6 md:p-8 border border-gray-100 shadow-sm">
          <h3 class="text-xl font-bold text-center mb-5">إنشاء حساب جديد</h3>
          <div id="signupError" class="hidden bg-red-50 text-red-600 p-2.5 rounded-lg mb-3 text-xs"></div>
          <div class="space-y-3">
            <div><label class="block text-xs font-medium text-gray-700 mb-1">الاسم الكامل *</label><input type="text" id="signupName" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm" placeholder="محمد أحمد"></div>
            <div><label class="block text-xs font-medium text-gray-700 mb-1">البريد الإلكتروني *</label><input type="email" id="signupEmail" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm" placeholder="example@gmail.com"></div>
            <div><label class="block text-xs font-medium text-gray-700 mb-1">رقم الهاتف</label><input type="tel" id="signupPhone" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm" placeholder="777123456"></div>
            <div><label class="block text-xs font-medium text-gray-700 mb-1">كلمة المرور *</label><input type="password" id="signupPassword" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm" placeholder="6 أحرف على الأقل"></div>
            <button onclick="App.doSignup()" class="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 text-sm">إنشاء الحساب</button>
            <div class="relative my-3"><div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-200"></div></div><div class="relative flex justify-center"><span class="bg-white px-3 text-xs text-gray-400">أو</span></div></div>
            <button onclick="App.doGoogleLogin()" class="w-full bg-white border-2 border-gray-200 text-gray-700 py-2.5 rounded-lg font-bold hover:bg-gray-50 flex items-center justify-center gap-2 text-sm">
              <svg class="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              التسجيل بـ Google
            </button>
            <p class="text-center text-xs text-gray-500">لديك حساب؟ <a href="#login" class="text-blue-600 font-semibold">سجّل دخول</a></p>
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
    <section class="py-6 md:py-8">
      <div class="max-w-2xl mx-auto px-3">
        <div class="bg-white rounded-xl p-4 md:p-6 border border-gray-100">
          <div class="flex items-center gap-3 mb-5">
            <img src="${u.avatar}" class="w-12 h-12 rounded-full" alt="">
            <div><h3 class="text-lg font-bold">${u.name}</h3><p class="text-gray-500 text-xs">${u.email}</p></div>
          </div>
          <div class="space-y-3">
            <div><label class="block text-xs font-medium text-gray-700 mb-1">الاسم</label><input type="text" id="profileName" value="${u.name}" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm"></div>
            <div><label class="block text-xs font-medium text-gray-700 mb-1">الهاتف</label><input type="tel" id="profilePhone" value="${u.phone || ''}" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm"></div>
            <button onclick="App.updateProfile()" class="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 text-sm">حفظ التعديلات</button>
          </div>
        </div>
      </div>
    </section>`;
  },

  renderMyPlaces() {
    if (!Auth.currentUser) return this.renderLogin();
    const myPlaces = Data.getPlaces().filter(p => p.owner === Auth.currentUser.id);
    return `
    <section class="py-6 md:py-8">
      <div class="max-w-7xl mx-auto px-3">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold">مواقعي (${myPlaces.length})</h3>
          <a href="#add" class="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold text-xs">+ إضافة</a>
        </div>
        ${myPlaces.length ? `<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">${myPlaces.map(p => this.renderPlaceCard(p)).join('')}</div>` : '<div class="text-center py-8 text-gray-400 text-sm">لم تضف أي مكان بعد<br><a href="#add" class="text-blue-600">أضف مكانك الأول</a></div>'}
      </div>
    </section>`;
  },

  renderFavorites() {
    if (!Auth.currentUser) return this.renderLogin();
    const favs = Data.getFavorites(Auth.currentUser.id);
    return `
    <section class="py-6 md:py-8">
      <div class="max-w-7xl mx-auto px-3">
        <h3 class="text-lg font-bold mb-4">♡ المفضلة (${favs.length})</h3>
        ${favs.length ? `<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">${favs.map(p => this.renderPlaceCard(p)).join('')}</div>` : '<div class="text-center py-8 text-gray-400 text-sm">لا توجد أماكن مفضلة</div>'}
      </div>
    </section>`;
  },

  showCategoryPage(catId) {
    this.selectedCategory = catId;
    this.selectedCity = null;
    this.currentView = 'category';
    this.render();
  },

  showSubCategoryPage(catId, subId) {
    this.selectedCategory = catId;
    this.selectedSubCategory = subId;
    this.selectedCity = null;
    this.currentView = 'subcategory';
    this.render();
  },

  renderFooter() {
    return `
    <footer class="bg-gray-900 text-gray-300 py-6 mt-8">
      <div class="max-w-7xl mx-auto px-3">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div><div class="flex items-center gap-2 mb-2"><div class="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center"><span class="text-white font-bold text-sm">د</span></div><span class="text-white font-bold text-sm">دليل اليمن</span></div><p class="text-xs text-gray-400">الدليل الشامل للأعمال والأماكن في اليمن</p></div>
          <div><h5 class="text-white font-semibold mb-2 text-sm">روابط</h5><ul class="space-y-1 text-xs"><li><a href="#home" class="hover:text-white text-gray-400">الرئيسية</a></li><li><a href="#search" class="hover:text-white text-gray-400">البحث</a></li><li><a href="#add" class="hover:text-white text-gray-400">أضف مكانك</a></li></ul></div>
          <div><h5 class="text-white font-semibold mb-2 text-sm">تواصل</h5><p class="text-xs text-gray-400">📧 info@yemendirectory.net</p></div>
        </div>
        <div class="border-t border-gray-800 mt-4 pt-4 text-center text-xs text-gray-500">© 2024 دليل اليمن</div>
      </div>
    </footer>`;
  },

  attachEvents() {
    const heroSearch = document.getElementById('heroSearch');
    if (heroSearch) heroSearch.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.doSearch(); });
    const headerSearch = document.getElementById('headerSearch');
    if (headerSearch) headerSearch.addEventListener('keypress', (e) => { if (e.key === 'Enter') { this.searchQuery = headerSearch.value; this.currentView = 'search'; this.render(); }});
  },

  // ====== ACTIONS ======
  doSearch() {
    const input = document.getElementById('heroSearch') || document.getElementById('searchInput');
    this.searchQuery = input ? input.value : '';
    this.selectedCategory = document.getElementById('searchCat')?.value || null;
    this.selectedCity = document.getElementById('searchCity')?.value || null;
    this.selectedSubCategory = null;
    this.currentView = 'search';
    this.render();
  },

  doLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errDiv = document.getElementById('loginError');
    try { Auth.login(email, password); errDiv.classList.add('hidden'); location.hash = 'home'; this.render(); }
    catch (e) { errDiv.textContent = e.message; errDiv.classList.remove('hidden'); }
  },

  doSignup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;
    const errDiv = document.getElementById('signupError');
    if (!name || !email || !password) { errDiv.textContent = 'يرجى ملء الحقول المطلوبة'; errDiv.classList.remove('hidden'); return; }
    if (password.length < 6) { errDiv.textContent = 'كلمة المرور 6 أحرف على الأقل'; errDiv.classList.remove('hidden'); return; }
    try { Auth.signup(name, email, password, phone); errDiv.classList.add('hidden'); location.hash = 'home'; this.render(); }
    catch (e) { errDiv.textContent = e.message; errDiv.classList.remove('hidden'); }
  },

  async doGoogleLogin() {
    try { await Auth.loginWithGoogle(); location.hash = 'home'; this.render(); } catch (e) { alert(e.message); }
  },

  submitPlace() {
    const name = document.getElementById('placeName').value;
    const category = document.getElementById('placeCategory').value;
    const subcategory = document.getElementById('placeSubCategory').value;
    const city = document.getElementById('placeCity').value;
    if (!name || !category || !city) { alert('يرجى ملء الحقول المطلوبة'); return; }
    const cat = Data.categories.find(c => c.id === category);
    Data.addPlace({
      name, category, subcategory: subcategory || null, city,
      description: document.getElementById('placeDesc').value,
      address: document.getElementById('placeAddress').value,
      phone: document.getElementById('placePhone').value,
      whatsapp: document.getElementById('placeWhatsapp').value,
      email: document.getElementById('placeEmail').value,
      owner: Auth.currentUser.id, verified: false, featured: false,
      images: [cat ? cat.icon : '📍']
    });
    alert('✅ تم إضافة المكان بنجاح!');
    location.hash = 'myplaces';
  },

  toggleFav(placeId) {
    if (!Auth.currentUser) { location.hash = 'login'; return; }
    Data.toggleFavorite(Auth.currentUser.id, placeId);
    this.render();
  },

  setRating(stars) {
    document.querySelectorAll('#ratingStars button, [data-star]').forEach(btn => {
      const s = parseInt(btn.dataset.star);
      btn.className = s <= stars ? 'text-xl text-yellow-500' : 'text-xl text-gray-300';
    });
    this._selectedRating = stars;
  },

  submitReview(placeId) {
    if (!this._selectedRating) { alert('يرجى اختيار تقييم'); return; }
    const comment = document.getElementById('reviewComment').value;
    if (!comment) { alert('يرجى كتابة تعليق'); return; }
    Data.addReview(placeId, Auth.currentUser.id, Auth.currentUser.name, this._selectedRating, comment);
    this._selectedRating = 0;
    this.showPlace(placeId);
  },

  deletePlaceConfirm(id) {
    if (confirm('هل أنت متأكد من حذف هذا المكان؟')) { Data.deletePlace(id); alert('تم الحذف'); location.hash = 'myplaces'; }
  },

  updateProfile() {
    Auth.updateProfile({ name: document.getElementById('profileName').value, phone: document.getElementById('profilePhone').value });
    alert('تم تحديث الملف الشخصي'); this.render();
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
