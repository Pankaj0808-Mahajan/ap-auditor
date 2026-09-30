/**
 * SortingFunnelScene.tsx — Section 4: "The Sorting Funnel"
 *
 * Industrial mechanical sorting funnel:
 * - Invoice enters at the top, drops into wide intake funnel.
 * - Enters decision throat with scanning HUD & optical beam.
 * - Diverter gate splits the path:
 *     1) Green 'Auto-Pass' straight down (x=0) into the Auto-Pass collector bin.
 *     2) Amber 'Human Review' angled chute (down-right) into an illuminated tray icon & review tray.
 *
 * Animation cycle (~7.6s loop):
 *   DROPPING   (0–1.5s)   — card drops from top into funnel mouth
 *   DECIDING   (1.5–3.0s) — card pauses at decision gate, laser scanner sweeps
 *   ROUTING    (3.0–5.2s) — diverter redirects, card travels straight down or down angled chute
 *   LANDING    (5.2–6.4s) — card settles into bin / tray with realistic bounce
 *   RESET      (6.4–7.6s) — fade out, reset next cycle
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Inbox, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

// ─── Timing constants ────────────────────────────────────────────────────────
export const T_DROP_END    = 1.5;
export const T_DECIDE_END  = 3.0;
export const T_ROUTE_END   = 5.2;
export const T_LAND_END    = 6.4;
export const T_TOTAL       = 7.6;

// ─── Positions ───────────────────────────────────────────────────────────────
const CARD_Y_START      =  5.8;
const CARD_Y_FUNNEL     =  1.3;   // decision gate Y
const PASS_BIN_POS: [number, number, number]    = [0, -4.2, 0];       // Straight down
const REVIEW_TRAY_POS: [number, number, number] = [3.6, -3.2, 0];     // Angled to the right

// ─── Easing helpers ──────────────────────────────────────────────────────────
function clamp01(t: number) { return Math.max(0, Math.min(1, t)); }
function easeOutCubic(t: number) { return 1 - (1 - clamp01(t)) ** 3; }
function easeInQuad(t: number)   { const c = clamp01(t); return c * c; }
function easeOutQuad(t: number)  { const c = clamp01(t); return c * (2 - c); }
function easeOutBounce(t: number) {
  const c = clamp01(t);
  const n1 = 7.5625, d1 = 2.75;
  if (c < 1 / d1)        return n1 * c * c;
  if (c < 2 / d1)        { const c2 = c - 1.5 / d1; return n1 * c2 * c2 + 0.75; }
  if (c < 2.5 / d1)      { const c2 = c - 2.25 / d1; return n1 * c2 * c2 + 0.9375; }
  const c2 = c - 2.625 / d1; return n1 * c2 * c2 + 0.984375;
}

// ─── Phase types ─────────────────────────────────────────────────────────────
export type SortPhase = 'DROPPING' | 'DECIDING' | 'ROUTING' | 'LANDING' | 'RESET';

export function getPhase(t: number): SortPhase {
  if (t < T_DROP_END)   return 'DROPPING';
  if (t < T_DECIDE_END) return 'DECIDING';
  if (t < T_ROUTE_END)  return 'ROUTING';
  if (t < T_LAND_END)   return 'LANDING';
  return 'RESET';
}

// ─── 1. Funnel Body (Industrial Intake Hopper) ──────────────────────────────
function FunnelBody() {
  const metalMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#16181F',
    metalness: 0.9,
    roughness: 0.25,
    clearcoat: 0.3,
  }), []);

  const plateMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#0D0E13',
    metalness: 0.8,
    roughness: 0.4,
  }), []);

  const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#0078D4',
    metalness: 0.1,
    roughness: 0.1,
    transmission: 0.7,
    transparent: true,
    opacity: 0.25,
    ior: 1.5,
  }), []);

  const wallH = 2.6;
  const wallD = 1.6;
  const angle = 0.38; // Inward converging angle

  return (
    <group position={[0, 3.2, 0]}>
      {/* Top intake collar rim */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[4.2, 0.14, wallD + 0.2]} />
        <meshPhysicalMaterial color="#2B303C" metalness={0.95} roughness={0.18} />
      </mesh>

      {/* Intake feed rollers */}
      {[-1.2, 0, 1.2].map((rx, idx) => (
        <group key={idx} position={[rx, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.07, 0.07, wallD + 0.1, 16]} />
            <meshStandardMaterial color="#404555" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Left angled hopper wall */}
      <mesh position={[-1.38, -wallH / 2, 0]} rotation={[0, 0, angle]} castShadow>
        <boxGeometry args={[0.12, wallH, wallD]} />
        <primitive object={metalMat} attach="material" />
      </mesh>

      {/* Right angled hopper wall */}
      <mesh position={[1.38, -wallH / 2, 0]} rotation={[0, 0, -angle]} castShadow>
        <boxGeometry args={[0.12, wallH, wallD]} />
        <primitive object={metalMat} attach="material" />
      </mesh>

      {/* Rear solid backplate */}
      <mesh position={[0, -wallH / 2, -wallD / 2 - 0.02]}>
        <boxGeometry args={[3.8, wallH, 0.04]} />
        <primitive object={plateMat} attach="material" />
      </mesh>

      {/* Front tinted inspection acrylic shield */}
      <mesh position={[0, -wallH / 2, wallD / 2 + 0.02]}>
        <boxGeometry args={[3.4, wallH * 0.9, 0.02]} />
        <primitive object={glassMat} attach="material" />
      </mesh>

      {/* Mechanical support struts */}
      {[-1.7, 1.7].map((sx, i) => (
        <mesh key={i} position={[sx, -wallH / 2, 0]}>
          <boxGeometry args={[0.06, wallH + 0.3, 0.06]} />
          <meshStandardMaterial color="#353A48" metalness={0.85} roughness={0.3} />
        </mesh>
      ))}

      {/* Stenciled intake code HUD */}
      <Html position={[0, 0.35, 0]} center transform={false} style={{ pointerEvents: 'none', userSelect: 'none' }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 8,
          letterSpacing: '0.18em',
          color: '#0078D4',
          background: 'rgba(0,120,212,0.12)',
          border: '1px solid rgba(0,120,212,0.3)',
          padding: '2px 8px',
          whiteSpace: 'nowrap',
          textTransform: 'uppercase',
        }}>
          INTAKE HOPPER // AUTO-FEED
        </div>
      </Html>
    </group>
  );
}

