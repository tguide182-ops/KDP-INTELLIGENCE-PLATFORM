'use client';

import React, { useState } from 'react';
import {
  Layers,
  Upload,
  Image as ImageIcon,
  Music,
  Film,
  Download,
  Search,
} from 'lucide-react';
import { ProvenanceBadge } from '@/components/provenance/ProvenanceBadge';

interface AssetFile {
  id: string;
  name: string;
  type: 'IMAGE' | 'AUDIO' | 'VIDEO';
  project: string;
  size: string;
  previewUrl: string;
}

const ASSET_FILES: AssetFile[] = [
  { id: 'as-1', name: 'Undersea_Conduit_3D_Render.png', type: 'IMAGE', project: 'Undersea Cable Severance', size: '4.8 MB', previewUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80' },
  { id: 'as-2', name: 'Mediterranean_Telemetry_Radar.png', type: 'IMAGE', project: 'Undersea Cable Severance', size: '2.1 MB', previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80' },
  { id: 'as-3', name: 'Marcus_Sterling_Narration_Final.wav', type: 'AUDIO', project: 'Undersea Cable Severance', size: '38.4 MB', previewUrl: '' },
  { id: 'as-4', name: 'Sub_Bass_Tension_Drone.mp3', type: 'AUDIO', project: 'Undersea Cable Severance', size: '12.2 MB', previewUrl: '' },
];

export default function AssetsLibraryPage() {
  const [filterType, setFilterType] = useState('ALL');

  const filteredAssets = ASSET_FILES.filter((a) => {
    if (filterType !== 'ALL' && a.type !== filterType) return false;
    return true;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h1 className="text-xl font-bold text-white">Media &amp; Asset Vault</h1>
            </div>
            <p className="text-xs text-zinc-400">
              Central asset repository for project voiceovers, 3D schematics, B-roll clips, and music beds.
            </p>
          </div>

          <button
            onClick={() => alert('Upload asset dialog')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-600/20 shrink-0 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload New Asset</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 pt-2 border-t border-zinc-800">
          {['ALL', 'IMAGE', 'AUDIO', 'VIDEO'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterType === t
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="bg-[#12141c] border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-4 shadow-lg space-y-3 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              {asset.previewUrl ? (
                <img
                  src={asset.previewUrl}
                  alt={asset.name}
                  className="w-full h-32 object-cover rounded-xl border border-zinc-800"
                />
              ) : (
                <div className="w-full h-32 bg-[#0b0c12] rounded-xl border border-zinc-800 flex items-center justify-center text-zinc-600">
                  <Music className="w-8 h-8 text-indigo-400 opacity-60" />
                </div>
              )}

              <div>
                <span className="text-[10px] font-bold font-mono text-indigo-400 uppercase">
                  {asset.type}
                </span>
                <h3 className="text-xs font-bold text-white truncate mt-0.5">{asset.name}</h3>
                <p className="text-[11px] text-zinc-500 truncate">{asset.project}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500">
              <span>{asset.size}</span>
              <button
                onClick={() => alert(`Downloading ${asset.name}`)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
