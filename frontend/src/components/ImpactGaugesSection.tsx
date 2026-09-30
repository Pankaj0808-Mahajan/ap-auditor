/**
 * ImpactGaugesSection.tsx — Section 6: "The Impact Gauges"
 *
 * "Build 2-3 circular dial/gauge meters, needle animates 0 to value on scroll into view.
 * Metrics: 92% Auto-Passed, 96% Duplicates Caught, 40% Faster Review."
 *
 * Key features:
 * - 3 circular dial/gauge meters with authentic mechanical styling:
 *     1) 92% Auto-Passed (Emerald #107C41)
 *     2) 96% Duplicates Caught (Amber #FFB900)
 *     3) 40% Faster Review (Azure #0078D4)
 * - Needle animates from 0 to target value on scroll into view using IntersectionObserver.
 * - Digital counters synchronize count-up with mechanical needle sweep.
 * - Interactive "SWEEP GAUGES" trigger button to replay the mechanical needle action.
 * - Detailed benchmark cards and enterprise AP ROI comparison breakdowns.
 */

import React, { useRef, useEffect, useState } from 'react';
import { IndustrialCircularGauge } from './IndustrialCircularGauge';
import {
  Activity,
  CheckCircle2,
  TrendingUp,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

export function ImpactGaugesSection() {
  const [isTriggered, setIsTriggered] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null!);

  // IntersectionObserver to animate needle 0 to value on scroll into view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsTriggered(true);
          }
        });
      },
      {
        threshold: 0.25,
        rootMargin: '0px 0px -10% 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Re-trigger needle animation (test sweep)
  const handleReSweep = () => {
    setIsTriggered(false);
    setTimeout(() => {
      setIsTriggered(true);
    }, 120);
  };

  return (
    <section
      ref={sectionRef}
      className="relative flex flex-col bg-[#0A0A0C] min-h-screen text-[#E6E8EE] selection:bg-[#0078D4]/40"
      aria-label="Section 6: Impact Gauges — AP Auditor Performance Metrics"
    >
      {/* ── Background Blueprint Grid & Noise ── */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,120,212,0.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,120,212,0.6) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* ── Top Header Strip ── */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-4 px-5 py-3 border-b border-white/10 bg-[#0E0F14]/90 backdrop-blur-xl">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-[#0078D4]/20 border border-[#0078D4] text-[#0078D4]">
            <Activity size={18} />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest">
              <span className="text-[#0078D4] font-bold">[SEC-06]</span>
              <span className="text-white font-bold">PERFORMANCE GAUGES</span>
              <span className="text-[#575C6C]">{'//'}</span>
              <span className="text-[#8A8F9E]">MEASUREMENT CLUSTER</span>
            </div>
            <div className="text-[10px] font-mono text-[#8A8F9E]">
              Mechanical tachometer dial cluster • Needle sweeps from 0 to value on scroll.
            </div>
          </div>
        </div>

        {/* Status Readout & Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 font-mono text-[10px] border border-white/10 bg-black/40">
            <span
              className="w-2 h-2 transition-colors"
              style={{
                background: isTriggered ? '#107C41' : '#FFB900',
                boxShadow: isTriggered ? '0 0 8px #107C41' : 'none',
              }}
            />
            <span className="text-[#A2A7B5]">
              {isTriggered ? 'INSTRUMENT GAUGES ACTIVE' : 'AWAITING SCROLL ACTIVATION'}
            </span>
          </div>

          {/* Test Needle Sweep Button */}
          <button
            onClick={handleReSweep}
            className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] font-bold border border-white/15 bg-white/5 hover:border-[#0078D4] hover:text-[#0078D4] transition-colors uppercase tracking-wider"
          >
            <RotateCcw size={12} />
            <span>RE-SWEEP NEEDLES</span>
          </button>
        </div>
      </div>

      {/* ── Main Content Container ── */}
      <div className="max-w-7xl w-full mx-auto px-4 py-8 z-10 space-y-8 text-left">

        {/* Section Headline Banner */}
        <div className="p-6 bg-[#0E0F14]/80 backdrop-blur-md border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Cpu size={120} />
          </div>

          <div className="max-w-3xl space-y-2">
            <div className="flex items-center gap-2 font-mono text-xs text-[#0078D4] font-bold uppercase tracking-wider">
              <Sparkles size={13} />
              <span>AUTONOMOUS AP RECONCILIATION BENCHMARKS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight leading-none">
              ENTERPRISE EFFICIENCY INSTRUMENT CLUSTER
            </h2>
            <p className="text-xs text-[#A2A7B5] leading-relaxed">
              Real-time calibrated dial telemetry across enterprise accounts payable pipelines.
              Each gauge features an authentic mechanical needle indicating calibrated throughput,
              fraud prevention, and triage cycle velocity improvements over legacy ERP workflows.
            </p>
          </div>
        </div>

        {/* ── THE 3 CIRCULAR GAUGE METERS ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* GAUGE 1: 92% Auto-Passed */}
          <IndustrialCircularGauge
            label="AUTO-PASS RECONCILIATION"
            sublabel="Zero-Touch Straight-Through Invoices"
            value={92}
            unit="%"
            color="#107C41"
            technicalCode="GAUGE-AP-01"
            targetTolerance="BENCHMARK: ≥ 90%"
            description="92% of compliant invoices bypass manual human touchpoints, clearing automated 3-way line item and GSTIN validations straight to payment execution."
            isTriggered={isTriggered}
          />

          {/* GAUGE 2: 96% Duplicates Caught */}
          <IndustrialCircularGauge
            label="DUPLICATE INVOICES INTERCEPTED"
            sublabel="Fuzzy Hash & Conflict Prevention"
            value={96}
            unit="%"
            color="#FFB900"
            technicalCode="GAUGE-DP-02"
            targetTolerance="SHIELD: ≥ 95%"
            description="96% of duplicate submissions, revised unit price alterations, and multi-vendor re-billings are quarantined before disbursement."
            isTriggered={isTriggered}
          />

          {/* GAUGE 3: 40% Faster Review */}
          <IndustrialCircularGauge
            label="REVIEW VELOCITY GAIN"
            sublabel="AP Human Triage Latency Reduction"
            value={40}
            unit="%"
            color="#0078D4"
            technicalCode="GAUGE-RV-03"
            targetTolerance="SPEEDUP: 1.67x"
            description="40% monthly cycle time reduction on flagged exceptions via pre-highlighted machine-vision HUD overlays and automated variance summaries."
            isTriggered={isTriggered}
          />
        </div>

        {/* ── Sub-Panels: Impact Breakdown & ERP Evidence ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          {/* Card 1 */}
          <div className="p-4 bg-[#0E0F14]/70 border border-[#107C41]/30 space-y-2">
            <div className="flex items-center justify-between text-[#107C41] font-bold text-[11px] uppercase">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} />
                <span>STRAIGHT-THROUGH FLOW</span>
              </span>
              <span>92% RATIO</span>
            </div>
            <div className="text-[11px] text-[#A2A7B5] leading-relaxed">
              Standard ERP systems require 100% human touch. AP-Auditor isolates the 8% non-compliant transactions, letting 92% stream autonomously.
            </div>
            <div className="pt-2 border-t border-white/5 flex justify-between text-[9px] text-[#575C6C]">
              <span>SAMPLE SIZE: 124,000 INV</span>
              <span className="text-[#107C41]">SAVINGS: $410K/YR</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-4 bg-[#0E0F14]/70 border border-[#FFB900]/30 space-y-2">
            <div className="flex items-center justify-between text-[#FFB900] font-bold text-[11px] uppercase">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={13} />
                <span>FRAUD & DUPLICATE SHIELD</span>
              </span>
              <span>96% CAPTURE</span>
            </div>
            <div className="text-[11px] text-[#A2A7B5] leading-relaxed">
              Prevents double payments caused by simultaneous vendor email drops and ERP portal re-entries using cryptographic SHA-256 and fuzzy matching.
            </div>
            <div className="pt-2 border-t border-white/5 flex justify-between text-[9px] text-[#575C6C]">
              <span>AVERTED OVERPAYMENTS</span>
              <span className="text-[#FFB900]">$2.4M RECOVERED</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-4 bg-[#0E0F14]/70 border border-[#0078D4]/30 space-y-2">
            <div className="flex items-center justify-between text-[#0078D4] font-bold text-[11px] uppercase">
              <span className="flex items-center gap-1.5">
                <TrendingUp size={13} />
                <span>TRIAGE ACCELERATION</span>
              </span>
              <span>40% FASTER</span>
            </div>
            <div className="text-[11px] text-[#A2A7B5] leading-relaxed">
              Exception resolution window dropped from 14.2 days to 8.5 days per invoice batch. AP teams focus purely on high-dollar vendor negotiations.
            </div>
            <div className="pt-2 border-t border-white/5 flex justify-between text-[9px] text-[#575C6C]">
              <span>HOURS SAVED / MO</span>
              <span className="text-[#0078D4]">380 HRS/MO</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
