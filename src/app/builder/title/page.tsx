'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { TitleIdea } from '@/services/KDPBuilderService';
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Info,
  ShieldCheck,
  FileCode,
  ArrowRight,
} from 'lucide-react';

function TitleBuilderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialPrimary = searchParams.get('primary') || 'Menopause Cookbook';
  const initialAudience = searchParams.get('audience') || 'Women Over 50';

  const [marketplace, setMarketplace] = useState('amazon.com');
  const [primaryKeyword, setPrimaryKeyword] = useState(initialPrimary);
  const [audience, setAudience] = useState(initialAudience);
  const [benefit, setBenefit] = useState('Balance Hormones, Shed Belly Fat & Boost Daily Energy');
  const [ideas, setIdeas] = useState<TitleIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateTitles = async () => {
    if (!primaryKeyword.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/builder/title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryKeyword,
          audience,
          benefit,
        }),
      });
      const data = await res.json();
      setIdeas(data.titleIdeas || []);
    } catch (err) {
      console.error('Error generating title ideas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateTitles();
  }, []);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1800);
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
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    Title & Subtitle Keyword Builder
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Structure high-converting, compliant Amazon KDP book titles and subtitles with strategic keyword placement.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Builder Form Controls */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Configure Keyword Hooks
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Primary Target Keyword
                </label>
                <input
                  type="text"
                  value={primaryKeyword}
                  onChange={(e) => setPrimaryKeyword(e.target.value)}
                  placeholder="e.g. GLP-1 Cookbook, Menopause Cookbook..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Target Audience Hook
                </label>
                <input
                  type="text"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. Women Over 50, Beginners, Seniors..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Core Benefit / Promise Hook
                </label>
                <input
                  type="text"
                  value={benefit}
                  onChange={(e) => setBenefit(e.target.value)}
                  placeholder="e.g. Balance Hormones, Lose Belly Fat..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={generateTitles}
                disabled={isLoading}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition-all"
              >
                {isLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Structured Titles</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Title Ideas Grid */}
          <div className="space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Generated Title & Subtitle Options ({ideas.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ideas.map((idea, index) => (
                <div
                  key={index}
                  className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Title Box */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        <span>Book Title ({idea.titleCharCount} chars)</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400">
                          {idea.titleCharCount} / 200 max
                        </span>
                      </div>
                      <div className="text-base font-bold text-slate-900 dark:text-white">
                        {idea.title}
                      </div>
                    </div>

                    {/* Subtitle Box */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        <span>Subtitle ({idea.subtitleCharCount} chars)</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400">
                          {idea.subtitleCharCount} / 200 max
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {idea.subtitle}
                      </div>
                    </div>

                    {/* Keyword Placement Tags */}
                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      <span className="px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold">
                        Primary: {idea.primaryKeyword}
                      </span>
                      {idea.audienceHook && (
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold">
                          Audience: {idea.audienceHook}
                        </span>
                      )}
                      {idea.benefitHook && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                          Benefit: {idea.benefitHook}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 italic">
                      {idea.notes}
                    </p>
                  </div>

                  {/* Copy Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(`${idea.title}: ${idea.subtitle}`, index)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs"
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Title & Subtitle</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/builder/backend-keywords?title=${encodeURIComponent(idea.title)}&subtitle=${encodeURIComponent(idea.subtitle)}`)
                        }
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-500"
                      >
                        <span>7 Backend Slots</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/studio/books?title=${encodeURIComponent(idea.title)}&subtitle=${encodeURIComponent(idea.subtitle)}&primary=${encodeURIComponent(idea.primaryKeyword)}&audience=${encodeURIComponent(idea.audienceHook || '')}`)
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-xs"
                      >
                        <span>Create Project &rarr;</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function TitleBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070b14] text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
        </div>
      }
    >
      <TitleBuilderContent />
    </Suspense>
  );
}
