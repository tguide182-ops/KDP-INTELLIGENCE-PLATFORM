import React from 'react';
import { getOpportunityColor } from '@/lib/utils';
import { ConfidenceLevel, DataProvenance } from '@/lib/types';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface OpportunityBadgeProps {
  score: number;
  confidence?: ConfidenceLevel;
  dataSource?: DataProvenance;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const OpportunityBadge: React.FC<OpportunityBadgeProps> = ({
  score,
  confidence,
  dataSource,
  showLabel = true,
  size = 'md',
}) => {
  const color = getOpportunityColor(score);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5',
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <div
        className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${color.bg} ${color.text} ${color.border} ${sizeClasses[size]}`}
      >
        <span className="font-bold font-mono tracking-tight">{score.toFixed(1)}</span>
        {showLabel && <span className="font-normal">{color.label}</span>}
      </div>

      {confidence && (
        <span
          title={`Confidence Level: ${confidence}`}
          className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
            confidence === 'HIGH'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : confidence === 'MEDIUM'
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
              : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
          }`}
        >
          {confidence}
        </span>
      )}

      {dataSource && (
        <span
          title={`Data Provenance: ${dataSource}`}
          className={`text-[9px] font-bold tracking-widest px-1 py-0.5 rounded border uppercase ${
            dataSource === 'REAL'
              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
              : dataSource === 'DEMO'
              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
              : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
          }`}
        >
          {dataSource}
        </span>
      )}
    </div>
  );
};
