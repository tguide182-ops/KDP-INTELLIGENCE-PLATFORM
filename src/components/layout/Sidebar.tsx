'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Compass,
  Flame,
  Search,
  Zap,
  BarChart3,
  Video,
  Dna,
  Users,
  Globe2,
  Lightbulb,
  FileText,
  Mic,
  Image as ImageIcon,
  Film,
  Sliders,
  Sparkles,
  Heading,
  Eye,
  Activity,
  Tags,
  FlaskConical,
  LineChart,
  HeartPulse,
  Bell,
  FileSpreadsheet,
  FolderKanban,
  Bookmark,
  ChevronDown,
  ChevronRight,
  Bot,
  Layers,
  ChevronLeft,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const NAVIGATION_GROUPS: NavGroup[] = [
  {
    group: 'HOME',
    items: [{ title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }],
  },
  {
    group: 'DISCOVER',
    items: [
      { title: 'Idea Finder', href: '/discover/ideas', icon: Lightbulb },
      { title: 'Niche Finder', href: '/discover/niches', icon: Compass },
      { title: 'Trend Radar', href: '/discover/trends', icon: Flame, badge: 'HOT' },
      { title: 'Outliers', href: '/discover/outliers', icon: Zap, badge: 'CORE' },
      { title: 'Topic Explorer', href: '/discover/topics', icon: Search },
    ],
  },
  {
    group: 'INTELLIGENCE',
    items: [
      { title: 'Channel Analyzer', href: '/intelligence/channels', icon: BarChart3 },
      { title: 'Video Analyzer', href: '/intelligence/videos', icon: Video },
      { title: 'Channel DNA', href: '/intelligence/dna', icon: Dna },
      { title: 'Competitor Radar', href: '/intelligence/competitors', icon: Users },
      { title: 'Market Explorer', href: '/intelligence/market', icon: Globe2 },
    ],
  },
  {
    group: 'CREATE',
    items: [
      { title: 'Idea Studio', href: '/create/ideas', icon: Sparkles },
      { title: 'Script Studio', href: '/create/scripts', icon: FileText },
      { title: 'Voice Studio', href: '/create/voice', icon: Mic },
      { title: 'Visual Studio', href: '/create/visuals', icon: ImageIcon },
      { title: 'Thumbnail Studio', href: '/create/thumbnails', icon: ImageIcon },
      { title: 'Video Builder', href: '/create/builder', icon: Film },
      { title: 'Video Editor', href: '/create/editor', icon: Sliders },
    ],
  },
  {
    group: 'OPTIMIZE',
    items: [
      { title: 'Title Lab', href: '/optimize/titles', icon: Heading },
      { title: 'Thumbnail Lab', href: '/optimize/thumbnails', icon: Eye },
      { title: 'Retention Architect', href: '/optimize/retention', icon: Activity },
      { title: 'SEO Assistant', href: '/optimize/seo', icon: Tags },
      { title: 'Experiments', href: '/optimize/experiments', icon: FlaskConical },
    ],
  },
  {
    group: 'GROW',
    items: [
      { title: 'Analytics', href: '/grow/analytics', icon: LineChart },
      { title: 'Channel Health', href: '/grow/health', icon: HeartPulse },
      { title: 'Alerts', href: '/grow/alerts', icon: Bell },
      { title: 'Reports', href: '/grow/reports', icon: FileSpreadsheet },
    ],
  },
  {
    group: 'LIBRARY',
    items: [
      { title: 'Projects', href: '/library/projects', icon: FolderKanban },
      { title: 'Swipe File', href: '/library/swipe', icon: Bookmark },
      { title: 'Assets', href: '/library/assets', icon: Layers },
    ],
  },
  {
    group: 'AI',
    items: [
      { title: 'VYRAL Intelligence', href: '/ai/intelligence', icon: Bot, badge: 'PRO' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    HOME: true,
    DISCOVER: true,
    INTELLIGENCE: true,
    CREATE: true,
    OPTIMIZE: false,
    GROW: false,
    LIBRARY: false,
    AI: true,
  });

  const toggleGroup = (group: string) => {
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-30 bg-[#0c0d14] border-r border-zinc-800/80 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-zinc-800/80">
        <Link href="/dashboard" className="flex items-center space-x-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-red-500/20">
            <span className="text-white font-black text-xs tracking-tighter">VY</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wider text-white">VYRAL</span>
              <span className="text-[10px] text-zinc-500 font-mono tracking-tight leading-none">OS v1.0</span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {NAVIGATION_GROUPS.map((grp) => {
          const isOpen = openGroups[grp.group] ?? true;
          return (
            <div key={grp.group} className="space-y-1">
              {!collapsed && (
                <button
                  onClick={() => toggleGroup(grp.group)}
                  className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider hover:text-zinc-300"
                >
                  <span>{grp.group}</span>
                  <ChevronDown
                    className={`w-3 h-3 text-zinc-400 transition-transform duration-200 ${
                      isOpen ? '' : '-rotate-90'
                    }`}
                  />
                </button>
              )}

              {(collapsed || isOpen) && (
                <div className="space-y-0.5">
                  {grp.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={collapsed ? item.title : undefined}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all group ${
                          isActive
                            ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-300'
                            }`}
                          />
                          {!collapsed && <span className="truncate">{item.title}</span>}
                        </div>

                        {!collapsed && item.badge && (
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-semibold shrink-0 uppercase ${
                              item.badge === 'HOT'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : item.badge === 'CORE'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Status */}
      <div className="p-3 border-t border-zinc-800/80 bg-[#090a0f]/80">
        {!collapsed ? (
          <div className="flex items-center justify-between text-[11px] text-zinc-500">
            <div className="flex items-center space-x-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Engine Online</span>
            </div>
            <span className="font-mono text-[10px]">ALL ACCESS</span>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-2 h-2 rounded-full bg-emerald-500" title="Engine Online" />
          </div>
        )}
      </div>
    </aside>
  );
}
