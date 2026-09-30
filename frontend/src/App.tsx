import React, { useState } from 'react';
import { TopNavbar } from './components/TopNavbar';
import { CleanHeroSection } from './components/CleanHeroSection';
import { CleanFeaturesSection } from './components/CleanFeaturesSection';
import { CleanFooter } from './components/CleanFooter';
import { DashboardPage } from './pages/DashboardPage';
import { ReviewQueuePage } from './pages/ReviewQueuePage';
import { AuditLogPage } from './pages/AuditLogPage';
import { GetStartedModal } from './components/GetStartedModal';

export function App() {
  const [activeView, setActiveView] = useState<'home' | 'dashboard' | 'review' | 'audit'>('home');
  const [isGetStartedOpen, setIsGetStartedOpen] = useState(false);

  const handleLearnMore = () => {
    const featuresEl = document.getElementById('features');
    if (featuresEl) {
      featuresEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#E6E8EE] flex flex-col font-sans selection:bg-[#0078D4]/40 selection:text-white">
      {/* 1. TOP NAVBAR */}
      <TopNavbar
        activeView={activeView}
        onNavigate={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onGetStarted={() => setIsGetStartedOpen(true)}
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full">
        {activeView === 'home' && (
          <div>
            {/* 2. HERO SECTION (ONE simple 3D animation: floating invoice cards, dark bg, blue accent glow) */}
            <CleanHeroSection
              onGetStarted={() => setIsGetStartedOpen(true)}
              onLearnMore={handleLearnMore}
            />

            {/* 3. BELOW HERO: 100% NORMAL SIMPLE HTML/CSS/REACT — NO 3D */}
            <CleanFeaturesSection
              onSelectFeature={(featureId) => {
                if (featureId === 'auto-pass') setActiveView('dashboard');
                else if (featureId === 'duplicate-detection' || featureId === 'explainable-flags')
                  setActiveView('review');
                else if (featureId === 'audit-log') setActiveView('audit');
              }}
            />

            {/* Simple Clean Workflow Preview (Normal HTML/CSS/React) */}
            <section className="py-12 sm:py-16 md:py-20 bg-[#07080B] border-t border-white/10 text-left">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 sm:gap-6 pb-6 border-b border-white/10">
                  <div className="max-w-2xl space-y-2">
                    <span className="text-xs font-mono text-[#0078D4] font-semibold uppercase">
                      Workflow Blueprint
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      How It Works in Your Financial Stack
                    </h2>
                    <p className="text-xs sm:text-sm text-[#94A3B8]">
                      Integrates upstream with email inboxes, EDI, and vendor portals, and downstream directly with your ERP general ledger.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => setActiveView('dashboard')}
                      className="px-4 py-2.5 sm:py-2 rounded-lg bg-[#141824] hover:bg-[#1D2335] border border-white/15 text-xs text-white font-medium transition-colors text-center"
                    >
                      Open Live Dashboard
                    </button>
                    <button
                      onClick={() => setActiveView('review')}
                      className="px-4 py-2.5 sm:py-2 rounded-lg bg-[#0078D4] hover:bg-[#1084DE] text-xs text-white font-medium transition-colors text-center"
                    >
                      Open Review Queue
                    </button>
                  </div>
                </div>

                {/* 3-Step Process Cards (Normal Clean React) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  <div className="p-5 sm:p-6 rounded-xl bg-[#0F1219] border border-white/10 space-y-3 sm:space-y-4">
                    <div className="text-xs font-mono text-[#0078D4] font-bold">
                      STEP 01 // INGESTION & OCR
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      Instant Invoice Extraction
                    </h3>
                    <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                      PDF, TIFF, EDI, or scanned paper bills are parsed with sub-cent accuracy. Vendor headers, PO references, and line-item tables are instantly structured.
                    </p>
                  </div>

                  <div className="p-5 sm:p-6 rounded-xl bg-[#0F1219] border border-white/10 space-y-3 sm:space-y-4">
                    <div className="text-xs font-mono text-[#0078D4] font-bold">
                      STEP 02 // DETERMINISTIC AUDIT
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      3-Way Match & Duplicate Scan
                    </h3>
                    <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                      Reconciles item rates against authorized POs and goods receipt notes. Cross-checks settled voucher history across all subsidiaries to block duplicate payments.
                    </p>
                  </div>

                  <div className="p-5 sm:p-6 rounded-xl bg-[#0F1219] border border-white/10 space-y-3 sm:space-y-4">
                    <div className="text-xs font-mono text-[#0078D4] font-bold">
                      STEP 03 // EXCEPTION ROUTING
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      94.2% Auto-Pass, Exceptions to Humans
                    </h3>
                    <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                      Clean invoices flow directly into ERP payment batches without human intervention. Only genuine anomalies appear in the reviewer queue with clear explainable notes.
                    </p>
                  </div>
                </div>

                {/* Minimal CTA Banner */}
                <div className="p-6 sm:p-8 md:p-10 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#0E1320] via-[#0E1528] to-[#0D101A] border border-[#0078D4]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[0_10px_40px_rgba(0,120,212,0.15)]">
                  <div className="space-y-2 text-left">
                    <h3 className="text-lg sm:text-2xl font-bold text-white">
                      Ready to streamline your Accounts Payable?
                    </h3>
                    <p className="text-xs sm:text-sm text-[#94A3B8] max-w-xl">
                      Deploy AP Auditor alongside SAP, Oracle, NetSuite, or Workday in days, not months.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                    <button
                      onClick={() => setIsGetStartedOpen(true)}
                      className="px-6 py-3 rounded-lg bg-[#0078D4] hover:bg-[#1084DE] text-white font-medium text-sm transition-all shadow-md text-center cursor-pointer w-full sm:w-auto"
                    >
                      Get Started
                    </button>
                    <button
                      onClick={() => setActiveView('review')}
                      className="px-6 py-3 rounded-lg bg-[#141824] hover:bg-[#1C2234] border border-white/20 text-white font-medium text-sm transition-colors text-center cursor-pointer w-full sm:w-auto"
                    >
                      Try Review Queue
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* REST OF THE APP: COMPLETELY NORMAL REACT COMPONENTS, NO 3D ANYWHERE ELSE */}
        {activeView === 'dashboard' && (
          <DashboardPage onNavigateToReview={() => setActiveView('review')} />
        )}

        {activeView === 'review' && <ReviewQueuePage />}

        {activeView === 'audit' && <AuditLogPage />}
      </main>

      {/* 4. FOOTER: SIMPLE, MINIMAL */}
      <CleanFooter
        onNavigate={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* GET STARTED MODAL */}
      <GetStartedModal
        isOpen={isGetStartedOpen}
        onClose={() => setIsGetStartedOpen(false)}
        onLaunchDemo={() => setActiveView('review')}
      />
    </div>
  );
}

export default App;
