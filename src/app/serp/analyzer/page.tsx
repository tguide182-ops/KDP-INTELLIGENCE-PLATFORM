'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { SERPBook, SERPAnalysisResult } from '@/services/SERPService';
import { formatNumber, formatBSR, formatCurrency } from '@/lib/utils';
import {
  BookOpen,
  Search,
  ExternalLink,
  ArrowUpDown,
  Filter,
  RefreshCw,
  GitFork,
  CheckSquare,
  Square,
  Sparkles,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

function SERPAnalyzerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get('q') || 'menopause cookbook';
  const initialMarketplace = searchParams.get('mp') || 'amazon.com';

  const [query, setQuery] = useState(initialQuery);
  const [marketplace, setMarketplace] = useState(initialMarketplace);
  const [serpData, setSerpData] = useState<SERPAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<'rank' | 'bsr' | 'reviewCount' | 'price' | 'estimatedAgeDays' | 'titleMatchRatio'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedAsins, setSelectedAsins] = useState<Set<string>>(new Set());

  const fetchSERP = async (q: string, mp: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/serp/analyze?query=${encodeURIComponent(q)}&marketplace=${mp}`);
      const data = await res.json();
      setSerpData(data);
    } catch (err) {
      console.error('Error fetching SERP:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSERP(initialQuery, initialMarketplace);
  }, [initialQuery, initialMarketplace]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/serp/analyzer?q=${encodeURIComponent(query.trim())}&mp=${marketplace}`);
      fetchSERP(query, marketplace);
    }
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedBooks = useMemo(() => {
    if (!serpData?.books) return [];
    return [...serpData.books].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [serpData, sortField, sortOrder]);

  const toggleSelectAsin = (asin: string) => {
    const next = new Set(selectedAsins);
    if (next.has(asin)) next.delete(asin);
    else next.add(asin);
    setSelectedAsins(next);
  };

  const handleCompareSelected = () => {
    if (selectedAsins.size >= 2) {
      router.push(`/competitors/compare?asins=${Array.from(selectedAsins).join(',')}&mp=${marketplace}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14]">
      <Header currentMarketplace={marketplace} onMarketplaceChange={(mp) => {
        setMarketplace(mp);
        fetchSERP(query, mp);
      }} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    First-Page Amazon SERP Analyzer
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Granular breakdown of every listing on Page 1: BSR velocity, estimated sales, pricing, and keyword match ratios.
                  </p>
                </div>
              </div>
            </div>

            {/* Compare Selected Button */}
            {selectedAsins.size >= 2 && (
              <button
                type="button"
                onClick={handleCompareSelected}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-500/30 flex items-center gap-1.5 transition-all"
              >
                <GitFork className="w-4 h-4" />
                <span>Compare {selectedAsins.size} Books Side-by-Side</span>
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <form onSubmit={handleSearch} className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter keyword to inspect Amazon Page 1 (e.g. menopause cookbook)..."
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
                    <span>Inspect Page 1</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Overview Stat Cards */}
          {serpData && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                  Median BSR
                </span>
                <span className="text-xl font-bold font-mono text-brand-600 dark:text-brand-400">
                  {formatBSR(serpData.medianBSR)}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">Top 10 sales velocity</p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                  Average Price
                </span>
                <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                  {formatCurrency(serpData.avgPrice)}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">Paperback edition</p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                  Average Reviews
                </span>
                <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                  {formatNumber(serpData.avgReviews)}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">Review barrier</p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                  Newcomers (&lt;1 yr)
                </span>
                <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {serpData.pctNewerThanOneYear}%
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">Penetration potential</p>
              </div>
            </div>
          )}

          {/* SERP Table */}
          {isLoading ? (
            <div className="py-24 flex justify-center items-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-brand-500" />
            </div>
          ) : !serpData ? (
            <div className="p-12 text-center text-slate-400">No results available.</div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-3 w-8"></th>
                    <th
                      onClick={() => handleSort('rank')}
                      className="py-3 px-3 w-12 text-center cursor-pointer hover:text-slate-700"
                    >
                      Rank
                    </th>
                    <th className="py-3 px-4">Book Details & Keyword Matches</th>
                    <th
                      onClick={() => handleSort('bsr')}
                      className="py-3 px-3 text-right cursor-pointer hover:text-slate-700"
                    >
                      BSR
                    </th>
                    <th className="py-3 px-3 text-right">Est. Monthly Sales</th>
                    <th
                      onClick={() => handleSort('price')}
                      className="py-3 px-3 text-right cursor-pointer hover:text-slate-700"
                    >
                      Price
                    </th>
                    <th
                      onClick={() => handleSort('reviewCount')}
                      className="py-3 px-3 text-center cursor-pointer hover:text-slate-700"
                    >
                      Reviews
                    </th>
                    <th
                      onClick={() => handleSort('titleMatchRatio')}
                      className="py-3 px-3 text-center cursor-pointer hover:text-slate-700"
                    >
                      Title Match
                    </th>
                    <th
                      onClick={() => handleSort('estimatedAgeDays')}
                      className="py-3 px-3 text-right cursor-pointer hover:text-slate-700"
                    >
                      Age
                    </th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {sortedBooks.map((b) => {
                    const isSelected = selectedAsins.has(b.asin);

                    return (
                      <tr
                        key={b.asin}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                          isSelected ? 'bg-brand-50/40 dark:bg-brand-950/20' : ''
                        }`}
                      >
                        {/* Select Checkbox */}
                        <td className="py-3 px-3">
                          <button
                            type="button"
                            onClick={() => toggleSelectAsin(b.asin)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-brand-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* Rank */}
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-400">
                          #{b.rank}
                        </td>

                        {/* Title & Details */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                            {b.title}
                          </div>
                          {b.subtitle && (
                            <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {b.subtitle}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                            <span>By <strong>{b.author}</strong></span>
                            <span>•</span>
                            <span className="font-mono">{b.asin}</span>
                            <span>•</span>
                            <span>{b.format} ({b.pages} pages)</span>
                          </div>
                        </td>

                        {/* BSR */}
                        <td className="py-3 px-3 text-right font-mono font-bold text-brand-600 dark:text-brand-400">
                          {formatBSR(b.bsr)}
                        </td>

                        {/* Est Sales & Revenue */}
                        <td className="py-3 px-3 text-right font-mono">
                          <div className="font-bold text-emerald-600 dark:text-emerald-400">
                            ~{formatNumber(b.estimatedMonthlySales)}/mo
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {formatCurrency(b.estimatedMonthlyRevenue)}/mo
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-3 px-3 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                          {formatCurrency(b.price)}
                        </td>

                        {/* Reviews */}
                        <td className="py-3 px-3 text-center">
                          <div className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                            {formatNumber(b.reviewCount)}
                          </div>
                          <div className="text-[10px] text-amber-500 font-mono">
                            ★ {b.rating.toFixed(1)}
                          </div>
                        </td>

                        {/* Title & Subtitle Keyword Match Ratio */}
                        <td className="py-3 px-3 text-center font-mono">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              b.titleMatchRatio >= 0.8
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : b.titleMatchRatio >= 0.5
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}
                          >
                            {Math.round(b.titleMatchRatio * 100)}% Match
                          </span>
                        </td>

                        {/* Age */}
                        <td className="py-3 px-3 text-right font-mono text-slate-400">
                          {b.estimatedAgeDays} days
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                router.push(`/competitors/reverse-asin?asin=${b.asin}&mp=${marketplace}`)
                              }
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-slate-700 text-[11px] font-medium transition-colors"
                              title="Reverse ASIN keywords"
                            >
                              Reverse
                            </button>
                            <a
                              href={`https://${marketplace}/dp/${b.asin}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                              title="Open on Amazon"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function SERPAnalyzerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070b14] text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
        </div>
      }
    >
      <SERPAnalyzerContent />
    </Suspense>
  );
}
