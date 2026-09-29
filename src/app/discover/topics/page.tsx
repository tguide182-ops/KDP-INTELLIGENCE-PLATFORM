'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Tag,
  Zap,
  HelpCircle,
  Compass,
} from 'lucide-react';
import { ProvenanceBadge } from '@/components/provenance/ProvenanceBadge';

interface TopicItem {
  id: string;
  topic: string;
  category: string;
  searchVolumeSignal: 'HIGH' | 'MEDIUM' | 'EMERGING';
  competition: 'LOW' | 'MEDIUM' | 'HIGH';
  suggestedAngles: string[];
}

const TOPIC_SUGGESTIONS: TopicItem[] = [
  {
    id: 'top-1',
    topic: 'Underwater Cable Repair Vessels',
    category: 'Engineering & Infrastructure',
    searchVolumeSignal: 'HIGH',
    competition: 'LOW',
    suggestedAngles: [
      'The 5 specialized ships that keep 99% of global internet alive',
      'What happens when a deep sea fiber cable snaps at 3,000m depth',
      'The secret underwater exclusion zones nobody is allowed to anchor near',
    ],
  },
  {
    id: 'top-2',
    topic: 'Wall Street Dead Code Activation',
    category: 'Finance & Technology',
    searchVolumeSignal: 'HIGH',
    competition: 'LOW',
    suggestedAngles: [
      'The 8 lines of code that bankrupted Knight Capital in 45 minutes',
      'Why Wall Street cannot replace 40-year-old COBOL trading mainframes',
      'The automated flash crashes that happened while traders slept',
    ],
  },
  {
    id: 'top-3',
    topic: 'Ancient Roman Hydraulic Concrete',
    category: 'Science & Archeology',
    searchVolumeSignal: 'MEDIUM',
    competition: 'MEDIUM',
    suggestedAngles: [
      'The volcanic ash secret that makes Roman piers stronger under saltwater',
      'Why modern civil engineers still cannot recreate 2,000-year-old breakwaters',
    ],
  },
];

export default function TopicExplorerPage() {
  const [query, setQuery] = useState('');
  const [topics, setTopics] = useState<TopicItem[]>(TOPIC_SUGGESTIONS);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold text-white">Topic Explorer & Angle Generator</h1>
          </div>
          <p className="text-xs text-zinc-400">
            Deconstruct high-demand search subjects into contrarian hooks, curiosity gaps, and original angles.
          </p>
        </div>

        <div className="relative w-full max-w-xl">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Explore any topic or keyword (e.g. submarine cables, trading bugs)..."
            className="w-full pl-9 pr-3 py-2.5 bg-[#0b0c12] border border-zinc-700/80 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Topics List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Topic Clusters & Suggested Angles
          </h2>
          <ProvenanceBadge provenance="AI_DERIVED" />
        </div>

        <div className="space-y-4">
          {topics.map((t) => (
            <div
              key={t.id}
              className="bg-[#12141c] border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-6 shadow-lg space-y-4 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                <div>
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase">{t.category}</span>
                  <h3 className="text-base font-bold text-white mt-0.5">{t.topic}</h3>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Demand: {t.searchVolumeSignal}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Competition: {t.competition}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Original Content Angles:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {t.suggestedAngles.map((angle, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-[#0b0c12] border border-zinc-800 rounded-xl space-y-2 flex flex-col justify-between"
                    >
                      <p className="text-xs font-medium text-zinc-200 leading-relaxed">&ldquo;{angle}&rdquo;</p>
                      <Link
                        href={`/create/ideas?topic=${encodeURIComponent(angle)}`}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center space-x-1 pt-2"
                      >
                        <span>Send to Idea Studio</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
