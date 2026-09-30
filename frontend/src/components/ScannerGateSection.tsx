/**
 * ScannerGateSection.tsx — Section 3: "The Scanner Gate"
 *
 * Layout:
 *   ┌─ Header strip (SEC-03 breadcrumb + live phase badge) ──────────────────┐
 *   │  ┌─ Left telemetry panel ─┐  ┌─ 3D Canvas (center) ──────────────────┐ │
 *   │  │  - Scan sequence log   │  │  ScannerGateSceneContent               │ │
 *   │  │  - Field result table  │  │  Gate frame + card + laser + HUD boxes │ │
 *   │  └────────────────────────┘  └───────────────────────────────────────┘ │
 *   │  ┌─ Bottom strip: timeline scrubber ────────────────────────────────── ┘
 *   └────────────────────────────────────────────────────────────────────────┘
 *
 * The animation is auto-looping (9s cycle). A shared timeRef is incremented
 * in an rAF loop so the React telemetry panel can also read it every 100ms
 * for low-frequency UI updates.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import {
  ScannerGateSceneContent,
  T_TOTAL, T_ENTER_END, T_SCAN_END, T_FLAG_END, T_EXIT_END,
  FIELDS, statusColor, statusLabel,
  type FieldDef,
} from '../scenes/ScannerGateScene';
import { CheckCircle, AlertTriangle, XCircle, Scan, ChevronRight } from 'lucide-react';

// ─── Phase detection ──────────────────────────────────────────────────────────
type AnimPhase = 'ENTERING' | 'SCANNING' | 'FLAGGING' | 'EXITING' | 'RESET';

function getPhase(t: number): AnimPhase {
  if (t < T_ENTER_END)  return 'ENTERING';
  if (t < T_SCAN_END)   return 'SCANNING';
  if (t < T_FLAG_END)   return 'FLAGGING';
  if (t < T_EXIT_END)   return 'EXITING';
  return 'RESET';
}

// ─── Phase badge styles ───────────────────────────────────────────────────────
const PHASE_STYLES: Record<AnimPhase, { color: string; bg: string; label: string }> = {
  ENTERING: { color: '#0078D4', bg: '#0078D420', label: 'INVOICE ENTERING GATE' },
  SCANNING: { color: '#0078D4', bg: '#0078D420', label: 'LASER SCAN IN PROGRESS' },
  FLAGGING: { color: '#D13438', bg: '#D1343820', label: 'EXCEPTIONS DETECTED' },
  EXITING:  { color: '#FFB900', bg: '#FFB90020', label: 'ROUTING TO EXCEPTION TRAY' },
  RESET:    { color: '#575C6C', bg: '#575C6C20', label: 'INITIALIZING NEXT SCAN...' },
};

// ─── Field status icon ────────────────────────────────────────────────────────
function FieldStatusIcon({ status }: { status: FieldDef['status'] }) {
  const sz = 11;
  if (status === 'clean')   return <CheckCircle  size={sz} style={{ color: '#107C41', flexShrink: 0 }} />;
  if (status === 'warning') return <AlertTriangle size={sz} style={{ color: '#FFB900', flexShrink: 0 }} />;
  return <XCircle size={sz} style={{ color: '#D13438', flexShrink: 0 }} />;
}

// ─── Log entry type ───────────────────────────────────────────────────────────
interface LogEntry {
  ts: string;
  text: string;
  color: string;
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export function ScannerGateSection() {
  const timeRef   = useRef<number>(0);
  const cardXRef  = useRef<number>(-7.5);
  const rafRef    = useRef<number>(0);
  const lastTsRef = useRef<number>(0);

  // UI state (updated at ~10fps, not every frame)
  const [phase,          setPhase]          = useState<AnimPhase>('ENTERING');
  const [activeFields,   setActiveFields]   = useState<string[]>([]);
  const [progress,       setProgress]       = useState(0);           // 0–1
  const [scanLog,        setScanLog]        = useState<LogEntry[]>([]);
  const [isPlaying,      setIsPlaying]      = useState(true);
  const logRef = useRef<HTMLDivElement>(null!);

  // ── rAF loop: advance time, push UI updates every 100ms ──────────────────
  const tick = useCallback((ts: number) => {
    if (lastTsRef.current === 0) lastTsRef.current = ts;
    const dt = Math.min((ts - lastTsRef.current) / 1000, 0.05);
    lastTsRef.current = ts;

    timeRef.current = (timeRef.current + dt) % T_TOTAL;
    const t = timeRef.current;

    // UI update (low-frequency via threshold)
    setProgress(t / T_TOTAL);

    const newPhase = getPhase(t);
    setPhase(prev => {
      if (prev !== newPhase) {
        // Append to scan log on phase change
        const now = new Date().toTimeString().split(' ')[0];
        const style = PHASE_STYLES[newPhase];
        setScanLog(log => [
          { ts: now, text: style.label, color: style.color },
          ...log.slice(0, 9),
        ]);
      }
      return newPhase;
    });

    // Which fields are active yet?
    const scanStart = T_ENTER_END;
    const active = FIELDS
      .filter(f => t >= scanStart + f.activateAt && t < T_EXIT_END)
      .map(f => f.id);
    setActiveFields(active);

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      lastTsRef.current = 0;
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, tick]);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 0;
  }, [scanLog]);

  const phaseStyle = PHASE_STYLES[phase];

  return (
    <section
      className="relative flex flex-col bg-[#0A0A0C]"
      style={{ height: '100vh', minHeight: 600 }}
      aria-label="The Scanner Gate — machine-vision invoice inspection"
    >
      {/* ── Noise texture overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
        }}
      />

      {/* ── Top header ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-2.5 border-b border-white/5 bg-[#0E0F14]/70 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest">
          <span className="text-[#0078D4] font-bold">[SEC-03]</span>
          <span className="text-[#575C6C]">MACHINE VISION SCANNER // FIELD EXTRACTION ENGINE</span>
          <span className="text-[#8A8F9E]">AP-AUDITOR v1.0</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Live phase badge */}
          <div
            className="flex items-center gap-2 px-3 py-1 font-mono text-[10px] font-bold uppercase border"
            style={{ color: phaseStyle.color, background: phaseStyle.bg, borderColor: `${phaseStyle.color}50` }}
          >
            <span
              className="w-1.5 h-1.5 flex-shrink-0"
              style={{ background: phaseStyle.color, animation: phase === 'SCANNING' ? 'pulse 0.8s infinite' : undefined }}
            />
            {phaseStyle.label}
          </div>

          {/* Play/pause */}
          <button
            onClick={() => setIsPlaying(p => !p)}
            className="px-3 py-1 font-mono text-[10px] border border-white/10 text-[#8A8F9E] hover:border-[#0078D4]/60 hover:text-[#0078D4] transition-colors uppercase tracking-wider"
          >
            {isPlaying ? '⏸ PAUSE' : '▶ RUN'}
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex overflow-hidden z-10">

        {/* ── LEFT: Telemetry panel ── */}
        <div className="w-72 xl:w-80 flex-shrink-0 flex flex-col border-r border-white/5 bg-[#0A0A0C]/60">

          {/* Invoice metadata */}
          <div className="p-4 border-b border-white/5 space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <Scan size={14} className="text-[#0078D4]" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-white">
                SCAN SESSION
              </span>
              <span className="ml-auto font-mono text-[9px] text-[#8A8F9E]">INV-2026-8841</span>
            </div>

            {[
              { label: 'ENTITY',   value: 'ACME LOGISTICS INC.' },
              { label: 'PO REF',   value: 'PO-2024-8841' },
              { label: 'ERP SRC',  value: 'SAP S/4HANA PROD' },
              { label: 'RECEIVED', value: '2026-09-29 14:33 UTC' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-[9px] text-[#575C6C] uppercase tracking-wider flex-shrink-0">{label}</span>
                <span className="font-mono text-[10px] text-[#D3D7E5] text-right truncate">{value}</span>
              </div>
            ))}
          </div>

          {/* Field scan results */}
          <div className="p-4 border-b border-white/5">
            <div className="font-mono text-[9px] text-[#575C6C] uppercase tracking-wider mb-3">
              FIELD EXTRACTION RESULTS
            </div>

            <div className="space-y-2">
              {FIELDS.map(field => {
                const isActive = activeFields.includes(field.id);
                const color    = statusColor(field.status);
                const isScanning = phase === 'SCANNING' && activeFields[activeFields.length - 1] === field.id;

                return (
                  <div
                    key={field.id}
                    className="flex flex-col gap-0.5 p-2 border transition-all duration-300"
                    style={{
                      borderColor:  isActive ? `${color}40` : 'rgba(255,255,255,0.05)',
                      background:   isActive ? `${color}08` : 'transparent',
                      opacity:      isActive || phase === 'FLAGGING' || phase === 'EXITING' ? 1 : 0.4,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {isActive
                        ? <FieldStatusIcon status={field.status} />
                        : <div className="w-[11px] h-[11px] border border-white/10 flex-shrink-0" />
                      }
                      <span className="font-mono text-[9px] text-[#8A8F9E] uppercase tracking-wider">
                        {field.label}
                      </span>
                      {isScanning && (
                        <span className="ml-auto font-mono text-[8px] text-[#0078D4] animate-pulse">
                          READING...
                        </span>
                      )}
                      {isActive && !isScanning && (
                        <span
                          className="ml-auto font-mono text-[8px] font-bold"
                          style={{ color }}
                        >
                          {field.confidence.toFixed(1)}%
                        </span>
                      )}
                    </div>

                    {isActive && (
                      <div className="flex items-center justify-between pl-[19px]">
                        <span className="font-mono text-[10px] text-white font-medium truncate">
                          {field.value}
                        </span>
                        <span
                          className="font-mono text-[8px] font-bold px-1.5 py-0.5 flex-shrink-0"
                          style={{ background: color, color: field.status === 'warning' ? '#000' : '#fff' }}
                        >
                          {statusLabel(field.status)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Exception summary (shows when phase = FLAGGING | EXITING) */}
          {(phase === 'FLAGGING' || phase === 'EXITING') && (
            <div
              className="mx-4 my-3 p-3 border font-mono space-y-1.5 animate-in fade-in duration-300"
              style={{ borderColor: '#D1343860', background: '#D1343812' }}
            >
              <div className="flex items-center gap-2 text-[10px] font-bold text-[#D13438] uppercase">
                <XCircle size={11} />
                EXCEPTION SUMMARY
              </div>
              <div className="text-[9px] text-[#A2A7B5] leading-relaxed">
                2 field violations detected. Invoice routed to
                <span className="text-[#FFB900] font-bold"> EXCEPTION TRAY</span> for
                AP specialist review.
              </div>
              <div className="flex items-center gap-2">
                <ChevronRight size={10} className="text-[#D13438]" />
                <span className="text-[9px] text-[#D13438]">DUPLICATE GST NUMBER</span>
              </div>
              <div className="flex items-center gap-2">
                <ChevronRight size={10} className="text-[#D13438]" />
                <span className="text-[9px] text-[#D13438]">MISSING PO REFERENCE</span>
              </div>
            </div>
          )}

          {/* Scan log */}
          <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-0">
            <div className="font-mono text-[9px] text-[#575C6C] uppercase tracking-wider mb-2">
              AUDIT LOG
            </div>
            <div ref={logRef} className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin">
              {scanLog.length === 0 && (
                <div className="font-mono text-[9px] text-[#3A3D4A] italic">
                  Awaiting scan sequence...
                </div>
              )}
              {scanLog.map((entry, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="font-mono text-[8px] text-[#3A3D4A] flex-shrink-0 mt-0.5">
                    {entry.ts}
                  </span>
                  <span className="font-mono text-[9px]" style={{ color: entry.color }}>
                    {entry.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CENTER: 3D Canvas ── */}
        <div className="flex-1 relative overflow-hidden">
          {/* Blueprint grid lines */}
          <div
            className="absolute inset-0 pointer-events-none z-0 opacity-[0.025]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,120,212,0.6) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,120,212,0.6) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />

          {/* Corner brackets */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#0078D4]/50 z-20 pointer-events-none" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#0078D4]/50 z-20 pointer-events-none" />
          <div className="absolute bottom-10 left-3 w-4 h-4 border-b-2 border-l-2 border-[#0078D4]/50 z-20 pointer-events-none" />
          <div className="absolute bottom-10 right-3 w-4 h-4 border-b-2 border-r-2 border-[#0078D4]/50 z-20 pointer-events-none" />

          {/* "GATE CENTER" crosshair */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="relative w-px h-24 bg-[#0078D4]/10" />
          </div>

          {/* R3F Canvas */}
          <Canvas
            shadows
            camera={{ position: [0, 0.5, 9], fov: 45 }}
            gl={{
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.15,
            }}
            style={{ background: 'transparent' }}
          >
            <ScannerGateSceneContent timeRef={timeRef} cardXRef={cardXRef} />
          </Canvas>

          {/* TOP-RIGHT: Scan stats */}
          <div className="absolute top-4 right-4 z-20 font-mono space-y-1 text-right">
            <div className="px-3 py-1.5 bg-[#0A0A0C]/80 backdrop-blur-md border border-white/8">
              <div className="text-[8px] text-[#575C6C] uppercase tracking-wider">SCAN ENGINE</div>
              <div className="text-xs font-bold text-white">CV-MODEL v4.1</div>
            </div>
            <div className="px-3 py-1.5 bg-[#0A0A0C]/80 backdrop-blur-md border border-white/8">
              <div className="text-[8px] text-[#575C6C] uppercase tracking-wider">THROUGHPUT</div>
              <div className="text-xs font-bold text-[#107C41]">340 inv/hr</div>
            </div>
          </div>

          {/* BOTTOM-LEFT: Field legend */}
          <div className="absolute bottom-10 left-4 z-20 font-mono space-y-1">
            {[
              { color: '#107C41', label: 'VERIFIED FIELD' },
              { color: '#FFB900', label: 'VARIANCE DETECTED' },
              { color: '#D13438', label: 'EXCEPTION FLAGGED' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-2.5 h-1" style={{ background: color, display: 'block', flexShrink: 0 }} />
                <span className="text-[8px] text-[#8A8F9E] uppercase tracking-wider">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom: timeline bar ── */}
      <div className="flex-shrink-0 h-8 flex items-center gap-4 px-5 border-t border-white/5 bg-[#0E0F14]/60 backdrop-blur-sm z-10">
        <span className="font-mono text-[9px] text-[#575C6C] uppercase tracking-widest w-24 flex-shrink-0">
          SCAN CYCLE
        </span>

        {/* Phase segments */}
        <div className="flex-1 relative h-1 bg-[#1A1B22] overflow-hidden">
          {/* Phase color segments */}
          <div className="absolute inset-y-0 left-0 bg-[#0078D4]"
            style={{ width: `${(T_ENTER_END / T_TOTAL) * 100}%`, right: `${100 - (T_ENTER_END / T_TOTAL) * 100}%`, opacity: 0.35 }} />
          <div className="absolute inset-y-0 bg-[#0078D4]"
            style={{ left: `${(T_ENTER_END / T_TOTAL) * 100}%`, width: `${((T_SCAN_END - T_ENTER_END) / T_TOTAL) * 100}%`, opacity: 0.35 }} />
          <div className="absolute inset-y-0 bg-[#D13438]"
            style={{ left: `${(T_SCAN_END / T_TOTAL) * 100}%`, width: `${((T_FLAG_END - T_SCAN_END) / T_TOTAL) * 100}%`, opacity: 0.35 }} />
          <div className="absolute inset-y-0 bg-[#FFB900]"
            style={{ left: `${(T_FLAG_END / T_TOTAL) * 100}%`, width: `${((T_EXIT_END - T_FLAG_END) / T_TOTAL) * 100}%`, opacity: 0.35 }} />

          {/* Playhead */}
          <div
            className="absolute top-0 h-full w-0.5 bg-white/80"
            style={{ left: `${progress * 100}%`, transition: 'left 100ms linear' }}
          />
        </div>

        {/* Phase labels */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {(['ENTERING','SCANNING','FLAGGING','EXITING'] as AnimPhase[]).map(p => (
            <span
              key={p}
              className="font-mono text-[8px] uppercase tracking-wider"
              style={{ color: phase === p ? PHASE_STYLES[p].color : '#3A3D4A', fontWeight: phase === p ? 700 : 400 }}
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
