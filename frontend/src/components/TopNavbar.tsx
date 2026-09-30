import React, { useState } from 'react';
import { ShieldCheck, Menu, X, ArrowRight } from 'lucide-react';

interface TopNavbarProps {
  activeView: 'home' | 'dashboard' | 'review' | 'audit';
  onNavigate: (view: 'home' | 'dashboard' | 'review' | 'audit') => void;
  onGetStarted: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeView,
  onNavigate,
  onGetStarted,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', isPage: true },
    { id: 'features', label: 'Features', isPage: false },
    { id: 'dashboard', label: 'Dashboard', isPage: true },
    { id: 'review', label: 'Review Queue', isPage: true },
    { id: 'audit', label: 'Audit Log', isPage: true },
  ];

  const handleItemClick = (item: { id: string; label: string; isPage: boolean }) => {
    setMobileMenuOpen(false);
    if (item.id === 'features') {
      if (activeView !== 'home') {
        onNavigate('home');
        setTimeout(() => {
          document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      onNavigate(item.id as 'home' | 'dashboard' | 'review' | 'audit');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0A0A0C]/90 backdrop-blur-xl border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-lg bg-[#0078D4]/15 border border-[#0078D4]/40 flex items-center justify-center text-[#0078D4] group-hover:bg-[#0078D4] group-hover:text-white transition-all shadow-[0_0_15px_rgba(0,120,212,0.25)]">
            <ShieldCheck size={20} className="stroke-[2.2]" />
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span className="font-sans font-bold text-lg text-white tracking-tight">
                AP Auditor
              </span>
              <span className="text-[10px] font-mono font-semibold bg-[#0078D4]/20 text-[#60A5FA] px-1.5 py-0.5 rounded border border-[#0078D4]/30">
                ENTERPRISE
              </span>
            </div>
            <span className="text-[11px] text-[#8A8F9E] hidden sm:inline-block">
              Autonomous Exception Routing
            </span>
          </div>
        </div>

        {/* Center: Nav links */}
        <nav className="hidden md:flex items-center gap-1 font-sans text-sm">
          {navItems.map((item) => {
            const isActive =
              item.id === 'features' ? false : activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`px-3.5 py-1.5 rounded-md font-medium transition-all ${
                  isActive
                    ? 'text-white bg-white/10 shadow-sm'
                    : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: "Get Started" CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onGetStarted}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#0078D4] hover:bg-[#1084DE] active:bg-[#0063B1] text-white font-medium text-sm transition-all shadow-[0_0_20px_rgba(0,120,212,0.35)] hover:shadow-[0_0_25px_rgba(0,120,212,0.5)] cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Mobile / Tablet Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#94A3B8] hover:text-white rounded-md hover:bg-white/5"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#0E1017] px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="w-full text-left px-3 py-2 rounded-md text-sm text-[#94A3B8] hover:text-white hover:bg-white/5 font-medium"
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onGetStarted();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-[#0078D4] text-white font-medium text-sm"
            >
              <span>Get Started</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
