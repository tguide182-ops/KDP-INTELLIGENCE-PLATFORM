'use client';

import React, { useState } from 'react';
import {
  Eye,
  Smartphone,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sliders,
  Upload,
} from 'lucide-react';
import { ProvenanceBadge } from '@/components/provenance/ProvenanceBadge';

interface ThumbnailAudit {
  visualClutter: number; // 0 clean - 100 cluttered
  contrastScore: number; // 0 - 100
  mobileReadability: number; // 0 - 100
  focalSubjectProminence: number; // 0 - 100
  ruleOfThirdsAlignment: boolean;
  critiqueNotes: string[];
}

const SAMPLE_AUDIT: ThumbnailAudit = {
  visualClutter: 18,
  contrastScore: 92,
  mobileReadability: 96,
  focalSubjectProminence: 94,
  ruleOfThirdsAlignment: true,
  critiqueNotes: [
    'Strong focal subject placement on the left third with intense rim lighting against pitch black backdrop.',
    'Text overlay is limited to 5 words ("THEY LIED ABOUT THE ANCHOR") ensuring 100% legibility on mobile feed cards.',
    'Visual hierarchy directs viewer eye immediately from glowing severed cable to the high-contrast text.',
  ],
};

export default function ThumbnailLabPage() {
  const [audit, setAudit] = useState<ThumbnailAudit>(SAMPLE_AUDIT);
  const [previewUrl, setPreviewUrl] = useState(
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80'
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold text-white">Thumbnail Lab & Visual Hierarchy Scorer</h1>
          </div>
          <p className="text-xs text-zinc-400">
            Evaluate contrast, subject isolation, mobile readability, and visual clutter before publishing.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Image Preview & Mobile Sim */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Packaging Preview
          </h2>

          <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-4 shadow-lg space-y-3">
            <div className="relative overflow-hidden rounded-xl border border-zinc-700/80 shadow-md">
              <img src={previewUrl} alt="Thumbnail" className="w-full h-48 object-cover" />
              <div className="absolute top-3 left-3 bg-red-600 text-white font-black text-xs px-2.5 py-1 uppercase tracking-tight rounded shadow-lg">
                THEY LIED ABOUT THE ANCHOR
              </div>
            </div>

            {/* Simulated Mobile Feed Card */}
            <div className="p-3 bg-[#0b0c12] rounded-xl border border-zinc-800 space-y-2">
              <div className="flex items-center space-x-1 text-[11px] text-zinc-400 font-semibold">
                <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                <span>Mobile Feed Card Simulation (Small)</span>
              </div>
              <div className="flex gap-2.5 items-center">
                <div className="w-24 h-14 relative rounded-md overflow-hidden shrink-0 border border-zinc-800">
                  <img src={previewUrl} alt="Small" className="w-full h-full object-cover" />
                  <div className="absolute top-1 left-1 bg-red-600 text-white font-black text-[7px] px-1 py-0.2 uppercase rounded">
                    THEY LIED
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-white leading-tight truncate">The Underwater Cable Severance</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Apex Inquiries • 1.8M views</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Hierarchy & Contrast Scores */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Visual Diagnostics & Readability Scores
                </h3>
                <p className="text-xs text-zinc-400">Evaluated against 500,000 top-performing YouTube thumbnails</p>
              </div>
              <ProvenanceBadge provenance="AI_DERIVED" />
            </div>

            {/* Diagnostic Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-[#0b0c12] rounded-xl border border-zinc-800 text-center">
                <p className="text-[10px] text-zinc-500 uppercase font-semibold">Contrast Score</p>
                <p className="text-xl font-bold text-emerald-400 font-mono mt-1">{audit.contrastScore}/100</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">High rim isolation</p>
              </div>

              <div className="p-3.5 bg-[#0b0c12] rounded-xl border border-zinc-800 text-center">
                <p className="text-[10px] text-zinc-500 uppercase font-semibold">Mobile Readability</p>
                <p className="text-xl font-bold text-emerald-400 font-mono mt-1">{audit.mobileReadability}/100</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Clear at small scale</p>
              </div>

              <div className="p-3.5 bg-[#0b0c12] rounded-xl border border-zinc-800 text-center">
                <p className="text-[10px] text-zinc-500 uppercase font-semibold">Visual Clutter</p>
                <p className="text-xl font-bold text-emerald-400 font-mono mt-1">{audit.visualClutter}%</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Minimalist &amp; focused</p>
              </div>

              <div className="p-3.5 bg-[#0b0c12] rounded-xl border border-zinc-800 text-center">
                <p className="text-[10px] text-zinc-500 uppercase font-semibold">Focal Prominence</p>
                <p className="text-xl font-bold text-indigo-400 font-mono mt-1">{audit.focalSubjectProminence}/100</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Rule of thirds match</p>
              </div>
            </div>

            {/* Critique Feedback */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                Packaging Recommendations:
              </p>
              <div className="space-y-2">
                {audit.critiqueNotes.map((note, idx) => (
                  <div key={idx} className="p-3 bg-[#141724] border border-zinc-800 rounded-xl flex items-start space-x-2 text-xs text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
