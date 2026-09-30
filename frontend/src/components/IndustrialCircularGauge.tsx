/**
 * IndustrialCircularGauge.tsx
 *
 * Precision Circular Dial / Gauge Meter with authentic mechanical styling:
 * - Swept 260° industrial scale with major/minor tick marks and numeric labels.
 * - Dynamic color-coded progress arc.
 * - Mechanical tapered needle with counterweight & center boss pin.
 * - Smooth mechanical spring overshoot animation on scroll into view.
 * - Digital core readout with synchronized count-up counter.
 * - Status LED, tolerance threshold indicator, and industrial metadata.
 */

import React, { useEffect, useState, useMemo } from 'react';

export interface IndustrialCircularGaugeProps {
  label: string;
  sublabel?: string;
  value: number; // 0 to 100
  unit?: string;
  color?: string; // Hex color e.g. #107C41, #FFB900, #0078D4
  technicalCode?: string;
  targetTolerance?: string;
  description?: string;
  isTriggered: boolean;
  size?: number; // Default 260
}

export function IndustrialCircularGauge({
  label,
  sublabel,
  value,
  unit = '%',
  color = '#0078D4',
  technicalCode,
  targetTolerance,
  description,
  isTriggered,
  size = 260,
}: IndustrialCircularGaugeProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [animProgress, setAnimProgress] = useState(0); // 0 to 1

  // Sweep range: from -130deg (at 0%) to +130deg (at 100%), total 260deg
  const START_ANGLE = -130;
  const END_ANGLE = 130;
  const TOTAL_SPAN = END_ANGLE - START_ANGLE; // 260 degrees

  // Center & radius
  const cx = size / 2;
  const cy = size / 2;
  const rTrack = size * 0.36; // ~93.6px

  // Arc math
  const trackCircumference = 2 * Math.PI * rTrack;
  const trackLength = trackCircumference * (TOTAL_SPAN / 360);
  const strokeOffset = trackLength * (1 - animProgress * (value / 100));

  // Needle angle: from START_ANGLE to target angle
  const needleAngle = START_ANGLE + (animProgress * (value / 100)) * TOTAL_SPAN;

  // Animate digital counter and arc progress when triggered
  useEffect(() => {
    if (!isTriggered) {
      setDisplayValue(0);
      setAnimProgress(0);
      return;
    }

    // Trigger needle swing
    setAnimProgress(1);

    // Number count-up loop
    const duration = 1600; // ms
    const startTime = performance.now();

    let rafId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(eased * value);

      setDisplayValue(currentVal);

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setDisplayValue(value);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isTriggered, value]);

  // Generate tick marks (every 5% from 0 to 100)
  const ticks = useMemo(() => {
    const list = [];
    const step = 5; // 21 total ticks
    for (let i = 0; i <= 100; i += step) {
      const isMajor = i % 20 === 0;
      const angleDeg = START_ANGLE + (i / 100) * TOTAL_SPAN;
      const angleRad = (angleDeg * Math.PI) / 180;

      const rOuter = size * 0.44;
      const rInner = isMajor ? size * 0.38 : size * 0.405;

      // In SVG: 0 deg points up (0, -1), angle increases clockwise
      const x1 = cx + rInner * Math.sin(angleRad);
      const y1 = cy - rInner * Math.cos(angleRad);
      const x2 = cx + rOuter * Math.sin(angleRad);
      const y2 = cy - rOuter * Math.cos(angleRad);

      // Label coordinate (for major ticks)
      let labelX = 0;
      let labelY = 0;
      if (isMajor) {
        const rLabel = size * 0.32;
        labelX = cx + rLabel * Math.sin(angleRad);
        labelY = cy - rLabel * Math.cos(angleRad) + 3;
      }

      list.push({
        val: i,
        isMajor,
        x1,
        y1,
        x2,
        y2,
        labelX,
        labelY,
        angleDeg,
      });
    }
    return list;
  }, [cx, cy, size, START_ANGLE, TOTAL_SPAN]);

  // Arc path generator
  const arcPath = useMemo(() => {
    const startRad = (START_ANGLE * Math.PI) / 180;
    const endRad = (END_ANGLE * Math.PI) / 180;

    const startX = cx + rTrack * Math.sin(startRad);
    const startY = cy - rTrack * Math.cos(startRad);
    const endX = cx + rTrack * Math.sin(endRad);
    const endY = cy - rTrack * Math.cos(endRad);

    const largeArc = TOTAL_SPAN > 180 ? 1 : 0;
    return `M ${startX} ${startY} A ${rTrack} ${rTrack} 0 ${largeArc} 1 ${endX} ${endY}`;
  }, [cx, cy, rTrack, START_ANGLE, END_ANGLE, TOTAL_SPAN]);

  return (
    <div
      className="relative flex flex-col items-center bg-[#0E1017]/90 border border-white/10 p-5 shadow-2xl text-center group hover:border-white/20 transition-all duration-300"
      style={{
        boxShadow: `0 8px 30px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.08)`,
      }}
    >
      {/* Specular hairline across top edge */}
      <div
        className="absolute inset-x-0 top-0 h-[2px] transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: isTriggered ? 1 : 0.2,
        }}
      />

      {/* Top Header Strip */}
      <div className="w-full flex items-center justify-between font-mono text-[9px] text-[#575C6C] mb-2 uppercase tracking-widest border-b border-white/5 pb-2">
        <span className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 transition-colors duration-300"
            style={{
              background: isTriggered ? color : '#3A3F50',
              boxShadow: isTriggered ? `0 0 8px ${color}` : 'none',
            }}
          />
          <span className="text-white/80 font-bold">{technicalCode || 'GAUGE-METRIC'}</span>
        </span>
        <span className="text-[#8A8F9E]">{targetTolerance || 'CALIBRATED'}</span>
      </div>

      {/* Gauge Title */}
      <div className="w-full text-center mb-1">
        <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
          {label}
        </h3>
        {sublabel && (
          <div className="font-mono text-[9px] text-[#8A8F9E] tracking-tight mt-0.5">
            {sublabel}
          </div>
        )}
      </div>

      {/* ── Circular Dial Canvas (SVG) ── */}
      <div className="relative my-2" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="overflow-visible select-none pointer-events-none"
        >
          {/* Concentric Dial Background Rings */}
          <circle
            cx={cx}
            cy={cy}
            r={size * 0.48}
            fill="#090A0E"
            stroke="#1D212E"
            strokeWidth="1.5"
          />
          <circle
            cx={cx}
            cy={cy}
            r={size * 0.45}
            fill="#0D0F15"
            stroke="#151822"
            strokeWidth="1"
          />
          <circle
            cx={cx}
            cy={cy}
            r={size * 0.38}
            fill="#08090C"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="1"
          />

          {/* Background Track Arc */}
          <path
            d={arcPath}
            fill="none"
            stroke="#1A1E2B"
            strokeWidth="8"
            strokeLinecap="butt"
          />

          {/* Active Colored Value Arc */}
          <path
            d={arcPath}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="butt"
            strokeDasharray={trackLength}
            strokeDashoffset={strokeOffset}
            style={{
              transition: isTriggered
                ? 'stroke-dashoffset 1.8s cubic-bezier(0.34, 1.4, 0.64, 1)'
                : 'none',
              filter: `drop-shadow(0 0 6px ${color}88)`,
            }}
          />

          {/* Tick Marks & Major Labels */}
          {ticks.map((t) => (
            <g key={t.val}>
              <line
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke={t.isMajor ? '#8A8F9E' : '#33384A'}
                strokeWidth={t.isMajor ? 1.5 : 1}
              />
              {t.isMajor && (
                <text
                  x={t.labelX}
                  y={t.labelY}
                  fill="#575C6C"
                  fontSize="8"
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="600"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {t.val}
                </text>
              )}
            </g>
          ))}

          {/* ── Mechanical Needles Assembly ── */}
          <g
            style={{
              transformOrigin: `${cx}px ${cy}px`,
              transform: `rotate(${needleAngle}deg)`,
              transition: isTriggered
                ? 'transform 1.8s cubic-bezier(0.34, 1.35, 0.64, 1)'
                : 'none',
            }}
          >
            {/* Needle Counterweight (opposite of pointer) */}
            <path
              d={`M ${cx - 5} ${cy} L ${cx - 7} ${cy + 22} Q ${cx} ${cy + 26} ${cx + 7} ${cy + 22} L ${cx + 5} ${cy} Z`}
              fill="#262B3A"
              stroke="#131620"
              strokeWidth="1"
            />
            {/* Counterweight hole */}
            <circle cx={cx} cy={cy + 16} r="2.5" fill="#090A0E" />

            {/* Main Tapered Needle Shank */}
            <polygon
              points={`
                ${cx - 3.5},${cy}
                ${cx - 0.75},${cy - size * 0.41}
                ${cx + 0.75},${cy - size * 0.41}
                ${cx + 3.5},${cy}
              `}
              fill={color}
              filter={`drop-shadow(0 0 4px ${color}AA)`}
            />

            {/* Needle Luminous Tip Accent */}
            <line
              x1={cx}
              y1={cy - size * 0.32}
              x2={cx}
              y2={cy - size * 0.42}
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* Center Boss / Metallic Pin */}
            <circle
              cx={cx}
              cy={cy}
              r="10"
              fill="#181B26"
              stroke="#3A3F55"
              strokeWidth="2"
            />
            <circle
              cx={cx}
              cy={cy}
              r="4.5"
              fill={color}
              stroke="#FFFFFF"
              strokeWidth="0.8"
            />
          </g>

          {/* Scale Unit Label at top center */}
          <text
            x={cx}
            y={cy - size * 0.22}
            fill="#575C6C"
            fontSize="8"
            fontFamily="'JetBrains Mono', monospace"
            fontWeight="700"
            textAnchor="middle"
            letterSpacing="0.1em"
          >
            PERCENT [{unit}]
          </text>
        </svg>

        {/* ── Center Digital Readout HUD ── */}
        <div
          className="absolute inset-x-0 bottom-7 flex flex-col items-center justify-center pointer-events-none"
        >
          <div className="flex items-baseline justify-center gap-0.5">
            <span
              className="font-mono text-3xl font-black tracking-tight drop-shadow-md"
              style={{ color }}
            >
              {displayValue}
            </span>
            <span
              className="font-mono text-base font-bold"
              style={{ color }}
            >
              {unit}
            </span>
          </div>

          {/* Operational Status Tag */}
          <div
            className="mt-1 px-2 py-0.5 font-mono text-[8px] font-bold uppercase tracking-widest border"
            style={{
              color,
              borderColor: `${color}40`,
              backgroundColor: `${color}15`,
            }}
          >
            {isTriggered ? 'MEASUREMENT LOCKED' : 'CALIBRATING...'}
          </div>
        </div>
      </div>

      {/* Bottom Description / ERP Impact Analysis */}
      {description && (
        <div className="w-full font-mono text-[10px] text-[#A2A7B5] leading-relaxed mt-2 pt-2 border-t border-white/5 text-left bg-black/30 p-2.5">
          {description}
        </div>
      )}
    </div>
  );
}
