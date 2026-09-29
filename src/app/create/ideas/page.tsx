'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Lightbulb,
  ArrowRight,
  Bookmark,
  Film,
  Calendar,
  Layers,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { ProvenanceBadge } from '@/components/provenance/ProvenanceBadge';

interface GeneratedIdea {
  id: string;
  titleConcept: string;
  topic: string;
  format: 'DOCUMENTARY' | 'SHORTS' | 'EXPLAINER' | 'LISTICLE';
  hook: string;
  whyNow: string;
  whyItMatters: string;
  competitiveContext: string;
  outlierReference: string;
  contentGap: string;
  structureOverview: string[];
  thumbnailConcept: {
    visualDescription: string;
    textOverlay: string;
  };
  isSaved?: boolean;
}

const INITIAL_IDEAS: GeneratedIdea[] = [
  {
    id: 'idea-1',
    titleConcept: 'The Underwater Cable Severance That Almost Cut Off 75 Million People',
    topic: 'Critical Global Infrastructure & Forensic History',
    format: 'DOCUMENTARY',
    hook: 'In 2008, three critical internet cables snapped simultaneously under the Mediterranean Sea. The official report blamed a single ship anchor. The satellite telemetry showed something far stranger.',
    whyNow: 'Rising public tension regarding undersea communication security and sudden unexplained cable cuts in modern geopolitics.',
    whyItMatters: 'Audiences love forensic mysteries where high-stakes technology intersects with geopolitical paranoia.',
    competitiveContext: 'Most existing videos are dry 5-minute technical summaries. No creator has produced an investigative, thriller-paced autopsy.',
    outlierReference: 'Apex Inquiries 1999 Megastructure Collapse (5.8× baseline multiplier).',
    contentGap: 'Detailed structural timeline of how the repair ships raced against a total economic freeze.',
    structureOverview: [
      'Cold Open: The moment Egyptian and Indian traffic dropped 80% (0:00 - 0:45)',
      'The Anchor Hypothesis: Why the maritime authorities doubted the official story (0:45 - 4:00)',
      'The Deep Sea Repair Race: Cable-laying ships operating under storm conditions (4:00 - 11:30)',
      'The Telemetry Anomaly: Satellite data that contradicted the timeline (11:30 - 17:00)',
      'The Lingering Vulnerability: Why 99% of humanity relies on 400 vulnerable lines (17:00 - 21:00)',
    ],
    thumbnailConcept: {
      visualDescription: 'Submerged glowing fiber optic cable snapping in dark oceanic abyss with sonar grid lines.',
      textOverlay: 'THEY LIED ABOUT THE ANCHOR',
    },
  },
  {
    id: 'idea-2',
    titleConcept: 'The 45-Minute Algorithmic Glitch That Cost Wall Street $440,000,000',
    topic: 'High-Frequency Trading & Catastrophic Software Failures',
    format: 'DOCUMENTARY',
    hook: 'At 9:30 AM, Knight Capital activated new trading software. By 10:15 AM, the company had bought 397 million unwanted shares and lost ten million dollars every sixty seconds.',
    whyNow: 'Growing audience fascination with algorithmic black boxes and automated financial vulnerability.',
    whyItMatters: 'Relatable human panic combined with exact dollar numbers creates extreme viewer tension.',
    competitiveContext: 'Documentaries on this exist, but they focus on dry code reviews rather than the frantic trading floor panic.',
    outlierReference: 'ColdFusion Financial Disasters (3.4× baseline multiplier).',
    contentGap: 'The exact internal bug: eight lines of dead code that were accidentally reactivated.',
    structureOverview: [
      'The Ticking Clock: The first 15 minutes where nobody knew what was happening (0:00 - 2:30)',
      'The Flawed Deployment: How one engineer missed server #8 (2:30 - 7:00)',
      'The Algorithmic Cascade: Ten million dollars lost every minute (7:00 - 13:00)',
      'The Unplugging Dilemma: Why turning off the machines was illegal (13:00 - 18:00)',
      'Aftermath: The bankruptcy that happened before lunch (18:00 - 22:00)',
    ],
    thumbnailConcept: {
      visualDescription: 'Trading terminal screen flashing red with -$440,000,000 counter and blurred frantic traders.',
      textOverlay: '45 MINUTES TO ZERO',
    },
  },
];

