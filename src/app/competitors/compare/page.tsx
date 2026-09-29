'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { SERPBook } from '@/services/SERPService';
import { formatNumber, formatBSR, formatCurrency } from '@/lib/utils';
import {
  GitFork,
  ExternalLink,
  RefreshCw,
  Plus,
  Trash2,
  BookOpen,
  Sparkles,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

function CompetitorCompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialAsins = searchParams.get('asins') || 'B0E9L82ZZ1,B0C7K9N81P,B0DJ1K99X2';
  const initialMarketplace = searchParams.get('mp') || 'amazon.com';

  const [asinsString, setAsinsString] = useState(initialAsins);
  const [marketplace, setMarketplace] = useState(initialMarketplace);
  const [books, setBooks] = useState<SERPBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newAsinInput, setNewAsinInput] = useState('');

  const fetchComparison = async (asins: string[], mp: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/competitors/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asins, marketplace: mp }),
      });
      const data = await res.json();
      setBooks(data.books || []);
    } catch (err) {
      console.error('Error fetching competitor comparison:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const list = initialAsins.split(',').map((s) => s.trim()).filter(Boolean);
    if (list.length > 0) {
      fetchComparison(list, initialMarketplace);
    }
  }, [initialAsins, initialMarketplace]);

  const handleAddAsin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsinInput.trim()) return;
    const currentList = books.map((b) => b.asin);
    const updated = Array.from(new Set([...currentList, newAsinInput.trim().toUpperCase()]));
    setNewAsinInput('');
    router.push(`/competitors/compare?asins=${updated.join(',')}&mp=${marketplace}`);
    fetchComparison(updated, marketplace);
  };

  const handleRemoveAsin = (asinToRemove: string) => {
    const updated = books.filter((b) => b.asin !== asinToRemove).map((b) => b.asin);
    router.push(`/competitors/compare?asins=${updated.join(',')}&mp=${marketplace}`);
    fetchComparison(updated, marketplace);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14]">
      <Header currentMarketplace={marketplace} onMarketplaceChange={(mp) => {
        setMarketplace(mp);
        fetchComparison(books.map((b) => b.asin), mp);
      }} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  <GitFork className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    Competitor Comparison Matrix
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Side-by-side analysis of up to 5 competing books: BSR sales rank, pricing, review barriers, and title structures.
                  </p>
                </div>
              </div>
            </div>

            {/* Add ASIN Form */}
            <form onSubmit={handleAddAsin} className="flex items-center gap-2">
              <input
                type="text"
                value={newAsinInput}
                onChange={(e) => setNewAsinInput(e.target.value)}
                placeholder="Add ASIN (e.g. B0F1X899A3)..."
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-44 uppercase font-mono focus:outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Book</span>
              </button>
            </form>
          </div>

          {isLoading ? (
            <div className="py-24 flex justify-center items-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-brand-500" />
            </div>
          ) : books.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              No books selected for comparison. Add an ASIN above.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Main Comparison Matrix Table */}
              <div className="overflow-x-auto rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60">
                      <th className="py-4 px-4 w-48 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                        Metric
                      </th>
                      {books.map((b) => (
                        <th key={b.asin} className="py-4 px-4 min-w-[220px] max-w-[280px]">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                              {b.asin}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveAsin(b.asin)}
                              className="text-slate-300 hover:text-rose-500 transition-colors"
                              title="Remove from comparison"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs mt-2 line-clamp-2">
                            {b.title}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">By {b.author}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {/* BSR */}
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-semibold text-slate-500">BSR Sales Rank</td>
                      {books.map((b) => (
                        <td key={b.asin} className="py-3 px-4 font-mono font-bold text-brand-600 dark:text-brand-400">
                          {formatBSR(b.bsr)}
                        </td>
                      ))}
                    </tr>

                    {/* Est Monthly Sales */}
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-semibold text-slate-500">Est. Monthly Sales</td>
                      {books.map((b) => (
                        <td key={b.asin} className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ~{formatNumber(b.estimatedMonthlySales)} copies/mo
                        </td>
                      ))}
                    </tr>

                    {/* Est Monthly Revenue */}
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-semibold text-slate-500">Est. Monthly Revenue</td>
                      {books.map((b) => (
                        <td key={b.asin} className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                          {formatCurrency(b.estimatedMonthlyRevenue)}/mo
                        </td>
                      ))}
                    </tr>

                    {/* Price */}
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-semibold text-slate-500">Paperback Price</td>
                      {books.map((b) => (
                        <td key={b.asin} className="py-3 px-4 font-mono text-slate-800 dark:text-slate-200">
                          {formatCurrency(b.price)}
                        </td>
                      ))}
                    </tr>

                    {/* Reviews */}
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-semibold text-slate-500">Reviews & Rating</td>
                      {books.map((b) => (
                        <td key={b.asin} className="py-3 px-4">
                          <span className="font-mono font-bold">{formatNumber(b.reviewCount)} reviews</span>
                          <span className="text-amber-500 ml-2 font-mono">★ {b.rating.toFixed(1)}</span>
                        </td>
                      ))}
                    </tr>

                    {/* Page Count */}
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-semibold text-slate-500">Page Count</td>
                      {books.map((b) => (
                        <td key={b.asin} className="py-3 px-4 font-mono">
                          {b.pages} pages
                        </td>
                      ))}
                    </tr>

                    {/* Publication Age */}
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-semibold text-slate-500">Listing Age</td>
                      {books.map((b) => (
                        <td key={b.asin} className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                          {b.estimatedAgeDays} days ({new Date(b.publicationDate).toLocaleDateString()})
                        </td>
                      ))}
                    </tr>

                    {/* Title Character Count */}
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-semibold text-slate-500">Title Length</td>
                      {books.map((b) => (
                        <td key={b.asin} className="py-3 px-4 font-mono">
                          {b.title.length} characters
                        </td>
                      ))}
                    </tr>

                    {/* Subtitle Character Count */}
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-semibold text-slate-500">Subtitle Length</td>
                      {books.map((b) => (
                        <td key={b.asin} className="py-3 px-4 font-mono">
                          {(b.subtitle || '').length} characters
                        </td>
                      ))}
                    </tr>

                    {/* Publisher */}
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-semibold text-slate-500">Publisher</td>
                      {books.map((b) => (
                        <td key={b.asin} className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {b.publisher}
                        </td>
                      ))}
                    </tr>

                    {/* Direct Links */}
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-semibold text-slate-500">Amazon Page</td>
                      {books.map((b) => (
                        <td key={b.asin} className="py-3 px-4">
                          <a
                            href={`https://${marketplace}/dp/${b.asin}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                          >
                            <span>Open Listing</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function CompetitorComparePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070b14] text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
        </div>
      }
    >
      <CompetitorCompareContent />
    </Suspense>
  );
}
