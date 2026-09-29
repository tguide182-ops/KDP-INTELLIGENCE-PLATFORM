'use client';

import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  Eye,
  Sliders,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ProvenanceBadge } from '@/components/provenance/ProvenanceBadge';

interface ThumbnailConceptItem {
  id: string;
  conceptTitle: string;
  composition: string;
  focalSubject: string;
  textOverlay: string;
  prompt: string;
  previewUrl: string;
}

const THUMBNAIL_CONCEPTS: ThumbnailConceptItem[] = [
  {
    id: 'th-1',
    conceptTitle: 'The Broken Conduit (Minimalist / Curiosity)',
    composition: 'Rule of thirds: Glowing severed cable on left, stark pitch-black ocean on right.',
    focalSubject: 'Luminous blue fiber optic strands fraying in dark water',
    textOverlay: 'THEY LIED ABOUT THE ANCHOR',
    prompt: 'Cinematic hyperrealistic 3D render of a thick black undersea telecommunication conduit severed in half, glowing blue and amber fiber optic wires exposed in pitch black ocean depth, sonar ripples, cinematic lighting, 8k resolution --ar 16:9',
    previewUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'th-2',
    conceptTitle: 'The Blackout Map (High Stakes / Intrigue)',
    composition: 'Overhead Mediterranean topographic map with sudden blacked-out territories.',
    focalSubject: 'Egypt, Saudi Arabia, and India highlighted in red disconnect zones',
    textOverlay: '80% WENT DARK',
    prompt: 'Top-down forensic map of the Mediterranean and Middle East with neon glowing undersea transit lines, glowing points of failure with warning exclamation indicators, dark moody cinematic graphic design --ar 16:9',
    previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  },
];

export default function ThumbnailStudioPage() {
  const [concepts, setConcepts] = useState<ThumbnailConceptItem[]>(THUMBNAIL_CONCEPTS);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold text-white">Thumbnail Studio & Prompt Lab</h1>
          </div>
          <p className="text-xs text-zinc-400">
            Design high-CTR thumbnail compositions grounded in visual contrast, rule of thirds, and mobile readability.
          </p>
        </div>
      </div>

      {/* Concepts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {concepts.map((concept) => (
          <div
            key={concept.id}
            className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="relative group overflow-hidden rounded-xl border border-zinc-700/80 shadow-lg">
                <img
                  src={concept.previewUrl}
                  alt={concept.conceptTitle}
                  className="w-full h-56 object-cover"
                />
                {/* Simulated Thumbnail Text Overlay */}
                <div className="absolute top-4 left-4 bg-red-600 text-white font-black text-xs sm:text-sm px-2.5 py-1 uppercase tracking-tight shadow-2xl rounded">
                  {concept.textOverlay}
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">{concept.conceptTitle}</h3>
                <p className="text-xs text-zinc-400">
                  <strong className="text-zinc-300">Composition:</strong> {concept.composition}
                </p>
              </div>

              <div className="p-3 bg-[#0b0c12] rounded-xl border border-zinc-800 space-y-1">
                <p className="text-[10px] font-bold text-zinc-400 uppercase">Generation Prompt:</p>
                <p className="text-xs text-zinc-300 font-mono leading-relaxed">{concept.prompt}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(concept.prompt);
                  alert('Prompt copied to clipboard!');
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
              >
                Copy Prompt
              </button>
              <button
                onClick={() => alert('Sending concept to Thumbnail Lab for contrast scoring')}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium"
              >
                Analyze Contrast
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
