'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Video,
  Search,
  Eye,
  ThumbsUp,
  MessageSquare,
  Clock,
  Zap,
  Sparkles,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { ProvenanceBadge } from '@/components/provenance/ProvenanceBadge';
import { VideoAutopsyResult } from '@/lib/providers/youtube/types';
import Link from 'next/link';

function VideoAnalyzerContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || 'yt_mock_0';

  const [inputQuery, setInputQuery] = useState(initialId);
  const [autopsy, setAutopsy] = useState<VideoAutopsyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAutopsy = async (videoId: string) => {
    if (!videoId.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/research/video?id=${encodeURIComponent(videoId.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to analyze video');
        setAutopsy(null);
      } else {
        setAutopsy(data.autopsy);
      }
    } catch {
      setError('Error connecting to video research service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchAutopsy(initialId);
    }
  }, [initialId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAutopsy(inputQuery);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Lookup */}
      <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Video className="w-5 h-5 text-indigo-400" />
              <h1 className="text-xl font-bold text-white">Video Autopsy & Pattern Extractor</h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Dissect hook mechanics, retention pacing, and extract replicable storytelling patterns.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Video ID or YouTube URL"
                className="w-full pl-9 pr-3 py-2 bg-[#0b0c12] border border-zinc-700/80 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium shrink-0 transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-indigo-600/20"
            >
              {loading ? 'Analyzing...' : 'Autopsy'}
            </button>
          </form>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">
            {error}
          </div>
        )}
      </div>

      {autopsy && (
        <>
          {/* Main Video Overview Card */}
          <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={autopsy.video.thumbnailUrl}
                alt={autopsy.video.title}
                className="w-full md:w-80 h-48 object-cover rounded-xl border border-zinc-700/80 shadow-md shrink-0"
              />
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                    {autopsy.video.multiplierVsBaseline?.value}× BASELINE OUTLIER
                  </span>
                  <ProvenanceBadge provenance={autopsy.video.views.provenance} />
                </div>

                <h2 className="text-lg font-bold text-white leading-snug">{autopsy.video.title}</h2>
                <p className="text-xs text-zinc-400">{autopsy.video.description}</p>

                {/* Metrics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-2.5 bg-[#0b0c12] rounded-lg border border-zinc-800 text-center">
                    <p className="text-[10px] text-zinc-500 uppercase font-semibold">Views</p>
                    <p className="text-sm font-bold text-white font-mono mt-0.5">
                      {autopsy.video.views.value.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-2.5 bg-[#0b0c12] rounded-lg border border-zinc-800 text-center">
                    <p className="text-[10px] text-zinc-500 uppercase font-semibold">Likes</p>
                    <p className="text-sm font-bold text-white font-mono mt-0.5">
                      {autopsy.video.likes.value.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-2.5 bg-[#0b0c12] rounded-lg border border-zinc-800 text-center">
                    <p className="text-[10px] text-zinc-500 uppercase font-semibold">Comments</p>
                    <p className="text-sm font-bold text-white font-mono mt-0.5">
                      {autopsy.video.comments.value.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-2.5 bg-[#0b0c12] rounded-lg border border-zinc-800 text-center">
                    <p className="text-[10px] text-zinc-500 uppercase font-semibold">Duration</p>
                    <p className="text-sm font-bold text-white font-mono mt-0.5">
                      {autopsy.video.durationFormatted}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* HOOK ANALYSIS */}
          <div className="bg-[#10121a] border border-zinc-800/90 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Hook Mechanics (First 15 Seconds)
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Hook Strength: {autopsy.hookAnalysis.hookStrength}/100
              </span>
            </div>

            <div className="p-4 bg-[#141724] border border-zinc-800 rounded-xl space-y-2">
              <p className="text-xs text-zinc-400 font-semibold uppercase">Spoken Hook Script</p>
              <p className="text-sm font-medium text-zinc-100 italic">
                &ldquo;{autopsy.hookAnalysis.hookText}&rdquo;
              </p>
              <p className="text-xs text-zinc-400 pt-1">
                <strong className="text-zinc-300">Why it works:</strong> {autopsy.hookAnalysis.whyItWorks}
              </p>
            </div>
          </div>

          {/* CONTENT STRUCTURE TIMELINE */}
          <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Narrative Beat Pacing
              </h3>
              <span className="text-xs text-zinc-500">5 Narrative Beats Identified</span>
            </div>

            <div className="space-y-3">
              {autopsy.contentStructure.map((beat, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-[#0b0c12] border border-zinc-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
                        {beat.timestamp}
                      </span>
                      <h4 className="text-xs font-bold text-white">{beat.beatTitle}</h4>
                    </div>
                    <p className="text-xs text-zinc-400">{beat.beatObjective}</p>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-[10px] text-zinc-500 uppercase">Pacing Score</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      {beat.pacingScore}/100
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* REPLICABLE PATTERNS VS WHAT NOT TO COPY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* What is replicable */}
            <div className="bg-[#12141c] border border-emerald-500/20 rounded-2xl p-5 space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">What is Replicable</h4>
              </div>
              <ul className="space-y-2 text-xs text-zinc-300">
                {autopsy.whatIsReplicable.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What should not be copied */}
            <div className="bg-[#12141c] border border-red-500/20 rounded-2xl p-5 space-y-3">
              <div className="flex items-center space-x-2 text-red-400">
                <XCircle className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">What Should NOT Be Copied</h4>
              </div>
              <ul className="space-y-2 text-xs text-zinc-300">
                {autopsy.whatShouldNotBeCopied.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-red-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ORIGINAL CONTENT OPPORTUNITIES */}
          <div className="bg-gradient-to-r from-indigo-950/40 via-[#12141c] to-indigo-950/30 border border-indigo-500/30 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Original Content Opportunities
                </h3>
              </div>
              <ProvenanceBadge provenance="AI_DERIVED" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {autopsy.originalContentOpportunities.map((opp, idx) => (
                <div key={idx} className="p-3.5 bg-[#0b0c12] border border-zinc-800 rounded-xl space-y-2">
                  <p className="text-xs font-medium text-zinc-200">{opp}</p>
                  <Link
                    href={`/create/ideas?topic=${encodeURIComponent(opp)}`}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center space-x-1"
                  >
                    <span>Draft Script</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function VideoAnalyzerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-500">Loading Video Autopsy...</div>}>
      <VideoAnalyzerContent />
    </Suspense>
  );
}
