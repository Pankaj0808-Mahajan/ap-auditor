import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type DiagnosticMode = 'nominal' | 'warning' | 'error';

interface IndustrialCADModelProps {
  mode: DiagnosticMode;
  wireframeOnly: boolean;
  exploded: boolean;
  rotationSpeed: number;
}

export const IndustrialCADModel: React.FC<IndustrialCADModelProps> = ({
  mode,
  wireframeOnly,
  exploded,
  rotationSpeed,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const rotorRef = useRef<THREE.Group>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  // Theme colors in Three.js format
  const modeColors: Record<DiagnosticMode, {
    primary: THREE.Color;
    glow: string;
    lightIntensity: number;
  }> = {
    nominal: {
      primary: new THREE.Color('#0078D4'),
      glow: '#0078D4',
      lightIntensity: 1.8,
    },
    warning: {
      primary: new THREE.Color('#FFB900'),
      glow: '#FFB900',
      lightIntensity: 2.2,
    },
    error: {
      primary: new THREE.Color('#D13438'),
      glow: '#D13438',
      lightIntensity: 3.0,
    },
  };

  const activeTheme = modeColors[mode];

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    if (groupRef.current && rotationSpeed > 0) {
      groupRef.current.rotation.y += delta * 0.25 * rotationSpeed;
    }

    if (rotorRef.current && rotationSpeed > 0) {
      rotorRef.current.rotation.y -= delta * 0.8 * rotationSpeed;
    }

    if (ringRef1.current) {
      ringRef1.current.rotation.x = Math.sin(t * 0.5) * 0.3;
      ringRef1.current.rotation.z += delta * 0.4 * rotationSpeed;
    }

    if (ringRef2.current) {
      ringRef2.current.rotation.y += delta * 0.6 * rotationSpeed;
      ringRef2.current.rotation.x = Math.cos(t * 0.4) * 0.3;
    }

    if (coreRef.current) {
      const pulse = mode === 'error' 
        ? 1.0 + Math.sin(t * 12) * 0.08
        : mode === 'warning'
        ? 1.0 + Math.sin(t * 6) * 0.04
        : 1.0 + Math.sin(t * 2) * 0.02;
      coreRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  const explodeOffset = exploded ? 0.9 : 0.0;

  return (
    <group ref={groupRef} position={[0, 0.4, 0]}>
      {/* Central Diagnostic Point Light */}
      <pointLight
        position={[0, 0, 0]}
        color={activeTheme.glow}
        intensity={activeTheme.lightIntensity}
        distance={8}
      />

      {/* CORE: Inner faceted reactor core (sharp 8-sided octahedron / prism) */}
      <mesh ref={coreRef} position={[0, 0, 0]}>
        <octahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial
          color={activeTheme.primary}
          emissive={activeTheme.primary}
          emissiveIntensity={mode === 'error' ? 0.8 : 0.4}
          roughness={0.2}
          metalness={0.9}
          wireframe={wireframeOnly}
        />
      </mesh>

      {/* Sharp wireframe envelope around core */}
      <mesh position={[0, 0, 0]}>
        <octahedronGeometry args={[0.62, 0]} />
        <meshBasicMaterial
          color={activeTheme.primary}
          wireframe
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* ROTOR ASSEMBLY: Faceted industrial turbine blades (sharp rectangular vanes) */}
      <group ref={rotorRef}>
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * (0.8 + explodeOffset * 0.3),
                0,
                Math.sin(angle) * (0.8 + explodeOffset * 0.3)
              ]}
              rotation={[0, -angle + Math.PI / 4, 0]}
            >
              <boxGeometry args={[0.08, 0.5, 0.45]} />
              <meshStandardMaterial
                color={wireframeOnly ? activeTheme.primary : '#1F222E'}
                metalness={0.85}
                roughness={0.3}
                wireframe={wireframeOnly}
              />
            </mesh>
          );
        })}
      </group>

      {/* TOP INDUSTRIAL FLANGE / CAP */}
      <mesh position={[0, 0.75 + explodeOffset, 0]}>
        <cylinderGeometry args={[0.9, 1.05, 0.22, 8]} />
        <meshStandardMaterial
          color={wireframeOnly ? activeTheme.primary : '#161821'}
          metalness={0.9}
          roughness={0.25}
          wireframe={wireframeOnly}
        />
      </mesh>

      {/* Wireframe border on top cap */}
      <mesh position={[0, 0.75 + explodeOffset, 0]}>
        <cylinderGeometry args={[0.91, 1.06, 0.23, 8]} />
        <meshBasicMaterial
          color={activeTheme.primary}
          wireframe
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* BOTTOM INDUSTRIAL HOUSING CHASSIS */}
      <mesh position={[0, -0.75 - explodeOffset, 0]}>
        <cylinderGeometry args={[1.05, 1.25, 0.3, 8]} />
        <meshStandardMaterial
          color={wireframeOnly ? activeTheme.primary : '#111217'}
          metalness={0.9}
          roughness={0.3}
          wireframe={wireframeOnly}
        />
      </mesh>

      {/* Wireframe border on bottom chassis */}
      <mesh position={[0, -0.75 - explodeOffset, 0]}>
        <cylinderGeometry args={[1.06, 1.26, 0.31, 8]} />
        <meshBasicMaterial
          color={activeTheme.primary}
          wireframe
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* HOLOGRAPHIC TELEMETRY RINGS (Sharp multi-segmented polygons, not rounded spheres) */}
      <mesh ref={ringRef1} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.45 + explodeOffset * 0.4, 0.015, 4, 16]} />
        <meshBasicMaterial
          color={activeTheme.primary}
          transparent
          opacity={0.8}
        />
      </mesh>

      <mesh ref={ringRef2} position={[0, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[1.7 + explodeOffset * 0.5, 0.012, 4, 16]} />
        <meshBasicMaterial
          color={mode === 'warning' ? '#FFB900' : mode === 'error' ? '#D13438' : '#60A5FA'}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* CORNER DIAGNOSTIC BRACKETS / PYLONS */}
      {[-1, 1].map((x) =>
        [-1, 1].map((z) => (
          <group key={`${x}-${z}`} position={[x * (1.1 + explodeOffset * 0.6), 0, z * (1.1 + explodeOffset * 0.6)]}>
            <mesh>
              <boxGeometry args={[0.08, 1.6 + explodeOffset * 1.5, 0.08]} />
              <meshStandardMaterial
                color={wireframeOnly ? activeTheme.primary : '#232736'}
                metalness={0.9}
                roughness={0.2}
                wireframe={wireframeOnly}
              />
            </mesh>
            {/* Corner LED beacon on pylon */}
            <mesh position={[0, 0.8 + explodeOffset * 0.75, 0]}>
              <boxGeometry args={[0.06, 0.06, 0.06]} />
              <meshBasicMaterial color={activeTheme.primary} />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
};
