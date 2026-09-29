'use client';

import React, { useState } from 'react';
import { ScoreBreakdown, CompetitionBreakdown } from '@/lib/types';
import { Info, X, Calculator, ArrowRight } from 'lucide-react';

interface ScorePopoverProps {
  type: 'demand' | 'competition' | 'opportunity';
  score: number;
  demandBreakdown?: ScoreBreakdown;
  competitionBreakdown?: CompetitionBreakdown;
  demandScore?: number;
  competitionScore?: number;
}

export const ScorePopover: React.FC<ScorePopoverProps> = ({
  type,
  score,
  demandBreakdown,
  competitionBreakdown,
  demandScore,
  competitionScore,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="inline-flex items-center gap-1 font-mono font-semibold px-2 py-0.5 rounded border border-transparent hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs"
        title="Click to view transparent scoring calculation"
      >
        <span>{score.toFixed(1)}</span>
        <Info className="w-3 h-3 text-slate-400 opacity-60 hover:opacity-100" />
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute z-50 mt-1 w-80 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 font-medium text-xs tracking-wider uppercase text-slate-500 dark:text-slate-400">
              <Calculator className="w-3.5 h-3.5 text-brand-500" />
              <span>
                {type === 'demand'
                  ? 'Demand Score Breakdown'
                  : type === 'competition'
                  ? 'Competition Score Breakdown'
                  : 'Opportunity Score Breakdown'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-baseline justify-between mb-3">
            <span className="text-sm font-semibold">Weighted Final Score</span>
            <span className="text-xl font-mono font-bold text-brand-600 dark:text-brand-400">
              {score.toFixed(1)} <span className="text-xs font-normal text-slate-400">/ 10</span>
            </span>
          </div>

          {/* Demand breakdown */}
          {type === 'demand' && demandBreakdown && (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                <span>Search Volume ({Math.round(demandBreakdown.searchVolumeWeight * 100)}%)</span>
                <span className="font-mono font-medium">{demandBreakdown.searchVolumeScore.toFixed(1)} / 10</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-brand-500 h-full rounded-full"
                  style={{ width: `${demandBreakdown.searchVolumeScore * 10}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 pt-1">
                <span>Suggestion Rank ({Math.round(demandBreakdown.suggestionWeight * 100)}%)</span>
                <span className="font-mono font-medium">{demandBreakdown.suggestionScore.toFixed(1)} / 10</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full"
                  style={{ width: `${demandBreakdown.suggestionScore * 10}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 pt-1">
                <span>Commercial Intent ({Math.round(demandBreakdown.intentWeight * 100)}%)</span>
                <span className="font-mono font-medium">{demandBreakdown.intentScore.toFixed(1)} / 10</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${demandBreakdown.intentScore * 10}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 pt-1">
                <span>Trend Momentum ({Math.round(demandBreakdown.trendWeight * 100)}%)</span>
                <span className="font-mono font-medium">{demandBreakdown.trendScore.toFixed(1)} / 10</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full"
                  style={{ width: `${demandBreakdown.trendScore * 10}%` }}
                />
              </div>
            </div>
          )}

          {/* Competition breakdown */}
          {type === 'competition' && competitionBreakdown && (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                <span>Amazon Result Count ({Math.round(competitionBreakdown.resultsWeight * 100)}%)</span>
                <span className="font-mono font-medium">{competitionBreakdown.resultsScore.toFixed(1)} / 10</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full"
                  style={{ width: `${competitionBreakdown.resultsScore * 10}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 pt-1">
                <span>Median Reviews ({Math.round(competitionBreakdown.reviewsWeight * 100)}%)</span>
                <span className="font-mono font-medium">{competitionBreakdown.reviewsScore.toFixed(1)} / 10</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${competitionBreakdown.reviewsScore * 10}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 pt-1">
                <span>BSR Sales Velocity ({Math.round(competitionBreakdown.bsrWeight * 100)}%)</span>
                <span className="font-mono font-medium">{competitionBreakdown.bsrScore.toFixed(1)} / 10</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: `${competitionBreakdown.bsrScore * 10}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 pt-1">
                <span>Listing Age & Newcomers ({Math.round(competitionBreakdown.ageWeight * 100)}%)</span>
                <span className="font-mono font-medium">{competitionBreakdown.ageScore.toFixed(1)} / 10</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-slate-500 h-full rounded-full"
                  style={{ width: `${competitionBreakdown.ageScore * 10}%` }}
                />
              </div>
            </div>
          )}

          {/* Opportunity breakdown */}
          {type === 'opportunity' && (
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                <span>Demand Signal</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {demandScore ? demandScore.toFixed(1) : '8.4'}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                <span>Observed Competition</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                  {competitionScore ? competitionScore.toFixed(1) : '6.2'}
                </span>
              </div>
              <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                Calculated from Demand minus Competition with commercial intent and trend momentum multipliers.
              </div>
            </div>
          )}

          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 text-center">
            Transparent algorithmic model • Configurable in Settings
          </div>
        </div>
      )}
    </div>
  );
};
