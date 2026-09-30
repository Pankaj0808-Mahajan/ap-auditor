/**
 * ProblemSection.tsx — "The Pile" Section
 *
 * Structure:
 *   ┌─ Section wrapper (scroll container) ─────────────────────────────┐
 *   │  ┌─ Sticky panel (holds the 3D canvas + headline) ─────────────┐ │
 *   │  │  - Big industrial headline copy                              │ │
 *   │  │  - ThePileScene canvas (R3F)                                │ │
 *   │  │  - HUD overlay: stats panel                                 │ │
 *   │  │  - Bottom: GSAP progress bar                                │ │
 *   │  └─────────────────────────────────────────────────────────────┘ │
 *   └────────────────────────────────────────────────────────────────────┘
 *
 * Scroll mechanics:
 *   - Section is 300vh tall
 *   - Sticky inner fills 100vh and stays fixed while section scrolls
 *   - GSAP ScrollTrigger on the section element drives progress 0→1
 *     as user scrolls through the extra 200vh
 *   - progress is stored in a MutableRefObject so R3F useFrame reads
 *     it every frame without React re-renders (perf-safe)
 */

import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ThePileScene } from '../scenes/ThePileScene';
import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, FileX2, GitMerge, TrendingUp, CheckSquare } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// ─── Stats shown in the HUD overlay ────────────────────────────────────────
const EXCEPTION_STATS: { label: string; value: string; color: string; icon: LucideIcon }[] = [
  { label: 'DUPLICATE INVOICES',  value: '23%',    color: '#D13438', icon: FileX2 },
  { label: 'PRICE VARIANCES',     value: '31%',    color: '#FFB900', icon: TrendingUp },
  { label: 'MISSING PO REFS',     value: '18%',    color: '#D13438', icon: AlertTriangle },
  { label: 'OVERPAYMENT RISK',    value: '$2.4M',  color: '#D13438', icon: GitMerge },
  { label: 'MANUAL REVIEW TIME',  value: '380 hrs/mo', color: '#FFB900', icon: CheckSquare },
];

// ─── Progress indicator pill ────────────────────────────────────────────────
interface ProgressPillProps {
  label: string;
  value: string;
  color: string;
  icon: LucideIcon;
}

