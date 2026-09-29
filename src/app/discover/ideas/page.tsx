'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Lightbulb,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  Zap,
  Flame,
  Bookmark,
  Plus,
} from 'lucide-react';
import { ProvenanceBadge } from '@/components/provenance/ProvenanceBadge';

interface DiscoveredIdea {
  id: string;
  title: string;
  hook: string;
  niche: string;
  signalSource: string;
  estimatedMultiplierPotential: string;
}

const DISCOVERY_IDEAS: DiscoveredIdea[] = [
  {
    id: 'disc-1',
    title: 'The Underwater Cable Severance That Almost Cut Off 75 Million People',
    hook: 'In 2008, three critical internet cables snapped simultaneously under the Mediterranean Sea. The satellite telemetry showed something far stranger than an anchor.',
    niche: 'Engineering Disasters',
    signalSource: 'Trend Radar (+184% surge) + Outlier Multiplier 5.8x',
    estimatedMultiplierPotential: '3.5x - 6.0x',
  },
  {
    id: 'disc-2',
    title: 'The 45-Minute Algorithmic Glitch That Cost Wall Street $440,000,000',
    hook: 'At 9:30 AM, Knight Capital activated new trading software. By 10:15 AM, they had lost ten million dollars every sixty seconds.',
    niche: 'Tech & Finance',
    signalSource: 'Trend Radar (+310% surge) + Content Gap',
    estimatedMultiplierPotential: '4.0x - 7.5x',
  },
  {
    id: 'disc-3',
    title: 'The Secret Tunnel Network Beneath New York That Transit Workers Are Forbidden to Enter',
    hook: 'Forty feet below Grand Central Terminal lies a subterranean transformer bunker that was guarded by armed soldiers during World War II.',
    niche: 'Urban Mysteries',
    signalSource: 'Outlier Baseline Multiplier 4.2x',
    estimatedMultiplierPotential: '2.5x - 4.8x',
  },
];

export default function IdeaFinderPage() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <h1 className="text-xl font-bold text-white">Idea Finder Matrix</h1>
            </div>
            <p className="text-xs text-zinc-400">
              Discover high-probability video concepts synthesized from real-time trend signals and outlier patterns.
            </p>
          </div>

          <Link
            href="/create/ideas"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium inline-flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-600/20 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open AI Idea Studio</span>
          </Link>
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Signal-Backed Opportunity Matrix
          </h2>
          <ProvenanceBadge provenance="AI_DERIVED" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DISCOVERY_IDEAS.map((item) => (
            <div
              key={item.id}
              className="bg-[#12141c] border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-5 shadow-lg space-y-4 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase">{item.niche}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Est: {item.estimatedMultiplierPotential}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">{item.title}</h3>

                <div className="p-3 bg-[#0b0c12] rounded-xl border border-zinc-800/80 space-y-1">
                  <p className="text-[10px] text-zinc-500 uppercase font-semibold">Hook Preview</p>
                  <p className="text-xs text-zinc-300 italic leading-relaxed">&ldquo;{item.hook}&rdquo;</p>
                </div>

                <p className="text-[11px] text-zinc-500">
                  <strong className="text-zinc-400">Signals:</strong> {item.signalSource}
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-800/60 flex justify-end">
                <Link
                  href={`/create/scripts?title=${encodeURIComponent(item.title)}`}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium inline-flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-600/20"
                >
                  <span>Develop into Video</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
