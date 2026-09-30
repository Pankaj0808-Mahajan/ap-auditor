import React from 'react';

export type BadgeStatus = 'nominal' | 'accent' | 'warning' | 'critical' | 'neutral';
export type BadgeVariant = 'solid' | 'outline' | 'acrylic';
export type BadgeSize = 'xs' | 'sm' | 'md';

export interface IndustrialBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: BadgeStatus;
  variant?: BadgeVariant;
  size?: BadgeSize;
  pulsing?: boolean;
  code?: string;
  dot?: boolean;
  label?: string;
}

export const IndustrialBadge: React.FC<IndustrialBadgeProps> = ({
  status = 'neutral',
  variant = 'outline',
  size = 'sm',
  pulsing = false,
  code,
  dot = true,
  label,
  children,
  className = '',
  ...props
}) => {
  // Color styles per status
  const statusStyles: Record<BadgeStatus, {
    solid: string;
    outline: string;
    acrylic: string;
    dotColor: string;
    pulseColor: string;
  }> = {
    // Nominal / Operational
    nominal: {
      solid: 'bg-[#107C41] text-white border-[#107C41]',
      outline: 'bg-[#107C41]/10 text-[#00CC6A] border-[#107C41]/50',
      acrylic: 'bg-[#107C41]/15 text-[#00CC6A] border-[#00CC6A]/30 backdrop-blur-md',
      dotColor: 'bg-[#00CC6A]',
      pulseColor: 'bg-[#00CC6A]/50',
    },
    // Accent (#0078D4)
    accent: {
      solid: 'bg-[#0078D4] text-white border-[#0078D4]',
      outline: 'bg-[#0078D4]/15 text-[#60A5FA] border-[#0078D4]/50',
      acrylic: 'bg-[#0078D4]/20 text-[#93C5FD] border-[#0078D4]/40 backdrop-blur-md',
      dotColor: 'bg-[#0078D4]',
      pulseColor: 'bg-[#0078D4]/50',
    },
    // Warning (#FFB900)
    warning: {
      solid: 'bg-[#FFB900] text-black border-[#FFB900]',
      outline: 'bg-[#FFB900]/15 text-[#FFB900] border-[#FFB900]/50',
      acrylic: 'bg-[#FFB900]/20 text-[#FFD454] border-[#FFB900]/40 backdrop-blur-md',
      dotColor: 'bg-[#FFB900]',
      pulseColor: 'bg-[#FFB900]/50',
    },
    // Error / Critical (#D13438)
    critical: {
      solid: 'bg-[#D13438] text-white border-[#D13438]',
      outline: 'bg-[#D13438]/15 text-[#FF6B6E] border-[#D13438]/50',
      acrylic: 'bg-[#D13438]/20 text-[#FFA1A3] border-[#D13438]/40 backdrop-blur-md',
      dotColor: 'bg-[#D13438]',
      pulseColor: 'bg-[#D13438]/50',
    },
    // Neutral
    neutral: {
      solid: 'bg-[#2B2E3D] text-[#E6E8EE] border-[#3E4357]',
      outline: 'bg-[#161821] text-[#A2A7B5] border-white/10',
      acrylic: 'bg-white/5 text-[#D3D7E5] border-white/10 backdrop-blur-md',
      dotColor: 'bg-[#7F88A8]',
      pulseColor: 'bg-[#7F88A8]/50',
    },
  };

  const sizeStyles: Record<BadgeSize, string> = {
    xs: 'px-1.5 py-0.5 text-[9px] gap-1 font-mono',
    sm: 'px-2 py-0.5 text-[11px] gap-1.5 font-mono',
    md: 'px-2.5 py-1 text-xs gap-2 font-mono',
  };

  const current = statusStyles[status];

  return (
    <span
      className={`
        inline-flex items-center uppercase tracking-wider font-semibold select-none
        border transition-colors duration-150
        ${current[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      style={{ borderRadius: 0 }}
      {...props}
    >
      {/* Blinking or pulsing LED indicator dot */}
      {dot && (
        <span className="relative flex h-2 w-2 shrink-0">
          {pulsing && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full opacity-75 ${current.pulseColor}`}
              style={{ borderRadius: 0 }}
            />
          )}
          <span
            className={`relative inline-flex h-2 w-2 ${current.dotColor}`}
            style={{ borderRadius: 0 }}
          />
        </span>
      )}

      {code && (
        <span className="opacity-70 font-mono text-[9px]">
          {code}
        </span>
      )}

      <span>{label || children}</span>
    </span>
  );
};
