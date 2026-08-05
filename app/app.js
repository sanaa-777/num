// =============================================
// التطبيق الرئيسي - Main App (أيقونات Lucide احترافية)
// =============================================

const App = {
  currentView: 'home', searchQuery: '', selectedCategory: null, selectedSubCategory: null, selectedCity: null, _selectedRating: 0,

  init() {
    Auth.checkAuth();
    Admin.initDefaultAdmin();
    this.render();
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();

    // إخفاء الاقتراحات عند النقر خارجها
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#heroSearch') && !e.target.closest('#headerSearch') && !e.target.closest('#searchSuggestions') && !e.target.closest('#headerSearchSuggestions')) {
        this.hideSuggestions();
      }
    });

    // اختصارات لوحة المفاتيح
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.hideSuggestions();
      if (e.key === 'Enter') {
        const active = document.activeElement;
        if (active && (active.id === 'heroSearch' || active.id === 'headerSearch')) {
          this.doSearch();
        }
      }
    });
  },

  handleRoute() {
    const hash = location.hash.slice(1) || 'home';
    const [view, ...params] = hash.split('/');
    this.currentView = view;
    if (view === 'place' && params[0]) this.showPlace(params[0]);
    else if (view === 'category' && params[0]) { this.selectedCategory = params[0]; this.selectedCity = null; this.currentView = 'category'; this.render(); }
    else if (view === 'subcategory' && params[0]) { this.selectedCategory = params[0]; this.selectedSubCategory = params[1]; this.selectedCity = null; this.currentView = 'subcategory'; this.render(); }
    else if (view === 'city' && params[0]) { this.selectedCity = params[0]; this.currentView = 'search'; this.render(); }
    else if (view === 'admin') { this.currentView = 'admin'; this.render(); }
    else this.render();
  },

  render() {
    const app = document.getElementById('app');
    const user = Auth.currentUser;
    app.innerHTML = `<div class="min-h-screen bg-gray-50">${this.renderHeader(user)}${Ads.renderPosition('header')}<main>${this['render_' + this.currentView]?.() || ''}</main>${this.renderFooter()}</div>`;
    this.initIcons();
    Ads.initAllSliders();
  },

  initIcons() { try { lucide.createIcons(); } catch(e) {} },

  // ====== HEADER ======
  renderHeader(user) {
    return `
    <header class="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-3 py-2.5 flex items-center justify-between gap-2">
        <a href="#home" class="flex items-center gap-2 shrink-0">
          <div class="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center"><span class="text-white font-bold text-lg">د</span></div>
          <h1 class="text-lg font-bold text-gray-900 m-0 hidden sm:block">دليل اليمن</h1>
        </a>
        <div class="flex-1 max-w-sm mx-2 hidden md:block">
          <div class="relative">
            <input type="text" id="headerSearch" placeholder="ابحث..." class="w-full px-3 py-2 pr-9 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" value="${this.searchQuery}" oninput="App.onSearchInput(this.value)" autocomplete="off">
            <i data-lucide="search" class="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400"></i>
            <div id="headerSearchSuggestions" class="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 hidden"></div>
          </div>
        </div>
        <nav class="flex items-center gap-1">
          <a href="#home" class="px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 flex items-center gap-1"><i data-lucide="home" class="w-3.5 h-3.5"></i><span class="hidden lg:inline">الرئيسية</span></a>
          <a href="#search" class="px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 flex items-center gap-1"><i data-lucide="search" class="w-3.5 h-3.5"></i><span class="hidden lg:inline">بحث</span></a>
          ${user ? `
            <a href="#add" class="px-2.5 py-1.5 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-1"><i data-lucide="plus" class="w-3.5 h-3.5"></i><span class="hidden lg:inline">إضافة</span></a>
            <div class="relative group">
              <button class="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-gray-100">
                <img src="${user.avatar}" class="w-6 h-6 rounded-full" alt="">
                <i data-lucide="chevron-down" class="w-3 h-3 text-gray-400"></i>
              </button>
              <div class="absolute left-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-2 w-48 hidden group-hover:block z-50">
                ${user.verified ? '<div class="flex items-center gap-1.5 px-3 py-1 text-xs text-green-600 bg-green-50"><i data-lucide="badge-check" class="w-3.5 h-3.5"></i>حساب موثّق</div>' : '<div class="flex items-center gap-1.5 px-3 py-1 text-xs text-gray-500 bg-gray-50"><i data-lucide="clock" class="w-3.5 h-3.5"></i>بانتظار التوثيق</div>'}
                <hr class="my-1 border-gray-100">
                <a href="#profile" class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><i data-lucide="user" class="w-4 h-4"></i>الملف الشخصي</a>
                <a href="#myplaces" class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><i data-lucide="building-2" class="w-4 h-4"></i>مواقعي</a>
                <a href="#favorites" class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><i data-lucide="heart" class="w-4 h-4"></i>المفضلة</a>
                ${Admin.isAdmin() ? `<a href="#admin" class="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"><i data-lucide="shield" class="w-4 h-4"></i>لوحة التحكم ${Admin.getUnreadCount() > 0 ? `<span class="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full mr-auto">${Admin.getUnreadCount()}</span>` : ''}</a>` : ''}
                <hr class="my-1 border-gray-100">
                <button onclick="Auth.logout()" class="w-full flex items-center gap-2 text-right px-3 py-2 text-sm text-red-600 hover:bg-red-50"><i data-lucide="log-out" class="w-4 h-4"></i>تسجيل الخروج</button>
              </div>
            </div>
          ` : `
            <a href="#login" class="px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 flex items-center gap-1"><i data-lucide="log-in" class="w-3.5 h-3.5"></i>دخول</a>
            <a href="#signup" class="px-2.5 py-1.5 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700">حساب جديد</a>
          `}
        </nav>
      </div>
    </header>`;
  },

  // ====== HOME ======
  render_home() {
    const stats = Data.getStats();
    const places = Data.getPlaces();
    const featured = places.filter(p => p.featured || p.verified).slice(0, 8);
    const latest = places.slice(0, 8);

    return `
    <section class="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white py-10 md:py-14 relative overflow-hidden">
      <div class="absolute inset-0 opacity-10"><div class="absolute top-10 right-10 w-48 h-48 bg-white rounded-full blur-3xl"></div><div class="absolute bottom-10 left-10 w-64 h-64 bg-yellow-500 rounded-full blur-3xl"></div></div>
      <div class="max-w-7xl mx-auto px-4 text-center relative z-10">
        <h2 class="text-3xl md:text-5xl font-bold mb-3">دليل اليمن</h2>
        <p class="text-base md:text-lg text-blue-100 mb-6 max-w-xl mx-auto">الدليل الشامل للأعمال والأماكن في جميع أنحاء اليمن</p>
        <div class="max-w-xl mx-auto relative">
          <div class="flex bg-white rounded-xl shadow-2xl overflow-hidden">
            <input type="text" id="heroSearch" placeholder="ابحث عن مكان، خدمة، أونشاط..." class="flex-1 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none text-sm" oninput="App.onSearchInput(this.value)" autocomplete="off">
            <button onclick="App.doSearch()" class="bg-yellow-500 hover:bg-yellow-600 text-white px-5 font-semibold transition-colors text-sm flex items-center gap-1"><i data-lucide="search" class="w-4 h-4"></i>بحث</button>
          </div>
          <div id="searchSuggestions" class="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 hidden"></div>
        </div>
      </div>
    </section>

    <!-- Ad: Below Hero -->
    ${Ads.renderPosition('below_hero')}

    <section class="bg-white py-4 border-b">
      <div class="max-w-7xl mx-auto px-4 grid grid-cols-4 gap-3 text-center">
        <div><div class="text-lg md:text-2xl font-bold text-blue-600">${stats.places}+</div><div class="text-[10px] md:text-xs text-gray-500 flex items-center justify-center gap-1"><i data-lucide="map-pin" class="w-3 h-3"></i>مكان</div></div>
        <div><div class="text-lg md:text-2xl font-bold text-blue-600">${stats.users}+</div><div class="text-[10px] md:text-xs text-gray-500 flex items-center justify-center gap-1"><i data-lucide="users" class="w-3 h-3"></i>مستخدم</div></div>
        <div><div class="text-lg md:text-2xl font-bold text-blue-600">${stats.reviews}+</div><div class="text-[10px] md:text-xs text-gray-500 flex items-center justify-center gap-1"><i data-lucide="star" class="w-3 h-3"></i>مراجعة</div></div>
        <div><div class="text-lg md:text-2xl font-bold text-blue-600">${stats.categories}</div><div class="text-[10px] md:text-xs text-gray-500 flex items-center justify-center gap-1"><i data-lucide="layers" class="w-3 h-3"></i>قسم</div></div>
      </div>
    </section>

    <section class="py-6 md:py-10">
      <div class="max-w-7xl mx-auto px-3">
        <h3 class="text-base md:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><i data-lucide="grid-3x3" class="w-5 h-5 text-blue-600"></i>الأقسام الرئيسية</h3>
        <div class="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2 md:gap-3">
          ${Data.categories.map(c => {
            const count = places.filter(p => p.category === c.id).length;
            return `<a href="#category/${c.id}" class="bg-white rounded-xl p-2 md:p-3 text-center hover:shadow-md transition-all cursor-pointer border border-gray-100 active-scale">
              <div class="flex justify-center mb-1.5">${IB(c.icon, c.color, 'icon-lg')}</div>
              <div class="text-[10px] md:text-xs font-medium text-gray-700 leading-tight">${c.name}</div>
              <div class="text-[9px] text-gray-400 mt-0.5">${count} مكان</div>
            </a>`;
          }).join('')}
        </div>
      </div>
    </section>

    <!-- Ad: Between Sections -->
    ${Ads.renderPosition('between_sections')}

    <section class="bg-white py-6 md:py-10">
      <div class="max-w-7xl mx-auto px-3">
        <h3 class="text-base md:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><i data-lucide="star" class="w-5 h-5 text-yellow-500"></i>أماكن مميزة</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">${featured.map(p => this.renderPlaceCard(p)).join('')}</div>
        <!-- Ad: Inside Places Grid -->
        ${Ads.renderPosition('inside_places')}
      </div>
    </section>

    <section class="py-6 md:py-10">
      <div class="max-w-7xl mx-auto px-3">
        <h3 class="text-base md:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><i data-lucide="map-pin" class="w-5 h-5 text-blue-600"></i>المدن</h3>
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2">
          ${Data.cities.map(c => { const count = places.filter(p => p.city === c.id).length; return `<a href="#city/${c.id}" class="bg-white rounded-lg p-2 md:p-3 text-center hover:shadow-md transition-all cursor-pointer border border-gray-100 active-scale"><div class="text-xs md:text-sm font-bold text-gray-900">${c.name}</div><div class="text-[10px] text-gray-400">${count} مكان</div></a>`; }).join('')}
        </div>
      </div>
    </section>

    <section class="bg-white py-6 md:py-10">
      <div class="max-w-7xl mx-auto px-3">
        <h3 class="text-base md:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><i data-lucide="clock" class="w-5 h-5 text-blue-600"></i>أحدث الأماكن</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">${latest.map(p => this.renderPlaceCard(p)).join('')}</div>
      </div>
    </section>

    <section class="bg-gradient-to-r from-yellow-500 to-yellow-600 py-8 md:py-10">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <h3 class="text-xl md:text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2"><i data-lucide="plus-circle" class="w-6 h-6"></i>أضف مكانك مجاناً</h3>
        <p class="text-yellow-100 mb-4 text-sm">سجّل عملك في دليل Yemen واحصل على المزيد من العملاء</p>
        <a href="${Auth.currentUser ? '#add' : '#signup'}" class="bg-white text-yellow-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-xl inline-block text-sm">ابدأ الآن</a>
      </div>
    </section>

    <!-- Ad: Footer -->
    ${Ads.renderPosition('footer')}
    `;
  },

  // ====== PLACE CARD ======
  renderPlaceCard(p) {
    const cat = Data.categories.find(c => c.id === p.category);
    const sub = p.subcategory ? Data.getSubCategory(p.subcategory) : null;
    const city = Data.cities.find(c => c.id === p.city);
    const isFav = Auth.currentUser && Data.isFavorite(Auth.currentUser.id, p.id);
    const catColor = cat ? cat.color : '#3b82f6';
    return `
    <div class="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all cursor-pointer active-scale" onclick="location.hash='place/${p.id}'">
      <div class="h-28 md:h-36 relative flex items-center justify-center" style="background:linear-gradient(135deg, ${catColor}20, ${catColor}40)">
        <div style="color:${catColor};opacity:0.3">${cat ? I(cat.icon, 'w-16 h-16 md:w-20 md:h-20') : I('map-pin', 'w-16 h-16')}</div>
        ${p.verified ? `<div class="absolute top-2 right-2 bg-green-500 text-white px-2 py-0.5 rounded text-[9px] font-medium flex items-center gap-0.5"><i data-lucide="check-circle" class="w-3 h-3"></i>موثّق</div>` : ''}
        ${p.featured ? `<div class="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-0.5 rounded text-[9px] font-medium flex items-center gap-0.5"><i data-lucide="star" class="w-3 h-3"></i></div>` : ''}
        ${Auth.currentUser ? `<button onclick="event.stopPropagation();App.toggleFav('${p.id}')" class="absolute bottom-2 left-2 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center"><i data-lucide="heart" class="w-4 h-4 ${isFav ? 'text-red-500 fill-red-500' : 'text-gray-400'}"></i></button>` : ''}
      </div>
      <div class="p-2.5 md:p-3">
        <h4 class="font-bold text-gray-900 text-xs md:text-sm mb-1 truncate">${p.name}</h4>
        <div class="flex items-center gap-1 text-[10px] md:text-xs text-gray-500 mb-1.5">
          ${sub ? `<span class="bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-0.5"><i data-lucide="${sub.icon}" class="w-3 h-3"></i>${sub.name}</span>` : (cat ? `<span class="bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-0.5"><i data-lucide="${cat.icon}" class="w-3 h-3"></i>${cat.name}</span>` : '')}
          ${city ? `<span class="flex items-center gap-0.5"><i data-lucide="map-pin" class="w-3 h-3"></i>${city.name}</span>` : ''}
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1"><i data-lucide="star" class="w-3.5 h-3.5 text-yellow-500 fill-yellow-500"></i><span class="font-bold text-xs">${p.rating || '0'}</span><span class="text-[10px] text-gray-400">(${p.reviews || 0})</span></div>
          <span class="text-[10px] text-gray-400 flex items-center gap-0.5"><i data-lucide="eye" class="w-3 h-3"></i>${p.views || 0}</span>
        </div>
      </div>
    </div>`;
  },

  // ====== CATEGORY PAGE ======
  render_category() {
    const cat = Data.categories.find(c => c.id === this.selectedCategory);
    if (!cat) return '<div class="text-center py-12 text-gray-400">القسم غير موجود</div>';
    const places = Data.getPlaces().filter(p => p.category === cat.id);
    return `
    <section class="py-6 md:py-8">
      <div class="max-w-7xl mx-auto px-3">
        <div class="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <a href="#home" class="text-blue-600 hover:underline flex items-center gap-1"><i data-lucide="home" class="w-3 h-3"></i>الرئيسية</a>
          <i data-lucide="chevron-left" class="w-3 h-3"></i>
          <span class="text-gray-700 font-medium">${cat.name}</span>
        </div>
        <div class="flex items-center gap-3 mb-6">
          <div class="cat-icon" style="background:${cat.color}15">${I(cat.icon, 'icon-xl', cat.color)}</div>
          <div>
            <h2 class="text-xl md:text-2xl font-bold text-gray-900">${cat.name}</h2>
            <p class="text-xs text-gray-500">${cat.subs.length} قسم فرعي • ${places.length} مكان</p>
          </div>
        </div>
        <div class="bg-white rounded-xl p-3 md:p-4 mb-6 border border-gray-100">
          <h3 class="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5"><i data-lucide="list" class="w-4 h-4 text-blue-600"></i>الأقسام الفرعية</h3>
          <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            ${cat.subs.map(sub => {
              const count = places.filter(p => p.subcategory === sub.id).length;
              return `<a href="#subcategory/${cat.id}/${sub.id}" class="bg-gray-50 rounded-lg p-2 text-center hover:bg-blue-50 transition-colors cursor-pointer border border-gray-100 active-scale">
                <div class="flex justify-center mb-1">${IBS(sub.icon, cat.color)}</div>
                <div class="text-[10px] md:text-xs font-medium text-gray-700 leading-tight">${sub.name}</div>
                <div class="text-[9px] text-gray-400">${count}</div>
              </a>`;
            }).join('')}
          </div>
        </div>
        <h3 class="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5"><i data-lucide="map-pin" class="w-4 h-4 text-blue-600"></i>جميع الأماكن (${places.length})</h3>
        ${places.length ? `<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">${places.map(p => this.renderPlaceCard(p)).join('')}</div>` : '<div class="text-center py-8 text-gray-400 bg-white rounded-xl border border-gray-100 text-sm">لا توجد أماكن بعد</div>'}
      </div>
    </section>`;
  },

  // ====== SUBCATEGORY PAGE ======
  render_subcategory() {
    const subInfo = Data.getSubCategory(this.selectedSubCategory);
    if (!subInfo) return '<div class="text-center py-12 text-gray-400">القسم غير موجود</div>';
    const cat = subInfo.parent;
    const places = Data.getPlaces().filter(p => p.subcategory === this.selectedSubCategory);
    return `
    <section class="py-6 md:py-8">
      <div class="max-w-7xl mx-auto px-3">
        <div class="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <a href="#home" class="text-blue-600 hover:underline flex items-center gap-1"><i data-lucide="home" class="w-3 h-3"></i>الرئيسية</a>
          <i data-lucide="chevron-left" class="w-3 h-3"></i>
          <a href="#category/${cat.id}" class="text-blue-600 hover:underline">${cat.name}</a>
          <i data-lucide="chevron-left" class="w-3 h-3"></i>
          <span class="text-gray-700 font-medium">${subInfo.name}</span>
        </div>
        <div class="flex items-center gap-3 mb-6">
          <div class="cat-icon" style="background:${cat.color}15">${I(subInfo.icon, 'icon-xl', cat.color)}</div>
          <div>
            <h2 class="text-xl md:text-2xl font-bold text-gray-900">${subInfo.name}</h2>
            <p class="text-xs text-gray-500">${cat.name} • ${places.length} مكان</p>
          </div>
        </div>
        <div class="bg-white rounded-xl p-3 mb-4 border border-gray-100 flex flex-wrap gap-2">
          <button onclick="App.filterCity(null)" class="px-3 py-1.5 rounded-lg text-xs font-medium ${!this.selectedCity ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} flex items-center gap-1"><i data-lucide="layers" class="w-3 h-3"></i>الكل</button>
          ${Data.cities.map(c => { const count = places.filter(p => p.city === c.id).length; if (!count) return ''; return `<button onclick="App.filterCity('${c.id}')" class="px-3 py-1.5 rounded-lg text-xs font-medium ${this.selectedCity === c.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}">${c.name} (${count})</button>`; }).join('')}
        </div>
        ${places.length ? `<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">${places.filter(p => !this.selectedCity || p.city === this.selectedCity).map(p => this.renderPlaceCard(p)).join('')}</div>` : '<div class="text-center py-8 text-gray-400 bg-white rounded-xl border border-gray-100 text-sm">لا توجد أماكن</div>'}
      </div>
    </section>`;
  },

  filterCity(id) { this.selectedCity = id; this.render(); },

  // ====== SEARCH ======
  render_search() {
    const results = Data.search(this.searchQuery, this.selectedCategory, this.selectedSubCategory, this.selectedCity);
    return `
    <section class="py-6 md:py-8">
      <div class="max-w-7xl mx-auto px-3">
        <div class="bg-white rounded-xl p-3 mb-4 border border-gray-100">
          <div class="flex flex-col gap-2">
            <div class="relative">
              <input type="text" id="searchInput" value="${this.searchQuery}" placeholder="ابحث عن مكان أو خدمة..." class="w-full px-3 py-2.5 pr-9 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" oninput="App.onSearchInput(this.value)" autocomplete="off">
              <i data-lucide="search" class="absolute right-2.5 top-3 w-4 h-4 text-gray-400"></i>
              <div id="searchSuggestions" class="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 hidden"></div>
            </div>
            <div class="flex gap-2">
              <select id="searchCat" class="flex-1 py-2.5 text-xs"><option value="">جميع الأقسام</option>${Data.categories.map(c => `<option value="${c.id}" ${this.selectedCategory===c.id?'selected':''}>${c.name}</option>`).join('')}</select>
              <select id="searchCity" class="flex-1 py-2.5 text-xs"><option value="">جميع المدن</option>${Data.cities.map(c => `<option value="${c.id}" ${this.selectedCity===c.id?'selected':''}>${c.name}</option>`).join('')}</select>
              <button onclick="App.doSearch()" class="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-xs flex items-center gap-1"><i data-lucide="search" class="w-3.5 h-3.5"></i></button>
            </div>
          </div>
        </div>
        <div class="mb-3 text-gray-500 text-xs flex items-center gap-1"><i data-lucide="filter" class="w-3 h-3"></i>${results.length} نتيجة</div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">${results.length ? results.map(p => this.renderPlaceCard(p)).join('') : '<div class="col-span-4 text-center py-12 text-gray-400"><i data-lucide="search-x" class="w-12 h-12 mx-auto mb-2 text-gray-300"></i><br>لا توجد نتائج</div>'}</div>
      </div>
    </section>`;
  },

  // ====== PLACE DETAILS ======
  showPlace(pid) {
    const place = Data.getPlaces().find(p => p.id === pid);
    if (!place) { location.hash = 'home'; return; }
    place.views = (place.views || 0) + 1;
    localStorage.setItem('dy_places', JSON.stringify(Data.getPlaces()));
    const cat = Data.categories.find(c => c.id === place.category);
    const sub = place.subcategory ? Data.getSubCategory(place.subcategory) : null;
    const city = Data.cities.find(c => c.id === place.city);
    const reviews = Data.getReviews(place.id);
    const isFav = Auth.currentUser && Data.isFavorite(Auth.currentUser.id, place.id);
    const isOwner = Auth.currentUser && place.owner === Auth.currentUser.id;
    const catColor = cat ? cat.color : '#3b82f6';

    const app = document.getElementById('app');
    app.innerHTML = `<div class="min-h-screen bg-gray-50">${this.renderHeader(Auth.currentUser)}
    <section class="py-4 md:py-8">
      <div class="max-w-4xl mx-auto px-3">
        <div class="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <a href="#home" class="text-blue-600 hover:underline flex items-center gap-1"><i data-lucide="home" class="w-3 h-3"></i>الرئيسية</a>
          ${cat ? `<i data-lucide="chevron-left" class="w-3 h-3"></i><a href="#category/${cat.id}" class="text-blue-600 hover:underline">${cat.name}</a>` : ''}
          ${sub ? `<i data-lucide="chevron-left" class="w-3 h-3"></i><a href="#subcategory/${cat.id}/${sub.id}" class="text-blue-600 hover:underline">${sub.name}</a>` : ''}
        </div>
        <div class="bg-white rounded-xl overflow-hidden border border-gray-100">
          <div class="h-40 md:h-56 flex items-center justify-center relative" style="background:linear-gradient(135deg, ${catColor}20, ${catColor}40)">
            <div style="color:${catColor};opacity:0.2">${cat ? I(cat.icon, 'w-24 h-24') : I('map-pin', 'w-24 h-24')}</div>
            ${place.verified ? `<div class="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"><i data-lucide="check-circle" class="w-3.5 h-3.5"></i>موثّق</div>` : ''}
          </div>
          <div class="p-4 md:p-6">
            <div class="flex items-start justify-between mb-3">
              <div>
                <h2 class="text-xl md:text-2xl font-bold text-gray-900">${place.name}</h2>
                <div class="flex flex-wrap items-center gap-2 mt-1.5">
                  ${sub ? `<span class="bg-gray-100 px-2 py-0.5 rounded text-xs flex items-center gap-1"><i data-lucide="${sub.icon}" class="w-3 h-3"></i>${sub.name}</span>` : (cat ? `<span class="bg-gray-100 px-2 py-0.5 rounded text-xs flex items-center gap-1"><i data-lucide="${cat.icon}" class="w-3 h-3"></i>${cat.name}</span>` : '')}
                  ${city ? `<span class="text-xs text-gray-500 flex items-center gap-1"><i data-lucide="map-pin" class="w-3 h-3"></i>${city.name}</span>` : ''}
                </div>
              </div>
              <div class="flex gap-2">
                ${Auth.currentUser ? `<button onclick="App.toggleFav('${place.id}')" class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"><i data-lucide="heart" class="w-5 h-5 ${isFav ? 'text-red-500 fill-red-500' : 'text-gray-400'}"></i></button>` : ''}
                ${isOwner ? `<button onclick="App.deletePlaceConfirm('${place.id}')" class="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center"><i data-lucide="trash-2" class="w-5 h-5 text-red-500"></i></button>` : ''}
              </div>
            </div>
            <div class="flex items-center gap-3 mb-3 text-sm">
              <span class="flex items-center gap-1"><i data-lucide="star" class="w-4 h-4 text-yellow-500 fill-yellow-500"></i><span class="font-bold">${place.rating || '0'}</span><span class="text-gray-400 text-xs">(${place.reviews || 0})</span></span>
              <span class="text-gray-400 text-xs flex items-center gap-1"><i data-lucide="eye" class="w-3.5 h-3.5"></i>${place.views || 0} مشاهدة</span>
            </div>
            ${place.description ? `<p class="text-gray-600 mb-4 text-sm leading-relaxed">${place.description}</p>` : ''}
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              ${place.phone ? `<a href="tel:${place.phone}" class="bg-green-500 text-white py-2.5 rounded-lg text-center font-semibold hover:bg-green-600 text-xs flex items-center justify-center gap-1"><i data-lucide="phone" class="w-4 h-4"></i>اتصال</a>` : ''}
              ${place.whatsapp ? `<a href="https://wa.me/967${place.whatsapp}" target="_blank" class="bg-green-600 text-white py-2.5 rounded-lg text-center font-semibold hover:bg-green-700 text-xs flex items-center justify-center gap-1"><i data-lucide="message-circle" class="w-4 h-4"></i>واتساب</a>` : ''}
              ${place.email ? `<a href="mailto:${place.email}" class="bg-blue-500 text-white py-2.5 rounded-lg text-center font-semibold hover:bg-blue-600 text-xs flex items-center justify-center gap-1"><i data-lucide="mail" class="w-4 h-4"></i>إيميل</a>` : ''}
              ${place.address ? `<button onclick="window.open('https://maps.google.com/?q=${encodeURIComponent(place.address)}','_blank')" class="bg-gray-100 text-gray-700 py-2.5 rounded-lg text-center font-semibold hover:bg-gray-200 text-xs flex items-center justify-center gap-1"><i data-lucide="map" class="w-4 h-4"></i>خريطة</button>` : ''}
            </div>
            ${place.address ? `<div class="bg-gray-50 rounded-lg p-3 mb-4 text-sm flex items-start gap-2"><i data-lucide="map-pin" class="w-4 h-4 text-gray-400 mt-0.5 shrink-0"></i><span>${place.address}</span></div>` : ''}
          </div>
        </div>
        <div class="bg-white rounded-xl p-4 md:p-6 mt-3 border border-gray-100">
          <h3 class="text-base font-bold mb-3 flex items-center gap-2"><i data-lucide="star" class="w-5 h-5 text-yellow-500"></i>المراجعات (${reviews.length})</h3>
          ${Auth.currentUser ? `<div class="bg-gray-50 rounded-lg p-3 mb-3">
            <div class="flex items-center gap-1 mb-2"><span class="text-xs font-medium">تقييمك:</span>${[1,2,3,4,5].map(i => `<button onclick="App.setRating(${i})" class="text-xl text-gray-300 hover:text-yellow-500" data-star="${i}"><i data-lucide="star" class="w-5 h-5"></i></button>`).join('')}</div>
            <textarea id="reviewComment" class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none text-sm" rows="2" placeholder="اكتب مراجعتك..."></textarea>
            <button onclick="App.submitReview('${place.id}')" class="mt-2 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center gap-1"><i data-lucide="send" class="w-3.5 h-3.5"></i>إرسال</button>
          </div>` : '<p class="text-gray-400 text-xs mb-3"><a href="#login" class="text-blue-600 font-medium">سجّل دخول</a> لكتابة مراجعة</p>'}
          ${reviews.length ? reviews.map(r => `<div class="border-b border-gray-100 py-2.5 last:border-0">
            <div class="flex items-center justify-between mb-1"><span class="font-semibold text-xs">${r.userName}</span><span class="flex">${Array(r.rating).fill(0).map(() => '<i data-lucide="star" class="w-3.5 h-3.5 text-yellow-500 fill-yellow-500"></i>').join('')}</span></div>
            <p class="text-gray-600 text-xs">${r.comment}</p>
            <span class="text-[10px] text-gray-400 flex items-center gap-1 mt-1"><i data-lucide="clock" class="w-3 h-3"></i>${new Date(r.createdAt).toLocaleDateString('ar')}</span>
          </div>`).join('') : '<p class="text-gray-400 text-center py-4 text-xs">لا توجد مراجعات</p>'}
        </div>
      </div>
    </section>${this.renderFooter()}</div>`;
    this.initIcons();
  },

  // ====== ADD PLACE ======
  render_add() {
    if (!Auth.currentUser) return `<section class="py-12 text-center"><div class="max-w-md mx-auto"><i data-lucide="lock" class="w-12 h-12 text-gray-300 mx-auto mb-3"></i><h3 class="text-lg font-bold mb-3">سجّل دخول أولاً</h3><a href="#login" class="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold inline-block text-sm">تسجيل الدخول</a></div></section>`;
    return `
    <section class="py-6 md:py-8">
      <div class="max-w-2xl mx-auto px-3">
        <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><i data-lucide="plus-circle" class="w-6 h-6 text-blue-600"></i>إضافة مكان جديد</h3>
        <div class="bg-white rounded-xl p-4 md:p-6 border border-gray-100">
          <div class="space-y-3">
            <div><label class="block text-xs font-medium text-gray-700 mb-1">اسم المكان *</label><input type="text" id="placeName" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" placeholder="مثال: مطعم البركة"></div>
            <div class="grid grid-cols-2 gap-3">
              <div><label class="block text-xs font-medium text-gray-700 mb-1">القسم الرئيسي *</label><select id="placeCategory" onchange="App.updateSubs()" class="w-full py-2.5 text-xs"><option value="">اختر القسم</option>${Data.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select></div>
              <div><label class="block text-xs font-medium text-gray-700 mb-1">القسم الفرعي *</label><select id="placeSubCategory" class="w-full py-2.5 text-xs"><option value="">اختر القسم الفرعي</option></select></div>
            </div>
            <div><label class="block text-xs font-medium text-gray-700 mb-1">المدينة *</label><select id="placeCity" class="w-full py-2.5 text-xs"><option value="">اختر المدينة</option>${Data.cities.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select></div>
            <div><label class="block text-xs font-medium text-gray-700 mb-1">الوصف</label><textarea id="placeDesc" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm" rows="3" placeholder="وصف المكان..."></textarea></div>
            <div><label class="block text-xs font-medium text-gray-700 mb-1">العنوان</label><input type="text" id="placeAddress" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm" placeholder="الشارع، المدينة"></div>
            <div class="grid grid-cols-2 gap-3">
              <div><label class="block text-xs font-medium text-gray-700 mb-1">رقم الهاتف</label><input type="tel" id="placePhone" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm" placeholder="777123456"></div>
              <div><label class="block text-xs font-medium text-gray-700 mb-1">رقم واتساب</label><input type="tel" id="placeWhatsapp" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm" placeholder="777123456"></div>
            </div>
            <div><label class="block text-xs font-medium text-gray-700 mb-1">البريد الإلكتروني</label><input type="email" id="placeEmail" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm" placeholder="info@example.com"></div>
            <button onclick="App.submitPlace()" class="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2"><i data-lucide="check-circle" class="w-5 h-5"></i>إضافة المكان</button>
          </div>
        </div>
      </div>
    </section>`;
  },

  updateSubs() {
    const catId = document.getElementById('placeCategory').value;
    const sub = document.getElementById('placeSubCategory');
    const cat = Data.categories.find(c => c.id === catId);
    sub.innerHTML = '<option value="">اختر القسم الفرعي</option>' + (cat ? cat.subs.map(s => `<option value="${s.id}">${s.name}</option>`).join('') : '');
  },

  // ====== LOGIN ======
  render_login() {
    return `
    <section class="py-10 md:py-16">
      <div class="max-w-md mx-auto px-3">
        <div class="bg-white rounded-xl p-6 md:p-8 border border-gray-100 shadow-sm">
          <div class="text-center mb-5"><i data-lucide="log-in" class="w-10 h-10 text-blue-600 mx-auto mb-2"></i><h3 class="text-xl font-bold">تسجيل الدخول</h3></div>
          <div id="loginError" class="hidden bg-red-50 text-red-600 p-2.5 rounded-lg mb-3 text-xs flex items-center gap-2"><i data-lucide="alert-circle" class="w-4 h-4"></i><span></span></div>
          <div class="space-y-3">
            <div><label class="block text-xs font-medium text-gray-700 mb-1">البريد الإلكتروني</label><input type="email" id="loginEmail" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" placeholder="example@gmail.com"></div>
            <div><label class="block text-xs font-medium text-gray-700 mb-1">كلمة المرور</label><input type="password" id="loginPassword" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" placeholder="••••••••"></div>
            <button onclick="App.doLogin()" class="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 text-sm flex items-center justify-center gap-2"><i data-lucide="log-in" class="w-4 h-4"></i>دخول</button>
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
  render_signup() {
    return `
    <section class="py-10 md:py-16">
      <div class="max-w-md mx-auto px-3">
        <div class="bg-white rounded-xl p-6 md:p-8 border border-gray-100 shadow-sm">
          <div class="text-center mb-5"><i data-lucide="user-plus" class="w-10 h-10 text-blue-600 mx-auto mb-2"></i><h3 class="text-xl font-bold">إنشاء حساب جديد</h3></div>
          <div id="signupError" class="hidden bg-red-50 text-red-600 p-2.5 rounded-lg mb-3 text-xs flex items-center gap-2"><i data-lucide="alert-circle" class="w-4 h-4"></i><span></span></div>
          <div class="space-y-3">
            <div><label class="block text-xs font-medium text-gray-700 mb-1">الاسم الكامل *</label><input type="text" id="signupName" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm" placeholder="محمد أحمد"></div>
            <div><label class="block text-xs font-medium text-gray-700 mb-1">البريد الإلكتروني *</label><input type="email" id="signupEmail" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm" placeholder="example@gmail.com"></div>
            <div><label class="block text-xs font-medium text-gray-700 mb-1">رقم الهاتف</label><input type="tel" id="signupPhone" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm" placeholder="777123456"></div>
            <div><label class="block text-xs font-medium text-gray-700 mb-1">كلمة المرور *</label><input type="password" id="signupPassword" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm" placeholder="6 أحرف على الأقل"></div>
            <button onclick="App.doSignup()" class="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 text-sm flex items-center justify-center gap-2"><i data-lucide="user-plus" class="w-4 h-4"></i>إنشاء الحساب</button>
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
  render_profile() {
    if (!Auth.currentUser) return this.render_login();
    const u = Auth.currentUser;
    return `<section class="py-6 md:py-8"><div class="max-w-2xl mx-auto px-3">
      <div class="bg-white rounded-xl p-4 md:p-6 border border-gray-100">
        <div class="flex items-center gap-3 mb-5"><img src="${u.avatar}" class="w-12 h-12 rounded-full" alt=""><div><h3 class="text-lg font-bold">${u.name}</h3><p class="text-gray-500 text-xs">${u.email}</p></div></div>
        <div class="space-y-3">
          <div><label class="block text-xs font-medium text-gray-700 mb-1">الاسم</label><input type="text" id="profileName" value="${u.name}" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm"></div>
          <div><label class="block text-xs font-medium text-gray-700 mb-1">الهاتف</label><input type="tel" id="profilePhone" value="${u.phone||''}" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm"></div>
          <button onclick="App.updateProfile()" class="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 text-sm flex items-center gap-2"><i data-lucide="save" class="w-4 h-4"></i>حفظ</button>
        </div>
      </div>
    </div></section>`;
  },

  render_myplaces() {
    if (!Auth.currentUser) return this.render_login();
    const my = Data.getPlaces().filter(p => p.owner === Auth.currentUser.id);
    return `<section class="py-6 md:py-8"><div class="max-w-7xl mx-auto px-3">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="building-2" class="w-5 h-5 text-blue-600"></i>مواقعي (${my.length})</h3>
        <a href="#add" class="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1"><i data-lucide="plus" class="w-3.5 h-3.5"></i>إضافة</a>
      </div>
      ${my.length ? `<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">${my.map(p => this.renderPlaceCard(p)).join('')}</div>` : '<div class="text-center py-8 text-gray-400 text-sm"><i data-lucide="building-2" class="w-12 h-12 mx-auto mb-2 text-gray-300"></i><br>لم تضف أي مكان<br><a href="#add" class="text-blue-600 font-medium">أضف مكانك الأول</a></div>'}
    </div></section>`;
  },

  render_favorites() {
    if (!Auth.currentUser) return this.render_login();
    const favs = Data.getFavorites(Auth.currentUser.id);
    return `<section class="py-6 md:py-8"><div class="max-w-7xl mx-auto px-3">
      <h3 class="text-lg font-bold mb-4 flex items-center gap-2"><i data-lucide="heart" class="w-5 h-5 text-red-500"></i>المفضلة (${favs.length})</h3>
      ${favs.length ? `<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">${favs.map(p => this.renderPlaceCard(p)).join('')}</div>` : '<div class="text-center py-8 text-gray-400 text-sm"><i data-lucide="heart" class="w-12 h-12 mx-auto mb-2 text-gray-300"></i><br>لا توجد مفضلة</div>'}
    </div></section>`;
  },

  renderFooter() {
    return `<footer class="bg-gray-900 text-gray-300 py-6 mt-8">
      <div class="max-w-7xl mx-auto px-3">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div><div class="flex items-center gap-2 mb-2"><div class="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center"><span class="text-white font-bold text-sm">د</span></div><span class="text-white font-bold text-sm">دليل اليمن</span></div><p class="text-xs text-gray-400">الدليل الشامل للأعمال والأماكن في اليمن</p></div>
          <div><h5 class="text-white font-semibold mb-2 text-sm">روابط</h5><ul class="space-y-1 text-xs"><li><a href="#home" class="hover:text-white text-gray-400 flex items-center gap-1"><i data-lucide="home" class="w-3 h-3"></i>الرئيسية</a></li><li><a href="#search" class="hover:text-white text-gray-400 flex items-center gap-1"><i data-lucide="search" class="w-3 h-3"></i>البحث</a></li><li><a href="#add" class="hover:text-white text-gray-400 flex items-center gap-1"><i data-lucide="plus" class="w-3 h-3"></i>أضف مكانك</a></li></ul></div>
          <div><h5 class="text-white font-semibold mb-2 text-sm">تواصل</h5><p class="text-xs text-gray-400 flex items-center gap-1"><i data-lucide="mail" class="w-3 h-3"></i>info@yemendirectory.net</p></div>
        </div>
        <div class="border-t border-gray-800 mt-4 pt-4 text-center text-xs text-gray-500">2024دليل اليمن</div>
      </div>
    </footer>`;
  },

  // ====== ACTIONS ======
  doSearch() {
    const input = document.getElementById('heroSearch') || document.getElementById('searchInput');
    this.searchQuery = input ? input.value : '';
    this.selectedCategory = document.getElementById('searchCat')?.value || null;
    this.selectedCity = document.getElementById('searchCity')?.value || null;
    this.selectedSubCategory = null;
    this.hideSuggestions();
    this.currentView = 'search';
    this.render();
  },

  // معالج إدخال البحث (بحث فوري)
  onSearchInput(value) {
    const suggestions = Data.quickSearch(value);
    const heroBox = document.getElementById('searchSuggestions');
    const headerBox = document.getElementById('headerSearchSuggestions');
    const boxes = [heroBox, headerBox].filter(Boolean);

    boxes.forEach(box => {
      if (!value || value.trim().length < 2 || suggestions.length === 0) {
        box.classList.add('hidden');
        box.innerHTML = '';
        return;
      }

      box.classList.remove('hidden');
      box.innerHTML = suggestions.map(s => `
        <button onclick="App.selectSuggestion('${s.type}', '${s.id}', '${s.catId || ''}')" class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition-colors text-right border-b border-gray-50 last:border-0">
          <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
            <i data-lucide="${s.icon}" class="w-4 h-4 text-blue-600"></i>
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-gray-900 truncate">${s.name}</div>
            <div class="text-[10px] text-gray-500 truncate">${s.subtitle}</div>
          </div>
          <i data-lucide="arrow-left" class="w-4 h-4 text-gray-300 shrink-0"></i>
        </button>
      `).join('');
      this.initIcons();
    });
  },

  // اختيار اقتراح
  selectSuggestion(type, id, catId) {
    this.hideSuggestions();
    if (type === 'place') {
      location.hash = 'place/' + id;
    } else if (type === 'category') {
      location.hash = 'category/' + id;
    } else if (type === 'subcategory') {
      location.hash = 'subcategory/' + catId + '/' + id;
    } else if (type === 'city') {
      this.selectedCity = id;
      this.currentView = 'search';
      this.render();
    }
  },

  // إخفاء الاقتراحات
  hideSuggestions() {
    const boxes = ['searchSuggestions', 'headerSearchSuggestions'];
    boxes.forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.classList.add('hidden'); el.innerHTML = ''; }
    });
  },
  doLogin() {
    const err = document.getElementById('loginError');
    try { Auth.login(document.getElementById('loginEmail').value, document.getElementById('loginPassword').value); err.classList.add('hidden'); location.hash = 'home'; this.render(); }
    catch (e) { err.querySelector('span').textContent = e.message; err.classList.remove('hidden'); this.initIcons(); }
  },
  doSignup() {
    const err = document.getElementById('signupError');
    const n = document.getElementById('signupName').value, e = document.getElementById('signupEmail').value, p = document.getElementById('signupPhone').value, pw = document.getElementById('signupPassword').value;
    if (!n||!e||!pw) { err.querySelector('span').textContent = 'يرجى ملء الحقول المطلوبة'; err.classList.remove('hidden'); this.initIcons(); return; }
    if (pw.length < 6) { err.querySelector('span').textContent = 'كلمة المرور 6 أحرف على الأقل'; err.classList.remove('hidden'); this.initIcons(); return; }
    try { Auth.signup(n, e, pw, p); err.classList.add('hidden'); location.hash = 'home'; this.render(); }
    catch (x) { err.querySelector('span').textContent = x.message; err.classList.remove('hidden'); this.initIcons(); }
  },
  async doGoogleLogin() { try { await Auth.loginWithGoogle(); location.hash = 'home'; this.render(); } catch (e) { alert(e.message); } },
  submitPlace() {
    const n = document.getElementById('placeName').value, c = document.getElementById('placeCategory').value, s = document.getElementById('placeSubCategory').value, ci = document.getElementById('placeCity').value;
    if (!n||!c||!ci) { alert('يرجى ملء الحقول المطلوبة'); return; }
    Data.addPlace({ name:n, category:c, subcategory:s||null, city:ci, description:document.getElementById('placeDesc').value, address:document.getElementById('placeAddress').value, phone:document.getElementById('placePhone').value, whatsapp:document.getElementById('placeWhatsapp').value, email:document.getElementById('placeEmail').value, owner:Auth.currentUser.id, verified:false, featured:false });
    Admin.notifyNewPlace(n, Auth.currentUser.name);
    alert('تم إضافة المكان بنجاح! سيتم مراجعته من قبل الإدارة.'); location.hash = 'myplaces';
  },
  toggleFav(pid) { if (!Auth.currentUser) { location.hash = 'login'; return; } Data.toggleFavorite(Auth.currentUser.id, pid); this.render(); },
  setRating(s) { document.querySelectorAll('[data-star]').forEach(b => { const v = parseInt(b.dataset.star); b.className = v <= s ? 'text-yellow-500' : 'text-gray-300'; b.querySelector('i')?.classList.toggle('fill-yellow-500', v <= s); }); this._selectedRating = s; },
  submitReview(pid) { if (!this._selectedRating) { alert('اختر تقييم'); return; } const c = document.getElementById('reviewComment').value; if (!c) { alert('اكتب تعليق'); return; } Data.addReview(pid, Auth.currentUser.id, Auth.currentUser.name, this._selectedRating, c); this._selectedRating = 0; this.showPlace(pid); },
  deletePlaceConfirm(id) { if (confirm('هل أنت متأكد من الحذف؟')) { Data.deletePlace(id); alert('تم الحذف'); location.hash = 'myplaces'; } },
  updateProfile() { Auth.updateProfile({ name:document.getElementById('profileName').value, phone:document.getElementById('profilePhone').value }); alert('تم التحديث'); this.render(); },

  // ====== ADMIN DASHBOARD ======
  render_admin() {
    if (!Admin.isAdmin()) return `<section class="py-16 text-center"><div class="max-w-md mx-auto"><i data-lucide="shield-alert" class="w-16 h-16 text-red-400 mx-auto mb-4"></i><h3 class="text-xl font-bold mb-2">غير مصرح</h3><p class="text-gray-500 text-sm">ليس لديك صلاحية الوصول لهذه الصفحة</p><a href="#home" class="text-blue-600 text-sm mt-4 inline-block">العودة للرئيسية</a></div></section>`;

    const stats = Admin.getStats();
    const users = Admin.getAllUsers();
    const places = Admin.getAllPlaces();
    const notifs = Admin.getNotifications();
    Admin.markNotificationsRead();

    return `
    <section class="py-6 md:py-8">
      <div class="max-w-7xl mx-auto px-3">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold flex items-center gap-2"><i data-lucide="shield" class="w-6 h-6 text-red-600"></i>لوحة تحكم الأدمن</h2>
          <span class="text-xs text-gray-500">مرحباً، ${Auth.currentUser.name}</span>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div class="bg-white rounded-xl p-4 border border-gray-100">
            <div class="flex items-center gap-2 mb-2"><i data-lucide="users" class="w-5 h-5 text-blue-600"></i><span class="text-xs text-gray-500">المستخدمين</span></div>
            <div class="text-2xl font-bold text-gray-900">${stats.totalUsers}</div>
            <div class="text-[10px] text-green-600">${stats.verifiedUsers} موثّق</div>
          </div>
          <div class="bg-white rounded-xl p-4 border border-gray-100">
            <div class="flex items-center gap-2 mb-2"><i data-lucide="building-2" class="w-5 h-5 text-blue-600"></i><span class="text-xs text-gray-500">الأماكن</span></div>
            <div class="text-2xl font-bold text-gray-900">${stats.totalPlaces}</div>
            <div class="text-[10px] text-green-600">${stats.verifiedPlaces} موثّق</div>
          </div>
          <div class="bg-white rounded-xl p-4 border border-gray-100">
            <div class="flex items-center gap-2 mb-2"><i data-lucide="star" class="w-5 h-5 text-yellow-500"></i><span class="text-xs text-gray-500">مميزة</span></div>
            <div class="text-2xl font-bold text-gray-900">${stats.featuredPlaces}</div>
          </div>
          <div class="bg-white rounded-xl p-4 border border-gray-100">
            <div class="flex items-center gap-2 mb-2"><i data-lucide="bell" class="w-5 h-5 text-red-500"></i><span class="text-xs text-gray-500">إشعارات</span></div>
            <div class="text-2xl font-bold text-gray-900">${stats.pendingRequests}</div>
          </div>
        </div>

        <!-- Notifications -->
        ${notifs.length > 0 ? `
        <div class="bg-white rounded-xl p-4 border border-gray-100 mb-6">
          <h3 class="text-sm font-bold mb-3 flex items-center gap-2"><i data-lucide="bell" class="w-4 h-4 text-red-500"></i>أحدث الإشعارات</h3>
          <div class="space-y-2 max-h-48 overflow-y-auto">
            ${notifs.slice(0, 10).map(n => `
              <div class="flex items-center gap-2 p-2 rounded-lg ${n.read ? 'bg-gray-50' : 'bg-blue-50'} text-xs">
                <i data-lucide="${n.type === 'request' ? 'user-plus' : n.type === 'new_place' ? 'building-2' : 'info'}" class="w-4 h-4 ${n.read ? 'text-gray-400' : 'text-blue-600'} shrink-0"></i>
                <span class="flex-1 ${n.read ? 'text-gray-600' : 'text-gray-900 font-medium'}">${n.message}</span>
                <span class="text-[10px] text-gray-400 shrink-0">${new Date(n.createdAt).toLocaleTimeString('ar', {hour:'2-digit',minute:'2-digit'})}</span>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <!-- Tabs -->
        <div class="flex gap-2 mb-4 overflow-x-auto">
          <button onclick="App.adminTab='users';App.render()" class="px-4 py-2 rounded-lg text-xs font-medium ${this.adminTab==='users' || !this.adminTab ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200'} flex items-center gap-1 whitespace-nowrap"><i data-lucide="users" class="w-3.5 h-3.5"></i>المستخدمين (${users.length})</button>
          <button onclick="App.adminTab='places';App.render()" class="px-4 py-2 rounded-lg text-xs font-medium ${this.adminTab==='places' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200'} flex items-center gap-1 whitespace-nowrap"><i data-lucide="building-2" class="w-3.5 h-3.5"></i>الأماكن (${places.length})</button>
          <button onclick="App.adminTab='ads';App.render()" class="px-4 py-2 rounded-lg text-xs font-medium ${this.adminTab==='ads' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200'} flex items-center gap-1 whitespace-nowrap"><i data-lucide="megaphone" class="w-3.5 h-3.5"></i>الإعلانات (${Ads.getAll().length})</button>
        </div>

        <!-- Users Tab -->
        ${(this.adminTab === 'users' || !this.adminTab) ? `
        <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-xs">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-3 py-2.5 text-right font-medium text-gray-500">المستخدم</th>
                  <th class="px-3 py-2.5 text-right font-medium text-gray-500">البريد</th>
                  <th class="px-3 py-2.5 text-right font-medium text-gray-500">الدور</th>
                  <th class="px-3 py-2.5 text-right font-medium text-gray-500">الحالة</th>
                  <th class="px-3 py-2.5 text-right font-medium text-gray-500">الإجراءات</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                ${users.map(u => `
                  <tr class="hover:bg-gray-50">
                    <td class="px-3 py-2.5">
                      <div class="flex items-center gap-2">
                        <img src="${u.avatar}" class="w-7 h-7 rounded-full" alt="">
                        <div>
                          <div class="font-medium text-gray-900 flex items-center gap-1">${u.name} ${u.verified ? '<i data-lucide="badge-check" class="w-3.5 h-3.5 text-blue-500"></i>' : ''}</div>
                          <div class="text-[10px] text-gray-400">${u.phone || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-3 py-2.5 text-gray-600">${u.email}</td>
                    <td class="px-3 py-2.5"><span class="px-2 py-0.5 rounded text-[10px] font-medium ${u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}">${u.role === 'admin' ? 'أدمن' : 'مستخدم'}</span></td>
                    <td class="px-3 py-2.5">
                      ${u.suspended ? '<span class="px-2 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-700">موقوف</span>' : u.verified ? '<span class="px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700">موثّق</span>' : '<span class="px-2 py-0.5 rounded text-[10px] font-medium bg-yellow-100 text-yellow-700">معلّق</span>'}
                    </td>
                    <td class="px-3 py-2.5">
                      ${u.role !== 'admin' ? `
                        <div class="flex items-center gap-1">
                          <button onclick="App.adminToggleVerify('${u.id}')" class="p-1.5 rounded-lg ${u.verified ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}" title="${u.verified ? 'إلغاء التوثيق' : 'توثيق'}"><i data-lucide="badge-check" class="w-3.5 h-3.5"></i></button>
                          <button onclick="App.adminToggleSuspend('${u.id}')" class="p-1.5 rounded-lg ${u.suspended ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}" title="${u.suspended ? 'تفعيل' : 'إيقاف'}"><i data-lucide="ban" class="w-3.5 h-3.5"></i></button>
                          <button onclick="App.adminDeleteUser('${u.id}')" class="p-1.5 rounded-lg bg-gray-100 text-red-500 hover:bg-red-100" title="حذف"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
                        </div>
                      ` : '<span class="text-[10px] text-gray-400">-</span>'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
        ` : ''}

        <!-- Ads Tab -->
        ${this.adminTab === 'ads' ? this.renderAdminAds() : ''}

        <!-- Places Tab -->
        ${this.adminTab === 'places' ? `
        <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-xs">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-3 py-2.5 text-right font-medium text-gray-500">المكان</th>
                  <th class="px-3 py-2.5 text-right font-medium text-gray-500">القسم</th>
                  <th class="px-3 py-2.5 text-right font-medium text-gray-500">المدينة</th>
                  <th class="px-3 py-2.5 text-right font-medium text-gray-500">الحالة</th>
                  <th class="px-3 py-2.5 text-right font-medium text-gray-500">الإجراءات</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                ${places.map(p => {
                  const cat = Data.categories.find(c => c.id === p.category);
                  const city = Data.cities.find(c => c.id === p.city);
                  return `
                  <tr class="hover:bg-gray-50">
                    <td class="px-3 py-2.5">
                      <div class="font-medium text-gray-900 flex items-center gap-1">${p.name} ${p.verified ? '<i data-lucide="badge-check" class="w-3.5 h-3.5 text-blue-500"></i>' : ''}</div>
                      <div class="text-[10px] text-gray-400">${p.phone || '-'}</div>
                    </td>
                    <td class="px-3 py-2.5 text-gray-600">${cat ? cat.name : '-'}</td>
                    <td class="px-3 py-2.5 text-gray-600">${city ? city.name : '-'}</td>
                    <td class="px-3 py-2.5">
                      <div class="flex gap-1">
                        ${p.verified ? '<span class="px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700">موثّق</span>' : ''}
                        ${p.featured ? '<span class="px-2 py-0.5 rounded text-[10px] font-medium bg-yellow-100 text-yellow-700">مميز</span>' : ''}
                        ${!p.verified && !p.featured ? '<span class="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500">عادي</span>' : ''}
                      </div>
                    </td>
                    <td class="px-3 py-2.5">
                      <div class="flex items-center gap-1">
                        <button onclick="App.adminToggleVerifyPlace('${p.id}')" class="p-1.5 rounded-lg ${p.verified ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}" title="${p.verified ? 'إلغاء التوثيق' : 'توثيق'}"><i data-lucide="badge-check" class="w-3.5 h-3.5"></i></button>
                        <button onclick="App.adminToggleFeature('${p.id}')" class="p-1.5 rounded-lg ${p.featured ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}" title="${p.featured ? 'إلغاء التمييز' : 'تمييز'}"><i data-lucide="star" class="w-3.5 h-3.5"></i></button>
                        <button onclick="App.adminDeletePlace('${p.id}')" class="p-1.5 rounded-lg bg-gray-100 text-red-500 hover:bg-red-100" title="حذف"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
                      </div>
                    </td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
        ` : ''}
      </div>
    </section>`;
  },

  // ====== Admin Ads Tab ======
  renderAdminAds() {
    const ads = Ads.getAll();
    const adStats = Ads.getStats();
    return `
    <div class="space-y-4">
      <!-- Ads Stats -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div class="bg-white rounded-xl p-3 border border-gray-100 text-center"><div class="text-lg font-bold text-gray-900">${adStats.total}</div><div class="text-[10px] text-gray-500">إجمالي</div></div>
        <div class="bg-white rounded-xl p-3 border border-gray-100 text-center"><div class="text-lg font-bold text-green-600">${adStats.active}</div><div class="text-[10px] text-gray-500">نشط</div></div>
        <div class="bg-white rounded-xl p-3 border border-gray-100 text-center"><div class="text-lg font-bold text-gray-400">${adStats.inactive}</div><div class="text-[10px] text-gray-500">متوقف</div></div>
        <div class="bg-white rounded-xl p-3 border border-gray-100 text-center"><div class="text-lg font-bold text-blue-600">${adStats.totalViews}</div><div class="text-[10px] text-gray-500">مشاهدات</div></div>
        <div class="bg-white rounded-xl p-3 border border-gray-100 text-center"><div class="text-lg font-bold text-yellow-600">${adStats.totalClicks}</div><div class="text-[10px] text-gray-500">نقرات</div></div>
      </div>

      <!-- Add Ad Button -->
      <button onclick="App.showAdForm=true;App.render()" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center gap-2"><i data-lucide="plus" class="w-4 h-4"></i>إضافة إعلان جديد</button>

      <!-- Ad Form -->
      ${this.showAdForm ? this.renderAdForm() : ''}

      <!-- Ads List -->
      ${ads.length > 0 ? `
      <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-3 py-2.5 text-right font-medium text-gray-500">الصورة</th>
                <th class="px-3 py-2.5 text-right font-medium text-gray-500">الاسم</th>
                <th class="px-3 py-2.5 text-right font-medium text-gray-500">الموضع</th>
                <th class="px-3 py-2.5 text-right font-medium text-gray-500">المقاس</th>
                <th class="px-3 py-2.5 text-right font-medium text-gray-500">الصور</th>
                <th class="px-3 py-2.5 text-right font-medium text-gray-500">المشاهدات</th>
                <th class="px-3 py-2.5 text-right font-medium text-gray-500">النقرات</th>
                <th class="px-3 py-2.5 text-right font-medium text-gray-500">الحالة</th>
                <th class="px-3 py-2.5 text-right font-medium text-gray-500">الإجراءات</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              ${ads.map(ad => `
                <tr class="hover:bg-gray-50">
                  <td class="px-3 py-2.5"><img src="${ad.images && ad.images[0] ? ad.images[0] : ''}" class="w-12 h-8 object-cover rounded" alt=""></td>
                  <td class="px-3 py-2.5 font-medium text-gray-900">${ad.title || '-'}</td>
                  <td class="px-3 py-2.5 text-gray-600">${Ads.positions.find(p => p.id === ad.position)?.name || '-'}</td>
                  <td class="px-3 py-2.5 text-gray-600">${Ads.sizes.find(s => s.id === ad.size)?.name || '-'}</td>
                  <td class="px-3 py-2.5 text-gray-600">${ad.images ? ad.images.length : 0}</td>
                  <td class="px-3 py-2.5 text-gray-600">${ad.views || 0}</td>
                  <td class="px-3 py-2.5 text-gray-600">${ad.clicks || 0}</td>
                  <td class="px-3 py-2.5">
                    <button onclick="Ads.toggleActive('${ad.id}');App.render()" class="px-2 py-0.5 rounded text-[10px] font-medium ${ad.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}">${ad.isActive ? 'نشط' : 'متوقف'}</button>
                  </td>
                  <td class="px-3 py-2.5">
                    <div class="flex items-center gap-1">
                      <button onclick="App.editAd='${ad.id}';App.showAdForm=true;App.render()" class="p-1.5 rounded-lg bg-gray-100 text-blue-500 hover:bg-blue-100" title="تعديل"><i data-lucide="pencil" class="w-3.5 h-3.5"></i></button>
                      <button onclick="if(confirm('حذف الإعلان؟')){Ads.delete('${ad.id}');App.render()}" class="p-1.5 rounded-lg bg-gray-100 text-red-500 hover:bg-red-100" title="حذف"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      ` : '<div class="text-center py-8 text-gray-400 bg-white rounded-xl border border-gray-100"><i data-lucide="megaphone" class="w-12 h-12 mx-auto mb-2 text-gray-300"></i><br>لا توجد إعلانات</div>'}
    </div>`;
  },

  showAdForm: false,
  editAd: null,
  adFormImages: [],

  renderAdForm() {
    const ad = this.editAd ? Ads.getAll().find(a => a.id === this.editAd) : null;
    return `
    <div class="bg-white rounded-xl p-4 md:p-6 border border-gray-100">
      <h3 class="text-sm font-bold mb-4 flex items-center gap-2"><i data-lucide="megaphone" class="w-5 h-5 text-blue-600"></i>${ad ? 'تعديل الإعلان' : 'إضافة إعلان جديد'}</h3>
      <div class="space-y-3">
        <div><label class="block text-xs font-medium text-gray-700 mb-1">اسم الإعلان</label><input type="text" id="adTitle" value="${ad ? ad.title : ''}" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm" placeholder="مثال:عرض خاص على الملابس"></div>
        <div><label class="block text-xs font-medium text-gray-700 mb-1">الوصف (اختياري)</label><textarea id="adDesc" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm" rows="2" placeholder="وصف الإعلان...">${ad ? ad.description || '' : ''}</textarea></div>
        <div><label class="block text-xs font-medium text-gray-700 mb-1">رابط الإعلان (URL)</label><input type="url" id="adUrl" value="${ad ? ad.linkUrl || '' : ''}" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm" placeholder="https://example.com"></div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="block text-xs font-medium text-gray-700 mb-1">مكان الظهور</label>
            <select id="adPosition" class="w-full py-2.5 text-xs">${Ads.positions.map(p => `<option value="${p.id}" ${ad && ad.position === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}</select>
          </div>
          <div><label class="block text-xs font-medium text-gray-700 mb-1">المقاس</label>
            <select id="adSize" class="w-full py-2.5 text-xs">${Ads.sizes.map(s => `<option value="${s.id}" ${ad && ad.size === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}</select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="block text-xs font-medium text-gray-700 mb-1">تاريخ النشر (اختياري)</label><input type="datetime-local" id="adPublish" value="${ad && ad.publishDate ? ad.publishDate.slice(0,16) : ''}" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm"></div>
          <div><label class="block text-xs font-medium text-gray-700 mb-1">تاريخ الانتهاء (اختياري)</label><input type="datetime-local" id="adExpire" value="${ad && ad.expireDate ? ad.expireDate.slice(0,16) : ''}" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm"></div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="block text-xs font-medium text-gray-700 mb-1">مدة السلايدر (مللي ثانية)</label><input type="number" id="adSliderDuration" value="${ad ? ad.sliderDuration || 4000 : 4000}" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm" min="1000" step="500"></div>
          <div class="flex items-end"><label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="adActive" ${!ad || ad.isActive ? 'checked' : ''} class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"><span class="text-xs font-medium text-gray-700">الإعلان نشط</span></label></div>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">صور الإعلان (يمكن رفع أكثر من صورة)</label>
          <input type="file" id="adImages" accept="image/*" multiple onchange="App.handleAdImageUpload(this.files)" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm">
          <div id="adImagePreview" class="flex flex-wrap gap-2 mt-2">
            ${ad && ad.images ? ad.images.map((img, i) => `<div class="relative"><img src="${img}" class="w-16 h-16 object-cover rounded-lg border"><button onclick="App.removeAdImage(${i})" class="absolute -top-1 -left-1 w-4 h-4 bg-red-500 text-white rounded-full text-[8px] flex items-center justify-center">x</button></div>`).join('') : ''}
          </div>
        </div>
        <div class="flex gap-2">
          <button onclick="App.saveAd()" class="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center gap-1"><i data-lucide="save" class="w-4 h-4"></i>${ad ? 'حفظ التعديلات' : 'إضافة الإعلان'}</button>
          <button onclick="App.showAdForm=false;App.editAd=null;App.adFormImages=[];App.render()" class="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg text-xs font-semibold hover:bg-gray-200">إلغاء</button>
        </div>
      </div>
    </div>`;
  },

  async handleAdImageUpload(files) {
    const preview = document.getElementById('adImagePreview');
    for (const file of files) {
      const base64 = await Ads.compressImage(file, 1200);
      this.adFormImages.push(base64);
    }
    this.updateAdImagePreview();
  },

  updateAdImagePreview() {
    const preview = document.getElementById('adImagePreview');
    if (preview) {
      preview.innerHTML = this.adFormImages.map((img, i) => `<div class="relative"><img src="${img}" class="w-16 h-16 object-cover rounded-lg border"><button onclick="App.removeAdImage(${i})" class="absolute -top-1 -left-1 w-4 h-4 bg-red-500 text-white rounded-full text-[8px] flex items-center justify-center">x</button></div>`).join('');
    }
  },

  removeAdImage(index) {
    this.adFormImages.splice(index, 1);
    this.updateAdImagePreview();
  },

  saveAd() {
    const title = document.getElementById('adTitle').value;
    const description = document.getElementById('adDesc').value;
    const linkUrl = document.getElementById('adUrl').value;
    const position = document.getElementById('adPosition').value;
    const size = document.getElementById('adSize').value;
    const publishDate = document.getElementById('adPublish').value;
    const expireDate = document.getElementById('adExpire').value;
    const sliderDuration = parseInt(document.getElementById('adSliderDuration').value) || 4000;
    const isActive = document.getElementById('adActive').checked;

    const adData = { title, description, linkUrl, position, size, publishDate: publishDate || null, expireDate: expireDate || null, sliderDuration, isActive, images: this.adFormImages };

    if (this.editAd) {
      Ads.update(this.editAd, adData);
    } else {
      Ads.add(adData);
    }

    this.showAdForm = false;
    this.editAd = null;
    this.adFormImages = [];
    this.render();
  },

  // Admin Actions
  adminTab: 'users',
  adminToggleVerify(userId) { Admin.toggleVerify(userId); this.render(); },
  adminToggleSuspend(userId) { Admin.toggleSuspend(userId); this.render(); },
  adminDeleteUser(userId) { if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) { Admin.deleteUser(userId); this.render(); } },
  adminToggleVerifyPlace(placeId) { Admin.verifyPlace(placeId); this.render(); },
  adminToggleFeature(placeId) { Admin.featurePlace(placeId); this.render(); },
  adminDeletePlace(placeId) { if (confirm('هل أنت متأكد من حذف هذا المكان؟')) { Admin.deletePlaceAdmin(placeId); this.render(); } }
};

document.addEventListener('DOMContentLoaded', () => App.init());