// ─── 2. Decision Gate (Scanning Throat) ──────────────────────────────────────
interface DecisionGateProps {
  timeRef: React.MutableRefObject<number>;
  outcomeRef: React.MutableRefObject<'pass' | 'review'>;
}
function DecisionGate({ timeRef, outcomeRef }: DecisionGateProps) {
  const flashRef   = useRef<THREE.MeshStandardMaterial>(null!);
  const scannerRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    const t = timeRef.current;
    const deciding = t >= T_DROP_END && t < T_DECIDE_END;

    if (flashRef.current) {
      if (deciding) {
        const pulse = 2.0 + Math.sin(t * 18) * 1.5;
        flashRef.current.emissiveIntensity = pulse;
      } else {
        flashRef.current.emissiveIntensity = 0.4;
      }
    }

    if (scannerRef.current) {
      if (deciding) {
        // Laser scan sweep vertically across invoice
        const p = (t - T_DROP_END) / (T_DECIDE_END - T_DROP_END);
        scannerRef.current.position.y = CARD_Y_FUNNEL + 0.6 - p * 1.2;
        scannerRef.current.visible = true;
      } else {
        scannerRef.current.visible = false;
      }
    }
  });

  return (
    <group position={[0, CARD_Y_FUNNEL, 0]}>
      {/* Heavy collar ring around throat */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.2, 0.25, 1.4]} />
        <meshPhysicalMaterial color="#222530" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Optical sensor emitter heads */}
      {[-0.95, 0.95].map((x, i) => (
        <group key={i} position={[x, 0, 0.72]}>
          <mesh>
            <boxGeometry args={[0.18, 0.18, 0.08]} />
            <meshStandardMaterial color="#0078D4" emissive="#0078D4" emissiveIntensity={2} />
          </mesh>
        </group>
      ))}

      {/* Active laser scan line beam */}
      <group ref={scannerRef} position={[0, 0, 0.1]}>
        <mesh>
          <planeGeometry args={[1.8, 0.03]} />
          <meshStandardMaterial
            ref={flashRef}
            color="#0078D4"
            emissive="#0078D4"
            emissiveIntensity={2}
            side={THREE.DoubleSide}
            transparent
            opacity={0.9}
          />
        </mesh>
      </group>
    </group>
  );
}

