'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  Compass,
  BarChart3,
  ListFilter,
  Layers,
  Sparkles,
  BookOpen,
  Bookmark,
  FolderKanban,
  FileSpreadsheet,
  Settings,
  HelpCircle,
  Activity,
  GitFork,
  Target,
  FileCode,
  Bot,
  TrendingUp,
  FileText,
  BookMarked,
  PenTool,
  Download,
  Radar,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navSections = [
    {
      title: 'DISCOVER & RESEARCH',
      items: [
        { label: 'Dashboard', href: '/', icon: LayoutDashboard },
        { label: 'Deep Market Scanner', href: '/market/scanner', icon: Radar, badge: 'New' },
        { label: 'Keyword Explorer', href: '/keywords/explorer', icon: Search, badge: 'Core' },
        { label: 'Niche Finder', href: '/niches/finder', icon: Compass },
        { label: 'Niche Analyzer', href: '/niches/analyzer', icon: BarChart3 },
        { label: 'SERP Analyzer', href: '/serp/analyzer', icon: BookOpen },
      ],
    },
    {
      title: 'COMPETITORS & OPTIMIZATION',
      items: [
        { label: 'Reverse ASIN', href: '/competitors/reverse-asin', icon: GitFork },
        { label: 'Keyword Clustering', href: '/keywords/clustering', icon: Layers },
        { label: 'Opportunity Gaps', href: '/opportunities/gaps', icon: Target },
        { label: 'Backend Keywords', href: '/builder/backend-keywords', icon: FileCode },
        { label: 'Title & Subtitle Builder', href: '/builder/title', icon: Sparkles },
      ],
    },
    {
      title: 'AI INTELLIGENCE & TRENDS',
      items: [
        { label: 'AI Assistant', href: '/assistant/research', icon: Bot },
        { label: 'Research Reports', href: '/reports', icon: FileText },
        { label: 'Trend Comparison', href: '/trends/compare', icon: TrendingUp },
      ],
    },
    {
      title: 'BOOK STUDIO & PRODUCTION',
      items: [
        { label: 'Book Projects', href: '/studio/books', icon: BookMarked },
        { label: 'Blueprint Architect', href: '/studio/blueprint', icon: Compass },
        { label: 'Manuscript Editor', href: '/studio/editor', icon: PenTool },
        { label: 'Kindle Studio', href: '/studio/kindle', icon: BookOpen },
        { label: 'Export Center', href: '/studio/export', icon: Download },
      ],
    },
    {
      title: 'ORGANIZATION & EXPORTS',
      items: [
        { label: 'Saved Keywords', href: '/saved/keywords', icon: Bookmark },
        { label: 'Research Projects', href: '/projects', icon: FolderKanban },
        { label: 'Exports Hub', href: '/exports', icon: FileSpreadsheet },
      ],
    },
    {
      title: 'SYSTEM & STATUS',
      items: [
        { label: 'Developer / Health', href: '/admin/health', icon: Activity },
      ],
    },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:block border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-6">
        {navSections.map((section) => (
          <div key={section.title}>
            <div className="px-3 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-2">
              {section.title}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-brand-500' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};
