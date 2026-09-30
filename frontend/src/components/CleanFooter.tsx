import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface CleanFooterProps {
  onNavigate?: (view: 'home' | 'dashboard' | 'review' | 'audit') => void;
}

export const CleanFooter: React.FC<CleanFooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#08090C] border-t border-white/10 py-12 text-[#94A3B8] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/10">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[#0078D4]/15 border border-[#0078D4]/40 flex items-center justify-center text-[#0078D4] shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div className="text-left">
              <span className="font-bold text-white tracking-tight">AP Auditor</span>
              <span className="text-xs text-[#64748B] block">
                Autonomous AP Exception Routing & Reconciliation
              </span>
            </div>
          </div>

          {/* Minimal Navigation */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm">
            <button
              onClick={() => onNavigate && onNavigate('home')}
              className="hover:text-white transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-white transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => onNavigate && onNavigate('dashboard')}
              className="hover:text-white transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => onNavigate && onNavigate('review')}
              className="hover:text-white transition-colors"
            >
              Review Queue
            </button>
            <button
              onClick={() => onNavigate && onNavigate('audit')}
              className="hover:text-white transition-colors"
            >
              Audit Log
            </button>
          </div>
        </div>

        {/* Bottom row: status & copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#64748B]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span>All systems operational // Azure East US</span>
          </div>

          <div>
            &copy; {new Date().getFullYear()} AP Auditor Inc. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
