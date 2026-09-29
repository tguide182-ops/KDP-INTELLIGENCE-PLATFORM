'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import {
  Search,
  Plus,
  Tv,
  ChevronDown,
  LogOut,
  User,
  Activity,
  Bell,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export function Header() {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeChannel, setActiveChannel] = useState('Apex Inquiries (@apexinquiries)');

  return (
    <header className="h-14 bg-[#0c0d14]/90 backdrop-blur-md border-b border-zinc-800/80 sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between">
      {/* Channel Switcher */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 hover:border-zinc-700 transition-colors cursor-pointer">
          <Tv className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="font-medium truncate max-w-[180px] sm:max-w-[220px]">
            {activeChannel}
          </span>
          <ChevronDown className="w-3 h-3 text-zinc-500" />
        </div>
      </div>

      {/* Center Search / Command Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="w-full relative">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search channels, outliers, scripts, or topics... (Ctrl+K)"
            className="w-full pl-9 pr-12 py-1.5 bg-[#12141c] border border-zinc-800/90 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] bg-zinc-800/80 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700/60 font-mono">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        <Link
          href="/create/ideas"
          className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-sm shadow-indigo-600/20"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Idea Studio</span>
        </Link>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 p-1 rounded-lg hover:bg-zinc-800/50 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-inner">
              {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <ChevronDown className="w-3 h-3 text-zinc-500 hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#12141c] border border-zinc-800 rounded-xl shadow-2xl py-1 z-50">
              <div className="px-3 py-2 border-b border-zinc-800/80">
                <p className="text-xs font-medium text-white truncate">{user?.name || 'Creator'}</p>
                <p className="text-[11px] text-zinc-500 truncate">{user?.email}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 flex items-center space-x-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