function IdeaStudioContent() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get('topic') || '';

  const [topic, setTopic] = useState(initialTopic);
  const [format, setFormat] = useState('DOCUMENTARY');
  const [ideas, setIdeas] = useState<GeneratedIdea[]>(INITIAL_IDEAS);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
    }, 800);
  };

  const toggleSave = (id: string) => {
    setIdeas((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isSaved: !i.isSaved } : i))
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Studio Header */}
      <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold text-white">AI Idea Studio</h1>
          </div>
          <p className="text-xs text-zinc-400">
            Generate signal-backed original video ideas grounded in outlier mechanics and audience content gaps.
          </p>
        </div>

        {/* Idea Generator Form */}
        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Topic / Niche / Premise
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Undersea infrastructure mysteries, algorithmic trading..."
              className="w-full px-3.5 py-2.5 bg-[#0b0c12] border border-zinc-700/80 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Format Archetype
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#0b0c12] border border-zinc-700/80 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="DOCUMENTARY">Documentary / Video Essay</option>
              <option value="SHORTS">Shorts / Vertical (9:16)</option>
              <option value="EXPLAINER">Technical Explainer</option>
              <option value="LISTICLE">Curated List / Deep Dive</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={generating}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium shrink-0 flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-indigo-600/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{generating ? 'Generating Ideas...' : 'Generate Concepts'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Generated Ideas Feed */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Generated Original Concepts ({ideas.length})
          </h2>
          <ProvenanceBadge provenance="AI_DERIVED" sourceDescription="Synthesized from outlier mechanics and search gap signals" />
        </div>

        <div className="space-y-6">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-6 hover:border-zinc-700 transition-all"
            >
              {/* Concept Title & Badges */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {idea.format}
                    </span>
                    <span className="text-xs text-zinc-500">• {idea.topic}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                    {idea.titleConcept}
                  </h3>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => toggleSave(idea.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 border transition-all ${
                      idea.isSaved
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-zinc-800/60 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{idea.isSaved ? 'Saved' : 'Save Idea'}</span>
                  </button>
                  <Link
                    href={`/create/scripts?title=${encodeURIComponent(idea.titleConcept)}`}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-600/20"
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Build Video</span>
                  </Link>
                </div>
              </div>

              {/* Hook & Why Now */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#0b0c12] border border-zinc-800 rounded-xl space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    The 8-Second Hook
                  </p>
                  <p className="text-xs text-zinc-200 italic leading-relaxed">
                    &ldquo;{idea.hook}&rdquo;
                  </p>
                </div>

                <div className="p-4 bg-[#0b0c12] border border-zinc-800 rounded-xl space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Why Now & Audience Resonance
                  </p>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {idea.whyNow}
                  </p>
                </div>
              </div>

              {/* Competitive Context & Structure */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-[#141724] border border-zinc-800 rounded-xl space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    Competitive Gap
                  </p>
                  <p className="text-xs text-zinc-300 leading-relaxed">{idea.contentGap}</p>
                  <p className="text-[11px] text-zinc-500 pt-1">
                    <strong className="text-zinc-400">Outlier Ref:</strong> {idea.outlierReference}
                  </p>
                </div>

                <div className="lg:col-span-2 p-4 bg-[#141724] border border-zinc-800 rounded-xl space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                    Narrative Beat Structure
                  </p>
                  <div className="space-y-1.5">
                    {idea.structureOverview.map((beat, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs text-zinc-300">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>{beat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Thumbnail Concept Box */}
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Thumbnail Concept Prompt
                  </p>
                  <p className="text-xs text-zinc-300">{idea.thumbnailConcept.visualDescription}</p>
                </div>
                <div className="px-2.5 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs font-mono font-bold text-amber-300 shrink-0">
                  Text: &ldquo;{idea.thumbnailConcept.textOverlay}&rdquo;
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function IdeaStudioPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-500">Loading Idea Studio...</div>}>
      <IdeaStudioContent />
    </Suspense>
  );
}