// ─── 3. Diverter Arm (Mechanical Flap / Splitter) ───────────────────────────
interface DiverterArmProps {
  timeRef: React.MutableRefObject<number>;
  outcomeRef: React.MutableRefObject<'pass' | 'review'>;
}
function DiverterArm({ timeRef, outcomeRef }: DiverterArmProps) {
  const armRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    const t = timeRef.current;
    const phase = getPhase(t);

    let targetAngle = 0; // Default: open straight down for Auto-Pass

    if (phase === 'ROUTING' || phase === 'LANDING') {
      if (outcomeRef.current === 'review') {
        // Tilted ~35 degrees to deflect card into angled chute
        targetAngle = -0.62;
      } else {
        // Auto-pass: vertical alignment, guide rails straight down
        targetAngle = 0.0;
      }
    }

    if (armRef.current) {
      armRef.current.rotation.z += (targetAngle - armRef.current.rotation.z) * 0.12;
    }
  });

  return (
    <group position={[0.15, CARD_Y_FUNNEL - 0.7, 0.05]}>
      {/* Pivot hinge cylinder */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 1.2, 16]} />
        <meshStandardMaterial color="#3E4455" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Rotating diverter blade */}
      <group ref={armRef}>
        <mesh position={[0, -0.75, 0]}>
          <boxGeometry args={[0.08, 1.5, 1.1]} />
          <meshPhysicalMaterial color="#252A36" metalness={0.92} roughness={0.18} />
        </mesh>

        {/* Hazard strip on blade edge */}
        <mesh position={[0.045, -0.75, 0]}>
          <boxGeometry args={[0.015, 1.4, 0.9]} />
          <meshStandardMaterial color="#FFB900" emissive="#FFB900" emissiveIntensity={0.6} />
        </mesh>
      </group>
    </group>
  );
}

