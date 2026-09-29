'use client';

import React, { useState } from 'react';
import {
  Tags,
  Copy,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Search,
} from 'lucide-react';
import { ProvenanceBadge } from '@/components/provenance/ProvenanceBadge';

export default function SEOAssistantPage() {
  const [copied, setCopied] = useState(false);
  const [description, setDescription] = useState(
    `In 2008, three critical internet cables snapped simultaneously under the Mediterranean Sea. While official authorities blamed a single cargo vessel anchor, naval telemetry and seismic records revealed a far more alarming truth.

00:00 - The Mediterranean Blackout Anomaly
00:45 - The Anchor Hypothesis & MV Ann
04:10 - How Deep-Sea Cable Ships Fish at 2,000m
11:30 - The Satellite Telemetry That Contradicted the Story
17:00 - Why 99% of Global Internet Relies on 400 Fragile Lines

#Documentary #Technology #Infrastructure #DeepSea`
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Tags className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold text-white">SEO Assistant & Description Architect</h1>
          </div>
          <p className="text-xs text-zinc-400">
            Generate search-indexed descriptions, automated timestamps, and high-intent tag clusters.
          </p>
        </div>
      </div>

      <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Structured Description &amp; Timestamps
          </h2>
          <button
            onClick={() => {
              navigator.clipboard.writeText(description);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium border border-zinc-700 flex items-center space-x-1.5 cursor-pointer"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Description'}</span>
          </button>
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={10}
          className="w-full p-4 bg-[#0b0c12] border border-zinc-800 rounded-xl text-xs text-zinc-200 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {/* Tag Cloud */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            Recommended YouTube Tags:
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              'undersea internet cables',
              'deep sea cable repair',
              'mediterranean internet blackout',
              'fiber optic cable break',
              'submarine communication',
              'infrastructure disasters',
              'apex inquiries',
            ].map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 bg-[#0b0c12] border border-zinc-800 text-zinc-300 rounded-lg text-xs font-mono"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
