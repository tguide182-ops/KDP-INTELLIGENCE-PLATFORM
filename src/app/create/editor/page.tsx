'use client';

import React, { useState } from 'react';
import {
  Sliders,
  Play,
  Pause,
  RotateCcw,
  Maximize,
  Volume2,
  Layers,
  Film,
  Music,
  Type,
  Sparkles,
  Download,
} from 'lucide-react';
import { ProvenanceBadge } from '@/components/provenance/ProvenanceBadge';

export default function VideoEditorPage() {
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(14.2);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold text-white">Multi-Track Timeline Editor</h1>
          </div>
          <p className="text-xs text-zinc-400">
            Browser-based non-linear editor for long-form essays and 9:16 vertical Shorts.
          </p>
        </div>

        {/* Aspect Ratio Selector */}
        <div className="flex items-center gap-2">
          {(['16:9', '9:16', '1:1'] as const).map((ratio) => (
            <button
              key={ratio}
              onClick={() => setAspectRatio(ratio)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                aspectRatio === ratio
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {ratio}
            </button>
          ))}
          <button
            onClick={() => alert('Render job queued in ResearchJob table')}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 shadow-md shadow-emerald-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export MP4</span>
          </button>
        </div>
      </div>

      {/* Editor Canvas & Timeline */}
      <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-6">
        {/* Preview Canvas */}
        <div className="flex justify-center bg-[#07080c] rounded-xl border border-zinc-800 p-4">
          <div
            className={`relative bg-black rounded-lg overflow-hidden border border-zinc-700/80 shadow-2xl flex items-center justify-center transition-all ${
              aspectRatio === '16:9'
                ? 'w-full max-w-2xl aspect-video'
                : aspectRatio === '9:16'
                ? 'w-64 aspect-[9/16]'
                : 'w-80 aspect-square'
            }`}
          >
            <img
              src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80"
              alt="Video Canvas"
              className="w-full h-full object-cover opacity-80"
            />

            {/* Captions Overlay */}
            <div className="absolute bottom-8 px-4 text-center">
              <span className="bg-black/70 text-amber-300 font-bold text-xs sm:text-sm px-3 py-1 rounded border border-amber-500/30 tracking-wide">
                &ldquo;three critical internet cables snapped simultaneously&rdquo;
              </span>
            </div>

            {/* Play Button Overlay */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-indigo-600/80 hover:bg-indigo-600 text-white flex items-center justify-center shadow-xl backdrop-blur-sm transition-all"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
          </div>
        </div>

        {/* Timeline Tracks */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-zinc-800">
            <span className="font-mono">Timeline: 00:14.2 / 01:02.0</span>
            <span className="text-[11px] text-zinc-500">4 Active Tracks (Video, Overlay, Narration, Music)</span>
          </div>

          {/* Track 1: Video */}
          <div className="flex items-center gap-3">
            <span className="w-20 text-[10px] font-bold text-indigo-400 uppercase tracking-wider shrink-0 flex items-center space-x-1">
              <Film className="w-3 h-3" />
              <span>Video</span>
            </span>
            <div className="flex-1 h-9 bg-zinc-900/90 rounded-lg border border-zinc-800 flex overflow-hidden p-1 gap-1">
              <div className="w-1/3 bg-indigo-900/40 border border-indigo-500/40 rounded flex items-center px-2 text-[10px] text-indigo-200 truncate">
                Scene 1: Conduit Deep (0:00 - 0:12)
              </div>
              <div className="w-2/3 bg-indigo-900/40 border border-indigo-500/40 rounded flex items-center px-2 text-[10px] text-indigo-200 truncate">
                Scene 2: Mediterranean Telemetry (0:12 - 0:28)
              </div>
            </div>
          </div>

          {/* Track 2: Captions */}
          <div className="flex items-center gap-3">
            <span className="w-20 text-[10px] font-bold text-amber-400 uppercase tracking-wider shrink-0 flex items-center space-x-1">
              <Type className="w-3 h-3" />
              <span>Captions</span>
            </span>
            <div className="flex-1 h-8 bg-zinc-900/90 rounded-lg border border-zinc-800 flex overflow-hidden p-1 gap-1">
              <div className="w-full bg-amber-900/30 border border-amber-500/40 rounded flex items-center px-2 text-[10px] text-amber-200 truncate">
                Synced Word-by-Word Animation
              </div>
            </div>
          </div>

          {/* Track 3: Voiceover */}
          <div className="flex items-center gap-3">
            <span className="w-20 text-[10px] font-bold text-emerald-400 uppercase tracking-wider shrink-0 flex items-center space-x-1">
              <Volume2 className="w-3 h-3" />
              <span>Voiceover</span>
            </span>
            <div className="flex-1 h-8 bg-zinc-900/90 rounded-lg border border-zinc-800 flex overflow-hidden p-1 gap-1">
              <div className="w-full bg-emerald-900/30 border border-emerald-500/40 rounded flex items-center px-2 text-[10px] text-emerald-200 truncate font-mono">
                Marcus_Sterling_Narration.wav (44.1kHz)
              </div>
            </div>
          </div>

          {/* Track 4: Music & SFX */}
          <div className="flex items-center gap-3">
            <span className="w-20 text-[10px] font-bold text-purple-400 uppercase tracking-wider shrink-0 flex items-center space-x-1">
              <Music className="w-3 h-3" />
              <span>Music / SFX</span>
            </span>
            <div className="flex-1 h-8 bg-zinc-900/90 rounded-lg border border-zinc-800 flex overflow-hidden p-1 gap-1">
              <div className="w-full bg-purple-900/30 border border-purple-500/40 rounded flex items-center px-2 text-[10px] text-purple-200 truncate font-mono">
                Sub_Bass_Tension_Bed.mp3 (-14dB)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
