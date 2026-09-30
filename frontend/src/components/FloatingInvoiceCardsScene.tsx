import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface InvoiceData {
  invoiceNo: string;
  vendor: string;
  amount: string;
  poNumber: string;
  status: 'AUTO-PASSED' | 'DUPLICATE DETECTED' | 'EXPLAINABLE FLAG';
  statusColor: string;
  statusBg: string;
  note: string;
  position: [number, number, number];
  rotation: [number, number, number];
  floatOffset: number;
}

// Procedural Canvas Texture generator for crisp, lightweight invoice graphics
function createInvoiceTexture(data: {
  invoiceNo: string;
  vendor: string;
  amount: string;
  poNumber: string;
  status: string;
  statusColor: string;
  statusBg: string;
  note: string;
}): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 700;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // 1. Base card background
    ctx.fillStyle = '#0F1218';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle inner border
    ctx.strokeStyle = '#1F2636';
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

    // 2. Header Banner
    ctx.fillStyle = '#161B26';
    ctx.fillRect(12, 12, canvas.width - 24, 75);

    // Blue accent brand dot
    ctx.fillStyle = '#0078D4';
    ctx.beginPath();
    ctx.arc(36, 50, 10, 0, Math.PI * 2);
    ctx.fill();

    // System name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px "Segoe UI", Inter, sans-serif';
    ctx.fillText('AP AUDITOR', 56, 52);

    ctx.fillStyle = '#64748B';
    ctx.font = '14px monospace';
    ctx.fillText('CLASS-4 VERIFIED', 56, 70);

    // Invoice Number
    ctx.fillStyle = '#94A3B8';
    ctx.font = '15px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(data.invoiceNo, canvas.width - 28, 45);

    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(data.poNumber, canvas.width - 28, 68);
    ctx.textAlign = 'left';

    // 3. Vendor info section
    ctx.fillStyle = '#64748B';
    ctx.font = '12px "Segoe UI", sans-serif';
    ctx.fillText('VENDOR ACCOUNT', 30, 125);

    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 22px "Segoe UI", Inter, sans-serif';
    ctx.fillText(data.vendor, 30, 155);

    // Amount box
    ctx.fillStyle = '#141822';
    ctx.fillRect(30, 175, canvas.width - 60, 95);
    ctx.strokeStyle = '#273147';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 175, canvas.width - 60, 95);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '13px monospace';
    ctx.fillText('TOTAL DUE / AUDITED VALUE', 45, 205);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px "Segoe UI", monospace';
    ctx.fillText(data.amount, 45, 248);

    // 4. Line Items Grid Simulation
    ctx.fillStyle = '#64748B';
    ctx.font = '12px monospace';
    ctx.fillText('ITEM DESCR.', 30, 305);
    ctx.textAlign = 'right';
    ctx.fillText('QTY', 340, 305);
    ctx.fillText('MATCH', canvas.width - 30, 305);
    ctx.textAlign = 'left';

    // Horizontal line
    ctx.strokeStyle = '#232D3F';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(30, 315);
    ctx.lineTo(canvas.width - 30, 315);
    ctx.stroke();

    const items = [
      { desc: 'Industrial Turbine Sensor 400A', qty: '4x', status: 'MATCH' },
      { desc: 'Calibration Cable Interface Hub', qty: '12x', status: 'MATCH' },
      { desc: 'Precision Pressure Flange Kit', qty: '2x', status: 'VARIANCE' },
    ];

    items.forEach((item, idx) => {
      const y = 345 + idx * 36;
      ctx.fillStyle = '#CBD5E1';
      ctx.font = '14px "Segoe UI", sans-serif';
      ctx.fillText(item.desc, 30, y);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '13px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(item.qty, 340, y);

      ctx.fillStyle = item.status === 'MATCH' ? '#10B981' : '#F59E0B';
      ctx.fillText(item.status, canvas.width - 30, y);
      ctx.textAlign = 'left';
    });

    // 5. Status Decision Stamp (Key highlight)
    const stampY = 485;
    ctx.fillStyle = data.statusBg;
    ctx.fillRect(30, stampY, canvas.width - 60, 85);
    ctx.strokeStyle = data.statusColor;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(30, stampY, canvas.width - 60, 85);

    // Status label
    ctx.fillStyle = data.statusColor;
    ctx.font = 'bold 18px "Segoe UI", Inter, sans-serif';
    ctx.fillText(data.status, 48, stampY + 36);

    // Note / Explanation
    ctx.fillStyle = '#E2E8F0';
    ctx.font = '13px "Segoe UI", sans-serif';
    ctx.fillText(data.note, 48, stampY + 62);

    // 6. Barcode & Security Hash at bottom
    ctx.fillStyle = '#334155';
    for (let i = 0; i < 38; i++) {
      const barX = 35 + i * 11.5;
      const barW = (i % 3 === 0 ? 5 : i % 2 === 0 ? 3 : 2);
      ctx.fillRect(barX, 610, barW, 40);
    }

    ctx.fillStyle = '#475569';
    ctx.font = '11px monospace';
    ctx.fillText('SHA-256 // 49A8:F290:E812:93B4:A880 // STRICT AUDIT PASS', 35, 672);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

