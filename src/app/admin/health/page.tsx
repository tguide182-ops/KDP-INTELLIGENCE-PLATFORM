'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Database,
  Cpu,
  RefreshCw,
  Server,
  Zap,
  Globe,
  Clock,
} from 'lucide-react';

export default function AdminHealthPage() {
  const [marketplace, setMarketplace] = useState('amazon.com');
  const [healthData, setHealthData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHealth = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/health');
      const data = await res.json();
      setHealthData(data);
    } catch (err) {
      console.error('Failed to fetch health data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

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
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  Developer & Provider Health
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time status of connected Amazon data providers, scoring algorithms, and database infrastructure.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchHealth}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Run Diagnostics</span>
            </button>
          </div>

          {healthData && (
            <div className="space-y-6">
              {/* Overall status banner */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      All Systems Operational
                    </h3>
                    <p className="text-xs text-slate-400">
                      Uptime: {healthData.uptimeSeconds}s • Environment: {healthData.environment}
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono text-xs text-slate-400">
                  Checked: {new Date(healthData.timestamp).toLocaleTimeString()}
                </div>
              </div>

              {/* Providers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Amazon Completion API */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-brand-500" />
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Amazon Completion API (Live)
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase">
                      {healthData.providers?.amazonSuggestions?.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-500">
                    <div className="flex justify-between">
                      <span>Endpoint:</span>
                      <span className="font-mono">{healthData.providers?.amazonSuggestions?.endpoint}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Latency:</span>
                      <span className="font-mono">{healthData.providers?.amazonSuggestions?.latencyMs} ms</span>
                    </div>
                  </div>
                </div>

                {/* Search Volume Estimation Engine */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Volume Estimation Engine
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase">
                      {healthData.providers?.volumeEstimationEngine?.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-500">
                    <div className="flex justify-between">
                      <span>Mode:</span>
                      <span className="font-mono text-[11px]">{healthData.providers?.volumeEstimationEngine?.mode}</span>
                    </div>
                  </div>
                </div>

                {/* Scoring Engine */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-indigo-500" />
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Scoring & Opportunity Engine
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase">
                      {healthData.providers?.scoringEngine?.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-500">
                    <div className="flex justify-between">
                      <span>Version:</span>
                      <span className="font-mono">{healthData.providers?.scoringEngine?.version}</span>
                    </div>
                  </div>
                </div>

                {/* Database Health */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-emerald-500" />
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Database (Prisma ORM)
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase">
                      {healthData.database?.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-500">
                    <div className="flex justify-between">
                      <span>Dialect:</span>
                      <span className="font-mono">{healthData.database?.dialect}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ping Latency:</span>
                      <span className="font-mono">{healthData.database?.latencyMs} ms</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Heap Memory Used:</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                    {healthData.performance?.memoryUsageMB} MB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Diagnostics Total Latency:</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                    {healthData.performance?.totalCheckLatencyMs} ms
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
