'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MarketplaceSelector } from './MarketplaceSelector';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import {
  Search,
  Moon,
  Sun,
  Command,
  Bookmark,
  FolderKanban,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  currentMarketplace: string;
  onMarketplaceChange: (mp: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMarketplace,
  onMarketplaceChange,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [quickQuery, setQuickQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Initialize theme
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      router.push(`/keywords/explorer?q=${encodeURIComponent(quickQuery.trim())}&mp=${currentMarketplace}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-sm text-slate-900 dark:text-white">
                  KDP INTELLIGENCE
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold border border-brand-500/20">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block font-medium">
                Amazon Research OS
              </p>
            </div>
          </Link>

          {/* Primary Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                pathname === '/'
                  ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/keywords/explorer"
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                pathname.startsWith('/keywords/explorer')
                  ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Keyword Explorer
            </Link>
            <Link
              href="/saved/keywords"
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                pathname.startsWith('/saved')
                  ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved</span>
            </Link>
            <Link
              href="/projects"
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                pathname.startsWith('/projects')
                  ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Projects</span>
            </Link>
          </nav>
        </div>

        {/* Global Quick Search Bar */}
        <div className="flex-1 max-w-md hidden lg:block">
          <form onSubmit={handleQuickSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              placeholder="Search keyword (e.g. menopause cookbook)..."
              className="w-full pl-9 pr-12 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 focus:outline-none focus:border-brand-500 dark:focus:border-brand-400 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 transition-all placeholder:text-slate-400"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300/60 dark:border-slate-700">
                /
              </kbd>
            </div>
          </form>
        </div>

        {/* Right Tools & Controls */}
        <div className="flex items-center gap-2.5">
          {/* Marketplace Selector */}
          <MarketplaceSelector
            currentMarketplace={currentMarketplace}
            onChange={onMarketplaceChange}
            size="sm"
          />

          {/* Developer / Health Status */}
          <Link
            href="/admin/health"
            title="System & Provider Health"
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Activity className="w-4 h-4" />
          </Link>

          {/* Keyboard Shortcuts Trigger */}
          <button
            type="button"
            onClick={() => setShowShortcuts(true)}
            title="Keyboard Shortcuts (?)"
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Command className="w-4 h-4" />
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </header>
  );
};
