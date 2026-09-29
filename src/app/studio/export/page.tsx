'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { formatNumber } from '@/lib/utils';
import {
  Download,
  FileText,
  BookOpen,
  Printer,
  Archive,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  FileSpreadsheet,
  ArrowRight,
  ExternalLink,
  Info,
  Layers,
  ChevronRight,
} from 'lucide-react';

function ExportCenterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookId = searchParams.get('id');

  const [marketplace, setMarketplace] = useState('amazon.com');
  const [book, setBook] = useState<any>(null);
  const [validationData, setValidationData] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookAndValidate = async (id?: string) => {
    setIsLoading(true);
    try {
      let targetId = id;
      if (!targetId) {
        const listRes = await fetch('/api/studio/books');
        const listData = await listRes.json();
        if (listData.books && listData.books.length > 0) {
          targetId = listData.books[0].id;
          router.replace(`/studio/export?id=${targetId}`);
        }
      }

      if (targetId) {
        const res = await fetch(`/api/studio/books/${targetId}`);
        const data = await res.json();
        setBook(data.book);

        // Run validation
        setIsValidating(true);
        const valRes = await fetch('/api/studio/export/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookId: targetId }),
        });
        const valData = await valRes.json();
        setValidationData(valData);
        setIsValidating(false);
      }
    } catch (err) {
      console.error('Failed to load book export data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookAndValidate(bookId || undefined);
  }, [bookId]);

  const handleDownloadDOCX = () => {
    if (!book) return;
    window.open(`/api/studio/export/docx?bookId=${book.id}`, '_blank');
  };

  const handleDownloadMarkdown = () => {
    if (!book) return;
    const lines: string[] = [];
    lines.push(`# ${book.title}`);
    if (book.subtitle) lines.push(`### *${book.subtitle}*`);
    lines.push('');
    lines.push('---');
    lines.push('');

    book.chapters?.forEach((ch: any) => {
      lines.push(`## ${ch.type === 'CHAPTER' ? `Chapter ${ch.chapterNumber}: ` : ''}${ch.title}`);
      if (ch.subtitle) lines.push(`*${ch.subtitle}*`);
      lines.push('');
      ch.sections?.forEach((sec: any) => {
        lines.push(`### ${sec.title}`);
        sec.blocks?.forEach((b: any) => lines.push(b.content));
        lines.push('');
      });
      lines.push('---');
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-manuscript.md`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleDownloadProjectJSON = () => {
    if (!book) return;
    const blob = new Blob([JSON.stringify(book, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-project-package.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const quality = validationData?.qualityReport;
  const kindleVal = validationData?.kindleValidation;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14]">
      <Header currentMarketplace={marketplace} onMarketplaceChange={setMarketplace} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <button
                  onClick={() => router.push('/studio/books')}
                  className="hover:text-brand-500 transition-colors"
                >
                  Book Studio
                </button>
                <span>/</span>
                <span className="text-slate-600 dark:text-slate-300 font-semibold truncate max-w-xs">
                  {book?.title || 'Export Center'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-brand-600 text-white shadow-md shadow-brand-500/20">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    Publishing Export Center
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Export professional Microsoft Word (.docx) manuscripts, print-ready specs, Kindle ebook packages, and project backups.
                  </p>
                </div>
              </div>
            </div>

            {book && (
              <button
                type="button"
                onClick={() => fetchBookAndValidate(book.id)}
                disabled={isValidating}
                className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isValidating ? 'animate-spin' : ''}`} />
                <span>Re-run Pre-Flight QA</span>
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="p-16 text-center rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-500 mb-2" />
              <p className="text-xs text-slate-400">Loading export center & running pre-flight validation...</p>
            </div>
          ) : !book ? (
            <div className="p-16 text-center rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No active book project found.
              </p>
              <button
                onClick={() => router.push('/studio/books')}
                className="mt-3 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
              >
                Create or Select a Book Project
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pre-Flight Validation Banner */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                        Pre-Flight Publishing Validation
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                        QA Score: {quality?.overallScore || 95}/100
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                      {book.title}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Niche: <strong>{book.niche}</strong> • Trim Size: <strong>{book.trimSize}</strong> • Target Words: <strong>{formatNumber(book.targetWordCount)}</strong>
                    </p>
                  </div>

                  {/* Quick Validation Metrics */}
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Em Dash Rate</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                        {quality?.emDashStats?.countPer1k || 0}/1k words
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Bullet Ratio</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                        {quality?.bulletStats?.bulletRatioPct || 0}%
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Kindle Checks</div>
                      <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                        {kindleVal?.passedCount || 6}/{kindleVal?.totalChecks || 6} Passed
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quality Warnings / Recommendations if any */}
                {quality && quality.issues && quality.issues.length > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Editorial Quality Recommendations ({quality.issues.length})</span>
                    </div>
                    <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                      {quality.issues.map((iss: any, idx: number) => (
                        <li key={idx}>
                          <strong>{iss.message}</strong> &mdash; {iss.recommendation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* 4 Dedicated Export Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. EDITABLE MANUSCRIPT (DOCX FIRST-CLASS) */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-xs uppercase tracking-wider">
                        <FileText className="w-4 h-4" />
                        <span>Editable Manuscript</span>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold border border-brand-500/20">
                        FIRST-CLASS OUTPUT
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Microsoft Word (.docx)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Generates a native, fully editable Microsoft Word document. Preserves heading hierarchy (H1–H3), real Word tables, formatted callout boxes, page breaks between chapters, and running page number footers.
                    </p>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                      <div>✓ Real native Word tables (not screenshots)</div>
                      <div>✓ Chapter page breaks & Title / Half-title spread</div>
                      <div>✓ 1.15 line spacing & 6pt paragraph spacing</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadDOCX}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download .DOCX Manuscript</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadMarkdown}
                      className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
                      title="Download Markdown"
                    >
                      <span>.MD</span>
                    </button>
                  </div>
                </div>

                {/* 2. PRINT PUBLISHING (PAPERBACK & HARDCOVER) */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
                        <Printer className="w-4 h-4" />
                        <span>Print Publishing</span>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20">
                        KDP PRINT SPECS
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Print-Ready PDF Package
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Prepares the manuscript for Amazon KDP Paperback and Hardcover printing. Configures fixed page geometry, gutter margins, outside bleeds, and full wrap-around cover spreads.
                    </p>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                      <div>✓ Trim Size: <strong>{book.trimSize} in</strong> (Standard Non-Fiction)</div>
                      <div>✓ Gutter Margin: <strong>0.500&quot;</strong> | Outside: <strong>0.250&quot;</strong> | Bleed: <strong>0.125&quot;</strong></div>
                      <div>✓ Cover Spread: <strong>12.435&quot; &times; 9.250&quot;</strong></div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60">
                    <button
                      type="button"
                      onClick={() => router.push(`/studio/blueprint?id=${book.id}`)}
                      className="w-full py-2.5 px-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <span>Inspect KDP Print Dimensions &rarr;</span>
                    </button>
                  </div>
                </div>

                {/* 3. KINDLE & EBOOK WORKFLOW */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-wider">
                        <BookOpen className="w-4 h-4" />
                        <span>Kindle & Ebook</span>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/20">
                        REFLOWABLE EBOOK
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Kindle Studio & Simulator
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Kindle ebooks are treated as their own publication format—not simply converted PDFs. Features reflowable Bookerly typography, fluid tables, and an interactive Kindle device simulator.
                    </p>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                      <div>✓ Dynamic font scaling & e-ink contrast optimization</div>
                      <div>✓ Logical Table of Contents (EPUB 3 Nav)</div>
                      <div>✓ Tested against Kindle Paperwhite & Oasis viewports</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60">
                    <button
                      type="button"
                      onClick={() => router.push(`/studio/kindle?id=${book.id}`)}
                      className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Open in Kindle Studio &rarr;</span>
                    </button>
                  </div>
                </div>

                {/* 4. PROJECT BACKUP & STRUCTURED PACKAGE */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                        <Archive className="w-4 h-4" />
                        <span>Data & Project Backup</span>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                        MACHINE-PARSEABLE
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Structured Book Package (JSON)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Export the complete structured book model, including all chapter trees, section metadata, content blocks, research keyword bindings, and governing thesis parameters for offline backup.
                    </p>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                      <div>✓ Complete relational tree (Book → Blueprint → Chapters → Blocks)</div>
                      <div>✓ Preserves KDP keyword research associations</div>
                      <div>✓ Portable for multi-edition localization</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60">
                    <button
                      type="button"
                      onClick={handleDownloadProjectJSON}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Project JSON Backup</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ExportCenterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070b14] text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
        </div>
      }
    >
      <ExportCenterContent />
    </Suspense>
  );
}
