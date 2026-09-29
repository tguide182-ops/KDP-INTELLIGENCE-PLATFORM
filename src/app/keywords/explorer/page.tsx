'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { KeywordTable } from '@/components/KeywordTable';
import { KeywordItem } from '@/lib/types';
import { Tooltip } from '@/components/Tooltip';
import {
  Search,
  Sparkles,
  SlidersHorizontal,
  RefreshCw,
  Info,
  Clock,
  Layers,
  Database,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

function KeywordExplorerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get('q') || 'menopause cookbook';
  const initialMarketplace = searchParams.get('mp') || 'amazon.com';

  const [query, setQuery] = useState(initialQuery);
  const [marketplace, setMarketplace] = useState(initialMarketplace);
  const [expand, setExpand] = useState(false);
  const [keywords, setKeywords] = useState<KeywordItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataSource, setDataSource] = useState<'REAL' | 'DEMO' | 'HYBRID'>('REAL');
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchKeywords = async (seed: string, mp: string, doExpand: boolean) => {
    if (!seed.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(
        `/api/keywords/explore?query=${encodeURIComponent(seed.trim())}&marketplace=${mp}&expand=${doExpand}`
      );
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setKeywords(data.keywords || []);
      setDataSource(data.source || 'REAL');
      setDurationMs(data.durationMs || 0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch keywords';
      console.error('Fetch error:', err);
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKeywords(initialQuery, initialMarketplace, expand);
  }, [initialQuery, initialMarketplace]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/keywords/explorer?q=${encodeURIComponent(query.trim())}&mp=${marketplace}`);
      fetchKeywords(query, marketplace, expand);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14]">
      <Header currentMarketplace={marketplace} onMarketplaceChange={(mp) => {
        setMarketplace(mp);
        fetchKeywords(query, mp, expand);
      }} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  Keyword Explorer
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                  {marketplace}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Discover related Amazon search phrases, estimated volume, and competitive opportunity.
              </p>
            </div>

            {/* Data Source Provenance Pill */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Source:</span>
              <span
                className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-md border uppercase ${
                  dataSource === 'REAL'
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                    : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                }`}
              >
                {dataSource === 'REAL' ? 'Live Amazon Completion API' : 'Deterministic Demo Seed'}
              </span>
              {durationMs !== null && (
                <span className="text-slate-400 text-[11px] font-mono">
                  ({durationMs}ms)
                </span>
              )}
            </div>
          </div>

          {/* Search Box & Expansion Controls */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter seed keyword (e.g. menopause cookbook, glp-1 recipes)..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 font-medium"
                />
              </div>

              {/* Expansion Toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap px-2">
                <input
                  type="checkbox"
                  checked={expand}
                  onChange={(e) => {
                    setExpand(e.target.checked);
                    fetchKeywords(query, marketplace, e.target.checked);
                  }}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span>Multi-Source Expansion (A-Z + Modifiers)</span>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold text-xs tracking-wide shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Discovering...</span>
                  </>
                ) : (
                  <>
                    <span>Search</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Transparent Disclaimer Callout */}
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              <Info className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
              <div>
                <strong>Estimated Monthly Searches:</strong> Search volume is an estimate generated
                from available market signals, autocomplete rank prominence, and modifier intent. It
                should be used as a comparative research metric rather than an exact Amazon figure.
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Keyword Data Table */}
          <KeywordTable
            keywords={keywords}
            currentMarketplace={marketplace}
            isLoading={isLoading}
            onSaveKeyword={async (kw) => {
              try {
                await fetch('/api/keywords/save', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ keyword: kw }),
                });
              } catch (err) {
                console.error('Save failed:', err);
              }
            }}
          />
        </main>
      </div>
    </div>
  );
}

export default function KeywordExplorerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070b14] text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
        </div>
      }
    >
      <KeywordExplorerContent />
    </Suspense>
  );
}
