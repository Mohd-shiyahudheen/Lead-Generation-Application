import React from 'react';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showSubtext?: boolean;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  size = 120,
  strokeWidth = 10,
  showSubtext = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 90) return { stroke: '#10B981', glow: 'rgba(16, 185, 129, 0.4)', text: 'text-emerald-400' };
    if (s >= 75) return { stroke: '#0EA5E9', glow: 'rgba(14, 165, 233, 0.4)', text: 'text-sky-400' };
    if (s >= 60) return { stroke: '#F59E0B', glow: 'rgba(245, 158, 11, 0.4)', text: 'text-amber-400' };
    return { stroke: '#64748B', glow: 'rgba(100, 116, 139, 0.2)', text: 'text-slate-400' };
  };

  const color = getColor(score);

  return (
    <div className="relative inline-flex flex-col items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1E293B"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            transition: 'stroke-dashoffset 1s ease-out',
            filter: `drop-shadow(0 0 6px ${color.glow})`,
          }}
        />
      </svg>
      {/* Centered Score */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={`font-bold tracking-tight ${color.text} ${size > 90 ? 'text-3xl' : 'text-xl'}`}>
          {score}
        </span>
        {showSubtext && size > 90 && (
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
            Fit Score
          </span>
        )}
      </div>
    </div>
  );
};
