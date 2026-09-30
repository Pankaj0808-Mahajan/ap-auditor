import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { IndustrialCADModel, DiagnosticMode } from './IndustrialCADModel';
import { IndustrialButton } from '../components/IndustrialButton';
import { IndustrialBadge } from '../components/IndustrialBadge';
import { IndustrialToggle } from '../components/IndustrialToggle';
import { Box, Layers, RotateCcw, AlertTriangle, ShieldAlert, CheckCircle2, Crosshair } from 'lucide-react';

interface IndustrialViewportProps {
  className?: string;
  initialMode?: DiagnosticMode;
}

export const IndustrialViewport: React.FC<IndustrialViewportProps> = ({
  className = '',
  initialMode = 'nominal',
}) => {
  const [mode, setMode] = useState<DiagnosticMode>(initialMode);
  const [wireframeOnly, setWireframeOnly] = useState(false);
  const [exploded, setExploded] = useState(false);
  const [isRotating, setIsRotating] = useState(true);

  return (
    <div
      className={`relative w-full h-[520px] bg-[#0A0A0C] border border-white/10 overflow-hidden flex flex-col ${className}`}
      style={{ borderRadius: 0 }}
    >
      {/* Top Telemetry Bar */}
      <div className="relative z-10 px-4 py-2.5 bg-[#0E0F14]/90 backdrop-blur-md border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#A2A7B5]">
            <Crosshair size={14} className="text-[#0078D4]" />
            <span className="text-white font-bold tracking-wider">CAD_VIEWPORT // 3D_INSPECTOR</span>
            <span className="text-[#575C6C]">[R3F v9]</span>
          </div>

          <IndustrialBadge
            status={mode === 'error' ? 'critical' : mode === 'warning' ? 'warning' : 'accent'}
            variant="solid"
            size="xs"
            pulsing
            label={mode === 'error' ? 'FAULT' : mode === 'warning' ? 'WARN' : 'NOMINAL'}
          />
        </div>

        {/* Diagnostics Mode Switchers */}
        <div className="flex items-center gap-1 bg-[#0A0A0C] p-1 border border-white/10">
          <button
            onClick={() => setMode('nominal')}
            className={`px-2.5 py-1 text-[11px] font-mono tracking-wider transition-all flex items-center gap-1.5 ${
              mode === 'nominal'
                ? 'bg-[#0078D4] text-white shadow-[0_0_8px_#0078D4]'
                : 'text-[#8A8F9E] hover:text-white'
            }`}
            style={{ borderRadius: 0 }}
          >
            <CheckCircle2 size={12} />
            NOMINAL
          </button>

          <button
            onClick={() => setMode('warning')}
            className={`px-2.5 py-1 text-[11px] font-mono tracking-wider transition-all flex items-center gap-1.5 ${
              mode === 'warning'
                ? 'bg-[#FFB900] text-black font-semibold shadow-[0_0_8px_#FFB900]'
                : 'text-[#8A8F9E] hover:text-white'
            }`}
            style={{ borderRadius: 0 }}
          >
            <AlertTriangle size={12} />
            WARN #FFB900
          </button>

          <button
            onClick={() => setMode('error')}
            className={`px-2.5 py-1 text-[11px] font-mono tracking-wider transition-all flex items-center gap-1.5 ${
              mode === 'error'
                ? 'bg-[#D13438] text-white shadow-[0_0_8px_#D13438]'
                : 'text-[#8A8F9E] hover:text-white'
            }`}
            style={{ borderRadius: 0 }}
          >
            <ShieldAlert size={12} />
            FAULT #D13438
          </button>
        </div>
      </div>

      {/* 3D R3F Canvas Container */}
      <div className="relative flex-1 w-full h-full">
        {/* Reticle / Blueprint Overlay Corners */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#0078D4]/60 pointer-events-none z-10" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#0078D4]/60 pointer-events-none z-10" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#0078D4]/60 pointer-events-none z-10" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#0078D4]/60 pointer-events-none z-10" />

        {/* Live Coordinate HUD Readout */}
        <div className="absolute bottom-4 left-4 z-10 bg-[#0E0F14]/80 backdrop-blur-md border border-white/10 px-3 py-2 text-[10px] font-mono space-y-0.5 text-[#8A8F9E] pointer-events-none">
          <div className="text-white font-bold">TELEMETRY_STREAM:</div>
          <div>X_AXIS: +048.212 mm</div>
          <div>Y_AXIS: +112.804 mm</div>
          <div>Z_AXIS: -004.910 mm</div>
          <div className="text-[#0078D4]">RADIAL_TOLERANCE: 0.002 mm</div>
        </div>

        <Canvas
          camera={{ position: [3.8, 3.2, 4.2], fov: 45 }}
          gl={{ antialias: true, alpha: false }}
          style={{ background: '#0A0A0C' }}
        >
          {/* Depth Fog */}
          <fog attach="fog" args={['#0A0A0C', 6, 18]} />

          {/* Lighting Rig */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[6, 8, 4]} intensity={1.2} color="#FFFFFF" />
          <directionalLight
            position={[-5, -4, -3]}
            intensity={0.6}
            color={mode === 'error' ? '#D13438' : mode === 'warning' ? '#FFB900' : '#0078D4'}
          />

          <Suspense fallback={null}>
            {/* Central Industrial Asset */}
            <IndustrialCADModel
              mode={mode}
              wireframeOnly={wireframeOnly}
              exploded={exploded}
              rotationSpeed={isRotating ? 1 : 0}
            />

            {/* Industrial Blueprint Grid Floor */}
            <Grid
              position={[0, -1.2, 0]}
              args={[24, 24]}
              cellSize={0.5}
              cellThickness={0.8}
              cellColor={mode === 'error' ? '#4A151C' : mode === 'warning' ? '#4D3B0D' : '#142742'}
              sectionSize={2.0}
              sectionThickness={1.5}
              sectionColor={mode === 'error' ? '#D13438' : mode === 'warning' ? '#FFB900' : '#0078D4'}
              fadeDistance={14}
              fadeStrength={1.5}
            />

            {/* Camera Orbit Controls */}
            <OrbitControls
              enableDamping
              dampingFactor={0.05}
              minDistance={2}
              maxDistance={12}
              maxPolarAngle={Math.PI / 2 + 0.05}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="relative z-10 px-4 py-2 bg-[#0E0F14]/90 backdrop-blur-md border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <IndustrialButton
            variant={wireframeOnly ? 'primary' : 'acrylic'}
            size="xs"
            onClick={() => setWireframeOnly(!wireframeOnly)}
            icon={<Layers size={13} />}
          >
            {wireframeOnly ? 'WIREFRAME: ON' : 'SOLID + CAD'}
          </IndustrialButton>

          <IndustrialButton
            variant={exploded ? 'warning' : 'acrylic'}
            size="xs"
            onClick={() => setExploded(!exploded)}
            icon={<Box size={13} />}
          >
            {exploded ? 'EXPLODE: ACTIVE' : 'EXPLODE VIEW'}
          </IndustrialButton>

          <IndustrialButton
            variant="ghost"
            size="xs"
            onClick={() => setIsRotating(!isRotating)}
            icon={<RotateCcw size={13} />}
          >
            {isRotating ? 'PAUSE ROTATION' : 'RESUME ROTATION'}
          </IndustrialButton>
        </div>

        <div className="text-[11px] font-mono text-[#7F88A8]">
          [LMB: Orbit | MMB: Zoom | RMB: Pan]
        </div>
      </div>
    </div>
  );
};
