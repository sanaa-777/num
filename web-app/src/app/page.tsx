import { Search, MapPin, Star, TrendingUp, Clock, ChevronLeft } from 'lucide-react'

// بيانات تجريبية (ستأتي من Supabase)
const categories = [
  { id: '1', name: 'مطاعم', icon: '🍽️', count: 1250 },
  { id: '2', name: 'فنادق', icon: '🏨', count: 380 },
  { id: '3', name: 'عيادات', icon: '🏥', count: 890 },
  { id: '4', name: 'متاجر', icon: '🛍️', count: 2100 },
  { id: '5', name: 'خدمات', icon: '🔧', count: 650 },
  { id: '6', name: 'تعليم', icon: '📚', count: 420 },
  { id: '7', name: 'ترفيه', icon: '🎮', count: 310 },
  { id: '8', name: 'صيدليات', icon: '💊', count: 560 },
]

const cities = [
  { id: '1', name: 'صنعاء', places: 4500 },
  { id: '2', name: 'عدن', places: 2800 },
  { id: '3', name: 'تعز', places: 1900 },
  { id: '4', name: 'الحديدة', places: 1200 },
  { id: '5', name: 'إب', places: 850 },
  { id: '6', name: 'حضرموت', places: 1100 },
  { id: '7', name: 'مأرب', places: 650 },
  { id: '8', name: 'لحج', places: 480 },
]

