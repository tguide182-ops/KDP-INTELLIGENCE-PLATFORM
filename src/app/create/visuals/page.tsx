'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Image as ImageIcon,
  Film,
  Sparkles,
  Camera,
  Layers,
  ArrowRight,
  Music,
  Sliders,
} from 'lucide-react';
import { ProvenanceBadge } from '@/components/provenance/ProvenanceBadge';

interface VisualScene {
  sceneNumber: number;
  timestamp: string;
  durationSec: number;
  narration: string;
  visualDescription: string;
  cameraMovement: string;
  transition: string;
  musicMood: string;
  sfx: string;
  imageUrl: string;
}

const SCENES_DATA: VisualScene[] = [
  {
    sceneNumber: 1,
    timestamp: '0:00 - 0:12',
    durationSec: 12,
    narration: 'In 2008, three critical internet cables snapped simultaneously under the Mediterranean Sea.',
    visualDescription: 'Gloomy underwater wide shot. A massive black coaxial conduit rests silently on oceanic silt. An eerie underwater shockwave sends plumes of dust into the abyss.',
    cameraMovement: 'Slow push-in toward the fiber optic conduit',
    transition: 'Hard Cut',
    musicMood: 'Low sub-bass drone, rising tension',
    sfx: 'Subsea acoustic thump, distant metallic groan',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
  },
  {
    sceneNumber: 2,
    timestamp: '0:12 - 0:28',
    durationSec: 16,
    narration: 'The official report blamed a single ship anchor. The satellite telemetry showed something far stranger.',
    visualDescription: 'High-contrast topographic radar map of the Mediterranean with animated glowing telemetry tracks of maritime vessels.',
    cameraMovement: 'Overhead top-down sweep with digital grid overlay',
    transition: 'Glitch / Scanline Wipe',
    musicMood: 'Pulsing synth arpeggio with high-frequency tick',
    sfx: 'Telemetry chirp, computer digital glitch',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
  },
];

export default function VisualStudioPage() {
  const [scenes, setScenes] = useState<VisualScene[]>(SCENES_DATA);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-5 h-5 text-indigo-400" />
              <h1 className="text-xl font-bold text-white">Visual Studio & Scene Storyboard</h1>
            </div>
            <p className="text-xs text-zinc-400">
              Convert scripts into scene-by-scene production blueprints with camera directions, visual descriptions, and sound cues.
            </p>
          </div>

          <Link
            href="/create/editor"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium inline-flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-600/20 shrink-0"
          >
            <Film className="w-3.5 h-3.5" />
            <span>Open in Video Editor</span>
          </Link>
        </div>
      </div>

      {/* Storyboard Timeline */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Storyboard Scene Timeline ({scenes.length} Scenes)
          </h2>
          <ProvenanceBadge provenance="AI_DERIVED" />
        </div>

        <div className="space-y-4">
          {scenes.map((scene) => (
            <div
              key={scene.sceneNumber}
              className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-lg space-y-4 flex flex-col md:flex-row gap-6"
            >
              {/* Scene Visual Preview */}
              <div className="w-full md:w-80 shrink-0 space-y-2">
                <img
                  src={scene.imageUrl}
                  alt={`Scene ${scene.sceneNumber}`}
                  className="w-full h-44 object-cover rounded-xl border border-zinc-700/80 shadow-md"
                />
                <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
                  <span className="font-mono">{scene.timestamp}</span>
                  <span>{scene.durationSec}s duration</span>
                </div>
              </div>

              {/* Scene Directions */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    Scene {scene.sceneNumber}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">Transition: {scene.transition}</span>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Spoken Narration</p>
                  <p className="text-xs text-zinc-200 italic font-medium leading-relaxed">
                    &ldquo;{scene.narration}&rdquo;
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Visual Description &amp; Camera</p>
                  <p className="text-xs text-zinc-300 leading-relaxed">{scene.visualDescription}</p>
                  <p className="text-[11px] text-indigo-300 flex items-center space-x-1 pt-1">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Camera: {scene.cameraMovement}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800/60 text-xs text-zinc-400">
                  <div className="flex items-center space-x-1.5">
                    <Music className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="truncate">Music: {scene.musicMood}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">SFX: {scene.sfx}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
