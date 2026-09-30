import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { ConveyorBelt3D } from './ConveyorBelt3D';
import { ShieldCheck, Activity } from 'lucide-react';

interface HeroConveyorSceneProps {
  className?: string;
}

export const HeroConveyorScene: React.FC<HeroConveyorSceneProps> = ({
  className = '',
}) => {
  return (
    <div
      className={`relative w-full h-[620px] bg-[#0A0A0C] border border-white/10 overflow-hidden select-none ${className}`}
      style={{ borderRadius: 0 }}
    >
      {/* Precision corner brackets */}
      <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-[#0078D4] pointer-events-none z-20" />
      <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-[#0078D4] pointer-events-none z-20" />
      <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-[#0078D4] pointer-events-none z-20" />
      <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-[#0078D4] pointer-events-none z-20" />

      {/* Top Left HUD: Mechanical Camera Readout */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-3">
        <div className="bg-[#0E0F14]/85 backdrop-blur-md border border-white/10 px-3 py-1.5 flex items-center gap-2 text-[11px] font-mono">
          <Activity size={12} className="text-[#0078D4] animate-pulse" />
          <span className="text-white font-bold tracking-wider">CONVEYOR_RIG // CAM_01</span>
          <span className="text-[#575C6C]">| 60 FPS</span>
        </div>
        <div className="hidden sm:flex bg-[#0E0F14]/85 backdrop-blur-md border border-white/10 px-3 py-1.5 items-center gap-2 text-[10px] font-mono text-[#8A8F9E]">
          <span>BELT_VELOCITY: 0.85 m/s</span>
          <span className="text-[#00CC6A]">● RUNNING</span>
        </div>
      </div>

      {/* Top Right HUD: Live Detection Status */}
      <div className="absolute top-4 right-4 z-20 pointer-events-none flex items-center gap-2">
        <div className="bg-[#0E0F14]/85 backdrop-blur-md border border-white/10 px-3 py-1.5 flex items-center gap-2 text-[10px] font-mono text-[#A2A7B5]">
          <span className="w-1.5 h-1.5 bg-[#0078D4]" />
          <span>MICROSOFT_BLUE: SCANNER GATE</span>
        </div>
        <div className="hidden sm:flex bg-[#0E0F14]/85 backdrop-blur-md border border-[#FFB900]/30 px-3 py-1.5 items-center gap-2 text-[10px] font-mono text-[#FFD454]">
          <span className="w-1.5 h-1.5 bg-[#FFB900]" />
          <span>SIDE CHUTE: EXCEPTIONS</span>
        </div>
      </div>

      {/* Bottom Floating Telemetry Bar */}
      <div className="absolute bottom-4 inset-x-4 z-20 pointer-events-none flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
        <div className="bg-[#0E0F14]/90 backdrop-blur-xl border border-white/10 px-3.5 py-2 flex items-center gap-4 text-[#8A8F9E]">
          <div>
            <span className="text-[#575C6C]">SCAN APERTURE: </span>
            <span className="text-white font-semibold">MULTISPECTRAL VISION</span>
          </div>
          <div className="hidden md:block">
            <span className="text-[#575C6C]">INTERCEPTION TOLERANCE: </span>
            <span className="text-[#0078D4] font-semibold">0.00% VARIANCE</span>
          </div>
          <div className="hidden sm:block">
            <span className="text-[#575C6C]">HOVER CARD: </span>
            <span className="text-white font-semibold">INSPECT DIAGNOSTIC</span>
          </div>
        </div>

        <div className="bg-[#0E0F14]/90 backdrop-blur-xl border border-white/10 px-3.5 py-2 flex items-center gap-2 text-white">
          <ShieldCheck size={14} className="text-[#00CC6A]" />
          <span className="font-semibold tracking-wide">DETERMINISTIC 3-WAY RECONCILIATION</span>
        </div>
      </div>

      {/* R3F 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 4.4, 8.2], fov: 38 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#0A0A0C' }}
      >
        {/* Dark Industrial Fog */}
        <fog attach="fog" args={['#0A0A0C', 9, 24]} />

        {/* LIGHTING SETUP: 
            - 1 strong directional key light with sharp shadows
            - Soft rim light for edge definition (#0078D4)
            - Subtle ambient
        */}
        <ambientLight intensity={0.4} color="#161822" />

        {/* Key Light */}
        <directionalLight
          position={[7, 10, 8]}
          intensity={2.0}
          color="#FFFFFF"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-near={0.5}
          shadow-camera-far={25}
          shadow-camera-left={-8}
          shadow-camera-right={8}
          shadow-camera-top={8}
          shadow-camera-bottom={-8}
          shadow-bias={-0.0005}
        />

        {/* Rim Light (Microsoft Blue Edge Glint) */}
        <directionalLight
          position={[-9, 6, -6]}
          intensity={1.6}
          color="#0078D4"
        />

        {/* Soft fill light from under conveyor */}
        <directionalLight
          position={[0, -4, 2]}
          intensity={0.3}
          color="#232736"
        />

        <Suspense fallback={null}>
          {/* Main 3D Conveyor Assembly */}
          <ConveyorBelt3D />

          {/* Blueprint Grid on Floor */}
          <Grid
            position={[0, -2.28, 0]}
            args={[32, 32]}
            cellSize={0.5}
            cellThickness={0.7}
            cellColor="#141824"
            sectionSize={2.0}
            sectionThickness={1.2}
            sectionColor="#0078D4"
            fadeDistance={18}
            fadeStrength={1.5}
          />

          {/* Damped Orbit Controls */}
          <OrbitControls
            enableDamping
            dampingFactor={0.06}
            minDistance={4}
            maxDistance={14}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2.05}
            minAzimuthAngle={-Math.PI / 5}
            maxAzimuthAngle={Math.PI / 5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
