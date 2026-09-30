import React, { useState } from 'react';
import { IndustrialModal } from './IndustrialModal';
import { IndustrialButton } from './IndustrialButton';
import {
  FileSpreadsheet,
  Play,
  Download,
  RefreshCw,
} from 'lucide-react';

interface SampleInvoice {
  id: string;
  vendor: string;
  amount: number;
  po: string;
  gst: string;
  category: string;
}

const SAMPLE_DATASET: SampleInvoice[] = [
  { id: 'INV-2026-101', vendor: 'SIEMENS TURBINES', amount: 48500, po: 'PO-9041', gst: '27AAACS1234F1Z1', category: 'Capital Equipment' },
  { id: 'INV-2026-102', vendor: 'TECHSUPPLY CO', amount: 8220, po: 'PO-9042', gst: '29AAACT5678G1Z2', category: 'IT Hardware' },
  { id: 'INV-2026-103', vendor: 'SIEMENS TURBINES', amount: 48500, po: 'PO-9041', gst: '27AAACS1234F1Z1', category: 'Capital Equipment' }, // DUPLICATE
  { id: 'INV-2026-104', vendor: 'GLOBALFREIGHT LTD', amount: 102500, po: '', gst: '24AAACG9012H1Z3', category: 'Logistics' }, // MISSING PO & OVER LIMIT
  { id: 'INV-2026-105', vendor: 'OFFICESOURCE', amount: 3450, po: 'PO-9044', gst: '06AAACH3456J1Z4', category: 'Facilities' },
  { id: 'INV-2026-106', vendor: 'AZURE CLOUD SVC', amount: 45000, po: 'PO-9045', gst: '33AAACA7890K1Z5', category: 'Cloud Infrastructure' },
  { id: 'INV-2026-107', vendor: 'HARRIS MFGR', amount: 12100, po: 'PO-9046', gst: '', category: 'Raw Materials' }, // MISSING GST
  { id: 'INV-2026-108', vendor: 'METRO ENERGY', amount: 67300, po: 'PO-9047', gst: '19AAACE1234L1Z6', category: 'Utilities' },
];

interface AuditResult {
  invoice: SampleInvoice;
  status: 'PASS' | 'REVIEW';
  reasons: string[];
  matchedRecord?: string;
  confidence: number;
}

