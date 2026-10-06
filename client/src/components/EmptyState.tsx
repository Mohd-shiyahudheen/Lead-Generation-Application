import React from 'react';
import { LucideIcon, Search } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Search,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-slate-800/80 bg-slate-900/30">
      <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mb-4 text-slate-400 shadow-inner">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mt-1.5">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 px-4 py-2 rounded-xl text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white transition-all shadow-lg shadow-brand-500/20 active:scale-95"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
