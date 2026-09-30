import React from 'react';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'acrylic' | 'warning' | 'error' | 'ghost';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';
export type ButtonChamfer = 'none' | 'tl' | 'diagonal';

export interface IndustrialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  chamfer?: ButtonChamfer;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  active?: boolean;
  loading?: boolean;
  cornerTicks?: boolean;
  code?: string; // Optional technical badge like [F1] or [EXEC]
}

export const IndustrialButton: React.FC<IndustrialButtonProps> = ({
  variant = 'primary',
  size = 'md',
  chamfer = 'none',
  icon,
  iconRight,
  active = false,
  loading = false,
  cornerTicks = false,
  code,
  children,
  className = '',
  disabled,
  ...props
}) => {
  // Strict sharp styles per variant
  const variantStyles: Record<ButtonVariant, string> = {
    // Primary / Accent (#0078D4)
    primary: `
      bg-[#0078D4] hover:bg-[#1084DE] active:bg-[#0063B1]
      text-white border border-[#0078D4]
      shadow-[0_2px_12px_rgba(0,120,212,0.4)]
      hover:shadow-[0_4px_20px_rgba(0,120,212,0.6)]
    `,
    accent: `
      bg-[#0078D4]/15 hover:bg-[#0078D4]/25 active:bg-[#0078D4]/40
      text-[#60A5FA] hover:text-white border border-[#0078D4]/60
      hover:border-[#0078D4]
      shadow-[0_0_12px_rgba(0,120,212,0.25)]
    `,
    // Secondary / Industrial Steel
    secondary: `
      bg-[#161821] hover:bg-[#1F222E] active:bg-[#282C3B]
      text-[#E6E8EE] border border-[#2B2E3D] hover:border-white/20
    `,
    // High-tech frosted acrylic glass
    acrylic: `
      bg-[#0E0F14]/75 hover:bg-[#151722]/85 active:bg-[#1D202E]
      backdrop-blur-md text-[#E6E8EE] hover:text-white
      border border-white/15 hover:border-[#0078D4]/60
      shadow-[0_4px_16px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)]
    `,
    // Hazard Warning (#FFB900)
    warning: `
      bg-[#FFB900] hover:bg-[#FFC526] active:bg-[#DDA000]
      text-[#0A0A0C] font-semibold border border-[#FFB900]
      shadow-[0_2px_12px_rgba(255,185,0,0.4)]
      hover:shadow-[0_4px_20px_rgba(255,185,0,0.6)]
    `,
    // Critical Alert / Error (#D13438)
    error: `
      bg-[#D13438] hover:bg-[#E04347] active:bg-[#B02327]
      text-white border border-[#D13438]
      shadow-[0_2px_12px_rgba(209,52,56,0.4)]
      hover:shadow-[0_4px_20px_rgba(209,52,56,0.6)]
    `,
    // Ghost outline
    ghost: `
      bg-transparent hover:bg-white/5 active:bg-white/10
      text-[#A2A7B5] hover:text-white border border-transparent hover:border-white/10
    `,
  };

  const sizeStyles: Record<ButtonSize, string> = {
    xs: 'px-2 py-1 text-[11px] gap-1.5 font-mono',
    sm: 'px-3 py-1.5 text-xs gap-2',
    md: 'px-4 py-2 text-sm gap-2.5',
    lg: 'px-6 py-3 text-base gap-3 tracking-wide',
  };

  const chamferClasses: Record<ButtonChamfer, string> = {
    none: '',
    tl: 'cut-corner-tl',
    diagonal: 'cut-corners-diagonal',
  };

  return (
    <button
      className={`
        relative inline-flex items-center justify-center
        font-medium uppercase tracking-wider select-none
        transition-all duration-150 ease-out
        disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${chamferClasses[chamfer]}
        ${active ? 'ring-1 ring-white/50 brightness-110' : ''}
        ${className}
      `}
      style={{ borderRadius: 0 }}
      disabled={disabled || loading}
      {...props}
    >
      {/* Corner Ticks / Crosshair Accents */}
      {cornerTicks && (
        <>
          <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/60 pointer-events-none" />
          <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-white/60 pointer-events-none" />
        </>
      )}

      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      )}

      {icon && !loading && <span className="inline-flex shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
      {iconRight && <span className="inline-flex shrink-0">{iconRight}</span>}

      {code && (
        <span className="ml-1.5 text-[9px] px-1 py-0.2 bg-black/30 border border-white/10 font-mono tracking-tight text-white/80">
          {code}
        </span>
      )}
    </button>
  );
};
