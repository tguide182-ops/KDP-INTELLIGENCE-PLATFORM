'use client';

import React from 'react';
import {
  HeartPulse,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { ProvenanceBadge } from '@/components/provenance/ProvenanceBadge';

export default function ChannelHealthPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <HeartPulse className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Channel Health &amp; Cadence Monitor</h1>
          </div>
          <p className="text-xs text-zinc-400">
            Audit upload consistency, viewer fatigue signals, and content pillar balance.
          </p>
        </div>
      </div>

      {/* Health Diagnostic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-[#12141c] border border-zinc-800/80 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase">Upload Cadence</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">10.5 Days</p>
          <p className="text-xs text-zinc-400">
            Healthy cadence for high-production video essays. No viewer fatigue detected.
          </p>
        </div>

        <div className="p-5 bg-[#12141c] border border-zinc-800/80 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase">Pillar Diversification</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">3 Active Pillars</p>
          <p className="text-xs text-zinc-400">
            Infrastructure (45%), Deception (30%), Mysteries (25%). Well-balanced portfolio.
          </p>
        </div>

        <div className="p-5 bg-[#12141c] border border-zinc-800/80 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase">Baseline Stability</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 font-mono">92/100</p>
          <p className="text-xs text-zinc-400">
            Average view floor has increased by 14% over the past 90 days.
          </p>
        </div>
      </div>
    </div>
  );
}
