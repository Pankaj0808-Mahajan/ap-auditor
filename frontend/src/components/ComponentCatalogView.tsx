import React, { useState } from 'react';
import { AcrylicPanel } from './AcrylicPanel';
import { IndustrialButton } from './IndustrialButton';
import { IndustrialBadge } from './IndustrialBadge';
import { IndustrialInput } from './IndustrialInput';
import { IndustrialToggle } from './IndustrialToggle';
import { IndustrialMetric } from './IndustrialMetric';
import { IndustrialModal } from './IndustrialModal';
import {
  Play,
  AlertTriangle,
  ShieldAlert,
  Sliders,
  Terminal,
  Cpu,
  Power,
  Zap,
} from 'lucide-react';

export const ComponentCatalogView: React.FC = () => {
  const [toggleState1, setToggleState1] = useState(true);
  const [toggleState2, setToggleState2] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalVariant, setModalVariant] = useState<'default' | 'accent' | 'warning' | 'error'>('accent');
  const [inputValue, setInputValue] = useState('SYS_CORE_OVERCLOCK_V4');

  const openModalWithVariant = (variant: 'default' | 'accent' | 'warning' | 'error') => {
    setModalVariant(variant);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 text-left">
      {/* SECTION 1: ACRYLIC GLASS PANELS */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Terminal size={14} className="text-[#0078D4]" />
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
            01. ACRYLIC GLASS PANELS // SHARP EDGES & SPECULAR HAIRLINES
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Default Acrylic */}
          <AcrylicPanel
            header="CORE TELEMETRY"
            headerBadge="DEFAULT"
            technicalId="PANEL-01"
            showBrackets
          >
            <p className="text-xs text-[#8A8F9E] leading-relaxed">
              Standard smoked obsidian acrylic glass panel with backdrop blur (18px) and top specular hairline.
            </p>
            <div className="mt-3 text-[11px] font-mono text-[#0078D4]">
              BORDER: rgba(255, 255, 255, 0.1)
            </div>
          </AcrylicPanel>

          {/* Accent Acrylic (#0078D4) */}
          <AcrylicPanel
            variant="accent"
            header="PRIMARY ACCENT"
            headerBadge="#0078D4"
            technicalId="PANEL-02"
            glow
          >
            <p className="text-xs text-[#D3D7E5] leading-relaxed">
              Active accent blue frame with subtle ambient luminescence and blue tinted acrylic substrate.
            </p>
            <div className="mt-3 text-[11px] font-mono text-[#60A5FA]">
              GLOW: 0 0 24px rgba(0,120,212,0.3)
            </div>
          </AcrylicPanel>

          {/* Warning Acrylic (#FFB900) */}
          <AcrylicPanel
            variant="warning"
            header="HAZARD ADVISORY"
            headerBadge="#FFB900"
            technicalId="PANEL-03"
            glow
          >
            <p className="text-xs text-[#FFD454] leading-relaxed">
              Amber caution state for thermal warnings, variance drift, or inspection flags.
            </p>
            <div className="mt-3 text-[11px] font-mono text-[#FFB900]">
              STATUS: THRESHOLD EXCEEDED (+4.2%)
            </div>
          </AcrylicPanel>

          {/* Error Acrylic (#D13438) */}
          <AcrylicPanel
            variant="error"
            header="CRITICAL FAULT"
            headerBadge="#D13438"
            technicalId="PANEL-04"
            glow
          >
            <p className="text-xs text-[#FFA1A3] leading-relaxed">
              High-priority alert with crimson specular border, emergency shutdown readiness.
            </p>
            <div className="mt-3 text-[11px] font-mono text-[#D13438]">
              INTERLOCK: FAULT DETECTED
            </div>
          </AcrylicPanel>
        </div>
      </div>

      {/* SECTION 2: INDUSTRIAL BUTTONS */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Power size={14} className="text-[#0078D4]" />
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
            02. INDUSTRIAL BUTTON MATRIX // ZERO RADIUS
          </h2>
        </div>

        <AcrylicPanel showBrackets className="space-y-4">
          {/* Variants row */}
          <div>
            <div className="text-[11px] font-mono text-[#8A8F9E] uppercase mb-2">BUTTON VARIANTS</div>
            <div className="flex flex-wrap items-center gap-3">
              <IndustrialButton variant="primary" icon={<Play size={14} />} code="[EXEC]">
                PRIMARY (#0078D4)
              </IndustrialButton>

              <IndustrialButton variant="accent" icon={<Zap size={14} />}>
                ACCENT ACRYLIC
              </IndustrialButton>

              <IndustrialButton variant="secondary" icon={<Sliders size={14} />}>
                STEEL SECONDARY
              </IndustrialButton>

              <IndustrialButton variant="acrylic">
                FROSTED ACRYLIC
              </IndustrialButton>

              <IndustrialButton
                variant="warning"
                icon={<AlertTriangle size={14} />}
                onClick={() => openModalWithVariant('warning')}
              >
                WARN #FFB900
              </IndustrialButton>

              <IndustrialButton
                variant="error"
                icon={<ShieldAlert size={14} />}
                onClick={() => openModalWithVariant('error')}
              >
                FAULT #D13438
              </IndustrialButton>

              <IndustrialButton variant="ghost">
                GHOST
              </IndustrialButton>
            </div>
          </div>

          {/* Chamfers and Corner Ticks */}
          <div className="pt-3 border-t border-white/10">
            <div className="text-[11px] font-mono text-[#8A8F9E] uppercase mb-2">
              CHAMFER CUTS & CORNER BRACKETS
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <IndustrialButton variant="primary" chamfer="tl">
                CHAMFER TOP-LEFT
              </IndustrialButton>

              <IndustrialButton variant="accent" chamfer="diagonal" cornerTicks>
                DIAGONAL CHAMFER + TICKS
              </IndustrialButton>

              <IndustrialButton variant="warning" chamfer="tl" cornerTicks>
                HAZARD CHAMFER
              </IndustrialButton>

              <IndustrialButton variant="acrylic" size="sm" loading>
                PROCESSING
              </IndustrialButton>
            </div>
          </div>
        </AcrylicPanel>
      </div>

      {/* SECTION 3: STATUS BADGES & TELEMETRY BEACONS */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Zap size={14} className="text-[#0078D4]" />
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
            03. RECTANGULAR STATUS INDICATORS // BLINKING LED BEACONS
          </h2>
        </div>

        <AcrylicPanel showBrackets>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-[10px] font-mono text-[#8A8F9E]">SOLID INDICATORS</div>
              <div className="flex flex-wrap gap-2">
                <IndustrialBadge status="nominal" variant="solid" label="ONLINE" />
                <IndustrialBadge status="accent" variant="solid" label="#0078D4" />
                <IndustrialBadge status="warning" variant="solid" label="CAUTION" />
                <IndustrialBadge status="critical" variant="solid" label="FAULT" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-mono text-[#8A8F9E]">OUTLINE WITH PULSE</div>
              <div className="flex flex-wrap gap-2">
                <IndustrialBadge status="nominal" variant="outline" pulsing label="NOMINAL" code="[01]" />
                <IndustrialBadge status="warning" variant="outline" pulsing label="WARN" code="[42]" />
                <IndustrialBadge status="critical" variant="outline" pulsing label="CRITICAL" code="[99]" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-mono text-[#8A8F9E]">ACRYLIC FROSTED BADGES</div>
              <div className="flex flex-wrap gap-2">
                <IndustrialBadge status="accent" variant="acrylic" label="TELEMETRY ACTIVE" />
                <IndustrialBadge status="neutral" variant="acrylic" label="STANDBY" />
              </div>
            </div>
          </div>
        </AcrylicPanel>
      </div>

      {/* SECTION 4: FORM CONTROLS & ROCKER TOGGLES */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Cpu size={14} className="text-[#0078D4]" />
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
            04. SHARP INPUTS & MECHANICAL ROCKER TOGGLES
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AcrylicPanel header="PRECISION INPUT FIELDS" showBrackets>
            <div className="space-y-4">
              <IndustrialInput
                label="SYSTEM ASSET IDENTIFIER"
                technicalCode="ID-REG"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                mono
              />

              <IndustrialInput
                label="HAZARD TOLERANCE OVERRIDE"
                technicalCode="CFG-WARN"
                defaultValue="4.50% THRESHOLD"
                warning="Value exceeds recommended nominal tolerance"
                mono
              />

              <IndustrialInput
                label="SECURITY INTERLOCK BYPASS"
                technicalCode="AUTH-ERR"
                defaultValue="UNAUTHORIZED_KEY"
                error="Digital signature verification failed"
                mono
              />
            </div>
          </AcrylicPanel>

          <AcrylicPanel header="MECHANICAL ROCKER SWITCHES" showBrackets>
            <div className="space-y-3">
              <IndustrialToggle
                checked={toggleState1}
                onChange={setToggleState1}
                label="HOLOGRAPHIC SCANNING BEAM"
                description="Enables high-frequency laser telemetry pass"
                code="SW-01"
                variant="accent"
              />

              <IndustrialToggle
                checked={toggleState2}
                onChange={setToggleState2}
                label="MANUAL OVERRIDE INTERLOCK"
                description="Bypasses automated AP variance protection"
                code="SW-02"
                variant="warning"
              />

              <IndustrialToggle
                checked={false}
                onChange={() => {}}
                label="EMERGENCY TURBINE SCRAM"
                description="Triggers instantaneous emergency dump"
                code="SW-03"
                variant="error"
              />
            </div>
          </AcrylicPanel>
        </div>
      </div>

      {/* SECTION 5: TELEMETRY GAUGES */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sliders size={14} className="text-[#0078D4]" />
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
            05. TELEMETRY GAUGES & SEGMENTED LED BARS
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <IndustrialMetric
            label="TURBINE FREQUENCY"
            value="14,240"
            unit="RPM"
            trend="up"
            trendValue="+1.2% / MIN"
            technicalCode="TEL-01"
            progressPercent={45}
            variant="accent"
          />

          <IndustrialMetric
            label="AUDIT VELOCITY"
            value="892.4"
            unit="TX / SEC"
            trend="stable"
            trendValue="NOMINAL FLOW"
            technicalCode="TEL-02"
            progressPercent={65}
            variant="nominal"
          />

          <IndustrialMetric
            label="THERMAL RUNAWAY"
            value="84.2"
            unit="°C"
            trend="up"
            trendValue="EXCEEDING CEILING"
            technicalCode="TEL-03"
            progressPercent={78}
            variant="warning"
          />

          <IndustrialMetric
            label="VARIANCE FAULT RATE"
            value="12.8"
            unit="%"
            trend="down"
            trendValue="CRITICAL INTERLOCK"
            technicalCode="TEL-04"
            progressPercent={88}
            variant="error"
          />
        </div>
      </div>

      {/* Interactive Modal */}
      <IndustrialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalVariant === 'error'
            ? 'CRITICAL INTERLOCK ALERT'
            : modalVariant === 'warning'
            ? 'CAUTION: AUDIT VARIANCE'
            : 'INSPECTION TELEMETRY DIALOG'
        }
        variant={modalVariant}
        technicalId="DLG-08"
        footerActions={
          <>
            <IndustrialButton variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              CANCEL
            </IndustrialButton>
            <IndustrialButton
              variant={modalVariant === 'error' ? 'error' : modalVariant === 'warning' ? 'warning' : 'primary'}
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              CONFIRM ACTION
            </IndustrialButton>
          </>
        }
      >
        <p className="text-xs leading-relaxed text-[#D3D7E5]">
          This modal dialog enforces the strict sharp geometry of the dark industrial design system.
          It uses frosted acrylic glass (<code className="text-[#0078D4]">backdrop-blur-xl</code>),
          precision 1px borders, and technical corner crosshairs.
        </p>

        <div className="p-3 bg-[#0A0A0C] border border-white/10 font-mono text-[11px] space-y-1">
          <div className="text-[#8A8F9E]">SECURITY CHECKSUM:</div>
          <div className="text-white">SHA256: 9e8a712f0120b004a88cd561918a</div>
          <div className="text-[#0078D4]">AUTHORIZATION LEVEL: CLASS-4 INDUSTRIAL</div>
        </div>
      </IndustrialModal>
    </div>
  );
};
