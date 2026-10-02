import React, { useState } from 'react';
import {
  Info,
  CheckCircle2,
  XCircle,
  Hash,
  ShieldAlert,
  ArrowRight,
  Lock,
} from 'lucide-react';

export interface EvidenceData {
  id: string;
  vendor: string;
  amount: string;
  poNumber: string;
  flagType: 'DUPLICATE' | 'VARIANCE' | 'TAX_MISMATCH' | string;
  flagTitle: string;
  explainableReason: string;
  invoiceValue: string;
  poExpectedValue: string;
  difference: string;
  detectedAt?: string;
  status?: 'pending' | 'approved' | 'rejected';
  voucherMatch?: string;
  hash?: string;
  taxId?: string;
  lineItemDetails?: {
    item: string;
    billedRate: string;
    poRate: string;
    delta: string;
  }[];
}

export interface EvidencePanelProps {
  evidence: EvidenceData;
  onApprove?: (id: string, note?: string) => void;
  onReject?: (id: string, note?: string) => void;
  compact?: boolean;
  className?: string;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  evidence,
  onApprove,
  onReject,
  compact = false,
  className = '',
}) => {
  const [currentStatus, setCurrentStatus] = useState<'pending' | 'approved' | 'rejected'>(
    evidence.status || 'pending'
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setCurrentStatus('approved');
      setIsProcessing(false);
      onApprove?.(evidence.id, 'Approved via Enterprise Conversational AI prompt');
    }, 400);
  };

  const handleReject = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setCurrentStatus('rejected');
      setIsProcessing(false);
      onReject?.(evidence.id, 'Rejected: Credit note requested from vendor');
    }, 400);
  };

  return (
    <div
      className={`rounded-xl border border-white/10 bg-[#0E121C] text-[#E6E8EE] overflow-hidden transition-all text-left shadow-lg ${className}`}
    >
      {/* Top Banner: Explainable Flag Rationale */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#141A29] to-[#0E1320] border-b border-white/10 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#60A5FA]">
            <div className="w-5 h-5 rounded-md bg-[#0078D4]/20 border border-[#0078D4]/40 flex items-center justify-center text-[#38BDF8]">
              <Info size={12} />
            </div>
            <span>EXPLAINABLE AI RATIONALE</span>
          </div>

          {evidence.hash && (
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-[#64748B] bg-black/30 px-2 py-0.5 rounded border border-white/5">
              <Hash size={11} className="text-[#38BDF8]" />
              <span className="truncate max-w-[130px]">{evidence.hash}</span>
            </div>
          )}
        </div>

        <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
          {evidence.explainableReason}
        </p>

        {/* Voucher / Duplicate Highlight */}
        {evidence.voucherMatch && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#EF4444]/10 border border-[#EF4444]/30 text-[11px] font-mono text-[#FCA5A5]">
            <ShieldAlert size={12} className="text-[#EF4444]" />
            <span>Intercepted Match: Settled Voucher {evidence.voucherMatch}</span>
          </div>
        )}
      </div>

      {/* Reconciliation Comparison Matrix */}
      <div className="p-3.5 sm:p-4 space-y-3">
        <div className="text-[11px] font-mono text-[#64748B] uppercase tracking-wider flex items-center justify-between">
          <span>Three-Way Reconciliation Matrix</span>
          <span className="text-[#38BDF8] text-[10px]">PO Ref: {evidence.poNumber}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Claimed */}
          <div className="p-2.5 rounded-lg bg-[#0A0D15] border border-white/5 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-[#64748B] uppercase">Invoice Claimed</span>
            <span className="text-sm sm:text-base font-bold font-mono text-white mt-1">
              {evidence.invoiceValue || evidence.amount}
            </span>
          </div>

          {/* PO Expected */}
          <div className="p-2.5 rounded-lg bg-[#0A0D15] border border-white/5 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-[#64748B] uppercase">Contracted PO Cap</span>
            <span className="text-sm sm:text-base font-bold font-mono text-[#94A3B8] mt-1">
              {evidence.poExpectedValue}
            </span>
          </div>

          {/* Delta */}
          <div className="p-2.5 rounded-lg bg-[#EF4444]/5 border border-[#EF4444]/25 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-[#EF4444] uppercase">Audit Delta</span>
            <span className="text-sm sm:text-base font-bold font-mono text-[#F87171] mt-1">
              {evidence.difference}
            </span>
          </div>
        </div>

        {/* Optional Line item variance drilldown */}
        {evidence.lineItemDetails && evidence.lineItemDetails.length > 0 && (
          <div className="mt-2 pt-2 border-t border-white/5 space-y-1.5">
            <span className="text-[10px] font-mono text-[#8A94A8] block">Discrepant Line Items:</span>
            <div className="space-y-1 text-xs font-mono">
              {evidence.lineItemDetails.map((li, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-black/20 p-1.5 rounded text-[11px]"
                >
                  <span className="text-white truncate max-w-[180px]">{li.item}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#94A3B8] line-through">{li.poRate}</span>
                    <ArrowRight size={10} className="text-[#64748B]" />
                    <span className="text-[#F59E0B] font-bold">{li.billedRate}</span>
                    <span className="text-[#EF4444]">({li.delta})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Decision / Action Row */}
      <div className="px-3.5 sm:px-4 py-3 bg-[#0A0D14] border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
          <Lock size={12} className="text-[#0078D4]" />
          <span>SOX Audit Trail Enforced</span>
        </div>

        {currentStatus === 'pending' ? (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleReject}
              disabled={isProcessing}
              className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-[#EF4444]/15 hover:bg-[#EF4444]/25 active:bg-[#EF4444]/30 border border-[#EF4444]/40 text-[#EF4444] font-medium text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <XCircle size={14} />
              <span>Reject & Request Credit</span>
            </button>

            <button
              onClick={handleApprove}
              disabled={isProcessing}
              className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg bg-[#0078D4] hover:bg-[#1084DE] active:bg-[#0063B1] text-white font-medium text-xs transition-all shadow-[0_0_12px_rgba(0,120,212,0.3)] flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 size={14} />
              <span>Approve Exception</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {currentStatus === 'approved' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-xs font-mono font-semibold">
                <CheckCircle2 size={13} />
                OVERRIDE RECORDED IN SOX LOG
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 text-xs font-mono font-semibold">
                <XCircle size={13} />
                REJECTED & VENDOR NOTIFIED
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
