'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  BarChart3,
  Search,
  Users,
  Eye,
  Film,
  Calendar,
  Zap,
  TrendingUp,
  Dna,
  ArrowRight,
  ShieldAlert,
  ArrowLeftRight,
  Plus,
  X,
  Trophy,
  ExternalLink,
  Sparkles,
  Compass,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { ProvenanceBadge } from '@/components/provenance/ProvenanceBadge';
import { NormalizedChannel, NormalizedVideo, ChannelDNAResult } from '@/lib/providers/youtube/types';
import { ChannelComparisonResult, ComparedChannelData } from '@/app/api/research/compare/route';
import { cleanYouTubeInput } from '@/lib/youtube-utils';
import Link from 'next/link';

function ChannelAnalyzerContent() {
  const searchParams = useSearchParams();
  const initialHandle = searchParams.get('handle') || '@apexinquiries';
  const initialTab = (searchParams.get('tab') as 'autopsy' | 'compare') || 'autopsy';
  const compareParam = searchParams.get('compare');

  const [activeTab, setActiveTab] = useState<'autopsy' | 'compare'>(initialTab);
  const [inputQuery, setInputQuery] = useState(initialHandle);
  const [channel, setChannel] = useState<NormalizedChannel | null>(null);
  const [videos, setVideos] = useState<NormalizedVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Comparison State
  const [comparedChannels, setComparedChannels] = useState<string[]>(() => {
    if (compareParam) {
      return compareParam.split(',').map((c) => c.trim()).filter(Boolean);
    }
    return [initialHandle];
  });
  const [comparisonResult, setComparisonResult] = useState<ChannelComparisonResult | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState('');
  const [newCompareInput, setNewCompareInput] = useState('');
  const [suggestedCompetitors, setSuggestedCompetitors] = useState<NormalizedChannel[]>([]);
  const [suggestedLoading, setSuggestedLoading] = useState(false);

  // Fetch single channel autopsy data
  const fetchChannelData = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/research/channel?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to fetch channel');
        setChannel(null);
      } else {
        setChannel(data.channel);
        // Also fetch outliers
        const outlierRes = await fetch(`/api/research/outliers?channelId=${data.channel.youtubeChannelId}`);
        const outlierData = await outlierRes.json();
        if (outlierData.outliers) {
          setVideos(outlierData.outliers.map((o: any) => o.video));
        }
      }
    } catch {
      setError('An error occurred connecting to the research provider');
    } finally {
      setLoading(false);
    }
  };

  // Fetch comparison data
  const fetchComparisonData = async (channelsToCompare: string[]) => {
    if (channelsToCompare.length === 0) return;
    setCompareLoading(true);
    setCompareError('');

    try {
      const queryStr = channelsToCompare.map((c) => encodeURIComponent(c)).join(',');
      const res = await fetch(`/api/research/compare?channels=${queryStr}`);
      const data = await res.json();

      if (!res.ok) {
        setCompareError(data.error || 'Failed to compare channels');
      } else {
        setComparisonResult(data);
      }
    } catch {
      setCompareError('An error occurred loading comparison data');
    } finally {
      setCompareLoading(false);
    }
  };

  // Fetch suggested competitors for active channel
  const fetchSuggestedCompetitors = async (targetHandleOrId: string) => {
    setSuggestedLoading(true);
    try {
      const res = await fetch(`/api/research/related-channels?channel=${encodeURIComponent(targetHandleOrId)}`);
      const data = await res.json();
      if (res.ok && data.relatedChannels) {
        setSuggestedCompetitors(data.relatedChannels);
      }
    } catch {
      // Ignore background suggestions error
    } finally {
      setSuggestedLoading(false);
    }
  };

  useEffect(() => {
    if (initialHandle) {
      fetchChannelData(initialHandle);
    }
  }, [initialHandle]);

  useEffect(() => {
    if (activeTab === 'compare' && comparedChannels.length > 0) {
      fetchComparisonData(comparedChannels);
      fetchSuggestedCompetitors(comparedChannels[0]);
    }
  }, [activeTab]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchChannelData(inputQuery);
    if (!comparedChannels.includes(inputQuery)) {
      setComparedChannels([inputQuery, ...comparedChannels.slice(0, 3)]);
    }
  };

  const handleAddComparedChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompareInput.trim()) return;
    const parsed = cleanYouTubeInput(newCompareInput);
    const handleToAdd = parsed.type === 'handle' ? parsed.value : parsed.value;

    if (comparedChannels.includes(handleToAdd)) {
      setNewCompareInput('');
      return;
    }

    if (comparedChannels.length >= 4) {
      setCompareError('You can compare a maximum of 4 channels side-by-side.');
      return;
    }

    const updated = [...comparedChannels, handleToAdd];
    setComparedChannels(updated);
    setNewCompareInput('');
    fetchComparisonData(updated);
  };

  const handleRemoveComparedChannel = (channelToRemove: string) => {
    if (comparedChannels.length <= 1) {
      setCompareError('At least one channel must remain in the comparison.');
      return;
    }
    const updated = comparedChannels.filter((c) => c !== channelToRemove);
    setComparedChannels(updated);
    fetchComparisonData(updated);
  };

  const handleAddSuggested = (suggestedHandle: string) => {
    if (comparedChannels.includes(suggestedHandle)) return;
    if (comparedChannels.length >= 4) {
      setCompareError('You can compare a maximum of 4 channels side-by-side.');
      return;
    }
    const updated = [...comparedChannels, suggestedHandle];
    setComparedChannels(updated);
    fetchComparisonData(updated);
  };

  const switchToCompareWithTarget = () => {
    setActiveTab('compare');
    if (channel && !comparedChannels.includes(channel.handle)) {
      const updated = [channel.handle, ...comparedChannels.filter((c) => c !== channel.handle)].slice(0, 4);
      setComparedChannels(updated);
      fetchComparisonData(updated);
      fetchSuggestedCompetitors(channel.handle);
    } else {
      fetchComparisonData(comparedChannels);
    }
  };

  // Max values for relative progress bars in comparison
  const maxSubs = Math.max(...(comparisonResult?.channels.map((c) => c.stats.subscriberCount) || [1]), 1);
  const maxViews = Math.max(...(comparisonResult?.channels.map((c) => c.stats.viewCount) || [1]), 1);
  const maxAvgViews = Math.max(...(comparisonResult?.channels.map((c) => c.stats.avgViews) || [1]), 1);
  const maxCadence = Math.max(...(comparisonResult?.channels.map((c) => c.stats.videosPerMonth) || [1]), 1);

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Mode Switcher */}
      <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <h1 className="text-xl font-bold text-white">Channel Analyzer & Competitor Benchmark</h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Deep forensic autopsy, Content DNA extraction, and side-by-side competitor benchmarking.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 bg-[#0b0c12] border border-zinc-800 rounded-xl">
            <button
              onClick={() => setActiveTab('autopsy')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'autopsy'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Channel Autopsy</span>
            </button>
            <button
              onClick={switchToCompareWithTarget}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'compare'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Compare Competitors</span>
              <span className="ml-1 px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded text-[10px] font-mono">
                {comparedChannels.length}
              </span>
            </button>
          </div>
        </div>

        {/* Autopsy Search Bar */}
        {activeTab === 'autopsy' && (
          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto pt-2">
            <div className="relative flex-1 sm:w-96">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Enter YouTube URL, @handle, or Channel ID..."
                className="w-full pl-9 pr-3 py-2 bg-[#0b0c12] border border-zinc-700/80 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium shrink-0 transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-indigo-600/20"
            >
              {loading ? 'Analyzing...' : 'Analyze Channel'}
            </button>
          </form>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">
            {error}
          </div>
        )}
      </div>

      {/* ========================================================== */}
      {/* TAB 1: SINGLE CHANNEL AUTOPSY & DNA                         */}
      {/* ========================================================== */}
      {activeTab === 'autopsy' && channel && (
        <>
          {/* Channel Overview Card */}
          <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center space-x-4">
              <img
                src={channel.thumbnailUrl}
                alt={channel.title}
                className="w-20 h-20 rounded-2xl border-2 border-indigo-500/30 object-cover shadow-lg"
              />
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <h2 className="text-lg font-bold text-white">{channel.title}</h2>
                  <ProvenanceBadge provenance={channel.subscriberCount.provenance} />
                </div>
                <p className="text-xs text-zinc-400 font-mono">{channel.handle}</p>
                <p className="text-xs text-zinc-300 max-w-xl line-clamp-2">{channel.description}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
              <div className="grid grid-cols-3 gap-3 w-full sm:w-auto shrink-0 border-t md:border-t-0 md:border-l border-zinc-800 pt-4 md:pt-0 md:pl-6">
                <div className="text-center p-2.5 bg-[#0b0c12] rounded-xl border border-zinc-800/80">
                  <p className="text-[10px] text-zinc-500 uppercase font-semibold">Subscribers</p>
                  <p className="text-sm font-bold text-white font-mono mt-0.5">
                    {channel.subscriberCount.value.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-2.5 bg-[#0b0c12] rounded-xl border border-zinc-800/80">
                  <p className="text-[10px] text-zinc-500 uppercase font-semibold">Total Views</p>
                  <p className="text-sm font-bold text-white font-mono mt-0.5">
                    {channel.viewCount.value.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-2.5 bg-[#0b0c12] rounded-xl border border-zinc-800/80">
                  <p className="text-[10px] text-zinc-500 uppercase font-semibold">Avg Views</p>
                  <p className="text-sm font-bold text-amber-400 font-mono mt-0.5">
                    {channel.avgViews30d.value.toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                onClick={switchToCompareWithTarget}
                className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all shrink-0"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Compare with Competitors</span>
              </button>
            </div>
          </div>

          {/* CHANNEL DNA SECTION */}
          <div className="bg-[#10121a] border border-zinc-800/90 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div className="flex items-center space-x-2">
                <Dna className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Channel Content DNA</h3>
                  <p className="text-xs text-zinc-400">
                    Structural patterns and mechanics extracted from top-performing content
                  </p>
                </div>
              </div>
              <ProvenanceBadge provenance="AI_DERIVED" sourceDescription="Extracted from video catalog analysis" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-[#141724] border border-zinc-800 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                  Positioning DNA
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed font-medium">
                  High-production forensic investigations into engineering anomalies, forgotten disasters, and systemic breakdowns.
                </p>
              </div>

              <div className="p-4 bg-[#141724] border border-zinc-800 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Title Formula DNA
                </span>
                <p className="text-xs text-zinc-200 font-mono">
                  &ldquo;The [Adjective] [Subject] That [Unexpected Action/Consequence]&rdquo;
                </p>
                <p className="text-[11px] text-zinc-400">
                  Triggers: Failure, Catastrophe, Nobody Can Explain
                </p>
              </div>

              <div className="p-4 bg-[#141724] border border-zinc-800 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Thumbnail DNA
                </span>
                <p className="text-xs text-zinc-200">
                  Single monolithic object center-left with extreme contrast lighting. No human faces; zero text clutter.
                </p>
              </div>

              <div className="p-4 bg-[#141724] border border-zinc-800 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                  Hook DNA
                </span>
                <p className="text-xs text-zinc-200">
                  In medias res cold-open under 8 seconds. Immediate specific timestamp and impossible-sounding anomaly.
                </p>
              </div>

              <div className="p-4 bg-[#141724] border border-zinc-800 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                  Visual Pacing DNA
                </span>
                <p className="text-xs text-zinc-200">
                  Cut frequency every 3.8s with continuous subtle zoom or pan. High-density schematics paired with archival clips.
                </p>
              </div>

              <div className="p-4 bg-[#141724] border border-zinc-800 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                  Storytelling Arc DNA
                </span>
                <p className="text-xs text-zinc-200">
                  Three-act thriller structure adapted for documentary pacing. Average of 4 open curiosity loops before payoff.
                </p>
              </div>
            </div>

            {/* Original Content from DNA Action */}
            <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-indigo-300">
                  Create Original Content From This DNA
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Generate unique concepts and structural blueprints inspired by this channel&apos;s mechanics without copying intellectual property.
                </p>
              </div>
              <Link
                href={`/create/ideas?dna=${encodeURIComponent(channel.title)}`}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium shrink-0 flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-600/20"
              >
                <span>Generate Original Ideas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* TOP OUTLIERS & VIDEOS */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Analyzed Outlier Videos
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.map((v) => (
                <div
                  key={v.id}
                  className="bg-[#12141c] border border-zinc-800/80 rounded-xl p-4 flex gap-4 hover:border-zinc-700 transition-all"
                >
                  <img
                    src={v.thumbnailUrl}
                    alt={v.title}
                    className="w-32 h-20 object-cover rounded-lg border border-zinc-700/80 shrink-0"
                  />
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-white truncate">{v.title}</h4>
                    <div className="flex items-center space-x-2 text-[11px] text-zinc-400">
                      <span>{v.views.value.toLocaleString()} views</span>
                      <span>•</span>
                      <span className="text-amber-400 font-semibold font-mono">
                        {v.multiplierVsBaseline?.value}× baseline
                      </span>
                    </div>
                    <div className="pt-1">
                      <Link
                        href={`/intelligence/videos?id=${v.youtubeVideoId}`}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center space-x-1"
                      >
                        <span>Inspect Autopsy</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ========================================================== */}
      {/* TAB 2: COMPETITOR COMPARISON MATRIX                        */}
      {/* ========================================================== */}
      {activeTab === 'compare' && (
        <div className="space-y-8">
          {/* Comparison Control Bar: Active Channels + Add Input + Suggestions */}
          <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <ArrowLeftRight className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    Compared Channels ({comparedChannels.length}/4)
                  </h2>
                </div>
                <p className="text-xs text-zinc-400">
                  Add up to 4 rivals to benchmark view velocity, cadence, outlier ratios, and white space opportunities.
                </p>
              </div>

              {/* Add Competitor Input */}
              <form onSubmit={handleAddComparedChannel} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCompareInput}
                  onChange={(e) => setNewCompareInput(e.target.value)}
                  placeholder="Paste URL or @handle to compare..."
                  className="px-3 py-2 bg-[#0b0c12] border border-zinc-700/80 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-60 sm:w-72"
                />
                <button
                  type="submit"
                  disabled={comparedChannels.length >= 4}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-600/20 shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>
            </div>

            {/* Active Channel Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-800/60">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mr-1">Active:</span>
              {comparedChannels.map((cHandle, idx) => (
                <div
                  key={cHandle}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    idx === 0
                      ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-200'
                      : 'bg-zinc-800/80 border-zinc-700 text-zinc-200'
                  }`}
                >
                  {idx === 0 && <span className="text-[10px] uppercase font-bold text-indigo-400 mr-0.5">Target:</span>}
                  <span className="font-mono">{cHandle}</span>
                  {comparedChannels.length > 1 && (
                    <button
                      onClick={() => handleRemoveComparedChannel(cHandle)}
                      className="hover:text-red-400 p-0.5 rounded transition-colors"
                      title="Remove channel"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* 1-Click Suggested Competitors */}
            {suggestedCompetitors.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800/60">
                <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-amber-400 uppercase tracking-wider mr-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Suggested Rivals in Niche:</span>
                </div>
                {suggestedCompetitors.map((sc) => {
                  const isAdded = comparedChannels.includes(sc.handle);
                  return (
                    <button
                      key={sc.youtubeChannelId}
                      onClick={() => handleAddSuggested(sc.handle)}
                      disabled={isAdded || comparedChannels.length >= 4}
                      className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs transition-all border ${
                        isAdded
                          ? 'bg-zinc-900/50 border-zinc-800 text-zinc-500 cursor-not-allowed'
                          : 'bg-[#151928] hover:bg-[#1c2238] border-indigo-500/30 text-indigo-300 hover:text-white cursor-pointer'
                      }`}
                    >
                      <img
                        src={sc.thumbnailUrl}
                        alt={sc.title}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                      <span>{sc.title}</span>
                      {!isAdded && <Plus className="w-3 h-3 text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            )}

            {compareError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">
                {compareError}
              </div>
            )}
          </div>

          {/* Loading Indicator */}
          {compareLoading && (
            <div className="p-12 text-center bg-[#12141c] border border-zinc-800 rounded-2xl space-y-3">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-medium text-zinc-300">
                Executing multi-channel telemetry comparison & outlier benchmark...
              </p>
              <p className="text-[11px] text-zinc-500">
                Pulling verified uploads, view velocity, and cadence data from YouTube Data API.
              </p>
            </div>
          )}

          {/* Side-by-Side Comparison Matrix */}
          {!compareLoading && comparisonResult && (
            <div className="space-y-8">
              {/* Channel Cards Grid */}
              <div className={`grid grid-cols-1 md:grid-cols-${Math.min(comparisonResult.channels.length, 4)} gap-4`}>
                {comparisonResult.channels.map((cd, idx) => {
                  const isTarget = idx === 0;
                  const isSubLeader = cd.stats.subscriberCount === maxSubs;
                  const isViewsLeader = cd.stats.viewCount === maxViews;
                  const isAvgViewsLeader = cd.stats.avgViews === maxAvgViews;

                  return (
                    <div
                      key={cd.channel.id}
                      className={`bg-[#12141c] border rounded-2xl p-5 shadow-xl space-y-5 transition-all ${
                        isTarget
                          ? 'border-indigo-500/60 ring-1 ring-indigo-500/30 bg-gradient-to-b from-[#141727] to-[#10121c]'
                          : 'border-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      {/* Channel Header */}
                      <div className="flex items-start space-x-3">
                        <img
                          src={cd.channel.thumbnailUrl}
                          alt={cd.channel.title}
                          className="w-12 h-12 rounded-xl border border-zinc-700 object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-1.5">
                            {isTarget && (
                              <span className="px-1.5 py-0.2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded text-[9px] font-bold uppercase">
                                Target
                              </span>
                            )}
                            <h3 className="text-sm font-bold text-white truncate">{cd.channel.title}</h3>
                          </div>
                          <p className="text-xs text-zinc-400 font-mono truncate">{cd.channel.handle}</p>
                          <div className="pt-1">
                            <ProvenanceBadge provenance={cd.channel.subscriberCount.provenance} />
                          </div>
                        </div>
                      </div>

                      {/* Core Metrics */}
                      <div className="space-y-3 pt-2 border-t border-zinc-800/80">
                        {/* Subscribers */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-400">Subscribers</span>
                            <div className="flex items-center space-x-1 font-mono font-bold text-white">
                              {isSubLeader && <Trophy className="w-3 h-3 text-amber-400" />}
                              <span>{cd.stats.subscriberCount.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isSubLeader ? 'bg-amber-400' : 'bg-indigo-500'}`}
                              style={{ width: `${Math.round((cd.stats.subscriberCount / maxSubs) * 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Lifetime Views */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-400">Total Views</span>
                            <div className="flex items-center space-x-1 font-mono font-bold text-white">
                              {isViewsLeader && <Trophy className="w-3 h-3 text-amber-400" />}
                              <span>{cd.stats.viewCount.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isViewsLeader ? 'bg-amber-400' : 'bg-cyan-500'}`}
                              style={{ width: `${Math.round((cd.stats.viewCount / maxViews) * 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Average Views */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-400">Avg Views / Video</span>
                            <div className="flex items-center space-x-1 font-mono font-bold text-emerald-400">
                              {isAvgViewsLeader && <Trophy className="w-3 h-3 text-amber-400" />}
                              <span>{cd.stats.avgViews.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isAvgViewsLeader ? 'bg-amber-400' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.round((cd.stats.avgViews / maxAvgViews) * 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Cadence & Frequency */}
                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-zinc-400">Upload Cadence</span>
                          <span className="font-mono font-semibold text-zinc-200">
                            ~{cd.stats.uploadCadenceDays}d ({cd.stats.videosPerMonth} vids/mo)
                          </span>
                        </div>

                        {/* Outlier Rate */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-400">Outlier Rate (&gt;1.5×)</span>
                          <span className="font-mono font-bold text-amber-400">
                            {cd.stats.outlierRatePercent}%
                          </span>
                        </div>

                        {/* Video Duration & Shorts Ratio */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-400">Avg Duration / Shorts</span>
                          <span className="font-mono text-zinc-300">
                            {cd.stats.avgDurationFormatted} • {cd.stats.shortsRatioPercent}% Shorts
                          </span>
                        </div>
                      </div>

                      {/* Top Outlier Video */}
                      <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                          Top Outlier Video
                        </span>
                        {cd.topOutlier ? (
                          <div className="p-2.5 bg-[#0b0c12] border border-zinc-800 rounded-xl space-y-2">
                            <div className="flex gap-2.5 items-start">
                              <img
                                src={cd.topOutlier.thumbnailUrl}
                                alt={cd.topOutlier.title}
                                className="w-16 h-10 object-cover rounded-md border border-zinc-700 shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-semibold text-zinc-200 line-clamp-2 leading-snug">
                                  {cd.topOutlier.title}
                                </p>
                                <div className="flex items-center space-x-1.5 mt-1 text-[10px]">
                                  <span className="text-amber-400 font-bold font-mono">
                                    {cd.topOutlier.multiplier}× baseline
                                  </span>
                                  <span className="text-zinc-500">•</span>
                                  <span className="text-zinc-400 font-mono">
                                    {cd.topOutlier.views.toLocaleString()} views
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Link
                              href={`/intelligence/videos?id=${cd.topOutlier.videoId}`}
                              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center space-x-1"
                            >
                              <span>Inspect Video Autopsy</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        ) : (
                          <p className="text-xs text-zinc-500 italic">No significant outlier detected</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Strategic White Space & Content Gap Radar */}
              <div className="bg-[#10121a] border border-zinc-800/90 rounded-2xl p-6 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                  <div className="flex items-center space-x-2">
                    <Compass className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {comparisonResult.strategicGaps.whiteSpaceTitle}
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Synthesized competitive intelligence and uncontested content gaps
                      </p>
                    </div>
                  </div>
                  <ProvenanceBadge provenance="AI_DERIVED" sourceDescription="Derived from multi-channel metric variance" />
                </div>

                <div className="p-4 bg-[#141724] border border-zinc-800 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                    Comparative Overview
                  </span>
                  <p className="text-xs text-zinc-200 leading-relaxed font-medium">
                    {comparisonResult.strategicGaps.whiteSpaceDescription}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {comparisonResult.strategicGaps.tacticalRecommendations.map((rec, rIdx) => (
                    <div key={rIdx} className="p-4 bg-[#0b0c12] border border-zinc-800/80 rounded-xl space-y-2">
                      <div className="flex items-center space-x-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Tactical Advantage #{rIdx + 1}</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                      Recommended Original Angle
                    </span>
                    <p className="text-xs font-semibold text-white">
                      {comparisonResult.strategicGaps.suggestedFormatAngle}
                    </p>
                  </div>
                  <Link
                    href={`/create/ideas?prompt=${encodeURIComponent(comparisonResult.strategicGaps.suggestedFormatAngle)}`}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium shrink-0 flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Ideas From Gap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ChannelAnalyzerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-500">Loading Channel Analyzer...</div>}>
      <ChannelAnalyzerContent />
    </Suspense>
  );
}
