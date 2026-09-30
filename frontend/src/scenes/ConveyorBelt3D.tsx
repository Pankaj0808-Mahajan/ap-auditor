import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// Invoice Card data model
export interface InvoiceItem {
  id: string;
  vendor: string;
  invoiceNo: string;
  amount: string;
  outcome: 'pass' | 'warning' | 'error';
  flagReason?: string;
  taxVariance?: string;
  progress: number; // 0 to 1 along conveyor path
}

const INITIAL_INVOICES: InvoiceItem[] = [
  {
    id: 'INV-101',
    vendor: 'SIEMENS POWER & ENERGY',
    invoiceNo: 'INV-2026-8801',
    amount: '$148,200.00',
    outcome: 'pass',
    taxVariance: '0.00%',
    progress: 0.05,
  },
  {
    id: 'INV-102',
    vendor: 'KYOCERA HARDWARE CORP',
    invoiceNo: 'INV-2026-8802',
    amount: '$24,650.00',
    outcome: 'warning',
    flagReason: 'UNIT PRICE DRIFT >4.5% OVER PO',
    taxVariance: '+4.50%',
    progress: 0.28,
  },
  {
    id: 'INV-103',
    vendor: 'TITAN HYDRAULICS FAB',
    invoiceNo: 'INV-2026-8803',
    amount: '$312,900.00',
    outcome: 'pass',
    taxVariance: '0.00%',
    progress: 0.52,
  },
  {
    id: 'INV-104',
    vendor: 'APEX LOGISTICS INTL',
    invoiceNo: 'INV-2026-8804',
    amount: '$84,100.00',
    outcome: 'error',
    flagReason: 'CRITICAL DUPLICATE PO #88902 ALREADY PAID',
    taxVariance: 'DUPLICATE',
    progress: 0.75,
  },
  {
    id: 'INV-105',
    vendor: 'MITSUBISHI MECHATRONICS',
    invoiceNo: 'INV-2026-8805',
    amount: '$91,400.00',
    outcome: 'pass',
    taxVariance: '0.00%',
    progress: 0.95,
  },
];

