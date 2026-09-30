import React from 'react';

export interface IndustrialToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  variant?: 'accent' | 'warning' | 'error' | 'nominal';
  disabled?: boolean;
  code?: string;
}

export const IndustrialToggle: React.FC<IndustrialToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  variant = 'accent',
  disabled = false,
  code,
}) => {
  const activeColor = {
    accent: 'bg-[#0078D4] border-[#0078D4] text-white shadow-[0_0_10px_rgba(0,120,212,0.6)]',
    warning: 'bg-[#FFB900] border-[#FFB900] text-black shadow-[0_0_10px_rgba(255,185,0,0.6)]',
    error: 'bg-[#D13438] border-[#D13438] text-white shadow-[0_0_10px_rgba(209,52,56,0.6)]',
    nominal: 'bg-[#107C41] border-[#00CC6A] text-white shadow-[0_0_10px_rgba(0,204,106,0.6)]',
  }[variant];

  const ledColor = {
    accent: 'bg-[#0078D4]',
    warning: 'bg-[#FFB900]',
    error: 'bg-[#D13438]',
    nominal: 'bg-[#00CC6A]',
  }[variant];

  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      className={`
        flex items-center justify-between gap-4 p-2.5 select-none cursor-pointer
        border border-white/10 bg-[#0E0F14]/70 hover:border-white/20
        backdrop-blur-md transition-all duration-150
        ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
      `}
      style={{ borderRadius: 0 }}
    >
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-2">
          {code && (
            <span className="text-[10px] font-mono text-[#575C6C] bg-white/5 px-1 py-0.2 border border-white/5">
              {code}
            </span>
          )}
          {label && (
            <span className="text-xs font-semibold uppercase tracking-wider text-[#E6E8EE]">
              {label}
            </span>
          )}
        </div>
        {description && (
          <span className="text-[11px] text-[#7F88A8] font-mono mt-0.5">
            {description}
          </span>
        )}
      </div>

      {/* Sharp Industrial Rocker switch */}
      <div className="flex items-center gap-1.5 shrink-0 bg-[#0A0A0C] p-1 border border-white/15">
        <div
          className={`
            px-2 py-1 text-[10px] font-mono font-bold tracking-wider uppercase transition-all duration-150 border
            ${!checked ? 'bg-[#1E202B] text-[#A2A7B5] border-white/10' : 'bg-transparent text-[#404555] border-transparent'}
          `}
          style={{ borderRadius: 0 }}
        >
          OFF
        </div>

        <div
          className={`
            px-2 py-1 text-[10px] font-mono font-bold tracking-wider uppercase flex items-center gap-1.5 transition-all duration-150 border
            ${checked ? activeColor : 'bg-transparent text-[#404555] border-transparent'}
          `}
          style={{ borderRadius: 0 }}
        >
          {checked && (
            <span
              className={`w-1.5 h-1.5 animate-pulse ${ledColor}`}
              style={{ borderRadius: 0 }}
            />
          )}
          ON
        </div>
      </div>
    </div>
  );
};
