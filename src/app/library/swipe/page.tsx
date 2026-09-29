'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  Search,
  Filter,
  Video,
  Heading,
  Eye,
  Zap,
  Tag,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { ProvenanceBadge } from '@/components/provenance/ProvenanceBadge';

interface SwipeEntry {
  id: string;
  type: 'VIDEO' | 'TITLE' | 'HOOK' | 'THUMBNAIL' | 'CHANNEL';
  title: string;
  source: string;
  notes: string;
  tags: string[];
  thumbnailUrl?: string;
  multiplier?: number;
}

const SAMPLE_SWIPE: SwipeEntry[] = [
  {
    id: 'sw-1',
    type: 'HOOK',
    title: 'The Sensor at Column 42 Anomaly Hook',
    source: 'Apex Inquiries',
    notes: 'Opens with exact timestamp and impossible measurement. Very strong curiosity gap.',
    tags: ['Forensic', 'Engineering', 'Cold Open'],
  },
  {
    id: 'sw-2',
    type: 'TITLE',
    title: 'The Catastrophic Failure of the 1999 Megastructure',
    source: 'Apex Inquiries',
    notes: 'High stakes adjective + year + monolithic subject formula.',
    tags: ['Disaster', 'High Stakes', 'Under 60 Chars'],
    multiplier: 5.8,
  },
  {
    id: 'sw-3',
    type: 'VIDEO',
    title: 'Why Nobody Can Rebuild Roman Concrete',
    source: 'Practical Engineering',
    notes: 'Contrarian question about ancient technology outperforming modern standards.',
    tags: ['Contrarian', 'Materials Science'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80',
    multiplier: 3.2,
  },
];

export default function SwipeFilePage() {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [entries, setEntries] = useState<SwipeEntry[]>(SAMPLE_SWIPE);

  const filteredEntries = entries.filter((e) => {
    if (filterType !== 'ALL' && e.type !== filterType) return false;
    if (searchQuery.trim() && !e.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Bookmark className="w-5 h-5 text-indigo-400" />
              <h1 className="text-xl font-bold text-white">Creator Swipe File</h1>
            </div>
            <p className="text-xs text-zinc-400">
              Personal research vault of high-performing hooks, titles, thumbnails, and structural patterns.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved patterns..."
              className="w-full pl-9 pr-3 py-2 bg-[#0b0c12] border border-zinc-700/80 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800">
          {['ALL', 'HOOK', 'TITLE', 'THUMBNAIL', 'VIDEO', 'CHANNEL'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterType === t
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Swipe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEntries.map((item) => (
          <div
            key={item.id}
            className="bg-[#12141c] border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-5 shadow-lg space-y-3 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-zinc-800 text-indigo-300 border border-zinc-700">
                  {item.type}
                </span>
                {item.multiplier && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {item.multiplier}× OUTLIER
                  </span>
                )}
              </div>

              {item.thumbnailUrl && (
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  className="w-full h-32 object-cover rounded-xl border border-zinc-800"
                />
              )}

              <h3 className="text-sm font-bold text-white leading-snug">{item.title}</h3>
              <p className="text-xs text-zinc-400 italic">&ldquo;{item.notes}&rdquo;</p>
              <p className="text-[11px] text-zinc-500">Source: {item.source}</p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded border border-zinc-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800/60 flex justify-end">
              <Link
                href={`/create/ideas?swipe=${item.id}`}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center space-x-1"
              >
                <span>Turn into Video Idea</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
