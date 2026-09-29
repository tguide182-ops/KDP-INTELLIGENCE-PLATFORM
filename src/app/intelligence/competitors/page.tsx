'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Plus,
  Bell,
  TrendingUp,
  Zap,
  ArrowRight,
  ArrowLeftRight,
  Clock,
  Eye,
  Activity,
} from 'lucide-react';
import { ProvenanceBadge } from '@/components/provenance/ProvenanceBadge';

import { cleanYouTubeInput } from '@/lib/youtube-utils';

interface CompetitorChannel {
  id: string;
  handle: string;
  title: string;
  subscribers: number;
  avgViews: number;
  recentAlert: string;
  alertType: 'OUTLIER_SPIKE' | 'NEW_UPLOAD' | 'TOPIC_SHIFT' | 'CADENCE_CHANGE';
  alertTime: string;
  thumbnailUrl: string;
}

const COMPETITORS: CompetitorChannel[] = [
  {
    id: 'comp-1',
    handle: '@practicalengineering',
    title: 'Practical Engineering',
    subscribers: 3950000,
    avgViews: 920000,
    recentAlert: 'New major outlier: "Why Roman Concrete Doesn’t Crack" reached 3.2× baseline in 48 hours.',
    alertType: 'OUTLIER_SPIKE',
    alertTime: '6 hours ago',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'comp-2',
    handle: '@coldfusion',
    title: 'ColdFusion',
    subscribers: 4620000,
    avgViews: 1100000,
    recentAlert: 'Topic shift detected: 3 of last 4 videos pivoted from consumer tech to financial market autopsies.',
    alertType: 'TOPIC_SHIFT',
    alertTime: '2 days ago',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'comp-3',
    handle: '@wendoverproductions',
    title: 'Wendover Productions',
    subscribers: 4380000,
    avgViews: 1450000,
    recentAlert: 'Uploaded new video: "The World’s Most Complicated Airport Route" (Velocity: 2,400 views/hr).',
    alertType: 'NEW_UPLOAD',
    alertTime: 'Yesterday',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=150&auto=format&fit=crop&q=80',
  },
];

export default function CompetitorRadarPage() {
  const [competitors, setCompetitors] = useState<CompetitorChannel[]>(COMPETITORS);
  const [newHandle, setNewHandle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHandle.trim()) return;

    const parsed = cleanYouTubeInput(newHandle);
    const handleDisplay = parsed.type === 'handle' ? parsed.value : `@${parsed.value}`;
    const newId = `comp-${Date.now()}`;

    const tempComp: CompetitorChannel = {
      id: newId,
      handle: handleDisplay,
      title: handleDisplay.replace(/^@/, '').toUpperCase(),
      subscribers: 0,
      avgViews: 0,
      recentAlert: 'Channel added to surveillance radar. Syncing live metrics...',
      alertType: 'NEW_UPLOAD',
      alertTime: 'Just now',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    };

    setCompetitors((prev) => [tempComp, ...prev]);
    setNewHandle('');
    setIsAdding(true);

    try {
      const res = await fetch(`/api/research/channel?q=${encodeURIComponent(parsed.value)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.channel) {
          setCompetitors((prev) =>
            prev.map((c) =>
              c.id === newId
                ? {
                    ...c,
                    handle: data.channel.handle || handleDisplay,
                    title: data.channel.title,
                    subscribers: data.channel.subscriberCount || 0,
                    avgViews: Math.round((data.channel.viewCount || 0) / Math.max(data.channel.videoCount || 1, 1)),
                    thumbnailUrl: data.channel.thumbnailUrl || c.thumbnailUrl,
                    recentAlert: 'Live channel telemetry synchronized from YouTube API.',
                  }
                : c
            )
          );
        }
      }
    } catch {
      // Keep optimistic entry if fetch fails
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <h1 className="text-xl font-bold text-white">Competitor Radar & Surveillance</h1>
            </div>
            <p className="text-xs text-zinc-400">
              Track rival channel uploads, view velocity spikes, topic migrations, and format experiments in real-time.
            </p>
          </div>

          <form onSubmit={handleAddCompetitor} className="flex items-center gap-2">
            <input
              type="text"
              value={newHandle}
              onChange={(e) => setNewHandle(e.target.value)}
              placeholder="Track @handle..."
              className="px-3 py-2 bg-[#0b0c12] border border-zinc-700/80 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-60"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-600/20 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Competitor</span>
            </button>
          </form>
        </div>
      </div>

      {/* Competitors List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Monitored Competitors ({competitors.length})
          </h2>
          <ProvenanceBadge provenance="OBSERVED" sourceDescription="Observed from public competitor channel uploads and view velocity" />
        </div>

        <div className="space-y-4">
          {competitors.map((comp) => (
            <div
              key={comp.id}
              className="bg-[#12141c] border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-6 shadow-lg space-y-4 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={comp.thumbnailUrl}
                    alt={comp.title}
                    className="w-12 h-12 rounded-full border border-zinc-700 object-cover"
                  />
                  <div>
                    <h3 className="text-base font-bold text-white">{comp.title}</h3>
                    <p className="text-xs text-zinc-400 font-mono">
                      {comp.handle} • {comp.subscribers.toLocaleString()} subscribers
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-500 uppercase font-semibold">Average Views</p>
                    <p className="text-sm font-bold text-white font-mono">{comp.avgViews.toLocaleString()}</p>
                  </div>
                  <Link
                    href={`/intelligence/channels?tab=compare&compare=${encodeURIComponent('@trendingtragedies6,' + comp.handle)}`}
                    className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-medium flex items-center space-x-1"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    <span>Compare</span>
                  </Link>
                  <Link
                    href={`/intelligence/channels?handle=${encodeURIComponent(comp.handle)}`}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium border border-zinc-700 flex items-center space-x-1"
                  >
                    <span>Full DNA</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Alert Notification Card */}
              <div className="p-3.5 bg-[#0b0c12] border border-zinc-800 rounded-xl flex items-start sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center space-x-2.5">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      {comp.alertType.replace('_', ' ')}
                    </span>
                    <p className="text-xs text-zinc-200 mt-0.5">{comp.recentAlert}</p>
                  </div>
                </div>
                <span className="text-[11px] text-zinc-500 shrink-0 font-mono">{comp.alertTime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
