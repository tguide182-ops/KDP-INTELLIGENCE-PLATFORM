'use client';

import React, { useState } from 'react';
import { ProvenanceType, PROVENANCE_BADGES } from '@/lib/provenance';
import { Info } from 'lucide-react';

interface ProvenanceBadgeProps {
  provenance: ProvenanceType;
  sourceDescription?: string;
  className?: string;
  showIcon?: boolean;
}

export function ProvenanceBadge({
  provenance,
  sourceDescription,
  className = '',
  showIcon = true,
}: ProvenanceBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const badge = PROVENANCE_BADGES[provenance] || PROVENANCE_BADGES.DEMO_DATA;

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium tracking-wide uppercase border ${badge.bgClass} ${badge.textClass} ${badge.borderClass} ${className}`}
      >
        {showIcon && <Info className="w-2.5 h-2.5 opacity-80" />}
        {badge.label}
      </span>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 w-56 p-2 bg-[#181a24] border border-zinc-700/80 rounded-lg shadow-xl text-left pointer-events-none">
          <div className="text-[11px] font-semibold text-white mb-0.5">{badge.label}</div>
          <div className="text-[10px] text-zinc-400 leading-relaxed">
            {sourceDescription || badge.tooltip}
          </div>
          <div className="w-2 h-2 bg-[#181a24] border-r border-b border-zinc-700/80 transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
        </div>
      )}
    </div>
  );
}
