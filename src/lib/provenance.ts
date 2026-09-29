/**
 * VYRAL Data Provenance System
 *
 * Enforces transparency on the origin, confidence, and computation
 * of every metric, signal, and recommendation.
 */

export type ProvenanceType =
  | 'YOUTUBE_API'
  | 'USER_CONNECTED'
  | 'OBSERVED'
  | 'HISTORICAL'
  | 'ESTIMATED'
  | 'AI_DERIVED'
  | 'INTERNAL_METRIC'
  | 'DEMO_DATA';

export interface MetricWithProvenance<T = number | string | Record<string, any>> {
  value: T;
  provenance: ProvenanceType;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'APPROXIMATE';
  sourceDescription: string;
  observedAt: string; // ISO 8601
  notes?: string;
}

export const PROVENANCE_BADGES: Record<
  ProvenanceType,
  { label: string; bgClass: string; textClass: string; borderClass: string; tooltip: string }
> = {
  YOUTUBE_API: {
    label: 'YouTube API',
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-400',
    borderClass: 'border-red-500/20',
    tooltip: 'Directly retrieved from YouTube Data API v3.',
  },
  USER_CONNECTED: {
    label: 'Connected Analytics',
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/20',
    tooltip: 'Verified data from creator OAuth YouTube Analytics integration.',
  },
  OBSERVED: {
    label: 'Observed',
    bgClass: 'bg-blue-500/10',
    textClass: 'text-blue-400',
    borderClass: 'border-blue-500/20',
    tooltip: 'Directly observed from public video or channel page.',
  },
  HISTORICAL: {
    label: 'Historical',
    bgClass: 'bg-purple-500/10',
    textClass: 'text-purple-400',
    borderClass: 'border-purple-500/20',
    tooltip: 'Aggregated internally by VYRAL over multiple observation periods.',
  },
  ESTIMATED: {
    label: 'Estimated',
    bgClass: 'bg-amber-500/10',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-500/20',
    tooltip: 'Statistical approximation or heuristic. Not an official YouTube metric.',
  },
  AI_DERIVED: {
    label: 'AI Derived',
    bgClass: 'bg-indigo-500/10',
    textClass: 'text-indigo-400',
    borderClass: 'border-indigo-500/20',
    tooltip: 'Synthesized via LLM or Computer Vision inference from content signals.',
  },
  INTERNAL_METRIC: {
    label: 'Internal Metric',
    bgClass: 'bg-cyan-500/10',
    textClass: 'text-cyan-400',
    borderClass: 'border-cyan-500/20',
    tooltip: 'Proprietary VYRAL metric calculated from observed baseline comparisons.',
  },
  DEMO_DATA: {
    label: 'Demo Data',
    bgClass: 'bg-zinc-500/20',
    textClass: 'text-zinc-400',
    borderClass: 'border-zinc-500/30',
    tooltip: 'Simulated preview data for local development and testing.',
  },
};

export function wrapMetric<T>(
  value: T,
  provenance: ProvenanceType,
  sourceDescription: string,
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'APPROXIMATE' = 'HIGH',
  notes?: string
): MetricWithProvenance<T> {
  return {
    value,
    provenance,
    confidence,
    sourceDescription,
    observedAt: new Date().toISOString(),
    notes,
  };
}
