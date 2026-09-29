'use client';

import React, { useState } from 'react';
import {
  Heading,
  Sparkles,
  Smartphone,
  Eye,
  CheckCircle2,
  Copy,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { ProvenanceBadge } from '@/components/provenance/ProvenanceBadge';

interface TitleConcept {
  id: string;
  title: string;
  mode: string;
  clarity: number;
  curiosity: number;
  stakes: number;
  mobileFit: boolean;
  characterCount: number;
}

const SAMPLE_TITLES: TitleConcept[] = [
  {
    id: 't-1',
    title: 'The Underwater Cable That Almost Cut Off 75 Million People',
    mode: 'DOCUMENTARY',
    clarity: 92,
    curiosity: 95,
    stakes: 98,
    mobileFit: true,
    characterCount: 58,
  },
  {
    id: 't-2',
    title: 'Why Nobody Can Explain What Happened Under the Mediterranean in 2008',
    mode: 'MYSTERY',
    clarity: 88,
    curiosity: 96,
    stakes: 85,
    mobileFit: false,
    characterCount: 69,
  },
  {
    id: 't-3',
    title: 'How One Broken Wire Snapped 80% of Asia’s Internet',
    mode: 'CURIOSITY',
    clarity: 94,
    curiosity: 91,
    stakes: 94,
    mobileFit: true,
    characterCount: 50,
  },
  {
    id: 't-4',
    title: 'The 2008 Deep Sea Cable Mystery',
    mode: 'SEARCH',
    clarity: 99,
    curiosity: 62,
    stakes: 50,
    mobileFit: true,
    characterCount: 32,
  },
];

export default function TitleLabPage() {
  const [topic, setTopic] = useState('Underwater internet cable severance');
  const [activeMode, setActiveMode] = useState('DOCUMENTARY');
  const [titles, setTitles] = useState<TitleConcept[]>(SAMPLE_TITLES);
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (title: string, id: string) => {
    navigator.clipboard.writeText(title);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
    }, 600);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Heading className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold text-white">Title Lab & Psychological Scorer</h1>
          </div>
          <p className="text-xs text-zinc-400">
            Generate and evaluate title concepts across 11 psychological modes with mobile cutoff analysis.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Topic or Premise
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0b0c12] border border-zinc-700/80 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Psychological Mode
            </label>
            <select
              value={activeMode}
              onChange={(e) => setActiveMode(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#0b0c12] border border-zinc-700/80 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="CURIOSITY">Curiosity Gap</option>
              <option value="DOCUMENTARY">Documentary / High Stakes</option>
              <option value="MYSTERY">Mystery / Cold Case</option>
              <option value="SEARCH">Search / Informational</option>
              <option value="STORYTELLING">Storytelling / Narrative</option>
              <option value="COMMENTARY">Contrarian Commentary</option>
              <option value="SHORTS">Shorts / Punchy</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={generating}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium shrink-0 flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-indigo-600/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{generating ? 'Analyzing...' : 'Generate Variations'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Generated Variations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Title Variations ({titles.length})
          </h2>
          <ProvenanceBadge provenance="AI_DERIVED" sourceDescription="Scores evaluated via title psychology framework. (Not official YouTube metrics)" />
        </div>

        <div className="space-y-3">
          {titles.map((t) => (
            <div
              key={t.id}
              className="bg-[#12141c] border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-5 shadow-lg space-y-3 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300 uppercase">
                      {t.mode}
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      {t.characterCount} chars
                    </span>
                    {t.mobileFit ? (
                      <span className="text-[10px] text-emerald-400 flex items-center space-x-1">
                        <Smartphone className="w-3 h-3" />
                        <span>Fits Mobile</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400 flex items-center space-x-1">
                        <Smartphone className="w-3 h-3" />
                        <span>Truncates on Mobile</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white">{t.title}</h3>
                </div>

                <button
                  onClick={() => copyToClipboard(t.title, t.id)}
                  className="px-3 py-1.5 bg-[#0b0c12] hover:bg-zinc-800 text-zinc-300 rounded-lg text-xs font-medium border border-zinc-700/80 flex items-center space-x-1.5 shrink-0 transition-all cursor-pointer"
                >
                  {copiedId === t.id ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Title</span>
                    </>
                  )}
                </button>
              </div>

              {/* Psychological Scores */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/60 text-center">
                <div className="p-2 bg-[#0b0c12] rounded-lg">
                  <p className="text-[10px] text-zinc-500 uppercase">Clarity</p>
                  <p className="text-xs font-bold text-white font-mono mt-0.5">{t.clarity}/100</p>
                </div>
                <div className="p-2 bg-[#0b0c12] rounded-lg">
                  <p className="text-[10px] text-zinc-500 uppercase">Curiosity Gap</p>
                  <p className="text-xs font-bold text-indigo-400 font-mono mt-0.5">{t.curiosity}/100</p>
                </div>
                <div className="p-2 bg-[#0b0c12] rounded-lg">
                  <p className="text-[10px] text-zinc-500 uppercase">Stakes</p>
                  <p className="text-xs font-bold text-amber-400 font-mono mt-0.5">{t.stakes}/100</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
