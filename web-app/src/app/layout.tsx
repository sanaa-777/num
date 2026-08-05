import type { Metadata } from 'next'
import { Noto_Kufi_Arabic, Inter } from 'next/font/google'
import './globals.css'

const notoKufi = Noto_Kufi_Arabic({
  subsets: ['arabic'],
  variable: '--font-arabic',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-english',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'دليل اليمن |دليل الأعمال والأماكن الشامل',
  description: 'دليل اليمن الشامل - ابحث عن المطاعم والفنادق والعيادات والمتاجر وجميع الخدمات في اليمن',
  keywords: 'دليل اليمن, يمن, مطاعم, فنادق, عيادات, خدمات, أعمال, صنعاء, عدن, تعز',
  openGraph: {
    title: 'دليل اليمن',
    description: 'دليل الأعمال والأماكن الشامل في اليمن',
    type: 'website',
    locale: 'ar_YE',
    siteName: 'دليل اليمن',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className={`${notoKufi.variable} ${inter.variable}`}>
      <body className="font-arabic bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
