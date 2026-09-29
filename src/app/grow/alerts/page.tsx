'use client';

import React from 'react';
import Link from 'next/link';
import {
  Bell,
  Flame,
  Zap,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { ProvenanceBadge } from '@/components/provenance/ProvenanceBadge';

interface AlertItem {
  id: string;
  type: 'COMPETITOR_OUTLIER' | 'TREND_SURGE' | 'CADENCE_REMINDER';
  title: string;
  message: string;
  time: string;
  actionUrl: string;
}

const ALERTS_DATA: AlertItem[] = [
  {
    id: 'alt-1',
    type: 'COMPETITOR_OUTLIER',
    title: 'Competitor Outlier: Practical Engineering',
    message: '"Why Roman Concrete Doesn’t Crack" reached 3.2x baseline in 48 hours.',
    time: '6 hours ago',
    actionUrl: '/intelligence/videos?id=yt_mock_0',
  },
  {
    id: 'alt-2',
    type: 'TREND_SURGE',
    title: 'Rising Topic Signal: Undersea Cable Telemetry',
    message: 'Search volume surged 184% this week with zero high-production documentaries.',
    time: '1 day ago',
    actionUrl: '/create/ideas?topic=Undersea+Cables',
  },
  {
    id: 'alt-3',
    type: 'CADENCE_REMINDER',
    title: 'Optimal Upload Window',
    message: 'Next upload recommended within 3 days to maintain 10.5-day cadence.',
    time: 'Yesterday',
    actionUrl: '/create/builder',
  },
];

export default function AlertsPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold text-white">Alerts &amp; Intelligence Signals</h1>
          </div>
          <p className="text-xs text-zinc-400">
            Real-time notifications for competitor view velocity spikes, emerging trend breakouts, and cadence signals.
          </p>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {ALERTS_DATA.map((alert) => (
          <div
            key={alert.id}
            className="p-5 bg-[#12141c] border border-zinc-800/80 hover:border-zinc-700 rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
          >
            <div className="flex items-start sm:items-center space-x-3.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-white">{alert.title}</h3>
                  <span className="text-[10px] text-zinc-500 font-mono">• {alert.time}</span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">{alert.message}</p>
              </div>
            </div>

            <Link
              href={alert.actionUrl}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium inline-flex items-center space-x-1 shrink-0 self-end sm:self-center"
            >
              <span>Take Action</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
