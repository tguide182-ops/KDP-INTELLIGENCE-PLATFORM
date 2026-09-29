'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MARKETPLACES } from '@/lib/marketplaces';
import { ChevronDown, Globe } from 'lucide-react';

interface MarketplaceSelectorProps {
  currentMarketplace: string;
  onChange: (marketplaceId: string) => void;
  size?: 'sm' | 'md';
}

export const MarketplaceSelector: React.FC<MarketplaceSelectorProps> = ({
  currentMarketplace,
  onChange,
  size = 'md',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selected = MARKETPLACES[currentMarketplace] || MARKETPLACES['amazon.com'];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all ${
          size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'
        }`}
      >
        <span className="text-base leading-none">{selected.flag}</span>
        <span className="font-semibold">{selected.domain}</span>
        <span className="text-xs text-slate-400 font-mono">({selected.currency})</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5" />
            <span>Select Amazon Marketplace</span>
          </div>

          <div className="max-h-72 overflow-y-auto py-1">
            {Object.values(MARKETPLACES).map((mp) => {
              const isCurrent = mp.id === currentMarketplace;
              return (
                <button
                  key={mp.id}
                  type="button"
                  onClick={() => {
                    onChange(mp.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${
                    isCurrent
                      ? 'bg-brand-50/80 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{mp.flag}</span>
                    <div className="text-left">
                      <div className="font-medium">{mp.domain}</div>
                      <div className="text-[11px] text-slate-400">{mp.name}</div>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-slate-400 font-normal">
                    {mp.currencySymbol} ({mp.currency})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
