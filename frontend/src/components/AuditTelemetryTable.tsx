import React, { useState } from 'react';
import { IndustrialBadge } from './IndustrialBadge';
import { IndustrialButton } from './IndustrialButton';
import { IndustrialInput } from './IndustrialInput';
import { Search, RefreshCw } from 'lucide-react';

interface AuditRecord {
  id: string;
  vendor: string;
  poNumber: string;
  amount: string;
  variance: string;
  status: 'nominal' | 'warning' | 'critical';
  confidence: number;
  timestamp: string;
}

const mockRecords: AuditRecord[] = [
  {
    id: 'AUD-88219',
    vendor: 'SIEMENS HEAVY TURBINES LTD',
    poNumber: 'PO-2026-9041',
    amount: '$142,500.00',
    variance: '0.00%',
    status: 'nominal',
    confidence: 99.8,
    timestamp: '14:22:10.04',
  },
  {
    id: 'AUD-88220',
    vendor: 'KYOCERA INDUSTRIAL SENSORS',
    poNumber: 'PO-2026-9042',
    amount: '$38,910.50',
    variance: '+4.20%',
    status: 'warning',
    confidence: 84.1,
    timestamp: '14:23:44.18',
  },
  {
    id: 'AUD-88221',
    vendor: 'TITAN HYDRAULICS FABRICATION',
    poNumber: 'PO-2026-9043',
    amount: '$219,840.00',
    variance: '+18.75%',
    status: 'critical',
    confidence: 42.6,
    timestamp: '14:24:02.91',
  },
  {
    id: 'AUD-88222',
    vendor: 'MITSUBISHI POWER AUTOMATION',
    poNumber: 'PO-2026-9044',
    amount: '$64,120.00',
    variance: '0.00%',
    status: 'nominal',
    confidence: 98.4,
    timestamp: '14:25:31.05',
  },
  {
    id: 'AUD-88223',
    vendor: 'ABB HIGH-VOLTAGE SWITCHGEAR',
    poNumber: 'PO-2026-9045',
    amount: '$88,400.00',
    variance: '-2.10%',
    status: 'warning',
    confidence: 88.9,
    timestamp: '14:26:15.62',
  },
];

export const AuditTelemetryTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'warning' | 'critical'>('all');

  const filtered = mockRecords.filter((rec) => {
    const matchesSearch =
      rec.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.poNumber.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'warning') return matchesSearch && rec.status === 'warning';
    if (filterStatus === 'critical') return matchesSearch && rec.status === 'critical';
    return matchesSearch;
  });

  return (
    <div className="space-y-3">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-72">
          <IndustrialInput
            placeholder="FILTER RECORDS BY ID / VENDOR..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={14} />}
            mono
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-[#0A0A0C] border border-white/10 p-0.5">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 text-[11px] font-mono transition-colors ${
                filterStatus === 'all' ? 'bg-[#0078D4] text-white' : 'text-[#8A8F9E] hover:text-white'
              }`}
              style={{ borderRadius: 0 }}
            >
              ALL [5]
            </button>
            <button
              onClick={() => setFilterStatus('warning')}
              className={`px-2.5 py-1 text-[11px] font-mono transition-colors ${
                filterStatus === 'warning' ? 'bg-[#FFB900] text-black font-semibold' : 'text-[#8A8F9E] hover:text-white'
              }`}
              style={{ borderRadius: 0 }}
            >
              WARN [2]
            </button>
            <button
              onClick={() => setFilterStatus('critical')}
              className={`px-2.5 py-1 text-[11px] font-mono transition-colors ${
                filterStatus === 'critical' ? 'bg-[#D13438] text-white' : 'text-[#8A8F9E] hover:text-white'
              }`}
              style={{ borderRadius: 0 }}
            >
              CRIT [1]
            </button>
          </div>

          <IndustrialButton variant="acrylic" size="xs" icon={<RefreshCw size={13} />}>
            SYNC
          </IndustrialButton>
        </div>
      </div>

      {/* Sharp Industrial Table */}
      <div className="border border-white/10 overflow-x-auto bg-[#0E0F14]/70 backdrop-blur-md" style={{ borderRadius: 0 }}>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#0A0A0C] border-b border-white/15 text-[#8A8F9E] font-mono text-[10px] uppercase tracking-wider">
              <th className="p-3 border-r border-white/10">RECORD ID</th>
              <th className="p-3 border-r border-white/10">ENTITY / VENDOR</th>
              <th className="p-3 border-r border-white/10">PO REFERENCE</th>
              <th className="p-3 border-r border-white/10 text-right">INVOICE AMT</th>
              <th className="p-3 border-r border-white/10 text-right">VARIANCE</th>
              <th className="p-3 border-r border-white/10">CONFIDENCE</th>
              <th className="p-3 border-r border-white/10">STATUS</th>
              <th className="p-3 text-right">TIMESTAMP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono">
            {filtered.map((item) => {
              const rowBorder =
                item.status === 'critical'
                  ? 'hover:bg-[#D13438]/10'
                  : item.status === 'warning'
                  ? 'hover:bg-[#FFB900]/10'
                  : 'hover:bg-white/5';

              return (
                <tr key={item.id} className={`transition-colors ${rowBorder}`}>
                  <td className="p-3 border-r border-white/10 text-[#0078D4] font-semibold">
                    {item.id}
                  </td>
                  <td className="p-3 border-r border-white/10 text-[#E6E8EE] font-sans font-medium text-xs">
                    {item.vendor}
                  </td>
                  <td className="p-3 border-r border-white/10 text-[#8A8F9E]">
                    {item.poNumber}
                  </td>
                  <td className="p-3 border-r border-white/10 text-right text-white font-semibold">
                    {item.amount}
                  </td>
                  <td
                    className={`p-3 border-r border-white/10 text-right font-bold ${
                      item.status === 'critical'
                        ? 'text-[#D13438]'
                        : item.status === 'warning'
                        ? 'text-[#FFB900]'
                        : 'text-[#00CC6A]'
                    }`}
                  >
                    {item.variance}
                  </td>
                  <td className="p-3 border-r border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-[#181A22] border border-white/5">
                        <div
                          className={`h-full ${
                            item.confidence > 90
                              ? 'bg-[#0078D4]'
                              : item.confidence > 70
                              ? 'bg-[#FFB900]'
                              : 'bg-[#D13438]'
                          }`}
                          style={{ width: `${item.confidence}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-[#A2A7B5]">{item.confidence}%</span>
                    </div>
                  </td>
                  <td className="p-3 border-r border-white/10">
                    <IndustrialBadge
                      status={item.status}
                      variant="outline"
                      size="xs"
                      pulsing={item.status !== 'nominal'}
                      label={item.status === 'critical' ? 'CRITICAL FAULT' : item.status === 'warning' ? 'CAUTION' : 'NOMINAL'}
                    />
                  </td>
                  <td className="p-3 text-right text-[#575C6C] text-[11px]">
                    {item.timestamp}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
