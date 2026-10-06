import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full space-y-3 animate-pulse">
      <div className="h-8 bg-slate-800/60 rounded-lg w-1/4" />
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-16 bg-slate-900/60 rounded-xl border border-slate-800/50" />
        ))}
      </div>
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="p-6 rounded-2xl glass-panel space-y-4 animate-pulse">
      <div className="h-5 bg-slate-800/80 rounded w-1/3" />
      <div className="h-10 bg-slate-800/50 rounded w-1/2" />
      <div className="h-4 bg-slate-800/40 rounded w-2/3" />
    </div>
  );
};
