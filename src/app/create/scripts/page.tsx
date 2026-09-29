'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FileText,
  Sparkles,
  Activity,
  Layers,
  Save,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Film,
  Zap,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { ProvenanceBadge } from '@/components/provenance/ProvenanceBadge';

function ScriptStudioContent() {
  const searchParams = useSearchParams();
  const initialTitle = searchParams.get('title') || 'The Underwater Cable Severance That Almost Cut Off 75 Million People';

  const [title, setTitle] = useState(initialTitle);
  const [format, setFormat] = useState('DOCUMENTARY');
  const [activeTab, setActiveTab] = useState<'blueprint' | 'script' | 'retention'>('blueprint');

  // Blueprint state
  const [blueprint, setBlueprint] = useState({
    targetAudience: 'Inquisitive adults 24-45 interested in technology, geopolitical infrastructure, and investigative journalism.',
    corePromise: 'Reveal the suppressed maritime telemetry proving why a single anchor could not have snapped three distinct deep-sea cables.',
    hook: 'In 2008, three critical internet cables snapped simultaneously under the Mediterranean Sea. The official report blamed a single ship anchor. The satellite telemetry showed something far stranger.',
    majorBeats: [
      'The Blackout Anomaly: The sudden loss of 80% bandwidth between Europe and South Asia.',
      'The Anchor Hypothesis: Why port authorities originally suspected the MV Ann.',
      'The Deep Sea Cable Ships: How specialized crews fish for fiber cables at 2,000 meters depth.',
      'The Telemetry Subversion: Why the anchor tracks never intersected cable line #2.',
      'The Geopolitical Vulnerability: Modern threats to humanity’s undersea nervous system.',
    ],
    openLoops: [
      'Who ordered the MV Ann to anchor in an exclusion zone?',
      'Why did the second cable snap 60 miles away from the first?',
    ],
    payoff: 'The revelation that seismic shifting combined with uninspected trench shear was the true culprit, leaving modern cables equally exposed today.',
    callToAction: 'Ask viewers to comment if they work in telecom or subsea engineering.',
  });

  // Script text
  const [scriptContent, setScriptContent] = useState(`[0:00 - 0:45] SCENE 1: THE BLACKOUT ANOMALY
(VISUAL: Gloomy underwater wide shot. A massive black coaxial conduit rests silently in oceanic silt. Suddenly, a violent underwater shockwave sends plumes of sediment into the dark.)

NARRATOR (V.O.)
In 2008, three critical internet cables snapped simultaneously under the Mediterranean Sea.

The official report blamed a single ship anchor.

The satellite telemetry... showed something far stranger.

[0:45 - 3:30] SCENE 2: THE ANCHOR HYPOTHESIS
(VISUAL: Port radar map schematic showing ship transit lines over underwater topography.)

NARRATOR (V.O.)
At 7:12 AM GMT, seventy-five million people in Egypt, India, and the Gulf suddenly went dark. Banking systems halted. Financial markets shuddered.

Within twenty-four hours, maritime authorities pointed their finger at a 150-meter cargo vessel called the MV Ann. The narrative was simple, clean, and satisfying: a careless captain dragged his anchor across the seabed.

Except for one detail that naval engineers noticed three weeks later.`);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <h1 className="text-xl font-bold text-white">Script Studio & Retention Architect</h1>
            </div>
            <p className="text-xs text-zinc-400">
              Transform conceptual blueprints into production-ready scripts optimized for audience retention.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => alert('Script saved to Project Library')}
              className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all border border-zinc-700"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>
            <button
              onClick={() => alert('Visual scene storyboard generated')}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-600/20"
            >
              <Film className="w-3.5 h-3.5" />
              <span>Send to Visual Studio</span>
            </button>
          </div>
        </div>

        {/* Studio Mode Tabs */}
        <div className="flex border-b border-zinc-800 pt-2 gap-4">
          <button
            onClick={() => setActiveTab('blueprint')}
            className={`pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'blueprint'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            1. Content Blueprint
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'script'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            2. Script Editor
          </button>
          <button
            onClick={() => setActiveTab('retention')}
            className={`pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'retention'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            3. Retention Architect
          </button>
        </div>
      </div>

      {/* TAB 1: CONTENT BLUEPRINT */}
      {activeTab === 'blueprint' && (
        <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Pre-Writing Content Blueprint
              </h3>
              <p className="text-xs text-zinc-400">
                Define the narrative architecture before drafting dialogue or scene narration.
              </p>
            </div>
            <ProvenanceBadge provenance="AI_DERIVED" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#0b0c12] border border-zinc-800 rounded-xl space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Target Audience
              </label>
              <textarea
                value={blueprint.targetAudience}
                onChange={(e) => setBlueprint({ ...blueprint, targetAudience: e.target.value })}
                rows={2}
                className="w-full bg-transparent text-xs text-zinc-200 border-0 focus:outline-none resize-none"
              />
            </div>

            <div className="p-4 bg-[#0b0c12] border border-zinc-800 rounded-xl space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Core Promise to Viewer
              </label>
              <textarea
                value={blueprint.corePromise}
                onChange={(e) => setBlueprint({ ...blueprint, corePromise: e.target.value })}
                rows={2}
                className="w-full bg-transparent text-xs text-zinc-200 border-0 focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="p-4 bg-[#0b0c12] border border-zinc-800 rounded-xl space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              The 15-Second Opening Hook & Problem Statement
            </label>
            <textarea
              value={blueprint.hook}
              onChange={(e) => setBlueprint({ ...blueprint, hook: e.target.value })}
              rows={2}
              className="w-full bg-transparent text-xs text-zinc-200 border-0 focus:outline-none resize-none font-medium"
            />
          </div>

          <div className="p-4 bg-[#0b0c12] border border-zinc-800 rounded-xl space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              Major Narrative Beats
            </label>
            <div className="space-y-2">
              {blueprint.majorBeats.map((beat, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-xs text-zinc-300">
                  <span className="w-5 h-5 rounded bg-zinc-800 text-zinc-400 flex items-center justify-center text-[10px] font-mono shrink-0">
                    {idx + 1}
                  </span>
                  <span>{beat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setActiveTab('script')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-600/20"
            >
              <span>Proceed to Script Editor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: SCRIPT EDITOR */}
      {activeTab === 'script' && (
        <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Full Production Script
              </h3>
              <p className="text-xs text-zinc-400">Word Count: 142 words • Est. Duration: 1m 02s</p>
            </div>

            {/* AI Refinement Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => alert('AI Hook Strengthened')}
                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs border border-zinc-700"
              >
                Strengthen Hook
              </button>
              <button
                onClick={() => alert('Pacing Tightened')}
                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs border border-zinc-700"
              >
                Tighten Pacing
              </button>
              <button
                onClick={() => alert('Visual Directions Expanded')}
                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs border border-zinc-700"
              >
                + Visual Directions
              </button>
            </div>
          </div>

          <textarea
            value={scriptContent}
            onChange={(e) => setScriptContent(e.target.value)}
            rows={14}
            className="w-full p-4 bg-[#0b0c12] border border-zinc-800 rounded-xl text-xs text-zinc-200 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}

      {/* TAB 3: RETENTION ARCHITECT */}
      {activeTab === 'retention' && (
        <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Retention Flow & Curiosity Loop Analysis
              </h3>
              <p className="text-xs text-zinc-400">
                Structural guidance based on successful pacing conventions. (Not a guaranteed retention claim)
              </p>
            </div>
            <ProvenanceBadge provenance="AI_DERIVED" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-[#0b0c12] rounded-xl border border-zinc-800 text-center">
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">Hook Curiosity Score</p>
              <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">94/100</p>
              <p className="text-[11px] text-zinc-400 mt-1">Stakes established in under 6 seconds</p>
            </div>

            <div className="p-4 bg-[#0b0c12] rounded-xl border border-zinc-800 text-center">
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">Open Loops Active</p>
              <p className="text-2xl font-bold text-indigo-400 font-mono mt-1">2 Loops</p>
              <p className="text-[11px] text-zinc-400 mt-1">Healthy curiosity balance</p>
            </div>

            <div className="p-4 bg-[#0b0c12] rounded-xl border border-zinc-800 text-center">
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">Pacing Interruption Gap</p>
              <p className="text-2xl font-bold text-amber-400 font-mono mt-1">3.4 min</p>
              <p className="text-[11px] text-zinc-400 mt-1">Re-engagement reset point</p>
            </div>
          </div>

          <div className="p-4 bg-[#141724] border border-zinc-800 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-zinc-200">Architect Recommendation</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              The opening transition between Scene 1 and Scene 2 is rapid and effective. Ensure Scene 2 introduces the radar diagram by minute 1:15 to prevent visual stagnation before the anchor explanation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ScriptStudioPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-500">Loading Script Studio...</div>}>
      <ScriptStudioContent />
    </Suspense>
  );
}
