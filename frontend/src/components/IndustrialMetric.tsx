import React from 'react';

export interface IndustrialMetricProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  variant?: 'accent' | 'warning' | 'error' | 'nominal';
  technicalCode?: string;
  progressPercent?: number; // 0 to 100
  segments?: number; // Segmented LED gauge count
  className?: string;
}

export const IndustrialMetric: React.FC<IndustrialMetricProps> = ({
  label,
  value,
  unit,
  trend,
  trendValue,
  variant = 'accent',
  technicalCode,
  progressPercent,
  segments = 16,
  className = '',
}) => {
  const variantText = {
    accent: 'text-[#0078D4]',
    warning: 'text-[#FFB900]',
    error: 'text-[#D13438]',
    nominal: 'text-[#00CC6A]',
  }[variant];

  const variantBorder = {
    accent: 'border-[#0078D4]/40',
    warning: 'border-[#FFB900]/40',
    error: 'border-[#D13438]/40',
    nominal: 'border-[#00CC6A]/40',
  }[variant];

  // Calculate active segments
  const activeSegments = progressPercent !== undefined
    ? Math.round((progressPercent / 100) * segments)
    : undefined;

  return (
    <div
      className={`
        bg-[#0E0F14]/80 backdrop-blur-md border p-3 text-left relative overflow-hidden
        transition-all duration-200 hover:border-white/20
        ${variantBorder}
        ${className}
      `}
      style={{ borderRadius: 0 }}
    >
      {/* Specular hairline */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

      {/* Metric Header */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#8A8F9E] truncate">
          {label}
        </span>
        {technicalCode && (
          <span className="text-[9px] font-mono text-[#575C6C] bg-black/40 px-1 py-0.2 border border-white/5">
            {technicalCode}
          </span>
        )}
      </div>

      {/* Main Digital Readout */}
      <div className="flex items-baseline gap-1.5 my-1">
        <span className={`text-2xl font-bold font-mono tracking-tight ${variantText}`}>
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono text-[#7F88A8] font-normal uppercase">
            {unit}
          </span>
        )}
      </div>

      {/* Trend or subtext */}
      {trendValue && (
        <div className="flex items-center gap-1.5 text-[11px] font-mono mt-1 text-[#A2A7B5]">
          {trend === 'up' && <span className="text-[#00CC6A]">▲</span>}
          {trend === 'down' && <span className="text-[#D13438]">▼</span>}
          {trend === 'stable' && <span className="text-[#0078D4]">■</span>}
          <span>{trendValue}</span>
        </div>
      )}

      {/* Segmented Industrial LED Bar */}
      {activeSegments !== undefined && (
        <div className="mt-2.5 pt-2 border-t border-white/10">
          <div className="flex items-center gap-1">
            {Array.from({ length: segments }).map((_, idx) => {
              const isActive = idx < activeSegments;
              // Determine color based on threshold index
              let segColor = 'bg-[#0078D4] shadow-[0_0_4px_#0078D4]';
              if (idx >= Math.floor(segments * 0.8)) {
                segColor = 'bg-[#D13438] shadow-[0_0_4px_#D13438]';
              } else if (idx >= Math.floor(segments * 0.6)) {
                segColor = 'bg-[#FFB900] shadow-[0_0_4px_#FFB900]';
              }

              return (
                <div
                  key={idx}
                  className={`
                    h-2 flex-1 transition-all duration-150
                    ${isActive ? segColor : 'bg-[#181A22] border border-white/5'}
                  `}
                  style={{ borderRadius: 0 }}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[9px] font-mono text-[#575C6C] mt-1">
            <span>0%</span>
            <span>WARN 60%</span>
            <span>CRIT 80%</span>
            <span>100%</span>
          </div>
        </div>
      )}
    </div>
  );
};
