'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { TrendComparisonResult, KeywordTrendSeries } from '@/services/TrendService';
import { formatNumber } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Plus,
  X,
  RefreshCw,
  Search,
  Sparkles,
  FileText,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  SlidersHorizontal,
} from 'lucide-react';

const PRESET_TOPICS = [
  {
    name: 'Cookbook Trends',
    keywords: ['glp-1 cookbook', 'menopause cookbook', 'keto cookbook', 'air fryer recipes'],
  },
  {
    name: 'Self-Help & Planners',
    keywords: ['adhd planner', 'habit tracker journal', 'manifestation workbook', 'anxiety workbook'],
  },
  {
    name: 'Activity & Low Content',
    keywords: ['mindfulness coloring book', 'word search for seniors', 'sudoku puzzle book', 'toddler coloring book'],
  },
  {
    name: 'Fiction Tropes',
    keywords: ['cozy fantasy', 'dark romance', 'litrpg progression', 'psychological thriller'],
  },
];

const SERIES_COLORS = [
  { stroke: '#6366f1', fill: 'rgba(99, 102, 241, 0.1)', bg: 'bg-indigo-500', text: 'text-indigo-500' },
  { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.1)', bg: 'bg-emerald-500', text: 'text-emerald-500' },
  { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.1)', bg: 'bg-amber-500', text: 'text-amber-500' },
  { stroke: '#f43f5e', fill: 'rgba(244, 63, 94, 0.1)', bg: 'bg-rose-500', text: 'text-rose-500' },
  { stroke: '#06b6d4', fill: 'rgba(6, 182, 212, 0.1)', bg: 'bg-cyan-500', text: 'text-cyan-500' },
  { stroke: '#a855f7', fill: 'rgba(168, 85, 247, 0.1)', bg: 'bg-purple-500', text: 'text-purple-500' },
];

function TrendCompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialKws = searchParams.get('keywords')
    ? searchParams.get('keywords')!.split(',').map((s) => s.trim()).filter(Boolean)
    : PRESET_TOPICS[0].keywords;

  const initialTimeframe = (searchParams.get('timeframe') as '30d' | '90d' | '12m') || '90d';

  const [marketplace, setMarketplace] = useState('amazon.com');
  const [keywords, setKeywords] = useState<string[]>(initialKws);
  const [timeframe, setTimeframe] = useState<'30d' | '90d' | '12m'>(initialTimeframe);
  const [inputKeyword, setInputKeyword] = useState('');
  const [trendData, setTrendData] = useState<TrendComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<{ keyword: string; date: string; volume: number } | null>(null);

  const fetchTrends = async (kws: string[], tf: '30d' | '90d' | '12m') => {
    if (kws.length === 0) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/trends/compare?keywords=${encodeURIComponent(kws.join(','))}&timeframe=${tf}`);
      const data = await res.json();
      setTrendData(data);
    } catch (err) {
      console.error('Failed to fetch trend comparison:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends(keywords, timeframe);
  }, [keywords, timeframe]);

  const handleAddKeyword = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputKeyword.trim();
    if (!trimmed || keywords.includes(trimmed) || keywords.length >= 6) return;
    const updated = [...keywords, trimmed];
    setKeywords(updated);
    setInputKeyword('');
  };

  const handleRemoveKeyword = (kwToRemove: string) => {
    if (keywords.length <= 1) return;
    const updated = keywords.filter((k) => k !== kwToRemove);
    setKeywords(updated);
  };

  const handleSelectPreset = (presetKeywords: string[]) => {
    setKeywords(presetKeywords);
  };

  // Chart coordinate calculations
  const calculateChartPaths = () => {
    if (!trendData || !trendData.series.length) return [];

    let minVol = Infinity;
    let maxVol = -Infinity;

    trendData.series.forEach((s) => {
      s.dataPoints.forEach((p) => {
        if (p.volume < minVol) minVol = p.volume;
        if (p.volume > maxVol) maxVol = p.volume;
      });
    });

    if (minVol === maxVol) {
      minVol = 0;
      maxVol = maxVol || 1000;
    }

    const padding = (maxVol - minVol) * 0.1 || 100;
    const effectiveMin = Math.max(0, minVol - padding);
    const effectiveMax = maxVol + padding;

    const width = 800;
    const height = 300;
    const padX = 40;
    const padY = 30;
    const chartW = width - padX * 2;
    const chartH = height - padY * 2;

    return trendData.series.map((s, idx) => {
      const points = s.dataPoints;
      const count = points.length;

      const coordinates = points.map((p, pIdx) => {
        const x = padX + (pIdx / (count - 1)) * chartW;
        const y = padY + chartH - ((p.volume - effectiveMin) / (effectiveMax - effectiveMin)) * chartH;
        return { x, y, date: p.date, volume: p.volume, keyword: s.keyword };
      });

      const pathData = coordinates.reduce((acc, curr, i) => {
        return i === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
      }, '');

      const areaData = `${pathData} L ${coordinates[coordinates.length - 1].x} ${padY + chartH} L ${coordinates[0].x} ${padY + chartH} Z`;

      const color = SERIES_COLORS[idx % SERIES_COLORS.length];

      return {
        keyword: s.keyword,
        color,
        pathData,
        areaData,
        coordinates,
      };
    });
  };

  const chartPaths = calculateChartPaths();

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
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      Multi-Keyword Trend Comparison
                    </h1>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-bold">
                      PROVENANCE: ESTIMATED + AI_DERIVED
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Compare search trajectory, velocity, and seasonal momentum across competing Amazon KDP keywords.
                  </p>
                </div>
              </div>
            </div>

            {/* Timeframe selector */}
            <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
              {(['30d', '90d', '12m'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    timeframe === tf
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {tf === '30d' ? '30-Day Velocity' : tf === '90d' ? '90-Day Momentum' : '12-Month Macro'}
                </button>
              ))}
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-medium whitespace-nowrap flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Presets:
            </span>
            {PRESET_TOPICS.map((p) => (
              <button
                key={p.name}
                onClick={() => handleSelectPreset(p.keywords)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500/40 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap transition-all shadow-xs"
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Keyword Selector Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {keywords.map((kw, idx) => {
                const color = SERIES_COLORS[idx % SERIES_COLORS.length];
                return (
                  <div
                    key={kw}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-xs"
                    style={{
                      borderColor: color.stroke,
                      backgroundColor: color.fill,
                      color: color.stroke,
                    }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color.stroke }} />
                    <span>{kw}</span>
                    {keywords.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(kw)}
                        className="ml-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}

              {keywords.length < 6 && (
                <form onSubmit={handleAddKeyword} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={inputKeyword}
                    onChange={(e) => setInputKeyword(e.target.value)}
                    placeholder="Add comparison keyword..."
                    className="px-3 py-1.5 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 w-48"
                  />
                  <button
                    type="submit"
                    className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-500 hover:text-white text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Fastest Growing Summary Banner */}
          {trendData && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-brand-500/10 border border-indigo-500/20 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500 text-white shadow-xs">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Trajectory Intelligence
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {trendData.summary}
                  </div>
                </div>
              </div>
              <button
                onClick={() => fetchTrends(keywords, timeframe)}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-xs transition-all shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Data</span>
              </button>
            </div>
          )}

          {/* Visual Trajectory Chart */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Estimated Monthly Search Volume Trajectory
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Normalized relative trajectory curves over the selected {timeframe} window
                </p>
              </div>

              {hoveredPoint && (
                <div className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-medium flex items-center gap-2 shadow-md">
                  <span className="font-bold">{hoveredPoint.keyword}:</span>
                  <span className="text-brand-300">{formatNumber(hoveredPoint.volume)} searches/mo</span>
                  <span className="text-slate-400 text-[10px]">({hoveredPoint.date})</span>
                </div>
              )}
            </div>

            {/* SVG Chart Area */}
            <div className="relative w-full h-[320px] bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800/60 p-2 overflow-hidden flex items-center justify-center">
              {isLoading ? (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
                  <span className="text-xs font-medium">Computing historical trajectory series...</span>
                </div>
              ) : chartPaths.length > 0 ? (
                <svg viewBox="0 0 800 300" className="w-full h-full overflow-visible">
                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
                    <line
                      key={pct}
                      x1="40"
                      y1={30 + pct * 240}
                      x2="760"
                      y2={30 + pct * 240}
                      stroke="currentColor"
                      strokeDasharray="4 4"
                      className="text-slate-200 dark:text-slate-800/60"
                    />
                  ))}

                  {/* Areas and Lines */}
                  {chartPaths.map((item) => (
                    <g key={item.keyword}>
                      <path d={item.areaData} fill={item.color.fill} />
                      <path
                        d={item.pathData}
                        fill="none"
                        stroke={item.color.stroke}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {item.coordinates.map((coord, i) => (
                        <circle
                          key={i}
                          cx={coord.x}
                          cy={coord.y}
                          r="4"
                          fill={item.color.stroke}
                          className="transition-all hover:scale-150 cursor-pointer"
                          onMouseEnter={() =>
                            setHoveredPoint({
                              keyword: coord.keyword,
                              date: coord.date,
                              volume: coord.volume,
                            })
                          }
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      ))}
                    </g>
                  ))}
                </svg>
              ) : (
                <div className="text-xs text-slate-400">No data points available</div>
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
              {chartPaths.map((item) => (
                <div key={item.keyword} className="flex items-center gap-2 text-xs font-medium">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color.stroke }} />
                  <span className="text-slate-700 dark:text-slate-300">{item.keyword}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Metrics Table */}
          {trendData && (
            <div className="rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Keyword Momentum & Trajectory Breakdown
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Direct comparison of growth velocity, average volume, and publishing actions
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 dark:bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-6 py-3.5">Keyword</th>
                      <th className="px-6 py-3.5">Direction</th>
                      <th className="px-6 py-3.5">Momentum ({timeframe})</th>
                      <th className="px-6 py-3.5">Avg Volume</th>
                      <th className="px-6 py-3.5">Latest Volume</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {trendData.series.map((item, idx) => {
                      const color = SERIES_COLORS[idx % SERIES_COLORS.length];
                      const latestVol = item.dataPoints[item.dataPoints.length - 1]?.volume || item.averageVolume;
                      const isFastest = item.keyword === trendData.fastestGrowing;

                      return (
                        <tr key={item.keyword} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color.stroke }} />
                              <span className="font-bold text-slate-900 dark:text-white text-sm">{item.keyword}</span>
                              {isFastest && (
                                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold">
                                  Top Mover
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                item.direction === 'rising'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                  : item.direction === 'declining'
                                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              {item.direction === 'rising' ? (
                                <TrendingUp className="w-3.5 h-3.5" />
                              ) : item.direction === 'declining' ? (
                                <TrendingDown className="w-3.5 h-3.5" />
                              ) : (
                                <Minus className="w-3.5 h-3.5" />
                              )}
                              <span className="capitalize">{item.direction}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div
                              className={`flex items-center gap-1 font-extrabold text-sm ${
                                item.growthPct > 0
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : item.growthPct < 0
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : 'text-slate-500'
                              }`}
                            >
                              {item.growthPct > 0 ? (
                                <ArrowUpRight className="w-4 h-4" />
                              ) : item.growthPct < 0 ? (
                                <ArrowDownRight className="w-4 h-4" />
                              ) : null}
                              <span>{item.growthPct > 0 ? `+${item.growthPct}%` : `${item.growthPct}%`}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-slate-700 dark:text-slate-300">
                            {formatNumber(item.averageVolume)}/mo
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                            {formatNumber(latestVol)}/mo
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => router.push(`/keywords/explorer?q=${encodeURIComponent(item.keyword)}`)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-500 hover:text-white text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1 font-semibold"
                                title="Explore Keyword"
                              >
                                <Search className="w-3 h-3" />
                                <span>Explore</span>
                              </button>
                              <button
                                onClick={() => router.push(`/reports?niche=${encodeURIComponent(item.keyword)}`)}
                                className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 transition-colors flex items-center gap-1 font-semibold"
                                title="Generate Research Report"
                              >
                                <FileText className="w-3 h-3" />
                                <span>Report</span>
                              </button>
                              <button
                                onClick={() => router.push(`/builder/title?seed=${encodeURIComponent(item.keyword)}`)}
                                className="px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/40 hover:bg-brand-600 hover:text-white text-brand-600 dark:text-brand-400 transition-colors flex items-center gap-1 font-semibold"
                                title="Build Title"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>Title</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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

export default function TrendComparePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070b14]">
          <div className="flex items-center gap-2 text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin text-brand-500" />
            <span className="text-xs font-medium">Loading Trend Comparison...</span>
          </div>
        </div>
      }
    >
      <TrendCompareContent />
    </Suspense>
  );
}
