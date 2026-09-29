'use client';

import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  iconOnly?: boolean;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  iconOnly = false,
  className,
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className={cn('relative inline-flex items-center group', className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {iconOnly && (
        <button
          type="button"
          aria-label="Information"
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors ml-1 inline-flex items-center"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      )}

      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 p-2.5 text-xs rounded-lg bg-slate-900 text-slate-100 dark:bg-slate-800 dark:text-slate-200 border border-slate-700 shadow-xl pointer-events-none transition-all animate-in fade-in zoom-in-95 duration-150">
          <p className="leading-relaxed">{content}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800" />
        </div>
      )}
    </div>
  );
};
