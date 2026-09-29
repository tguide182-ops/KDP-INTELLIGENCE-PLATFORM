'use client';

import React, { useState } from 'react';
import {
  FlaskConical,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { ProvenanceBadge } from '@/components/provenance/ProvenanceBadge';

interface ExperimentItem {
  id: string;
  testType: 'TITLE' | 'THUMBNAIL' | 'HOOK';
  videoTitle: string;
  variantA: string;
  variantB: string;
  status: 'ACTIVE' | 'COMPLETED' | 'INCONCLUSIVE';
  outcomeNotes: string;
}

const SAMPLE_EXPERIMENTS: ExperimentItem[] = [
  {
    id: 'exp-1',
    testType: 'TITLE',
    videoTitle: 'The Underwater Cable Severance',
    variantA: 'The Underwater Cable That Almost Cut Off 75 Million People',
    variantB: 'Why Nobody Can Rebuild Roman Concrete',
    status: 'ACTIVE',
    outcomeNotes: 'Variant A is showing a 22% higher initial click-through velocity in first 24 hours.',
  },
  {
    id: 'exp-2',
    testType: 'THUMBNAIL',
    videoTitle: '1999 Megastructure Catastrophe',
    variantA: 'Monolithic Tower Silhouette with Red Glow',
    variantB: 'Blueprint Diagram with "FAILED" Stamp',
    status: 'COMPLETED',
    outcomeNotes: 'Variant A generated 5.8x channel baseline multiplier vs 1.8x on Variant B. High contrast object isolation clearly won.',
  },
];

export default function ExperimentsPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <FlaskConical className="w-5 h-5 text-indigo-400" />
              <h1 className="text-xl font-bold text-white">Channel Experiments Manager</h1>
            </div>
            <p className="text-xs text-zinc-400">
              Track packaging tests (titles, thumbnails, hooks) and record empirical performance outcomes.
            </p>
          </div>

          <button
            onClick={() => alert('New experiment modal')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-600/20 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log New Experiment</span>
          </button>
        </div>
      </div>

      {/* Experiments List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Recorded Experiments ({SAMPLE_EXPERIMENTS.length})
          </h2>
          <ProvenanceBadge provenance="HISTORICAL" sourceDescription="Creator recorded experimental outcome data" />
        </div>

        <div className="space-y-4">
          {SAMPLE_EXPERIMENTS.map((exp) => (
            <div
              key={exp.id}
              className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-lg space-y-4"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-zinc-800 text-indigo-300">
                    {exp.testType} TEST
                  </span>
                  <h3 className="text-sm font-bold text-white">{exp.videoTitle}</h3>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                    exp.status === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {exp.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-[#0b0c12] rounded-xl border border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Variant A</span>
                  <p className="text-xs text-zinc-200">{exp.variantA}</p>
                </div>
                <div className="p-3 bg-[#0b0c12] rounded-xl border border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Variant B</span>
                  <p className="text-xs text-zinc-200">{exp.variantB}</p>
                </div>
              </div>

              <div className="p-3.5 bg-[#141724] rounded-xl border border-zinc-800 space-y-1">
                <p className="text-[10px] font-bold text-zinc-400 uppercase">Outcome &amp; Learning:</p>
                <p className="text-xs text-zinc-300 leading-relaxed">{exp.outcomeNotes}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
