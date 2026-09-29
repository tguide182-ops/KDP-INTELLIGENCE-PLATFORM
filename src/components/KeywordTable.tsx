'use client';

import React, { useState, useMemo } from 'react';
import { KeywordItem, KeywordStatus } from '@/lib/types';
import { OpportunityBadge } from './OpportunityBadge';
import { ScorePopover } from './ScorePopover';
import { Tooltip } from './Tooltip';
import { formatNumber } from '@/lib/utils';
import {
  ExternalLink,
  Bookmark,
  Star,
  Copy,
  Check,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Filter,
  Sparkles,
  SlidersHorizontal,
  Flame,
  ShieldAlert,
  Search,
  CheckSquare,
  Square,
  FileSpreadsheet,
} from 'lucide-react';

interface KeywordTableProps {
  keywords: KeywordItem[];
  currentMarketplace: string;
  onSaveKeyword?: (kw: KeywordItem) => void;
  onAnalyzeKeyword?: (kw: KeywordItem) => void;
  isLoading?: boolean;
}

type SortField = 'term' | 'estimatedMonthlyVol' | 'amazonResultCount' | 'demandScore' | 'competitionScore' | 'opportunityScore' | 'wordCount';
type SortOrder = 'asc' | 'desc';
type FilterPreset = 'all' | 'high_demand' | 'low_competition' | 'hidden_gems' | 'long_tail' | 'buyer_intent';
type TableDensity = 'compact' | 'comfortable' | 'spacious';

