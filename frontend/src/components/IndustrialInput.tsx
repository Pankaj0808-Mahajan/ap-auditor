import React, { forwardRef } from 'react';

export interface IndustrialInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  warning?: string;
  caption?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  technicalCode?: string;
  mono?: boolean;
}

export const IndustrialInput = forwardRef<HTMLInputElement, IndustrialInputProps>(({
  label,
  error,
  warning,
  caption,
  leftIcon,
  rightIcon,
  technicalCode,
  mono = false,
  className = '',
  disabled,
  ...props
}, ref) => {
  const borderStatus = error
    ? 'border-[#D13438] focus:border-[#D13438] focus:ring-1 focus:ring-[#D13438]/50'
    : warning
    ? 'border-[#FFB900] focus:border-[#FFB900] focus:ring-1 focus:ring-[#FFB900]/50'
    : 'border-white/15 focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4]/50';

  return (
    <div className="w-full text-left">
      {(label || technicalCode) && (
        <div className="flex items-center justify-between gap-2 mb-1.5">
          {label && (
            <label className="text-xs uppercase font-medium tracking-wider text-[#A2A7B5] select-none">
              {label}
            </label>
          )}
          {technicalCode && (
            <span className="text-[10px] font-mono text-[#575C6C] bg-white/5 px-1 py-0.5 border border-white/5">
              {technicalCode}
            </span>
          )}
        </div>
      )}

      <div className="relative flex items-center group">
        {/* Left Decorative Bracket Accent */}
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-transparent group-focus-within:bg-[#0078D4] transition-colors pointer-events-none" />

        {leftIcon && (
          <div className="absolute left-3 flex items-center pointer-events-none text-[#7F88A8] group-focus-within:text-[#0078D4]">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          className={`
            w-full bg-[#0E0F14]/90
            text-[#E6E8EE] placeholder:text-[#575C6C]
            px-3 py-2 text-sm
            border backdrop-blur-md
            transition-all duration-150
            outline-none
            disabled:opacity-40 disabled:cursor-not-allowed
            ${leftIcon ? 'pl-9' : ''}
            ${rightIcon ? 'pr-9' : ''}
            ${mono ? 'font-mono' : 'font-sans'}
            ${borderStatus}
            ${className}
          `}
          style={{ borderRadius: 0 }}
          disabled={disabled}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3 flex items-center text-[#7F88A8]">
            {rightIcon}
          </div>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#D13438] font-mono">
          <span className="inline-block w-1.5 h-1.5 bg-[#D13438]" />
          <span>[FAULT] {error}</span>
        </div>
      )}
      {!error && warning && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#FFB900] font-mono">
          <span className="inline-block w-1.5 h-1.5 bg-[#FFB900]" />
          <span>[WARN] {warning}</span>
        </div>
      )}
      {!error && !warning && caption && (
        <div className="mt-1 text-[11px] text-[#7F88A8] font-mono">
          {caption}
        </div>
      )}
    </div>
  );
});

IndustrialInput.displayName = 'IndustrialInput';