// ─── 4. Green "Auto-Pass" Chute (STRAIGHT DOWN) ──────────────────────────────
function AutoPassChute() {
  const chuteH = 4.2;
  const chuteY = -1.9;

  return (
    <group position={[0, chuteY, 0]}>
      {/* Vertical guide rails - Left */}
      <mesh position={[-0.85, 0, 0]} castShadow>
        <boxGeometry args={[0.08, chuteH, 0.8]} />
        <meshPhysicalMaterial color="#13241A" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Vertical guide rails - Right */}
      <mesh position={[0.85, 0, 0]} castShadow>
        <boxGeometry args={[0.08, chuteH, 0.8]} />
        <meshPhysicalMaterial color="#13241A" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Vertical glowing Green Neon LED runners */}
      {[-0.88, 0.88].map((lx, i) => (
        <mesh key={i} position={[lx, 0, 0.42]}>
          <boxGeometry args={[0.02, chuteH - 0.4, 0.04]} />
          <meshStandardMaterial
            color="#107C41"
            emissive="#107C41"
            emissiveIntensity={1.8}
          />
        </mesh>
      ))}

      {/* Backplate */}
      <mesh position={[0, 0, -0.42]}>
        <boxGeometry args={[1.7, chuteH, 0.04]} />
        <meshPhysicalMaterial color="#0B130E" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Downward direction arrows on backplate */}
      {[-1.2, 0, 1.2].map((y, i) => (
        <mesh key={i} position={[0, y, -0.39]}>
          <planeGeometry args={[0.3, 0.12]} />
          <meshStandardMaterial
            color="#107C41"
            emissive="#107C41"
            emissiveIntensity={1.2}
            transparent
            opacity={0.65}
          />
        </mesh>
      ))}

      {/* Auto-Pass Stencil Text Label */}
      <Html position={[0, 1.4, 0.5]} center transform={false} style={{ pointerEvents: 'none', userSelect: 'none' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 8,
          fontWeight: 700,
          color: '#107C41',
          background: 'rgba(16,124,65,0.15)',
          border: '1px solid rgba(16,124,65,0.4)',
          padding: '2px 6px',
          whiteSpace: 'nowrap',
          letterSpacing: '0.12em',
        }}>
          <span>▼ AUTO-PASS [STRAIGHT DOWN]</span>
        </div>
      </Html>
    </group>
  );
}

// ─── 5. Amber "Human Review" Chute (ANGLED TO TRAY ICON) ────────────────────
function HumanReviewChute() {
  // Start from diverter [0.4, 0.6, 0] to Review Tray [3.2, -2.6, 0]
  const p1 = new THREE.Vector3(0.4, 0.6, 0);
  const p2 = new THREE.Vector3(3.2, -2.7, 0);
  const diff = p2.clone().sub(p1);
  const length = diff.length();
  const angle = Math.atan2(diff.y, diff.x);
  const mid = p1.clone().add(p2).multiplyScalar(0.5);

  return (
    <group position={[mid.x, mid.y, mid.z]}>
      {/* Angled bed plate */}
      <mesh rotation={[0, 0, angle]} castShadow>
        <boxGeometry args={[length, 0.08, 0.85]} />
        <meshPhysicalMaterial color="#2B2616" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* High side guide rails */}
      {[-0.44, 0.44].map((z, idx) => (
        <mesh key={idx} position={[0, 0.1, z]} rotation={[0, 0, angle]} castShadow>
          <boxGeometry args={[length, 0.22, 0.04]} />
          <meshPhysicalMaterial color="#3D351D" metalness={0.85} roughness={0.25} />
        </mesh>
      ))}

      {/* Amber glowing illuminated neon strip along bottom edge */}
      <mesh position={[0, 0.06, 0.44]} rotation={[0, 0, angle]}>
        <boxGeometry args={[length - 0.2, 0.02, 0.03]} />
        <meshStandardMaterial
          color="#FFB900"
          emissive="#FFB900"
          emissiveIntensity={2.2}
        />
      </mesh>

      {/* Angled chute stenciled badge */}
      <Html position={[0, 0.35, 0.5]} center transform={false} style={{ pointerEvents: 'none', userSelect: 'none' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 8,
          fontWeight: 700,
          color: '#FFB900',
          background: 'rgba(255,185,0,0.15)',
          border: '1px solid rgba(255,185,0,0.4)',
          padding: '2px 6px',
          whiteSpace: 'nowrap',
          letterSpacing: '0.12em',
        }}>
          <span>▶ HUMAN REVIEW CHUTE</span>
        </div>
      </Html>
    </group>
  );
}