export const KeywordTable: React.FC<KeywordTableProps> = ({
  keywords,
  currentMarketplace,
  onSaveKeyword,
  onAnalyzeKeyword,
  isLoading = false,
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [activePreset, setActivePreset] = useState<FilterPreset>('all');
  const [sortField, setSortField] = useState<SortField>('opportunityScore');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [density, setDensity] = useState<TableDensity>('comfortable');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Filter & sort logic
  const filteredKeywords = useMemo(() => {
    return keywords.filter((kw) => {
      // 1. Text search filter
      if (searchFilter.trim()) {
        const matchesTerm = kw.term.toLowerCase().includes(searchFilter.toLowerCase());
        const matchesIntent = kw.intent.toLowerCase().includes(searchFilter.toLowerCase());
        if (!matchesTerm && !matchesIntent) return false;
      }

      // 2. Preset filters
      switch (activePreset) {
        case 'high_demand':
          return kw.demandScore >= 7.0;
        case 'low_competition':
          return kw.competitionScore <= 5.5;
        case 'hidden_gems':
          return kw.opportunityScore >= 7.5 && kw.competitionScore <= 5.0;
        case 'long_tail':
          return kw.wordCount >= 4;
        case 'buyer_intent':
          return kw.intent === 'commercial' || kw.intent === 'transactional';
        case 'all':
        default:
          return true;
      }
    }).sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        return sortOrder === 'asc'
          ? (aVal as string).localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal as string);
      }

      return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [keywords, searchFilter, activePreset, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredKeywords.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredKeywords.map((k) => k.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleCopyTerm = (term: string, id: string) => {
    navigator.clipboard.writeText(term);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleSave = (kw: KeywordItem) => {
    const next = new Set(savedIds);
    if (next.has(kw.id)) next.delete(kw.id);
    else next.add(kw.id);
    setSavedIds(next);

    if (onSaveKeyword) onSaveKeyword(kw);
  };

  const handleExport = async (format: 'xlsx' | 'csv') => {
    const exportData = selectedIds.size > 0
      ? keywords.filter((k) => selectedIds.has(k.id))
      : filteredKeywords;

    try {
      const response = await fetch('/api/keywords/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: exportData,
          format,
          filename: `kdp-keywords-${new Date().toISOString().slice(0, 10)}`,
        }),
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kdp-keywords-${new Date().toISOString().slice(0, 10)}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export error:', err);
      alert('Export failed. Please try again.');
    }
  };

  // Density padding
  const cellPadding = {
    compact: 'py-1.5 px-3 text-xs',
    comfortable: 'py-3 px-3.5 text-xs',
    spacious: 'py-4 px-4 text-sm',
  }[density];

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        {/* Preset filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Presets:
          </span>
          {[
            { id: 'all', label: 'All Keywords' },
            { id: 'high_demand', label: '🔥 High Demand' },
            { id: 'low_competition', label: '🛡️ Low Competition' },
            { id: 'hidden_gems', label: '💎 Hidden Gems' },
            { id: 'long_tail', label: '🎯 Long Tail (4+ words)' },
            { id: 'buyer_intent', label: '💰 Buyer Intent' },
          ].map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setActivePreset(preset.id as FilterPreset)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-all ${
                activePreset === preset.id
                  ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Search within & actions */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter in results..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-brand-500 w-44"
            />
          </div>

          {/* Density Switcher */}
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-950">
            {(['compact', 'comfortable', 'spacious'] as TableDensity[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDensity(d)}
                className={`px-2 py-1 text-[10px] font-medium uppercase rounded-lg capitalize transition-colors ${
                  density === d
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Export Dropdown / Button */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleExport('xlsx')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-xs transition-colors"
              title="Export to formatted Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Export XLSX</span>
            </button>
            <button
              type="button"
              onClick={() => handleExport('csv')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 shadow-xs transition-colors"
              title="Export to CSV"
            >
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Selected Items Notice */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-900 text-xs text-brand-900 dark:text-brand-200 animate-in fade-in">
          <span>
            <strong>{selectedIds.size}</strong> of {filteredKeywords.length} keywords selected
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                filteredKeywords
                  .filter((k) => selectedIds.has(k.id))
                  .forEach((k) => handleSave(k));
              }}
              className="px-2.5 py-1 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 transition-colors"
            >
              Save Selected
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="px-2 py-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Main Data Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-3 w-8">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {selectedIds.size === filteredKeywords.length && filteredKeywords.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-brand-600" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="py-3 px-2 w-8"></th>
              <th
                onClick={() => handleSort('term')}
                className="py-3 px-3.5 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200"
              >
                <div className="flex items-center gap-1">
                  <span>Keyword Phrase</span>
                  <ArrowUpDown className="w-3 h-3 opacity-50" />
                </div>
              </th>
              <th
                onClick={() => handleSort('estimatedMonthlyVol')}
                className="py-3 px-3.5 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Est. Volume</span>
                  <Tooltip
                    content="Estimated monthly searches based on Amazon suggestion frequency and market signals. Comparative metric, not exact figures."
                    iconOnly
                  />
                  <ArrowUpDown className="w-3 h-3 opacity-50" />
                </div>
              </th>
              <th className="py-3 px-3 text-center">Trend</th>
              <th
                onClick={() => handleSort('amazonResultCount')}
                className="py-3 px-3 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Results</span>
                  <Tooltip
                    content="Total observed Amazon search result count for this phrase."
                    iconOnly
                  />
                  <ArrowUpDown className="w-3 h-3 opacity-50" />
                </div>
              </th>
              <th
                onClick={() => handleSort('competitionScore')}
                className="py-3 px-3 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Competition</span>
                  <Tooltip
                    content="Competition Score (0-10) calculated from Amazon results count, median reviews, BSR velocity, and listing age."
                    iconOnly
                  />
                  <ArrowUpDown className="w-3 h-3 opacity-50" />
                </div>
              </th>
              <th
                onClick={() => handleSort('demandScore')}
                className="py-3 px-3 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Demand</span>
                  <Tooltip
                    content="Demand Score (0-10) calculated from search volume, suggestion prominence, trend momentum, and commercial intent."
                    iconOnly
                  />
                  <ArrowUpDown className="w-3 h-3 opacity-50" />
                </div>
              </th>
              <th
                onClick={() => handleSort('opportunityScore')}
                className="py-3 px-3.5 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200"
              >
                <div className="flex items-center gap-1">
                  <span>Opportunity Score</span>
                  <Tooltip
                    content="Balanced research opportunity score (0-10) weighing high demand against low observed competition with commercial intent bonuses."
                    iconOnly
                  />
                  <ArrowUpDown className="w-3 h-3 opacity-50" />
                </div>
              </th>
              <th className="py-3 px-3">Intent</th>
              <th
                onClick={() => handleSort('wordCount')}
                className="py-3 px-2 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 text-center"
              >
                Words
              </th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredKeywords.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-12 text-center text-slate-400">
                  <div className="max-w-xs mx-auto space-y-2">
                    <p className="text-sm font-medium">No keywords match your active filter.</p>
                    <p className="text-xs text-slate-500">
                      Try selecting &apos;All Keywords&apos; or clearing your filter search query.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredKeywords.map((kw) => {
                const isSelected = selectedIds.has(kw.id);
                const isSaved = savedIds.has(kw.id) || kw.isSaved;

                return (
                  <tr
                    key={kw.id}
                    onClick={() => toggleSelect(kw.id)}
                    className={`group transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-brand-50/50 dark:bg-brand-950/30'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className={cellPadding} onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => toggleSelect(kw.id)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-brand-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Star / Bookmark */}
                    <td className="py-2 px-1 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleSave(kw)}
                        className={`transition-colors ${
                          isSaved
                            ? 'text-amber-500'
                            : 'text-slate-300 dark:text-slate-600 hover:text-amber-400'
                        }`}
                        title={isSaved ? 'Saved to Project' : 'Save Keyword'}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
                      </button>
                    </td>

                    {/* Keyword Term */}
                    <td className={cellPadding}>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {kw.term}
                        </span>
                        {kw.phraseType === 'seed' && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                            Seed
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{kw.phraseType}</span>
                        {kw.parentKeyword && kw.parentKeyword !== kw.term && (
                          <span>via &quot;{kw.parentKeyword}&quot;</span>
                        )}
                      </div>
                    </td>

                    {/* Estimated Monthly Volume */}
                    <td className={`${cellPadding} text-right font-mono font-semibold`}>
                      <span className="text-slate-900 dark:text-slate-100">
                        {formatNumber(kw.estimatedMonthlyVol)}
                      </span>
                    </td>

                    {/* Trend */}
                    <td className={`${cellPadding} text-center`}>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          kw.volumeTrend === 'rising'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : kw.volumeTrend === 'declining'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {kw.volumeTrend}
                      </span>
                    </td>

                    {/* Amazon Results Count */}
                    <td className={`${cellPadding} text-right font-mono text-slate-600 dark:text-slate-400`}>
                      {formatNumber(kw.amazonResultCount)}
                    </td>

                    {/* Competition Score */}
                    <td className={`${cellPadding} text-center`} onClick={(e) => e.stopPropagation()}>
                      <ScorePopover
                        type="competition"
                        score={kw.competitionScore}
                        competitionBreakdown={kw.competitionBreakdown}
                      />
                    </td>

                    {/* Demand Score */}
                    <td className={`${cellPadding} text-center`} onClick={(e) => e.stopPropagation()}>
                      <ScorePopover
                        type="demand"
                        score={kw.demandScore}
                        demandBreakdown={kw.demandBreakdown}
                      />
                    </td>

                    {/* Opportunity Score Badge */}
                    <td className={cellPadding}>
                      <OpportunityBadge
                        score={kw.opportunityScore}
                        confidence={kw.confidenceLevel}
                        dataSource={kw.dataSource}
                        size={density === 'compact' ? 'sm' : 'md'}
                      />
                    </td>

                    {/* Intent */}
                    <td className={cellPadding}>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                        {kw.intent.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Word Count */}
                    <td className={`${cellPadding} text-center font-mono text-slate-500`}>
                      {kw.wordCount}
                    </td>

                    {/* Actions */}
                    <td className={`${cellPadding} text-right`} onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {/* Copy button */}
                        <button
                          type="button"
                          onClick={() => handleCopyTerm(kw.term, kw.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Copy keyword"
                        >
                          {copiedId === kw.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Open on Amazon */}
                        <a
                          href={`https://${kw.marketplace}/s?k=${encodeURIComponent(kw.term)}&i=stripbooks`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="View on Amazon"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 pt-2 px-1">
        <span>
          Showing <strong>{filteredKeywords.length}</strong> keywords (Marketplace: {currentMarketplace})
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Strong Opportunity (7.5+)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Moderate (5.5 - 7.4)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> High Competition (&lt;5.5)
          </span>
        </div>
      </div>
    </div>
  );
};