export const ConveyorBelt3D: React.FC = () => {
  const [hoveredCard, setHoveredCard] = useState<InvoiceItem | null>(null);
  
  // Track continuous invoice positions
  const invoicesRef = useRef<InvoiceItem[]>(INITIAL_INVOICES.map((inv) => ({ ...inv })));
  const cardsMeshRefs = useRef<(THREE.Group | null)[]>([]);
  const rollersGroupRef = useRef<THREE.Group>(null);
  const laserBeamRef = useRef<THREE.Mesh>(null);
  const scanGateLightRef = useRef<THREE.PointLight>(null);

  // Conveyor path bounds in 3D units
  const BELT_START_X = -7.5;
  const BELT_END_X = 7.5;
  const BELT_LENGTH = BELT_END_X - BELT_START_X;
  const SCAN_X = 0.0;
  const DIVERTER_X = 1.4;

  // Mechanical conveyor speed (units per second)
  const CONVEYOR_SPEED = 0.85;

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // 1. Rotate conveyor rollers continuously
    if (rollersGroupRef.current) {
      rollersGroupRef.current.children.forEach((roller) => {
        roller.rotation.z -= delta * 3.5;
      });
    }

    // 2. Oscillate laser scan sweep at the gate
    if (laserBeamRef.current) {
      laserBeamRef.current.position.y = 0.4 + Math.sin(t * 8) * 0.35;
      const scanMat = laserBeamRef.current.material as THREE.MeshBasicMaterial;
      if (scanMat) {
        scanMat.opacity = 0.4 + Math.sin(t * 14) * 0.2;
      }
    }

    // 3. Advance each invoice card along the conveyor belt
    const invoices = invoicesRef.current;
    let currentScanning = false;

    invoices.forEach((card, index) => {
      // Advance progress
      card.progress += (delta * CONVEYOR_SPEED) / BELT_LENGTH;
      if (card.progress >= 1.0) {
        card.progress = 0.0; // Loop back seamlessly to start
      }

      const cardGroup = cardsMeshRefs.current[index];
      if (!cardGroup) return;

      const currentX = BELT_START_X + card.progress * BELT_LENGTH;

      // Check if card is currently passing through the scanner gate (X around 0)
      const distToGate = Math.abs(currentX - SCAN_X);
      if (distToGate < 0.6) {
        currentScanning = true;
      }

      // Trajectory calculation:
      if (currentX < DIVERTER_X || card.outcome === 'pass') {
        // Standard straight path along belt surface (Y = 0.08, Z = 0)
        cardGroup.position.set(currentX, 0.08, 0);
        cardGroup.rotation.set(0, 0, 0);
      } else {
        // Flagged card (Warning or Error): drops down into side collection tray
        // Smooth mechanical drop-chute trajectory using easeOutExpo
        const dropProgress = Math.min((currentX - DIVERTER_X) / 2.8, 1.0);
        const easeDrop = 1 - Math.pow(2, -10 * dropProgress); // easeOutExpo
        
        const dropY = 0.08 - easeDrop * 1.35; // Drops down into tray
        const dropZ = easeDrop * 1.6; // Slides forward-left into angled side tray
        const tiltX = easeDrop * 0.25; // Mechanical pitch tilt
        const tiltZ = -easeDrop * 0.15; // Roll tilt

        cardGroup.position.set(currentX, dropY, dropZ);
        cardGroup.rotation.set(tiltX, 0, tiltZ);
      }
    });

    if (currentScanning) {
      if (scanGateLightRef.current) {
        scanGateLightRef.current.color.set('#0078D4');
        scanGateLightRef.current.intensity = 3.5;
      }
    } else {
      if (scanGateLightRef.current) {
        scanGateLightRef.current.intensity = 1.5;
      }
    }
  });

  return (
    <group position={[0, 0.4, 0]}>
      {/* ================================================================= */}
      {/* 1. MECHANICAL CONVEYOR BELT BED & ROLLERS                          */}
      {/* ================================================================= */}

      {/* Main Belt Surface (Dark matte textured graphite) */}
      <mesh position={[0, -0.02, 0]} receiveShadow>
        <boxGeometry args={[15.6, 0.12, 2.4]} />
        <meshStandardMaterial
          color="#13141A"
          roughness={0.7}
          metalness={0.4}
        />
      </mesh>

      {/* Belt Center Traction Ribs */}
      <mesh position={[0, 0.045, 0]} receiveShadow>
        <boxGeometry args={[15.5, 0.01, 2.1]} />
        <meshStandardMaterial
          color="#161822"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Brushed Metal Side Rails (Front and Back) */}
      <mesh position={[0, 0.12, 1.25]} castShadow receiveShadow>
        <boxGeometry args={[15.8, 0.22, 0.08]} />
        <meshStandardMaterial
          color="#2B2E3D"
          metalness={0.9}
          roughness={0.25}
        />
      </mesh>
      <mesh position={[0, 0.12, -1.25]} castShadow receiveShadow>
        <boxGeometry args={[15.8, 0.22, 0.08]} />
        <meshStandardMaterial
          color="#2B2E3D"
          metalness={0.9}
          roughness={0.25}
        />
      </mesh>

      {/* Cylindrical Drive Rollers along belt bottom */}
      <group ref={rollersGroupRef}>
        {Array.from({ length: 17 }).map((_, i) => {
          const rx = -7.0 + i * 0.88;
          return (
            <mesh key={i} position={[rx, -0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.16, 0.16, 2.3, 16]} />
              <meshStandardMaterial
                color="#1E202B"
                metalness={0.9}
                roughness={0.3}
              />
            </mesh>
          );
        })}
      </group>

      {/* Heavy Steel Vertical Support Pylons / Legs */}
      {[-6.0, -2.5, 2.5, 6.0].map((px) => (
        <group key={px} position={[px, -1.2, 0]}>
          <mesh position={[0, 0, 1.1]} castShadow>
            <boxGeometry args={[0.2, 2.2, 0.2]} />
            <meshStandardMaterial color="#161821" roughness={0.5} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0, -1.1]} castShadow>
            <boxGeometry args={[0.2, 2.2, 0.2]} />
            <meshStandardMaterial color="#161821" roughness={0.5} metalness={0.8} />
          </mesh>
          {/* Cross brace */}
          <mesh position={[0, -0.5, 0]}>
            <boxGeometry args={[0.12, 0.1, 2.2]} />
            <meshStandardMaterial color="#2B2E3D" roughness={0.4} metalness={0.9} />
          </mesh>
        </group>
      ))}

      {/* ================================================================= */}
      {/* 2. SIDE EXCEPTION EJECTION TRAY (For Flagged Amber/Red Cards)     */}
      {/* ================================================================= */}
      <group position={[3.6, -1.2, 1.6]}>
        {/* Angled steel chute receiver */}
        <mesh position={[0, 0, 0]} rotation={[-0.2, 0, 0.08]} receiveShadow>
          <boxGeometry args={[3.8, 0.08, 1.8]} />
          <meshStandardMaterial
            color="#14161F"
            metalness={0.85}
            roughness={0.3}
          />
        </mesh>
        {/* Tray side lips */}
        <mesh position={[0, 0.15, 0.9]} rotation={[-0.2, 0, 0.08]}>
          <boxGeometry args={[3.8, 0.22, 0.06]} />
          <meshStandardMaterial color="#FFB900" emissive="#FFB900" emissiveIntensity={0.2} metalness={0.6} />
        </mesh>
        {/* Hazard warning stripe label on tray */}
        <mesh position={[0, 0.22, 0.92]} rotation={[-0.2, 0, 0.08]}>
          <planeGeometry args={[2.8, 0.1]} />
          <meshBasicMaterial color="#FFB900" />
        </mesh>
      </group>

      {/* ================================================================= */}
      {/* 3. THE SCANNER GATE (Midway at X = 0.0)                            */}
      {/* ================================================================= */}
      <group position={[0, 0.9, 0]}>
        {/* Vertical Left Arch Pylon */}
        <mesh position={[0, 0, 1.45]} castShadow>
          <boxGeometry args={[0.35, 2.2, 0.35]} />
          <meshStandardMaterial
            color="#0E1017"
            metalness={0.95}
            roughness={0.2}
          />
        </mesh>
        {/* Hairline accent line on left pylon */}
        <mesh position={[0.18, 0, 1.45]}>
          <boxGeometry args={[0.02, 2.1, 0.06]} />
          <meshBasicMaterial color="#0078D4" />
        </mesh>

        {/* Vertical Right Arch Pylon */}
        <mesh position={[0, 0, -1.45]} castShadow>
          <boxGeometry args={[0.35, 2.2, 0.35]} />
          <meshStandardMaterial
            color="#0E1017"
            metalness={0.95}
            roughness={0.2}
          />
        </mesh>
        {/* Hairline accent line on right pylon */}
        <mesh position={[0.18, 0, -1.45]}>
          <boxGeometry args={[0.02, 2.1, 0.06]} />
          <meshBasicMaterial color="#0078D4" />
        </mesh>

        {/* Top Scanner Crossbeam / Sensor Housing */}
        <mesh position={[0, 1.15, 0]} castShadow>
          <boxGeometry args={[0.42, 0.32, 3.25]} />
          <meshStandardMaterial
            color="#141722"
            metalness={0.9}
            roughness={0.25}
          />
        </mesh>

        {/* Microsoft Blue Inspection Head Array */}
        <mesh position={[0, 0.98, 0]}>
          <boxGeometry args={[0.22, 0.04, 2.6]} />
          <meshStandardMaterial
            color="#0078D4"
            emissive="#0078D4"
            emissiveIntensity={0.8}
          />
        </mesh>

        {/* Glowing Laser Scan Plane (Translucent Cyan/Blue Sheet) */}
        <mesh position={[0, -0.05, 0]}>
          <planeGeometry args={[0.02, 2.0]} />
          <meshBasicMaterial
            color="#0078D4"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Dynamic Moving Laser Sweep Line */}
        <mesh ref={laserBeamRef} position={[0, 0.4, 0]}>
          <boxGeometry args={[0.06, 0.03, 2.5]} />
          <meshBasicMaterial
            color="#0078D4"
            transparent
            opacity={0.6}
          />
        </mesh>

        {/* Scanner Local Lighting */}
        <pointLight
          ref={scanGateLightRef}
          position={[0, 0.8, 0]}
          color="#0078D4"
          intensity={2.5}
          distance={5}
        />

        {/* Status Beacon on top of Scanner Arch */}
        <mesh position={[0, 1.38, 0]}>
          <boxGeometry args={[0.15, 0.12, 0.3]} />
          <meshBasicMaterial color="#0078D4" />
        </mesh>
      </group>

      {/* ================================================================= */}
      {/* 4. INVOICE CARDS (Thin Rectangular Metal Plates ~2:3 Ratio)        */}
      {/* ================================================================= */}
      {invoicesRef.current.map((card, idx) => {
        const isHovered = hoveredCard?.id === card.id;

        // Color states based on gate position and outcome:
        // Before gate (X < 0): neutral brushed metal plate
        // After gate (X >= 0): clean green (#00CC6A) or flag amber (#FFB900) or error (#D13438)
        const progressX = BELT_START_X + card.progress * BELT_LENGTH;
        const hasPassedGate = progressX >= SCAN_X;

        let edgeColor = '#3E4357';
        let glowEmissive = '#000000';
        let glowIntensity = 0;

        if (hasPassedGate) {
          if (card.outcome === 'pass') {
            edgeColor = '#00CC6A';
            glowEmissive = '#00CC6A';
            glowIntensity = 0.4;
          } else if (card.outcome === 'warning') {
            edgeColor = '#FFB900';
            glowEmissive = '#FFB900';
            glowIntensity = 0.55;
          } else if (card.outcome === 'error') {
            edgeColor = '#D13438';
            glowEmissive = '#D13438';
            glowIntensity = 0.7;
          }
        }

        if (isHovered) {
          edgeColor = '#0078D4';
          glowEmissive = '#0078D4';
          glowIntensity = 0.8;
        }

        return (
          <group
            key={card.id}
            ref={(el) => (cardsMeshRefs.current[idx] = el)}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredCard(card);
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setHoveredCard(null);
            }}
          >
            {/* Hover Lift Translation wrapper */}
            <group position={[0, isHovered ? 0.35 : 0, 0]}>
              {/* Main Plate Body: Rectangular metal plate (width 1.25, height 0.025, depth 1.85 => ~2:3 ratio) */}
              <mesh castShadow receiveShadow>
                <boxGeometry args={[1.25, 0.025, 1.85]} />
                <meshStandardMaterial
                  color="#1B1D26"
                  roughness={0.3}
                  metalness={0.85}
                  emissive={glowEmissive}
                  emissiveIntensity={glowIntensity}
                />
              </mesh>

              {/* Brushed Titanium Perimeter Rim */}
              <mesh position={[0, 0.016, 0]}>
                <boxGeometry args={[1.27, 0.01, 1.87]} />
                <meshBasicMaterial
                  color={edgeColor}
                  wireframe
                />
              </mesh>

              {/* Top Embossed Lines / Document Markings */}
              {/* Header Bar */}
              <mesh position={[-0.1, 0.018, -0.65]}>
                <boxGeometry args={[0.9, 0.005, 0.15]} />
                <meshBasicMaterial color={hasPassedGate && card.outcome !== 'pass' ? edgeColor : '#444A61'} />
              </mesh>

              {/* Sub-item Text Placeholder Bands */}
              {[-0.35, -0.15, 0.05, 0.25, 0.45].map((zOffset, lineIdx) => (
                <mesh key={lineIdx} position={[-0.15, 0.018, zOffset]}>
                  <boxGeometry args={[0.75, 0.003, 0.06]} />
                  <meshBasicMaterial color="#2B3042" />
                </mesh>
              ))}

              {/* Stamp Emblem (Square Chip) */}
              <mesh position={[0.38, 0.018, -0.65]}>
                <boxGeometry args={[0.22, 0.006, 0.22]} />
                <meshBasicMaterial color={edgeColor} />
              </mesh>

              {/* Micro-barcode on bottom right */}
              <mesh position={[0.25, 0.018, 0.65]}>
                <boxGeometry args={[0.45, 0.003, 0.12]} />
                <meshBasicMaterial color="#3E4459" />
              </mesh>

              {/* Interactive Tooltip HUD Overlay when hovered */}
              {isHovered && (
                <Html position={[0, 0.6, 0]} center distanceFactor={10} zIndexRange={[100, 0]}>
                  <div
                    className="pointer-events-none p-3 bg-[#0E0F14]/95 backdrop-blur-xl border border-white/20 shadow-2xl text-left select-none whitespace-nowrap min-w-[280px]"
                    style={{ borderRadius: 0 }}
                  >
                    {/* Tooltip Header */}
                    <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-1.5 mb-2 font-mono text-[10px]">
                      <span className="text-[#0078D4] font-bold tracking-widest">{card.id}</span>
                      <span className={`px-1.5 py-0.2 font-semibold uppercase ${
                        card.outcome === 'pass'
                          ? 'bg-[#107C41]/30 text-[#00CC6A] border border-[#00CC6A]/40'
                          : card.outcome === 'warning'
                          ? 'bg-[#FFB900]/30 text-[#FFD454] border border-[#FFB900]/40'
                          : 'bg-[#D13438]/30 text-[#FFA1A3] border border-[#D13438]/40'
                      }`}>
                        {card.outcome === 'pass' ? 'AUTOPASS NOMINAL' : card.outcome === 'warning' ? 'CAUTION FLAG' : 'CRITICAL FAULT'}
                      </span>
                    </div>

                    {/* Metadata Readout */}
                    <div className="text-xs font-semibold text-white truncate mb-1">
                      {card.vendor}
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-[#8A8F9E] mb-2">
                      <span>{card.invoiceNo}</span>
                      <span className="text-white font-bold">{card.amount}</span>
                    </div>

                    {/* Flag Reason if exception */}
                    {card.flagReason ? (
                      <div className={`p-1.5 text-[10px] font-mono border ${
                        card.outcome === 'error'
                          ? 'bg-[#D13438]/15 border-[#D13438]/50 text-[#FFA1A3]'
                          : 'bg-[#FFB900]/15 border-[#FFB900]/50 text-[#FFD454]'
                      }`}>
                        [DIAGNOSTIC] {card.flagReason}
                      </div>
                    ) : (
                      <div className="p-1.5 bg-[#107C41]/10 border border-[#107C41]/40 text-[#00CC6A] text-[10px] font-mono">
                        [VERIFIED] 3-WAY MATCH COMPLETE // ZERO VARIANCE
                      </div>
                    )}
                  </div>
                </Html>
              )}
            </group>
          </group>
        );
      })}

      {/* ================================================================= */}
      {/* 5. INDUSTRIAL FLOOR PLANE WITH DEPTH FOG                           */}
      {/* ================================================================= */}
      <mesh position={[0, -2.3, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial
          color="#0A0A0C"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
};