// ─── 6. Auto-Pass Collector Bin (Straight Down) ──────────────────────────────
function AutoPassBin() {
  return (
    <group position={PASS_BIN_POS}>
      {/* Heavy base container */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.8, 1.2]} />
        <meshPhysicalMaterial color="#101813" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Reinforced green top rim */}
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[1.86, 0.06, 1.26]} />
        <meshPhysicalMaterial color="#1B3824" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Glowing Status LED beacon */}
      <mesh position={[0.75, 0.15, 0.62]}>
        <boxGeometry args={[0.1, 0.1, 0.02]} />
        <meshStandardMaterial color="#107C41" emissive="#107C41" emissiveIntensity={3} />
      </mesh>

      {/* Pre-stacked passed cards inside bin */}
      {[-0.15, -0.05, 0.05].map((sy, i) => (
        <mesh key={i} position={[0, sy, 0]}>
          <boxGeometry args={[1.3, 0.03, 1.0]} />
          <meshStandardMaterial color="#19231D" />
        </mesh>
      ))}

      {/* Label with icon badge */}
      <Html position={[0, -0.65, 0.65]} center transform={false} style={{ pointerEvents: 'none', userSelect: 'none' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 9,
          fontWeight: 700,
          color: '#107C41',
          letterSpacing: '0.12em',
          background: 'rgba(16,124,65,0.18)',
          border: '1px solid rgba(16,124,65,0.5)',
          padding: '3px 10px',
          boxShadow: '0 0 12px rgba(16,124,65,0.25)',
          whiteSpace: 'nowrap',
        }}>
          <CheckCircle2 size={12} color="#107C41" />
          <span>AUTO-PASS BIN // 0-ERROR</span>
        </div>
      </Html>
    </group>
  );
}

// ─── 7. Human Review Tray (Angled to Tray Icon) ──────────────────────────────
function HumanReviewTray() {
  return (
    <group position={REVIEW_TRAY_POS}>
      {/* Tilted catch tray base */}
      <group rotation={[0, 0, -0.2]}>
        {/* Tray base platform */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.8, 0.45, 1.2]} />
          <meshPhysicalMaterial color="#211E15" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Amber rim accent */}
        <mesh position={[0, 0.24, 0]}>
          <boxGeometry args={[1.85, 0.04, 1.25]} />
          <meshPhysicalMaterial color="#4A3D1C" metalness={0.9} roughness={0.15} />
        </mesh>

        {/* Front retainer lip to stop sliding card */}
        <mesh position={[0.9, 0.35, 0]}>
          <boxGeometry args={[0.06, 0.28, 1.15]} />
          <meshPhysicalMaterial color="#FFB900" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Glowing Amber beacon */}
        <mesh position={[-0.75, 0.1, 0.62]}>
          <boxGeometry args={[0.1, 0.1, 0.02]} />
          <meshStandardMaterial color="#FFB900" emissive="#FFB900" emissiveIntensity={3} />
        </mesh>

        {/* Pre-stacked review cards */}
        {[-0.05, 0.05].map((sy, i) => (
          <mesh key={i} position={[0.1, sy, 0]}>
            <boxGeometry args={[1.3, 0.03, 1.0]} />
            <meshStandardMaterial color="#2D281C" />
          </mesh>
        ))}
      </group>

      {/* ── Prominent Tray Icon Floating Overhead & Embellishing Review Tray ── */}
      <group position={[0, 0.85, 0.6]}>
        <Html center transform={false} style={{ pointerEvents: 'none', userSelect: 'none' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}>
            {/* Glowing amber tray icon badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 38,
              height: 38,
              background: 'rgba(255, 185, 0, 0.18)',
              border: '2px solid #FFB900',
              borderRadius: 0,
              boxShadow: '0 0 18px rgba(255, 185, 0, 0.45)',
              color: '#FFB900',
              animation: 'pulse 2s infinite',
            }}>
              <Inbox size={22} color="#FFB900" strokeWidth={2.2} />
            </div>

            {/* Label banner */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 9,
              fontWeight: 700,
              color: '#FFB900',
              letterSpacing: '0.12em',
              background: 'rgba(255,185,0,0.15)',
              border: '1px solid rgba(255,185,0,0.4)',
              padding: '3px 8px',
              whiteSpace: 'nowrap',
            }}>
              <AlertTriangle size={11} color="#FFB900" />
              <span>HUMAN REVIEW TRAY</span>
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
}

