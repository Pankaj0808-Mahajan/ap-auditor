import React from 'react';
import { Zap, Copy, History, AlertCircle, ArrowUpRight } from 'lucide-react';

interface CleanFeaturesSectionProps {
  onSelectFeature?: (featureId: string) => void;
}

export const CleanFeaturesSection: React.FC<CleanFeaturesSectionProps> = ({
  onSelectFeature,
}) => {
  const features = [
    {
      id: 'auto-pass',
      title: 'Auto-Pass',
      subtitle: 'Hands-off straight-through processing',
      icon: <Zap size={22} className="text-[#0078D4]" />,
      iconBg: 'bg-[#0078D4]/10 border-[#0078D4]/30',
      description:
        'Invoices matching purchase orders, line-item caps, and delivery receipts within variance tolerances are automatically passed directly to ERP payment rails without human touch.',
      badge: '94.2% Auto-Approved',
      badgeColor: 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30',
    },
    {
      id: 'duplicate-detection',
      title: 'Duplicate Detection',
      subtitle: 'Zero duplicate payment leakage',
      icon: <Copy size={22} className="text-[#0078D4]" />,
      iconBg: 'bg-[#0078D4]/10 border-[#0078D4]/30',
      description:
        'Deep semantic hashing and cross-vendor matching intercept identical or slightly altered invoices across business units, tax IDs, and date windows before funds disburse.',
      badge: '$0 Double Payouts',
      badgeColor: 'text-[#38BDF8] bg-[#38BDF8]/10 border-[#38BDF8]/30',
    },
    {
      id: 'audit-log',
      title: 'Audit Log',
      subtitle: 'Immutable compliance trail',
      icon: <History size={22} className="text-[#0078D4]" />,
      iconBg: 'bg-[#0078D4]/10 border-[#0078D4]/30',
      description:
        'Every extraction token, 3-way reconciliation rule, variance check, and approval action is permanently timestamped and cryptographically indexed for SOX and internal audits.',
      badge: '100% Traceability',
      badgeColor: 'text-[#A78BFA] bg-[#A78BFA]/10 border-[#A78BFA]/30',
    },
    {
      id: 'explainable-flags',
      title: 'Explainable Flags',
      subtitle: 'Plain-language exception reasons',
      icon: <AlertCircle size={22} className="text-[#0078D4]" />,
      iconBg: 'bg-[#0078D4]/10 border-[#0078D4]/30',
      description:
        'When an invoice must reach a human, AP Auditor presents concise, plain-language explanations with exact line-item side-by-side differentials rather than cryptic failure codes.',
      badge: 'Instant Resolution',
      badgeColor: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30',
    },
  ];

  return (
    <section id="features" className="py-12 sm:py-16 md:py-20 bg-[#0A0A0C] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        {/* Section Header */}
        <div className="max-w-2xl mb-8 sm:mb-12 space-y-2.5 sm:space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0078D4]/10 border border-[#0078D4]/30 text-xs font-mono text-[#60A5FA]">
            <span>CORE CAPABILITIES</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight font-sans">
            Built for High-Volume Accounts Payable
          </h2>
          <p className="text-sm sm:text-base text-[#94A3B8] font-sans leading-relaxed">
            Eliminate clerical invoice processing bottlenecks while locking down treasury against erroneous or duplicate payouts.
          </p>
        </div>

        {/* 4 Clean Icon Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature) => (
            <div
              key={feature.id}
              onClick={() => onSelectFeature && onSelectFeature(feature.id)}
              className="group p-5 sm:p-6 rounded-xl bg-[#0F1219] hover:bg-[#131722] border border-white/10 hover:border-[#0078D4]/50 transition-all duration-200 flex flex-col justify-between space-y-5 sm:space-y-6 shadow-sm hover:shadow-[0_10px_30px_rgba(0,120,212,0.12)] cursor-pointer"
            >
              <div className="space-y-4">
                {/* Icon header */}
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-lg ${feature.iconBg} border flex items-center justify-center transition-transform group-hover:scale-105`}
                  >
                    {feature.icon}
                  </div>
                  <span
                    className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded border ${feature.badgeColor}`}
                  >
                    {feature.badge}
                  </span>
                </div>

                {/* Title & subtitle */}
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white font-sans group-hover:text-[#60A5FA] transition-colors flex items-center gap-1.5">
                    <span>{feature.title}</span>
                    <ArrowUpRight
                      size={15}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[#60A5FA]"
                    />
                  </h3>
                  <div className="text-xs font-medium text-[#64748B]">
                    {feature.subtitle}
                  </div>
                </div>

                {/* Plain text description */}
                <p className="text-sm text-[#94A3B8] leading-relaxed font-sans">
                  {feature.description}
                </p>
              </div>

              {/* Bottom accent indicator */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-[#64748B] group-hover:text-[#94A3B8]">
                <span>Automated Rule</span>
                <span className="font-mono text-[#0078D4] text-[11px]">ACTIVE</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
