/**
 * ThePileScene.tsx — "The Pile" 3D invoice card chaos → clean grid
 *
 * Architecture:
 *   - R3F Canvas renders 18 invoice cards (BoxGeometry)
 *   - Each card has a "chaos" position (random X/Y/Z offsets, random rotations)
 *     and a "grid" position (clean 6×3 grid layout)
 *   - Parent component drives a `progress` ref (0→1) via GSAP ScrollTrigger
 *   - useFrame lerps each card from chaos→grid using the progress value
 *   - Cards have MeshPhysicalMaterial (brushed metal / frosted glass look)
 *   - Dramatic directional lighting for heavy shadows
 */

import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Invoice card data (each card has a vendor + amount + status) ────────────
interface CardData {
  vendor: string;
  amount: string;
  status: 'DUPLICATE' | 'VARIANCE' | 'MATCH' | 'MISSING_PO' | 'OVERPAY';
  statusColor: string;
}

const CARDS: CardData[] = [
  { vendor: 'ACME LOGISTICS',    amount: '$24,800',  status: 'DUPLICATE',   statusColor: '#D13438' },
  { vendor: 'TECHSUPPLY CO',     amount: '$8,220',   status: 'VARIANCE',    statusColor: '#FFB900' },
  { vendor: 'GLOBALFREIGHT LTD', amount: '$102,500', status: 'MISSING_PO',  statusColor: '#D13438' },
  { vendor: 'OFFICESOURCE',      amount: '$3,450',   status: 'MATCH',       statusColor: '#107C41' },
  { vendor: 'AZURE CLOUD SVC',   amount: '$45,000',  status: 'OVERPAY',     statusColor: '#D13438' },
  { vendor: 'HARRIS MFGR',       amount: '$12,100',  status: 'VARIANCE',    statusColor: '#FFB900' },
  { vendor: 'METRO ENERGY',      amount: '$67,300',  status: 'DUPLICATE',   statusColor: '#D13438' },
  { vendor: 'PINNACLE STAFFING', amount: '$29,450',  status: 'MATCH',       statusColor: '#107C41' },
  { vendor: 'DATABRIDGE INC',    amount: '$18,760',  status: 'MISSING_PO',  statusColor: '#D13438' },
  { vendor: 'SUMMIT CAPITAL',    amount: '$54,900',  status: 'VARIANCE',    statusColor: '#FFB900' },
  { vendor: 'UNITED SERVICES',   amount: '$9,000',   status: 'MATCH',       statusColor: '#107C41' },
  { vendor: 'IRONCLAD PARTS',    amount: '$33,200',  status: 'DUPLICATE',   statusColor: '#D13438' },
  { vendor: 'WESTFIELD GROUP',   amount: '$76,100',  status: 'OVERPAY',     statusColor: '#D13438' },
  { vendor: 'NOVA SYSTEMS',      amount: '$5,500',   status: 'MATCH',       statusColor: '#107C41' },
  { vendor: 'CRESTVIEW MEDIA',   amount: '$21,300',  status: 'VARIANCE',    statusColor: '#FFB900' },
  { vendor: 'FORTRESS SEC',      amount: '$14,900',  status: 'MISSING_PO',  statusColor: '#D13438' },
  { vendor: 'ALPHA NETWORKS',    amount: '$88,000',  status: 'DUPLICATE',   statusColor: '#D13438' },
  { vendor: 'MIDLAND LOGISTICS', amount: '$6,750',   status: 'MATCH',       statusColor: '#107C41' },
];

// Grid layout: 6 columns × 3 rows
const GRID_COLS = 6;
const CARD_W = 1.5;
const CARD_H = 2.0;
const CARD_D = 0.04;
const GAP_X = 0.22;
const GAP_Y = 0.28;

function gridPosition(index: number): [number, number, number] {
  const col = index % GRID_COLS;
  const row = Math.floor(index / GRID_COLS);
  const totalW = GRID_COLS * (CARD_W + GAP_X) - GAP_X;
  const totalH = 3 * (CARD_H + GAP_Y) - GAP_Y;
  const x = col * (CARD_W + GAP_X) - totalW / 2 + CARD_W / 2;
  const y = -(row * (CARD_H + GAP_Y)) + totalH / 2 - CARD_H / 2;
  return [x, y, 0];
}

