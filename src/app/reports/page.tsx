'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import {
  FileText,
  Download,
  Copy,
  Check,
  RefreshCw,
  Search,
  Sparkles,
  BookOpen,
} from 'lucide-react';

function ReportsContent() {
  const searchParams = useSearchParams();

  const initialNiche = searchParams.get('niche') || 'Menopause Cookbook';
  const initialMarketplace = searchParams.get('mp') || 'amazon.com';

  const [niche, setNiche] = useState(initialNiche);
  const [marketplace, setMarketplace] = useState(initialMarketplace);
  const [reportMarkdown, setReportMarkdown] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchReport = async (targetNiche: string, mp: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche: targetNiche, marketplace: mp }),
      });
      const data = await res.json();
      setReportMarkdown(data.reportMarkdown || '');
    } catch (err) {
      console.error('Error generating report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(initialNiche, initialMarketplace);
  }, [initialNiche, initialMarketplace]);

  const handleCopy = () => {
    navigator.clipboard.writeText(reportMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([reportMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kdp-research-report-${niche.toLowerCase().replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14]">
      <Header currentMarketplace={marketplace} onMarketplaceChange={(mp) => {
        setMarketplace(mp);
        fetchReport(niche, mp);
      }} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    Automated Research Reports Hub
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Generate comprehensive, exportable publishing intelligence reports in structured Markdown.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!reportMarkdown}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs flex items-center gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Markdown</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={!reportMarkdown}
                className="px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .MD</span>
              </button>
            </div>
          </div>

          {/* Search / Target Niche Selector */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="Enter target niche (e.g. Menopause Cookbook, GLP-1 Recipes)..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
            />
            <button
              type="button"
              onClick={() => fetchReport(niche, marketplace)}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
            >
              {isLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Report</span>
                </>
              )}
            </button>
          </div>

          {/* Report Viewer */}
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-brand-500" />
              <p className="text-xs">Synthesizing comprehensive research dossier...</p>
            </div>
          ) : !reportMarkdown ? (
            <div className="p-12 text-center text-slate-400">Failed to load report.</div>
          ) : (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed space-y-4 whitespace-pre-line text-slate-700 dark:text-slate-300 font-sans">
                {reportMarkdown}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070b14] text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
        </div>
      }
    >
      <ReportsContent />
    </Suspense>
  );
}