// ─── 8. Animated Invoice Card (Pass Straight Down vs Review Angled) ───────────
interface InvoiceCardProps {
  timeRef: React.MutableRefObject<number>;
  outcomeRef: React.MutableRefObject<'pass' | 'review'>;
}
function InvoiceCard({ timeRef, outcomeRef }: InvoiceCardProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const bodyRef  = useRef<THREE.MeshPhysicalMaterial>(null!);
  const ledRef   = useRef<THREE.MeshStandardMaterial>(null!);

  useFrame(() => {
    const t = timeRef.current;
    const phase = getPhase(t);
    const isPass = outcomeRef.current === 'pass';

    let x = 0;
    let y = CARD_Y_START;
    let rotZ = 0;
    let opacity = 1;

    if (phase === 'DROPPING') {
      // 1. Drops from above into funnel intake
      const p = easeInQuad(t / T_DROP_END);
      y = THREE.MathUtils.lerp(CARD_Y_START, CARD_Y_FUNNEL, p);
      x = Math.sin(t * 5) * 0.04 * (1 - p);
      rotZ = Math.sin(t * 4) * 0.05 * (1 - p);
    } else if (phase === 'DECIDING') {
      // 2. Holds at decision gate with high-frequency scanner jitter
      y = CARD_Y_FUNNEL;
      const decT = (t - T_DROP_END) / (T_DECIDE_END - T_DROP_END);
      x = Math.sin(decT * 18) * 0.02;
      rotZ = Math.sin(decT * 22) * 0.01;
    } else if (phase === 'ROUTING') {
      // 3. Routing phase:
      // PASS: straight down along x=0
      // REVIEW: slides down angled chute toward [3.6, -3.2]
      const p = easeOutQuad((t - T_DECIDE_END) / (T_ROUTE_END - T_DECIDE_END));
      if (isPass) {
        x = 0;
        y = THREE.MathUtils.lerp(CARD_Y_FUNNEL, PASS_BIN_POS[1] + 0.6, p);
        rotZ = 0;
      } else {
        x = THREE.MathUtils.lerp(0, REVIEW_TRAY_POS[0] - 0.2, p);
        y = THREE.MathUtils.lerp(CARD_Y_FUNNEL, REVIEW_TRAY_POS[1] + 0.5, p);
        rotZ = THREE.MathUtils.lerp(0, -0.55, p); // Follows chute angle
      }
    } else if (phase === 'LANDING') {
      // 4. Settles into destination with realistic bounce
      const p = easeOutBounce((t - T_ROUTE_END) / (T_LAND_END - T_ROUTE_END));
      if (isPass) {
        x = 0;
        y = THREE.MathUtils.lerp(PASS_BIN_POS[1] + 0.6, PASS_BIN_POS[1] + 0.15, p);
        rotZ = 0;
      } else {
        x = REVIEW_TRAY_POS[0];
        y = THREE.MathUtils.lerp(REVIEW_TRAY_POS[1] + 0.5, REVIEW_TRAY_POS[1] + 0.15, p);
        rotZ = THREE.MathUtils.lerp(-0.55, -0.2, p); // Settles at tray angle
      }
    } else {
      // 5. RESET — card fades out as next one prepares to drop
      const resetP = (t - T_LAND_END) / (T_TOTAL - T_LAND_END);
      opacity = Math.max(0, 1 - resetP * 2.2);
      if (isPass) {
        x = 0;
        y = PASS_BIN_POS[1] + 0.15;
        rotZ = 0;
      } else {
        x = REVIEW_TRAY_POS[0];
        y = REVIEW_TRAY_POS[1] + 0.15;
        rotZ = -0.2;
      }
    }

    if (groupRef.current) {
      groupRef.current.position.set(x, y, 0.05);
      groupRef.current.rotation.z = rotZ;
    }

    // Dynamic material color update
    if (bodyRef.current) {
      bodyRef.current.opacity = opacity;
    }
    if (ledRef.current) {
      ledRef.current.opacity = opacity;
      if (phase === 'DECIDING') {
        ledRef.current.color.set('#0078D4');
        ledRef.current.emissive.set('#0078D4');
      } else if (phase === 'ROUTING' || phase === 'LANDING') {
        const col = isPass ? '#107C41' : '#FFB900';
        ledRef.current.color.set(col);
        ledRef.current.emissive.set(col);
      } else {
        ledRef.current.color.set('#575C6C');
        ledRef.current.emissive.set('#575C6C');
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, CARD_Y_START, 0.05]}>
      {/* Invoice Card Slab */}
      <mesh castShadow>
        <boxGeometry args={[1.4, 1.9, 0.04]} />
        <meshPhysicalMaterial
          ref={bodyRef}
          color="#12141C"
          metalness={0.35}
          roughness={0.45}
          clearcoat={0.6}
          clearcoatRoughness={0.2}
          transparent
        />
      </mesh>

      {/* Top Banner Stripe */}
      <mesh position={[0, 0.8, 0.023]}>
        <planeGeometry args={[1.36, 0.16]} />
        <meshStandardMaterial
          ref={ledRef}
          color="#0078D4"
          emissive="#0078D4"
          emissiveIntensity={0.8}
          transparent
        />
      </mesh>

      {/* Invoice Details Simulated Lines */}
      {[0.5, 0.25, 0.0, -0.25, -0.5].map((ly, i) => (
        <mesh key={i} position={[0, ly, 0.023]}>
          <planeGeometry args={[1.15, 0.12]} />
          <meshStandardMaterial color={i === 0 ? '#1E2330' : '#141822'} transparent opacity={0.85} />
        </mesh>
      ))}

      {/* Bottom Barcode */}
      <mesh position={[0, -0.78, 0.023]}>
        <planeGeometry args={[1.1, 0.05]} />
        <meshStandardMaterial color="#4A5268" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

// ─── 9. Live Floating Outcome HUD Tag ───────────────────────────────────────
interface ResultBadgeProps {
  timeRef: React.MutableRefObject<number>;
  outcomeRef: React.MutableRefObject<'pass' | 'review'>;
}
function ResultBadge({ timeRef, outcomeRef }: ResultBadgeProps) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    const t = timeRef.current;
    const isVisible = t > T_DECIDE_END - 0.2 && t < T_ROUTE_END + 0.6;
    if (groupRef.current) {
      groupRef.current.visible = isVisible;
      if (isVisible) {
        const age = t - (T_DECIDE_END - 0.2);
        const scale = easeOutCubic(Math.min(1, age / 0.25));
        groupRef.current.scale.setScalar(scale);

        // Follow card loosely
        if (outcomeRef.current === 'pass') {
          groupRef.current.position.set(0, CARD_Y_FUNNEL + 0.8, 0.2);
        } else {
          groupRef.current.position.set(1.5, CARD_Y_FUNNEL + 0.6, 0.2);
        }
      }
    }
  });

  const isPass = outcomeRef.current === 'pass';
  const color = isPass ? '#107C41' : '#FFB900';
  const label = isPass ? 'AUTO-PASS: 3-WAY MATCH' : 'HUMAN REVIEW: VARIANCE';

  return (
    <group ref={groupRef} position={[0, CARD_Y_FUNNEL + 0.8, 0.2]}>
      <Html center transform={false} style={{ pointerEvents: 'none', userSelect: 'none' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: `${color}25`,
          border: `1.5px solid ${color}`,
          padding: '4px 10px',
          fontFamily: 'JetBrains Mono, monospace',
          whiteSpace: 'nowrap',
          boxShadow: `0 0 16px ${color}55`,
        }}>
          {isPass ? <ShieldCheck size={13} color={color} /> : <AlertTriangle size={13} color={color} />}
          <span style={{
            color,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.12em',
          }}>
            {label}
          </span>
        </div>
      </Html>
    </group>
  );
}

