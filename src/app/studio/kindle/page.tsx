'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { KindleExportService, KindleValidationReport } from '@/services/export/KindleExportService';
import { formatNumber } from '@/lib/utils';
import {
  BookOpen,
  Smartphone,
  Tablet,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  Download,
  RefreshCw,
  Sliders,
  Type,
  Sun,
  Moon,
  Coffee,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';

function KindleStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookId = searchParams.get('id');

  const [marketplace, setMarketplace] = useState('amazon.com');
  const [book, setBook] = useState<any>(null);
  const [validation, setValidation] = useState<KindleValidationReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Kindle Simulator Controls
  const [deviceType, setDeviceType] = useState<'paperwhite' | 'oasis' | 'tablet' | 'phone'>('paperwhite');
  const [fontFamily, setFontFamily] = useState<'Bookerly' | 'Amazon Ember' | 'Georgia' | 'Helvetica'>('Bookerly');
  const [fontSize, setFontSize] = useState<number>(16);
  const [themeMode, setThemeMode] = useState<'light' | 'sepia' | 'dark'>('light');
  const [activeChapterIdx, setActiveChapterIdx] = useState<number>(0);

  const fetchBookAndValidate = async (id?: string) => {
    setIsLoading(true);
    try {
      let targetId = id;
      if (!targetId) {
        const listRes = await fetch('/api/studio/books');
        const listData = await listRes.json();
        if (listData.books && listData.books.length > 0) {
          targetId = listData.books[0].id;
          router.replace(`/studio/kindle?id=${targetId}`);
        }
      }

      if (targetId) {
        const res = await fetch(`/api/studio/books/${targetId}`);
        const data = await res.json();
        setBook(data.book);
        if (data.book) {
          const valReport = KindleExportService.validateBookForKindle(data.book);
          setValidation(valReport);
        }
      }
    } catch (err) {
      console.error('Failed to load Kindle studio data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookAndValidate(bookId || undefined);
  }, [bookId]);

  const chapters = book?.chapters || [];
  const currentChapter = chapters[activeChapterIdx] || null;

  const handleDownloadKindleHTML = () => {
    if (!book) return;
    const html = KindleExportService.generateKindleHTML(book);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-kindle-package.html`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Device styling helper
  const getDeviceDimensions = () => {
    switch (deviceType) {
      case 'oasis':
        return 'w-[440px] h-[640px]';
      case 'tablet':
        return 'w-[520px] h-[720px]';
      case 'phone':
        return 'w-[320px] h-[580px]';
      case 'paperwhite':
      default:
        return 'w-[400px] h-[600px]';
    }
  };

  const getThemeStyles = () => {
    switch (themeMode) {
      case 'sepia':
        return 'bg-[#fbf0d9] text-[#5f4b32] border-[#e6d7b8]';
      case 'dark':
        return 'bg-[#18181b] text-[#d4d4d8] border-[#27272a]';
      case 'light':
      default:
        return 'bg-[#fcfbf9] text-[#1a1a1a] border-slate-200';
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
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <button
                  onClick={() => router.push('/studio/books')}
                  className="hover:text-brand-500 transition-colors"
                >
                  Book Studio
                </button>
                <span>/</span>
                <span className="text-slate-600 dark:text-slate-300 font-semibold truncate max-w-xs">
                  {book?.title || 'Kindle Studio'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    Kindle Ebook Studio & Device Simulator
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Dedicated reflowable Kindle ebook preparation, structural validation, and device preview.
                  </p>
                </div>
              </div>
            </div>

            {book && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadKindleHTML}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Kindle HTML Package</span>
                </button>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="p-16 text-center rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-500 mb-2" />
              <p className="text-xs text-slate-400">Loading Kindle Studio...</p>
            </div>
          ) : !book ? (
            <div className="p-16 text-center rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No active book project found.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Simulator Controls & Structure QA (5 Cols) */}
              <div className="lg:col-span-5 space-y-5">
                {/* Simulator Display Controls */}
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      <Sliders className="w-4 h-4 text-purple-500" />
                      <span>Device & Typography Settings</span>
                    </div>
                    <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold">
                      REFLOWABLE
                    </span>
                  </div>

                  {/* Device selector */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                      Target Device Preview
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: 'paperwhite', label: 'Paperwhite', icon: BookOpen },
                        { id: 'oasis', label: 'Oasis', icon: BookOpen },
                        { id: 'tablet', label: 'Tablet', icon: Tablet },
                        { id: 'phone', label: 'Phone', icon: Smartphone },
                      ].map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setDeviceType(d.id as any)}
                          className={`p-2 rounded-xl text-center text-xs font-medium border transition-all ${
                            deviceType === d.id
                              ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold'
                              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Family & Size */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Ebook Font
                      </label>
                      <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value as any)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-medium"
                      >
                        <option value="Bookerly">Bookerly (Kindle Serif)</option>
                        <option value="Amazon Ember">Amazon Ember (Sans)</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Helvetica">Helvetica</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-slate-500">
                          Font Size
                        </label>
                        <span className="text-[10px] font-mono text-slate-400 font-bold">{fontSize}px</span>
                      </div>
                      <input
                        type="range"
                        min={13}
                        max={24}
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                        className="w-full accent-purple-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Theme Mode */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                      Reading Surface Theme
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setThemeMode('light')}
                        className={`p-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 ${
                          themeMode === 'light'
                            ? 'border-purple-500 bg-purple-500/10 text-purple-600 font-bold'
                            : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        <Sun className="w-3.5 h-3.5" />
                        <span>Day (White)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setThemeMode('sepia')}
                        className={`p-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 ${
                          themeMode === 'sepia'
                            ? 'border-amber-600 bg-amber-500/10 text-amber-700 font-bold'
                            : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        <Coffee className="w-3.5 h-3.5" />
                        <span>Sepia</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setThemeMode('dark')}
                        className={`p-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 ${
                          themeMode === 'dark'
                            ? 'border-slate-400 bg-slate-800 text-white font-bold'
                            : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        <Moon className="w-3.5 h-3.5" />
                        <span>Night (Dark)</span>
                      </button>
                    </div>
                  </div>

                  {/* Chapter Navigation Selector */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Navigate Chapters in Previewer
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={activeChapterIdx === 0}
                        onClick={() => setActiveChapterIdx((prev) => Math.max(0, prev - 1))}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-50 text-slate-600"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <select
                        value={activeChapterIdx}
                        onChange={(e) => setActiveChapterIdx(parseInt(e.target.value, 10))}
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium"
                      >
                        {chapters.map((ch: any, idx: number) => (
                          <option key={ch.id || idx} value={idx}>
                            {ch.type === 'CHAPTER' ? `Ch ${ch.chapterNumber}: ` : ''}{ch.title}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={activeChapterIdx === chapters.length - 1}
                        onClick={() => setActiveChapterIdx((prev) => Math.min(chapters.length - 1, prev + 1))}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-50 text-slate-600"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Kindle Pre-Flight Structure QA Checklist */}
                {validation && (
                  <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        <FileCheck className="w-4 h-4 text-emerald-500" />
                        <span>Kindle Structure Validation</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">
                        {validation.passedCount}/{validation.totalChecks} Validated
                      </span>
                    </div>

                    <div className="space-y-2">
                      {validation.checks.map((chk) => (
                        <div
                          key={chk.id}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 flex items-start gap-2.5 text-xs"
                        >
                          {chk.status === 'PASSED' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <div className="font-semibold text-slate-900 dark:text-slate-100">
                              {chk.label}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {chk.details || chk.description}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Realistic Kindle Hardware Device Simulator (7 Cols) */}
              <div className="lg:col-span-7 flex flex-col items-center">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 font-bold flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                  <span>Kindle E-Ink Hardware Frame</span>
                </div>

                {/* Kindle Bezel Frame */}
                <div
                  className={`p-6 rounded-[36px] bg-gradient-to-b from-slate-800 to-slate-900 border-4 border-slate-700 shadow-2xl flex flex-col items-center justify-between transition-all duration-300 ${getDeviceDimensions()}`}
                >
                  {/* Status Bar */}
                  <div className="w-full flex items-center justify-between text-[10px] text-slate-400 font-mono px-2 pb-2 border-b border-slate-700/60">
                    <span>9:41 AM</span>
                    <span className="truncate max-w-[180px] font-bold text-slate-300">
                      {currentChapter ? currentChapter.title : book.title}
                    </span>
                    <span>98% ⚡</span>
                  </div>

                  {/* Kindle Ebook Screen */}
                  <div
                    className={`w-full flex-1 rounded-xl p-6 overflow-y-auto border my-2 shadow-inner transition-colors duration-200 ${getThemeStyles()}`}
                    style={{
                      fontFamily: fontFamily === 'Bookerly' ? 'Georgia, serif' : fontFamily,
                      fontSize: `${fontSize}px`,
                      lineHeight: 1.55,
                    }}
                  >
                    {currentChapter ? (
                      <div className="space-y-4">
                        <div className="text-center border-b border-current/20 pb-3 mb-4">
                          <div className="text-[11px] uppercase tracking-widest opacity-60 font-mono">
                            {currentChapter.type === 'CHAPTER' ? `Chapter ${currentChapter.chapterNumber || activeChapterIdx}` : currentChapter.type}
                          </div>
                          <h2 className="text-xl font-bold mt-1">
                            {currentChapter.title}
                          </h2>
                          {currentChapter.subtitle && (
                            <p className="text-xs italic opacity-75 mt-0.5">
                              {currentChapter.subtitle}
                            </p>
                          )}
                        </div>

                        {currentChapter.sections?.map((sec: any, sIdx: number) => (
                          <div key={sec.id || sIdx} className="space-y-3">
                            <h3 className="font-bold text-base mt-4 mb-1 opacity-90">
                              {sec.title}
                            </h3>
                            {sec.blocks && sec.blocks.length > 0 ? (
                              sec.blocks.map((b: any, bIdx: number) => (
                                <div
                                  key={b.id || bIdx}
                                  className="text-justify leading-relaxed"
                                  dangerouslySetInnerHTML={{
                                    __html: b.content
                                      .replace(/^### (.*$)/gim, '<h3 class="font-bold text-base mt-3 mb-1">$1</h3>')
                                      .replace(/^#### (.*$)/gim, '<h4 class="font-bold text-sm text-purple-700 mt-2 mb-1">$1</h4>')
                                      .replace(/^> (.*$)/gim, '<blockquote class="border-l-2 border-purple-500 pl-3 my-2 italic opacity-80">$1</blockquote>')
                                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                      .replace(/\n\n/g, '<br/><br/>'),
                                  }}
                                />
                              ))
                            ) : (
                              <p className="opacity-75 italic text-sm">
                                {sec.summary || 'Section draft pending...'}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-xs opacity-50">
                        No chapter selected.
                      </div>
                    )}
                  </div>

                  {/* Kindle Bottom Bezel Logo */}
                  <div className="w-full flex items-center justify-between text-[10px] text-slate-400 font-mono px-2 pt-2 border-t border-slate-700/60">
                    <span className="font-bold tracking-widest text-slate-300">amazon kindle</span>
                    <span>Page {activeChapterIdx + 1} of {chapters.length}</span>
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

export default function KindleStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070b14] text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
        </div>
      }
    >
      <KindleStudioContent />
    </Suspense>
  );
}
