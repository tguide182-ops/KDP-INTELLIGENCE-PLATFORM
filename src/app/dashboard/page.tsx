'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap,
  TrendingUp,
  Eye,
  Users,
  Clock,
  ArrowUpRight,
  Sparkles,
  Flame,
  AlertTriangle,
  Play,
  ArrowRight,
  ShieldCheck,
  Compass,
  Search,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { ProvenanceBadge } from '@/components/provenance/ProvenanceBadge';
import { NormalizedOutlier, NormalizedVideo } from '@/lib/providers/youtube/types';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [outliers, setOutliers] = useState<NormalizedOutlier[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [researching, setResearching] = useState(false);
  const [researchResult, setResearchResult] = useState<any>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const res = await fetch('/api/research/outliers?channelId=UC_mock_veritasium_style&minMultiplier=2.0');
        if (res.ok) {
          const data = await res.json();
          setOutliers(data.outliers || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const handleQuickSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setResearching(true);
    setResearchResult(null);

    try {
      const res = await fetch(`/api/research/channel?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      if (res.ok) {
        setResearchResult(data.channel);
      } else {
        alert(data.error || 'Failed to find channel');
      }
    } catch {
      alert('Error connecting to research engine');
    } finally {
      setResearching(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner & Quick Channel Research Bar */}
      <div className="bg-gradient-to-r from-[#141724] via-[#12141e] to-[#161324] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30 uppercase tracking-wider">
                Command Center
              </span>
              <span className="text-xs text-zinc-400">• Active Channel: Apex Inquiries</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              What Should You Create Next?
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              3 high-probability content opportunities detected. 1 competitor outlier is performing 5.8× above baseline.
            </p>
          </div>

          {/* Quick Lookup Input */}
          <form onSubmit={handleQuickSearch} className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Analyze any channel (@handle or URL)..."
                className="w-full pl-9 pr-3 py-2 bg-[#0a0b12] border border-zinc-700/80 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={researching}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium shrink-0 transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-indigo-600/20"
            >
              {researching ? 'Analyzing...' : 'Scan Channel'}
            </button>
          </form>
        </div>

        {/* Quick Scan Result Modal/Card */}
        {researchResult && (
          <div className="mt-4 p-4 bg-[#0a0b12] border border-indigo-500/40 rounded-xl relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <img
                src={researchResult.thumbnailUrl}
                alt={researchResult.title}
                className="w-12 h-12 rounded-full border border-zinc-700 object-cover"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-semibold text-white">{researchResult.title}</h3>
                  <ProvenanceBadge provenance={researchResult.subscriberCount.provenance} />
                </div>
                <p className="text-xs text-zinc-400">{researchResult.handle} • {researchResult.subscriberCount.value.toLocaleString()} subscribers</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link
                href={`/intelligence/channels?handle=${encodeURIComponent(researchResult.handle)}`}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center space-x-1"
              >
                <span>Full Autopsy</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setResearchResult(null)}
                className="px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 1. CHANNEL OVERVIEW CARDS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <span>Channel Overview</span>
            <ProvenanceBadge provenance="DEMO_DATA" sourceDescription="Baseline channel statistics from connected profile" />
          </h2>
          <span className="text-xs text-zinc-500">Updated 14 minutes ago</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#12141c] border border-zinc-800/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span>Subscribers</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">482,000</div>
            <div className="flex items-center space-x-1.5 text-xs text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+14,200 (last 30d)</span>
            </div>
          </div>

          <div className="bg-[#12141c] border border-zinc-800/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span>Total Views</span>
              <Eye className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">54.9M</div>
            <div className="flex items-center space-x-1.5 text-xs text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+3.8M (last 30d)</span>
            </div>
          </div>

          <div className="bg-[#12141c] border border-zinc-800/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span>30-Day Average Views</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">315,000</div>
            <div className="text-xs text-zinc-500">Baseline for outlier detection</div>
          </div>

          <div className="bg-[#12141c] border border-zinc-800/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span>Upload Cadence</span>
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">10.5 Days</div>
            <div className="text-xs text-zinc-500">2.8 long-form uploads / mo</div>
          </div>
        </div>
      </div>

      {/* 2. STRATEGIC AI RECOMMENDATIONS */}
      <div className="bg-[#10121a] border border-zinc-800/90 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Strategic AI Recommendations
            </h2>
          </div>
          <ProvenanceBadge provenance="AI_DERIVED" sourceDescription="Derived from competitor analysis and channel DNA" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 bg-[#141724] border border-zinc-800 rounded-lg space-y-2">
            <div className="flex items-center space-x-1.5 text-amber-400 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5" />
              <span>Momentum Signal</span>
            </div>
            <h3 className="text-xs font-medium text-zinc-200">
              3 topics are gaining rapid momentum in your engineering & mystery niche.
            </h3>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Audience search for &ldquo;deep sea infrastructure collapse&rdquo; surged 42% this week with zero high-production long-form coverage.
            </p>
            <div className="pt-1">
              <Link
                href="/create/ideas?topic=Deep+Sea+Infrastructure"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center space-x-1"
              >
                <span>Generate 8 Idea Concepts</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="p-4 bg-[#141724] border border-zinc-800 rounded-lg space-y-2">
            <div className="flex items-center space-x-1.5 text-indigo-400 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>Competitor Outlier</span>
            </div>
            <h3 className="text-xs font-medium text-zinc-200">
              Competitor video performing 5.8× above channel baseline.
            </h3>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              &ldquo;The Catastrophic Failure of the 1999 Megastructure&rdquo; reached 1.84M views using a cold-open curiosity gap hook.
            </p>
            <div className="pt-1">
              <Link
                href="/intelligence/videos?id=yt_mock_0"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center space-x-1"
              >
                <span>Inspect Video Autopsy</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="p-4 bg-[#141724] border border-zinc-800 rounded-lg space-y-2">
            <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Format DNA Insight</span>
            </div>
            <h3 className="text-xs font-medium text-zinc-200">
              Documentary format outperforms your explainers by 2.4×.
            </h3>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Videos with multi-beat escalation and 3D diagram cuts hold 58% retention past minute 8 vs 31% on talking head formats.
            </p>
            <div className="pt-1">
              <Link
                href="/intelligence/dna"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center space-x-1"
              >
                <span>View Full Channel DNA</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RECENT PERFORMANCE & OUTLIERS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Recent Performance & Outlier Surveillance
            </h2>
            <p className="text-xs text-zinc-400">
              Videos exceeding channel baseline (315K views) by 2.0× or greater
            </p>
          </div>
          <Link
            href="/discover/outliers"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center space-x-1"
          >
            <span>View All Outliers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-[#12141c] border border-zinc-800/80 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0e1017] border-b border-zinc-800/80 text-zinc-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Video & Packaging</th>
                  <th className="py-3 px-4">Views</th>
                  <th className="py-3 px-4">Multiplier</th>
                  <th className="py-3 px-4">Velocity</th>
                  <th className="py-3 px-4">Provenance</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {outliers.length > 0 ? (
                  outliers.map((item) => (
                    <tr key={item.videoId} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3 max-w-md">
                          <img
                            src={item.video.thumbnailUrl}
                            alt={item.video.title}
                            className="w-16 h-9 object-cover rounded border border-zinc-700/80 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-white truncate">{item.video.title}</p>
                            <p className="text-[11px] text-zinc-500 truncate">{item.channelTitle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-white">
                        {item.actualViews.value.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {item.multiplier.value}× Baseline
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-400 font-mono">
                        {item.video.viewVelocity ? `${item.video.viewVelocity.value}/hr` : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <ProvenanceBadge provenance={item.multiplier.provenance} />
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Link
                          href={`/intelligence/videos?id=${item.videoId}`}
                          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded font-medium text-[11px] inline-flex items-center space-x-1"
                        >
                          <span>Autopsy</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500">
                      Loading outlier surveillance data...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
