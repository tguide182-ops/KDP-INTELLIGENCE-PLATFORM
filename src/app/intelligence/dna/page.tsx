'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Dna,
  Search,
  Sparkles,
  ArrowRight,
  Layers,
  Heading,
  Eye,
  Zap,
  Activity,
  Film,
  BookOpen,
} from 'lucide-react';
import { ProvenanceBadge } from '@/components/provenance/ProvenanceBadge';

export default function ChannelDNAPage() {
  const [channelHandle, setChannelHandle] = useState('@apexinquiries');

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Dna className="w-5 h-5 text-indigo-400" />
              <h1 className="text-xl font-bold text-white">Channel DNA Studio</h1>
            </div>
            <p className="text-xs text-zinc-400">
              Extract structural mechanics, hook architecture, and visual formulas from any channel to inspire original content.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={channelHandle}
              onChange={(e) => setChannelHandle(e.target.value)}
              placeholder="@channel handle..."
              className="px-3 py-2 bg-[#0b0c12] border border-zinc-700/80 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium shrink-0 transition-all shadow-md shadow-indigo-600/20">
              Extract DNA
            </button>
          </div>
        </div>
      </div>

      {/* DNA Cards Matrix */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Extracted DNA Blueprint: Apex Inquiries
            </h2>
            <p className="text-xs text-zinc-400">Synthesized from top 20 videos &amp; historical outliers</p>
          </div>
          <ProvenanceBadge provenance="AI_DERIVED" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Positioning */}
          <div className="p-5 bg-[#12141c] border border-zinc-800/80 rounded-2xl space-y-2">
            <div className="flex items-center space-x-2 text-indigo-400">
              <BookOpen className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Positioning DNA</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed font-medium">
              High-production forensic investigations into engineering catastrophes, Cold War anomalies, and systemic failures.
            </p>
          </div>

          {/* Title DNA */}
          <div className="p-5 bg-[#12141c] border border-zinc-800/80 rounded-2xl space-y-2">
            <div className="flex items-center space-x-2 text-amber-400">
              <Heading className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Title Formula DNA</h3>
            </div>
            <p className="text-xs text-zinc-200 font-mono">
              &ldquo;The [Adjective] [Subject] That [Unexpected Consequence]&rdquo;
            </p>
            <p className="text-[11px] text-zinc-400">High-performing triggers: Catastrophe, Failure, Secret, Nobody Can Explain</p>
          </div>

          {/* Thumbnail DNA */}
          <div className="p-5 bg-[#12141c] border border-zinc-800/80 rounded-2xl space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400">
              <Eye className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Thumbnail DNA</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Single monolithic object center-left with extreme rim lighting. Zero human faces; zero text clutter; stark dark background.
            </p>
          </div>

          {/* Hook DNA */}
          <div className="p-5 bg-[#12141c] border border-zinc-800/80 rounded-2xl space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400">
              <Zap className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Hook DNA</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              In medias res cold-open in under 8 seconds. States an exact timestamp and impossible measurement before any intro graphics.
            </p>
          </div>

          {/* Visual DNA */}
          <div className="p-5 bg-[#12141c] border border-zinc-800/80 rounded-2xl space-y-2">
            <div className="flex items-center space-x-2 text-purple-400">
              <Film className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Visual Pacing DNA</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Cut frequency every 3.8s. High density of custom 2D animated schematics blended with archival footage.
            </p>
          </div>

          {/* Storytelling DNA */}
          <div className="p-5 bg-[#12141c] border border-zinc-800/80 rounded-2xl space-y-2">
            <div className="flex items-center space-x-2 text-rose-400">
              <Activity className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Storytelling Arc DNA</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Three-act thriller structure: The Anomaly (0:00) -&gt; The Concealment (5:00) -&gt; The Domino Collapse (14:00) -&gt; Modern Danger (20:00).
            </p>
          </div>
        </div>

        {/* Action Card */}
        <div className="p-6 bg-gradient-to-r from-indigo-950/40 via-[#12141c] to-indigo-950/30 border border-indigo-500/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">Create Original Content from this DNA</h3>
            <p className="text-xs text-zinc-400">
              Apply these structural mechanics to generate original video concepts without copying any creator&apos;s intellectual property.
            </p>
          </div>
          <Link
            href="/create/ideas?dna=ApexInquiries"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-600/20 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Concepts in Idea Studio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
