import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Info,
  Check,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

interface ExceptionItem {
  id: string;
  vendor: string;
  amount: string;
  poNumber: string;
  flagType: 'DUPLICATE' | 'VARIANCE' | 'TAX_MISMATCH';
  flagTitle: string;
  explainableReason: string;
  invoiceValue: string;
  poExpectedValue: string;
  difference: string;
  detectedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const ReviewQueuePage: React.FC = () => {
  const [exceptions, setExceptions] = useState<ExceptionItem[]>([
    {
      id: 'EXC-8820',
      vendor: 'KYOCERA INDUSTRIAL SENSORS',
      amount: '$38,910.50',
      poNumber: 'PO-2026-9042',
      flagType: 'DUPLICATE',
      flagTitle: 'Identical Invoice Hash Detected',
      explainableReason:
        'Vendor submitted an invoice with identical line-item amounts, line descriptions, and date matching settled voucher V-8812 paid on Sept 14, 2026. Automated disbursement halted.',
      invoiceValue: '$38,910.50',
      poExpectedValue: '$0.00 (Already Paid)',
      difference: '+$38,910.50 Overpay Risk',
      detectedAt: '8 mins ago',
      status: 'pending',
    },
    {
      id: 'EXC-8821',
      vendor: 'TITAN HYDRAULICS FABRICATION',
      amount: '$219,840.00',
      poNumber: 'PO-2026-9043',
      flagType: 'VARIANCE',
      flagTitle: 'Line-Item Rate Variance (+4.2%)',
      explainableReason:
        'Line Item #3 "High-Pressure Seal Flange" is billed at $440.00/unit. Master PO-2026-9043 specifies negotiated contract rate of $422.00/unit. Total variance exceeds allowed 1.0% threshold.',
      invoiceValue: '$219,840.00',
      poExpectedValue: '$210,970.00',
      difference: '+$8,870.00 Variance',
      detectedAt: '15 mins ago',
      status: 'pending',
    },
    {
      id: 'EXC-8822',
      vendor: 'APEX LOGISTICS INTERNATIONAL',
      amount: '$12,450.00',
      poNumber: 'PO-UNKNOWN',
      flagType: 'TAX_MISMATCH',
      flagTitle: 'Missing Purchase Order & Tax ID',
      explainableReason:
        'Invoice received without referenced authorized Purchase Order. Vendor Corporate Tax Registration Number (GSTIN/EIN) does not match vendor master record.',
      invoiceValue: '$12,450.00',
      poExpectedValue: 'PO Required',
      difference: 'Unallocated Spend',
      detectedAt: '32 mins ago',
      status: 'pending',
    },
  ]);

  const [selectedExceptionId, setSelectedExceptionId] = useState<string>('EXC-8820');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const selectedItem = exceptions.find((e) => e.id === selectedExceptionId) || exceptions[0];

  const handleAction = (id: string, action: 'approved' | 'rejected') => {
    setExceptions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: action } : item))
    );
    setActionNotice(
      `Exception ${id} was marked as ${action.toUpperCase()}. Audit log updated.`
    );
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="w-full min-h-screen bg-[#0A0A0C] text-[#E6E8EE] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6 text-left">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Exception Review Queue
              </h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#FFB900]/15 text-[#FFB900] border border-[#FFB900]/30 font-semibold">
                HUMAN REVIEW ONLY
              </span>
            </div>
            <p className="text-sm text-[#94A3B8] mt-1">
              "Only exceptions reach a human." Review explainable flags and authorize or reject discrepancies.
            </p>
          </div>

          <div className="text-xs font-mono text-[#8A94A8] bg-[#12151E] px-3.5 py-2 rounded-lg border border-white/10">
            <span>QUEUE DEPTH: </span>
            <span className="text-white font-bold">{exceptions.filter((e) => e.status === 'pending').length} PENDING</span>
          </div>
        </div>

        {/* Action toast */}
        {actionNotice && (
          <div className="p-3.5 rounded-lg bg-[#0078D4]/15 border border-[#0078D4]/40 text-sm text-[#93C5FD] flex items-center gap-2">
            <Check size={16} className="text-[#0078D4]" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Master / Detail Review Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* List of Flagged Invoices */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-mono text-[#64748B] uppercase tracking-wider mb-2">
              FLAGGED INVOICES ({exceptions.length})
            </div>

            {exceptions.map((item) => {
              const isSelected = item.id === selectedExceptionId;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedExceptionId(item.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#151924] border-[#0078D4] shadow-[0_0_20px_rgba(0,120,212,0.15)]'
                      : 'bg-[#0F1219] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white">
                          {item.id}
                        </span>
                        <StatusBadge status={item.flagType} size="xs" />
                      </div>
                      <div className="text-sm font-semibold text-white mt-1">
                        {item.vendor}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-white text-sm">
                        {item.amount}
                      </div>
                      <div className="text-[11px] text-[#64748B] mt-0.5">{item.detectedAt}</div>
                    </div>
                  </div>

                  <div className="mt-2.5 text-xs text-[#94A3B8] line-clamp-2">
                    {item.flagTitle}
                  </div>

                  {item.status !== 'pending' && (
                    <div className="mt-3 pt-2 border-t border-white/5 text-xs font-mono font-semibold flex items-center gap-1.5">
                      {item.status === 'approved' ? (
                        <span className="text-[#10B981]">✓ OVERRIDE APPROVED</span>
                      ) : (
                        <span className="text-[#EF4444]">✕ REJECTED & NOTIFIED</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Detailed Explainable Inspection Panel */}
          <div className="lg:col-span-7">
            {selectedItem && (
              <div className="p-6 rounded-xl bg-[#0F1219] border border-white/10 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <span className="text-xs font-mono text-[#0078D4] font-semibold">
                      INSPECTION DOSSIER
                    </span>
                    <h2 className="text-xl font-bold text-white mt-0.5">
                      {selectedItem.vendor}
                    </h2>
                    <span className="text-xs font-mono text-[#8A94A8]">
                      {selectedItem.id} • PO Ref: {selectedItem.poNumber}
                    </span>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-xs text-[#64748B]">Billed Value</div>
                    <div className="text-2xl font-bold font-mono text-white">
                      {selectedItem.amount}
                    </div>
                  </div>
                </div>

                {/* Explainable AI Rationale Banner */}
                <div className="p-4 rounded-lg bg-[#141824] border border-[#0078D4]/40 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#60A5FA] uppercase font-mono">
                    <Info size={15} />
                    <span>Explainable Flag Rationale</span>
                  </div>
                  <p className="text-sm text-[#E2E8F0] leading-relaxed">
                    {selectedItem.explainableReason}
                  </p>
                </div>

                {/* Side-by-side reconciliation comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-lg bg-[#0A0D14] border border-white/10">
                    <span className="text-[11px] text-[#64748B] block">Invoice Claimed</span>
                    <span className="text-base font-bold font-mono text-white mt-1 block">
                      {selectedItem.invoiceValue}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#0A0D14] border border-white/10">
                    <span className="text-[11px] text-[#64748B] block">Contract / PO Cap</span>
                    <span className="text-base font-bold font-mono text-white mt-1 block">
                      {selectedItem.poExpectedValue}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#0A0D14] border border-[#EF4444]/30 bg-[#EF4444]/5">
                    <span className="text-[11px] text-[#EF4444] block">Reconciliation Delta</span>
                    <span className="text-base font-bold font-mono text-[#EF4444] mt-1 block">
                      {selectedItem.difference}
                    </span>
                  </div>
                </div>

                {/* Decision Actions */}
                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <span className="text-xs text-[#8A94A8]">
                    Decision permanently written to SOX audit ledger
                  </span>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => handleAction(selectedItem.id, 'rejected')}
                      className="px-4 py-2.5 sm:py-2 rounded-lg bg-[#EF4444]/15 hover:bg-[#EF4444]/25 border border-[#EF4444]/40 text-[#EF4444] font-medium text-xs transition-colors flex items-center justify-center gap-1.5 w-full sm:w-auto"
                    >
                      <XCircle size={15} />
                      <span>Reject & Request Credit</span>
                    </button>

                    <button
                      onClick={() => handleAction(selectedItem.id, 'approved')}
                      className="px-4 py-2.5 sm:py-2 rounded-lg bg-[#0078D4] hover:bg-[#1084DE] text-white font-medium text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5 w-full sm:w-auto"
                    >
                      <CheckCircle2 size={15} />
                      <span>Approve Exception</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
