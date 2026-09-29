'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Film,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sliders,
  Play,
  Download,
  Sparkles,
  Layers,
} from 'lucide-react';
import { ProvenanceBadge } from '@/components/provenance/ProvenanceBadge';

interface PipelineStep {
  stepIndex: number;
  title: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'QUEUED';
  description: string;
  actionUrl: string;
}

const PIPELINE_STEPS: PipelineStep[] = [
  { stepIndex: 1, title: 'Idea & Signal Validation', status: 'COMPLETED', description: 'Undersea cable sabotage premise backed by 5.8x outlier pattern.', actionUrl: '/create/ideas' },
  { stepIndex: 2, title: 'Content Blueprint & Hook', status: 'COMPLETED', description: 'Defined 15s cold open and 5 narrative beats.', actionUrl: '/create/scripts' },
  { stepIndex: 3, title: 'Script Drafting', status: 'COMPLETED', description: 'Full 14-minute investigative documentary script finalized.', actionUrl: '/create/scripts' },
  { stepIndex: 4, title: 'Voice & Narration', status: 'COMPLETED', description: 'Marcus Sterling (British Neutral) synthesized at 1.0x speed.', actionUrl: '/create/voice' },
  { stepIndex: 5, title: 'Visual Storyboard & B-Roll', status: 'IN_PROGRESS', description: 'Generating scene 3 and 4 3D schematic assets.', actionUrl: '/create/visuals' },
  { stepIndex: 6, title: 'Music & Sound Design', status: 'QUEUED', description: 'Low sub-bass drone and telemetry sound effects queued.', actionUrl: '/create/visuals' },
  { stepIndex: 7, title: 'Captions & Typography', status: 'QUEUED', description: 'Auto-captions with word-level highlight synchronization.', actionUrl: '/create/editor' },
  { stepIndex: 8, title: 'Timeline Assembly & Cut', status: 'QUEUED', description: '16:9 timeline assembly with transitions.', actionUrl: '/create/editor' },
  { stepIndex: 9, title: 'Packaging & Metadata', status: 'QUEUED', description: 'Optimizing titles in Title Lab and thumbnail contrast.', actionUrl: '/optimize/titles' },
];

export default function VideoBuilderPage() {
  const [steps, setSteps] = useState<PipelineStep[]>(PIPELINE_STEPS);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Film className="w-5 h-5 text-indigo-400" />
              <h1 className="text-xl font-bold text-white">Video Builder Pipeline</h1>
            </div>
            <p className="text-xs text-zinc-400">
              Active Project: <strong className="text-white">The Underwater Cable Severance</strong> (Progress: 5/9 Stages)
            </p>
          </div>

          <Link
            href="/create/editor"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium inline-flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-600/20 shrink-0"
          >
            <span>Open Timeline Editor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Pipeline Steps Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Production Pipeline Stages
          </h2>
          <span className="text-xs text-emerald-400 font-medium">55% Ready for Render</span>
        </div>

        <div className="space-y-3">
          {steps.map((step) => (
            <div
              key={step.stepIndex}
              className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                step.status === 'COMPLETED'
                  ? 'bg-[#12141c] border-zinc-800/80'
                  : step.status === 'IN_PROGRESS'
                  ? 'bg-[#181a26] border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                  : 'bg-[#0e0f16] border-zinc-800/40 opacity-70'
              }`}
            >
              <div className="flex items-start sm:items-center space-x-3.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    step.status === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : step.status === 'IN_PROGRESS'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {step.status === 'COMPLETED' ? <CheckCircle2 className="w-4 h-4" /> : step.stepIndex}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-white">{step.title}</h3>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                        step.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : step.status === 'IN_PROGRESS'
                          ? 'bg-indigo-500/20 text-indigo-300'
                          : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {step.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">{step.description}</p>
                </div>
              </div>

              <Link
                href={step.actionUrl}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium border border-zinc-700 inline-flex items-center space-x-1 shrink-0 self-end sm:self-center"
              >
                <span>Inspect Stage</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
