'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  Plus,
  ArrowRight,
  Clock,
  Film,
  FileText,
  Sparkles,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { ProvenanceBadge } from '@/components/provenance/ProvenanceBadge';

interface ProjectCard {
  id: string;
  title: string;
  channel: string;
  status: 'IDEA' | 'SCRIPTING' | 'PRODUCTION' | 'OPTIMIZATION' | 'PUBLISHED';
  updatedAt: string;
  scriptVersions: number;
  scenesCount: number;
  assetsCount: number;
}

const SAMPLE_PROJECTS: ProjectCard[] = [
  {
    id: 'proj-1',
    title: 'The Underwater Cable Severance That Almost Cut Off 75 Million People',
    channel: 'Apex Inquiries',
    status: 'SCRIPTING',
    updatedAt: '2 hours ago',
    scriptVersions: 2,
    scenesCount: 5,
    assetsCount: 8,
  },
  {
    id: 'proj-2',
    title: 'The 45-Minute Algorithmic Glitch That Cost Wall Street $440,000,000',
    channel: 'Apex Inquiries',
    status: 'IDEA',
    updatedAt: 'Yesterday',
    scriptVersions: 1,
    scenesCount: 0,
    assetsCount: 2,
  },
  {
    id: 'proj-3',
    title: 'The Catastrophic Failure of the 1999 Megastructure',
    channel: 'Apex Inquiries',
    status: 'PUBLISHED',
    updatedAt: '2 weeks ago',
    scriptVersions: 4,
    scenesCount: 14,
    assetsCount: 32,
  },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectCard[]>(SAMPLE_PROJECTS);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <FolderKanban className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold text-white">Project Workspaces</h1>
          </div>
          <p className="text-xs text-zinc-400">
            Persistent creator workspaces containing research, scripts, storyboard scenes, assets, and packaging.
          </p>
        </div>

        <button
          onClick={() => alert('New workspace dialog')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-600/20 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Project Workspace</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => (
          <div
            key={p.id}
            className="bg-[#12141c] border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-5 shadow-lg space-y-4 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                    p.status === 'PUBLISHED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : p.status === 'SCRIPTING'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                  }`}
                >
                  {p.status}
                </span>
                <span className="text-[11px] text-zinc-500 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{p.updatedAt}</span>
                </span>
              </div>

              <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">{p.title}</h3>
              <p className="text-xs text-zinc-400">{p.channel}</p>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/60 text-center">
                <div className="p-2 bg-[#0b0c12] rounded-lg">
                  <p className="text-[10px] text-zinc-500 uppercase">Drafts</p>
                  <p className="text-xs font-bold text-white font-mono mt-0.5">{p.scriptVersions}</p>
                </div>
                <div className="p-2 bg-[#0b0c12] rounded-lg">
                  <p className="text-[10px] text-zinc-500 uppercase">Scenes</p>
                  <p className="text-xs font-bold text-white font-mono mt-0.5">{p.scenesCount}</p>
                </div>
                <div className="p-2 bg-[#0b0c12] rounded-lg">
                  <p className="text-[10px] text-zinc-500 uppercase">Assets</p>
                  <p className="text-xs font-bold text-white font-mono mt-0.5">{p.assetsCount}</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800/60 flex justify-end">
              <Link
                href={`/create/scripts?title=${encodeURIComponent(p.title)}`}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center space-x-1"
              >
                <span>Open Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
