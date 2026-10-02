import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Percent,
  FileWarning,
  ShieldCheck,
} from 'lucide-react';

export type InvoiceStatusType =
  | 'DUPLICATE'
  | 'VARIANCE'
  | 'TAX_MISMATCH'
  | 'MISSING_PO'
  | 'AUTO-PASSED'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'NOMINAL';

export interface StatusBadgeProps {
  status: InvoiceStatusType | string;
  size?: 'xs' | 'sm' | 'md';
  pulsing?: boolean;
  showDot?: boolean;
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'sm',
  pulsing = false,
  showDot = true,
  showIcon = true,
  className = '',
}) => {
  const normalized = status.toUpperCase().replace(/\s+/g, '_');

  const getConfig = () => {
    switch (normalized) {
      case 'DUPLICATE':
      case 'DUPLICATE_BLOCKED':
      case 'DUPLICATE_INTERCEPTED':
        return {
          label: 'DUPLICATE INTERCEPTED',
          icon: Copy,
          textColor: 'text-[#EF4444]',
          bgColor: 'bg-[#EF4444]/10',
          borderColor: 'border-[#EF4444]/35',
          dotColor: 'bg-[#EF4444]',
          pulseColor: 'bg-[#EF4444]/40',
        };
      case 'VARIANCE':
      case 'VARIANCE_EXCEPTION':
      case 'RATE_VARIANCE':
        return {
          label: 'RATE VARIANCE',
          icon: Percent,
          textColor: 'text-[#F59E0B]',
          bgColor: 'bg-[#F59E0B]/10',
          borderColor: 'border-[#F59E0B]/35',
          dotColor: 'bg-[#F59E0B]',
          pulseColor: 'bg-[#F59E0B]/40',
        };
      case 'TAX_MISMATCH':
      case 'MISSING_PO':
      case 'MISSING_PO_AUTHORIZATION':
        return {
          label: 'TAX / PO MISMATCH',
          icon: FileWarning,
          textColor: 'text-[#38BDF8]',
          bgColor: 'bg-[#38BDF8]/10',
          borderColor: 'border-[#38BDF8]/35',
          dotColor: 'bg-[#38BDF8]',
          pulseColor: 'bg-[#38BDF8]/40',
        };
      case 'AUTO-PASSED':
      case 'AUTO_PASSED':
        return {
          label: 'AUTO-PASSED',
          icon: ShieldCheck,
          textColor: 'text-[#10B981]',
          bgColor: 'bg-[#10B981]/10',
          borderColor: 'border-[#10B981]/35',
          dotColor: 'bg-[#10B981]',
          pulseColor: 'bg-[#10B981]/40',
        };
      case 'APPROVED':
      case 'EXCEPTION_APPROVED':
        return {
          label: 'OVERRIDE APPROVED',
          icon: CheckCircle2,
          textColor: 'text-[#10B981]',
          bgColor: 'bg-[#10B981]/15',
          borderColor: 'border-[#10B981]/40',
          dotColor: 'bg-[#10B981]',
          pulseColor: 'bg-[#10B981]/40',
        };
      case 'REJECTED':
      case 'EXCEPTION_REJECTED':
        return {
          label: 'REJECTED & HELD',
          icon: XCircle,
          textColor: 'text-[#EF4444]',
          bgColor: 'bg-[#EF4444]/15',
          borderColor: 'border-[#EF4444]/40',
          dotColor: 'bg-[#EF4444]',
          pulseColor: 'bg-[#EF4444]/40',
        };
      case 'PENDING':
      default:
        return {
          label: status.replace(/_/g, ' '),
          icon: AlertTriangle,
          textColor: 'text-[#FFB900]',
          bgColor: 'bg-[#FFB900]/10',
          borderColor: 'border-[#FFB900]/30',
          dotColor: 'bg-[#FFB900]',
          pulseColor: 'bg-[#FFB900]/40',
        };
    }
  };

  const config = getConfig();
  const IconComponent = config.icon;

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-1',
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-sm px-2.5 py-1 gap-2',
  }[size];

  const dotSizes = {
    xs: 'w-1 h-1',
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
  }[size];

  const iconSizes = {
    xs: 11,
    sm: 13,
    md: 15,
  }[size];

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded border tracking-wide uppercase transition-all select-none backdrop-blur-sm ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses} ${className}`}
    >
      {showDot && (
        <span className="relative flex items-center justify-center">
          {pulsing && (
            <span
              className={`absolute inline-flex h-full w-full rounded-full animate-ping opacity-75 ${config.pulseColor}`}
            />
          )}
          <span className={`rounded-full ${config.dotColor} ${dotSizes}`} />
        </span>
      )}

      {showIcon && <IconComponent size={iconSizes} className="shrink-0 stroke-[2.2]" />}

      <span>{config.label}</span>
    </span>
  );
};