// ─── Deterministic seeded "random" for consistent chaos positions ────────────
function seeded(n: number, salt: number = 0): number {
  const x = Math.sin(n * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function chaosPosition(index: number): [number, number, number] {
  return [
    (seeded(index, 0) - 0.5) * 9,
    (seeded(index, 1) - 0.5) * 5,
    (seeded(index, 2) - 0.5) * 3.5 - 0.5,
  ];
}

function chaosRotation(index: number): [number, number, number] {
  return [
    (seeded(index, 3) - 0.5) * Math.PI * 1.1,
    (seeded(index, 4) - 0.5) * Math.PI * 0.9,
    (seeded(index, 5) - 0.5) * Math.PI * 1.4,
  ];
}

// ─── Color map for card surface based on status ─────────────────────────────
function cardBaseColor(status: CardData['status']): string {
  switch (status) {
    case 'DUPLICATE':  return '#1A0808';
    case 'VARIANCE':   return '#1A1500';
    case 'MISSING_PO': return '#1A0808';
    case 'OVERPAY':    return '#1A0808';
    case 'MATCH':      return '#081A0E';
    default:           return '#111318';
  }
}

// ─── Single Invoice Card Mesh ────────────────────────────────────────────────
interface InvoiceCardMeshProps {
  index: number;
  card: CardData;
  progressRef: React.MutableRefObject<number>;
}

function InvoiceCardMesh({ index, card, progressRef }: InvoiceCardMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);
  const [isHovered, setIsHovered] = useState(false);

  const chaosPos = useMemo(() => chaosPosition(index), [index]);
  const chaosRot = useMemo(() => chaosRotation(index), [index]);
  const gridPos  = useMemo(() => gridPosition(index), [index]);
  const gridRot: [number, number, number] = [0, 0, 0];

  const statusColor = new THREE.Color(card.statusColor);
  const baseColor   = new THREE.Color(cardBaseColor(card.status));

  // Hover glow color & intensity
  const hoverColor = useMemo(() => new THREE.Color('#0078D4'), []);

  useFrame(() => {
    if (!meshRef.current) return;
    const p = progressRef.current;
    // Smooth ease: cubic ease-in-out for each card with staggered delay
    const delay = index * 0.015;
    const eased = Math.max(0, Math.min(1, (p - delay) / (1 - delay)));
    const t = eased < 0.5 ? 4 * eased ** 3 : 1 - (-2 * eased + 2) ** 3 / 2;

    meshRef.current.position.x = THREE.MathUtils.lerp(chaosPos[0], gridPos[0], t);
    meshRef.current.position.y = THREE.MathUtils.lerp(chaosPos[1], gridPos[1], t);
    meshRef.current.position.z = THREE.MathUtils.lerp(chaosPos[2], gridPos[2], t);
    meshRef.current.rotation.x = THREE.MathUtils.lerp(chaosRot[0], gridRot[0], t);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(chaosRot[1], gridRot[1], t);
    meshRef.current.rotation.z = THREE.MathUtils.lerp(chaosRot[2], gridRot[2], t);

    // Hover lift: smooth lerp toward camera on Z when hovered (only when in grid)
    if (groupRef.current && t > 0.8) {
      const targetZ = isHovered ? 0.4 : 0;
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.12);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Card body */}
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); }}
        onPointerOut={(e) => { e.stopPropagation(); setIsHovered(false); }}
      >
        <boxGeometry args={[CARD_W, CARD_H, CARD_D]} />
        <meshPhysicalMaterial
          color={isHovered ? '#1E2236' : baseColor}
          metalness={0.3}
          roughness={0.55}
          clearcoat={0.4}
          clearcoatRoughness={0.3}
          reflectivity={0.6}
          envMapIntensity={0.4}
          emissive={isHovered ? hoverColor : baseColor}
          emissiveIntensity={isHovered ? 0.6 : 0}
        />

        {/* Top accent stripe — status color bar at top of card */}
        <mesh position={[0, CARD_H / 2 - 0.08, CARD_D / 2 + 0.001]}>
          <planeGeometry args={[CARD_W, 0.12]} />
          <meshStandardMaterial color={statusColor} emissive={statusColor} emissiveIntensity={0.8} />
        </mesh>

        {/* Hover wireframe perimeter rim — blue accent */}
        {isHovered && (
          <mesh position={[0, 0, CARD_D / 2 + 0.002]}>
            <boxGeometry args={[CARD_W + 0.04, CARD_H + 0.04, 0.01]} />
            <meshBasicMaterial color="#0078D4" wireframe />
          </mesh>
        )}
      </mesh>
    </group>
  );
}

// ─── The scene root ──────────────────────────────────────────────────────────
interface ThePileSceneProps {
  progressRef: React.MutableRefObject<number>;
}

function SceneContent({ progressRef }: ThePileSceneProps) {
  return (
    <>
      {/* Lighting: dramatic industrial */}
      <ambientLight intensity={0.12} color="#111827" />

      {/* Key light: harsh directional from upper-left */}
      <directionalLight
        position={[-6, 8, 4]}
        intensity={3.5}
        color="#B8D4FF"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0005}
      />

      {/* Fill light: warm amber from right */}
      <pointLight position={[7, -2, 3]} intensity={1.2} color="#FFB900" distance={20} decay={2} />

      {/* Rim light: cold blue from behind */}
      <pointLight position={[0, -5, -6]} intensity={2.0} color="#0078D4" distance={18} decay={2} />

      {/* Accent: red/error glow from below-left */}
      <pointLight position={[-4, -4, 2]} intensity={0.9} color="#D13438" distance={14} decay={2} />

      {/* Floor shadow receiver */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <shadowMaterial opacity={0.35} />
      </mesh>

      {/* Cards */}
      {CARDS.map((card, i) => (
        <InvoiceCardMesh key={i} index={i} card={card} progressRef={progressRef} />
      ))}
    </>
  );
}

// ─── Exported canvas wrapper ─────────────────────────────────────────────────
export function ThePileScene({ progressRef }: ThePileSceneProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 12], fov: 52 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
      style={{ background: 'transparent' }}
    >
      <SceneContent progressRef={progressRef} />
    </Canvas>
  );
}
