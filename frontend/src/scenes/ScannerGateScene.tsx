/**
 * ScannerGateScene.tsx
 *
 * Industrial machine-vision scanning gate.
 * A single invoice card moves through a metal frame gate.
 * A blue laser sweep scans the card face.
 * HUD bounding boxes pop up on each field sequentially using @react-three/drei Html.
 *
 * Animation state machine (loops every ~9s):
 *   ENTERING  (0–1.8s)  — card slides in from left
 *   SCANNING  (1.8–5.5s)— card stops at gate center, laser sweeps, boxes appear
 *   FLAGGING  (5.5–7s)  — exception boxes pulse, result badge appears
 *   EXITING   (7–8.5s)  — card exits right toward exception tray
 *   RESET     (8.5–9s)  — fade out, teleport to start
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// ─── Animation phase constants ───────────────────────────────────────────────
const T_ENTER_END  = 1.8;
const T_SCAN_END   = 5.5;
const T_FLAG_END   = 7.0;
const T_EXIT_END   = 8.5;
const T_TOTAL      = 9.0;

// ─── Card X positions ────────────────────────────────────────────────────────
const CARD_X_START = -7.5;
const CARD_X_GATE  =  0.0;
const CARD_X_EXIT  =  7.5;

// ─── Invoice field definitions (positions on card face, local card coords) ───
interface FieldDef {
  id: string;
  label: string;
  value: string;
  status: 'clean' | 'warning' | 'error';
  confidence: number;  // 0-100
  activateAt: number;  // seconds into SCANNING phase when box appears
  // x, y, w, h in card-local units (card is 2.2 wide × 3.1 tall, face at z=0.05)
  cx: number; cy: number; fw: number; fh: number;
}

const FIELDS: FieldDef[] = [
  {
    id:          'vendor',
    label:       'VENDOR NAME',
    value:       'ACME LOGISTICS INC.',
    status:      'clean',
    confidence:  99.2,
    activateAt:  0.4,
    cx: 0, cy: 0.85, fw: 1.9, fh: 0.38,
  },
  {
    id:          'amount',
    label:       'INVOICE AMOUNT',
    value:       '$24,800.00',
    status:      'warning',
    confidence:  87.4,
    activateAt:  1.0,
    cx: 0, cy: 0.26, fw: 1.4, fh: 0.36,
  },
  {
    id:          'gst',
    label:       'GST / TAX NUMBER',
    value:       '22AAAAA0000A1Z5',
    status:      'error',
    confidence:  41.1,
    activateAt:  1.6,
    cx: 0, cy: -0.35, fw: 1.7, fh: 0.35,
  },
  {
    id:          'po',
    label:       'PO REFERENCE',
    value:       'PO-2024-8841',
    status:      'error',
    confidence:  12.0,
    activateAt:  2.2,
    cx: 0, cy: -0.93, fw: 1.5, fh: 0.35,
  },
];

// ─── Status → color/glow ─────────────────────────────────────────────────────
function statusColor(status: FieldDef['status']): string {
  switch (status) {
    case 'clean':   return '#107C41';
    case 'warning': return '#FFB900';
    case 'error':   return '#D13438';
  }
}
function statusLabel(status: FieldDef['status']): string {
  switch (status) {
    case 'clean':   return 'VERIFIED';
    case 'warning': return 'VARIANCE';
    case 'error':   return 'FLAG';
  }
}

// ─── Ease helpers ────────────────────────────────────────────────────────────
function clamp01(t: number): number {
  return Math.max(0, Math.min(1, t));
}
function easeOutCubic(t: number): number {
  return 1 - (1 - clamp01(t)) ** 3;
}
function easeInOutQuad(t: number): number {
  const c = clamp01(t);
  return c < 0.5 ? 2 * c * c : 1 - (-2 * c + 2) ** 2 / 2;
}

// ─── Gate Frame (4 metal pillars + top/bottom bars) ─────────────────────────
function GateFrame() {
  const GATE_W  = 3.6;   // inner width
  const GATE_H  = 4.6;   // inner height
  const BAR_T   = 0.09;  // bar thickness
  const DEPTH   = 0.5;   // frame depth (z)
  const MAT = { color: '#2A2D38', metalness: 0.88, roughness: 0.18 };

  const bars: Array<{ pos: [number,number,number]; scale: [number,number,number] }> = [
    // Left pillar
    { pos: [-(GATE_W/2 + BAR_T/2), 0, 0], scale: [BAR_T, GATE_H + BAR_T*2, DEPTH] },
    // Right pillar
    { pos: [ (GATE_W/2 + BAR_T/2), 0, 0], scale: [BAR_T, GATE_H + BAR_T*2, DEPTH] },
    // Top bar
    { pos: [0,  GATE_H/2 + BAR_T/2, 0], scale: [GATE_W + BAR_T*2, BAR_T, DEPTH] },
    // Bottom bar
    { pos: [0, -GATE_H/2 - BAR_T/2, 0], scale: [GATE_W + BAR_T*2, BAR_T, DEPTH] },
  ];

  return (
    <group>
      {bars.map((b, i) => (
        <mesh key={i} position={b.pos} scale={b.scale} castShadow>
          <boxGeometry />
          <meshPhysicalMaterial {...MAT} />
        </mesh>
      ))}

      {/* Corner accent lights — tiny emissive cubes at corners */}
      {[[-1,-1],[1,-1],[-1,1],[1,1]].map(([sx,sy],i) => (
        <mesh
          key={`corner-${i}`}
          position={[sx*(GATE_W/2 + BAR_T/2), sy*(GATE_H/2 + BAR_T/2), DEPTH/2 + 0.01]}
        >
          <boxGeometry args={[0.12, 0.12, 0.04]} />
          <meshStandardMaterial color="#0078D4" emissive="#0078D4" emissiveIntensity={3} />
        </mesh>
      ))}

      {/* Gate label plate */}
      <mesh position={[0, GATE_H/2 + BAR_T + 0.18, 0]}>
        <boxGeometry args={[1.8, 0.24, 0.04]} />
        <meshStandardMaterial color="#0A0C14" emissive="#0078D4" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

