// =============================================
// التطبيق الرئيسي - Main App (أيقونات Lucide احترافية)
// =============================================

const App = {
  currentView: 'home', searchQuery: '', selectedCategory: null, selectedSubCategory: null, selectedCity: null, _selectedRating: 0, _initialized: false,

  async init() {
    if (this._initialized) return;
    this._initialized = true;
    try {
      this.initDarkMode();
      this.initLang();
      // Render immediately with default data - no loading screen
      this.render();
      window.addEventListener('hashchange', () => this.handleRoute());
      this.handleRoute();

      // Load Firebase data in background (non-blocking)
      Auth.init().then(() => {
        Admin.initDefaultAdmin().catch(() => {});
        return Data.preloadAll();
      }).then(() => {
        Admin.refreshUnreadCount().catch(() => {});
        return Promise.all([
          Offers.getAll().catch(() => {}),
          Jobs.getAll().catch(() => {}),
          Events.getAll().catch(() => {}),
          Pricing.getAll().catch(() => {})
        ]);
      }).then(() => {
        this.render(); // Re-render with loaded data
        this.handleRoute();
      }).catch(e => {
        console.warn('Background data load:', e.message);
      });

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
    } catch (e) {
      this._initialized = false;
      throw e;
    }
  },

  handleRoute() {
    const hash = location.hash.slice(1) || 'home';
    const [view, ...params] = hash.split('/');
    this.currentView = view;
    if (view === 'place' && params[0]) this.showPlace(params[0]);
    else if (view === 'offer' && params[0]) this.showItemDetail(params[0], 'offer');
    else if (view === 'job' && params[0]) this.showItemDetail(params[0], 'job');
    else if (view === 'event' && params[0]) this.showItemDetail(params[0], 'event');
    else if (view === 'category' && params[0]) { this.selectedCategory = params[0]; this.selectedCity = null; this.currentView = 'category'; this.render(); }
    else if (view === 'subcategory' && params[0]) { this.selectedCategory = params[0]; this.selectedSubCategory = params[1]; this.selectedCity = null; this.currentView = 'subcategory'; this.render(); }
    else if (view === 'city' && params[0]) { this.selectedCity = params[0]; this.currentView = 'search'; this.render(); }
    else this.render();
  },

  // Dark mode helper
  C(light, dark) { return document.documentElement.classList.contains('dark') ? dark : light; },

  render() {
    try {
      const app = document.getElementById('app');
      const user = Auth.currentUser;
      const bg = this.C('bg-gray-50', 'bg-dark-950');
      app.innerHTML = `<div class="min-h-screen ${bg}">${this.renderHeader(user)}${Ads.renderPosition('header')}<main class="fade-in pb-20 md:pb-0">${this['render_' + this.currentView]?.() || ''}</main>${this.renderFooter()}${this.renderBottomNav(user)}</div>`;
      this.initIcons();
      this.initAllCustomSelects();
      Ads.initAllSliders();
      // Initialize map on add page with delay for DOM rendering
      if (this.currentView === 'add') {
        this.placeMap = null;
        this.placeMarker = null;
        setTimeout(() => this.initPlaceMap(), 500);
        setTimeout(() => this.initPlaceMap(), 1500);
      }
      // Scroll to top on navigation
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.error('Render error:', e);
      const payload = ErrorTracker.normalize(e, {
        operation: `app.render.${this.currentView || 'unknown'}`,
        code: e.code || 'APP-RENDER-FAILED',
        userMessage: 'تعذر عرض هذه الصفحة حالياً'
      });
      ErrorTracker.writeLog(payload);
      document.getElementById('app').innerHTML = ErrorTracker.buildErrorCard(payload, {
        title: 'تعذر عرض الصفحة',
        message: 'تعذر عرض هذه الصفحة حالياً',
        action: "location.hash='home';location.reload()",
        actionLabel: 'العودة للرئيسية'
      });
    }
  },

  initIcons() { try { lucide.createIcons(); } catch(e) { ErrorTracker.capture(e, { operation: 'app.icons.init', source: 'app_ui' }); } },

  // Mobile Search Toggle
  toggleMobileSearch() {
    const bar = document.getElementById('mobileSearchBar');
    if (bar) {
      bar.classList.toggle('hidden');
      if (!bar.classList.contains('hidden')) {
        const input = document.getElementById('mobileSearchInput');
        if (input) input.focus();
      }
    }
  },

  // Mobile Bottom Navigation
  renderBottomNav(user) {
    const current = this.currentView;
    return `
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-dark-900 border-t border-gray-200 dark:border-dark-700 safe-area-bottom bottom-nav-shadow">
      <div class="flex items-center justify-around px-2 py-1">
        <a href="#home" class="bottom-nav-item ${current === 'home' ? 'active' : ''}">
          <i data-lucide="home" class="bottom-nav-icon"></i>
          <span class="bottom-nav-label">الرئيسية</span>
        </a>
        <a href="#offers" class="bottom-nav-item ${current === 'offers' ? 'active' : ''}">
          <i data-lucide="tag" class="bottom-nav-icon"></i>
          <span class="bottom-nav-label">العروض</span>
        </a>
        <a href="${user ? '#add' : '#signup'}" class="bottom-nav-item-add">
          <div class="bottom-nav-add-btn">
            <i data-lucide="plus" class="w-6 h-6"></i>
          </div>
          <span class="bottom-nav-label">${user ? 'إضافة' : 'سجّل'}</span>
        </a>
        <a href="#pricing" class="bottom-nav-item ${current === 'pricing' ? 'active' : ''}">
          <i data-lucide="trending-up" class="bottom-nav-icon"></i>
          <span class="bottom-nav-label">الأسعار</span>
        </a>
        <a href="${user ? '#profile' : '#login'}" class="bottom-nav-item ${current === 'profile' || current === 'myplaces' || current === 'favorites' || current === 'login' ? 'active' : ''}">
          <i data-lucide="user" class="bottom-nav-icon"></i>
          <span class="bottom-nav-label">${user ? 'حسابي' : 'دخول'}</span>
        </a>
      </div>
    </nav>`;
  },

  // Dark Mode
  initDarkMode() {
    const isDark = localStorage.getItem('dy_dark_mode') === 'true';
    if (isDark) document.documentElement.classList.add('dark');
  },
  toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('dy_dark_mode', isDark);
    this.render();
  },

  // Language
  initLang() {
    const lang = localStorage.getItem('dy_lang') || 'ar';
    Data.setLang(lang);
  },
  toggleLang() {
    Data.toggleLang();
    this.render();
  },

  // Image Upload
  placeImages: [],
  _uploadingImages: false,
  async handlePlaceImageUpload(files) {
    if (!files || files.length === 0) return;
    this._uploadingImages = true;
    this.updatePlaceImagePreview();
    try {
      const images = await Data.uploadPlaceImages(files, 800);
      this.placeImages.push(...images);
    } catch (error) {
      console.error('Image upload error:', error);
      this.showToast('فشل رفع الصورة. تأكد من تسجيل الدخول وحاول مجدداً.', 'error');
    } finally {
      this._uploadingImages = false;
      this.updatePlaceImagePreview();
    }
  },
  removePlaceImage(index) {
    this.placeImages.splice(index, 1);
    this.updatePlaceImagePreview();
  },
  updatePlaceImagePreview() {
    const preview = document.getElementById('placeImagePreview');
    if (!preview) return;
    if (this._uploadingImages) {
      preview.innerHTML = '<div class="flex items-center gap-2 text-blue-600 text-xs p-2"><div class="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>جاري رفع الصور...</div>';
      return;
    }
    preview.innerHTML = this.placeImages.map((img, i) => `
      <div class="relative">
        <img src="${img}" class="w-20 h-16 object-cover rounded-lg border" loading="lazy" alt="صورة">
        <button onclick="App.removePlaceImage(${i})" class="absolute -top-1.5 -left-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center">
          <i data-lucide="x" class="w-3 h-3"></i>
        </button>
      </div>
    `).join('');
    this.initIcons();
  },

  // Profile Image Upload
  async handleAvatarUpload(file) {
    await Auth.uploadAvatar(file);
    this.render();
  },

  // ====== HEADER ======
  renderHeader(user) {
    const isDark = document.documentElement.classList.contains('dark');
    const isAr = Data.currentLang === 'ar';
    const favCount = user ? (Data.getFavoritesSync ? Data.getFavoritesSync(user.id).length : 0) : 0;
    return `
    <!-- Mobile Top Header -->
    <header class="md:hidden bg-white dark:bg-dark-900 shadow-sm sticky top-0 z-50 border-b border-gray-100 dark:border-dark-700 safe-area-top">
      <div class="px-3 py-2 flex items-center justify-between gap-2">
        <a href="#home" class="flex items-center gap-2 shrink-0">
          <img src="assets/branding/logo-transparent.png?v=20260806204514" alt="${isAr ? 'شعار الدليل اليمني' : 'Yemen Guide'}" class="h-7 w-auto" fetchpriority="high">
        </a>
        <div class="flex items-center gap-1">
          <button onclick="App.toggleMobileSearch()" class="mobile-header-btn">
            <i data-lucide="search" class="w-5 h-5"></i>
          </button>
          ${user ? `<a href="#favorites" class="mobile-header-btn relative">
            <i data-lucide="heart" class="w-5 h-5"></i>
            ${favCount > 0 ? `<span class="absolute -top-0.5 -left-0.5 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">${favCount > 9 ? '9+' : favCount}</span>` : ''}
          </a>` : ''}
          <button onclick="App.toggleDarkMode()" class="mobile-header-btn">
            <i data-lucide="${isDark ? 'sun' : 'moon'}" class="w-5 h-5"></i>
          </button>
        </div>
      </div>
      <div id="mobileSearchBar" class="hidden px-3 pb-2">
        <div class="relative">
          <input type="text" id="mobileSearchInput" placeholder="${Data.t('searchPlaceholder')}" class="w-full px-3 py-2 pr-9 rounded-xl border border-gray-200 dark:border-dark-600 dark:bg-dark-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" oninput="App.onSearchInput(this.value)" autocomplete="off">
          <i data-lucide="search" class="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400"></i>
          <div id="headerSearchSuggestions" class="search-suggestions hidden"></div>
        </div>
      </div>
    </header>

    <!-- Desktop Header -->
    <header class="hidden md:block bg-white dark:bg-dark-900 shadow-sm sticky top-0 z-50 border-b border-gray-100 dark:border-dark-700">
      <div class="max-w-7xl mx-auto px-4 lg:px-6">
        <div class="flex items-center justify-between py-3 gap-6">
          <a href="#home" class="flex items-center gap-3 shrink-0">
            <img src="assets/branding/logo-transparent.png?v=20260806204514" alt="${isAr ? 'شعار الدليل اليمني' : 'Yemen Guide'}" class="brand-logo brand-logo-header" width="1024" height="559" fetchpriority="high">
          </a>
          <div class="flex-1 max-w-md">
            <div class="relative">
              <input type="text" id="headerSearch" placeholder="${Data.t('searchPlaceholder')}" class="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 dark:border-dark-600 dark:bg-dark-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" value="${this.searchQuery}" oninput="App.onSearchInput(this.value)" autocomplete="off">
              <i data-lucide="search" class="absolute right-3 top-3 w-4 h-4 text-gray-400"></i>
              <div id="headerSearchSuggestions" class="search-suggestions hidden"></div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="App.toggleDarkMode()" class="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700" title="${Data.t('darkMode')}">
              <i data-lucide="${isDark ? 'sun' : 'moon'}" class="w-4 h-4"></i>
            </button>
            <button onclick="App.toggleLang()" class="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 text-xs font-medium" title="${Data.t('language')}">
              ${isAr ? 'EN' : 'عربي'}
            </button>
            ${user ? `
              <a href="#favorites" class="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 relative" title="المفضلة">
                <i data-lucide="heart" class="w-4 h-4"></i>
                ${favCount > 0 ? `<span class="absolute top-0.5 left-0.5 bg-red-500 text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">${favCount > 9 ? '9+' : favCount}</span>` : ''}
              </a>
              <a href="#add" class="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-1.5 shadow-sm">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i>${isAr ? 'إضافة مكان' : 'Add Place'}
              </a>
              <div class="relative group">
                <button class="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700">
                  <img src="${user.avatar}" class="w-7 h-7 rounded-full" alt="">
                  <i data-lucide="chevron-down" class="w-3 h-3 text-gray-400"></i>
                </button>
                <div class="absolute left-0 top-full mt-1 bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-100 dark:border-dark-700 py-2 w-52 hidden group-hover:block z-50">
                  <div class="px-3 py-2 border-b border-gray-100 dark:border-dark-700">
                    <div class="font-medium text-sm text-gray-900 dark:text-white">${user.name}</div>
                    <div class="text-[11px] text-gray-400">${user.email}</div>
                  </div>
                  ${user.verified ? '<div class="flex items-center gap-1.5 px-3 py-1.5 text-xs text-green-600 bg-green-50 dark:bg-green-900/20"><i data-lucide="badge-check" class="w-3.5 h-3.5"></i>حساب موثّق</div>' : '<div class="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 bg-gray-50 dark:bg-dark-700"><i data-lucide="clock" class="w-3.5 h-3.5"></i>بانتظار التوثيق</div>'}
                  <hr class="my-1 border-gray-100 dark:border-dark-700">
                  <a href="#profile" class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700"><i data-lucide="user" class="w-4 h-4"></i>الملف الشخصي</a>
                  <a href="#myplaces" class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700"><i data-lucide="building-2" class="w-4 h-4"></i>مواقعي</a>
                  <a href="#favorites" class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700"><i data-lucide="heart" class="w-4 h-4"></i>المفضلة</a>
                  ${Admin.isAdmin() ? `<a href="admin.html" target="_blank" class="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium"><i data-lucide="shield" class="w-4 h-4"></i>لوحة التحكم</a>` : ''}
                  <hr class="my-1 border-gray-100 dark:border-dark-700">
                  <button onclick="Auth.logout()" class="w-full flex items-center gap-2 text-right px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><i data-lucide="log-out" class="w-4 h-4"></i>تسجيل الخروج</button>
                </div>
              </div>
            ` : `
              <a href="#login" class="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700">${isAr ? 'دخول' : 'Login'}</a>
              <a href="#signup" class="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm">${isAr ? 'حساب جديد' : 'Sign Up'}</a>
            `}
          </div>
        </div>
        <nav class="flex items-center gap-1 pb-2 -mb-px overflow-x-auto">
          <a href="#home" class="desktop-nav-link ${this.currentView === 'home' ? 'active' : ''}"><i data-lucide="home" class="w-3.5 h-3.5"></i>${isAr ? 'الرئيسية' : 'Home'}</a>
          <a href="#offers" class="desktop-nav-link ${this.currentView === 'offers' ? 'active' : ''}"><i data-lucide="tag" class="w-3.5 h-3.5"></i>${isAr ? 'العروض' : 'Offers'}</a>
          <a href="#jobs" class="desktop-nav-link ${this.currentView === 'jobs' ? 'active' : ''}"><i data-lucide="briefcase" class="w-3.5 h-3.5"></i>${isAr ? 'الوظائف' : 'Jobs'}</a>
          <a href="#events" class="desktop-nav-link ${this.currentView === 'events' ? 'active' : ''}"><i data-lucide="calendar" class="w-3.5 h-3.5"></i>${isAr ? 'الفعاليات' : 'Events'}</a>
          <a href="#pricing" class="desktop-nav-link ${this.currentView === 'pricing' ? 'active' : ''}"><i data-lucide="trending-up" class="w-3.5 h-3.5"></i>${isAr ? 'التسعيرات' : 'Pricing'}</a>
          <a href="#search" class="desktop-nav-link ${this.currentView === 'search' ? 'active' : ''}"><i data-lucide="search" class="w-3.5 h-3.5"></i>${isAr ? 'البحث' : 'Search'}</a>
        </nav>
      </div>
    </header>`;
  },

  // ====== HOME ======
  render_home() {
    const stats = Data.getStatsSync();
    const places = Data.getApprovedPlacesSync();
    const featured = places.filter(p => p.featured || p.verified).slice(0, 8);
    const latest = places.slice(0, 8);
    const offersCount = Offers.getAllSync().length;
    const eventsCount = Events.getAllSync().length;
    const jobsCount = Jobs.getAllSync().length;
    const pricingCount = Pricing.getAllSync().length;
    const latestOffers = Offers.getActiveSync().slice(0, 4);
    const latestJobs = Jobs.getActiveSync().slice(0, 4);
    const latestEvents = Events.getActiveSync().slice(0, 4);

    return `
    <section class="hero-section bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white py-4 md:py-10 relative overflow-hidden">
      <div class="absolute inset-0 opacity-10"><div class="absolute top-10 right-10 w-48 h-48 bg-white rounded-full blur-3xl"></div><div class="absolute bottom-10 left-10 w-64 h-64 bg-yellow-500 rounded-full blur-3xl"></div></div>
      <div class="max-w-7xl mx-auto px-3 md:px-4 text-center relative z-10">
        <h2 class="text-lg sm:text-2xl md:text-5xl font-bold mb-1.5 md:mb-3 px-2">الدليل اليمني التجاري</h2>
        <p class="hidden md:block text-sm md:text-lg text-blue-100 mb-4 max-w-xl mx-auto px-2">الدليل الشامل للأعمال والأماكن في جميع أنحاء اليمن</p>
        <div class="hero-search-wrap max-w-xl mx-auto relative px-1">
          <div class="flex bg-white rounded-lg md:rounded-xl shadow-2xl overflow-hidden items-stretch w-full">
            <input type="text" id="heroSearch" placeholder="ابحث عن مكان، خدمة، أو نشاط..." class="flex-1 min-w-0 px-3 md:px-4 py-2 md:py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none text-xs md:text-sm" oninput="App.onSearchInput(this.value)" autocomplete="off">
            <button onclick="App.doSearch()" class="shrink-0 bg-yellow-500 hover:bg-yellow-600 text-white px-3 md:px-5 font-semibold transition-colors text-xs md:text-sm flex items-center gap-1"><i data-lucide="search" class="w-3.5 h-3.5 md:w-4 md:h-4"></i>بحث</button>
          </div>
          <div id="searchSuggestions" class="search-suggestions hidden"></div>
        </div>
      </div>
    </section>

    <!-- Ad: Below Hero -->
    ${Ads.renderPosition('below_hero')}

    <section class="bg-white py-2 md:py-4 border-b">
      <div class="max-w-7xl mx-auto px-3 md:px-4 grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-3 text-center">
        <a href="#offers" class="hover:bg-gray-50 rounded-lg p-1 transition-colors"><div class="text-base md:text-2xl font-bold text-blue-600">${offersCount}+</div><div class="text-[9px] md:text-xs text-gray-500 flex items-center justify-center gap-0.5"><i data-lucide="tag" class="w-2.5 h-2.5 md:w-3 md:h-3"></i>عروض</div></a>
        <a href="#events" class="hover:bg-gray-50 rounded-lg p-1 transition-colors"><div class="text-base md:text-2xl font-bold text-blue-600">${eventsCount}+</div><div class="text-[9px] md:text-xs text-gray-500 flex items-center justify-center gap-0.5"><i data-lucide="calendar" class="w-2.5 h-2.5 md:w-3 md:h-3"></i>فعاليات</div></a>
        <a href="#jobs" class="hover:bg-gray-50 rounded-lg p-1 transition-colors"><div class="text-base md:text-2xl font-bold text-blue-600">${jobsCount}+</div><div class="text-[9px] md:text-xs text-gray-500 flex items-center justify-center gap-0.5"><i data-lucide="briefcase" class="w-2.5 h-2.5 md:w-3 md:h-3"></i>وظائف</div></a>
        <a href="#pricing" class="hover:bg-gray-50 rounded-lg p-1 transition-colors"><div class="text-base md:text-2xl font-bold text-blue-600">${pricingCount}+</div><div class="text-[9px] md:text-xs text-gray-500 flex items-center justify-center gap-0.5"><i data-lucide="trending-up" class="w-2.5 h-2.5 md:w-3 md:h-3"></i>تسعيرات</div></a>
      </div>
    </section>

    <section class="py-4 md:py-10">
      <div class="max-w-7xl mx-auto px-3">
        <h3 class="text-sm md:text-lg font-bold text-gray-900 mb-2 md:mb-4 flex items-center gap-2"><i data-lucide="grid-3x3" class="w-4 h-4 md:w-5 md:h-5 text-blue-600"></i>الأقسام الرئيسية</h3>
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-1.5 md:gap-3">
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

    <section class="bg-white py-4 md:py-10">
      <div class="max-w-7xl mx-auto px-3">
        <h3 class="text-sm md:text-lg font-bold text-gray-900 mb-2 md:mb-4 flex items-center gap-2"><i data-lucide="star" class="w-4 h-4 md:w-5 md:h-5 text-yellow-500"></i>أماكن مميزة</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">${featured.map(p => this.renderPlaceCard(p)).join('')}</div>
        <!-- Ad: Inside Places Grid -->
        ${Ads.renderPosition('inside_places')}
      </div>
    </section>

    ${latestOffers.length ? `<section class="bg-white py-4 md:py-10">
      <div class="max-w-7xl mx-auto px-3">
        <div class="flex items-center justify-between mb-2 md:mb-4"><h3 class="text-sm md:text-lg font-bold text-gray-900 flex items-center gap-2"><i data-lucide="tag" class="w-4 h-4 md:w-5 md:h-5 text-orange-500"></i>أحدث العروض</h3><a href="#offers" class="text-blue-600 text-xs font-medium hover:underline">عرض الكل</a></div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">${latestOffers.map(o => this.renderSectionCard(o, 'offer', '#f97316', 'tag')).join('')}</div>
      </div>
    </section>` : ''}
    ${latestJobs.length ? `<section class="bg-white py-4 md:py-10">
      <div class="max-w-7xl mx-auto px-3">
        <div class="flex items-center justify-between mb-2 md:mb-4"><h3 class="text-sm md:text-lg font-bold text-gray-900 flex items-center gap-2"><i data-lucide="briefcase" class="w-4 h-4 md:w-5 md:h-5 text-blue-500"></i>أحدث الوظائف</h3><a href="#jobs" class="text-blue-600 text-xs font-medium hover:underline">عرض الكل</a></div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">${latestJobs.map(j => this.renderSectionCard(j, 'job', '#3b82f6', 'briefcase')).join('')}</div>
      </div>
    </section>` : ''}
    ${latestEvents.length ? `<section class="bg-white py-4 md:py-10">
      <div class="max-w-7xl mx-auto px-3">
        <div class="flex items-center justify-between mb-2 md:mb-4"><h3 class="text-sm md:text-lg font-bold text-gray-900 flex items-center gap-2"><i data-lucide="calendar" class="w-4 h-4 md:w-5 md:h-5 text-green-500"></i>أحدث الفعاليات</h3><a href="#events" class="text-blue-600 text-xs font-medium hover:underline">عرض الكل</a></div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">${latestEvents.map(ev => this.renderSectionCard(ev, 'event', '#22c55e', 'calendar')).join('')}</div>
      </div>
    </section>` : ''}

    <section class="bg-white py-4 md:py-10">
      <div class="max-w-7xl mx-auto px-3">
        <h3 class="text-sm md:text-lg font-bold text-gray-900 mb-2 md:mb-4 flex items-center gap-2"><i data-lucide="clock" class="w-4 h-4 md:w-5 md:h-5 text-blue-600"></i>أحدث الأماكن</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">${latest.map(p => this.renderPlaceCard(p)).join('')}</div>
      </div>
    </section>

    <section class="bg-gradient-to-r from-yellow-500 to-yellow-600 py-5 md:py-10">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <h3 class="text-base md:text-2xl font-bold text-white mb-1 md:mb-2 flex items-center justify-center gap-2"><i data-lucide="plus-circle" class="w-5 h-5 md:w-6 md:h-6"></i>أضف مكانك مجاناً</h3>
        <p class="text-yellow-100 mb-3 md:mb-4 text-xs md:text-sm">سجّل عملك في دليل اليمن واحصل على المزيد من العملاء</p>
        <a href="${Auth.currentUser ? '#add' : '#signup'}" class="bg-white text-yellow-600 px-5 md:px-6 py-2 md:py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-xl inline-block text-xs md:text-sm">ابدأ الآن</a>
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
    const isFav = Auth.currentUser && Data.isFavoriteSync(Auth.currentUser.id, p.id);
    const catColor = cat ? cat.color : '#3b82f6';
    const hasImages = p.images && p.images.length > 0;
    return `
    <div class="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all cursor-pointer active-scale" onclick="location.hash='place/${p.id}'">
      <div class="h-28 md:h-36 relative flex items-center justify-center" style="background:linear-gradient(135deg, ${catColor}20, ${catColor}40)">
        ${hasImages ? `<img src="${p.images[0]}" alt="${p.name}" class="absolute inset-0 w-full h-full object-cover" loading="lazy" onerror="this.style.display='none'">` : `<div style="color:${catColor};opacity:0.3">${cat ? I(cat.icon, 'w-16 h-16 md:w-20 md:h-20') : I('map-pin', 'w-16 h-16')}</div>`}
        ${p.verified ? `<div class="absolute top-2 right-2 bg-green-500 text-white px-2 py-0.5 rounded text-[9px] font-medium flex items-center gap-0.5"><i data-lucide="check-circle" class="w-3 h-3"></i>موثّق</div>` : ''}
        ${p.featured ? `<div class="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-0.5 rounded text-[9px] font-medium flex items-center gap-0.5"><i data-lucide="star" class="w-3 h-3"></i></div>` : ''}
        ${p.images && p.images.length > 1 ? `<div class="absolute bottom-2 right-2 bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded flex items-center gap-0.5"><i data-lucide="image" class="w-3 h-3"></i>${p.images.length}</div>` : ''}
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
    const places = Data.getApprovedPlacesSync().filter(p => p.category === cat.id);
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
              return `<a href="#subcategory/${cat.id}/${sub.id}" class="subcategory-grid-item">
                <div class="subcategory-grid-item-icon">${IBS(sub.icon, cat.color)}</div>
                <div class="subcategory-grid-item-name">${sub.name}</div>
                <div class="subcategory-grid-item-count">${count} مكان</div>
              </a>`;
            }).join('')}
          </div>
        </div>
        <h3 class="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5"><i data-lucide="map-pin" class="w-4 h-4 text-blue-600"></i>جميع الأماكن (${places.length})</h3>
        <div class="mb-4">
          <div class="custom-select-wrapper" style="max-width:280px;">
            <select id="catCityFilter" onchange="App.filterCity(this.value)" style="position:absolute;opacity:0;pointer-events:none;">
              <option value="">جميع المدن</option>
              ${Data.cities.map(c => { const count = places.filter(p => p.city === c.id).length; if (!count) return ''; return `<option value="${c.id}" ${this.selectedCity===c.id?'selected':''}>${c.name} (${count})</option>`; }).join('')}
            </select>
          </div>
        </div>
        ${places.length ? `<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">${places.filter(p => !this.selectedCity || p.city === this.selectedCity).map(p => this.renderPlaceCard(p)).join('')}</div>` : '<div class="text-center py-8 text-gray-400 bg-white rounded-xl border border-gray-100 text-sm">لا توجد أماكن بعد</div>'}
      </div>
    </section>`;
  },

  // ====== SUBCATEGORY PAGE ======
  render_subcategory() {
    const subInfo = Data.getSubCategory(this.selectedSubCategory);
    if (!subInfo) return '<div class="text-center py-12 text-gray-400">القسم غير موجود</div>';
    const cat = subInfo.parent;
    const places = Data.getApprovedPlacesSync().filter(p => p.subcategory === this.selectedSubCategory);
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
        <div class="mb-4">
          <div class="custom-select-wrapper" style="max-width:280px;">
            <select id="subCityFilter" onchange="App.filterCity(this.value)" style="position:absolute;opacity:0;pointer-events:none;">
              <option value="">جميع المدن</option>
              ${Data.cities.map(c => { const count = places.filter(p => p.city === c.id).length; if (!count) return ''; return `<option value="${c.id}" ${this.selectedCity===c.id?'selected':''}>${c.name} (${count})</option>`; }).join('')}
            </select>
          </div>
        </div>
        ${places.length ? `<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">${places.filter(p => !this.selectedCity || p.city === this.selectedCity).map(p => this.renderPlaceCard(p)).join('')}</div>` : '<div class="text-center py-8 text-gray-400 bg-white rounded-xl border border-gray-100 text-sm">لا توجد أماكن</div>'}
      </div>
    </section>`;
  },

  filterCity(id) { this.selectedCity = id || null; this.render(); },

  // ====== SEARCH ======
  render_search() {
    const results = Data.searchSync(this.searchQuery, this.selectedCategory, this.selectedSubCategory, this.selectedCity);
    return `
    <section class="py-6 md:py-8">
      <div class="max-w-7xl mx-auto px-3">
        <div class="bg-white rounded-xl p-3 mb-4 border border-gray-100">
          <div class="flex flex-col gap-2">
            <div class="relative">
              <input type="text" id="searchInput" value="${this.searchQuery}" placeholder="ابحث عن مكان أو خدمة..." class="w-full px-3 py-2.5 pr-9 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" oninput="App.onSearchInput(this.value)" autocomplete="off">
              <i data-lucide="search" class="absolute right-2.5 top-3 w-4 h-4 text-gray-400"></i>
              <div id="searchSuggestions" class="search-suggestions hidden"></div>
            </div>
            <div class="flex flex-col sm:flex-row gap-2">
              <div class="flex-1 custom-select-wrapper"><select id="searchCat" style="position:absolute;opacity:0;pointer-events:none;"><option value="">جميع الأقسام</option>${Data.categories.map(c => `<option value="${c.id}" ${this.selectedCategory===c.id?'selected':''}>${c.name}</option>`).join('')}</select></div>
              <div class="flex-1 custom-select-wrapper"><select id="searchCity" style="position:absolute;opacity:0;pointer-events:none;"><option value="">جميع المدن</option>${Data.cities.map(c => `<option value="${c.id}" ${this.selectedCity===c.id?'selected':''}>${c.name}</option>`).join('')}</select></div>
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
    const place = Data.getPlacesSync().find(p => p.id === pid);
    if (!place) { location.hash = 'home'; return; }
    place.views = (place.views || 0) + 1; Data.incrementViews(pid);
    const cat = Data.categories.find(c => c.id === place.category);
    const sub = place.subcategory ? Data.getSubCategory(place.subcategory) : null;
    const city = Data.cities.find(c => c.id === place.city);
    const reviews = Data.getReviewsSync(place.id);
    const isFav = Auth.currentUser && Data.isFavoriteSync(Auth.currentUser.id, place.id);
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
          <div class="h-40 md:h-56 relative" style="background:linear-gradient(135deg, ${catColor}20, ${catColor}40)">
            ${place.images && place.images.length > 0 ? `
              <div id="placeGallery" class="relative w-full h-full">
                <img src="${place.images[0]}" alt="${place.name}" class="w-full h-full object-cover" id="placeGalleryImg" onerror="this.style.display='none'">
                ${place.images.length > 1 ? `
                  <button onclick="App.galleryPrev()" class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors z-10"><i data-lucide="chevron-left" class="w-5 h-5"></i></button>
                  <button onclick="App.galleryNext()" class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors z-10"><i data-lucide="chevron-right" class="w-5 h-5"></i></button>
                  <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    ${place.images.map((_, i) => `<button onclick="App.galleryGoTo(${i})" class="w-2 h-2 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/50'}" data-gallery-dot="${i}"></button>`).join('')}
                  </div>
                  <div class="absolute top-3 left-3 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full z-10"><span id="galleryCounter">1</span>/${place.images.length}</div>
                ` : ''}
              </div>
            ` : `
              <div class="flex items-center justify-center h-full">
                <div style="color:${catColor};opacity:0.2">${cat ? I(cat.icon, 'w-24 h-24') : I('map-pin', 'w-24 h-24')}</div>
              </div>
            `}
            ${place.verified ? `<div class="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 z-10"><i data-lucide="check-circle" class="w-3.5 h-3.5"></i>موثّق</div>` : ''}
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
            <!-- Action Buttons -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3 px-1">
              ${place.phone ? `<a href="tel:${place.phone}" class="bg-green-500 text-white py-2.5 rounded-lg text-center font-semibold hover:bg-green-600 text-xs flex items-center justify-center gap-1.5"><i data-lucide="phone" class="w-4 h-4"></i>اتصال</a>` : ''}
              ${place.whatsapp ? `<a href="https://wa.me/967${place.whatsapp}" target="_blank" class="bg-green-600 text-white py-2.5 rounded-lg text-center font-semibold hover:bg-green-700 text-xs flex items-center justify-center gap-1.5"><i data-lucide="message-circle" class="w-4 h-4"></i>واتساب</a>` : ''}
              ${place.email ? `<a href="mailto:${place.email}" class="bg-blue-500 text-white py-2.5 rounded-lg text-center font-semibold hover:bg-blue-600 text-xs flex items-center justify-center gap-1.5"><i data-lucide="mail" class="w-4 h-4"></i>إيميل</a>` : ''}
              ${place.address ? `<button onclick="window.open('https://maps.google.com/?q=${encodeURIComponent(place.address)}','_blank')" class="bg-gray-100 text-gray-700 py-2.5 rounded-lg text-center font-semibold hover:bg-gray-200 text-xs flex items-center justify-center gap-1.5"><i data-lucide="map" class="w-4 h-4"></i>خريطة</button>` : ''}
              <button onclick="App.sharePlace('${place.id}')" class="bg-blue-600 text-white py-2.5 rounded-lg text-center font-semibold hover:bg-blue-700 text-xs flex items-center justify-center gap-1.5"><i data-lucide="share-2" class="w-4 h-4"></i>مشاركة</button>
              <button onclick="App.copyPlaceLink('${place.id}')" class="bg-gray-100 text-gray-700 py-2.5 rounded-lg text-center font-semibold hover:bg-gray-200 text-xs flex items-center justify-center gap-1.5"><i data-lucide="copy" class="w-4 h-4"></i>نسخ الرابط</button>
            </div>
            <!-- Social Share Links -->
            <div class="flex flex-wrap gap-2 mb-4">
              <span class="text-xs text-gray-400">مشاركة عبر:</span>
              <a href="https://wa.me/?text=${encodeURIComponent(place.name + ' - الدليل اليمني التجاري\n' + location.origin + '/#place/' + place.id)}" target="_blank" class="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600" title="واتساب"><i data-lucide="message-circle" class="w-4 h-4"></i></a>
              <a href="https://t.me/share/url?url=${encodeURIComponent(location.origin + '/#place/' + place.id)}&text=${encodeURIComponent(place.name + ' - الدليل اليمني التجاري')}" target="_blank" class="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600" title="تيليجرام"><i data-lucide="send" class="w-4 h-4"></i></a>
              <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.origin + '/#place/' + place.id)}" target="_blank" class="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center hover:bg-blue-800" title="فيسبوك"><i data-lucide="facebook" class="w-4 h-4"></i></a>
              <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(place.name + ' - الدليل اليمني التجاري')}&url=${encodeURIComponent(location.origin + '/#place/' + place.id)}" target="_blank" class="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600" title="تويتر/X"><i data-lucide="twitter" class="w-4 h-4"></i></a>
              <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(location.origin + '/#place/' + place.id)}" target="_blank" class="w-8 h-8 rounded-full bg-blue-800 text-white flex items-center justify-center hover:bg-blue-900" title="لينكدإن"><i data-lucide="linkedin" class="w-4 h-4"></i></a>
            </div>
            ${place.address ? `<div class="bg-gray-50 rounded-lg p-3 mb-4 text-sm flex items-start gap-2"><i data-lucide="map-pin" class="w-4 h-4 text-gray-400 mt-0.5 shrink-0"></i><span>${place.address}</span></div>` : ''}
            
            <!-- ساعات العمل -->
            ${(place.openTime || place.closeTime || place.workDays) ? `
            <div class="bg-gray-50 rounded-lg p-3 mb-4">
              <h4 class="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5"><i data-lucide="clock" class="w-4 h-4 text-gray-500"></i>ساعات العمل</h4>
              <div class="space-y-1.5">
                ${place.openTime && place.closeTime ? `
                <div class="flex items-center gap-2 text-xs">
                  <i data-lucide="sunrise" class="w-3.5 h-3.5 text-orange-500"></i>
                  <span class="text-gray-600">يفتح: <strong>${place.openTime}</strong></span>
                  <i data-lucide="sunset" class="w-3.5 h-3.5 text-indigo-500"></i>
                  <span class="text-gray-600">يغلق: <strong>${place.closeTime}</strong></span>
                </div>` : ''}
                ${place.workDays && place.workDays.length > 0 ? `
                <div class="flex items-center gap-1.5 text-xs">
                  <i data-lucide="calendar-days" class="w-3.5 h-3.5 text-blue-500"></i>
                  <span class="text-gray-600">${place.workDays.join('، ')}</span>
                </div>` : ''}
              </div>
            </div>` : ''}
            
            <!-- Social Media Links -->
            ${(place.facebook || place.instagram || place.telegram || place.website) ? `
            <div class="flex flex-wrap gap-2 mb-4">
              ${place.facebook ? `<a href="${place.facebook}" target="_blank" class="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors" title="فيسبوك"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>` : ''}
              ${place.instagram ? `<a href="${place.instagram}" target="_blank" class="w-9 h-9 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center hover:bg-pink-100 transition-colors" title="انستجرام"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>` : ''}
              ${place.telegram ? `<a href="${place.telegram}" target="_blank" class="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center hover:bg-sky-100 transition-colors" title="تلجرام"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.504-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg></a>` : ''}
              ${place.website ? `<a href="${place.website}" target="_blank" class="w-9 h-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors" title="الموقع الإلكتروني"><i data-lucide="globe" class="w-5 h-5"></i></a>` : ''}
            </div>` : ''}
            
            <!-- Map Location -->
            ${(place.lat && place.lng) ? `
            <div class="mb-4">
              <h4 class="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5"><i data-lucide="map" class="w-4 h-4 text-gray-500"></i>الموقع على الخريطة</h4>
              <div id="placeDetailMap" class="rounded-xl overflow-hidden border border-gray-200" style="height:200px;"></div>
              <a href="https://www.google.com/maps?q=${place.lat},${place.lng}" target="_blank" class="mt-2 text-blue-600 text-xs flex items-center gap-1 hover:underline"><i data-lucide="external-link" class="w-3 h-3"></i>فتح في خرائط جوجل</a>
            </div>` : ''}
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
            <span class="text-[10px] text-gray-400 flex items-center gap-1 mt-1"><i data-lucide="clock" class="w-3 h-3"></i>${r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString('ar') : (r.createdAt ? new Date(r.createdAt).toLocaleDateString('ar') : '')}</span>
          </div>`).join('') : '<p class="text-gray-400 text-center py-4 text-xs">لا توجد مراجعات</p>'}
        </div>
      </div>
    </section>${this.renderFooter()}</div>`;
    this.initIcons();
    // Initialize gallery if images exist
    if (place.images && place.images.length > 0) { this.initGallery(place.images); }
    // Initialize map if coordinates exist
    if (place.lat && place.lng) {
      setTimeout(() => {
        if (typeof L === 'undefined') return;
        const mapEl = document.getElementById('placeDetailMap');
        if (mapEl) {
          try {
            const map = L.map('placeDetailMap').setView([parseFloat(place.lat), parseFloat(place.lng)], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap', maxZoom: 19 }).addTo(map);
            L.marker([parseFloat(place.lat), parseFloat(place.lng)]).addTo(map).bindPopup(place.name);
            setTimeout(() => map.invalidateSize(), 300);
          } catch (e) { console.error('Detail map error:', e); }
        }
      }, 500);
    }
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
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label class="block text-xs font-medium text-gray-700 mb-1">القسم الرئيسي *</label><div class="custom-select-wrapper"><select id="placeCategory" onchange="App.updateSubs()" style="position:absolute;opacity:0;pointer-events:none;"><option value="">اختر القسم</option>${Data.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select></div></div>
              <div><label class="block text-xs font-medium text-gray-700 mb-1">القسم الفرعي *</label><div class="custom-select-wrapper"><select id="placeSubCategory" style="position:absolute;opacity:0;pointer-events:none;"><option value="">اختر القسم الفرعي</option></select></div></div>
            </div>
            <div><label class="block text-xs font-medium text-gray-700 mb-1">المدينة *</label><div class="custom-select-wrapper"><select id="placeCity" style="position:absolute;opacity:0;pointer-events:none;"><option value="">اختر المدينة</option>${Data.cities.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select></div></div>
            <div><label class="block text-xs font-medium text-gray-700 mb-1">الوصف</label><textarea id="placeDesc" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm" rows="3" placeholder="وصف المكان..."></textarea></div>
            <div><label class="block text-xs font-medium text-gray-700 mb-1">العنوان</label><input type="text" id="placeAddress" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm" placeholder="الشارع، المدينة"></div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label class="block text-xs font-medium text-gray-700 mb-1">رقم الهاتف</label><input type="tel" id="placePhone" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm" placeholder="777123456"></div>
              <div><label class="block text-xs font-medium text-gray-700 mb-1">رقم واتساب</label><input type="tel" id="placeWhatsapp" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm" placeholder="777123456"></div>
            </div>
            <div><label class="block text-xs font-medium text-gray-700 mb-1">البريد الإلكتروني</label><input type="email" id="placeEmail" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm" placeholder="info@example.com"></div>
            
            <!-- ساعات العمل -->
            <div class="border-t border-gray-100 pt-3">
              <label class="block text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                <i data-lucide="clock" class="w-3.5 h-3.5 text-gray-500"></i>ساعات العمل <span class="text-gray-400 font-normal">(اختياري)</span>
              </label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] text-gray-500 mb-1">وقت الفتح</label>
                  <input type="time" id="placeOpenTime" class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none text-sm">
                </div>
                <div>
                  <label class="block text-[10px] text-gray-500 mb-1">وقت الإغلاق</label>
                  <input type="time" id="placeCloseTime" class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none text-sm">
                </div>
              </div>
              <div class="mt-2">
                <label class="block text-[10px] text-gray-500 mb-1">أيام العمل</label>
                <div class="flex flex-wrap gap-1.5">
                  ${['السبت','الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة'].map((day,i) => `
                    <label class="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" value="${day}" class="work-day-cb w-3.5 h-3.5 rounded border-gray-300 text-blue-600" ${i < 6 ? 'checked' : ''}>
                      <span class="text-[10px] text-gray-600">${day}</span>
                    </label>
                  `).join('')}
                </div>
              </div>
            </div>
            
            <!-- الموقع على الخريطة -->
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <i data-lucide="map-pin" class="w-3.5 h-3.5 text-gray-500"></i>الموقع على الخريطة <span class="text-gray-400 font-normal">(اختياري)</span>
              </label>
              <div id="placeMapContainer" class="rounded-xl overflow-hidden border border-gray-200" style="height:250px;position:relative;background:#f0fdf4;">
                <div id="placeMap" style="height:100%;width:100%;z-index:1;"></div>
                <div id="placeMapLoading" style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;background:#f9fafb;z-index:2;">
                  <div style="text-align:center;">
                    <div style="width:32px;height:32px;border:3px solid #e2e8f0;border-top-color:#3b82f6;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 8px;"></div>
                    <p style="color:#94a3b8;font-size:12px;">جاري تحميل الخريطة...</p>
                  </div>
                </div>
                <input type="hidden" id="placeLat">
                <input type="hidden" id="placeLng">
              </div>
              <p class="text-[10px] text-gray-400 mt-1 flex items-center gap-1"><i data-lucide="info" class="w-3 h-3"></i>انقر على الخريطة لوضع دبوس موقعك</p>
            </div>
            
            <!-- روابط التواصل الاجتماعي -->
            <div class="border-t border-gray-100 pt-3">
              <label class="block text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                <i data-lucide="link" class="w-3.5 h-3.5 text-gray-500"></i>روابط التواصل <span class="text-gray-400 font-normal">(اختياري)</span>
              </label>
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0"><svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></div>
                  <input type="url" id="placeFacebook" class="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none text-sm" placeholder="رابط صفحة فيسبوك">
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center flex-shrink-0"><svg class="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></div>
                  <input type="url" id="placeInstagram" class="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none text-sm" placeholder="رابط حساب انستجرام">
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0"><svg class="w-4 h-4 text-sky-600" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.504-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg></div>
                  <input type="url" id="placeTelegram" class="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none text-sm" placeholder="رابط حساب تلجرام">
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0"><i data-lucide="globe" class="w-4 h-4 text-green-600"></i></div>
                  <input type="url" id="placeWebsite" class="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none text-sm" placeholder="رابط الموقع الإلكتروني">
                </div>
              </div>
            </div>
            
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">صور المكان</label>
              <input type="file" id="placeImagesInput" accept="image/*" multiple onchange="App.handlePlaceImageUpload(this.files)" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm">
              <div id="placeImagePreview" class="flex flex-wrap gap-2 mt-2"></div>
            </div>
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
    // Update custom dropdown if exists
    const subWrapper = sub.closest('.custom-select-wrapper');
    if (subWrapper) {
      const options = subWrapper.querySelector('.custom-select-options');
      if (options) {
        options.innerHTML = '<div class="custom-select-option" data-value="">اختر القسم الفرعي</div>' + 
          (cat ? cat.subs.map(s => `<div class="custom-select-option" data-value="${s.id}">${s.name}</div>`).join('') : '');
        App.initCustomSelectOptions(subWrapper, sub);
      }
    }
  },

  // Custom Select Dropdown Component
  initCustomSelect(wrapper) {
    const select = wrapper.querySelector('select');
    if (!select) return;
    
    // Create trigger
    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';
    const selectedOption = select.options[select.selectedIndex];
    trigger.innerHTML = `<span class="${selectedOption.value ? '' : 'placeholder'}">${selectedOption.text}</span><svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
    
    // Create options container
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'custom-select-options';
    
    Array.from(select.options).forEach(opt => {
      const optDiv = document.createElement('div');
      optDiv.className = 'custom-select-option' + (opt.selected ? ' selected' : '');
      optDiv.dataset.value = opt.value;
      optDiv.textContent = opt.text;
      optionsDiv.appendChild(optDiv);
    });
    
    wrapper.appendChild(trigger);
    wrapper.appendChild(optionsDiv);
    
    // Toggle dropdown
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close other dropdowns
      document.querySelectorAll('.custom-select-options.show').forEach(d => {
        if (d !== optionsDiv) d.classList.remove('show');
      });
      document.querySelectorAll('.custom-select-trigger.open').forEach(t => {
        if (t !== trigger) t.classList.remove('open');
      });
      optionsDiv.classList.toggle('show');
      trigger.classList.toggle('open');
    });
    
    // Select option
    App.initCustomSelectOptions(wrapper, select);
    
    // Close on outside click
    document.addEventListener('click', () => {
      optionsDiv.classList.remove('show');
      trigger.classList.remove('open');
    });
  },

  initCustomSelectOptions(wrapper, select) {
    const optionsDiv = wrapper.querySelector('.custom-select-options');
    const trigger = wrapper.querySelector('.custom-select-trigger');
    if (!optionsDiv || !trigger) return;
    
    optionsDiv.querySelectorAll('.custom-select-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const value = opt.dataset.value;
        const text = opt.textContent;
        
        // Update select
        select.value = value;
        
        // Update trigger
        trigger.querySelector('span').textContent = text;
        trigger.querySelector('span').className = value ? '' : 'placeholder';
        
        // Update selected state
        optionsDiv.querySelectorAll('.custom-select-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        
        // Close dropdown
        optionsDiv.classList.remove('show');
        trigger.classList.remove('open');
        
        // Trigger change event
        select.dispatchEvent(new Event('change'));
      });
    });
  },

  initAllCustomSelects() {
    document.querySelectorAll('.custom-select-wrapper').forEach(wrapper => {
      if (!wrapper.querySelector('.custom-select-trigger')) {
        App.initCustomSelect(wrapper);
      }
    });
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
            <button id="googleLoginBtn" onclick="App.doGoogleLogin()" class="w-full bg-white border-2 border-gray-200 text-gray-700 py-2.5 rounded-lg font-bold hover:bg-gray-50 flex items-center justify-center gap-2 text-sm">
              <svg class="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              المتابعة باستخدام Google
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
            <button id="googleSignupBtn" onclick="App.doGoogleLogin()" class="w-full bg-white border-2 border-gray-200 text-gray-700 py-2.5 rounded-lg font-bold hover:bg-gray-50 flex items-center justify-center gap-2 text-sm">
              <svg class="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              المتابعة باستخدام Google
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
      <div class="bg-white rounded-xl overflow-hidden border border-gray-100">
        <!-- Cover Image -->
        <div class="h-32 bg-gradient-to-r from-blue-500 to-blue-700 relative">
          ${u.coverImage ? `<img src="${u.coverImage}" class="w-full h-full object-cover" alt="">` : ''}
          <label class="absolute bottom-2 right-2 bg-white/80 hover:bg-white text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1">
            <i data-lucide="camera" class="w-3.5 h-3.5"></i>تغيير الغلاف
            <input type="file" accept="image/*" onchange="Auth.uploadCover(this.files[0]).then(()=>App.render())" class="hidden">
          </label>
        </div>
        <div class="p-4 md:p-6 -mt-10">
          <!-- Avatar -->
          <div class="flex items-end gap-4 mb-5">
            <div class="relative">
              <img src="${u.avatar}" class="w-20 h-20 rounded-full border-4 border-white shadow-lg" alt="">
              <label class="absolute bottom-0 left-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700">
                <i data-lucide="camera" class="w-3.5 h-3.5 text-white"></i>
                <input type="file" accept="image/*" onchange="App.handleAvatarUpload(this.files[0])" class="hidden">
              </label>
            </div>
            <div>
              <h3 class="text-lg font-bold">${u.name}</h3>
              <p class="text-gray-500 text-xs">${u.email}</p>
              ${u.verified ? '<span class="inline-flex items-center gap-1 text-blue-600 text-xs font-medium"><i data-lucide="badge-check" class="w-3.5 h-3.5"></i>موثّق</span>' : '<span class="text-gray-400 text-xs">بانتظار التوثيق</span>'}
            </div>
          </div>
          <div class="space-y-3">
            <div><label class="block text-xs font-medium text-gray-700 mb-1">الاسم</label><input type="text" id="profileName" value="${u.name}" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm"></div>
            <div><label class="block text-xs font-medium text-gray-700 mb-1">الهاتف</label><input type="tel" id="profilePhone" value="${u.phone||''}" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm"></div>
            <div><label class="block text-xs font-medium text-gray-700 mb-1">نبذة عنك</label><textarea id="profileBio" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-sm" rows="2">${u.bio||''}</textarea></div>
            <button onclick="App.updateProfile()" class="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 text-sm flex items-center gap-2"><i data-lucide="save" class="w-4 h-4"></i>حفظ التعديلات</button>
          </div>
        </div>
      </div>
    </div></section>`;
  },

  render_myplaces() {
    if (!Auth.currentUser) return this.render_login();
    const my = Data.getPlacesSync().filter(p => p.owner === Auth.currentUser.id);
    return `<section class="py-6 md:py-8"><div class="max-w-7xl mx-auto px-3">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="building-2" class="w-5 h-5 text-blue-600"></i>مواقعي (${my.length})</h3>
        <a href="#add" class="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1"><i data-lucide="plus" class="w-3.5 h-3.5"></i>إضافة</a>
      </div>
      ${my.length ? `<div class="space-y-3">${my.map(p => {
        const cat = Data.categories.find(c => c.id === p.category);
        const city = Data.cities.find(c => c.id === p.city);
        const statusColors = { pending: 'bg-yellow-50 text-yellow-700 border-yellow-200', approved: 'bg-green-50 text-green-700 border-green-200', rejected: 'bg-red-50 text-red-700 border-red-200' };
        const statusLabels = { pending: '⏳ قيد المراجعة', approved: '✅ معتمد', rejected: '❌ مرفوض' };
        const status = p.status || 'approved';
        return `<div class="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h4 class="font-bold text-sm text-gray-900">${p.name}</h4>
              <span class="text-[10px] px-2 py-0.5 rounded-full border ${statusColors[status]}">${statusLabels[status]}</span>
            </div>
            <div class="flex items-center gap-2 text-xs text-gray-500">
              ${cat ? `<span>${cat.name}</span>` : ''}
              ${city ? `<span>• ${city.name}</span>` : ''}
            </div>
            ${p.adminNote ? `<p class="text-xs text-gray-500 mt-1">📝 ${p.adminNote}</p>` : ''}
          </div>
          <div class="flex gap-2">
            <a href="#place/${p.id}" class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><i data-lucide="eye" class="w-4 h-4"></i></a>
            ${status === 'rejected' ? `<button onclick="App.deletePlaceConfirm('${p.id}')" class="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center"><i data-lucide="trash-2" class="w-4 h-4"></i></button>` : ''}
          </div>
        </div>`;
      }).join('')}</div>` : '<div class="text-center py-8 text-gray-400 text-sm"><i data-lucide="building-2" class="w-12 h-12 mx-auto mb-2 text-gray-300"></i><br>لم تضف أي مكان<br><a href="#add" class="text-blue-600 font-medium">أضف مكانك الأول</a></div>'}
    </div></section>`;
  },

  render_favorites() {
    if (!Auth.currentUser) return this.render_login();
    const favs = Data.getFavoritesSync(Auth.currentUser.id);
    return `<section class="py-6 md:py-8"><div class="max-w-7xl mx-auto px-3">
      <h3 class="text-lg font-bold mb-4 flex items-center gap-2"><i data-lucide="heart" class="w-5 h-5 text-red-500"></i>المفضلة (${favs.length})</h3>
      ${favs.length ? `<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">${favs.map(p => this.renderPlaceCard(p)).join('')}</div>` : '<div class="text-center py-8 text-gray-400 text-sm"><i data-lucide="heart" class="w-12 h-12 mx-auto mb-2 text-gray-300"></i><br>لا توجد مفضلة</div>'}
    </div></section>`;
  },

  // ====== SECTION CARD (Offers/Jobs/Events) ======
  renderSectionCard(item, type, typeColor, typeIcon) {
    const subtitle = type === 'offer' ? (item.agentName || '') : type === 'job' ? (item.companyName || '') : (item.organizer || '');
    const startDate = item.startDate?.toDate ? item.startDate.toDate().toLocaleDateString('ar') : '';
    const endDate = item.endDate?.toDate ? item.endDate.toDate().toLocaleDateString('ar') : '';
    const dateStr = startDate && endDate ? `${startDate} - ${endDate}` : startDate || '';
    return `<div class="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all cursor-pointer active-scale" onclick="location.hash='${type}/${item.id}'">
      <div class="h-28 md:h-36 relative flex items-center justify-center" style="background:linear-gradient(135deg, ${typeColor}20, ${typeColor}40)">
        ${item.image ? `<img src="${item.image}" alt="${item.title || ''}" class="absolute inset-0 w-full h-full object-cover" loading="lazy" onerror="this.style.display='none'">` : `<i data-lucide="${typeIcon}" class="w-12 h-12 md:w-16 md:h-16" style="color:${typeColor};opacity:0.3"></i>`}
        ${item.isActive === false ? `<div class="absolute top-2 right-2 bg-red-500 text-white px-2 py-0.5 rounded text-[9px] font-medium">منتهي</div>` : ''}
      </div>
      <div class="p-2.5 md:p-3">
        <h4 class="font-bold text-gray-900 text-xs md:text-sm mb-1 truncate">${item.title || 'بدون عنوان'}</h4>
        ${subtitle ? `<p class="text-[10px] md:text-xs text-gray-500 truncate mb-1">${subtitle}</p>` : ''}
        ${dateStr ? `<p class="text-[9px] text-gray-400 flex items-center gap-0.5"><i data-lucide="calendar" class="w-2.5 h-2.5"></i>${dateStr}</p>` : ''}
      </div>
    </div>`;
  },

  // ====== OFFERS PAGE ======
  render_offers() {
    const offers = Offers.getActiveSync();
    return `<section class="py-6 md:py-8"><div class="max-w-7xl mx-auto px-3">
      <div class="flex items-center gap-2 text-xs text-gray-500 mb-4">
        <a href="#home" class="text-blue-600 hover:underline flex items-center gap-1"><i data-lucide="home" class="w-3 h-3"></i>الرئيسية</a>
        <i data-lucide="chevron-left" class="w-3 h-3"></i>
        <span class="text-gray-700 font-medium">العروض الترويجية</span>
      </div>
      <h2 class="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2"><i data-lucide="tag" class="w-6 h-6 text-orange-500"></i>العروض الترويجية</h2>
      ${offers.length ? `<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">${offers.map(o => this.renderSectionCard(o, 'offer', '#f97316', 'tag')).join('')}</div>` : '<div class="text-center py-12 text-gray-400"><i data-lucide="tag" class="w-16 h-16 mx-auto mb-3 text-gray-300"></i><br>لا توجد عروض حالياً</div>'}
    </div></section>`;
  },

  // ====== JOBS PAGE ======
  render_jobs() {
    const jobs = Jobs.getActiveSync();
    return `<section class="py-6 md:py-8"><div class="max-w-7xl mx-auto px-3">
      <div class="flex items-center gap-2 text-xs text-gray-500 mb-4">
        <a href="#home" class="text-blue-600 hover:underline flex items-center gap-1"><i data-lucide="home" class="w-3 h-3"></i>الرئيسية</a>
        <i data-lucide="chevron-left" class="w-3 h-3"></i>
        <span class="text-gray-700 font-medium">الوظائف</span>
      </div>
      <h2 class="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2"><i data-lucide="briefcase" class="w-6 h-6 text-blue-500"></i>الوظائف المتاحة</h2>
      ${jobs.length ? `<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">${jobs.map(j => this.renderSectionCard(j, 'job', '#3b82f6', 'briefcase')).join('')}</div>` : '<div class="text-center py-12 text-gray-400"><i data-lucide="briefcase" class="w-16 h-16 mx-auto mb-3 text-gray-300"></i><br>لا توجد وظائف حالياً</div>'}
    </div></section>`;
  },

  // ====== EVENTS PAGE ======
  render_events() {
    const events = Events.getActiveSync();
    return `<section class="py-6 md:py-8"><div class="max-w-7xl mx-auto px-3">
      <div class="flex items-center gap-2 text-xs text-gray-500 mb-4">
        <a href="#home" class="text-blue-600 hover:underline flex items-center gap-1"><i data-lucide="home" class="w-3 h-3"></i>الرئيسية</a>
        <i data-lucide="chevron-left" class="w-3 h-3"></i>
        <span class="text-gray-700 font-medium">الفعاليات</span>
      </div>
      <h2 class="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2"><i data-lucide="calendar" class="w-6 h-6 text-green-500"></i>الفعاليات</h2>
      ${events.length ? `<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">${events.map(ev => this.renderSectionCard(ev, 'event', '#22c55e', 'calendar')).join('')}</div>` : '<div class="text-center py-12 text-gray-400"><i data-lucide="calendar" class="w-16 h-16 mx-auto mb-3 text-gray-300"></i><br>لا توجد فعاليات حالياً</div>'}
    </div></section>`;
  },

  // ====== PRICING PAGE ======
  _pricingTab: 'currencies',
  render_pricing() {
    const categories = Pricing.categories;
    const activeTab = this._pricingTab || 'currencies';
    const items = Pricing.getByCategorySync(activeTab);
    const catInfo = Pricing.getCategoryInfo(activeTab);
    return `<section class="py-6 md:py-8"><div class="max-w-7xl mx-auto px-3">
      <div class="flex items-center gap-2 text-xs text-gray-500 mb-4">
        <a href="#home" class="text-blue-600 hover:underline flex items-center gap-1"><i data-lucide="home" class="w-3 h-3"></i>الرئيسية</a>
        <i data-lucide="chevron-left" class="w-3 h-3"></i>
        <span class="text-gray-700 font-medium">التسعيرات</span>
      </div>
      <h2 class="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2"><i data-lucide="trending-up" class="w-6 h-6 text-purple-500"></i>أسعار اليوم</h2>
      <div class="flex gap-2 mb-4 overflow-x-auto pb-2">
        ${categories.map(c => `<button onclick="App._pricingTab='${c.id}';App.render()" class="px-4 py-2.5 rounded-xl text-xs font-medium ${activeTab === c.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'} flex items-center gap-1.5 whitespace-nowrap"><i data-lucide="${c.icon}" class="w-3.5 h-3.5"></i>${c.name}</button>`).join('')}
      </div>
      <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div class="p-3 md:p-4 border-b border-gray-100">
          <p class="text-xs text-gray-500 flex items-center gap-1"><i data-lucide="clock" class="w-3.5 h-3.5"></i>آخر تحديث: <strong>${items.length && items[0]?.lastUpdated?.toDate ? items[0].lastUpdated.toDate().toLocaleDateString('ar') : 'غير محدد'}</strong></p>
        </div>
        ${items.length ? `<div class="overflow-x-auto"><table class="w-full text-xs">
          <thead class="bg-gray-50"><tr>
            <th class="px-3 py-3 text-right font-medium text-gray-500">العملة / الدولة</th>
            <th class="px-3 py-3 text-right font-medium text-gray-500">سعر الشراء</th>
            <th class="px-3 py-3 text-right font-medium text-gray-500">سعر البيع</th>
            <th class="px-3 py-3 text-right font-medium text-gray-500">المنطقة</th>
          </tr></thead>
          <tbody class="divide-y divide-gray-100">
            ${items.map(item => `<tr class="hover:bg-gray-50">
              <td class="px-3 py-3 font-medium text-gray-900">${item.name || item.currencyName || ''}</td>
              <td class="px-3 py-3 text-green-600 font-bold">${item.buyPrice || '-'}</td>
              <td class="px-3 py-3 text-red-600 font-bold">${item.sellPrice || '-'}</td>
              <td class="px-3 py-3 text-gray-500">${item.region || '-'}</td>
            </tr>`).join('')}
          </tbody></table></div>` : '<div class="text-center py-12 text-gray-400"><i data-lucide="trending-up" class="w-16 h-16 mx-auto mb-3 text-gray-300"></i><br>لا توجد أسعار في هذا القسم</div>'}
      </div>
    </div></section>`;
  },

  // ====== DETAIL PAGE (Offers/Jobs/Events) ======
  showItemDetail(id, type) {
    const store = type === 'offer' ? Offers : type === 'job' ? Jobs : Events;
    const typeName = type === 'offer' ? 'العرض' : type === 'job' ? 'الوظيفة' : 'الفعالية';
    const typeColor = type === 'offer' ? '#f97316' : type === 'job' ? '#3b82f6' : '#22c55e';
    const typeIcon = type === 'offer' ? 'tag' : type === 'job' ? 'briefcase' : 'calendar';
    const backLink = type === 'offer' ? '#offers' : type === 'job' ? '#jobs' : '#events';
    const subtitle = type === 'offer' ? 'الوكيل' : type === 'job' ? 'الشركة' : 'جهة التنظيم';
    const subtitleVal = type === 'offer' ? (store.getAllSync().find(i=>i.id===id)?.agentName) : type === 'job' ? (store.getAllSync().find(i=>i.id===id)?.companyName) : (store.getAllSync().find(i=>i.id===id)?.organizer);

    store.getById(id).then(item => {
      if (!item) { this.showToast('العنصر غير موجود', 'error'); location.hash = backLink; return; }
      const startDate = item.startDate?.toDate ? item.startDate.toDate().toLocaleDateString('ar') : '';
      const endDate = item.endDate?.toDate ? item.endDate.toDate().toLocaleDateString('ar') : '';
      const app = document.getElementById('app');
      app.innerHTML = `<div class="min-h-screen bg-gray-50">${this.renderHeader(Auth.currentUser)}
      <section class="py-4 md:py-8"><div class="max-w-4xl mx-auto px-3">
        <div class="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <a href="#home" class="text-blue-600 hover:underline flex items-center gap-1"><i data-lucide="home" class="w-3 h-3"></i>الرئيسية</a>
          <i data-lucide="chevron-left" class="w-3 h-3"></i>
          <a href="${backLink}" class="text-blue-600 hover:underline">${typeName}</a>
        </div>
        <div class="bg-white rounded-xl overflow-hidden border border-gray-100">
          <div class="h-40 md:h-56 relative" style="background:linear-gradient(135deg, ${typeColor}20, ${typeColor}40)">
            ${item.image ? `<img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover">` : `<div class="flex items-center justify-center h-full"><i data-lucide="${typeIcon}" class="w-20 h-20" style="color:${typeColor};opacity:0.3"></i></div>`}
          </div>
          <div class="p-4 md:p-6">
            <h2 class="text-xl md:text-2xl font-bold text-gray-900 mb-2">${item.title || ''}</h2>
            ${subtitleVal ? `<p class="text-sm text-gray-500 mb-3 flex items-center gap-1"><i data-lucide="user" class="w-4 h-4"></i>${subtitle}: <strong>${subtitleVal}</strong></p>` : ''}
            ${item.description ? `<p class="text-gray-600 mb-4 text-sm leading-relaxed">${item.description}</p>` : ''}
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              ${startDate ? `<div class="bg-gray-50 rounded-lg p-2 text-xs"><span class="text-gray-400">يبدأ:</span> <strong>${startDate}</strong></div>` : ''}
              ${endDate ? `<div class="bg-gray-50 rounded-lg p-2 text-xs"><span class="text-gray-400">ينتهي:</span> <strong>${endDate}</strong></div>` : ''}
              ${item.location ? `<div class="bg-gray-50 rounded-lg p-2 text-xs flex items-center gap-1"><i data-lucide="map-pin" class="w-3 h-3 text-gray-400"></i>${item.location}</div>` : ''}
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              ${item.phone ? `<a href="tel:${item.phone}" class="bg-green-500 text-white py-2.5 rounded-lg text-center font-semibold hover:bg-green-600 text-xs flex items-center justify-center gap-1.5"><i data-lucide="phone" class="w-4 h-4"></i>اتصال</a>` : ''}
              ${item.whatsapp ? `<a href="https://wa.me/967${item.whatsapp}" target="_blank" class="bg-green-600 text-white py-2.5 rounded-lg text-center font-semibold hover:bg-green-700 text-xs flex items-center justify-center gap-1.5"><i data-lucide="message-circle" class="w-4 h-4"></i>واتساب</a>` : ''}
              <button onclick="App.shareItem('${item.id}','${type}')" class="bg-blue-600 text-white py-2.5 rounded-lg text-center font-semibold hover:bg-blue-700 text-xs flex items-center justify-center gap-1.5"><i data-lucide="share-2" class="w-4 h-4"></i>مشاركة</button>
            </div>
            ${(item.facebook || item.instagram || item.telegram || item.website) ? `
            <div class="flex flex-wrap gap-2">
              ${item.facebook ? `<a href="${item.facebook}" target="_blank" class="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>` : ''}
              ${item.instagram ? `<a href="${item.instagram}" target="_blank" class="w-9 h-9 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center hover:bg-pink-100"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>` : ''}
              ${item.telegram ? `<a href="${item.telegram}" target="_blank" class="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center hover:bg-sky-100"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.504-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg></a>` : ''}
              ${item.website ? `<a href="${item.website}" target="_blank" class="w-9 h-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100"><i data-lucide="globe" class="w-5 h-5"></i></a>` : ''}
            </div>` : ''}
          </div>
        </div>
      </div></section>${this.renderFooter()}</div>`;
      this.initIcons();
    });
  },

  shareItem(id, type) {
    const store = type === 'offer' ? Offers : type === 'job' ? Jobs : Events;
    const item = store.getAllSync().find(i => i.id === id);
    if (!item) return;
    const backLink = type === 'offer' ? 'offers' : type === 'job' ? 'jobs' : 'events';
    const shareUrl = location.origin + '/#' + type + '/' + id;
    const shareText = `${item.title}\nالدليل اليمني التجاري\n${shareUrl}`;
    if (navigator.share) {
      navigator.share({ title: item.title, text: shareText, url: shareUrl }).catch(() => {});
    } else {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).then(() => this.showToast('تم نسخ الرابط', 'success', 2000));
      }
    }
  },

  renderFooter() {
    return `<footer class="hidden md:block bg-gray-900 text-gray-300 py-6 mt-8">
      <div class="max-w-7xl mx-auto px-3">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div><div class="flex items-center gap-2 mb-2"><div class="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center"><span class="text-white font-bold text-sm">د</span></div><span class="text-white font-bold text-sm">الدليل اليمني التجاري</span></div><p class="text-xs text-gray-400">الدليل الشامل للأعمال والأماكن في اليمن</p></div>
          <div><h5 class="text-white font-semibold mb-2 text-sm">روابط سريعة</h5><ul class="space-y-1 text-xs"><li><a href="#home" class="hover:text-white text-gray-400 flex items-center gap-1"><i data-lucide="home" class="w-3 h-3"></i>الرئيسية</a></li><li><a href="#search" class="hover:text-white text-gray-400 flex items-center gap-1"><i data-lucide="search" class="w-3 h-3"></i>البحث</a></li><li><a href="#offers" class="hover:text-white text-gray-400 flex items-center gap-1"><i data-lucide="tag" class="w-3 h-3"></i>العروض</a></li><li><a href="#jobs" class="hover:text-white text-gray-400 flex items-center gap-1"><i data-lucide="briefcase" class="w-3 h-3"></i>الوظائف</a></li><li><a href="#events" class="hover:text-white text-gray-400 flex items-center gap-1"><i data-lucide="calendar" class="w-3 h-3"></i>الفعاليات</a></li><li><a href="#pricing" class="hover:text-white text-gray-400 flex items-center gap-1"><i data-lucide="trending-up" class="w-3 h-3"></i>التسعيرات</a></li><li><a href="#add" class="hover:text-white text-gray-400 flex items-center gap-1"><i data-lucide="plus" class="w-3 h-3"></i>أضف مكانك</a></li></ul></div>
          <div><h5 class="text-white font-semibold mb-2 text-sm">معلومات</h5><ul class="space-y-1 text-xs"><li><a href="about.html" class="hover:text-white text-gray-400 flex items-center gap-1"><i data-lucide="info" class="w-3 h-3"></i>من نحن</a></li><li><a href="privacy.html" class="hover:text-white text-gray-400 flex items-center gap-1"><i data-lucide="shield" class="w-3 h-3"></i>سياسة الخصوصية</a></li>${Auth.currentUser&&Auth.currentUser.role==='admin'?'<li><a href="admin.html" class="hover:text-white text-gray-400 flex items-center gap-1"><i data-lucide="settings" class="w-3 h-3"></i>لوحة التحكم</a></li>':''}</ul></div>
          <div><h5 class="text-white font-semibold mb-2 text-sm">تواصل معنا</h5><a href="https://wa.me/967777492635" target="_blank" class="text-xs text-gray-400 flex items-center gap-1 hover:text-green-400 transition-colors"><svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>واتساب: 777492635</a><p class="text-xs text-gray-400 flex items-center gap-1 mt-1"><i data-lucide="mail" class="w-3 h-3"></i>info@yemendirectory.net</p><p class="text-xs text-gray-400 flex items-center gap-1 mt-1"><i data-lucide="globe" class="w-3 h-3"></i>الدليل اليمني التجاري</p></div>
        </div>
        <div class="border-t border-gray-800 mt-4 pt-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <span>© 2024 الدليل اليمني التجاري. جميع الحقوق محفوظة.</span>
          <div class="flex gap-3"><a href="privacy.html" class="hover:text-white">سياسة الخصوصية</a><a href="about.html" class="hover:text-white">من نحن</a></div>
        </div>
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
        <button onclick="App.selectSuggestion('${s.type}', '${s.id}', '${s.catId || ''}')" class="suggestion-item">
          <div class="suggestion-icon">
            <i data-lucide="${s.icon}"></i>
          </div>
          <div class="suggestion-text">
            <div class="suggestion-title">${s.name}</div>
            <div class="suggestion-subtitle">${s.subtitle}</div>
          </div>
          <div class="suggestion-arrow">
            <i data-lucide="arrow-left"></i>
          </div>
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
  async doLogin() {
    const err = document.getElementById('loginError');
    try {
      await Auth.login(document.getElementById('loginEmail').value, document.getElementById('loginPassword').value);
      err.classList.add('hidden');
      location.hash = 'home';
      this.render();
    } catch (e) {
      err.querySelector('span').textContent = ErrorTracker.getInlineMessage(e);
      err.classList.remove('hidden');
      this.initIcons();
    }
  },
  async doSignup() {
    const err = document.getElementById('signupError');
    const n = document.getElementById('signupName').value, e = document.getElementById('signupEmail').value, p = document.getElementById('signupPhone').value, pw = document.getElementById('signupPassword').value;
    if (!n||!e||!pw) { err.querySelector('span').textContent = 'يرجى ملء الحقول المطلوبة'; err.classList.remove('hidden'); this.initIcons(); return; }
    if (pw.length < 6) { err.querySelector('span').textContent = 'كلمة المرور 6 أحرف على الأقل'; err.classList.remove('hidden'); this.initIcons(); return; }
    try {
      await Auth.signup(n, e, pw, p);
      err.classList.add('hidden');
      location.hash = 'home';
      this.render();
    } catch (x) {
      err.querySelector('span').textContent = ErrorTracker.getInlineMessage(x);
      err.classList.remove('hidden');
      this.initIcons();
    }
  },
  async doGoogleLogin() {
    const btn = document.getElementById('googleLoginBtn') || document.getElementById('googleSignupBtn');
    if (btn) {
      btn.disabled = true;
      btn.dataset.originalHtml = btn.innerHTML;
      btn.innerHTML = '<svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-opacity="1"/></svg> جاري تسجيل الدخول...';
      btn.style.opacity = '0.7';
      btn.style.pointerEvents = 'none';
    }
    try {
      const result = await Auth.loginWithGoogle();
      if (result && result.redirecting) return;
      location.hash = 'home';
      this.render();
    } catch (e) {
      const msg = ErrorTracker.getInlineMessage(e);
      if (msg && !msg.includes('تم إغلاق')) {
        const errEl = document.getElementById('loginError') || document.getElementById('signupError');
        if (errEl) {
          errEl.textContent = msg;
          errEl.classList.remove('hidden');
        } else {
          App.showToast(msg, 'error');
        }
      }
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = btn.dataset.originalHtml || btn.innerHTML;
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
      }
    }
  },
  // ====== IMAGE GALLERY ======
  _galleryImages: [],
  _galleryIndex: 0,
  initGallery(images) { this._galleryImages = images || []; this._galleryIndex = 0; },
  galleryGoTo(index) {
    if (!this._galleryImages.length) return;
    this._galleryIndex = index;
    const img = document.getElementById('placeGalleryImg');
    const counter = document.getElementById('galleryCounter');
    if (img) img.src = this._galleryImages[index];
    if (counter) counter.textContent = index + 1;
    document.querySelectorAll('[data-gallery-dot]').forEach((dot, i) => {
      dot.className = `w-2 h-2 rounded-full ${i === index ? 'bg-white' : 'bg-white/50'}`;
    });
  },
  galleryNext() { if (!this._galleryImages.length) return; this.galleryGoTo((this._galleryIndex + 1) % this._galleryImages.length); },
  galleryPrev() { if (!this._galleryImages.length) return; this.galleryGoTo((this._galleryIndex - 1 + this._galleryImages.length) % this._galleryImages.length); },

  // ====== TOAST NOTIFICATION SYSTEM ======
  showToast(message, type = 'success', duration = 3000) {
    document.querySelectorAll('.app-toast').forEach(t => t.remove());
    const colors = { success: { bg: 'bg-green-600', icon: 'check-circle', iconColor: 'text-green-200' }, error: { bg: 'bg-red-600', icon: 'alert-circle', iconColor: 'text-red-200' }, info: { bg: 'bg-blue-600', icon: 'info', iconColor: 'text-blue-200' }, warning: { bg: 'bg-yellow-600', icon: 'alert-triangle', iconColor: 'text-yellow-200' } };
    const config = colors[type] || colors.success;
    const toast = document.createElement('div');
    toast.className = 'app-toast fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] shadow-2xl';
    toast.style.cssText = 'animation: toastSlideUp 0.3s ease-out;';
    toast.innerHTML = `<div class="${config.bg} text-white px-5 py-3 rounded-2xl flex items-center gap-3 min-w-[280px] max-w-[90vw]" style="font-family:'Noto Kufi Arabic',sans-serif;box-shadow:0 20px 60px rgba(0,0,0,0.3);"><i data-lucide="${config.icon}" class="w-5 h-5 ${config.iconColor} shrink-0"></i><span class="text-sm font-medium flex-1">${message}</span><button onclick="this.closest('.app-toast').remove()" class="shrink-0 opacity-70 hover:opacity-100"><i data-lucide="x" class="w-4 h-4"></i></button></div>`;
    if (!document.getElementById('toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = '@keyframes toastSlideUp{from{opacity:0;transform:translate(-50%,20px)}to{opacity:1;transform:translate(-50%,0)}}';
      document.head.appendChild(style);
    }
    document.body.appendChild(toast);
    try { lucide.createIcons({ nodes: [toast] }); } catch(e) {}
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, duration);
  },

  // ====== MAP INITIALIZATION ======
  placeMap: null,
  placeMarker: null,
  
  initPlaceMap() {
    if (this.placeMap) return;
    const mapEl = document.getElementById('placeMap');
    if (!mapEl) return;
    if (typeof L === 'undefined') { console.warn('Leaflet not loaded, retrying...'); setTimeout(() => this.initPlaceMap(), 500); return; }
    try {
      this.placeMap = L.map('placeMap', { zoomControl: true, scrollWheelZoom: true }).setView([15.3694, 44.191], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap', maxZoom: 19 }).addTo(this.placeMap);
      this.placeMap.on('click', (e) => {
        const { lat, lng } = e.latlng;
        document.getElementById('placeLat').value = lat.toFixed(6);
        document.getElementById('placeLng').value = lng.toFixed(6);
        if (this.placeMarker) { this.placeMarker.setLatLng([lat, lng]); }
        else {
          this.placeMarker = L.marker([lat, lng], { draggable: true }).addTo(this.placeMap);
          this.placeMarker.on('dragend', (e) => { const pos = e.target.getLatLng(); document.getElementById('placeLat').value = pos.lat.toFixed(6); document.getElementById('placeLng').value = pos.lng.toFixed(6); });
        }
      });
      const hideLoading = () => { const el = document.getElementById('placeMapLoading'); if (el) el.style.display = 'none'; };
      setTimeout(() => { if (this.placeMap) { this.placeMap.invalidateSize(); hideLoading(); } }, 300);
      setTimeout(() => { if (this.placeMap) this.placeMap.invalidateSize(); }, 800);
      setTimeout(() => { if (this.placeMap) this.placeMap.invalidateSize(); }, 1500);
    } catch (e) {
      console.error('Map init error:', e);
      const loadingEl = document.getElementById('placeMapLoading');
      if (loadingEl) loadingEl.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#fef2f2;color:#dc2626;font-size:13px;padding:16px;text-align:center;"><p>تعذر تحميل الخريطة.<br>تأكد من اتصالك بالإنترنت.</p></div>';
    }
  },

  // ====== FORM VALIDATION ======
  validatePlaceForm() {
    let isValid = true;
    const required = ['placeName', 'placeCategory', 'placeCity'];
    
    // Reset all borders
    document.querySelectorAll('#placeName, #placeCategory, #placeCity').forEach(el => {
      el.style.borderColor = '#e5e7eb';
    });
    document.querySelectorAll('.custom-select-trigger').forEach(el => {
      el.style.borderColor = '#e5e7eb';
    });
    
    required.forEach(id => {
      const el = document.getElementById(id);
      if (!el || !el.value.trim()) {
        isValid = false;
        // Find the custom select trigger if exists
        const wrapper = el?.closest('.custom-select-wrapper');
        if (wrapper) {
          const trigger = wrapper.querySelector('.custom-select-trigger');
          if (trigger) trigger.style.borderColor = '#ef4444';
        } else if (el) {
          el.style.borderColor = '#ef4444';
        }
      }
    });
    
    if (!isValid) {
      // Scroll to first error
      const firstError = document.querySelector('[style*="border-color: rgb(239, 68, 68)"], [style*="border-color: #ef4444"]');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    return isValid;
  },

  async submitPlace() {
    if (!this.validatePlaceForm()) return;
    const n = document.getElementById('placeName').value, c = document.getElementById('placeCategory').value, s = document.getElementById('placeSubCategory').value, ci = document.getElementById('placeCity').value;
    const workDays = Array.from(document.querySelectorAll('.work-day-cb:checked')).map(cb => cb.value);
    try {
      await Data.addPlace({ 
        name:n, category:c, subcategory:s||null, city:ci, 
        description:document.getElementById('placeDesc').value, 
        address:document.getElementById('placeAddress').value, 
        phone:document.getElementById('placePhone').value, 
        whatsapp:document.getElementById('placeWhatsapp').value, 
        email:document.getElementById('placeEmail').value, 
        facebook:document.getElementById('placeFacebook').value || null,
        instagram:document.getElementById('placeInstagram').value || null,
        telegram:document.getElementById('placeTelegram').value || null,
        website:document.getElementById('placeWebsite').value || null,
        openTime:document.getElementById('placeOpenTime').value || null,
        closeTime:document.getElementById('placeCloseTime').value || null,
        workDays:workDays.length > 0 ? workDays : null,
        lat:document.getElementById('placeLat').value || null,
        lng:document.getElementById('placeLng').value || null,
        images:this.placeImages, owner:Auth.currentUser.id, verified:false, featured:false 
      });
      Admin.notifyNewPlace(n, Auth.currentUser.name);
      this.placeImages = [];
      this.showToast('تم إرسال طلبك بنجاح! سيتم مراجعته من قبل الإدارة', 'success', 4000);
      setTimeout(() => { location.hash = 'myplaces'; }, 1500);
    } catch (error) {
      ErrorTracker.capture(error, { operation: 'app.place.submit', source: 'submit_place_form' });
      this.showToast(ErrorTracker.getInlineMessage(error), 'error');
    }
  },
  async toggleFav(pid) { if (!Auth.currentUser) { location.hash = 'login'; return; } await Data.toggleFavorite(Auth.currentUser.id, pid); await Data.preloadAll(); this.render(); },
  setRating(s) { document.querySelectorAll('[data-star]').forEach(b => { const v = parseInt(b.dataset.star); b.className = v <= s ? 'text-yellow-500' : 'text-gray-300'; b.querySelector('i')?.classList.toggle('fill-yellow-500', v <= s); }); this._selectedRating = s; },
  async submitReview(pid) { if (!this._selectedRating) { this.showToast('اختر تقييم أولاً', 'warning'); return; } const c = document.getElementById('reviewComment').value; if (!c) { this.showToast('اكتب تعليقك أولاً', 'warning'); return; } try { await Data.addReview(pid, Auth.currentUser.id, Auth.currentUser.name, Auth.currentUser.avatar || '', this._selectedRating, c); this._selectedRating = 0; await Data.preloadAll(); this.showToast('تم إضافة مراجعتك بنجاح', 'success'); setTimeout(() => this.showPlace(pid), 1000); } catch (error) { ErrorTracker.capture(error, { operation: 'app.review.submit', source: 'place_detail_review_form' }); this.showToast(ErrorTracker.getInlineMessage(error), 'error'); } },
  deletePlaceConfirm(id) { if (confirm('هل أنت متأكد من حذف هذا النشاط؟')) { Data.deletePlace(id); this.showToast('تم حذف النشاط', 'success'); setTimeout(() => { location.hash = 'myplaces'; }, 1000); } },
  async updateProfile() { await Auth.updateProfile({ name:document.getElementById('profileName').value, phone:document.getElementById('profilePhone').value, bio:document.getElementById('profileBio')?.value||'' }); this.showToast('تم تحديث الملف الشخصي', 'success'); setTimeout(() => this.render(), 1000); },

  // ====== مشاركة النشاط التجاري ======
  sharePlace(pid) {
    const place = Data.getPlacesSync().find(p => p.id === pid);
    if (!place) return;
    const cat = Data.categories.find(c => c.id === place.category);
    const city = Data.cities.find(c => c.id === place.city);
    const shareUrl = location.origin + '/#place/' + pid;
    const shareText = `${place.name}\n${cat ? cat.name : ''} ${city ? '- ' + city.name : ''}\n\nالدليل اليمني التجاري\n${shareUrl}`;

    // استخدام Web Share API (متاح على الموبايل)
    if (navigator.share) {
      navigator.share({
        title: place.name + ' - الدليل اليمني التجاري',
        text: shareText,
        url: shareUrl
      }).catch((shareError) => { ErrorTracker.capture(shareError, { operation: 'app.place.share', source: 'navigator.share' }); });
    } else {
      // نسخ الرابط كبديل
      this.copyPlaceLink(pid);
    }
  },

  copyPlaceLink(pid) {
    const place = Data.getPlacesSync().find(p => p.id === pid);
    if (!place) return;
    const shareUrl = location.origin + '/#place/' + pid;
    const shareText = `${place.name} - الدليل اليمني التجاري\n${shareUrl}`;

    // نسخ الرابط
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        this.showCopyToast();
      }).catch((copyError) => {
        ErrorTracker.capture(copyError, { operation: 'app.place.copy_link', source: 'navigator.clipboard' });
        this.fallbackCopy(shareText);
      });
    } else {
      this.fallbackCopy(shareText);
    }
  },

  fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    this.showCopyToast();
  },

  showCopyToast() { this.showToast('تم نسخ الرابط بنجاح', 'success', 2000); },

  // Admin moved to admin.html
  render_admin() { window.location.href = 'admin.html'; return ''; }
};

document.addEventListener('DOMContentLoaded', () => App.init());
