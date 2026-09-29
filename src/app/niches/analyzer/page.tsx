'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { NicheDossier } from '@/services/NicheService';
import { OpportunityBadge } from '@/components/OpportunityBadge';
import { formatNumber, formatBSR, formatCurrency } from '@/lib/utils';
import {
  BarChart3,
  BookOpen,
  Search,
  ExternalLink,
  Flame,
  ShieldCheck,
  ShieldAlert,
  Target,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Clock,
  DollarSign,
  Star,
  Users,
  AlertTriangle,
  Lightbulb,
  FileSpreadsheet,
} from 'lucide-react';

function NicheAnalyzerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialNiche = searchParams.get('niche') || 'Menopause Cookbook';
  const initialMarketplace = searchParams.get('mp') || 'amazon.com';

  const [nicheQuery, setNicheQuery] = useState(initialNiche);
  const [marketplace, setMarketplace] = useState(initialMarketplace);
  const [dossier, setDossier] = useState<NicheDossier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'distributions' | 'books' | 'patterns' | 'gaps'>('overview');

  const fetchDossier = async (niche: string, mp: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/niches/analyze?niche=${encodeURIComponent(niche)}&marketplace=${mp}`);
      const data = await res.json();
      setDossier(data.dossier);
    } catch (err) {
      console.error('Error loading niche dossier:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDossier(initialNiche, initialMarketplace);
  }, [initialNiche, initialMarketplace]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (nicheQuery.trim()) {
      router.push(`/niches/analyzer?niche=${encodeURIComponent(nicheQuery.trim())}&mp=${marketplace}`);
      fetchDossier(nicheQuery, marketplace);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14]">
      <Header currentMarketplace={marketplace} onMarketplaceChange={(mp) => {
        setMarketplace(mp);
        fetchDossier(nicheQuery, mp);
      }} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    Niche Analyzer Dossier
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Comprehensive 16-point market dossier, distribution models, competitor books, and opportunity gaps.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Search */}
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                type="text"
                value={nicheQuery}
                onChange={(e) => setNicheQuery(e.target.value)}
                placeholder="Analyze niche..."
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-52 focus:outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-500"
              >
                Analyze
              </button>
            </form>
          </div>

          {isLoading ? (
            <div className="py-24 flex justify-center items-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-brand-500" />
            </div>
          ) : !dossier ? (
            <div className="p-12 text-center text-slate-400">No dossier found.</div>
          ) : (
            <div className="space-y-6">
              {/* Executive Summary Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold mb-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{dossier.marketOverview.marketHealth} Publishing Market</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {dossier.nicheName}
                    </h2>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Primary Target Keyword: &quot;{dossier.primaryKeyword}&quot;
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <OpportunityBadge score={dossier.opportunityScore} size="lg" />
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/serp/analyzer?q=${encodeURIComponent(dossier.primaryKeyword)}&mp=${marketplace}`)
                      }
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>View First Page</span>
                    </button>
                  </div>
                </div>

                {/* 6 Executive Metric Tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Demand Score
                    </span>
                    <span className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {dossier.demandScore.toFixed(1)} / 10
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Competition Score
                    </span>
                    <span className="text-lg font-mono font-bold text-amber-600 dark:text-amber-400">
                      {dossier.competitionScore.toFixed(1)} / 10
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Median BSR
                    </span>
                    <span className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100">
                      {formatBSR(dossier.marketOverview.medianBSR)}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Avg Paperback Price
                    </span>
                    <span className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(dossier.marketOverview.avgPrice)}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Avg Reviews
                    </span>
                    <span className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100">
                      {formatNumber(dossier.marketOverview.avgReviews)}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Newcomers (&lt;1 yr)
                    </span>
                    <span className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {dossier.marketOverview.newcomerPenetrationPct}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-semibold">
                {[
                  { id: 'overview', label: '1. Overview & Signals' },
                  { id: 'distributions', label: '2. Distribution Charts (BSR, Reviews, Price, Age)' },
                  { id: 'books', label: '3. Top Competitors on Page 1' },
                  { id: 'patterns', label: '4. Title & Content Patterns' },
                  { id: 'gaps', label: '5. Opportunity Gaps & Risks' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id as any)}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      activeTab === t.id
                        ? 'bg-brand-500 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab 1: Overview & Signals */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Market Health & Opportunity */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-500" />
                      <span>Opportunity Verdict</span>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {dossier.opportunityLabel}. The market shows an estimated monthly revenue of{' '}
                      <strong>{formatCurrency(dossier.marketOverview.totalEstimatedRevenue)}</strong> across top
                      first-page books with a healthy newcomer penetration rate of{' '}
                      <strong>{dossier.marketOverview.newcomerPenetrationPct}%</strong>.
                    </p>
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400">
                      <strong>Key Takeaway:</strong> New self-published titles with specific demographic positioning
                      (e.g., &quot;over 50&quot;) are successfully breaking into the top 20,000 BSR rank within 3 months of launch.
                    </div>
                  </div>

                  {/* Research Action Notes */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <span>Actionable Publishing Recommendations</span>
                    </h3>
                    <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                      {dossier.researchNotes.map((note, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Tab 2: Distribution Charts */}
              {activeTab === 'distributions' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Review Distribution */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                      <span>Review Count Distribution</span>
                      <span className="text-[10px] text-slate-400 font-normal">Page 1 Books</span>
                    </h3>
                    <div className="space-y-2 text-xs">
                      {dossier.reviewDistribution.map((b) => (
                        <div key={b.range} className="space-y-1">
                          <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>{b.range} reviews</span>
                            <span className="font-mono font-medium">{b.count} books ({b.percentage}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-brand-500 h-full rounded-full" style={{ width: `${b.percentage}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* BSR Distribution */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                      <span>BSR (Sales Velocity) Distribution</span>
                      <span className="text-[10px] text-slate-400 font-normal">Sales Velocity</span>
                    </h3>
                    <div className="space-y-2 text-xs">
                      {dossier.bsrDistribution.map((b) => (
                        <div key={b.range} className="space-y-1">
                          <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>{b.range}</span>
                            <span className="font-mono font-medium">{b.count} books ({b.percentage}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${b.percentage}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Publication Age Distribution */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                      <span>Publication Age (Newcomer Penetration)</span>
                      <span className="text-[10px] text-slate-400 font-normal">How New Are Books?</span>
                    </h3>
                    <div className="space-y-2 text-xs">
                      {dossier.ageDistribution.map((b) => (
                        <div key={b.range} className="space-y-1">
                          <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>{b.range}</span>
                            <span className="font-mono font-medium">{b.count} books ({b.percentage}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${b.percentage}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price Tier Distribution */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                      <span>Price Tier Distribution</span>
                      <span className="text-[10px] text-slate-400 font-normal">Paperback Tiers</span>
                    </h3>
                    <div className="space-y-2 text-xs">
                      {dossier.priceDistribution.map((b) => (
                        <div key={b.range} className="space-y-1">
                          <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>{b.range}</span>
                            <span className="font-mono font-medium">{b.count} books ({b.percentage}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${b.percentage}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Top Competitors */}
              {activeTab === 'books' && (
                <div className="space-y-4">
                  <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          <th className="py-3 px-3 w-12 text-center">Rank</th>
                          <th className="py-3 px-4">Book Title & Subtitle</th>
                          <th className="py-3 px-3 text-right">BSR</th>
                          <th className="py-3 px-3 text-right">Est. Sales</th>
                          <th className="py-3 px-3 text-right">Price</th>
                          <th className="py-3 px-3 text-center">Reviews</th>
                          <th className="py-3 px-3 text-center">Rating</th>
                          <th className="py-3 px-3 text-right">Age</th>
                          <th className="py-3 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {dossier.topBooks.map((b) => (
                          <tr key={b.asin} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                            <td className="py-3 px-3 text-center font-mono font-bold text-slate-400">
                              #{b.rank}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-900 dark:text-slate-100">
                                {b.title}
                              </div>
                              <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                {b.subtitle}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                By {b.author} • ASIN: <span className="font-mono">{b.asin}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-brand-600 dark:text-brand-400">
                              {formatBSR(b.bsr)}
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                              {formatNumber(b.estimatedMonthlySales)}/mo
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-slate-800 dark:text-slate-200">
                              {formatCurrency(b.price)}
                            </td>
                            <td className="py-3 px-3 text-center font-mono text-slate-600 dark:text-slate-400">
                              {formatNumber(b.reviewCount)}
                            </td>
                            <td className="py-3 px-3 text-center font-mono text-amber-500">
                              ★ {b.rating.toFixed(1)}
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-slate-400">
                              {b.estimatedAgeDays}d
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  router.push(`/competitors/reverse-asin?asin=${b.asin}&mp=${marketplace}`)
                                }
                                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-600 text-[11px] font-medium"
                              >
                                Reverse ASIN
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 4: Title & Content Patterns */}
              {activeTab === 'patterns' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Common Power Words in Titles */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      Frequent Title Power Words
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {dossier.patterns.topTitleWords.map((item) => (
                        <div
                          key={item.word}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs"
                        >
                          <span className="font-semibold text-slate-900 dark:text-white">{item.word}</span>
                          <span className="font-mono text-[10px] text-slate-400 px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700">
                            {item.frequency}x
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 text-xs text-slate-400">
                      Average Title Length: <strong>{dossier.patterns.avgTitleLength} characters</strong>
                    </div>
                  </div>

                  {/* Subtitle Hooks */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      Common Subtitle Hook Angles
                    </h3>
                    <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                      {dossier.patterns.topSubtitleAngles.map((hook, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-brand-500 font-bold">•</span>
                          <span>&quot;{hook}&quot;</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-2 text-xs text-slate-400">
                      Average Subtitle Length: <strong>{dossier.patterns.avgSubtitleLength} characters</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Opportunity Gaps & Risks */}
              {activeTab === 'gaps' && (
                <div className="space-y-6">
                  {/* Opportunity Gaps */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-500" />
                      <span>Identified Positioning & Content Gaps</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {dossier.opportunityGaps.map((gap, i) => (
                        <div
                          key={i}
                          className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500 text-white uppercase">
                              {gap.impact} Impact
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {gap.title}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {gap.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Publishing Risks */}
                  <div className="p-5 rounded-2xl border border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/20 space-y-3">
                    <h3 className="font-bold text-sm text-rose-700 dark:text-rose-400 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Publishing Risks & Compliance Guardrails</span>
                    </h3>
                    <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                      {dossier.risks.map((risk, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-rose-500 font-bold">•</span>
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function NicheAnalyzerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070b14] text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
        </div>
      }
    >
      <NicheAnalyzerContent />
    </Suspense>
  );
}
