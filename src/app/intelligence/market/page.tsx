'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Globe2,
  Search,
  Users,
  Eye,
  TrendingUp,
  Zap,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { ProvenanceBadge } from '@/components/provenance/ProvenanceBadge';

interface MarketCluster {
  id: string;
  name: string;
  totalChannels: number;
  totalMonthlyViews: string;
  dominantFormat: string;
  leaderChannel: string;
  growthStatus: 'ACCELERATING' | 'STABLE' | 'SATURATING';
}

const MARKET_CLUSTERS: MarketCluster[] = [
  {
    id: 'mc-1',
    name: 'Forensic Engineering & Infrastructure',
    totalChannels: 45,
    totalMonthlyViews: '124M',
    dominantFormat: 'Long-Form Video Essays (15 - 25m)',
    leaderChannel: 'Practical Engineering',
    growthStatus: 'ACCELERATING',
  },
  {
    id: 'mc-2',
    name: 'Tech History & Corporate Autopsies',
    totalChannels: 62,
    totalMonthlyViews: '180M',
    dominantFormat: 'Documentaries & Narrative Essays',
    leaderChannel: 'ColdFusion',
    growthStatus: 'ACCELERATING',
  },
  {
    id: 'mc-3',
    name: 'Aviation & Logistics Systems',
    totalChannels: 38,
    totalMonthlyViews: '95M',
    dominantFormat: 'Animated Explainer with Map Graphics',
    leaderChannel: 'Wendover Productions',
    growthStatus: 'STABLE',
  },
];

export default function MarketExplorerPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Globe2 className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold text-white">Market Explorer</h1>
          </div>
          <p className="text-xs text-zinc-400">
            Map broad audience ecosystems, creator cluster density, and viewership distribution.
          </p>
        </div>
      </div>

      {/* Market Clusters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Adjacent Market Clusters ({MARKET_CLUSTERS.length})
          </h2>
          <ProvenanceBadge provenance="INTERNAL_METRIC" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MARKET_CLUSTERS.map((cluster) => (
            <div
              key={cluster.id}
              className="bg-[#12141c] border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-6 shadow-lg space-y-4 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                      cluster.growthStatus === 'ACCELERATING'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                    }`}
                  >
                    {cluster.growthStatus}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">{cluster.totalMonthlyViews}/mo</span>
                </div>

                <h3 className="text-base font-bold text-white leading-snug">{cluster.name}</h3>

                <div className="p-3 bg-[#0b0c12] rounded-xl border border-zinc-800 space-y-1.5 text-xs text-zinc-300">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Active Channels:</span>
                    <span className="font-mono font-semibold text-white">{cluster.totalChannels}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Benchmark Leader:</span>
                    <span className="text-indigo-400 font-medium">{cluster.leaderChannel}</span>
                  </div>
                  <div className="pt-1 text-[11px] text-zinc-400 border-t border-zinc-800">
                    Format: {cluster.dominantFormat}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800/60 flex justify-end">
                <Link
                  href={`/discover/niches`}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center space-x-1"
                >
                  <span>Explore Niche Gaps</span>
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
