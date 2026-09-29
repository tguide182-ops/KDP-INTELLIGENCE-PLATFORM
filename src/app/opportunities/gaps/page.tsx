'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { OpportunityGap } from '@/services/GapAnalysisEngine';
import { formatNumber } from '@/lib/utils';
import {
  Target,
  Search,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Flame,
  BookOpen,
  RefreshCw,
  Lightbulb,
  Compass,
} from 'lucide-react';

function OpportunityGapsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialNiche = searchParams.get('niche') || 'menopause cookbook';
  const initialMarketplace = searchParams.get('mp') || 'amazon.com';

  const [niche, setNiche] = useState(initialNiche);
  const [marketplace, setMarketplace] = useState(initialMarketplace);
  const [gaps, setGaps] = useState<OpportunityGap[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGaps = async (targetNiche: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/opportunities/gaps?niche=${encodeURIComponent(targetNiche)}`);
      const data = await res.json();
      setGaps(data.gaps || []);
    } catch (err) {
      console.error('Error fetching gaps:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGaps(initialNiche);
  }, [initialNiche]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (niche.trim()) {
      router.push(`/opportunities/gaps?niche=${encodeURIComponent(niche.trim())}&mp=${marketplace}`);
      fetchGaps(niche.trim());
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
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    Opportunity Gap Analyzer
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Discover high-demand customer search queries underserved by current first-page competitor books.
                  </p>
                </div>
              </div>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="Analyze niche gaps..."
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-52 focus:outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-500"
              >
                Analyze Gaps
              </button>
            </form>
          </div>

          {/* Educational Callout */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>How Opportunity Gaps Work:</strong> Instead of competing head-to-head against established market leaders with 3,000+ reviews on generic keywords, this engine isolates high-demand sub-audiences, dietary intersections, and practical format angles that have strong customer searches but minimal first-page competitor representation.
            </div>
          </div>

          {isLoading ? (
            <div className="py-24 flex justify-center items-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-brand-500" />
            </div>
          ) : gaps.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No opportunity gaps identified.</div>
          ) : (
            <div className="space-y-4">
              {gaps.map((gap) => (
                <div
                  key={gap.id}
                  className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm hover:border-brand-500/40 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                        {gap.category} Gap
                      </span>
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500 text-white uppercase">
                        {gap.impact} Impact
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        Opp Score: {gap.opportunityScore.toFixed(1)} / 10
                      </span>
                    </div>

                    <div className="text-xs font-mono text-slate-400">
                      Demand: <strong className="text-slate-700 dark:text-slate-200">~{formatNumber(gap.estimatedMonthlyDemand)}/mo</strong> • Page 1 Coverage: <strong className="text-amber-500">{gap.competitorPageOneCoverage} of 10 books</strong>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {gap.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {gap.gapExplanation}
                    </p>
                  </div>

                  {/* Positioning Recommendation */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                    <div className="font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      <span>Recommended Positioning Angle</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {gap.positioningRecommendation}
                    </p>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                        Sample Title Hook: <strong className="text-slate-800 dark:text-slate-200">&quot;{gap.sampleBookTitle}&quot;</strong>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/builder/title?primary=${encodeURIComponent(gap.searchDemandPhrases[0] || niche)}&audience=${encodeURIComponent(gap.category === 'Demographic' ? 'Women Over 50' : 'Beginners')}`)
                          }
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-xs flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Build Title</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/studio/books?title=${encodeURIComponent(gap.sampleBookTitle)}&primary=${encodeURIComponent(gap.searchDemandPhrases[0] || niche)}&audience=${encodeURIComponent(gap.category === 'Demographic' ? 'Women Over 50' : 'Beginners')}&niche=${encodeURIComponent(niche)}`)
                          }
                          className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1"
                        >
                          <Compass className="w-3 h-3" />
                          <span>Architect Blueprint &rarr;</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function OpportunityGapsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070b14] text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
        </div>
      }
    >
      <OpportunityGapsContent />
    </Suspense>
  );
}
