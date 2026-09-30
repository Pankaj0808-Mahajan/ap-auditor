import React from 'react';
import { HeroConveyorScene } from '../scenes/HeroConveyorScene';
import { IndustrialButton } from './IndustrialButton';
import { AcrylicPanel } from './AcrylicPanel';
import { ArrowRight, Play } from 'lucide-react';

interface HeroSectionProps {
  onExploreClick?: () => void;
  onDeployClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreClick,
  onDeployClick,
}) => {
  return (
    <section className="relative w-full pt-4 pb-12 overflow-hidden border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        {/* Top Operational Pill / Directive */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-left">
          <div className="inline-flex items-center gap-2 bg-[#0E0F14]/85 backdrop-blur-md border border-[#0078D4]/40 px-3 py-1.5 text-xs font-mono">
            <span className="w-2 h-2 bg-[#0078D4] animate-pulse" />
            <span className="text-[#60A5FA] font-bold">SYSTEM ACTIVE</span>
            <span className="text-[#575C6C]">|</span>
            <span className="text-[#A2A7B5]">ENTERPRISE AP AUDIT PLATFORM // CLASS-4 RECONCILIATION</span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-[#8A8F9E]">
            <span className="text-[#00CC6A]">● ZERO LEAKAGE TOLERANCE</span>
            <span>|</span>
            <span>SECURE AZURE CO-HOSTED</span>
          </div>
        </div>

        {/* Primary Industrial Headline & Narrative */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end text-left pt-2 pb-2">
          <div className="lg:col-span-8 space-y-3">
            <div className="text-[11px] font-mono tracking-widest text-[#0078D4] uppercase font-bold">
              {'// AUTONOMOUS ACCOUNTS PAYABLE EXCEPTION DETECTION'}
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tighter leading-[1.08] uppercase font-sans">
              Every Invoice Checked.{' '}
              <span className="text-[#0078D4]">
                Only Exceptions
              </span>{' '}
              Reach a Human.
            </h1>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <p className="text-sm text-[#A2A7B5] leading-relaxed font-sans font-normal">
              A high-precision accounts-payable command center. Continuous 3-way 
              reconciliation, duplicate payment interception, and deterministic machine-vision 
              auditing before cash leaves your treasury.
            </p>

            {/* Fluent Acrylic CTA Button Group */}
            <div className="flex flex-wrap items-center gap-3">
              <IndustrialButton
                variant="primary"
                size="md"
                cornerTicks
                iconRight={<ArrowRight size={15} />}
                onClick={onDeployClick}
                className="shadow-[0_0_20px_rgba(0,120,212,0.4)]"
              >
                REQUEST AUDIT PILOT
              </IndustrialButton>

              <IndustrialButton
                variant="acrylic"
                size="md"
                icon={<Play size={14} className="text-[#0078D4]" />}
                onClick={onExploreClick}
              >
                INSPECT CONVEYOR
              </IndustrialButton>
            </div>
          </div>
        </div>

        {/* 3D Conveyor Belt Interactive Viewport */}
        <div className="relative">
          <HeroConveyorScene />
        </div>

        {/* Real-time Enterprise Telemetry Readouts (Below Conveyor Belt) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
          <AcrylicPanel variant="subtle" showBrackets className="p-3">
            <div className="text-[10px] font-mono text-[#8A8F9E] uppercase">
              AUTOPASS RATIO
            </div>
            <div className="text-2xl font-bold font-mono text-[#00CC6A] mt-1 tracking-tight">
              94.2%
            </div>
            <div className="text-[10px] font-mono text-[#575C6C] mt-0.5">
              148,920 INVOICES / DAY
            </div>
          </AcrylicPanel>

          <AcrylicPanel variant="subtle" showBrackets className="p-3">
            <div className="text-[10px] font-mono text-[#8A8F9E] uppercase">
              DUPLICATES INTERCEPTED
            </div>
            <div className="text-2xl font-bold font-mono text-[#D13438] mt-1 tracking-tight">
              $3.42M
            </div>
            <div className="text-[10px] font-mono text-[#575C6C] mt-0.5">
              LEAKAGE PREVENTED YTD
            </div>
          </AcrylicPanel>

          <AcrylicPanel variant="subtle" showBrackets className="p-3">
            <div className="text-[10px] font-mono text-[#8A8F9E] uppercase">
              LINE-ITEM CONFIDENCE
            </div>
            <div className="text-2xl font-bold font-mono text-[#0078D4] mt-1 tracking-tight">
              99.98%
            </div>
            <div className="text-[10px] font-mono text-[#575C6C] mt-0.5">
              SUB-CENT LEVEL MATCH
            </div>
          </AcrylicPanel>

          <AcrylicPanel variant="subtle" showBrackets className="p-3">
            <div className="text-[10px] font-mono text-[#8A8F9E] uppercase">
              HUMAN REVIEW QUEUE
            </div>
            <div className="text-2xl font-bold font-mono text-[#FFB900] mt-1 tracking-tight">
              -86.4%
            </div>
            <div className="text-[10px] font-mono text-[#575C6C] mt-0.5">
              VOLUME REDUCTION
            </div>
          </AcrylicPanel>
        </div>
      </div>
    </section>
  );
};
