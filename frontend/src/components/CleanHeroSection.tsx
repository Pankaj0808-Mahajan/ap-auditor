import React from 'react';
import { FloatingInvoiceCardsScene } from './FloatingInvoiceCardsScene';
import { ArrowRight, ChevronRight, CheckCircle2 } from 'lucide-react';

interface CleanHeroSectionProps {
  onGetStarted: () => void;
  onLearnMore: () => void;
}

export const CleanHeroSection: React.FC<CleanHeroSectionProps> = ({
  onGetStarted,
  onLearnMore,
}) => {
  return (
    <section className="relative w-full pt-10 pb-16 md:pt-16 md:pb-24 overflow-hidden">
      {/* Background radial blue gradient */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#0078D4]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Heading, Subheading, CTAs */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Top pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0078D4]/10 border border-[#0078D4]/30 text-xs font-mono text-[#60A5FA]">
              <span className="w-2 h-2 rounded-full bg-[#0078D4] animate-pulse" />
              <span>AUTONOMOUS AP RECONCILIATION</span>
            </div>

            {/* Heading requested: "AP Auditor" */}
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.08] font-sans">
              AP Auditor
            </h1>

            {/* Subheading requested: "Check invoices. Catch duplicates. Only exceptions reach a human." */}
            <p className="text-lg sm:text-xl text-[#A0AABF] leading-relaxed font-sans max-w-xl">
              Check invoices. Catch duplicates. Only exceptions reach a human.
            </p>

            {/* Additional crisp benefit context */}
            <div className="flex flex-col gap-2.5 pt-1 text-sm text-[#8A94A8] font-sans">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-[#0078D4] shrink-0" />
                <span>Instant 3-way match against purchase orders and receipts</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-[#0078D4] shrink-0" />
                <span>Continuous cross-vendor duplicate payment prevention</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-[#0078D4] shrink-0" />
                <span>Zero manual review for verified, clean line items</span>
              </div>
            </div>

            {/* Two buttons below: "Get Started" and "Learn More" */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2 w-full sm:w-auto">
              <button
                onClick={onGetStarted}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#0078D4] hover:bg-[#1084DE] active:bg-[#0063B1] text-white font-medium text-base transition-all shadow-[0_0_25px_rgba(0,120,212,0.4)] hover:shadow-[0_0_35px_rgba(0,120,212,0.6)] cursor-pointer w-full sm:w-auto"
              >
                <span>Get Started</span>
                <ArrowRight size={17} />
              </button>

              <button
                onClick={onLearnMore}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#141720] hover:bg-[#1C212E] border border-white/15 text-white font-medium text-base transition-all hover:border-white/30 cursor-pointer w-full sm:w-auto"
              >
                <span>Learn More</span>
                <ChevronRight size={17} className="text-[#94A3B8]" />
              </button>
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 sm:pt-6 border-t border-white/10 max-w-lg">
              <div className="text-left">
                <div className="text-xl sm:text-2xl font-bold font-mono text-white">94.2%</div>
                <div className="text-[11px] sm:text-xs text-[#8A94A8] font-sans mt-0.5">Auto-Pass Rate</div>
              </div>
              <div className="text-left">
                <div className="text-xl sm:text-2xl font-bold font-mono text-[#0078D4]">0.00%</div>
                <div className="text-[11px] sm:text-xs text-[#8A94A8] font-sans mt-0.5">Duplicate Leakage</div>
              </div>
              <div className="text-left">
                <div className="text-xl sm:text-2xl font-bold font-mono text-white">&lt;1.2s</div>
                <div className="text-[11px] sm:text-xs text-[#8A94A8] font-sans mt-0.5">Audit Latency</div>
              </div>
            </div>
          </div>

          {/* Right Column: ONE simple 3D animation (floating/rotating invoice cards with dark bg & blue glow) */}
          <div className="lg:col-span-6 w-full">
            <FloatingInvoiceCardsScene />
          </div>
        </div>
      </div>
    </section>
  );
};