// ─── 10. Floor Plane ────────────────────────────────────────────────────────
function FloorPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5.2, 0]} receiveShadow>
      <planeGeometry args={[32, 22]} />
      <meshStandardMaterial color="#08090C" metalness={0.6} roughness={0.8} />
    </mesh>
  );
}

// ─── 11. Industrial Scene Lighting ──────────────────────────────────────────
function SceneLights({ timeRef, outcomeRef }: {
  timeRef: React.MutableRefObject<number>;
  outcomeRef: React.MutableRefObject<'pass' | 'review'>;
}) {
  const gateSpotRef = useRef<THREE.SpotLight>(null!);

  useFrame(() => {
    const t = timeRef.current;
    const deciding = t >= T_DROP_END && t < T_DECIDE_END;
    if (gateSpotRef.current) {
      gateSpotRef.current.intensity = deciding ? 7 + Math.sin(t * 14) * 2.5 : 2.5;
    }
  });

  return (
    <>
      <ambientLight intensity={0.2} color="#151722" />
      <directionalLight
        position={[4, 12, 6]}
        intensity={2.4}
        color="#D6E4FF"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.001}
      />
      <directionalLight position={[-5, -2, 4]} intensity={0.4} color="#0078D4" />

      {/* Decision gate scanner spotlight */}
      <spotLight
        ref={gateSpotRef}
        position={[0, CARD_Y_FUNNEL + 2.5, 3]}
        target-position={[0, CARD_Y_FUNNEL, 0]}
        angle={0.45}
        penumbra={0.6}
        color="#0078D4"
        intensity={2.5}
        distance={10}
        decay={2}
      />

      {/* Auto-pass green point light directly over straight chute */}
      <pointLight
        position={[PASS_BIN_POS[0], PASS_BIN_POS[1] + 1.2, 1.2]}
        color="#107C41"
        intensity={1.8}
        distance={6}
        decay={2}
      />

      {/* Human review amber point light over angled tray */}
      <pointLight
        position={[REVIEW_TRAY_POS[0], REVIEW_TRAY_POS[1] + 1.2, 1.2]}
        color="#FFB900"
        intensity={2.0}
        distance={6}
        decay={2}
      />
    </>
  );
}

