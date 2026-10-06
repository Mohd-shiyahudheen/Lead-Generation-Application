import React from 'react';

interface PriorityBadgeProps {
  priority: 'A' | 'B' | 'C' | 'D';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'md',
  showLabel = true,
}) => {
  const configs = {
    A: {
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      dotClass: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
      label: 'Tier A • High Priority',
      shortLabel: 'Tier A',
    },
    B: {
      badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      dotClass: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]',
      label: 'Tier B • Good Candidate',
      shortLabel: 'Tier B',
    },
    C: {
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      dotClass: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
      label: 'Tier C • Needs Review',
      shortLabel: 'Tier C',
    },
    D: {
      badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      dotClass: 'bg-slate-400',
      label: 'Tier D • Low Priority',
      shortLabel: 'Tier D',
    },
  };

  const config = configs[priority] || configs.D;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs font-semibold px-2.5 py-1 gap-2',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2.5',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border tracking-wide font-medium ${config.badgeClass} ${sizeClasses[size]}`}
    >
      <span className={`rounded-full ${config.dotClass} ${dotSizes[size]}`} />
      <span>{showLabel ? (size === 'sm' ? config.shortLabel : config.label) : priority}</span>
    </span>
  );
};
