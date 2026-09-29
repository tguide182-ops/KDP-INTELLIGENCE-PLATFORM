'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import {
  Search,
  Filter,
  Layers,
  Sparkles,
  BarChart3,
  Download,
  Bookmark,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Play,
  Pause,
  Square,
  ArrowUpDown,
  BookOpen,
  GitFork,
  BookMarked,
  Info,
  Sliders,
  TrendingUp,
  DollarSign,
  Calendar,
  FileSpreadsheet,
} from 'lucide-react';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { MarketScannerService, EnrichedMarketBook, MarketOverview, SearchMode, MarketFilterOptions } from '@/services/market/MarketScannerService';

function MarketScannerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search Configuration State
  const [seedsInput, setSeedsInput] = useState(searchParams.get('seed') || 'senior sudoku');
  const [marketplace, setMarketplace] = useState(searchParams.get('marketplace') || 'amazon.com');
  const [searchMode, setSearchMode] = useState<SearchMode>('QUICK_SEARCH');
  const [targetResults, setTargetResults] = useState<number>(50);
  const [useAZExpansion, setUseAZExpansion] = useState(false);

  // Advanced Filters State
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [minReviews, setMinReviews] = useState<string>('');
  const [maxReviews, setMaxReviews] = useState<string>('100');
  const [minBSR, setMinBSR] = useState<string>('');
  const [maxBSR, setMaxBSR] = useState<string>('100000');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minPages, setMinPages] = useState<string>('');
  const [maxPages, setMaxPages] = useState<string>('');
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['Paperback']);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English']);
  const [publisherType, setPublisherType] = useState<'ALL' | 'KDP' | 'TRADITIONAL'>('ALL');
  const [publishedWithin, setPublishedWithin] = useState<'ALL' | '30d' | '90d' | '6m' | '12m' | '2y' | '5y'>('12m');
  const [titleContains, setTitleContains] = useState('');
  const [authorContains, setAuthorContains] = useState('');
  const [excludeKeywords, setExcludeKeywords] = useState('');

  // Results & Job State
  const [isScanning, setIsScanning] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobProgress, setJobProgress] = useState(0);
  const [jobStage, setJobStage] = useState('');
  const [jobStatus, setJobStatus] = useState<string>('IDLE');

  const [books, setBooks] = useState<EnrichedMarketBook[]>([]);
  const [overview, setOverview] = useState<MarketOverview | null>(null);
  const [selectedBookAsins, setSelectedBookAsins] = useState<Set<string>>(new Set());

  // Table Sorting & Pagination
  const [sortBy, setSortBy] = useState<'rank' | 'reviews' | 'bsr' | 'price' | 'age' | 'sales'>('bsr');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Saved Searches
  const [savedSearchModalOpen, setSavedSearchModalOpen] = useState(false);
  const [savedSearchName, setSavedSearchName] = useState('');
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [savedDrawerOpen, setSavedDrawerOpen] = useState(false);

  // Bulk Analysis Modal
  const [bulkAnalysisModalOpen, setBulkAnalysisModalOpen] = useState(false);

  // Preset Filters Application
  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case 'new_low_review':
        setMinReviews('0');
        setMaxReviews('100');
        setPublishedWithin('12m');
        setMinBSR('');
        setMaxBSR('');
        break;
      case 'low_competition':
        setMinReviews('0');
        setMaxReviews('100');
        setMinBSR('1');
        setMaxBSR('100000');
        setPublishedWithin('ALL');
        break;
      case 'new_winners':
        setPublishedWithin('12m');
        setMinBSR('1');
        setMaxBSR('50000');
        setMinReviews('');
        setMaxReviews('');
        break;
      case 'emerging_niche':
        setPublishedWithin('6m');
        setMinReviews('0');
        setMaxReviews('50');
        setMinBSR('1');
        setMaxBSR('200000');
        break;
      case 'established_market':
        setMinReviews('500');
        setMaxReviews('');
        setPublishedWithin('ALL');
        setMinBSR('');
        setMaxBSR('');
        break;
      case 'underserved_market':
        setMinReviews('0');
        setMaxReviews('100');
        setMinBSR('1');
        setMaxBSR('80000');
        setPublishedWithin('ALL');
        break;
    }
  };

  // Execute Market Scan
  const handleScan = async () => {
    const seeds = seedsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (seeds.length === 0) return;

    setIsScanning(true);
    setJobProgress(5);
    setJobStage('Initiating scan...');
    setJobStatus('RUNNING');
    setSelectedBookAsins(new Set());
    setCurrentPage(1);

    const filterPayload: MarketFilterOptions = {
      marketplace,
      minReviews: minReviews ? parseInt(minReviews, 10) : undefined,
      maxReviews: maxReviews ? parseInt(maxReviews, 10) : undefined,
      minBSR: minBSR ? parseInt(minBSR, 10) : undefined,
      maxBSR: maxBSR ? parseInt(maxBSR, 10) : undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      minPages: minPages ? parseInt(minPages, 10) : undefined,
      maxPages: maxPages ? parseInt(maxPages, 10) : undefined,
      formats: selectedFormats,
      languages: selectedLanguages,
      publisherType,
      publishedWithin,
      titleContains: titleContains || undefined,
      authorContains: authorContains || undefined,
      excludeKeywords: excludeKeywords ? excludeKeywords.split(',').map((k) => k.trim()) : undefined,
      targetResults,
      useAZExpansion,
    };

    try {
      const res = await fetch('/api/market/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seeds,
          mode: searchMode,
          filters: filterPayload,
        }),
      });

      const data = await res.json();

      if (data.mode === 'QUICK_SEARCH' && data.result) {
        setBooks(data.result.books);
        setOverview(data.result.overview);
        setIsScanning(false);
        setJobStatus('COMPLETED');
        setJobProgress(100);
        setJobStage('Complete');
      } else if (data.jobId) {
        setActiveJobId(data.jobId);
        pollJob(data.jobId);
      }
    } catch (err) {
      console.error('Scan error:', err);
      setIsScanning(false);
      setJobStatus('FAILED');
      setJobStage('Scan failed');
    }
  };

  // Poll Background Scan Job
  const pollJob = async (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/market/jobs/${jobId}`);
        const data = await res.json();
        if (data.success && data.job) {
          setJobProgress(data.job.progress);
          setJobStage(data.job.stage);
          setJobStatus(data.job.status);

          if (data.job.status === 'COMPLETED') {
            clearInterval(interval);
            setIsScanning(false);
            if (data.job.result) {
              setBooks(data.job.result.books);
              setOverview(data.job.result.overview);
            }
          } else if (data.job.status === 'FAILED' || data.job.status === 'CANCELLED') {
            clearInterval(interval);
            setIsScanning(false);
          }
        }
      } catch (e) {
        console.error('Poll error:', e);
      }
    }, 1500);
  };

  // Job Controls: Pause / Resume / Cancel
  const handleJobAction = async (action: 'pause' | 'resume' | 'cancel') => {
    if (!activeJobId) return;
    try {
      await fetch(`/api/market/jobs/${activeJobId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (action === 'pause') setJobStatus('PAUSED');
      if (action === 'resume') setJobStatus('RUNNING');
      if (action === 'cancel') {
        setJobStatus('CANCELLED');
        setIsScanning(false);
      }
    } catch (e) {
      console.error('Job action error:', e);
    }
  };

  // Export Complete Dataset (XLSX, CSV, JSON)
  const handleExport = async (format: 'xlsx' | 'csv' | 'json') => {
    const exportBooks = selectedBookAsins.size > 0
      ? books.filter((b) => selectedBookAsins.has(b.asin))
      : books;

    if (exportBooks.length === 0) return;

    try {
      const res = await fetch('/api/market/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          books: exportBooks,
          format,
          filename: `market_scan_${seedsInput.replace(/\s+/g, '_')}_${marketplace}`,
        }),
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `market_scan_${seedsInput.replace(/\s+/g, '_')}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  // Save Search Configuration
  const handleSaveSearch = async () => {
    if (!savedSearchName.trim()) return;
    try {
      const seeds = seedsInput.split(',').map((s) => s.trim());
      await fetch('/api/market/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: savedSearchName,
          seeds,
          marketplace,
          mode: searchMode,
          overview,
          books,
          filters: {
            minReviews,
            maxReviews,
            minBSR,
            maxBSR,
            selectedFormats,
            publishedWithin,
          },
        }),
      });
      setSavedSearchModalOpen(false);
      setSavedSearchName('');
      loadSavedSearches();
    } catch (e) {
      console.error('Save error:', e);
    }
  };

  const loadSavedSearches = async () => {
    try {
      const res = await fetch('/api/market/saved');
      const data = await res.json();
      if (data.success) {
        setSavedSearches(data.savedSearches || []);
      }
    } catch (e) {
      console.error('Load saved error:', e);
    }
  };

  useEffect(() => {
    loadSavedSearches();
    handleScan();
  }, []);

  // Sorted Books
  const sortedBooks = [...books].sort((a, b) => {
    let aVal: any = a.bsr;
    let bVal: any = b.bsr;

    if (sortBy === 'reviews') {
      aVal = a.reviewCount;
      bVal = b.reviewCount;
    } else if (sortBy === 'price') {
      aVal = a.price;
      bVal = b.price;
    } else if (sortBy === 'age') {
      aVal = a.bookAgeDays;
      bVal = b.bookAgeDays;
    } else if (sortBy === 'sales') {
      aVal = a.estimatedMonthlySales;
      bVal = b.estimatedMonthlySales;
    }

    if (sortDir === 'asc') return aVal > bVal ? 1 : -1;
    return aVal < bVal ? 1 : -1;
  });

  const totalPages = Math.ceil(sortedBooks.length / pageSize) || 1;
  const paginatedBooks = sortedBooks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Bulk Selection
  const toggleSelectAll = () => {
    if (selectedBookAsins.size === books.length) {
      setSelectedBookAsins(new Set());
    } else {
      setSelectedBookAsins(new Set(books.map((b) => b.asin)));
    }
  };

  const toggleSelectBook = (asin: string) => {
    const next = new Set(selectedBookAsins);
    if (next.has(asin)) next.delete(asin);
    else next.add(asin);
    setSelectedBookAsins(next);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <Header currentMarketplace={marketplace} onMarketplaceChange={setMarketplace} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
          {/* Top Title & Quick Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Search className="w-5 h-5" />
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Advanced Market Search & Deep Scanner
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Multi-query Amazon harvesting, A-Z expansion, ASIN deduplication, and market distribution intelligence.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSavedDrawerOpen(true)}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-slate-700 dark:text-slate-300"
              >
                <Bookmark className="w-3.5 h-3.5 text-indigo-500" />
                <span>Saved Scans ({savedSearches.length})</span>
              </button>

              <button
                onClick={() => setSavedSearchModalOpen(true)}
                disabled={books.length === 0}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-slate-700 dark:text-slate-300 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Save Search</span>
              </button>

              <div className="relative group">
                <button
                  disabled={books.length === 0}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Dataset</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl py-1 hidden group-hover:block z-50">
                  <button
                    onClick={() => handleExport('xlsx')}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Excel (.xlsx)</span>
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-500" />
                    <span>CSV (.csv)</span>
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-purple-500" />
                    <span>JSON (.json)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Search Controls Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
              {/* Seed Keyword Input */}
              <div className="lg:col-span-6 relative">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Seed Keyword(s) <span className="text-slate-400 font-normal lowercase">(comma-separated for multi-seed)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={seedsInput}
                    onChange={(e) => setSeedsInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                    placeholder="e.g. senior sudoku, large print sudoku, puzzle books"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              {/* Marketplace Selector */}
              <div className="lg:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Marketplace
                </label>
                <select
                  value={marketplace}
                  onChange={(e) => setMarketplace(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                >
                  <option value="amazon.com">🇺🇸 Amazon.com (US)</option>
                  <option value="amazon.co.uk">🇬🇧 Amazon.co.uk (UK)</option>
                  <option value="amazon.de">🇩🇪 Amazon.de (DE)</option>
                  <option value="amazon.ca">🇨🇦 Amazon.ca (CA)</option>
                  <option value="amazon.com.au">🇦🇺 Amazon.com.au (AU)</option>
                </select>
              </div>

              {/* Search Mode Selector */}
              <div className="lg:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Search Mode
                </label>
                <select
                  value={searchMode}
                  onChange={(e) => setSearchMode(e.target.value as SearchMode)}
                  className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                >
                  <option value="QUICK_SEARCH">⚡ Quick Search (~25)</option>
                  <option value="DEEP_SEARCH">🔍 Deep Search (100–250)</option>
                  <option value="MARKET_SCAN">🌐 Market Scan (500+)</option>
                </select>
              </div>

              {/* Scan Trigger Button */}
              <div className="lg:col-span-2 flex items-end">
                <button
                  onClick={handleScan}
                  disabled={isScanning}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Scanning...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>SCAN MARKET</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Presets Bar & Filter Toggle */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Presets:</span>
                <button
                  onClick={() => applyPreset('new_low_review')}
                  className="px-2.5 py-1 text-[11px] rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                >
                  New & Low Review
                </button>
                <button
                  onClick={() => applyPreset('low_competition')}
                  className="px-2.5 py-1 text-[11px] rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                >
                  Low Competition (BSR &lt; 100k)
                </button>
                <button
                  onClick={() => applyPreset('new_winners')}
                  className="px-2.5 py-1 text-[11px] rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                >
                  New Winners (&lt; 12m, BSR &lt; 50k)
                </button>
                <button
                  onClick={() => applyPreset('emerging_niche')}
                  className="px-2.5 py-1 text-[11px] rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                >
                  Emerging Niche (&lt; 6m, Rev &lt; 50)
                </button>
                <button
                  onClick={() => applyPreset('underserved_market')}
                  className="px-2.5 py-1 text-[11px] rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors font-medium"
                >
                  Underserved Market
                </button>
              </div>

              <button
                onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                <span>Advanced Filters ({[minReviews, maxReviews, minBSR, maxBSR, publishedWithin !== 'ALL' ? publishedWithin : null].filter(Boolean).length})</span>
                {filterDrawerOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* Collapsible Filter Drawer */}
            {filterDrawerOpen && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/50 dark:bg-slate-950/40 p-4 rounded-lg">
                {/* Reviews Filter */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Reviews (Min — Max)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="0"
                      value={minReviews}
                      onChange={(e) => setMinReviews(e.target.value)}
                      className="w-1/2 p-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md"
                    />
                    <span className="text-slate-400 text-xs">—</span>
                    <input
                      type="number"
                      placeholder="100"
                      value={maxReviews}
                      onChange={(e) => setMaxReviews(e.target.value)}
                      className="w-1/2 p-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md"
                    />
                  </div>
                </div>

                {/* BSR Filter */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    BSR Rank (Min — Max)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="1"
                      value={minBSR}
                      onChange={(e) => setMinBSR(e.target.value)}
                      className="w-1/2 p-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md"
                    />
                    <span className="text-slate-400 text-xs">—</span>
                    <input
                      type="number"
                      placeholder="100000"
                      value={maxBSR}
                      onChange={(e) => setMaxBSR(e.target.value)}
                      className="w-1/2 p-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md"
                    />
                  </div>
                </div>

                {/* Publication Date */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Published Age
                  </label>
                  <select
                    value={publishedWithin}
                    onChange={(e) => setPublishedWithin(e.target.value as any)}
                    className="w-full p-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md"
                  >
                    <option value="ALL">All Time</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                    <option value="6m">Last 6 Months</option>
                    <option value="12m">Last 12 Months</option>
                    <option value="2y">Last 2 Years</option>
                    <option value="5y">Last 5 Years</option>
                  </select>
                </div>

                {/* Publisher / KDP Indicator */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Publisher Type
                  </label>
                  <select
                    value={publisherType}
                    onChange={(e) => setPublisherType(e.target.value as any)}
                    className="w-full p-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md"
                  >
                    <option value="ALL">All Publishers</option>
                    <option value="KDP">Independently Published (KDP)</option>
                    <option value="TRADITIONAL">Traditional Publishers</option>
                  </select>
                </div>

                {/* Format Multi-select */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Formats
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {['Paperback', 'Hardcover', 'Kindle', 'Large Print'].map((fmt) => {
                      const active = selectedFormats.includes(fmt);
                      return (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => {
                            if (active) setSelectedFormats(selectedFormats.filter((f) => f !== fmt));
                            else setSelectedFormats([...selectedFormats, fmt]);
                          }}
                          className={`px-2 py-1 text-[10px] font-semibold rounded ${
                            active
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {fmt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title Contains */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Title Contains
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. large print"
                    value={titleContains}
                    onChange={(e) => setTitleContains(e.target.value)}
                    className="w-full p-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md"
                  />
                </div>

                {/* Exclude Keywords */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Exclude Keywords
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. kids, spiral"
                    value={excludeKeywords}
                    onChange={(e) => setExcludeKeywords(e.target.value)}
                    className="w-full p-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md"
                  />
                </div>

                {/* Target Results Count */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Dataset Harvest Target
                  </label>
                  <select
                    value={targetResults}
                    onChange={(e) => setTargetResults(parseInt(e.target.value, 10))}
                    className="w-full p-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md"
                  >
                    <option value={25}>25 Results</option>
                    <option value={50}>50 Results</option>
                    <option value={100}>100 Results</option>
                    <option value={250}>250 Results</option>
                    <option value={500}>500 Results</option>
                    <option value={1000}>1,000 Results</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Active Job Progress Banner */}
          {isScanning && (
            <div className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/50 rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Deep Market Scan in Progress: <span className="text-indigo-600 dark:text-indigo-400">{jobStage}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{jobProgress}%</span>
                  {activeJobId && (
                    <div className="flex items-center gap-1">
                      {jobStatus === 'RUNNING' ? (
                        <button
                          onClick={() => handleJobAction('pause')}
                          className="p-1 text-slate-400 hover:text-amber-500 rounded"
                          title="Pause Scan"
                        >
                          <Pause className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJobAction('resume')}
                          className="p-1 text-slate-400 hover:text-emerald-500 rounded"
                          title="Resume Scan"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleJobAction('cancel')}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded"
                        title="Cancel Scan"
                      >
                        <Square className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${jobProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Market Overview Statistics & Charts */}
          {overview && (
            <div className="space-y-4">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Analyzed Books</span>
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                    {formatNumber(overview.totalBooksAnalyzed)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Deduplicated ASINs</div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Median Reviews</span>
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                    {formatNumber(overview.medianReviews)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Avg: {formatNumber(overview.avgReviews)}</div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Median BSR</span>
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                    #{formatNumber(overview.medianBSR)}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                    ~{MarketScannerService.bsrToSales(overview.medianBSR)} sales/mo
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Price</span>
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                    ${overview.avgPrice}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{marketplace}</div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">&lt; 100 Reviews</span>
                  <div className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
                    {overview.pctUnder100Reviews}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{overview.booksUnder100Reviews} books</div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Entrants</span>
                  <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                    {overview.pctNewerThanOneYear}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">&lt; 12 months old</div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scan Coverage</span>
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                    {overview.searchCoverage.queriesScanned} Q
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{overview.searchCoverage.pagesScanned} pages scanned</div>
                </div>
              </div>

              {/* Distribution Histograms & Opportunity Signals */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Reviews Distribution */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                    <span className="flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Reviews Distribution</span>
                    </span>
                    <span className="text-slate-400 font-normal">0 to 500+</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {Object.entries(overview.distributions.reviews).map(([bucket, count]) => {
                      const pct = overview.totalBooksAnalyzed > 0 ? Math.round((count / overview.totalBooksAnalyzed) * 100) : 0;
                      return (
                        <div key={bucket} className="flex items-center gap-2">
                          <span className="w-14 text-[10px] font-mono text-slate-500">{bucket}</span>
                          <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-8 text-right text-[10px] font-mono text-slate-600 dark:text-slate-400">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Publication Age Distribution */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Publication Age</span>
                    </span>
                    <span className="text-slate-400 font-normal">Release Date</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {Object.entries(overview.distributions.publicationAge).map(([bucket, count]) => {
                      const pct = overview.totalBooksAnalyzed > 0 ? Math.round((count / overview.totalBooksAnalyzed) * 100) : 0;
                      return (
                        <div key={bucket} className="flex items-center gap-2">
                          <span className="w-14 text-[10px] font-mono text-slate-500">{bucket}</span>
                          <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-8 text-right text-[10px] font-mono text-slate-600 dark:text-slate-400">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Opportunity Signals */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Market Entry Signals</span>
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Descriptive</span>
                  </div>
                  <div className="space-y-2">
                    {overview.opportunitySignals.map((sig, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                          sig.type === 'POSITIVE'
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                            : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">{sig.title}</span>
                          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 bg-white/60 dark:bg-slate-900/60 rounded border border-slate-200/40">
                            {sig.dataPoint}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">{sig.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* High-Capacity Book Results Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            {/* Table Action Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-950/30">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Discovered Books ({books.length})
                </span>
                {selectedBookAsins.size > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-md border border-indigo-200 dark:border-indigo-800">
                    {selectedBookAsins.size} Selected
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs">
                {selectedBookAsins.size > 0 && (
                  <>
                    <button
                      onClick={() => setBulkAnalysisModalOpen(true)}
                      className="px-2.5 py-1.5 font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                    >
                      Analyze Selected ({selectedBookAsins.size})
                    </button>
                    <button
                      onClick={() => handleExport('xlsx')}
                      className="px-2.5 py-1.5 font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      Export Selected
                    </button>
                  </>
                )}

                <div className="flex items-center gap-1 ml-2 text-slate-500">
                  <span>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="p-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded"
                  >
                    <option value="bsr">BSR Rank</option>
                    <option value="reviews">Review Count</option>
                    <option value="price">Price</option>
                    <option value="age">Book Age</option>
                    <option value="sales">Est. Sales</option>
                  </select>
                  <button
                    onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
                    className="p-1 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800"
                    title={`Sort ${sortDir === 'asc' ? 'Descending' : 'Ascending'}`}
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-3 w-8">
                      <input
                        type="checkbox"
                        checked={selectedBookAsins.size === books.length && books.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300"
                      />
                    </th>
                    <th className="p-3 w-12">#</th>
                    <th className="p-3">Title & Subtitle</th>
                    <th className="p-3">Author / Publisher</th>
                    <th className="p-3">Reviews & Rating</th>
                    <th className="p-3">BSR & Est. Sales</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Age / Date</th>
                    <th className="p-3">Found Via</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedBooks.map((book, idx) => {
                    const isSelected = selectedBookAsins.has(book.asin);
                    return (
                      <tr
                        key={book.asin}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                          isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                        }`}
                      >
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectBook(book.asin)}
                            className="rounded border-slate-300"
                          />
                        </td>
                        <td className="p-3 font-mono text-slate-400">
                          {(currentPage - 1) * pageSize + idx + 1}
                        </td>
                        <td className="p-3 max-w-xs">
                          <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                            {book.title}
                          </div>
                          {book.subtitle && (
                            <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {book.subtitle}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="font-mono text-[10px] text-slate-400">{book.asin}</span>
                            <span className="text-[9px] px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                              {book.format}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                              {book.pages}p
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-slate-900 dark:text-slate-200">{book.author}</div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                                book.isIndependentKDP
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {book.isIndependentKDP ? 'KDP Inferred' : 'Traditional'}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-mono font-bold text-slate-900 dark:text-white">
                            {formatNumber(book.reviewCount)} reviews
                          </div>
                          <div className="text-[11px] text-amber-500 font-semibold mt-0.5">
                            ★ {book.rating}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-mono font-bold text-slate-900 dark:text-white">
                            #{formatNumber(book.bsr)}
                          </div>
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                            ~{formatNumber(book.estimatedMonthlySales)} sales/mo
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-mono font-bold text-slate-900 dark:text-white">
                            ${book.price}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            ~${(book.estimatedMonthlySales * 2.85).toFixed(0)}/mo roy
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-slate-900 dark:text-white">{book.bookAge}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{book.publicationDate}</div>
                        </td>
                        <td className="p-3 max-w-[140px]">
                          <div className="flex flex-wrap gap-1">
                            {book.foundVia.slice(0, 2).map((q, i) => (
                              <span
                                key={i}
                                className="text-[9px] px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded line-clamp-1"
                              >
                                {q}
                              </span>
                            ))}
                            {book.foundVia.length > 2 && (
                              <span className="text-[9px] text-slate-400">+{book.foundVia.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <a
                              href={`/competitors/reverse-asin?asin=${book.asin}`}
                              target="_blank"
                              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Reverse ASIN"
                            >
                              <GitFork className="w-3.5 h-3.5" />
                            </a>
                            <a
                              href={`/keywords/explorer?q=${encodeURIComponent(book.foundVia[0] || book.title)}`}
                              target="_blank"
                              className="p-1.5 text-slate-400 hover:text-emerald-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Research Keyword"
                            >
                              <Search className="w-3.5 h-3.5" />
                            </a>
                            <a
                              href={`/studio/books?title=${encodeURIComponent(book.title)}&keyword=${encodeURIComponent(
                                book.foundVia[0] || ''
                              )}`}
                              target="_blank"
                              className="p-1.5 text-slate-400 hover:text-purple-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Create Book Project"
                            >
                              <BookMarked className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, sortedBooks.length)} of {sortedBooks.length} books
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-2 font-mono text-slate-700 dark:text-slate-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Save Search Modal */}
      {savedSearchModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-indigo-500" />
              <span>Save Market Search</span>
            </h3>
            <p className="text-xs text-slate-500">
              Save this search configuration, active filters, and result snapshot. You can re-run it in 30 days to compare newly entered books and BSR changes.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Search Name
              </label>
              <input
                type="text"
                value={savedSearchName}
                onChange={(e) => setSavedSearchName(e.target.value)}
                placeholder="e.g. Senior Sudoku — Low Review Deep Scan"
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSavedSearchModalOpen(false)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSearch}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Save Search
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Searches Drawer */}
      {savedDrawerOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-end z-50">
          <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-md h-full p-6 overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-indigo-500" />
                <span>Saved Market Scans</span>
              </h3>
              <button onClick={() => setSavedDrawerOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {savedSearches.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-8">No saved market scans yet.</div>
              ) : (
                savedSearches.map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2 bg-slate-50/50 dark:bg-slate-950/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{s.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{s.marketplace}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">
                      Seeds: {Array.isArray(s.seeds) ? s.seeds.join(', ') : s.seeds}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>{s.resultCount} books stored</span>
                      <span>Last run: {new Date(s.lastRun).toLocaleDateString()}</span>
                    </div>
                    <button
                      onClick={async () => {
                        const res = await fetch('/api/market/saved', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ id: s.id }),
                        });
                        const data = await res.json();
                        if (data.success && data.newScan) {
                          setBooks(data.newScan.books);
                          setOverview(data.newScan.overview);
                          setSavedDrawerOpen(false);
                        }
                      }}
                      className="w-full py-1.5 text-xs font-semibold rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Re-run & Compare Delta</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Competitor Analysis Modal */}
      {bulkAnalysisModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-500" />
                <span>Bulk Competitor Analysis ({selectedBookAsins.size} Books)</span>
              </h3>
              <button onClick={() => setBulkAnalysisModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Selected Books</span>
                  <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1">
                    {selectedBookAsins.size}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Avg Price</span>
                  <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1">
                    $
                    {(
                      books
                        .filter((b) => selectedBookAsins.has(b.asin))
                        .reduce((acc, b) => acc + b.price, 0) / (selectedBookAsins.size || 1)
                    ).toFixed(2)}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Median Reviews</span>
                  <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1">
                    {(() => {
                      const revs = books
                        .filter((b) => selectedBookAsins.has(b.asin))
                        .map((b) => b.reviewCount)
                        .sort((a, b) => a - b);
                      return revs[Math.floor(revs.length / 2)] || 0;
                    })()}
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Common Title Keywords & Themes
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['sudoku', 'seniors', 'large print', 'easy', 'puzzles', 'brain', 'adults', 'challenge'].map(
                    (kw) => (
                      <span
                        key={kw}
                        className="px-2 py-0.5 text-xs bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 rounded border border-indigo-200 dark:border-indigo-800"
                      >
                        {kw}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800/60 space-y-1">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                  Market Positioning Observation
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Competitors in this selected cluster emphasize "large print", "easy on eyes", and "stress-free". Potential differentiation gap exists for combined format workbooks (e.g. Sudoku + Word Search combo) or progressive difficulty levels (Beginner to Intermediate).
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setBulkAnalysisModalOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MarketScannerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading Deep Market Scanner...</div>}>
      <MarketScannerContent />
    </Suspense>
  );
}
