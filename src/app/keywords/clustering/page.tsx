'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { SemanticCluster } from '@/services/ClusteringEngine';
import { OpportunityBadge } from '@/components/OpportunityBadge';
import { formatNumber } from '@/lib/utils';
import {
  Layers,
  Search,
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Download,
  Check,
  Copy,
  FolderPlus,
  RefreshCw,
} from 'lucide-react';

export default function KeywordClusteringPage() {
  const [marketplace, setMarketplace] = useState('amazon.com');
  const [seed, setSeed] = useState('menopause cookbook');
  const [clusters, setClusters] = useState<SemanticCluster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedClusterId, setExpandedClusterId] = useState<string | null>(null);

  const fetchClusters = async (querySeed: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/keywords/cluster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed: querySeed, marketplace }),
      });
      const data = await res.json();
      setClusters(data.clusters || []);
      if (data.clusters?.length > 0) {
        setExpandedClusterId(data.clusters[0].id);
      }
    } catch (err) {
      console.error('Error clustering keywords:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClusters(seed);
  }, [marketplace]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (seed.trim()) {
      fetchClusters(seed.trim());
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14]">
      <Header currentMarketplace={marketplace} onMarketplaceChange={setMarketplace} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    Keyword Clustering Engine
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Automatically organize hundreds of keywords into semantic thematic clusters and viable book concepts.
                  </p>
                </div>
              </div>
            </div>

            {/* Seed Search */}
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                type="text"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="Cluster seed keywords..."
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-52 focus:outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-500"
              >
                Cluster
              </button>
            </form>
          </div>

          {isLoading ? (
            <div className="py-24 flex justify-center items-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-brand-500" />
            </div>
          ) : clusters.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No clusters formed.</div>
          ) : (
            <div className="space-y-6">
              {/* Clusters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clusters.map((cluster) => {
                  const isExpanded = expandedClusterId === cluster.id;

                  return (
                    <div
                      key={cluster.id}
                      onClick={() => setExpandedClusterId(isExpanded ? null : cluster.id)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isExpanded
                          ? 'border-brand-500 bg-white dark:bg-slate-900 shadow-md ring-1 ring-brand-500/30'
                          : 'border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                            {cluster.theme}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-500">
                            {cluster.keywordCount} keywords
                          </span>
                        </div>

                        <h3 className="font-bold text-base text-slate-900 dark:text-white mt-2">
                          {cluster.name}
                        </h3>

                        {/* Metrics */}
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                              Total Search Volume
                            </span>
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                              {formatNumber(cluster.totalSearchVolume)}/mo
                            </span>
                          </div>

                          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                              Avg Opportunity
                            </span>
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {cluster.avgOpportunityScore.toFixed(1)} / 10
                            </span>
                          </div>
                        </div>

                        {/* Book Concept Idea */}
                        <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-[11px] text-brand-600 dark:text-brand-400">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Suggested Book Idea</span>
                          </div>
                          <p className="line-clamp-2 text-[11px]">{cluster.suggestedBookConcept}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-brand-600 dark:text-brand-400 font-semibold">
                        <span>{isExpanded ? 'Hide Keywords ▲' : 'View Keywords ▼'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Cluster Details & Keyword List */}
              {expandedClusterId && (
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  {(() => {
                    const selected = clusters.find((c) => c.id === expandedClusterId);
                    if (!selected) return null;

                    return (
                      <>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {selected.name}
                              </h2>
                              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400">
                                {selected.keywords.length} terms
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Concept: {selected.suggestedBookConcept}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href={`/builder/title?primary=${encodeURIComponent(selected.keywords[0]?.term || 'menopause cookbook')}`}
                              className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Build Title from Cluster</span>
                            </a>
                          </div>
                        </div>

                        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 text-[11px] font-semibold text-slate-400 uppercase">
                                <th className="py-2.5 px-4">Keyword Term</th>
                                <th className="py-2.5 px-3 text-right">Est. Monthly Volume</th>
                                <th className="py-2.5 px-3 text-center">Trend</th>
                                <th className="py-2.5 px-3 text-center">Competition</th>
                                <th className="py-2.5 px-3 text-center">Opportunity</th>
                                <th className="py-2.5 px-3">Intent</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                              {selected.keywords.map((kw) => (
                                <tr key={kw.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                  <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                                    {kw.term}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                                    {formatNumber(kw.estimatedMonthlyVol)}
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase bg-slate-100 dark:bg-slate-800 text-slate-500">
                                      {kw.volumeTrend}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-center font-mono">
                                    {kw.competitionScore.toFixed(1)}
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    <OpportunityBadge score={kw.opportunityScore} size="sm" showLabel={false} />
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-500 capitalize">
                                    {kw.intent.replace('_', ' ')}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
