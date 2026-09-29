'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  Zap,
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { ProvenanceBadge } from '@/components/provenance/ProvenanceBadge';

interface RetentionBeat {
  timestamp: string;
  type: 'HOOK' | 'CURIOSITY_GAP' | 'ESCALATION' | 'PATTERN_INTERRUPT' | 'PAYOFF';
  description: string;
  attentionFlowEstimate: number; // 0 - 100
}

const SAMPLE_BEATS: RetentionBeat[] = [
  { timestamp: '0:00 - 0:15', type: 'HOOK', description: 'Immediate impossible telemetry anomaly stated in under 6 seconds.', attentionFlowEstimate: 96 },
  { timestamp: '0:15 - 3:45', type: 'CURIOSITY_GAP', description: 'Establishes why the official anchor story failed physical inspection.', attentionFlowEstimate: 88 },
  { timestamp: '3:45 - 4:00', type: 'PATTERN_INTERRUPT', description: 'Audio drops to total silence; satellite telemetry graphic pulses on screen.', attentionFlowEstimate: 94 },
  { timestamp: '4:00 - 12:30', type: 'ESCALATION', description: 'The deep-sea repair race against time as financial systems began to freeze.', attentionFlowEstimate: 86 },
  { timestamp: '12:30 - 14:00', type: 'PAYOFF', description: 'Resolution of the true seismic shear culprit and modern vulnerability warning.', attentionFlowEstimate: 82 },
];

export default function RetentionArchitectPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold text-white">Retention Architect & Narrative Pacing</h1>
          </div>
          <p className="text-xs text-zinc-400">
            Identify curiosity gaps, open loops, and pattern interruptions across video timelines.
          </p>
        </div>
      </div>

      {/* Beats Analysis */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Narrative Beat Flow (5 Pacing Milestones)
          </h2>
          <ProvenanceBadge provenance="AI_DERIVED" sourceDescription="Structural retention heuristic based on top-performing narrative arcs" />
        </div>

        <div className="space-y-3">
          {SAMPLE_BEATS.map((beat, idx) => (
            <div
              key={idx}
              className="p-4 bg-[#12141c] border border-zinc-800/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start sm:items-center space-x-3.5">
                <span className="px-2 py-1 bg-[#0b0c12] border border-zinc-800 rounded font-mono text-xs text-indigo-300 font-bold shrink-0">
                  {beat.timestamp}
                </span>

                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        beat.type === 'HOOK'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : beat.type === 'PATTERN_INTERRUPT'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {beat.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 mt-1">{beat.description}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                <span className="text-[10px] text-zinc-500 uppercase">Attention Flow</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  {beat.attentionFlowEstimate}/100
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
