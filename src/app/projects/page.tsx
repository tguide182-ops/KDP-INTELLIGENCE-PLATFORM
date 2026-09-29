'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import {
  FolderKanban,
  Plus,
  ArrowRight,
  Bookmark,
  Compass,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export default function ProjectsPage() {
  const [marketplace, setMarketplace] = useState('amazon.com');
  const [projects, setProjects] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName.trim(),
          description: newProjectDesc.trim(),
          marketplace,
        }),
      });

      if (res.ok) {
        setNewProjectName('');
        setNewProjectDesc('');
        setIsCreating(false);
        loadProjects();
      }
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14]">
      <Header currentMarketplace={marketplace} onMarketplaceChange={setMarketplace} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <FolderKanban className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  Research Projects
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Organize your keyword research, competitor dossiers, titles, and niche validation campaigns.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCreating(!isCreating)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-500/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>

          {/* New Project Form */}
          {isCreating && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-brand-500/40 shadow-lg space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Create New Research Project
              </h3>
              <form onSubmit={handleCreateProject} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="e.g. 2026 German Cookbook Research, GLP-1 High Protein Series..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Description / Goals
                  </label>
                  <textarea
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                    placeholder="Document your target audience, book concept, or publishing goals..."
                    rows={2}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-500"
                  >
                    Save Project
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Project List */}
          {isLoading ? (
            <div className="py-20 flex justify-center items-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
            </div>
          ) : projects.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40">
              <FolderKanban className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                No research projects yet
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Create a project to group related keywords, competitor books, and title ideas into a structured publishing plan.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="group p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-brand-500/50 hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {proj.name}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {proj.marketplace}
                      </span>
                    </div>
                    {proj.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                        {proj.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-slate-400">
                      <span className="flex items-center gap-1">
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>{proj._count?.savedKeywords || 0} keywords</span>
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400">
                      Updated {new Date(proj.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
