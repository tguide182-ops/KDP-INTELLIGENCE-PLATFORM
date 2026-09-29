'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { KeywordTable } from '@/components/KeywordTable';
import { KeywordItem } from '@/lib/types';
import { Bookmark, Sparkles, FolderKanban, Tag, Check, RefreshCw } from 'lucide-react';

export default function SavedKeywordsPage() {
  const [marketplace, setMarketplace] = useState('amazon.com');
  const [savedKeywords, setSavedKeywords] = useState<KeywordItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSaved = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/keywords/save');
      const data = await res.json();
      if (data && data.saved) {
        // Map Prisma saved records back to KeywordItem format
        const items: KeywordItem[] = data.saved.map((s: any) => {
          const kw = s.keyword;
          const metric = kw.metrics?.[0] || {};
          let demandBrk = {};
          let compBrk = {};
          try {
            demandBrk = JSON.parse(metric.demandBreakdown || '{}');
            compBrk = JSON.parse(metric.competitionBreakdown || '{}');
          } catch {}

          return {
            id: kw.id,
            term: kw.term,
            normalizedTerm: kw.normalizedTerm,
            marketplace: kw.marketplace,
            phraseType: kw.phraseType,
            wordCount: kw.wordCount,
            intent: kw.intent,
            parentKeyword: kw.parentKeyword,
            estimatedMonthlyVol: metric.estimatedMonthlyVol || 100,
            volumeTrend: metric.volumeTrend || 'stable',
            amazonResultCount: metric.amazonResultCount || 500,
            confidenceLevel: metric.confidenceLevel || 'MEDIUM',
            dataSource: metric.dataSource || 'REAL',
            demandScore: metric.demandScore || 5.0,
            competitionScore: metric.competitionScore || 5.0,
            opportunityScore: metric.opportunityScore || 5.0,
            demandBreakdown: demandBrk as any,
            competitionBreakdown: compBrk as any,
            isSaved: true,
            isStarred: s.starred,
            status: s.status,
            notes: s.notes,
            tags: s.tags ? JSON.parse(s.tags) : [],
            projectId: s.projectId,
            lastUpdated: s.updatedAt,
          };
        });
        setSavedKeywords(items);
      }
    } catch (err) {
      console.error('Failed to load saved keywords:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14]">
      <Header currentMarketplace={marketplace} onMarketplaceChange={setMarketplace} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Bookmark className="w-5 h-5 fill-amber-500" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  Saved Keywords
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage, categorize, tag, and export your curated KDP publishing keywords.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadSaved}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {isLoading ? (
            <div className="py-20 flex justify-center items-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
            </div>
          ) : savedKeywords.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40">
              <Bookmark className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                No saved keywords yet
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Go to the Keyword Explorer and click the bookmark icon next to any promising search phrase to save it here.
              </p>
            </div>
          ) : (
            <KeywordTable
              keywords={savedKeywords}
              currentMarketplace={marketplace}
            />
          )}
        </main>
      </div>
    </div>
  );
}
