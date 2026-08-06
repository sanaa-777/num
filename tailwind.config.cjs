/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './app/**/*.js'],
  safelist: [
    'bg-gray-50',
    'bg-white',
    'bg-dark-950',
    'dark:bg-dark-950',
    'dark:bg-dark-900',
    'dark:bg-dark-800',
    'dark:bg-dark-700',
    'dark:text-white',
    'dark:text-gray-400',
    'dark:text-gray-300',
    'dark:border-dark-700',
    'dark:border-dark-600',
    'fill-red-500',
    'text-red-500'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { 50:'#eff6ff',100:'#dbeafe',200:'#bfdbfe',300:'#93c5fd',400:'#60a5fa',500:'#3b82f6',600:'#2563eb',700:'#1d4ed8',800:'#1e40af',900:'#1e3a8a' },
        accent: { 400:'#fbbf24',500:'#f59e0b',600:'#d97706' },
        dark: { 50:'#f8fafc',100:'#f1f5f9',200:'#e2e8f0',300:'#cbd5e1',400:'#94a3b8',500:'#64748b',600:'#475569',700:'#334155',800:'#1e293b',900:'#0f172a',950:'#020617' }
      }
    }
  }
}