// ─── 12. Main Content Component ─────────────────────────────────────────────
export interface SortingFunnelSceneContentProps {
  timeRef: React.MutableRefObject<number>;
  outcomeRef: React.MutableRefObject<'pass' | 'review'>;
  cycleRef: React.MutableRefObject<number>;
}

export function SortingFunnelSceneContent({
  timeRef,
  outcomeRef,
}: SortingFunnelSceneContentProps) {
  return (
    <>
      <SceneLights timeRef={timeRef} outcomeRef={outcomeRef} />
      <FunnelBody />
      <DecisionGate timeRef={timeRef} outcomeRef={outcomeRef} />
      <DiverterArm timeRef={timeRef} outcomeRef={outcomeRef} />
      <AutoPassChute />
      <HumanReviewChute />
      <AutoPassBin />
      <HumanReviewTray />
      <InvoiceCard timeRef={timeRef} outcomeRef={outcomeRef} />
      <ResultBadge timeRef={timeRef} outcomeRef={outcomeRef} />
      <FloorPlane />
    </>
  );
}

export {
  T_DROP_END as SORT_T_DROP,
  T_DECIDE_END as SORT_T_DECIDE,
  T_ROUTE_END as SORT_T_ROUTE,
  T_LAND_END as SORT_T_LAND,
};