const featuredPlaces = [
  {
    id: '1',
    name: 'مطعم البركة',
    category: 'مطاعم',
    city: 'صنعاء',
    rating: 4.8,
    reviews: 234,
    image: '/api/placeholder/400/300',
    verified: true,
  },
  {
    id: '2',
    name: 'فندق القصر',
    category: 'فنادق',
    city: 'عدن',
    rating: 4.6,
    reviews: 189,
    image: '/api/placeholder/400/300',
    verified: true,
  },
  {
    id: '3',
    name: 'عيادة الشفاء',
    category: 'عيادات',
    city: 'تعز',
    rating: 4.9,
    reviews: 312,
    image: '/api/placeholder/400/300',
    verified: true,
  },
  {
    id: '4',
    name: 'مجمع التسوق الحديث',
    category: 'متاجر',
    city: 'صنعاء',
    rating: 4.5,
    reviews: 156,
    image: '/api/placeholder/400/300',
    verified: false,
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">د</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">دليل اليمن</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">الرئيسية</a>
            <a href="#categories" className="text-gray-600 hover:text-primary-600 transition-colors">التصنيفات</a>
            <a href="#cities" className="text-gray-600 hover:text-primary-600 transition-colors">المدن</a>
            <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">الإعلانات</a>
          </nav>
          <div className="flex items-center gap-3">
            <button className="btn-secondary text-sm px-4 py-2">تسجيل الدخول</button>
            <button className="btn-primary text-sm px-4 py-2">إضافة مكان</button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            اكتشف اليمن
          </h2>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
            الدليل الشامل للأعمال والأماكن في جميع أنحاء اليمن
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className="flex bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex-1 flex items-center px-6">
                <Search className="w-5 h-5 text-gray-400 ml-3" />
                <input
                  type="text"
                  placeholder="ابحث عن مكان، خدمة، أو نشاط..."
                  className="w-full py-4 text-gray-900 placeholder:text-gray-400 focus:outline-none text-lg"
                />
              </div>
              <button className="bg-accent-500 hover:bg-accent-600 text-white px-8 font-semibold transition-colors">
                بحث
              </button>
            </div>
            
            {/* Quick filters */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {['مطاعم', 'فنادق', 'عيادات', 'صيدليات', 'متاجر'].map((tag) => (
                <button
                  key={tag}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm transition-colors backdrop-blur-sm"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'مكان مسجل', value: '15,000+', icon: '📍' },
              { label: 'مستخدم نشط', value: '50,000+', icon: '👥' },
              { label: 'مراجعة', value: '120,000+', icon: '⭐' },
              { label: 'مدينة', value: '22', icon: '🏙️' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900">التصنيفات</h3>
            <a href="#" className="text-primary-600 hover:text-primary-700 flex items-center gap-1">
              عرض الكل <ChevronLeft className="w-4 h-4" />
            </a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href="#"
                className="card p-4 text-center hover:shadow-lg transition-all hover:-translate-y-1 group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <div className="font-semibold text-gray-900 mb-1">{cat.name}</div>
                <div className="text-xs text-gray-500">{cat.count} مكان</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Places */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-accent-500" />
                أماكن مميزة
              </h3>
              <p className="text-gray-500 mt-1">الأعلى تقييماً في اليمن</p>
            </div>
            <a href="#" className="text-primary-600 hover:text-primary-700 flex items-center gap-1">
              عرض الكل <ChevronLeft className="w-4 h-4" />
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredPlaces.map((place) => (
              <a
                key={place.id}
                href="#"
                className="card overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 group"
              >
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                  {place.verified && (
                    <div className="absolute top-3 right-3 z-20 badge-verified">
                      ✓ موثّق
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 z-20 text-white">
                    <div className="text-lg font-bold">{place.name}</div>
                    <div className="text-sm text-gray-200 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {place.city} • {place.category}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-accent-500 fill-accent-500" />
                      <span className="font-bold text-gray-900">{place.rating}</span>
                      <span className="text-sm text-gray-500">({place.reviews})</span>
                    </div>
                    <button className="text-gray-400 hover:text-red-500 transition-colors">
                      ♡
                    </button>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Cities */}
      <section id="cities" className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900">المدن</h3>
            <a href="#" className="text-primary-600 hover:text-primary-700 flex items-center gap-1">
              عرض الكل <ChevronLeft className="w-4 h-4" />
            </a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
            {cities.map((city) => (
              <a
                key={city.id}
                href="#"
                className="card p-6 hover:shadow-lg transition-all hover:-translate-y-1 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                    <MapPin className="w-6 h-6 text-primary-600" />
                  </div>
                  <span className="text-sm text-gray-500">{city.places} مكان</span>
                </div>
                <h4 className="text-lg font-bold text-gray-900">{city.name}</h4>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Ads */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary-600" />
            أحدث الإعلانات
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'خصم 30% على جميع الوجبات', place: 'مطعم البركة', until: 'ينتهي بعد 3 أيام' },
              { title: 'افتتاح فرع جديد', place: 'محل الأناقة', until: 'اليوم' },
              { title: 'عرض خاص على الفحص الطبي', place: 'عيادة الشفاء', until: 'ينتهي بعد أسبوع' },
            ].map((ad, i) => (
              <div key={i} className="card p-6 border-r-4 border-r-accent-500">
                <div className="badge-accent mb-3">إعلان</div>
                <h4 className="font-bold text-gray-900 mb-2">{ad.title}</h4>
                <p className="text-gray-600 text-sm mb-3">{ad.place}</p>
                <p className="text-xs text-gray-400">{ad.until}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-accent-500 to-accent-600 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            أضف مكانك مجاناً
          </h3>
          <p className="text-accent-100 mb-8 max-w-xl mx-auto">
            سجّل عملك في دليل اليمن واحصل على المزيد من العملاء
          </p>
          <button className="bg-white text-accent-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-xl">
            ابدأ الآن
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">د</span>
                </div>
                <h4 className="text-white font-bold text-lg">دليل اليمن</h4>
              </div>
              <p className="text-sm text-gray-400">
                الدليل الشامل للأعمال والأماكن في جميع أنحاء اليمن
              </p>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4">روابط سريعة</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">الرئيسية</a></li>
                <li><a href="#" className="hover:text-white transition-colors">التصنيفات</a></li>
                <li><a href="#" className="hover:text-white transition-colors">المدن</a></li>
                <li><a href="#" className="hover:text-white transition-colors">الإعلانات</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4">لأصحاب الأعمال</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">أضف مكانك</a></li>
                <li><a href="#" className="hover:text-white transition-colors">الباقات والأسعار</a></li>
                <li><a href="#" className="hover:text-white transition-colors">لوحة التحكم</a></li>
                <li><a href="#" className="hover:text-white transition-colors">الإعلانات المميزة</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4">تواصل معنا</h5>
              <ul className="space-y-2 text-sm">
                <li>📧 info@yemendirectory.net</li>
                <li>📱 واتساب</li>
                <li>📘 فيسبوك</li>
                <li>📸 انستغرام</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            © 2024 دليل اليمن. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>
    </main>
  )
}
