'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { BackendKeywordSlot, OverlapReport } from '@/services/KDPBuilderService';
import {
  FileCode,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  Info,
  CheckCircle2,
  Layers,
} from 'lucide-react';

function BackendKeywordsContent() {
  const searchParams = useSearchParams();

  const initialTitle = searchParams.get('title') || 'High Protein Menopause Cookbook for Women Over 50';
  const initialSubtitle = searchParams.get('subtitle') || 'Simple 30-Minute Low-Carb Meals to Optimize Hormones, Boost Metabolism, and Burn Visceral Fat';

  const [marketplace, setMarketplace] = useState('amazon.com');
  const [title, setTitle] = useState(initialTitle);
  const [subtitle, setSubtitle] = useState(initialSubtitle);
  const [slots, setSlots] = useState<BackendKeywordSlot[]>([]);
  const [overlapReport, setOverlapReport] = useState<OverlapReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedSlot, setCopiedSlot] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const generateBackendSlots = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/builder/backend-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, subtitle }),
      });
      const data = await res.json();
      const generatedSlots: BackendKeywordSlot[] = data.slots || [];
      setSlots(generatedSlots);

      // Check overlap & compliance
      const overlapRes = await fetch('/api/builder/overlap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subtitle,
          backendSlots: generatedSlots.map((s) => s.phrase),
        }),
      });
      const overlapData = await overlapRes.json();
      setOverlapReport(overlapData.report);
    } catch (err) {
      console.error('Error generating backend slots:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateBackendSlots();
  }, []);

  const handleCopySlot = (phrase: string, slotNumber: number) => {
    navigator.clipboard.writeText(phrase);
    setCopiedSlot(slotNumber);
    setTimeout(() => setCopiedSlot(null), 1800);
  };

  const handleCopyAll = () => {
    const text = slots.map((s) => `Slot ${s.slotNumber}: ${s.phrase}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
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
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    7 Amazon KDP Backend Keywords Builder
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Maximize character density, eliminate wasteful redundancy with Title/Subtitle, and enforce KDP compliance.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyAll}
              disabled={slots.length === 0}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
            >
              {copiedAll ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>All 7 Slots Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy All 7 Slots</span>
                </>
              )}
            </button>
          </div>

          {/* Title & Subtitle Input Fields */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Target Book Metadata (To Prevent Keyword Redundancy)
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Book Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Book Subtitle
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={generateBackendSlots}
                disabled={isLoading}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition-all"
              >
                {isLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Regenerate Backend Keywords</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Compliance & Overlap Report Card */}
          {overlapReport && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Amazon KDP Overlap & Compliance Verification
                  </h3>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                    overlapReport.isCompliant
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {overlapReport.isCompliant ? '100% Compliant' : 'Warnings Detected'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-semibold uppercase text-slate-400">
                    Title & Subtitle Deduplication
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">
                    {overlapReport.wordsAlreadyInTitleSubtitle.length === 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        ✓ Zero wasteful overlap with Title and Subtitle.
                      </span>
                    ) : (
                      <span className="text-amber-600">
                        {overlapReport.wordsAlreadyInTitleSubtitle.length} words overlap with Title/Subtitle.
                      </span>
                    )}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-semibold uppercase text-slate-400">
                    Trademark & Claim Scanner
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">
                    {overlapReport.trademarkWarnings.length === 0 && overlapReport.subjectiveClaimWarnings.length === 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        ✓ No restricted trademarks or subjective claims detected.
                      </span>
                    ) : (
                      <span className="text-rose-600">
                        {overlapReport.trademarkWarnings.join(', ')}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 7 Backend Keyword Slots */}
          <div className="space-y-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Optimized 7 Backend Keyword Slots
            </h3>

            <div className="space-y-3">
              {slots.map((slot) => (
                <div
                  key={slot.slotNumber}
                  className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold flex items-center justify-center text-xs shrink-0">
                      #{slot.slotNumber}
                    </span>

                    <div className="flex-1">
                      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {slot.phrase}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{slot.words.length} words</span>
                        <span>•</span>
                        <span className="font-mono">
                          {slot.charCount} / {slot.maxChars} chars
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Character Meter & Copy Button */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {/* Meter */}
                    <div className="w-20 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
                      <div
                        className={`h-full rounded-full ${
                          slot.charCount <= 50 ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, (slot.charCount / 50) * 100)}%` }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopySlot(slot.phrase, slot.slotNumber)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      {copiedSlot === slot.slotNumber ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Slot</span>
                        </>
                      )}
                    </button>
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

export default function BackendKeywordsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070b14] text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
        </div>
      }
    >
      <BackendKeywordsContent />
    </Suspense>
  );
}
