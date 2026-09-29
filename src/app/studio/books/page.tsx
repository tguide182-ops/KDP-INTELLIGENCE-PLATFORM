'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { formatNumber } from '@/lib/utils';
import {
  BookOpen,
  Plus,
  Compass,
  FileText,
  Sparkles,
  Trash2,
  ExternalLink,
  Layers,
  CheckCircle2,
  Clock,
  BookMarked,
  ArrowRight,
  Sliders,
  X,
  RefreshCw,
  Target,
  Palette,
} from 'lucide-react';

interface BookProjectItem {
  id: string;
  title: string;
  subtitle?: string | null;
  niche: string;
  primaryKeyword: string;
  targetAudience?: string | null;
  coreBenefit?: string | null;
  targetWordCount: number;
  targetPageCount: number;
  trimSize: string;
  paperType: string;
  status: string;
  marketplace: string;
  updatedAt: string;
  blueprint?: {
    id: string;
    thesis: string;
    structureType: string;
    totalChapters: number;
    estimatedPages: number;
    estimatedReadingTimeMin: number;
  } | null;
  _count?: {
    chapters: number;
  };
}

function BookStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [marketplace, setMarketplace] = useState('amazon.com');
  const [books, setBooks] = useState<BookProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for new project
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formNiche, setFormNiche] = useState('Cookbook');
  const [formPrimaryKw, setFormPrimaryKw] = useState('');
  const [formSecondaryKws, setFormSecondaryKws] = useState('');
  const [formAudience, setFormAudience] = useState('Women Over 50');
  const [formBenefit, setFormBenefit] = useState('Hormone balance and visceral fat reduction');
  const [formTargetWords, setFormTargetWords] = useState(25000);
  const [formTrimSize, setFormTrimSize] = useState('6x9');
  const [formPaperType, setFormPaperType] = useState<'white' | 'cream' | 'color'>('white');
  const [formPreset, setFormPreset] = useState<'cookbook' | 'nonfiction' | 'workbook'>('cookbook');
  const [isCreating, setIsCreating] = useState(false);

  // Check URL query parameters for pre-filling (e.g. from Opportunity Gaps or Title Builder)
  useEffect(() => {
    const qTitle = searchParams.get('title');
    const qSubtitle = searchParams.get('subtitle');
    const qPrimary = searchParams.get('primary');
    const qAudience = searchParams.get('audience');
    const qNiche = searchParams.get('niche');

    if (qTitle || qPrimary || qNiche) {
      if (qTitle) setFormTitle(qTitle);
      if (qSubtitle) setFormSubtitle(qSubtitle);
      if (qPrimary) setFormPrimaryKw(qPrimary);
      if (qAudience) setFormAudience(qAudience);
      if (qNiche) setFormNiche(qNiche);
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/studio/books');
      const data = await res.json();
      setBooks(data.books || []);
    } catch (err) {
      console.error('Failed to fetch book projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleApplyPreset = (type: 'cookbook' | 'nonfiction' | 'workbook') => {
    setFormPreset(type);
    if (type === 'cookbook') {
      setFormNiche('Cookbook / Health Reset');
      setFormTrimSize('6x9');
      setFormTargetWords(25000);
      setFormAudience('Women Over 50');
      setFormBenefit('Hormone balance, anti-inflammatory nutrition, and visceral belly fat reduction');
      if (!formTitle) setFormTitle('The High-Protein Menopause Reset Cookbook');
      if (!formSubtitle) setFormSubtitle('100+ 30-Minute Low-Glycemic Recipes to Balance Hormones & Reclaim Energy');
      if (!formPrimaryKw) setFormPrimaryKw('menopause cookbook for women over 50');
    } else if (type === 'nonfiction') {
      setFormNiche('Self-Help & Productivity');
      setFormTrimSize('6x9');
      setFormTargetWords(30000);
      setFormAudience('Overwhelmed Knowledge Workers & Entrepreneurs');
      setFormBenefit('Master foundational habits, eliminate cognitive clutter, and achieve deep focus');
      if (!formTitle) setFormTitle('The Frictionless Focus System');
      if (!formSubtitle) setFormSubtitle('The 4-Stage Operating System to Eliminate Distraction and Execute Consistently');
      if (!formPrimaryKw) setFormPrimaryKw('habit tracking system for adults');
    } else if (type === 'workbook') {
      setFormNiche('Interactive Workbook');
      setFormTrimSize('8.5x11');
      setFormTargetWords(18000);
      setFormAudience('Adults with ADHD & Executive Dysfunction');
      setFormBenefit('Daily guided structure, visual priority matrix, and symptom tracking');
      if (!formTitle) setFormTitle('The Daily Dopamine Habit Workbook');
      if (!formSubtitle) setFormSubtitle('A 90-Day Visual Guided Journal for Focus, Energy, and Momentum');
      if (!formPrimaryKw) setFormPrimaryKw('adhd workbook for adults');
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formPrimaryKw.trim()) return;

    setIsCreating(true);
    try {
      const res = await fetch('/api/studio/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle.trim(),
          subtitle: formSubtitle.trim() || null,
          niche: formNiche,
          primaryKeyword: formPrimaryKw.trim(),
          secondaryKeywords: formSecondaryKws
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          targetAudience: formAudience,
          coreBenefit: formBenefit,
          targetWordCount: formTargetWords,
          trimSize: formTrimSize,
          paperType: formPaperType,
          marketplace,
          autoGenerateBlueprint: true,
        }),
      });

      const data = await res.json();
      if (data.book && data.book.id) {
        setIsModalOpen(false);
        router.push(`/studio/blueprint?id=${data.book.id}`);
      } else {
        await fetchBooks();
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to create book project:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteBook = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this book project and its blueprint?')) return;

    try {
      await fetch(`/api/studio/books/${id}`, { method: 'DELETE' });
      setBooks((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error('Failed to delete book:', err);
    }
  };

  const totalPlannedWords = books.reduce((acc, b) => acc + b.targetWordCount, 0);
  const readyBlueprints = books.filter((b) => b.status === 'BLUEPRINT_READY' || b.blueprint).length;
  const totalEstimatedPages = books.reduce((acc, b) => acc + (b.blueprint?.estimatedPages || b.targetPageCount), 0);

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
                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20">
                  <BookMarked className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    Book Studio & Projects
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Manage your publishing pipeline from initial research concept to structured blueprint, manuscript, and export.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  handleApplyPreset('cookbook');
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>New Book Project</span>
              </button>
            </div>
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Book Projects</span>
                <BookOpen className="w-4 h-4 text-brand-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {books.length}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Active titles in pipeline</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ready Blueprints</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {readyBlueprints}
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">Outlines generated & verified</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Planned Words</span>
                <Layers className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {formatNumber(totalPlannedWords)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Across all chapter budgets</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Est. Print Pages</span>
                <FileText className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {totalEstimatedPages}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">KDP print volume</div>
            </div>
          </div>

          {/* Book Projects Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Active Manuscripts & Blueprints</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                  {books.length}
                </span>
              </h2>
            </div>

            {isLoading ? (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-500 mb-2" />
                <p className="text-xs text-slate-400">Loading book projects...</p>
              </div>
            ) : books.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto">
                  <BookMarked className="w-6 h-6" />
                </div>
                <div className="max-w-md mx-auto">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    No Book Projects Yet
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Transform your research into an actionable book project. Create a new title or start from any Opportunity Gap.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleApplyPreset('cookbook');
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Your First Book Project</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {books.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => router.push(`/studio/blueprint?id=${b.id}`)}
                    className="group cursor-pointer rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 hover:border-brand-500/40 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 font-bold">
                          {b.niche}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                              b.status === 'BLUEPRINT_READY'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}
                          >
                            {b.status.replace(/_/g, ' ')}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteBook(b.id, e)}
                            className="p-1 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete Project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Title & Subtitle */}
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
                        {b.title}
                      </h3>
                      {b.subtitle && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                          {b.subtitle}
                        </p>
                      )}

                      {/* Primary Keyword */}
                      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                        <Target className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                          &quot;{b.primaryKeyword}&quot;
                        </span>
                      </div>
                    </div>

                    {/* Specifications & Blueprint stats */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 space-y-2">
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/50">
                          <div className="text-[10px] text-slate-400 font-semibold uppercase">Words</div>
                          <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                            {formatNumber(b.targetWordCount)}
                          </div>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/50">
                          <div className="text-[10px] text-slate-400 font-semibold uppercase">Pages</div>
                          <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                            {b.blueprint?.estimatedPages || b.targetPageCount}
                          </div>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/50">
                          <div className="text-[10px] text-slate-400 font-semibold uppercase">Trim</div>
                          <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                            {b.trimSize}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3 text-brand-500" />
                          <span>{b._count?.chapters || b.blueprint?.totalChapters || 0} Chapters</span>
                        </span>
                        <span className="text-brand-600 dark:text-brand-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-semibold">
                          <span>Open Blueprint</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* New Book Project Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
              <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-brand-500/10 to-indigo-500/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-brand-500 text-white shadow-xs">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Create New Book Project
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Synthesize your research into a structured, chapter-by-chapter book blueprint.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleCreateProject} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                  {/* Preset Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Select Publishing Framework Preset
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleApplyPreset('cookbook')}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          formPreset === 'cookbook'
                            ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xs font-bold">Cookbook / Reset</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">High-protein, 4-week meal plans, recipes</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset('nonfiction')}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          formPreset === 'nonfiction'
                            ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xs font-bold">Non-Fiction Guide</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Self-help, business, habit systems</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset('workbook')}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          formPreset === 'workbook'
                            ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xs font-bold">Guided Workbook</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">8.5x11 prompts, exercises, trackers</div>
                      </button>
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Book Title *
                      </label>
                      <input
                        type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="e.g. The High-Protein Menopause Reset Cookbook"
                        required
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Book Subtitle (Strategic Benefit & Audience Hook)
                      </label>
                      <input
                        type="text"
                        value={formSubtitle}
                        onChange={(e) => setFormSubtitle(e.target.value)}
                        placeholder="e.g. 100+ 30-Minute Low-Glycemic Recipes to Balance Hormones & Reclaim Energy"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500 font-medium"
                      />
                    </div>
                  </div>

                  {/* Primary Keyword & Niche */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Primary Target Keyword *
                      </label>
                      <input
                        type="text"
                        value={formPrimaryKw}
                        onChange={(e) => setFormPrimaryKw(e.target.value)}
                        placeholder="e.g. menopause cookbook"
                        required
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Publishing Niche
                      </label>
                      <input
                        type="text"
                        value={formNiche}
                        onChange={(e) => setFormNiche(e.target.value)}
                        placeholder="e.g. Cookbooks, Food & Wine"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500 font-medium"
                      />
                    </div>
                  </div>

                  {/* Target Audience & Core Benefit */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Target Reader Audience Profile
                      </label>
                      <input
                        type="text"
                        value={formAudience}
                        onChange={(e) => setFormAudience(e.target.value)}
                        placeholder="e.g. Women Over 50"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Core Benefit / Transformation
                      </label>
                      <input
                        type="text"
                        value={formBenefit}
                        onChange={(e) => setFormBenefit(e.target.value)}
                        placeholder="e.g. Visceral fat loss & steady energy"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500 font-medium"
                      />
                    </div>
                  </div>

                  {/* KDP Specifications */}
                  <div className="grid grid-cols-3 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Target Words
                      </label>
                      <input
                        type="number"
                        value={formTargetWords}
                        onChange={(e) => setFormTargetWords(parseInt(e.target.value, 10) || 20000)}
                        step={1000}
                        min={5000}
                        max={100000}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Trim Size
                      </label>
                      <select
                        value={formTrimSize}
                        onChange={(e) => setFormTrimSize(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500 font-medium"
                      >
                        <option value="6x9">6 x 9 in (Standard Non-Fiction)</option>
                        <option value="8.5x11">8.5 x 11 in (Workbooks / Large)</option>
                        <option value="5.5x8.5">5.5 x 8.5 in (Compact / Fiction)</option>
                        <option value="5x8">5 x 8 in (Pocket)</option>
                        <option value="7x10">7 x 10 in (Textbook)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Paper Type
                      </label>
                      <select
                        value={formPaperType}
                        onChange={(e) => setFormPaperType(e.target.value as any)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500 font-medium"
                      >
                        <option value="white">White (Cookbooks / Workbooks)</option>
                        <option value="cream">Cream (Standard Non-Fiction)</option>
                        <option value="color">Premium Color</option>
                      </select>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      {isCreating ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Generating Blueprint...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Generate Structured Blueprint &rarr;</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function BookStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070b14] text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
        </div>
      }
    >
      <BookStudioContent />
    </Suspense>
  );
}
