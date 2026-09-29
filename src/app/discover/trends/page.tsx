'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  TrendingUp,
  Search,
  Filter,
  ArrowRight,
  Clock,
  Sparkles,
  Zap,
  Activity,
  Calendar,
} from 'lucide-react';
import { ProvenanceBadge } from '@/components/provenance/ProvenanceBadge';

interface TrendSignal {
  id: string;
  topic: string;
  niche: string;
  status: 'EARLY' | 'RISING' | 'HOT' | 'COOLING';
  growthRate: string;
  velocityScore: number;
  formatSuggestion: string;
  firstDetected: string;
  rationale: string;
}

const TREND_SIGNALS: TrendSignal[] = [
  {
    id: 'tr-1',
    topic: 'Undersea Fiber Optic Cable Sabotage & Telemetry',
    niche: 'Engineering & Infrastructure',
    status: 'RISING',
    growthRate: '+184% search surge',
    velocityScore: 92,
    formatSuggestion: 'Documentary (18 - 24 min)',
    firstDetected: '4 days ago',
    rationale: 'Unexplained subsea fiber cuts triggered heavy search interest, but existing videos are low-production news clips without investigative autopsies.',
  },
  {
    id: 'tr-2',
    topic: 'Knight Capital $440M Algorithmic Meltdown',
    niche: 'Finance & Technology',
    status: 'HOT',
    growthRate: '+310% search surge',
    velocityScore: 98,
    formatSuggestion: 'Minute-by-minute thriller format',
    firstDetected: '1 week ago',
    rationale: 'Recent financial tech discussions reactivated interest in the fastest software-driven bankruptcy in Wall Street history.',
  },
  {
    id: 'tr-3',
    topic: 'Autonomous AI Agent Swarms on Edge Hardware',
    niche: 'AI & Developer Systems',
    status: 'EARLY',
    growthRate: '+78% emerging signal',
    velocityScore: 84,
    formatSuggestion: 'Technical Explainer / Demo',
    firstDetected: '2 days ago',
    rationale: 'GitHub repository stars for local agent swarms grew 400% this week. Strong early adopter curiosity gap.',
  },
  {
    id: 'tr-4',
    topic: 'Roman Concrete Self-Healing Chemistry',
    niche: 'Science & Archeology',
    status: 'COOLING',
    growthRate: '-18% from peak',
    velocityScore: 61,
    formatSuggestion: 'Contrarian Deep Dive',
    firstDetected: '3 weeks ago',
    rationale: 'Initial wave of MIT research videos has saturated mainstream search; requires contrarian angle to outperform baseline.',
  },
];

export default function TrendRadarPage() {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTrends = TREND_SIGNALS.filter((t) => {
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    if (searchQuery.trim() && !t.topic.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-red-500" />
              <h1 className="text-xl font-bold text-white">Trend Radar</h1>
            </div>
            <p className="text-xs text-zinc-400">
              Detect sudden topic activity, search velocity signals, and format shifts before niches saturate.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter trending topics..."
              className="w-full pl-9 pr-3 py-2 bg-[#0b0c12] border border-zinc-700/80 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800">
          {['ALL', 'EARLY', 'RISING', 'HOT', 'COOLING'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterStatus === s
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Trends Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Active Trend Signals ({filteredTrends.length})
          </h2>
          <ProvenanceBadge provenance="INTERNAL_METRIC" sourceDescription="Proprietary velocity classifications based on search signal rate of change" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTrends.map((trend) => (
            <div
              key={trend.id}
              className="bg-[#12141c] border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-5 shadow-lg space-y-4 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase tracking-wider border ${
                      trend.status === 'HOT'
                        ? 'bg-red-500/20 text-red-300 border-red-500/30'
                        : trend.status === 'RISING'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : trend.status === 'EARLY'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    {trend.status}
                  </span>
                  <span className="text-[11px] text-zinc-500 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{trend.firstDetected}</span>
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase">{trend.niche}</span>
                  <h3 className="text-sm font-bold text-white leading-snug mt-0.5">{trend.topic}</h3>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 bg-[#0b0c12] rounded-xl border border-zinc-800/80 text-center">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase">Growth Signal</p>
                    <p className="text-xs font-bold text-emerald-400 font-mono mt-0.5">{trend.growthRate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase">Velocity Score</p>
                    <p className="text-xs font-bold text-indigo-300 font-mono mt-0.5">{trend.velocityScore}/100</p>
                  </div>
                </div>

                <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/60 space-y-1">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Why This Signal Matters:</p>
                  <p className="text-xs text-zinc-300 leading-relaxed">{trend.rationale}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 font-medium">Rec: {trend.formatSuggestion}</span>
                <Link
                  href={`/create/ideas?topic=${encodeURIComponent(trend.topic)}`}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium inline-flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-600/20"
                >
                  <span>Build Concept</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
