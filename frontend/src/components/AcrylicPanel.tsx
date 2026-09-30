import React from 'react';

export type AcrylicPanelVariant = 'default' | 'accent' | 'warning' | 'error' | 'subtle';
export type ChamferStyle = 'none' | 'tl' | 'br' | 'diagonal';

export interface AcrylicPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AcrylicPanelVariant;
  chamfer?: ChamferStyle;
  showBrackets?: boolean;
  header?: React.ReactNode;
  headerBadge?: string;
  headerAction?: React.ReactNode;
  glow?: boolean;
  scanline?: boolean;
  technicalId?: string;
  children: React.ReactNode;
}

export const AcrylicPanel: React.FC<AcrylicPanelProps> = ({
  variant = 'default',
  chamfer = 'none',
  showBrackets = false,
  header,
  headerBadge,
  headerAction,
  glow = false,
  scanline = false,
  technicalId,
  children,
  className = '',
  style,
  ...props
}) => {
  // Variant surface & border classes
  const variantStyles: Record<AcrylicPanelVariant, string> = {
    default: 'bg-[#0E0F14]/75 border-white/10 hover:border-white/20 text-[#E6E8EE]',
    accent: 'bg-[#0B1524]/80 border-[#0078D4]/40 hover:border-[#0078D4]/70 text-[#F3F4F6] shadow-[0_8px_32px_0_rgba(0,120,212,0.15)]',
    warning: 'bg-[#1C1608]/80 border-[#FFB900]/40 hover:border-[#FFB900]/70 text-[#F3F4F6] shadow-[0_8px_32px_0_rgba(255,185,0,0.15)]',
    error: 'bg-[#1C0A0D]/80 border-[#D13438]/40 hover:border-[#D13438]/70 text-[#F3F4F6] shadow-[0_8px_32px_0_rgba(209,52,56,0.15)]',
    subtle: 'bg-[#0A0A0C]/60 border-white/5 text-[#A2A7B5]',
  };

  // Sharp chamfer clip-path styles
  const chamferStyles: Record<ChamferStyle, string> = {
    none: '',
    tl: 'cut-corner-tl',
    br: 'cut-corner-br',
    diagonal: 'cut-corners-diagonal',
  };

  // Glow classes
  const glowStyles: Record<AcrylicPanelVariant, string> = {
    default: 'shadow-[0_0_24px_rgba(255,255,255,0.06)]',
    accent: 'shadow-[0_0_24px_rgba(0,120,212,0.3)]',
    warning: 'shadow-[0_0_24px_rgba(255,185,0,0.3)]',
    error: 'shadow-[0_0_24px_rgba(209,52,56,0.3)]',
    subtle: '',
  };

  const headerAccentBorder: Record<AcrylicPanelVariant, string> = {
    default: 'border-b border-white/10',
    accent: 'border-b border-[#0078D4]/40 bg-[#0078D4]/10',
    warning: 'border-b border-[#FFB900]/40 bg-[#FFB900]/10',
    error: 'border-b border-[#D13438]/40 bg-[#D13438]/10',
    subtle: 'border-b border-white/5',
  };

  return (
    <div
      className={`
        relative
        backdrop-blur-xl
        border
        transition-all duration-200
        ${variantStyles[variant]}
        ${chamferStyles[chamfer]}
        ${glow ? glowStyles[variant] : ''}
        ${showBrackets ? 'corner-bracket-tl corner-bracket-br' : ''}
        ${className}
      `}
      style={{
        borderRadius: 0, // Enforce strict sharp edges
        ...style,
      }}
      {...props}
    >
      {/* Specular Top Edge Light Bleed */}
      <div 
        className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
        aria-hidden="true" 
      />

      {/* Decorative Technical Screw/Rivet Points on Corners */}
      <div className="absolute top-1 left-1 w-1 h-1 bg-white/20 pointer-events-none" />
      <div className="absolute top-1 right-1 w-1 h-1 bg-white/20 pointer-events-none" />
      <div className="absolute bottom-1 left-1 w-1 h-1 bg-white/20 pointer-events-none" />
      <div className="absolute bottom-1 right-1 w-1 h-1 bg-white/20 pointer-events-none" />

      {/* Optional Scanline Sub-texture */}
      {scanline && (
        <div className="absolute inset-0 scanline-overlay opacity-30 pointer-events-none" />
      )}

      {/* Header section if provided */}
      {(header || technicalId || headerBadge || headerAction) && (
        <div className={`px-4 py-2.5 flex items-center justify-between gap-3 text-xs tracking-wider uppercase font-mono select-none ${headerAccentBorder[variant]}`}>
          <div className="flex items-center gap-2 overflow-hidden">
            {technicalId && (
              <span className="text-[#8A8F9E] text-[10px] bg-black/40 px-1.5 py-0.5 border border-white/10 font-mono">
                {technicalId}
              </span>
            )}
            {typeof header === 'string' ? (
              <span className="font-semibold text-white tracking-widest truncate">{header}</span>
            ) : (
              header
            )}
          </div>

          <div className="flex items-center gap-2">
            {headerBadge && (
              <span className={`text-[10px] px-1.5 py-0.5 font-mono font-medium border ${
                variant === 'accent' ? 'text-[#0078D4] border-[#0078D4]/50 bg-[#0078D4]/10' :
                variant === 'warning' ? 'text-[#FFB900] border-[#FFB900]/50 bg-[#FFB900]/10' :
                variant === 'error' ? 'text-[#D13438] border-[#D13438]/50 bg-[#D13438]/10' :
                'text-[#8A8F9E] border-white/10 bg-white/5'
              }`}>
                {headerBadge}
              </span>
            )}
            {headerAction}
          </div>
        </div>
      )}

      {/* Panel Inner Content */}
      <div className="relative z-10 p-4">
        {children}
      </div>
    </div>
  );
};