// Single 3D Floating Invoice Card
const InvoiceCard3D: React.FC<{
  data: InvoiceData;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}> = ({ data, mouse }) => {
  const meshRef = useRef<THREE.Group>(null);

  const texture = useMemo(() => {
    return createInvoiceTexture({
      invoiceNo: data.invoiceNo,
      vendor: data.vendor,
      amount: data.amount,
      poNumber: data.poNumber,
      status: data.status,
      statusColor: data.statusColor,
      statusBg: data.statusBg,
      note: data.note,
    });
  }, [data]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime() + data.floatOffset;

    // Gentle hovering in place
    meshRef.current.position.y = data.position[1] + Math.sin(t * 1.3) * 0.14;
    meshRef.current.position.x = data.position[0] + Math.cos(t * 0.9) * 0.05;

    // Gentle floating rotation + subtle mouse influence
    const targetRotX = data.rotation[0] + Math.sin(t * 1.1) * 0.04 - mouse.current.y * 0.15;
    const targetRotY = data.rotation[1] + Math.cos(t * 0.8) * 0.05 + mouse.current.x * 0.2;
    const targetRotZ = data.rotation[2] + Math.sin(t * 0.7) * 0.02;

    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotX, 0.05);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotY, 0.05);
    meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, targetRotZ, 0.05);
  });

  return (
    <group ref={meshRef} position={data.position} rotation={data.rotation}>
      {/* Front Invoice Card Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.5, 3.42, 0.04]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.25}
          metalness={0.1}
        />
      </mesh>

      {/* Subtle Glowing Border Edge */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(2.52, 3.44, 0.045)]} />
        <lineBasicMaterial color={data.statusColor} transparent opacity={0.65} />
      </lineSegments>
    </group>
  );
};

// Responsive wrapper that scales and positions 3D cards based on viewport width
const ResponsiveGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { viewport } = useThree();
  const scale = useMemo(() => {
    if (viewport.width < 5.0) return Math.max(0.58, viewport.width / 5.8);
    if (viewport.width < 7.0) return 0.82;
    return 1.0;
  }, [viewport.width]);

  return <group scale={scale}>{children}</group>;
};

