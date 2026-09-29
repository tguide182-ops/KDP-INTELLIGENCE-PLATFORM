'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { KDPSpecs, BlueprintService } from '@/services/BlueprintService';
import { formatNumber } from '@/lib/utils';
import {
  Compass,
  BookOpen,
  Layers,
  FileText,
  Sparkles,
  Download,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit3,
  Save,
  RefreshCw,
  Target,
  ShieldCheck,
  Clock,
  Printer,
  Sliders,
  ChevronRight,
  ArrowRight,
  Info,
  CheckCircle2,
  PenTool,
  Zap,
  BookMarked,
  Eye,
} from 'lucide-react';

function BlueprintContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookId = searchParams.get('id');

  const [marketplace, setMarketplace] = useState('amazon.com');
  const [book, setBook] = useState<any>(null);
  const [kdpSpecs, setKdpSpecs] = useState<KDPSpecs | null>(null);
  const [selectedChapterIdx, setSelectedChapterIdx] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'blueprint' | 'manuscript'>('blueprint');
  const [isLoading, setIsLoading] = useState(true);
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftingStatus, setDraftingStatus] = useState('');
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active editable fields for current chapter
  const [activeChapterTitle, setActiveChapterTitle] = useState('');
  const [activeChapterSubtitle, setActiveChapterSubtitle] = useState('');
  const [activeChapterPurpose, setActiveChapterPurpose] = useState('');
  const [activeChapterWords, setActiveChapterWords] = useState(2000);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchBookProject = async (id?: string) => {
    setIsLoading(true);
    try {
      if (id) {
        const res = await fetch(`/api/studio/books/${id}`);
        if (res.ok) {
          const data = await res.json();
          setBook(data.book);
          setKdpSpecs(data.kdpSpecs);
          if (data.book?.chapters?.length > 0) {
            initChapterState(data.book.chapters[0]);
          }
          return;
        }
      }

      // If no ID or ID not found, fetch all books and load the first one
      const listRes = await fetch('/api/studio/books');
      const listData = await listRes.json();
      if (listData.books && listData.books.length > 0) {
        const firstId = listData.books[0].id;
        router.replace(`/studio/blueprint?id=${firstId}`);
        const res = await fetch(`/api/studio/books/${firstId}`);
        const data = await res.json();
        setBook(data.book);
        setKdpSpecs(data.kdpSpecs);
        if (data.book?.chapters?.length > 0) {
          initChapterState(data.book.chapters[0]);
        }
      } else {
        // No books exist yet, generate a default one
        const createRes = await fetch('/api/studio/books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'The High-Protein Menopause Reset Cookbook',
            subtitle: '100+ 30-Minute Low-Glycemic Recipes to Balance Hormones & Reclaim Energy',
            niche: 'Cookbook / Health Reset',
            primaryKeyword: 'menopause cookbook for women over 50',
            targetAudience: 'Women Over 50',
            coreBenefit: 'Hormone balance, sustained energy, and visceral belly fat reduction',
            targetWordCount: 25000,
            trimSize: '6x9',
            paperType: 'white',
          }),
        });
        const createData = await createRes.json();
        if (createData.book) {
          setBook(createData.book);
          const totalWords = createData.book.chapters?.reduce((acc: number, c: any) => acc + c.targetWordCount, 0) || 25000;
          setKdpSpecs(BlueprintService.calculateKDPSpecs(totalWords, '6x9', 'white'));
          if (createData.book.chapters?.length > 0) {
            initChapterState(createData.book.chapters[0]);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load blueprint:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const initChapterState = (chapter: any) => {
    setActiveChapterTitle(chapter.title || '');
    setActiveChapterSubtitle(chapter.subtitle || '');
    setActiveChapterPurpose(chapter.purpose || '');
    setActiveChapterWords(chapter.targetWordCount || 2000);
  };

  useEffect(() => {
    fetchBookProject(bookId || undefined);
  }, [bookId]);

  const handleSelectChapter = (idx: number) => {
    setSelectedChapterIdx(idx);
    if (book?.chapters?.[idx]) {
      initChapterState(book.chapters[idx]);
    }
  };

  const handleCopyMarkdown = () => {
    if (!book || !book.blueprint) return;
    const md = BlueprintService.exportBlueprintToMarkdown(book, {
      ...book.blueprint,
      chapters: book.chapters,
      keywordCoverage: JSON.parse(book.blueprint.keywordCoverage || '{}'),
    });
    navigator.clipboard.writeText(md);
    setCopied(true);
    showToast('Blueprint outline copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!book || !book.blueprint) return;
    const md = BlueprintService.exportBlueprintToMarkdown(book, {
      ...book.blueprint,
      chapters: book.chapters,
      keywordCoverage: JSON.parse(book.blueprint.keywordCoverage || '{}'),
    });
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kdp-blueprint-${book.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    showToast('Blueprint downloaded as Markdown!');
  };

  // Live Book Manuscript Generation
  const handleDraftCurrentChapter = async () => {
    if (!book || !currentChapter) return;
    setIsDrafting(true);
    setDraftingStatus(`Drafting "${currentChapter.title}"...`);

    try {
      const res = await fetch('/api/studio/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: book.id,
          chapterId: currentChapter.id,
          mode: 'chapter',
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Chapter "${currentChapter.title}" drafted (${data.totalWordCount} words)!`);
        await fetchBookProject(book.id);
        setActiveTab('manuscript');
      } else {
        showToast(data.error || 'Drafting failed');
      }
    } catch (err) {
      console.error('Failed to draft chapter:', err);
      showToast('Error drafting chapter');
    } finally {
      setIsDrafting(false);
      setDraftingStatus('');
    }
  };

  const handleDraftFullBook = async () => {
    if (!book) return;
    setIsDrafting(true);
    setDraftingStatus('Drafting complete manuscript across all chapters...');

    try {
      const res = await fetch('/api/studio/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: book.id,
          mode: 'full',
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Full manuscript drafted (${data.totalWords.toLocaleString()} words across ${data.chaptersDrafted} chapters)!`);
        await fetchBookProject(book.id);
        setActiveTab('manuscript');
      } else {
        showToast(data.error || 'Drafting failed');
      }
    } catch (err) {
      console.error('Failed to draft full book:', err);
      showToast('Error drafting full book');
    } finally {
      setIsDrafting(false);
      setDraftingStatus('');
    }
  };

  const handleDownloadFullManuscript = () => {
    if (!book) return;
    const lines: string[] = [];
    lines.push(`# ${book.title}`);
    if (book.subtitle) lines.push(`### *${book.subtitle}*`);
    lines.push('');
    lines.push('---');
    lines.push('');

    chapters.forEach((ch: any) => {
      lines.push(`## ${ch.type === 'CHAPTER' ? `Chapter ${ch.chapterNumber}: ` : ''}${ch.title}`);
      if (ch.subtitle) lines.push(`*${ch.subtitle}*`);
      lines.push('');
      if (ch.purpose) {
        lines.push(`> **Chapter Objective**: ${ch.purpose}`);
        lines.push('');
      }

      ch.sections?.forEach((sec: any) => {
        if (sec.blocks && sec.blocks.length > 0) {
          sec.blocks.forEach((b: any) => {
            lines.push(b.content);
            lines.push('');
          });
        } else {
          lines.push(`### ${sec.title}`);
          lines.push(sec.summary || 'Section draft pending...');
          lines.push('');
        }
      });
      lines.push('---');
      lines.push('');
    });

    const fullText = lines.join('\n');
    const blob = new Blob([fullText], { type: 'text/markdown;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-manuscript.md`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    showToast('Full manuscript downloaded as Markdown!');
  };

  const chapters = book?.chapters || [];
  const currentChapter = chapters[selectedChapterIdx] || null;

  // Calculate actual drafted words across chapters
  const totalDraftedWords = chapters.reduce((acc: number, ch: any) => {
    const secWords = ch.sections?.reduce((sAcc: number, s: any) => {
      const blockWords = s.blocks?.reduce((bAcc: number, b: any) => bAcc + (b.wordCount || 0), 0) || 0;
      return sAcc + blockWords;
    }, 0) || 0;
    return acc + (ch.actualWordCount || secWords);
  }, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14]">
      <Header currentMarketplace={marketplace} onMarketplaceChange={setMarketplace} />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Top Bar / Breadcrumb */}
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
                  {book?.title || 'Blueprint Architect'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-md shadow-brand-500/20">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    Structured Blueprint & Writing Studio
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Architect chapter outlines, bind keywords, set word budgets, and generate complete manuscript drafts.
                  </p>
                </div>
              </div>
            </div>

            {/* View Mode Switcher & Top Actions */}
            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('blueprint')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === 'blueprint'
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Blueprint</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('manuscript')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === 'manuscript'
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Manuscript ({formatNumber(totalDraftedWords)}w)</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopyMarkdown}
                disabled={!book}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-xs transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadMarkdown}
                disabled={!book}
                className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export .md</span>
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="p-16 text-center rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-500 mb-2" />
              <p className="text-xs text-slate-400">Loading structured blueprint...</p>
            </div>
          ) : !book ? (
            <div className="p-16 text-center rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No book project found.
              </p>
              <button
                onClick={() => router.push('/studio/books')}
                className="mt-3 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
              >
                Go to Book Studio
              </button>
            </div>
          ) : activeTab === 'manuscript' ? (
            /* TAB 2: LIVE BOOK MANUSCRIPT READER */
            <div className="space-y-6">
              {/* Manuscript Header Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-brand-500/10 to-purple-500/10 border border-brand-500/20 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      Live Manuscript Reader
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                      {totalDraftedWords > 0 ? `${formatNumber(totalDraftedWords)} Words Drafted` : 'Draft Pending'}
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {book.title}
                  </h2>
                  {book.subtitle && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 italic">
                      {book.subtitle}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDraftFullBook}
                    disabled={isDrafting}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-brand-600 hover:from-indigo-500 hover:to-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 flex items-center gap-2 transition-all"
                  >
                    {isDrafting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-300" />}
                    <span>{isDrafting ? 'Drafting...' : '⚡ Generate Full Manuscript'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadFullManuscript}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Manuscript</span>
                  </button>
                </div>
              </div>

              {/* Drafting Status Banner */}
              {isDrafting && (
                <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center gap-3 animate-pulse">
                  <RefreshCw className="w-5 h-5 animate-spin text-brand-500" />
                  <div className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                    {draftingStatus || 'Writing Engine co-pilot active... Drafting structured content blocks.'}
                  </div>
                </div>
              )}

              {/* Chapters & Content Blocks Reader */}
              <div className="space-y-6">
                {chapters.map((ch: any, chIdx: number) => {
                  const hasBlocks = ch.sections?.some((s: any) => s.blocks && s.blocks.length > 0);

                  return (
                    <div
                      key={ch.id || chIdx}
                      className="p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6"
                    >
                      {/* Chapter Title & Header */}
                      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                            {ch.type === 'CHAPTER' ? `Chapter ${ch.chapterNumber || chIdx}` : ch.type.replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            {ch.actualWordCount ? `${formatNumber(ch.actualWordCount)} words` : `Target: ${formatNumber(ch.targetWordCount)}w`}
                          </span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                          {ch.title}
                        </h3>
                        {ch.subtitle && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 italic mt-1">
                            {ch.subtitle}
                          </p>
                        )}
                        {ch.purpose && (
                          <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                            <strong>Objective:</strong> {ch.purpose}
                          </div>
                        )}
                      </div>

                      {/* Sections Content */}
                      {ch.sections && ch.sections.length > 0 ? (
                        ch.sections.map((sec: any, sIdx: number) => {
                          const blocks = sec.blocks || [];

                          return (
                            <div key={sec.id || sIdx} className="space-y-4 pt-2">
                              {blocks.length > 0 ? (
                                blocks.map((b: any, bIdx: number) => (
                                  <div
                                    key={b.id || bIdx}
                                    className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm leading-relaxed"
                                  >
                                    <div
                                      dangerouslySetInnerHTML={{
                                        __html: b.content
                                          .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-slate-900 dark:text-white mt-4 mb-2">$1</h3>')
                                          .replace(/^#### (.*$)/gim, '<h4 class="text-base font-bold text-brand-600 dark:text-brand-400 mt-3 mb-1">$1</h4>')
                                          .replace(/^##### (.*$)/gim, '<h5 class="text-sm font-bold text-slate-700 dark:text-slate-300 mt-2 mb-1">$1</h5>')
                                          .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-brand-500 pl-4 py-1 my-2 bg-slate-50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 rounded-r-lg italic">$1</blockquote>')
                                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                          .replace(/\n\n/g, '<br/><br/>'),
                                      }}
                                    />
                                  </div>
                                ))
                              ) : (
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                                  <div>
                                    <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                                      {sec.title}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                      {sec.summary || 'Content not yet drafted for this section.'}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-6 text-center text-xs text-slate-400">
                          No sections defined for this chapter.
                        </div>
                      )}

                      {!hasBlocks && (
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={async () => {
                              setSelectedChapterIdx(chIdx);
                              setIsDrafting(true);
                              setDraftingStatus(`Drafting Chapter ${chIdx}...`);
                              try {
                                await fetch('/api/studio/write', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ bookId: book.id, chapterId: ch.id, mode: 'chapter' }),
                                });
                                await fetchBookProject(book.id);
                                showToast(`Chapter drafted!`);
                              } finally {
                                setIsDrafting(false);
                              }
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-brand-600/10 hover:bg-brand-600 text-brand-600 dark:text-brand-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                          >
                            <PenTool className="w-3.5 h-3.5" />
                            <span>Draft This Chapter Now</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* TAB 1: BLUEPRINT & OUTLINE ARCHITECTURE */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Interactive Table of Contents (4 Cols) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-brand-500" />
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Table of Contents
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">
                      {chapters.length} Chapters
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-[620px] overflow-y-auto pr-1">
                    {chapters.map((ch: any, idx: number) => {
                      const isSelected = idx === selectedChapterIdx;
                      const isFront = ch.type === 'FRONT_MATTER';
                      const isBack = ch.type === 'BACK_MATTER';
                      const isDrafted = (ch.actualWordCount || 0) > 0;

                      return (
                        <div
                          key={ch.id || idx}
                          onClick={() => handleSelectChapter(idx)}
                          className={`p-3 rounded-2xl cursor-pointer transition-all border text-xs ${
                            isSelected
                              ? 'bg-brand-500/10 border-brand-500/40 text-brand-600 dark:text-brand-400 font-semibold shadow-xs'
                              : 'bg-slate-50/60 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                                  isSelected
                                    ? 'bg-brand-600 text-white'
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                {isFront ? 'F' : isBack ? 'A' : ch.chapterNumber || idx}
                              </span>
                              <span className="font-semibold line-clamp-1">{ch.title}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {isDrafted && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Drafted" />
                              )}
                              <span className="text-[10px] font-mono text-slate-400">
                                {formatNumber(ch.targetWordCount)}w
                              </span>
                            </div>
                          </div>

                          {ch.subtitle && (
                            <p className="text-[10px] text-slate-400 line-clamp-1 mt-1 pl-7">
                              {ch.subtitle}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Book Core Thesis Card */}
                {book.blueprint && (
                  <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 text-xs">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider text-[10px]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Governing Thesis</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">
                      &quot;{book.blueprint.thesis}&quot;
                    </p>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                      <strong>Structure:</strong> {book.blueprint.structureType}
                    </div>
                  </div>
                )}
              </div>

              {/* Center Column: Selected Chapter Detail & Sections (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                {currentChapter ? (
                  <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
                    {/* Chapter Header */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold">
                          {currentChapter.type === 'FRONT_MATTER'
                            ? 'Front Matter'
                            : currentChapter.type === 'BACK_MATTER'
                            ? 'Back Matter'
                            : `Chapter ${currentChapter.chapterNumber || selectedChapterIdx}`}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-400">
                            Target: {formatNumber(currentChapter.targetWordCount)} words
                          </span>
                        </div>
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                        {currentChapter.title}
                      </h2>
                      {currentChapter.subtitle && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                          {currentChapter.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Purpose / Hook */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 space-y-1 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Chapter Purpose & Learning Hook
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {currentChapter.purpose || 'No specific purpose defined yet.'}
                      </p>
                    </div>

                    {/* Assigned Keywords */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Assigned Search Keywords
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(() => {
                          let kws: string[] = [];
                          try {
                            kws = typeof currentChapter.assignedKeywords === 'string'
                              ? JSON.parse(currentChapter.assignedKeywords)
                              : currentChapter.assignedKeywords || [];
                          } catch (e) {
                            kws = [];
                          }
                          return kws.length > 0 ? (
                            kws.map((k) => (
                              <span
                                key={k}
                                className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-500/20"
                              >
                                {k}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">No assigned keywords</span>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Sections Breakdown */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          Structured Sections ({currentChapter.sections?.length || 0})
                        </h4>
                        <span className="text-[10px] text-slate-400">Word Count Breakdown</span>
                      </div>

                      <div className="space-y-3">
                        {currentChapter.sections?.map((sec: any, sIdx: number) => {
                          let keyPoints: string[] = [];
                          try {
                            keyPoints = typeof sec.keyPoints === 'string'
                              ? JSON.parse(sec.keyPoints)
                              : sec.keyPoints || [];
                          } catch (e) {
                            keyPoints = [];
                          }

                          return (
                            <div
                              key={sec.id || sIdx}
                              className="p-3.5 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 space-y-2 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                                  <span>{sec.title}</span>
                                </div>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {sec.targetWordCount} words
                                </span>
                              </div>

                              {sec.summary && (
                                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                                  {sec.summary}
                                </p>
                              )}

                              {keyPoints.length > 0 && (
                                <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                                  <div className="text-[10px] text-slate-400 font-semibold">Key Topics to Cover:</div>
                                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-300 text-[11px]">
                                    {keyPoints.map((kp, kIdx) => (
                                      <li key={kIdx}>{kp}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800">
                    <p className="text-xs text-slate-400">Select a chapter from the left to view details.</p>
                  </div>
                )}
              </div>

              {/* Right Column: KDP Specs, Research Inspector & LIVE WRITING ENGINE (3 Cols) */}
              <div className="lg:col-span-3 space-y-4">
                {/* LIVE WRITING ENGINE ACTION CARD (User-Requested Clickable Engine) */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-brand-500/10 to-purple-500/10 border border-brand-500/30 shadow-md space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>Book Writing Co-Pilot</span>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                      LIVE ENGINE
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    Generate production-ready chapters, recipes, and structured guidance adhering strictly to your word budgets and voice guidelines.
                  </p>

                  <div className="space-y-2">
                    {/* Primary Button: Generate Full Book */}
                    <button
                      type="button"
                      onClick={handleDraftFullBook}
                      disabled={isDrafting}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-brand-600 hover:from-indigo-500 hover:to-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {isDrafting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Drafting All Chapters...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                          <span>⚡ Generate Full Manuscript</span>
                        </>
                      )}
                    </button>

                    {/* Secondary Button: Draft Current Chapter */}
                    <button
                      type="button"
                      onClick={handleDraftCurrentChapter}
                      disabled={isDrafting || !currentChapter}
                      className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <PenTool className="w-3.5 h-3.5 text-brand-500" />
                      <span>Draft Selected Chapter &rarr;</span>
                    </button>

                    {/* View Manuscript Button */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('manuscript')}
                      className="w-full py-2 px-3 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Live Manuscript ({formatNumber(totalDraftedWords)}w)</span>
                    </button>
                  </div>
                </div>

                {/* KDP Print Specifications Card */}
                {kdpSpecs && (
                  <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold uppercase tracking-wider text-[10px]">
                      <Printer className="w-3.5 h-3.5" />
                      <span>KDP Print Specifications</span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Trim Size:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{kdpSpecs.trimSize} in</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Total Words:</span>
                        <span className="font-bold text-slate-900 dark:text-white font-mono">
                          {formatNumber(kdpSpecs.totalWords)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Est. Pages:</span>
                        <span className="font-bold text-slate-900 dark:text-white font-mono">
                          {kdpSpecs.estimatedPages} pages
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Paper Type:</span>
                        <span className="font-bold text-slate-900 dark:text-white capitalize">
                          {kdpSpecs.paperType}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Spine Thickness:</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                          {kdpSpecs.spineThicknessInches}&quot;
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Min. Gutter Margin:</span>
                        <span className="font-bold text-slate-900 dark:text-white font-mono">
                          {kdpSpecs.minGutterInches}&quot;
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Cover Spread:</span>
                        <span className="font-bold text-slate-900 dark:text-white font-mono text-[11px]">
                          {kdpSpecs.coverWidthInches}&quot; &times; {kdpSpecs.coverHeightInches}&quot;
                        </span>
                      </div>
                    </div>

                    {/* Visual Spine Representation */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-center space-y-1">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Physical Book Preview</div>
                      <div className="h-6 w-full flex items-center justify-center gap-1">
                        <div className="h-full w-12 rounded-l-md bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-[9px] font-bold text-indigo-600">
                          Back
                        </div>
                        <div
                          className="h-full rounded-xs bg-brand-600 text-white flex items-center justify-center text-[8px] font-bold"
                          style={{ width: `${Math.max(16, kdpSpecs.spineThicknessInches * 60)}px` }}
                          title={`Spine: ${kdpSpecs.spineThicknessInches}"`}
                        >
                          ||
                        </div>
                        <div className="h-full w-12 rounded-r-md bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-[9px] font-bold text-indigo-600">
                          Front
                        </div>
                      </div>
                      <div className="text-[9px] text-slate-400">
                        {kdpSpecs.spineThicknessInches >= 0.0625
                          ? 'Spine text permitted by KDP (>0.0625")'
                          : 'Spine too thin for text on KDP'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Target Reader Profile */}
                {book.blueprint && (
                  <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2.5 text-xs">
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider text-[10px]">
                      <Target className="w-3.5 h-3.5" />
                      <span>Target Reader Profile</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                      {book.blueprint.targetReaderProfile}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function BlueprintPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070b14] text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
        </div>
      }
    >
      <BlueprintContent />
    </Suspense>
  );
}
