'use client';

import React from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Sparkles,
  ArrowRight,
  BarChart3,
} from 'lucide-react';
import { ProvenanceBadge } from '@/components/provenance/ProvenanceBadge';

export default function ReportsPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
              <h1 className="text-xl font-bold text-white">Executive Reports &amp; Exports</h1>
            </div>
            <p className="text-xs text-zinc-400">
              Download comprehensive channel audits, competitor surveillance summaries, and outlier manifests.
            </p>
          </div>

          <button
            onClick={() => alert('Exporting monthly performance audit')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-600/20 shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Generate New Audit PDF</span>
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {[
          { title: 'Monthly Channel Baseline & Outlier Report (September 2026)', date: 'Generated today', type: 'PDF Audit', size: '2.4 MB' },
          { title: 'Competitor Surveillance & Content Gap Manifest', date: '3 days ago', type: 'CSV Export', size: '420 KB' },
          { title: 'Channel DNA & Packaging Guidelines Document', date: '1 week ago', type: 'Markdown / PDF', size: '1.1 MB' },
        ].map((rep, idx) => (
          <div
            key={idx}
            className="p-5 bg-[#12141c] border border-zinc-800/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">{rep.title}</h3>
              <p className="text-xs text-zinc-500">
                {rep.type} • {rep.size} • {rep.date}
              </p>
            </div>

            <button
              onClick={() => alert(`Downloading ${rep.title}`)}
              className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium border border-zinc-700 flex items-center space-x-1.5 shrink-0 self-end sm:self-center"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