// ─── Laser Sweep Plane ───────────────────────────────────────────────────────
interface LaserSweepProps {
  timeRef: React.MutableRefObject<number>;
}
function LaserSweep({ timeRef }: LaserSweepProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const matRef  = useRef<THREE.MeshStandardMaterial>(null!);

  useFrame(() => {
    const t = timeRef.current;
    if (t < T_ENTER_END || t > T_SCAN_END + 0.3) {
      meshRef.current.visible = false;
      return;
    }
    meshRef.current.visible = true;

    // Phase within scanning
    const scanPhase = (t - T_ENTER_END) / (T_SCAN_END - T_ENTER_END);
    // Laser sweeps top→bottom twice
    const sweep = Math.abs(Math.sin(scanPhase * Math.PI * 2.5));
    const y = 2.1 - sweep * 4.2;  // top(2.1) to bottom(-2.1)

    meshRef.current.position.y = y;
    // Intensity: bright in scanning phase, fades out
    const intensity = Math.min(1, (t - T_ENTER_END) / 0.3) * (1 - Math.max(0, (t - T_SCAN_END) / 0.3));
    matRef.current.emissiveIntensity = intensity * 4;
    matRef.current.opacity = intensity * 0.55;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0.07]}>
      <planeGeometry args={[3.4, 0.018]} />
      <meshStandardMaterial
        ref={matRef}
        color="#0078D4"
        emissive="#0078D4"
        emissiveIntensity={4}
        transparent
        opacity={0.55}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── HUD Bounding Box (drei Html overlay) ────────────────────────────────────
interface HudBoxProps {
  field: FieldDef;
  timeRef: React.MutableRefObject<number>;
  cardXRef: React.MutableRefObject<number>;
}
function HudBox({ field, timeRef, cardXRef }: HudBoxProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const opacityRef = useRef(0);

  useFrame(() => {
    const t = timeRef.current;
    const scanStart = T_ENTER_END;
    const fieldStart = scanStart + field.activateAt;
    const elapsed = t - fieldStart;

    if (elapsed < 0 || t > T_EXIT_END) {
      opacityRef.current = 0;
    } else if (elapsed < 0.25) {
      opacityRef.current = easeOutCubic(elapsed / 0.25);
    } else if (t > T_FLAG_END) {
      opacityRef.current = Math.max(0, 1 - (t - T_FLAG_END) / 0.8);
    } else {
      opacityRef.current = 1;
    }

    if (groupRef.current) {
      groupRef.current.visible = opacityRef.current > 0.01;
      // Follow the card X position
      groupRef.current.position.x = cardXRef.current + field.cx;
    }
  });

  const color = statusColor(field.status);
  const label = statusLabel(field.status);
  const PX_PER_UNIT = 130; // approximate

  return (
    <group ref={groupRef} position={[field.cx, field.cy, 0.07]}>
      <Html
        center
        transform={false}
        style={{
          pointerEvents: 'none',
          userSelect:    'none',
          width:  `${field.fw * PX_PER_UNIT}px`,
          height: `${field.fh * PX_PER_UNIT}px`,
          position: 'relative',
        }}
      >
        <div
          style={{
            position:  'absolute',
            inset:     0,
            border:    `1.5px solid ${color}`,
            boxShadow: `0 0 12px ${color}55, inset 0 0 8px ${color}15`,
            // Animated opacity via CSS — driven by opacityRef via inline style update
          }}
        >
          {/* Corner accents */}
          {[['0','0','tl'],['0','auto','bl'],['auto','0','tr'],['auto','auto','br']].map(
            ([top, bottom, key]) => (
              <div
                key={key}
                style={{
                  position:  'absolute',
                  top:       top   === 'auto' ? undefined : -1,
                  bottom:    bottom === 'auto' ? undefined : -1,
                  left:      key.includes('l') ? -1 : undefined,
                  right:     key.includes('r') ? -1 : undefined,
                  width:     8, height: 8,
                  borderTop:    key.includes('t') ? `2px solid ${color}` : undefined,
                  borderBottom: key.includes('b') ? `2px solid ${color}` : undefined,
                  borderLeft:   key.includes('l') ? `2px solid ${color}` : undefined,
                  borderRight:  key.includes('r') ? `2px solid ${color}` : undefined,
                }}
              />
            )
          )}

          {/* Top label strip */}
          <div style={{
            position:   'absolute',
            top:        -18,
            left:       -1,
            display:    'flex',
            alignItems: 'center',
            gap:        5,
            background: `${color}22`,
            border:     `1px solid ${color}66`,
            padding:    '1px 6px',
            whiteSpace: 'nowrap',
          }}>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize:   9,
              fontWeight: 700,
              color,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              {field.label}
            </span>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize:   8,
              color:      '#8A8F9E',
            }}>
              {field.confidence.toFixed(1)}%
            </span>
          </div>

          {/* Bottom status badge */}
          <div style={{
            position:    'absolute',
            bottom:      -18,
            right:       -1,
            background:  color,
            padding:     '1px 6px',
            fontFamily:  'JetBrains Mono, monospace',
            fontSize:    8,
            fontWeight:  700,
            color:       field.status === 'warning' ? '#000' : '#fff',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            ■ {label}
          </div>
        </div>
      </Html>
    </group>
  );
}

// ─── Invoice Card ─────────────────────────────────────────────────────────────
interface InvoiceCardProps {
  timeRef: React.MutableRefObject<number>;
  cardXRef: React.MutableRefObject<number>;
}
function InvoiceCard({ timeRef, cardXRef }: InvoiceCardProps) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    const t = timeRef.current;
    let x: number;
    let rotZ = 0;

    if (t < T_ENTER_END) {
      // Entering: slide from left to gate center
      const progress = easeOutCubic(t / T_ENTER_END);
      x = THREE.MathUtils.lerp(CARD_X_START, CARD_X_GATE, progress);
      // Slight tilt as it enters
      rotZ = (1 - progress) * -0.08;
    } else if (t < T_FLAG_END) {
      // At gate: stopped, slight vibration during scan
      x = CARD_X_GATE;
      const scanT = (t - T_ENTER_END) / (T_SCAN_END - T_ENTER_END);
      rotZ = Math.sin(scanT * 18) * 0.003 * Math.min(1, scanT * 5);
    } else if (t < T_EXIT_END) {
      // Exiting: slide to right
      const exitP = easeInOutQuad((t - T_FLAG_END) / (T_EXIT_END - T_FLAG_END));
      x = THREE.MathUtils.lerp(CARD_X_GATE, CARD_X_EXIT, exitP);
    } else {
      x = CARD_X_EXIT;
    }

    groupRef.current.position.x = x;
    groupRef.current.rotation.z = rotZ;
    cardXRef.current = x;
  });

  return (
    <group ref={groupRef} position={[CARD_X_START, 0, 0]}>
      {/* Card body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.2, 3.1, 0.06]} />
        <meshPhysicalMaterial
          color="#101218"
          metalness={0.2}
          roughness={0.6}
          clearcoat={0.5}
          clearcoatRoughness={0.25}
        />
      </mesh>

      {/* Top status stripe */}
      <mesh position={[0, 1.43, 0.031]}>
        <planeGeometry args={[2.2, 0.18]} />
        <meshStandardMaterial color="#D13438" emissive="#D13438" emissiveIntensity={0.6} />
      </mesh>

      {/* Card face lines (simulated fields) */}
      {[0.85, 0.26, -0.35, -0.93].map((y, i) => (
        <mesh key={i} position={[0, y, 0.031]}>
          <planeGeometry args={[1.9, 0.22]} />
          <meshStandardMaterial
            color={i === 0 ? '#1A1D28' : '#12141C'}
            transparent opacity={0.9}
          />
        </mesh>
      ))}

      {/* AP AUDITOR watermark line on card */}
      <mesh position={[0, -1.4, 0.031]}>
        <planeGeometry args={[1.6, 0.04]} />
        <meshStandardMaterial color="#0078D4" emissive="#0078D4" emissiveIntensity={0.5} />
      </mesh>

      {/* HUD boxes (Html overlays per field) */}
      {FIELDS.map(field => (
        <HudBox key={field.id} field={field} timeRef={timeRef} cardXRef={cardXRef} />
      ))}
    </group>
  );
}