export const FloatingInvoiceCardsScene: React.FC = () => {
  const mouse = useRef({ x: 0, y: 0 });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    mouse.current = { x, y };
  };

  const invoiceCards: InvoiceData[] = [
    {
      invoiceNo: 'INV-2026-8819',
      vendor: 'SIEMENS HEAVY TURBINE',
      amount: '$142,500.00',
      poNumber: 'PO-2026-9041',
      status: 'AUTO-PASSED',
      statusColor: '#10B981',
      statusBg: 'rgba(16, 185, 129, 0.15)',
      note: '✓ 100% 3-Way Match with ERP PO & Receipt',
      position: [0, 0, 0.4],
      rotation: [0.03, -0.05, 0.01],
      floatOffset: 0,
    },
    {
      invoiceNo: 'INV-2026-8820',
      vendor: 'KYOCERA SENSORS CORP',
      amount: '$38,910.50',
      poNumber: 'PO-2026-9042',
      status: 'DUPLICATE DETECTED',
      statusColor: '#EF4444',
      statusBg: 'rgba(239, 68, 68, 0.15)',
      note: '⚠ Hash match with settled voucher V-8812',
      position: [-2.4, -0.2, -0.6],
      rotation: [0.06, 0.26, -0.06],
      floatOffset: 2.1,
    },
    {
      invoiceNo: 'INV-2026-8821',
      vendor: 'TITAN HYDRAULICS FAB',
      amount: '$219,840.00',
      poNumber: 'PO-2026-9043',
      status: 'EXPLAINABLE FLAG',
      statusColor: '#0078D4',
      statusBg: 'rgba(0, 120, 212, 0.15)',
      note: 'ℹ Line item rate variance exceeds PO tolerance (+4.2%)',
      position: [2.4, 0.15, -0.5],
      rotation: [-0.04, -0.25, 0.05],
      floatOffset: 4.2,
    },
  ];

  return (
    <div
      onPointerMove={handlePointerMove}
      className="relative w-full h-[320px] sm:h-[420px] md:h-[460px] lg:h-[500px] overflow-hidden rounded-xl bg-gradient-to-b from-[#0B0D13] via-[#090A0E] to-[#07080B] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] touch-pan-y"
    >
      {/* Background Accent Blue Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] sm:w-[380px] lg:w-[480px] h-[260px] sm:h-[380px] lg:h-[480px] bg-[#0078D4]/20 rounded-full blur-[90px] sm:blur-[110px] pointer-events-none" />

      {/* Subtle Grid Accent */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Micro Status Badges at Top of 3D Canvas */}
      <div className="absolute top-3 sm:top-4 inset-x-3 sm:inset-x-4 flex items-center justify-between pointer-events-none z-10 text-[11px] sm:text-xs font-mono">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-[#0E121A]/85 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md border border-white/10 text-[#94A3B8]">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#0078D4] animate-pulse" />
          <span className="truncate max-w-[190px] sm:max-w-none">REAL-TIME INVOICE AUDIT</span>
        </div>
        <div className="hidden xs:flex items-center gap-1.5 bg-[#0E121A]/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-[#94A3B8] text-[10px] sm:text-xs">
          <span>3D VIEWPORT</span>
        </div>
      </div>

      {/* Three.js Canvas */}
      <Canvas
        camera={{ position: [0, 0, 6.2], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} color="#E2E8F0" />
        {/* Microsoft Blue Key & Accent Lights */}
        <pointLight position={[0, 0, 4]} intensity={2.2} color="#0078D4" distance={12} />
        <directionalLight position={[5, 6, 5]} intensity={1.8} color="#FFFFFF" />
        <directionalLight position={[-5, -4, 3]} intensity={0.9} color="#0078D4" />

        <ResponsiveGroup>
          {invoiceCards.map((card) => (
            <InvoiceCard3D key={card.invoiceNo} data={card} mouse={mouse} />
          ))}
        </ResponsiveGroup>
      </Canvas>

      {/* Bottom Hint */}
      <div className="absolute bottom-2.5 sm:bottom-3 inset-x-0 text-center pointer-events-none z-10">
        <span className="text-[10px] sm:text-[11px] font-mono text-[#64748B] bg-[#0A0D14]/85 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-white/5">
          Drag / hover to inspect floating cards
        </span>
      </div>
    </div>
  );
};
