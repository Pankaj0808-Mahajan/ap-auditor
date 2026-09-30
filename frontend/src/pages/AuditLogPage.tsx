import React, { useState } from 'react';
import {
  Search,
  Download,
} from 'lucide-react';

interface AuditEntry {
  auditId: string;
  invoiceNo: string;
  vendor: string;
  amount: string;
  decision: 'AUTO-PASSED' | 'DUPLICATE_BLOCKED' | 'EXCEPTION_APPROVED' | 'EXCEPTION_REJECTED';
  confidence: number;
  hash: string;
  operator: string;
  timestamp: string;
}

export const AuditLogPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'AUTO-PASSED' | 'DUPLICATE' | 'EXCEPTIONS'>('ALL');

  const entries: AuditEntry[] = [
    {
      auditId: 'LOG-77291',
      invoiceNo: 'INV-2026-8819',
      vendor: 'SIEMENS HEAVY TURBINE',
      amount: '$142,500.00',
      decision: 'AUTO-PASSED',
      confidence: 99.8,
      hash: 'sha256:49a8f290e812',
      operator: 'ENGINE_AUTO_ROUTER',
      timestamp: 'Today, 14:22:10 UTC',
    },
    {
      auditId: 'LOG-77292',
      invoiceNo: 'INV-2026-8820',
      vendor: 'KYOCERA SENSORS CORP',
      amount: '$38,910.50',
      decision: 'DUPLICATE_BLOCKED',
      confidence: 100.0,
      hash: 'sha256:7b1029c49a3e',
      operator: 'DUPLICATE_DETECTOR_V3',
      timestamp: 'Today, 14:23:44 UTC',
    },
    {
      auditId: 'LOG-77293',
      invoiceNo: 'INV-2026-8821',
      vendor: 'TITAN HYDRAULICS FAB',
      amount: '$219,840.00',
      decision: 'EXCEPTION_APPROVED',
      confidence: 91.4,
      hash: 'sha256:ee0419d882ca',
      operator: 'J_MORGAN (AP_DIRECTOR)',
      timestamp: 'Today, 14:24:02 UTC',
    },
    {
      auditId: 'LOG-77294',
      invoiceNo: 'INV-2026-8822',
      vendor: 'MITSUBISHI POWER AUTOMATION',
      amount: '$64,120.00',
      decision: 'AUTO-PASSED',
      confidence: 99.4,
      hash: 'sha256:92cb14aa014d',
      operator: 'ENGINE_AUTO_ROUTER',
      timestamp: 'Today, 14:25:31 UTC',
    },
    {
      auditId: 'LOG-77295',
      invoiceNo: 'INV-2026-8823',
      vendor: 'APEX LOGISTICS INTERNATIONAL',
      amount: '$12,450.00',
      decision: 'EXCEPTION_REJECTED',
      confidence: 88.0,
      hash: 'sha256:331fcba87910',
      operator: 'S_CHEN (SENIOR_AUDITOR)',
      timestamp: 'Today, 14:30:18 UTC',
    },
    {
      auditId: 'LOG-77296',
      invoiceNo: 'INV-2026-8824',
      vendor: 'ABB POWER GRIDS SWITZERLAND',
      amount: '$480,200.00',
      decision: 'AUTO-PASSED',
      confidence: 99.9,
      hash: 'sha256:119ea55018cf',
      operator: 'ENGINE_AUTO_ROUTER',
      timestamp: 'Today, 14:34:02 UTC',
    },
  ];

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.auditId.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'AUTO-PASSED') return entry.decision === 'AUTO-PASSED';
    if (selectedFilter === 'DUPLICATE') return entry.decision === 'DUPLICATE_BLOCKED';
    if (selectedFilter === 'EXCEPTIONS')
      return entry.decision.startsWith('EXCEPTION');
    return true;
  });

  return (
    <div className="w-full min-h-screen bg-[#0A0A0C] text-[#E6E8EE] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6 text-left">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Compliance Audit Log
              </h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#0078D4]/15 text-[#60A5FA] border border-[#0078D4]/30 font-semibold">
                SOX / SOC 2
              </span>
            </div>
            <p className="text-sm text-[#94A3B8] mt-1">
              Cryptographically signed immutable trail of all automated passes, duplicate blocks, and human override actions.
            </p>
          </div>

          <button
            onClick={() => alert('Exporting signed audit ledger CSV...')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#141824] hover:bg-[#1D2335] border border-white/15 text-white text-xs font-medium transition-colors"
          >
            <Download size={14} />
            <span>Export SOX Evidence Pack</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search by vendor, invoice #, audit ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#0F1219] border border-white/10 rounded-lg text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#0078D4]"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 text-xs font-medium">
            {(['ALL', 'AUTO-PASSED', 'DUPLICATE', 'EXCEPTIONS'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                  selectedFilter === filter
                    ? 'bg-[#0078D4] text-white'
                    : 'bg-[#0F1219] border border-white/10 text-[#94A3B8] hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="rounded-xl bg-[#0F1219] border border-white/10 overflow-hidden shadow-sm">
          <div className="overflow-x-auto -mx-1 sm:mx-0">
            <table className="w-full text-left text-xs min-w-[720px]">
              <thead className="bg-[#121622] border-b border-white/10 text-[#64748B] font-mono">
                <tr>
                  <th className="py-3.5 px-4 font-normal">AUDIT ID</th>
                  <th className="py-3.5 px-4 font-normal">INVOICE & VENDOR</th>
                  <th className="py-3.5 px-4 font-normal">AMOUNT</th>
                  <th className="py-3.5 px-4 font-normal">DECISION</th>
                  <th className="py-3.5 px-4 font-normal">CONFIDENCE</th>
                  <th className="py-3.5 px-4 font-normal">AUTHORIZER / AGENT</th>
                  <th className="py-3.5 px-4 font-normal">TIMESTAMP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {filteredEntries.map((entry) => (
                  <tr key={entry.auditId} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {entry.auditId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-medium text-white">{entry.invoiceNo}</div>
                      <div className="text-[11px] text-[#8A94A8]">{entry.vendor}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {entry.amount}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                          entry.decision === 'AUTO-PASSED'
                            ? 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30'
                            : entry.decision === 'DUPLICATE_BLOCKED'
                            ? 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30'
                            : entry.decision === 'EXCEPTION_APPROVED'
                            ? 'text-[#38BDF8] bg-[#38BDF8]/10 border-[#38BDF8]/30'
                            : 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30'
                        }`}
                      >
                        {entry.decision}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className="text-[#38BDF8] font-bold">{entry.confidence}%</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#94A3B8]">
                      {entry.operator}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#64748B]">
                      {entry.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-[#121622] border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-[#64748B]">
            <span>Showing {filteredEntries.length} records</span>
            <span className="font-mono">Merkle Root: 0x8f29...e304 • Immutable</span>
          </div>
        </div>
      </div>
    </div>
  );
};