export function SampleAuditSimulatorModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<AuditResult[] | null>(null);

  const handleRunAudit = () => {
    setIsRunning(true);
    setTimeout(() => {
      // Simulate Python/pandas deterministic checking
      const seenSignatures = new Map<string, string>();
      const processed: AuditResult[] = SAMPLE_DATASET.map((inv) => {
        const signature = `${inv.vendor}-${inv.amount}-${inv.po}`;
        const reasons: string[] = [];
        let matchedRecord: string | undefined;

        // Rule 1: Duplicate check
        if (seenSignatures.has(signature)) {
          reasons.push(`Exact duplicate detected: matches previous record`);
          matchedRecord = seenSignatures.get(signature);
        } else {
          seenSignatures.set(signature, inv.id);
        }

        // Rule 2: Missing PO
        if (!inv.po || inv.po.trim() === '') {
          reasons.push('Missing Purchase Order reference (PO required for amounts > $5,000)');
        }

        // Rule 3: Missing GST / Tax ID
        if (!inv.gst || inv.gst.trim() === '') {
          reasons.push('Invalid/Missing GSTIN Tax Registration code');
        }

        // Rule 4: Over-limit threshold ($50,000 policy cap for non-capex)
        if (inv.amount > 50000 && inv.category !== 'Capital Equipment') {
          reasons.push(`Amount $${inv.amount.toLocaleString()} exceeds automatic policy cap ($50,000)`);
        }

        const isPass = reasons.length === 0;

        return {
          invoice: inv,
          status: isPass ? 'PASS' : 'REVIEW',
          reasons,
          matchedRecord,
          confidence: isPass ? 99.4 : 42.0,
        };
      });

      setResults(processed);
      setIsRunning(false);
    }, 700);
  };

  const handleReset = () => {
    setResults(null);
  };

  const passCount = results ? results.filter((r) => r.status === 'PASS').length : 0;
  const reviewCount = results ? results.filter((r) => r.status === 'REVIEW').length : 0;

  return (
    <IndustrialModal
      isOpen={isOpen}
      onClose={onClose}
      title="AP-AUDITOR // LIVE RECONCILIATION SIMULATOR"
      technicalId="SIM-ENGINE-v1.0"
      variant="accent"
      footerActions={
        <>
          {results && (
            <IndustrialButton
              variant="secondary"
              size="sm"
              icon={<RefreshCw size={13} />}
              onClick={handleReset}
            >
              RESET DATASET
            </IndustrialButton>
          )}
          <IndustrialButton
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            CLOSE
          </IndustrialButton>
          {!results ? (
            <IndustrialButton
              variant="primary"
              size="sm"
              icon={<Play size={13} />}
              onClick={handleRunAudit}
              disabled={isRunning}
            >
              {isRunning ? 'RUNNING RULES ENGINE...' : 'RUN AUDIT (8 INVOICES)'}
            </IndustrialButton>
          ) : (
            <IndustrialButton
              variant="accent"
              size="sm"
              icon={<Download size={13} />}
              onClick={() => alert('Audit report exported to CSV!')}
            >
              EXPORT EXCEPTION REPORT
            </IndustrialButton>
          )}
        </>
      }
    >
      <div className="space-y-4 text-left">
        {/* Intro Banner */}
        <div className="p-3 bg-[#0A0A0C] border border-white/10 flex items-start gap-3">
          <FileSpreadsheet size={20} className="text-[#0078D4] flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-bold text-white font-mono uppercase">
              Batch Testing (Python / Pandas Rules Simulator)
            </div>
            <p className="text-[#8A8F9E] text-[11px] mt-0.5 leading-relaxed">
              Demonstrates the core challenge solution: checking incoming invoices against policy rules
              (caps, required fields, duplicates), auto-passing clean rows, and generating explainable exception reports.
            </p>
          </div>
        </div>

        {/* Results Metrics (if run) */}
        {results && (
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-[#0A0A0C] border border-[#107C41]/40">
              <div className="text-[10px] font-mono text-[#8A8F9E] uppercase">AUTO-PASSED</div>
              <div className="text-2xl font-bold font-mono text-[#107C41] mt-0.5">{passCount}</div>
              <div className="text-[10px] text-[#575C6C]">Sent directly to ERP batch</div>
            </div>
            <div className="p-3 bg-[#0A0A0C] border border-[#D13438]/40">
              <div className="text-[10px] font-mono text-[#8A8F9E] uppercase">HUMAN REVIEW NEEDED</div>
              <div className="text-2xl font-bold font-mono text-[#D13438] mt-0.5">{reviewCount}</div>
              <div className="text-[10px] text-[#575C6C]">Routed to finance specialist</div>
            </div>
            <div className="p-3 bg-[#0A0A0C] border border-[#0078D4]/40">
              <div className="text-[10px] font-mono text-[#8A8F9E] uppercase">AUTOMATION RATE</div>
              <div className="text-2xl font-bold font-mono text-[#0078D4] mt-0.5">
                {Math.round((passCount / results.length) * 100)}%
              </div>
              <div className="text-[10px] text-[#575C6C]">Zero manual touch required</div>
            </div>
          </div>
        )}

        {/* Table View */}
        <div className="border border-white/10 max-h-72 overflow-y-auto font-mono text-[11px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#12141D] text-[#8A8F9E] sticky top-0 border-b border-white/10 text-[10px]">
              <tr>
                <th className="p-2">INVOICE ID</th>
                <th className="p-2">VENDOR</th>
                <th className="p-2">AMOUNT</th>
                <th className="p-2">PO REF</th>
                <th className="p-2">DECISION</th>
                <th className="p-2">EXPLANATION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-[#08090C]">
              {(results || SAMPLE_DATASET.map(d => ({ invoice: d, status: null, reasons: [] }))).map((row, idx) => {
                const inv = row.invoice;
                const res = row as Partial<AuditResult>;
                return (
                  <tr key={inv.id || idx} className="hover:bg-white/5 transition-colors">
                    <td className="p-2 text-white font-semibold">{inv.id}</td>
                    <td className="p-2 text-[#A2A7B5]">{inv.vendor}</td>
                    <td className="p-2 text-white font-mono">${inv.amount.toLocaleString()}</td>
                    <td className="p-2 text-[#8A8F9E]">{inv.po || <span className="text-[#D13438]">MISSING</span>}</td>
                    <td className="p-2">
                      {res.status === 'PASS' && (
                        <span className="px-1.5 py-0.5 bg-[#107C41]/20 border border-[#107C41]/60 text-[#00CC6A] text-[9px] font-bold">
                          AUTO-PASS
                        </span>
                      )}
                      {res.status === 'REVIEW' && (
                        <span className="px-1.5 py-0.5 bg-[#D13438]/20 border border-[#D13438]/60 text-[#D13438] text-[9px] font-bold">
                          FLAGGED
                        </span>
                      )}
                      {!res.status && (
                        <span className="text-[#575C6C] text-[10px]">PENDING</span>
                      )}
                    </td>
                    <td className="p-2 text-[10px] text-[#A2A7B5]">
                      {res.reasons && res.reasons.length > 0 ? (
                        <div className="space-y-0.5">
                          {res.reasons.map((r, ri) => (
                            <div key={ri} className="text-[#FFD454] flex items-center gap-1">
                              <span>•</span>
                              <span>{r}</span>
                            </div>
                          ))}
                          {res.matchedRecord && (
                            <div className="text-[#0078D4] text-[9px]">
                              Matched duplicate record: {res.matchedRecord}
                            </div>
                          )}
                        </div>
                      ) : res.status === 'PASS' ? (
                        <span className="text-[#00CC6A]">3-Way Match Verified (Clean)</span>
                      ) : (
                        <span className="text-[#575C6C]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </IndustrialModal>
  );
}
