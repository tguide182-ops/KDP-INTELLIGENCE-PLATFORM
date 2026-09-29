'use client';

import React from 'react';
import {
  LineChart,
  TrendingUp,
  Eye,
  Users,
  Clock,
  ArrowUpRight,
  BarChart2,
  Calendar,
} from 'lucide-react';
import { ProvenanceBadge } from '@/components/provenance/ProvenanceBadge';

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <LineChart className="w-5 h-5 text-indigo-400" />
              <h1 className="text-xl font-bold text-white">Channel Analytics &amp; Velocity Cohorts</h1>
            </div>
            <p className="text-xs text-zinc-400">
              Track multi-month baseline evolution, outlier generation rates, and viewer retention cohorts.
            </p>
          </div>
          <ProvenanceBadge provenance="DEMO_DATA" sourceDescription="Simulated analytics for demonstration" />
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-[#12141c] border border-zinc-800/80 rounded-2xl space-y-2">
          <span className="text-xs text-zinc-400">Monthly View Volume</span>
          <p className="text-2xl font-bold text-white font-mono">3.84M</p>
          <p className="text-xs text-emerald-400 flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% vs prev 30d</span>
          </p>
        </div>

        <div className="p-5 bg-[#12141c] border border-zinc-800/80 rounded-2xl space-y-2">
          <span className="text-xs text-zinc-400">Outlier Rate</span>
          <p className="text-2xl font-bold text-amber-400 font-mono">25.0%</p>
          <p className="text-xs text-zinc-500">2 of last 8 uploads &gt; 2x</p>
        </div>

        <div className="p-5 bg-[#12141c] border border-zinc-800/80 rounded-2xl space-y-2">
          <span className="text-xs text-zinc-400">Average Duration</span>
          <p className="text-2xl font-bold text-white font-mono">21m 40s</p>
          <p className="text-xs text-zinc-500">Long-form documentary</p>
        </div>

        <div className="p-5 bg-[#12141c] border border-zinc-800/80 rounded-2xl space-y-2">
          <span className="text-xs text-zinc-400">First 48h Velocity</span>
          <p className="text-2xl font-bold text-indigo-400 font-mono">1,420/hr</p>
          <p className="text-xs text-emerald-400 flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Top 5% in niche</span>
          </p>
        </div>
      </div>
    </div>
  );
}