// ─── Exception Result Badge (appears after scan) ─────────────────────────────
function ExceptionBadge({ timeRef }: { timeRef: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    const t = timeRef.current;
    const show = t > T_SCAN_END + 0.4 && t < T_EXIT_END;
    groupRef.current.visible = show;
    if (show) {
      const age = t - (T_SCAN_END + 0.4);
      const scale = easeOutCubic(Math.min(1, age / 0.4));
      groupRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={groupRef} position={[0, 2.4, 0.1]}>
      <Html center transform={false} style={{ pointerEvents: 'none', userSelect: 'none' }}>
        <div style={{
          display:       'flex',
          alignItems:    'center',
          gap:           8,
          background:    '#D1343822',
          border:        '1.5px solid #D13438',
          padding:       '5px 14px',
          fontFamily:    'JetBrains Mono, monospace',
          whiteSpace:    'nowrap',
          boxShadow:     '0 0 20px #D1343855',
        }}>
          <span style={{ color: '#D13438', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em' }}>
            ■ EXCEPTION DETECTED
          </span>
          <span style={{
            background:  '#D13438',
            color:       '#fff',
            fontSize:    9,
            fontWeight:  700,
            padding:     '1px 6px',
            letterSpacing: '0.1em',
          }}>
            2 FLAGS
          </span>
        </div>
      </Html>
    </group>
  );
}

// ─── Ground reflection plane ─────────────────────────────────────────────────
function FloorPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.8, 0]} receiveShadow>
      <planeGeometry args={[30, 20]} />
      <meshStandardMaterial color="#0A0A0C" metalness={0.4} roughness={0.9} />
    </mesh>
  );
}

