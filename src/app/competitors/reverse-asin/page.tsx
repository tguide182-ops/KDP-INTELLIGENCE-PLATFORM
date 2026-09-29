'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { ReverseASINResult } from '@/services/ReverseASINService';
import { formatNumber, formatBSR, formatCurrency } from '@/lib/utils';
import { OpportunityBadge } from '@/components/OpportunityBadge';
import {
  GitFork,
  Search,
  ExternalLink,
  Sparkles,
  BookOpen,
  TrendingUp,
  Bookmark,
  RefreshCw,
  Plus,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';

function ReverseASINContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialAsin = searchParams.get('asin') || 'B0E9L82ZZ1';
  const initialMarketplace = searchParams.get('mp') || 'amazon.com';

  const [asin, setAsin] = useState(initialAsin);
  const [marketplace, setMarketplace] = useState(initialMarketplace);
  const [data, setData] = useState<ReverseASINResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchASIN = async (targetAsin: string, mp: string) => {
    if (!targetAsin.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/competitors/reverse-asin?asin=${encodeURIComponent(targetAsin.trim())}&marketplace=${mp}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Error looking up ASIN:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchASIN(initialAsin, initialMarketplace);
  }, [initialAsin, initialMarketplace]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (asin.trim()) {
      router.push(`/competitors/reverse-asin?asin=${encodeURIComponent(asin.trim())}&mp=${marketplace}`);
      fetchASIN(asin, marketplace);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14]">
      <Header currentMarketplace={marketplace} onMarketplaceChange={(mp) => {
        setMarketplace(mp);
        fetchASIN(asin, mp);
      }} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  <GitFork className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    Reverse ASIN Intelligence
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Extract competitor keyword signals, title/subtitle architectures, and ranking difficulty from any Amazon ASIN.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick ASINs */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 text-[10px] font-semibold uppercase">Presets:</span>
              {[
                { label: 'High Protein Menopause', asin: 'B0E9L82ZZ1' },
                { label: 'Menopause Reset', asin: 'B0C7K9N81P' },
              ].map((preset) => (
                <button
                  key={preset.asin}
                  type="button"
                  onClick={() => {
                    setAsin(preset.asin);
                    router.push(`/competitors/reverse-asin?asin=${preset.asin}&mp=${marketplace}`);
                    fetchASIN(preset.asin, marketplace);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-brand-500"
                >
                  {preset.label}
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
                  value={asin}
                  onChange={(e) => setAsin(e.target.value)}
                  placeholder="Enter Amazon ASIN (e.g. B0E9L82ZZ1)..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 font-mono font-medium uppercase"
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
                    <span>Reverse Engineer</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {isLoading ? (
            <div className="py-24 flex justify-center items-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-brand-500" />
            </div>
          ) : !data ? (
            <div className="p-12 text-center text-slate-400">No book found for this ASIN.</div>
          ) : (
            <div className="space-y-6">
              {/* Book Overview Card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                      ASIN: {data.book.asin}
                    </span>
                    <span className="text-xs text-slate-400">
                      Published {new Date(data.book.publicationDate).toLocaleDateString()}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
                    {data.book.title}
                  </h2>
                  {data.book.subtitle && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {data.book.subtitle}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                    <span>Author: <strong className="text-slate-700 dark:text-slate-200">{data.book.author}</strong></span>
                    <span>•</span>
                    <span>Publisher: <strong>{data.book.publisher}</strong></span>
                    <span>•</span>
                    <span>Format: <strong>{data.book.format} ({data.book.pages} pages)</strong></span>
                  </div>

                  {/* Metrics Tiles */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        BSR Sales Rank
                      </span>
                      <span className="text-lg font-mono font-bold text-brand-600 dark:text-brand-400">
                        {formatBSR(data.book.bsr)}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Est. Monthly Sales
                      </span>
                      <span className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ~{formatNumber(data.book.estimatedMonthlySales)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {formatCurrency(data.book.estimatedMonthlyRevenue)}/mo
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Reviews & Rating
                      </span>
                      <span className="text-lg font-mono font-bold text-slate-800 dark:text-slate-200">
                        {formatNumber(data.book.reviewCount)}
                      </span>
                      <span className="text-[10px] text-amber-500 block font-mono">
                        ★ {data.book.rating.toFixed(1)} / 5.0
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Paperback Price
                      </span>
                      <span className="text-lg font-mono font-bold text-slate-800 dark:text-slate-200">
                        {formatCurrency(data.book.price)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct Linkout & Actions */}
                <div className="flex flex-col justify-between gap-3 shrink-0">
                  <a
                    href={`https://${marketplace}/dp/${data.book.asin}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    <span>View on Amazon</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/competitors/compare?asins=${data.book.asin},B0C7K9N81P&mp=${marketplace}`)
                    }
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <GitFork className="w-3.5 h-3.5" />
                    <span>Compare Book</span>
                  </button>
                </div>
              </div>

              {/* Title & Subtitle Architecture Analysis */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-500" />
                    <span>Title & Subtitle Architecture Breakdown</span>
                  </h3>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Structure Score: {data.titleStructure.structureScore} / 10
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-semibold uppercase text-slate-400">
                      Primary Target Keyword in Title
                    </span>
                    <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                      &quot;{data.titleStructure.primaryKeywordFound}&quot;
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Character count: {data.titleStructure.titleCharCount} chars
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-semibold uppercase text-slate-400">
                      Secondary Keyword Hooks in Subtitle
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {data.titleStructure.secondaryKeywordsFound.map((sk) => (
                        <span key={sk} className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 font-mono text-[10px]">
                          {sk}
                        </span>
                      ))}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Subtitle character count: {data.titleStructure.subtitleCharCount} chars
                    </div>
                  </div>
                </div>
              </div>

              {/* Extracted Keyword Signals Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      Extracted Ranking Keyword Signals ({data.keywordSignals.length})
                    </h3>
                    <p className="text-xs text-slate-400">
                      Terms driving apparent organic search visibility and sales velocity for this book
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4">Keyword Term</th>
                        <th className="py-3 px-3 text-right">Est. Monthly Searches</th>
                        <th className="py-3 px-3 text-center">Ranking Probability</th>
                        <th className="py-3 px-3">Intent</th>
                        <th className="py-3 px-3 text-center">In Title</th>
                        <th className="py-3 px-3 text-center">In Subtitle</th>
                        <th className="py-3 px-3 text-center">Opportunity</th>
                        <th className="py-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {data.keywordSignals.map((sig) => (
                        <tr key={sig.keyword} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                            {sig.keyword}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                            {formatNumber(sig.estimatedMonthlyVol)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                sig.rankingProbability === 'High'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {sig.rankingProbability}
                            </span>
                          </td>
                          <td className="py-3 px-3 capitalize text-slate-500">
                            {sig.intent.replace('_', ' ')}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {sig.inTitle ? (
                              <span className="text-emerald-600 font-bold">✓</span>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-600">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {sig.inSubtitle ? (
                              <span className="text-emerald-600 font-bold">✓</span>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-600">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <OpportunityBadge score={sig.opportunityScore} size="sm" showLabel={false} />
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                router.push(`/keywords/explorer?q=${encodeURIComponent(sig.keyword)}&mp=${marketplace}`)
                              }
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 hover:text-brand-600 text-[11px] font-medium"
                            >
                              Explore
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Similar Competitor Books */}
              <div className="space-y-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Direct Category Competitors
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {data.similarCompetitors.map((comp) => (
                    <div
                      key={comp.asin}
                      className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 space-y-3 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            ASIN: {comp.asin}
                          </span>
                          <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                            {formatBSR(comp.bsr)}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1 line-clamp-2">
                          {comp.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">By {comp.author}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <span className="font-mono text-slate-700 dark:text-slate-300">
                          {formatCurrency(comp.price)}
                        </span>
                        <span className="text-amber-500 font-mono">
                          ★ {comp.rating.toFixed(1)} ({formatNumber(comp.reviewCount)})
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setAsin(comp.asin);
                            router.push(`/competitors/reverse-asin?asin=${comp.asin}&mp=${marketplace}`);
                            fetchASIN(comp.asin, marketplace);
                          }}
                          className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                        >
                          Reverse
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ReverseASINPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070b14] text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
        </div>
      }
    >
      <ReverseASINContent />
    </Suspense>
  );
}
