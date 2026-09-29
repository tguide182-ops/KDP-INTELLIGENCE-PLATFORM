'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { FileSpreadsheet, Download, FileText, CheckCircle2 } from 'lucide-react';

export default function ExportsPage() {
  const [marketplace, setMarketplace] = useState('amazon.com');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14]">
      <Header currentMarketplace={marketplace} onMarketplaceChange={setMarketplace} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  Exports Hub
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Export your research datasets to formatted Excel (.xlsx) workbooks, CSV spreadsheets, and JSON.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Excel Workbook (.xlsx)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Formatted sheets with readable column widths, frozen headers, and styled metrics.
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Available directly in the Keyword Explorer and Saved Keywords tables via the &quot;Export XLSX&quot; button.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    CSV & Raw Formats
                  </h3>
                  <p className="text-xs text-slate-400">
                    Universal comma-separated format compatible with Google Sheets, Excel, and custom scripts.
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Supported natively for all keyword sets and research project collections.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
