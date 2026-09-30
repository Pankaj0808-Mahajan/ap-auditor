/**
 * SortingFunnelSection.tsx — Section 4: "The Sorting Funnel"
 *
 * Mechanical Sorting Funnel:
 * - Invoice enters top, passes through optical decision throat.
 * - Diverter splits into two chutes:
 *     - Green 'Auto-Pass' straight down to collection bin.
 *     - Amber 'Human Review' angled chute to illuminated tray icon & review tray.
 *
 * Layout:
 *   ┌─ Header strip (SEC-04 breadcrumb, mode switcher, live phase badge) ────┐
 *   │  ┌─ 3D Canvas (center, large) ─┐  ┌─ Right telemetry panel ──────────┐│
 *   │  │  Funnel + chutes + bins      │  │  - Routing metrics (counters)    ││
 *   │  │  + animated invoice card     │  │  - Decision criteria             ││
 *   │  │  + Tray Icon & badges        │  │  - Live routing event log        ││
 *   │  └─────────────────────────────┘  └──────────────────────────────────┘│
 *   │  ┌─ Bottom strip: cycle timeline bar + phase markers ────────────────┘│
 *   └────────────────────────────────────────────────────────────────────────┘
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import {
  SortingFunnelSceneContent,
  T_TOTAL,
  T_DROP_END,
  T_DECIDE_END,
  T_ROUTE_END,
  T_LAND_END,
  getPhase,
  type SortPhase,
} from '../scenes/SortingFunnelScene';
import {
  CheckCircle,
  AlertTriangle,
  GitBranch,
  ChevronRight,
  Inbox,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

// ─── Phase badge styles ───────────────────────────────────────────────────────
const PHASE_STYLES: Record<SortPhase, { color: string; bg: string; label: string }> = {
  DROPPING: { color: '#0078D4', bg: '#0078D420', label: 'INVOICE ENTERING FUNNEL' },
  DECIDING: { color: '#0078D4', bg: '#0078D420', label: 'OPTICAL SCANNER ACTIVE' },
  ROUTING:  { color: '#FFB900', bg: '#FFB90020', label: 'DIVERTER SPLITTING CHUTE' },
  LANDING:  { color: '#107C41', bg: '#107C4120', label: 'DELIVERED TO CONTAINER' },
  RESET:    { color: '#575C6C', bg: '#575C6C20', label: 'PREPARING NEXT INVOICE' },
};

// ─── Log entry type ───────────────────────────────────────────────────────────
interface LogEntry {
  ts: string;
  text: string;
  color: string;
  icon: 'pass' | 'review' | 'info';
}

type RouteMode = 'auto' | 'pass' | 'review';

export function SortingFunnelSection() {
  const timeRef      = useRef<number>(0);
  const outcomeRef   = useRef<'pass' | 'review'>('pass');
  const cycleRef     = useRef<number>(0);
  const rafRef       = useRef<number>(0);
  const lastTsRef    = useRef<number>(0);
  const prevPhaseRef = useRef<SortPhase>('RESET');
  const modeRef      = useRef<RouteMode>('auto');
  const speedRef     = useRef<number>(1.0);

  // UI state
  const [phase,       setPhase]       = useState<SortPhase>('DROPPING');
  const [progress,    setProgress]    = useState(0);
  const [outcome,     setOutcome]     = useState<'pass' | 'review'>('pass');
  const [passCount,   setPassCount]   = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [routeLog,    setRouteLog]    = useState<LogEntry[]>([]);
  const [isPlaying,   setIsPlaying]   = useState(true);
  const [mode,        setMode]        = useState<RouteMode>('auto');
  const [speed,       setSpeed]       = useState<number>(1.0);

  const logRef = useRef<HTMLDivElement>(null!);

  // Sync mode changes to ref
  const handleModeChange = (newMode: RouteMode) => {
    modeRef.current = newMode;
    setMode(newMode);
    if (newMode === 'pass') {
      outcomeRef.current = 'pass';
      setOutcome('pass');
    } else if (newMode === 'review') {
      outcomeRef.current = 'review';
      setOutcome('review');
    }
  };

  // Sync speed changes
  const handleSpeedChange = (newSpeed: number) => {
    speedRef.current = newSpeed;
    setSpeed(newSpeed);
  };

  // Reset counters & cycle
  const handleReset = () => {
    timeRef.current = 0;
    cycleRef.current = 0;
    setPassCount(0);
    setReviewCount(0);
    setRouteLog([]);
    prevPhaseRef.current = 'RESET';
    setPhase('DROPPING');
  };

  // ── rAF loop ──────────────────────────────────────────────────────────────
  const tick = useCallback((ts: number) => {
    if (lastTsRef.current === 0) lastTsRef.current = ts;
    const dt = Math.min((ts - lastTsRef.current) / 1000, 0.05) * speedRef.current;
    lastTsRef.current = ts;

    const prevT = timeRef.current;
    timeRef.current = (timeRef.current + dt) % T_TOTAL;
    const t = timeRef.current;

    // Detect cycle wrap
    if (t < prevT) {
      cycleRef.current += 1;
      if (modeRef.current === 'auto') {
        // Alternate outcome each cycle
        outcomeRef.current = cycleRef.current % 2 === 0 ? 'pass' : 'review';
      } else {
        outcomeRef.current = modeRef.current;
      }
    }

    setProgress(t / T_TOTAL);
    setOutcome(outcomeRef.current);

    const newPhase = getPhase(t);
    if (newPhase !== prevPhaseRef.current) {
      prevPhaseRef.current = newPhase;
      setPhase(newPhase);

      const now = new Date().toTimeString().split(' ')[0];
      const style = PHASE_STYLES[newPhase];

      // Add routing event to live log
      let logText = style.label;
      if (newPhase === 'ROUTING') {
        logText = outcomeRef.current === 'pass'
          ? 'AUTO-PASS: CHUTE DIVERTER CLEARED [STRAIGHT DOWN]'
          : 'HUMAN REVIEW: DIVERTER DEFLECTING [ANGLED TO TRAY]';
      } else if (newPhase === 'LANDING') {
        logText = outcomeRef.current === 'pass'
          ? 'INVOICE RECEIVED IN AUTO-PASS BIN'
          : 'INVOICE STORED IN HUMAN REVIEW TRAY';
      }

      setRouteLog(log => [
        {
          ts: now,
          text: logText,
          color: style.color,
          icon: newPhase === 'LANDING'
            ? (outcomeRef.current === 'pass' ? 'pass' : 'review')
            : 'info',
        },
        ...log.slice(0, 14),
      ]);

      // Update counters on LANDING
      if (newPhase === 'LANDING') {
        if (outcomeRef.current === 'pass') {
          setPassCount(c => c + 1);
        } else {
          setReviewCount(c => c + 1);
        }
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      lastTsRef.current = 0;
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, tick]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 0;
  }, [routeLog]);

  const phaseStyle = PHASE_STYLES[phase];

  return (
    <section
      className="relative flex flex-col bg-[#0A0A0C]"
      style={{ height: 'calc(100vh - 110px)', minHeight: 650 }}
      aria-label="Mechanical Funnel — Auto-Pass straight down, Human Review angled to tray icon"
    >
      {/* ── Background Grid & Noise ── */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
        }}
      />

      {/* ── Top Header Strip ── */}
      <div className="flex-shrink-0 flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 border-b border-white/10 bg-[#0E0F14]/85 backdrop-blur-md z-10">
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest">
          <span className="text-[#0078D4] font-bold">[SEC-04]</span>
          <span className="text-white font-bold">MECHANICAL FUNNEL</span>
          <span className="text-[#575C6C]">{'//'}</span>
          <span className="text-[#8A8F9E]">DUAL-CHUTE DIVERTER</span>
        </div>

        {/* Route Mode Switcher & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Selector */}
          <div className="flex items-center bg-[#07080B] p-0.5 border border-white/10 font-mono text-[9px]">
            <button
              onClick={() => handleModeChange('auto')}
              className={`px-2.5 py-1 uppercase tracking-wider transition-colors ${
                mode === 'auto'
                  ? 'bg-[#0078D4] text-white font-bold'
                  : 'text-[#8A8F9E] hover:text-white'
              }`}
            >
              AUTO-CYCLE
            </button>
            <button
              onClick={() => handleModeChange('pass')}
              className={`px-2.5 py-1 uppercase tracking-wider transition-colors flex items-center gap-1 ${
                mode === 'pass'
                  ? 'bg-[#107C41] text-white font-bold'
                  : 'text-[#8A8F9E] hover:text-[#107C41]'
              }`}
            >
              <CheckCircle size={10} />
              FORCE AUTO-PASS
            </button>
            <button
              onClick={() => handleModeChange('review')}
              className={`px-2.5 py-1 uppercase tracking-wider transition-colors flex items-center gap-1 ${
                mode === 'review'
                  ? 'bg-[#FFB900] text-black font-bold'
                  : 'text-[#8A8F9E] hover:text-[#FFB900]'
              }`}
            >
              <AlertTriangle size={10} />
              FORCE HUMAN REVIEW
            </button>
          </div>

          {/* Speed Selector */}
          <div className="hidden sm:flex items-center bg-[#07080B] p-0.5 border border-white/10 font-mono text-[9px]">
            {[0.5, 1.0, 2.0].map(s => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                className={`px-2 py-0.5 uppercase ${
                  speed === s ? 'bg-white/20 text-white font-bold' : 'text-[#8A8F9E] hover:text-white'
                }`}
              >
                {s}X
              </button>
            ))}
          </div>

          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(p => !p)}
            className="flex items-center gap-1 px-2.5 py-1 font-mono text-[10px] border border-white/10 text-[#8A8F9E] hover:border-[#0078D4]/60 hover:text-[#0078D4] transition-colors uppercase tracking-wider"
          >
            {isPlaying ? <Pause size={10} /> : <Play size={10} />}
            <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            title="Reset simulation cycle"
            className="p-1 font-mono text-[10px] border border-white/10 text-[#8A8F9E] hover:text-white transition-colors"
          >
            <RotateCcw size={12} />
          </button>

          {/* Live Phase Badge */}
          <div
            className="flex items-center gap-1.5 px-3 py-1 font-mono text-[10px] font-bold uppercase border"
            style={{ color: phaseStyle.color, background: phaseStyle.bg, borderColor: `${phaseStyle.color}50` }}
          >
            <span
              className="w-1.5 h-1.5 flex-shrink-0"
              style={{
                background: phaseStyle.color,
                animation: phase === 'DECIDING' ? 'pulse 0.7s infinite' : undefined,
              }}
            />
            {phaseStyle.label}
          </div>
        </div>
      </div>

      {/* ── Main Workspace ── */}
      <div className="flex-1 flex overflow-hidden z-10">

        {/* ── 3D Viewport ── */}
        <div className="flex-1 relative overflow-hidden">
          {/* Blueprint Grid Lines */}
          <div
            className="absolute inset-0 pointer-events-none z-0 opacity-[0.025]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,120,212,0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,120,212,0.5) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />

          {/* Corner Precision CAD Brackets */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#0078D4]/50 z-20 pointer-events-none" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#0078D4]/50 z-20 pointer-events-none" />
          <div className="absolute bottom-10 left-3 w-4 h-4 border-b-2 border-l-2 border-[#0078D4]/50 z-20 pointer-events-none" />
          <div className="absolute bottom-10 right-3 w-4 h-4 border-b-2 border-r-2 border-[#0078D4]/50 z-20 pointer-events-none" />

          {/* Central Vertical Alignment Guide Line */}
          <div className="absolute top-0 left-1/2 w-px h-full bg-[#0078D4]/10 pointer-events-none z-20" />

          {/* 3D Canvas */}
          <Canvas
            shadows
            camera={{ position: [0, -0.2, 13.8], fov: 44 }}
            gl={{
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.15,
            }}
            style={{ background: 'transparent' }}
          >
            <SortingFunnelSceneContent
              timeRef={timeRef}
              outcomeRef={outcomeRef}
              cycleRef={cycleRef}
            />
          </Canvas>

          {/* Top-Left: Operational Label */}
          <div className="absolute top-4 left-4 z-20 pointer-events-none">
            <div className="px-3.5 py-2 bg-[#0A0A0C]/85 backdrop-blur-md border border-white/10 shadow-lg">
              <div className="text-[8px] font-mono text-[#575C6C] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={10} className="text-[#0078D4]" />
                AUTONOMOUS AP SORTING ENGINE
              </div>
              <div className="text-xs font-mono font-bold text-white mt-0.5">
                MECHANICAL FUNNEL // DUAL CHUTE
              </div>
              <div className="text-[10px] font-mono text-[#8A8F9E] mt-0.5">
                Green: Auto-Pass (Straight Down) • Amber: Review (Angled to Tray)
              </div>
            </div>
          </div>

          {/* Top-Right: Live Route Indicator */}
          <div className="absolute top-4 right-4 z-20 font-mono text-right space-y-1.5 pointer-events-none">
            <div className="px-3 py-1.5 bg-[#0A0A0C]/85 backdrop-blur-md border border-white/10">
              <div className="text-[8px] text-[#575C6C] uppercase tracking-wider">CYCLE NO.</div>
              <div className="text-xs font-bold text-white">#{cycleRef.current + 1}</div>
            </div>
            <div className="px-3 py-1.5 bg-[#0A0A0C]/85 backdrop-blur-md border border-white/10">
              <div className="text-[8px] text-[#575C6C] uppercase tracking-wider">PROJECTED ROUTE</div>
              <div
                className="text-xs font-bold flex items-center justify-end gap-1.5"
                style={{ color: outcome === 'pass' ? '#107C41' : '#FFB900' }}
              >
                {outcome === 'pass' ? (
                  <>
                    <CheckCircle size={12} />
                    <span>AUTO-PASS ▼</span>
                  </>
                ) : (
                  <>
                    <Inbox size={12} />
                    <span>HUMAN REVIEW ◢</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bottom-Left: Interactive Route Legend */}
          <div className="absolute bottom-10 left-4 z-20 font-mono space-y-1.5 bg-[#0A0A0C]/80 backdrop-blur-md p-2.5 border border-white/10">
            <div className="text-[8px] text-[#575C6C] uppercase tracking-wider font-bold mb-1">
              CHUTE ARCHITECTURE
            </div>
            {[
              {
                color: '#107C41',
                label: "AUTO-PASS: STRAIGHT DOWN",
                desc: "3-way matched, zero-variance (x=0)",
              },
              {
                color: '#FFB900',
                label: "HUMAN REVIEW: ANGLED TO TRAY",
                desc: "Tolerance exception, diverted to tray icon",
              },
              {
                color: '#0078D4',
                label: "MECHANICAL FUNNEL THROAT",
                desc: "Optical inspection & diverter flap",
              },
            ].map(({ color, label, desc }) => (
              <div key={label} className="flex items-start gap-2">
                <span
                  className="w-2 h-2 mt-0.5 flex-shrink-0"
                  style={{ background: color, boxShadow: `0 0 6px ${color}80` }}
                />
                <div>
                  <div className="text-[9px] font-bold" style={{ color }}>{label}</div>
                  <div className="text-[8px] text-[#6E7382]">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Telemetry Panel ── */}
        <div className="w-80 flex-shrink-0 flex flex-col border-l border-white/10 bg-[#0A0A0C]/70 backdrop-blur-md">

          {/* Metric Stats */}
          <div className="p-4 border-b border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[#0078D4]"><GitBranch size={14} /></span>
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-white">
                  ROUTING METRICS
                </span>
              </div>
              <span className="text-[9px] font-mono text-[#8A8F9E] bg-white/5 px-1.5 py-0.5 border border-white/10">
                ACTIVE
              </span>
            </div>

            {/* Side-by-side Counters */}
            <div className="grid grid-cols-2 gap-2">
              {/* Auto-pass counter */}
              <div className="p-3 border border-[#107C41]/40 bg-[#107C41]/10">
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle size={12} className="text-[#107C41]" />
                  <span className="font-mono text-[8px] text-[#107C41] uppercase tracking-wider font-bold">
                    AUTO-PASS
                  </span>
                </div>
                <div className="font-mono text-2xl font-bold text-[#107C41]">{passCount}</div>
                <div className="text-[8px] font-mono text-[#8A8F9E] mt-0.5">Straight Down</div>
              </div>

              {/* Review counter */}
              <div className="p-3 border border-[#FFB900]/40 bg-[#FFB900]/10">
                <div className="flex items-center gap-1.5 mb-1">
                  <Inbox size={12} className="text-[#FFB900]" />
                  <span className="font-mono text-[8px] text-[#FFB900] uppercase tracking-wider font-bold">
                    REVIEW TRAY
                  </span>
                </div>
                <div className="font-mono text-2xl font-bold text-[#FFB900]">{reviewCount}</div>
                <div className="text-[8px] font-mono text-[#8A8F9E] mt-0.5">Angled Chute</div>
              </div>
            </div>

            {/* Straight Auto-Pass Ratio */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between font-mono text-[9px]">
                <span className="text-[#8A8F9E] uppercase tracking-wider">AUTO-PASS EFFICIENCY</span>
                <span className="text-white font-bold">
                  {passCount + reviewCount > 0
                    ? `${Math.round((passCount / (passCount + reviewCount)) * 100)}%`
                    : '100%'}
                </span>
              </div>
              <div className="h-1.5 bg-[#141620] overflow-hidden border border-white/5">
                <div
                  className="h-full bg-[#107C41] transition-all duration-300 shadow-[0_0_8px_#107C41]"
                  style={{
                    width: passCount + reviewCount > 0
                      ? `${(passCount / (passCount + reviewCount)) * 100}%`
                      : '100%',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Decision Criteria Block */}
          <div className="p-4 border-b border-white/10 space-y-2">
            <div className="font-mono text-[9px] text-[#575C6C] uppercase tracking-wider mb-2 font-bold">
              SORTING SPECIFICATIONS
            </div>
            {[
              { rule: 'PRIMARY SPLIT', desc: 'Auto-Pass: Straight • Review: Angled', color: '#0078D4' },
              { rule: 'MATCH TOLERANCE', desc: '≤ 1.5% PO Price Variance', color: '#107C41' },
              { rule: 'GSTIN STATUS', desc: 'Active & Verified against DB', color: '#107C41' },
              { rule: 'TRAY ROUTE TRIGGER', desc: 'Unregistered Vendor or Line Mismatch', color: '#FFB900' },
            ].map(({ rule, desc, color }) => (
              <div key={rule} className="p-1.5 bg-black/40 border border-white/5 text-[9px] font-mono">
                <div className="flex items-center justify-between text-[8px] uppercase tracking-wider" style={{ color }}>
                  <span>{rule}</span>
                  <span className="w-1.5 h-1.5" style={{ background: color }} />
                </div>
                <div className="text-[#A2A7B5] text-[9px] mt-0.5">{desc}</div>
              </div>
            ))}
          </div>

          {/* Real-Time Live Routing Log */}
          <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[9px] text-[#575C6C] uppercase tracking-wider font-bold">
                MECHANICAL CHUTE LOG
              </span>
              <span className="font-mono text-[8px] text-[#0078D4] animate-pulse">● LIVE</span>
            </div>
            <div ref={logRef} className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {routeLog.length === 0 ? (
                <div className="font-mono text-[9px] text-[#4A4E5C] italic py-4 text-center">
                  Feed active. Awaiting invoice drop...
                </div>
              ) : (
                routeLog.map((entry, i) => (
                  <div key={i} className="flex items-start gap-2 bg-black/30 p-1.5 border border-white/5">
                    <span className="font-mono text-[8px] text-[#4F5566] flex-shrink-0 mt-0.5">
                      {entry.ts}
                    </span>
                    {entry.icon === 'pass' && (
                      <CheckCircle size={10} className="text-[#107C41] flex-shrink-0 mt-0.5" />
                    )}
                    {entry.icon === 'review' && (
                      <AlertTriangle size={10} className="text-[#FFB900] flex-shrink-0 mt-0.5" />
                    )}
                    {entry.icon === 'info' && (
                      <ChevronRight size={10} className="text-[#575C6C] flex-shrink-0 mt-0.5" />
                    )}
                    <span className="font-mono text-[9px] leading-tight" style={{ color: entry.color }}>
                      {entry.text}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Timeline Bar ── */}
      <div className="flex-shrink-0 h-8 flex items-center gap-4 px-5 border-t border-white/10 bg-[#0E0F14]/90 backdrop-blur-md z-10">
        <span className="font-mono text-[9px] text-[#575C6C] uppercase tracking-widest w-28 flex-shrink-0">
          TIMELINE
        </span>

        {/* Phase Timeline Track */}
        <div className="flex-1 relative h-1.5 bg-[#141620] overflow-hidden border border-white/5">
          {/* Dropping segment */}
          <div
            className="absolute inset-y-0 left-0 bg-[#0078D4]"
            style={{ width: `${(T_DROP_END / T_TOTAL) * 100}%`, opacity: 0.35 }}
          />
          {/* Deciding segment */}
          <div
            className="absolute inset-y-0 bg-[#0078D4]"
            style={{
              left: `${(T_DROP_END / T_TOTAL) * 100}%`,
              width: `${((T_DECIDE_END - T_DROP_END) / T_TOTAL) * 100}%`,
              opacity: 0.65,
            }}
          />
          {/* Routing segment */}
          <div
            className="absolute inset-y-0"
            style={{
              left: `${(T_DECIDE_END / T_TOTAL) * 100}%`,
              width: `${((T_ROUTE_END - T_DECIDE_END) / T_TOTAL) * 100}%`,
              backgroundColor: outcome === 'pass' ? '#107C41' : '#FFB900',
              opacity: 0.45,
            }}
          />
          {/* Landing segment */}
          <div
            className="absolute inset-y-0"
            style={{
              left: `${(T_ROUTE_END / T_TOTAL) * 100}%`,
              width: `${((T_LAND_END - T_ROUTE_END) / T_TOTAL) * 100}%`,
              backgroundColor: outcome === 'pass' ? '#107C41' : '#FFB900',
              opacity: 0.75,
            }}
          />

          {/* Current playhead */}
          <div
            className="absolute top-0 h-full w-1 bg-white shadow-[0_0_8px_white]"
            style={{ left: `${progress * 100}%`, transition: 'left 80ms linear' }}
          />
        </div>

        {/* Phase labels */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {(['DROPPING', 'DECIDING', 'ROUTING', 'LANDING'] as SortPhase[]).map(p => (
            <span
              key={p}
              className="font-mono text-[8px] uppercase tracking-wider"
              style={{
                color: phase === p ? PHASE_STYLES[p].color : '#4A4E5C',
                fontWeight: phase === p ? 700 : 400,
              }}
            >
              {p}
            </span>
          ))}
        </div>

        <span className="font-mono text-[10px] text-[#0078D4] font-bold flex-shrink-0 w-10 text-right">
          {Math.round(progress * 100)}%
        </span>
      </div>
    </section>
  );
}
