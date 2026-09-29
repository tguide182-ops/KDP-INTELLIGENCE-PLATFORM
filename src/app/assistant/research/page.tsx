'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { OpportunityBadge } from '@/components/OpportunityBadge';
import { formatNumber } from '@/lib/utils';
import {
  Bot,
  Sparkles,
  Send,
  RefreshCw,
  Search,
  BookOpen,
  ArrowRight,
  FileText,
  Lightbulb,
  Cpu,
} from 'lucide-react';

export default function AIResearchAssistantPage() {
  const [marketplace, setMarketplace] = useState('amazon.com');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const samplePrompts = [
    'Find me profitable cookbook niches for women over 40 with relatively low competition',
    'Analyze GLP-1 high protein cookbook opportunities and positioning gaps',
    'Find underserved keywords for air fryer recipes for seniors',
    'Evaluate ADHD planner and workbook demand signals on Amazon',
  ];

  const handleRunPrompt = async (inputPrompt: string) => {
    if (!inputPrompt.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: inputPrompt, marketplace }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Error running AI research:', err);
    } finally {
      setIsLoading(false);
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
                <div className="p-2 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-700 text-white shadow-md shadow-brand-500/20">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    AI Research Assistant
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Query your KDP publishing dataset with natural language to discover underserved niches and positioning angles.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Prompt Input Container */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="relative flex items-center">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunPrompt(prompt)}
                placeholder="Ask anything (e.g. 'Find me profitable cookbook niches for women over 40 with low competition')..."
                className="w-full pl-4 pr-32 py-3.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 font-medium"
              />
              <button
                type="button"
                onClick={() => handleRunPrompt(prompt)}
                disabled={isLoading}
                className="absolute right-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-all"
              >
                {isLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Research</span>
                    <Send className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>

            {/* Suggested Prompts */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold uppercase text-slate-400">
                Suggested Prompts:
              </span>
              <div className="flex flex-wrap gap-2">
                {samplePrompts.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setPrompt(p);
                      handleRunPrompt(p);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-slate-700 text-[11px] text-slate-600 dark:text-slate-300 transition-colors text-left"
                  >
                    &quot;{p}&quot;
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Display */}
          {isLoading && (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-brand-500" />
              <p className="text-xs">Analyzing Amazon search signals & synthesizing research findings...</p>
            </div>
          )}

          {result && !isLoading && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Analysis Card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-500" />
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      AI Analytical Findings
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                    <span>Model: {result.model}</span>
                    <span>•</span>
                    <span>Tokens: {result.usage?.totalTokens}</span>
                    <span>•</span>
                    <span>{result.durationMs}ms</span>
                  </div>
                </div>

                <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed space-y-3 whitespace-pre-line text-slate-700 dark:text-slate-300">
                  {result.analysis}
                </div>

                {/* Direct Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Detected Seed: <strong>&quot;{result.detectedSeed}&quot;</strong>
                  </span>

                  <a
                    href={`/reports?niche=${encodeURIComponent(result.detectedSeed)}`}
                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Generate Full Research Report</span>
                  </a>
                </div>
              </div>

              {/* Related Discovered Keywords Table */}
              {result.keywords?.length > 0 && (
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Discovered Keywords for this Research Query
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 text-[11px] font-semibold text-slate-400 uppercase">
                          <th className="py-2.5 px-4">Keyword Term</th>
                          <th className="py-2.5 px-3 text-right">Est. Monthly Volume</th>
                          <th className="py-2.5 px-3 text-center">Trend</th>
                          <th className="py-2.5 px-3 text-center">Demand</th>
                          <th className="py-2.5 px-3 text-center">Opportunity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {result.keywords.map((kw: any) => (
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
                              {kw.demandScore?.toFixed(1) || '8.4'}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <OpportunityBadge score={kw.opportunityScore || 8.2} size="sm" showLabel={false} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
