'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { SubNicheItem } from '@/services/NicheService';
import { OpportunityBadge } from '@/components/OpportunityBadge';
import { formatNumber, formatBSR, formatCurrency } from '@/lib/utils';
import {
  Compass,
  Search,
  ArrowRight,
  TrendingUp,
  Bookmark,
  Sparkles,
  BarChart3,
  BookOpen,
  Filter,
  RefreshCw,
  Flame,
  ShieldCheck,
} from 'lucide-react';

function NicheFinderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get('q') || 'cookbook';
  const initialMarketplace = searchParams.get('mp') || 'amazon.com';

  const [query, setQuery] = useState(initialQuery);
  const [marketplace, setMarketplace] = useState(initialMarketplace);
  const [niches, setNiches] = useState<SubNicheItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savedNicheIds, setSavedNicheIds] = useState<Set<string>>(new Set());

  const fetchNiches = async (seed: string, mp: string) => {
    if (!seed.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/niches/find?query=${encodeURIComponent(seed.trim())}&marketplace=${mp}`);
      const data = await res.json();
      setNiches(data.niches || []);
    } catch (err) {
      console.error('Error fetching sub-niches:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNiches(initialQuery, initialMarketplace);
  }, [initialQuery, initialMarketplace]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/niches/finder?q=${encodeURIComponent(query.trim())}&mp=${marketplace}`);
      fetchNiches(query, marketplace);
    }
  };

  const toggleSaveNiche = (id: string) => {
    const next = new Set(savedNicheIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSavedNicheIds(next);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14]">
      <Header currentMarketplace={marketplace} onMarketplaceChange={(mp) => {
        setMarketplace(mp);
        fetchNiches(query, mp);
      }} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    Niche Finder
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Discover high-opportunity sub-niches with observed demand, competition, and newcomer penetration.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Seeds */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Popular:</span>
              {['cookbook', 'planner', 'workbook', 'diet'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setQuery(s);
                    router.push(`/niches/finder?q=${encodeURIComponent(s)}&mp=${marketplace}`);
                    fetchNiches(s, marketplace);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-brand-500 capitalize"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <form onSubmit={handleSearch} className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter a broad category (e.g. cookbook, planner, fitness)..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs tracking-wide shadow-sm transition-all flex items-center gap-1.5"
              >
                {isLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Find Sub-Niches</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Niche Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {niches.map((niche) => {
              const isSaved = savedNicheIds.has(niche.id);

              return (
                <div
                  key={niche.id}
                  className="group relative p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm hover:border-brand-500/50 hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Title & Save */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {niche.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5 font-mono">
                          &quot;{niche.primaryKeyword}&quot;
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleSaveNiche(niche.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isSaved
                            ? 'text-amber-500'
                            : 'text-slate-300 dark:text-slate-600 hover:text-amber-400'
                        }`}
                        title={isSaved ? 'Saved Niche' : 'Save Niche'}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
                      </button>
                    </div>

                    {/* Scores Pill */}
                    <div className="mt-3 flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
                      <OpportunityBadge score={niche.opportunityScore} size="sm" />
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="text-emerald-600 dark:text-emerald-400" title="Demand Score">
                          D: {niche.demandScore.toFixed(1)}
                        </span>
                        <span className="text-amber-600 dark:text-amber-400" title="Competition Score">
                          C: {niche.competitionScore.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                          Median BSR
                        </span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {formatBSR(niche.medianBSR)}
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                          Avg Reviews
                        </span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {formatNumber(niche.avgReviews)}
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                          Avg Price
                        </span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {formatCurrency(niche.avgPrice)}
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                          Newcomers (&lt;1 yr)
                        </span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {niche.newcomerRatio}%
                        </span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {niche.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/serp/analyzer?q=${encodeURIComponent(niche.primaryKeyword)}&mp=${marketplace}`)
                      }
                      className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>SERP (Page 1)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/niches/analyzer?niche=${encodeURIComponent(niche.name)}&mp=${marketplace}`)
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Analyze Dossier</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function NicheFinderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070b14] text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
        </div>
      }
    >
      <NicheFinderContent />
    </Suspense>
  );
}