function StatPill({ label, value, color, icon: Icon }: ProgressPillProps) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 bg-[#0A0A0C]/80 backdrop-blur-md border"
      style={{ borderColor: `${color}40` }}
    >
      {/* Color icon via wrapper span */}
      <span style={{ color, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <Icon size={12} />
      </span>
      <div>
        <div className="text-[9px] font-mono text-[#8A8F9E] uppercase tracking-wider leading-none">{label}</div>
        <div className="text-sm font-mono font-bold leading-tight" style={{ color }}>{value}</div>
      </div>
    </div>
  );
}

// ─── Phase label displayed at top of canvas ─────────────────────────────────
function PhaseLabel({ progress }: { progress: number }) {
  const isOrdered = progress > 0.85;
  const isMoving  = progress > 0.05 && !isOrdered;

  if (isOrdered) return (
    <div className="flex items-center gap-2 font-mono text-xs">
      <span className="w-2 h-2 bg-[#107C41] animate-pulse" />
      <span className="text-[#107C41] font-bold tracking-wider uppercase">RECONCILED // ORDER RESTORED</span>
    </div>
  );
  if (isMoving) return (
    <div className="flex items-center gap-2 font-mono text-xs">
      <span className="w-2 h-2 bg-[#0078D4] animate-pulse" />
      <span className="text-[#0078D4] font-bold tracking-wider uppercase">AI SORTING... CLASSIFYING EXCEPTIONS</span>
    </div>
  );
  return (
    <div className="flex items-center gap-2 font-mono text-xs">
      <span className="w-2 h-2 bg-[#D13438] animate-pulse" />
      <span className="text-[#D13438] font-bold tracking-wider uppercase">UNSTRUCTURED INVOICE PILE DETECTED</span>
    </div>
  );
}

// ─── Main exported section ───────────────────────────────────────────────────
export function ProblemSection() {
  const sectionRef  = useRef<HTMLDivElement>(null!);
  const progressRef = useRef<number>(0);
  const barRef      = useRef<HTMLDivElement>(null!);
  const countRef    = useRef<HTMLSpanElement>(null!);

  // For phase label re-renders (low-frequency)
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5,
        onUpdate: (self) => {
          // Write to ref every frame (no re-render — R3F reads this)
          progressRef.current = self.progress;

          // Update the progress bar DOM directly (no React state, no re-render)
          if (barRef.current) {
            barRef.current.style.width = `${self.progress * 100}%`;
          }
          if (countRef.current) {
            countRef.current.textContent = `${Math.round(self.progress * 100)}%`;
          }

          // Low-frequency phase label update
          setDisplayProgress(Math.round(self.progress * 100) / 100);
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    // ── Scroll container: 300vh so sticky content has 200vh to play with ──
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: '300vh' }}
      aria-label="The Problem — unstructured invoice pile"
    >
      {/* ── Sticky viewport ── */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#0A0A0C]">

        {/* Subtle noise texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: '256px 256px',
          }}
        />

        {/* Grid lines backdrop */}
        <div
          className="absolute inset-0 pointer-events-none z-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,120,212,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,120,212,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        {/* ── Content grid: left copy | right canvas ── */}
        <div className="relative z-10 h-full flex flex-col">

          {/* ── Top strip: section ID + phase label ── */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#0E0F14]/60 backdrop-blur-sm">
            <div className="flex items-center gap-3 font-mono text-[10px] text-[#575C6C] uppercase tracking-widest">
              <span className="text-[#0078D4] font-bold">[SEC-02]</span>
              <span>PROBLEM STATEMENT // THE PILE</span>
              <span className="text-[#8A8F9E]">AP-AUDITOR v1.0</span>
            </div>
            <PhaseLabel progress={displayProgress} />
          </div>

          {/* ── Main content area ── */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

            {/* ── LEFT: Copy panel ── */}
            <div className="w-full lg:w-[340px] xl:w-[380px] flex-shrink-0 flex flex-col justify-between p-6 lg:p-8 border-r border-white/5">

              {/* Headline block */}
              <div className="space-y-5">
                {/* Section badge */}
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest">
                  <span className="w-2.5 h-2.5 bg-[#D13438] animate-pulse flex-shrink-0" />
                  <span className="text-[#D13438] font-bold">EXCEPTION ALERT</span>
                  <span className="text-[#575C6C]">{'//'} 18 UNPROCESSED</span>
                </div>

                {/* Main headline */}
                <div>
                  <h2
                    className="text-3xl xl:text-4xl font-black uppercase leading-[1.05] tracking-tight text-white"
                    style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
                  >
                    YOUR AP TEAM
                    <br />
                    <span
                      className="relative inline-block"
                      style={{
                        color: '#D13438',
                        textShadow: '0 0 30px rgba(209,52,56,0.4)',
                      }}
                    >
                      DROWNS IN
                    </span>
                    <br />
                    THE PILE.
                  </h2>
                </div>

                {/* Sub-copy */}
                <p className="text-sm text-[#A2A7B5] leading-relaxed max-w-xs">
                  Thousands of invoices arrive unstructured—from 40+ vendors, in
                  mismatched formats, with no machine-readable metadata. Your team
                  manually reviews each one. Exceptions hide in the noise.
                </p>

                {/* Problem callouts */}
                <div className="space-y-2">
                  {[
                    { label: 'No automated 3-way match',       color: '#D13438' },
                    { label: 'Duplicate payments go undetected', color: '#D13438' },
                    { label: '$2.4M+ in annual overpayment risk', color: '#FFB900' },
                    { label: '380+ manual review hours/month',  color: '#FFB900' },
                  ].map(({ label, color }) => (
                    <div key={label} className="flex items-start gap-2.5">
                      <span
                        className="mt-1.5 w-1.5 h-1.5 flex-shrink-0"
                        style={{ background: color }}
                      />
                      <span className="text-xs text-[#C4C9D8] leading-relaxed font-mono">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Scroll instruction */}
                <div className="pt-2 border-t border-white/5">
                  <p className="text-[10px] font-mono text-[#575C6C] uppercase tracking-wider">
                    ↓ SCROLL TO SEE AP-AUDITOR SORT THE CHAOS
                  </p>
                </div>
              </div>

              {/* Exception stats grid */}
              <div className="mt-auto pt-4 grid grid-cols-1 gap-2">
                {EXCEPTION_STATS.map((stat) => (
                  <StatPill key={stat.label} {...stat} />
                ))}
              </div>
            </div>

            {/* ── RIGHT: 3D Canvas ── */}
            <div className="flex-1 relative overflow-hidden">

              {/* Corner bracket decorations */}
              <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-[#0078D4]/60 z-20 pointer-events-none" />
              <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-[#0078D4]/60 z-20 pointer-events-none" />
              <div className="absolute bottom-12 left-3 w-5 h-5 border-b-2 border-l-2 border-[#0078D4]/60 z-20 pointer-events-none" />
              <div className="absolute bottom-12 right-3 w-5 h-5 border-b-2 border-r-2 border-[#0078D4]/60 z-20 pointer-events-none" />

              {/* Canvas */}
              <div className="absolute inset-0">
                <ThePileScene progressRef={progressRef} />
              </div>

              {/* HUD overlay: top-right card count */}
              <div className="absolute top-4 right-4 z-20 font-mono">
                <div className="px-3 py-2 bg-[#0A0A0C]/80 backdrop-blur-md border border-white/10 text-right">
                  <div className="text-[9px] text-[#575C6C] uppercase tracking-wider">INVOICE CARDS</div>
                  <div className="text-xl font-black text-white">18</div>
                  <div className="text-[9px] text-[#D13438] uppercase tracking-wider">UNPROCESSED</div>
                </div>
              </div>

              {/* HUD overlay: bottom-left legend */}
              <div className="absolute bottom-12 left-4 z-20 flex flex-col gap-1.5 font-mono">
                {[
                  { color: '#D13438', label: 'DUPLICATE / MISSING-PO / OVERPAY' },
                  { color: '#FFB900', label: 'PRICE VARIANCE' },
                  { color: '#107C41', label: 'MATCHED — CLEAN' },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="w-2.5 h-1.5 flex-shrink-0" style={{ background: color }} />
                    <span className="text-[9px] text-[#8A8F9E] uppercase tracking-wider">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Bottom progress bar strip ── */}
          <div className="flex-shrink-0 h-9 flex items-center gap-4 px-6 border-t border-white/5 bg-[#0E0F14]/60 backdrop-blur-sm">
            <span className="font-mono text-[9px] text-[#575C6C] uppercase tracking-widest w-28 flex-shrink-0">
              SORT PROGRESS
            </span>
            <div className="flex-1 h-1 bg-[#1A1B22] relative overflow-hidden">
              {/* Animated progress bar — written to directly via DOM ref */}
              <div
                ref={barRef}
                className="h-full transition-none"
                style={{
                  width: '0%',
                  background: 'linear-gradient(90deg, #0078D4 0%, #107C41 100%)',
                  boxShadow: '0 0 8px rgba(0,120,212,0.6)',
                }}
              />
            </div>
            <span
              ref={countRef}
              className="font-mono text-xs font-bold text-[#0078D4] w-10 text-right flex-shrink-0"
            >
              0%
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
