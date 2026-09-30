import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const DashboardPage: React.FC<{ onNavigateToReview?: () => void }> = ({
  onNavigateToReview,
}) => {
  const [filterPeriod, setFilterPeriod] = useState('Today');

  const stats = [
    {
      label: 'Total Invoices Processed',
      value: '14,820',
      change: '+12.4% vs last week',
      isPositive: true,
      subtext: 'Processed in 8.4 minutes',
    },
    {
      label: 'Auto-Pass Rate',
      value: '94.2%',
      change: '+2.1% from model retune',
      isPositive: true,
      subtext: '13,960 passed hands-off',
    },
    {
      label: 'Exceptions Requiring Human',
      value: '860',
      change: '-58% workload reduction',
      isPositive: true,
      subtext: 'Awaiting human sign-off',
      isHighlighted: true,
    },
    {
      label: 'Duplicate Leakage Blocked',
      value: '$342,850',
      change: '14 duplicate vouchers caught',
      isPositive: true,
      subtext: 'Protected treasury balance',
    },
  ];

  const recentInvoices = [
    {
      id: 'INV-2026-9041',
      vendor: 'SIEMENS HEAVY TURBINES LTD',
      amount: '$142,500.00',
      po: 'PO-2026-8819',
      status: 'AUTO-PASSED',
      rule: '3-Way Perfect Match (PO + GRN)',
      time: '2 mins ago',
      badgeColor: 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30',
    },
    {
      id: 'INV-2026-9042',
      vendor: 'KYOCERA INDUSTRIAL SENSORS',
      amount: '$38,910.50',
      po: 'PO-2026-8820',
      status: 'DUPLICATE INTERCEPTED',
      rule: 'Matched voucher #V-8812 paid on Sept 14',
      time: '8 mins ago',
      badgeColor: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30',
    },
    {
      id: 'INV-2026-9043',
      vendor: 'TITAN HYDRAULICS FABRICATION',
      amount: '$219,840.00',
      po: 'PO-2026-8821',
      status: 'VARIANCE EXCEPTION',
      rule: '+4.2% unit price variance on Line #3',
      time: '14 mins ago',
      badgeColor: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30',
    },
    {
      id: 'INV-2026-9044',
      vendor: 'MITSUBISHI POWER AUTOMATION',
      amount: '$64,120.00',
      po: 'PO-2026-8822',
      status: 'AUTO-PASSED',
      rule: '3-Way Match within 0.05% tolerance',
      time: '21 mins ago',
      badgeColor: 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30',
    },
    {
      id: 'INV-2026-9045',
      vendor: 'APEX LOGISTICS INTERNATIONAL',
      amount: '$12,450.00',
      po: 'PO-2026-8823',
      status: 'MISSING PO AUTHORIZATION',
      rule: 'No approved PO referenced on bill',
      time: '29 mins ago',
      badgeColor: 'text-[#0078D4] bg-[#0078D4]/10 border-[#0078D4]/30',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#0A0A0C] text-[#E6E8EE] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8 text-left">
        {/* Page Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                AP Operations Dashboard
              </h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#0078D4]/15 text-[#60A5FA] border border-[#0078D4]/30 font-semibold">
                LIVE
              </span>
            </div>
            <p className="text-sm text-[#94A3B8] mt-1">
              Real-time audit performance, exception telemetry, and treasury protection.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[#12151D] border border-white/10 rounded-lg p-1 text-xs">
              {['Today', 'This Week', 'This Month'].map((period) => (
                <button
                  key={period}
                  onClick={() => setFilterPeriod(period)}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    filterPeriod === period
                      ? 'bg-[#0078D4] text-white'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>

            <button
              onClick={onNavigateToReview}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0078D4] hover:bg-[#1084DE] text-white text-xs font-semibold shadow-sm transition-all"
            >
              <span>View Review Queue</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`p-5 rounded-xl bg-[#0F1219] border ${
                stat.isHighlighted
                  ? 'border-[#0078D4]/60 bg-gradient-to-b from-[#0F1219] to-[#0A111F]'
                  : 'border-white/10'
              } flex flex-col justify-between space-y-3`}
            >
              <div className="text-xs font-medium text-[#8A94A8]">{stat.label}</div>
              <div className="text-3xl font-bold font-mono text-white tracking-tight">
                {stat.value}
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                <span className="text-[#10B981] font-medium">{stat.change}</span>
                <span className="text-[#64748B]">{stat.subtext}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Breakdown Row: Pipeline Funnel & System Logic */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Funnel distribution */}
          <div className="p-6 rounded-xl bg-[#0F1219] border border-white/10 space-y-5 lg:col-span-1">
            <h2 className="text-base font-bold text-white flex items-center justify-between">
              <span>Routing Breakdown</span>
              <span className="text-xs text-[#64748B] font-mono">14,820 Total</span>
            </h2>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#10B981] flex items-center gap-1.5">
                    <CheckCircle2 size={13} />
                    <span>Auto-Passed to Payment</span>
                  </span>
                  <span className="font-mono text-white font-semibold">94.2%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-[#10B981] rounded-full" style={{ width: '94.2%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#EF4444] flex items-center gap-1.5">
                    <AlertTriangle size={13} />
                    <span>Duplicates Intercepted</span>
                  </span>
                  <span className="font-mono text-white font-semibold">2.3%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-[#EF4444] rounded-full" style={{ width: '2.3%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#F59E0B] flex items-center gap-1.5">
                    <AlertTriangle size={13} />
                    <span>Variance / PO Mismatch</span>
                  </span>
                  <span className="font-mono text-white font-semibold">2.8%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-[#F59E0B] rounded-full" style={{ width: '2.8%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#0078D4] flex items-center gap-1.5">
                    <Clock size={13} />
                    <span>Missing Vendor Tax / PO</span>
                  </span>
                  <span className="font-mono text-white font-semibold">0.7%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-[#0078D4] rounded-full" style={{ width: '0.7%' }} />
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#0078D4]/10 border border-[#0078D4]/25 text-xs text-[#93C5FD] leading-relaxed">
              <strong>Human Labor Saved:</strong> 312 review hours saved today. Reviewers focus solely on the 5.8% exception queue.
            </div>
          </div>

          {/* Recent Invoices Audit Stream */}
          <div className="p-6 rounded-xl bg-[#0F1219] border border-white/10 space-y-4 lg:col-span-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Live Processed Invoices</h2>
                <p className="text-xs text-[#8A94A8]">Most recent autonomous audit decisions</p>
              </div>
              <span className="text-xs text-[#64748B] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span>Live Feed</span>
              </span>
            </div>

            <div className="overflow-x-auto -mx-1 sm:mx-0">
              <table className="w-full text-left text-xs min-w-[560px]">
                <thead>
                  <tr className="border-b border-white/10 text-[#64748B] font-mono">
                    <th className="pb-3 font-normal">INVOICE & VENDOR</th>
                    <th className="pb-3 font-normal">AMOUNT</th>
                    <th className="pb-3 font-normal">STATUS</th>
                    <th className="pb-3 font-normal">RULE APPLIED</th>
                    <th className="pb-3 font-normal text-right">TIME</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3">
                        <div className="font-mono font-medium text-white">{inv.id}</div>
                        <div className="text-[11px] text-[#8A94A8]">{inv.vendor}</div>
                      </td>
                      <td className="py-3 font-mono font-bold text-white">{inv.amount}</td>
                      <td className="py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${inv.badgeColor}`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 text-[#94A3B8] text-[11px]">{inv.rule}</td>
                      <td className="py-3 font-mono text-[#64748B] text-right">{inv.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs text-[#64748B]">
              <span>Showing 5 of 14,820 today</span>
              <button
                onClick={onNavigateToReview}
                className="text-[#0078D4] hover:underline font-medium flex items-center gap-1"
              >
                <span>Open Exception Review Queue</span>
                <ArrowUpRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