// ─── Gate accent point lights ─────────────────────────────────────────────────
function GateLights({ timeRef }: { timeRef: React.MutableRefObject<number> }) {
  const leftRef  = useRef<THREE.PointLight>(null!);
  const rightRef = useRef<THREE.PointLight>(null!);

  useFrame(() => {
    const t = timeRef.current;
    const scanning = t > T_ENTER_END && t < T_SCAN_END + 0.3;
    const intensity = scanning ? 3.5 + Math.sin(t * 12) * 0.5 : 1.5;
    if (leftRef.current)  leftRef.current.intensity  = intensity;
    if (rightRef.current) rightRef.current.intensity = intensity;
  });

  return (
    <>
      <pointLight ref={leftRef}  position={[-2.0, 0, 0.8]} color="#0078D4" intensity={1.5} distance={6} decay={2} />
      <pointLight ref={rightRef} position={[ 2.0, 0, 0.8]} color="#0078D4" intensity={1.5} distance={6} decay={2} />
      <pointLight position={[0, 0, 2]} color="#B8D4FF" intensity={0.8} distance={10} decay={2} />
    </>
  );
}

// ─── Scene Root ───────────────────────────────────────────────────────────────
interface ScannerGateSceneContentProps {
  timeRef:   React.MutableRefObject<number>;
  cardXRef:  React.MutableRefObject<number>;
}
export function ScannerGateSceneContent({ timeRef, cardXRef }: ScannerGateSceneContentProps) {
  return (
    <>
      {/* Global lighting */}
      <ambientLight intensity={0.15} color="#1A1B2E" />
      <directionalLight
        position={[3, 8, 5]}
        intensity={2.5}
        color="#C4D8FF"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.001}
      />
      <directionalLight position={[-4, -2, 3]} intensity={0.6} color="#FFB90044" />

      {/* Scene elements */}
      <GateFrame />
      <GateLights timeRef={timeRef} />
      <LaserSweep timeRef={timeRef} />
      <InvoiceCard timeRef={timeRef} cardXRef={cardXRef} />
      <ExceptionBadge timeRef={timeRef} />
      <FloorPlane />
    </>
  );
}

// ─── Time driver hook ─────────────────────────────────────────────────────────
export { T_TOTAL, T_ENTER_END, T_SCAN_END, T_FLAG_END, T_EXIT_END, FIELDS, statusColor, statusLabel };
export type { FieldDef };
