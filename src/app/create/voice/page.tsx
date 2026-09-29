'use client';

import React, { useState } from 'react';
import {
  Mic,
  Play,
  Pause,
  Sliders,
  Volume2,
  Sparkles,
  Download,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { ProvenanceBadge } from '@/components/provenance/ProvenanceBadge';

interface VoiceModel {
  id: string;
  name: string;
  accent: string;
  gender: string;
  tone: string;
  bestFor: string;
}

const VOICES: VoiceModel[] = [
  { id: 'v-1', name: 'Marcus Sterling', accent: 'British Neutral', gender: 'Male', tone: 'Investigative, Authoritative', bestFor: 'Documentary & True Crime' },
  { id: 'v-2', name: 'Elena Vance', accent: 'American Professional', gender: 'Female', tone: 'Inquisitive, Crisp', bestFor: 'Science & Tech Autopsies' },
  { id: 'v-3', name: 'David Mercer', accent: 'American Deep', gender: 'Male', tone: 'Cinematic, Dramatic', bestFor: 'Disaster Forensics & High Stakes' },
  { id: 'v-4', name: 'Julian Rhodes', accent: 'Mid-Atlantic', gender: 'Male', tone: 'Fast-paced, Energetic', bestFor: 'Shorts & Fast Video Essays' },
];

export default function VoiceStudioPage() {
  const [selectedVoice, setSelectedVoice] = useState<VoiceModel>(VOICES[0]);
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [stability, setStability] = useState(0.75);
  const [isPlaying, setIsPlaying] = useState(false);
  const [text, setText] = useState(
    'In 2008, three critical internet cables snapped simultaneously under the Mediterranean Sea. The official report blamed a single ship anchor. The satellite telemetry showed something far stranger.'
  );

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Mic className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold text-white">Voice Studio & TTS Director</h1>
          </div>
          <p className="text-xs text-zinc-400">
            Synthesize documentary-grade narration with nuanced pacing, emotional tone, and cinematic pauses.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Voice Library & Sliders */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Voice Profiles ({VOICES.length})
          </h2>

          <div className="space-y-2.5">
            {VOICES.map((v) => (
              <div
                key={v.id}
                onClick={() => setSelectedVoice(v)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedVoice.id === v.id
                    ? 'bg-[#181a26] border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                    : 'bg-[#12141c] border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-white">{v.name}</h3>
                  <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    {v.accent}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">{v.tone}</p>
                <p className="text-[11px] text-zinc-500 mt-1">Best for: {v.bestFor}</p>
              </div>
            ))}
          </div>

          {/* Voice Controls */}
          <div className="p-5 bg-[#12141c] border border-zinc-800/80 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white">Pacing & Dynamics</span>
              <button
                onClick={() => {
                  setSpeed(1.0);
                  setStability(0.75);
                }}
                className="text-[10px] text-zinc-400 hover:text-zinc-200 flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-zinc-300">
                <span>Speaking Rate</span>
                <span className="font-mono text-indigo-400">{speed}×</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.4"
                step="0.05"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-zinc-300">
                <span>Vocal Stability</span>
                <span className="font-mono text-indigo-400">{stability * 100}%</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="1.0"
                step="0.05"
                value={stability}
                onChange={(e) => setStability(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Narration Script & Synthesis */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Narration Text</h3>
                <p className="text-xs text-zinc-400">
                  Active Voice: <strong className="text-indigo-300">{selectedVoice.name}</strong> ({selectedVoice.accent})
                </p>
              </div>
              <ProvenanceBadge provenance="AI_DERIVED" />
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              className="w-full p-4 bg-[#0b0c12] border border-zinc-800 rounded-xl text-xs text-zinc-200 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center space-x-3">
                <button
                  onClick={togglePlayback}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium flex items-center space-x-2 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'Pause Audio' : 'Preview Audio'}</span>
                </button>
                <span className="text-xs text-zinc-500">Est: 14.8 seconds</span>
              </div>

              <button
                onClick={() => alert('Audio file exported to project library')}
                className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-medium border border-zinc-700 flex items-center space-x-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export WAV</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
