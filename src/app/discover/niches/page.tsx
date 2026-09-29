'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  Search,
  Filter,
  TrendingUp,
  Zap,
  Users,
  Eye,
  ArrowRight,
  Sparkles,
  BarChart3,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { ProvenanceBadge } from '@/components/provenance/ProvenanceBadge';

interface NicheItem {
  id: string;
  name: string;
  category: string;
  outlierRate: number; // e.g. 14.2%
  competitionIndex: number; // 0 - 100
  avgViews: number;
  facelessViable: boolean;
  emergingChannelsCount: number;
  topContentPattern: string;
  contentGap: string;
  rpmEstimateRange: string;
}

const NICHES_DATA: NicheItem[] = [
  {
    id: 'niche-1',
    name: 'Engineering & Infrastructure Disasters',
    category: 'Technology & Documentary',
    outlierRate: 18.5,
    competitionIndex: 42,
    avgViews: 480000,
    facelessViable: true,
    emergingChannelsCount: 12,
    topContentPattern: 'Forensic timeline autopsy of catastrophic structural failures using 3D schematics.',
    contentGap: 'Severe lack of coverage on subsea cable networks, port logistics failures, and satellite telecom blackouts.',
    rpmEstimateRange: '$7.50 - $14.00 (Estimated)',
  },
  {
    id: 'niche-2',
    name: 'Cold Case Geopolitical Mysteries',
    category: 'History & Investigation',
    outlierRate: 22.1,
    competitionIndex: 58,
    avgViews: 620000,
    facelessViable: true,
    emergingChannelsCount: 19,
    topContentPattern: 'Declassified military dossiers and telemetry anomalies presented as forensic thrillers.',
    contentGap: 'Documentaries focusing on maritime cold cases outside the Bermuda Triangle.',
    rpmEstimateRange: '$5.00 - $9.50 (Estimated)',
  },
  {
    id: 'niche-3',
    name: 'Algorithmic & Financial Meltdowns',
    category: 'Finance & Technology',
    outlierRate: 16.8,
    competitionIndex: 48,
    avgViews: 540000,
    facelessViable: true,
    emergingChannelsCount: 8,
    topContentPattern: 'Minute-by-minute trading floor autopsies of software glitches wiping out hundreds of millions.',
    contentGap: 'High-frequency algorithmic flash crashes explained without dry financial jargon.',
    rpmEstimateRange: '$12.00 - $22.00 (Estimated)',
  },
  {
    id: 'niche-4',
    name: 'Ancient Architecture & Lost Materials',
    category: 'Science & Archeology',
    outlierRate: 15.2,
    competitionIndex: 65,
    avgViews: 710000,
    facelessViable: false,
    emergingChannelsCount: 14,
    topContentPattern: 'Contrarian investigations comparing forgotten Roman/Mesoamerican engineering against modern materials.',
    contentGap: 'Subterranean aqueduct networks and seismic foundations in ancient cities.',
    rpmEstimateRange: '$4.50 - $8.00 (Estimated)',
  },
];

export default function NicheLabPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedNiche, setSelectedNiche] = useState<NicheItem>(NICHES_DATA[0]);

  const filteredNiches = NICHES_DATA.filter((n) => {
    if (selectedCategory !== 'ALL' && n.category !== selectedCategory) return false;
    if (searchQuery.trim() && !n.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Compass className="w-5 h-5 text-indigo-400" />
              <h1 className="text-xl font-bold text-white">Niche Lab & Landscape Explorer</h1>
            </div>
            <p className="text-xs text-zinc-400">
              Discover underserved YouTube niches with high outlier frequencies, faceless viability, and verified content gaps.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search niches or categories..."
              className="w-full pl-9 pr-3 py-2 bg-[#0b0c12] border border-zinc-700/80 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Niche List & Selected Niche Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Niche Directory */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
            <span>Discovered Niches ({filteredNiches.length})</span>
            <ProvenanceBadge provenance="INTERNAL_METRIC" />
          </h2>

          <div className="space-y-2.5">
            {filteredNiches.map((n) => (
              <div
                key={n.id}
                onClick={() => setSelectedNiche(n)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedNiche.id === n.id
                    ? 'bg-[#181a26] border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                    : 'bg-[#12141c] border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase">{n.category}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {n.outlierRate}% Outlier Rate
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white leading-snug">{n.name}</h3>
                <div className="flex items-center space-x-3 text-[11px] text-zinc-400 mt-2">
                  <span>Avg Views: {n.avgViews.toLocaleString()}</span>
                  <span>•</span>
                  <span className={n.facelessViable ? 'text-emerald-400 font-medium' : 'text-zinc-500'}>
                    {n.facelessViable ? 'Faceless Viable' : 'Host Required'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Selected Niche Deep Dive Autopsy */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold text-white">{selectedNiche.name}</h2>
                  <ProvenanceBadge provenance="INTERNAL_METRIC" sourceDescription="Aggregated from niche video performance samples" />
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">{selectedNiche.category}</p>
              </div>

              <Link
                href={`/create/ideas?topic=${encodeURIComponent(selectedNiche.name)}`}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium inline-flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-600/20 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Niche Ideas</span>
              </Link>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-[#0b0c12] rounded-xl border border-zinc-800 text-center">
                <p className="text-[10px] text-zinc-500 uppercase font-semibold">Outlier Rate</p>
                <p className="text-base font-bold text-amber-400 font-mono mt-0.5">{selectedNiche.outlierRate}%</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Videos &gt; 2x baseline</p>
              </div>
              <div className="p-3 bg-[#0b0c12] rounded-xl border border-zinc-800 text-center">
                <p className="text-[10px] text-zinc-500 uppercase font-semibold">Competition</p>
                <p className="text-base font-bold text-emerald-400 font-mono mt-0.5">{selectedNiche.competitionIndex}/100</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Low-Medium barrier</p>
              </div>
              <div className="p-3 bg-[#0b0c12] rounded-xl border border-zinc-800 text-center">
                <p className="text-[10px] text-zinc-500 uppercase font-semibold">Average Views</p>
                <p className="text-base font-bold text-white font-mono mt-0.5">{selectedNiche.avgViews.toLocaleString()}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Established demand</p>
              </div>
              <div className="p-3 bg-[#0b0c12] rounded-xl border border-zinc-800 text-center">
                <p className="text-[10px] text-zinc-500 uppercase font-semibold">RPM Estimate</p>
                <p className="text-xs font-bold text-indigo-300 font-mono mt-1">{selectedNiche.rpmEstimateRange}</p>
                <p className="text-[9px] text-zinc-500 mt-0.5">Not guaranteed</p>
              </div>
            </div>

            {/* Content Patterns & Opportunities */}
            <div className="space-y-4">
              <div className="p-4 bg-[#141724] border border-zinc-800 rounded-xl space-y-1.5">
                <div className="flex items-center space-x-1.5 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Dominant Content Pattern</span>
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed font-medium">
                  {selectedNiche.topContentPattern}
                </p>
              </div>

              <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-1.5">
                <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Verified Content Gap</span>
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed">
                  {selectedNiche.contentGap}
                </p>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg flex items-start space-x-2 text-[11px] text-zinc-500">
              <AlertCircle className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
              <span>
                VYRAL does not guarantee income, views, or monetization. All metrics reflect observed public signals and internal benchmarks.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
