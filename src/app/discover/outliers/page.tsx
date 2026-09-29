'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap,
  Filter,
  ArrowUpDown,
  ArrowRight,
  TrendingUp,
  Eye,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';
import { ProvenanceBadge } from '@/components/provenance/ProvenanceBadge';
import { NormalizedOutlier } from '@/lib/providers/youtube/types';

export default function OutliersPage() {
  const [outliers, setOutliers] = useState<NormalizedOutlier[]>([]);
  const [loading, setLoading] = useState(true);
  const [minMultiplier, setMinMultiplier] = useState(2.0);
  const [sortBy, setSortBy] = useState<'multiplier' | 'views' | 'newest'>('multiplier');

  useEffect(() => {
    async function loadOutliers() {
      setLoading(true);
      try {
        const res = await fetch(`/api/research/outliers?channelId=UC_mock_veritasium_style&minMultiplier=${minMultiplier}`);
        const data = await res.json();
        if (data.outliers) {
          let list: NormalizedOutlier[] = [...data.outliers];
          if (sortBy === 'multiplier') {
            list.sort((a, b) => b.multiplier.value - a.multiplier.value);
          } else if (sortBy === 'views') {
            list.sort((a, b) => b.actualViews.value - a.actualViews.value);
          }
          setOutliers(list);
        }
      } catch (err) {
        console.error('Failed to load outliers:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOutliers();
  }, [minMultiplier, sortBy]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h1 className="text-xl font-bold text-white">Outlier Engine</h1>
            </div>
            <p className="text-xs text-zinc-400">
              Detect and dissect videos outperforming channel baseline benchmarks by 2× to 10×+.
            </p>
          </div>

          {/* Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 bg-[#0b0c12] px-3 py-1.5 rounded-lg border border-zinc-700/80 text-xs">
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-zinc-400">Min Multiplier:</span>
              <select
                value={minMultiplier}
                onChange={(e) => setMinMultiplier(parseFloat(e.target.value))}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="1.5" className="bg-zinc-900">1.5×</option>
                <option value="2.0" className="bg-zinc-900">2.0× (Standard)</option>
                <option value="3.0" className="bg-zinc-900">3.0× (High)</option>
                <option value="5.0" className="bg-zinc-900">5.0× (Mega)</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 bg-[#0b0c12] px-3 py-1.5 rounded-lg border border-zinc-700/80 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-zinc-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="multiplier" className="bg-zinc-900">Highest Multiplier</option>
                <option value="views" className="bg-zinc-900">Highest Views</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Outliers Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Detected Outlier Videos ({outliers.length})
          </h2>
          <ProvenanceBadge provenance="INTERNAL_METRIC" sourceDescription="Calculated ratio vs 30-day channel baseline" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {outliers.map((item) => (
            <div
              key={item.videoId}
              className="bg-[#12141c] border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-5 shadow-lg space-y-4 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex gap-4">
                  <img
                    src={item.video.thumbnailUrl}
                    alt={item.video.title}
                    className="w-36 h-20 object-cover rounded-xl border border-zinc-700/80 shrink-0"
                  />
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                        {item.multiplier.value}× Baseline
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-white leading-snug line-clamp-2">
                      {item.video.title}
                    </h3>
                    <p className="text-[11px] text-zinc-400 truncate">{item.channelTitle}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-2.5 bg-[#0b0c12] rounded-xl border border-zinc-800/80 text-center">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase">Actual Views</p>
                    <p className="text-xs font-bold text-white font-mono mt-0.5">
                      {item.actualViews.value.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase">Baseline</p>
                    <p className="text-xs font-bold text-zinc-400 font-mono mt-0.5">
                      {item.baselineViews.value.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase">Duration</p>
                    <p className="text-xs font-bold text-zinc-400 font-mono mt-0.5">
                      {item.video.durationFormatted}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/60 space-y-1">
                  <div className="flex items-center space-x-1.5 text-zinc-400 text-[11px] font-semibold">
                    <Info className="w-3 h-3 text-indigo-400" />
                    <span>Why This is an Outlier:</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {item.classificationReason}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
                <Link
                  href={`/create/ideas?outlier=${item.videoId}`}
                  className="text-xs text-zinc-400 hover:text-zinc-200 inline-flex items-center space-x-1"
                >
                  <span>Use as Pattern</span>
                </Link>
                <Link
                  href={`/intelligence/videos?id=${item.videoId}`}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium inline-flex items-center space-x-1.5 transition-all"
                >
                  <span>Inspect Full Autopsy</span>
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
