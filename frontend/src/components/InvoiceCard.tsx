import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Building2,
  Calendar,
} from 'lucide-react';
import { StatusBadge, InvoiceStatusType } from './StatusBadge';
import { EvidencePanel, EvidenceData } from './EvidencePanel';

export interface InvoiceCardData extends EvidenceData {
  id: string;
  vendor: string;
  amount: string;
  poNumber: string;
  flagType: InvoiceStatusType | string;
  flagTitle: string;
  explainableReason: string;
  invoiceValue: string;
  poExpectedValue: string;
  difference: string;
  detectedAt?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface InvoiceCardProps {
  invoice: InvoiceCardData;
  initiallyExpanded?: boolean;
  onApprove?: (id: string, note?: string) => void;
  onReject?: (id: string, note?: string) => void;
  onSelect?: (invoice: InvoiceCardData) => void;
  compact?: boolean;
  className?: string;
}

export const InvoiceCard: React.FC<InvoiceCardProps> = ({
  invoice,
  initiallyExpanded = true,
  onApprove,
  onReject,
  onSelect,
  compact = false,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

  return (
    <div
      className={`rounded-xl border transition-all duration-200 text-left overflow-hidden ${
        isExpanded
          ? 'bg-[#121622] border-[#0078D4]/40 shadow-[0_4px_24px_rgba(0,120,212,0.12)]'
          : 'bg-[#0E111A] border-white/10 hover:border-white/20 hover:bg-[#131722]'
      } ${className}`}
    >
      {/* Card Header */}
      <div
        onClick={() => {
          setIsExpanded(!isExpanded);
          onSelect?.(invoice);
        }}
        className="p-4 cursor-pointer select-none space-y-3"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {/* Left: ID & Badge */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-xs font-bold text-white bg-black/40 px-2 py-0.5 rounded border border-white/10">
              {invoice.id}
            </span>
            <StatusBadge status={invoice.flagType} size="xs" pulsing={invoice.status === 'pending'} />
            <span className="text-[11px] font-mono text-[#8A94A8]">
              PO: {invoice.poNumber}
            </span>
          </div>

          {/* Right: Amount & Time */}
          <div className="flex items-center justify-between sm:justify-end gap-3">
            <span className="text-base sm:text-lg font-bold font-mono text-white tracking-tight">
              {invoice.amount}
            </span>
            <button
              type="button"
              className="p-1 rounded-md text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors"
              aria-label={isExpanded ? 'Collapse invoice' : 'Expand invoice'}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Vendor & Flag Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-0.5">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-white">
            <Building2 size={14} className="text-[#0078D4] shrink-0" />
            <span className="truncate">{invoice.vendor}</span>
          </div>

          {invoice.detectedAt && (
            <div className="flex items-center gap-1 text-[11px] text-[#64748B]">
              <Calendar size={12} />
              <span>{invoice.detectedAt}</span>
            </div>
          )}
        </div>

        <div className="text-xs text-[#94A3B8] font-medium flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0078D4]" />
          <span>{invoice.flagTitle}</span>
        </div>
      </div>

      {/* Expandable Evidence Detail Section */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-white/5 animate-fadeIn">
          <EvidencePanel
            evidence={invoice}
            onApprove={onApprove}
            onReject={onReject}
            compact={compact}
          />
        </div>
      )}
    </div>
  );
};
