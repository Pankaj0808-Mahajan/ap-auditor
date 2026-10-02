import React from 'react';
import {
  MessageSquarePlus,
  LayoutDashboard,
  FileCheck2,
  AlertTriangle,
  History,
  Zap,
  X,
  ChevronRight,
  Database,
  Sparkles,
  Bot,
} from 'lucide-react';

export interface ChatSidebarProps {
  activeView: 'home' | 'dashboard' | 'review' | 'audit';
  onNavigate: (view: 'home' | 'dashboard' | 'review' | 'audit') => void;
  onNewChat: () => void;
  onSelectPrompt: (prompt: string) => void;
  isOpen: boolean;
  onClose: () => void;
  pendingCount?: number;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  activeView,
  onNavigate,
  onNewChat,
  onSelectPrompt,
  isOpen,
  onClose,
  pendingCount = 3,
}) => {
  const recentSessions = [
    {
      id: 'session-1',
      title: 'Flagged Invoices Review',
      snippet: '3 exceptions requiring SOX sign-off',
      prompt: 'Show all flagged invoices requiring review',
      badge: '3 FLAGS',
      badgeColor: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30',
    },
    {
      id: 'session-2',
      title: 'Kyocera Duplicate Check',
      snippet: 'Matched settled voucher V-8812',
      prompt: 'Check for duplicate invoices & payment risks',
      badge: 'BLOCKED',
      badgeColor: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30',
    },
    {
      id: 'session-3',
      title: 'Titan Hydraulics Variance',
      snippet: '+4.2% unit rate mismatch on seal flange',
      prompt: 'Explain variance for Titan Hydraulics PO-2026-9043',
      badge: 'VARIANCE',
      badgeColor: 'text-[#38BDF8] bg-[#38BDF8]/10 border-[#38BDF8]/30',
    },
    {
      id: 'session-4',
      title: 'Q3 Auto-Pass Telemetry',
      snippet: '94.2% pass rate across 14,820 vouchers',
      prompt: 'What is our auto-pass rate and audit status?',
      badge: 'REPORT',
      badgeColor: 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30',
    },
  ];

  const quickPrompts = [
    { label: 'Review Flagged Exceptions', prompt: 'Show all flagged invoices requiring review' },
    { label: 'Check Duplicate Risks', prompt: 'Scan for duplicate invoices and voucher clashes' },
    { label: 'Explain Titan PO Variance', prompt: 'Explain variance for Titan Hydraulics PO-2026-9043' },
    { label: 'ERP Auto-Pass Summary', prompt: 'Summarize today\'s 94.2% auto-pass rate and exceptions' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-72 sm:w-80 bg-[#0B0D14] border-r border-white/10 flex flex-col justify-between transition-transform duration-300 ease-in-out font-sans ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Branding */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div
            onClick={() => {
              onNavigate('home');
              onClose();
            }}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-[#0078D4]/20 border border-[#0078D4]/50 flex items-center justify-center text-[#38BDF8] group-hover:bg-[#0078D4] group-hover:text-white transition-all shadow-[0_0_15px_rgba(0,120,212,0.3)]">
              <Bot size={18} className="stroke-[2.2]" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white tracking-tight text-sm">AP Copilot</span>
                <span className="text-[9px] font-mono font-bold bg-[#0078D4]/25 text-[#60A5FA] px-1.5 py-0.2 rounded border border-[#0078D4]/40">
                  AI ASSISTANT
                </span>
              </div>
              <span className="text-[11px] text-[#64748B] block">Enterprise Conversational AI</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md text-[#94A3B8] hover:text-white hover:bg-white/10"
            aria-label="Close Sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 text-left">
          {/* Action: New Audit Chat */}
          <button
            onClick={() => {
              onNewChat();
              if (activeView !== 'home') onNavigate('home');
              onClose();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#0078D4] to-[#1084DE] hover:from-[#1084DE] hover:to-[#0078D4] text-white font-medium text-xs shadow-[0_0_20px_rgba(0,120,212,0.3)] transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <MessageSquarePlus size={16} />
              <span>New Audit Chat</span>
            </div>
            <Sparkles size={14} className="opacity-80 group-hover:rotate-12 transition-transform" />
          </button>

          {/* Core Navigation Items */}
          <div className="space-y-1">
            <div className="px-2 text-[10px] font-mono text-[#64748B] uppercase tracking-wider mb-1.5">
              Workspaces & Telemetry
            </div>

            <button
              onClick={() => {
                onNavigate('home');
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeView === 'home'
                  ? 'bg-[#151A27] text-white border border-[#0078D4]/50 shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bot size={15} className={activeView === 'home' ? 'text-[#38BDF8]' : ''} />
                <span>Chat Copilot</span>
              </div>
              <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/15 px-1.5 py-0.2 rounded border border-[#10B981]/30">
                ACTIVE
              </span>
            </button>

            <button
              onClick={() => {
                onNavigate('dashboard');
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeView === 'dashboard'
                  ? 'bg-[#151A27] text-white border border-[#0078D4]/50 shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard size={15} className={activeView === 'dashboard' ? 'text-[#38BDF8]' : ''} />
                <span>Live Dashboard</span>
              </div>
              <ChevronRight size={13} className="text-[#64748B]" />
            </button>

            <button
              onClick={() => {
                onNavigate('review');
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeView === 'review'
                  ? 'bg-[#151A27] text-white border border-[#0078D4]/50 shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle size={15} className={activeView === 'review' ? 'text-[#38BDF8]' : ''} />
                <span>Review Queue</span>
              </div>
              {pendingCount > 0 && (
                <span className="text-[10px] font-mono font-bold bg-[#EF4444]/20 text-[#EF4444] px-1.5 py-0.2 rounded border border-[#EF4444]/40">
                  {pendingCount} PENDING
                </span>
              )}
            </button>

            <button
              onClick={() => {
                onNavigate('audit');
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeView === 'audit'
                  ? 'bg-[#151A27] text-white border border-[#0078D4]/50 shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileCheck2 size={15} className={activeView === 'audit' ? 'text-[#38BDF8]' : ''} />
                <span>SOX Audit Log</span>
              </div>
              <ChevronRight size={13} className="text-[#64748B]" />
            </button>
          </div>

          {/* Saved Sessions / Audit Dossiers */}
          <div className="space-y-1">
            <div className="px-2 text-[10px] font-mono text-[#64748B] uppercase tracking-wider mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <History size={11} />
                Recent Audit Dialogs
              </span>
            </div>

            {recentSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => {
                  if (activeView !== 'home') onNavigate('home');
                  onSelectPrompt(session.prompt);
                  onClose();
                }}
                className="p-2.5 rounded-lg border border-white/5 hover:border-white/15 bg-[#0E1119]/80 hover:bg-[#141824] transition-all cursor-pointer group space-y-1"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-white group-hover:text-[#60A5FA] transition-colors truncate">
                    {session.title}
                  </span>
                  <span
                    className={`text-[9px] font-mono px-1 py-0.2 rounded border ${session.badgeColor}`}
                  >
                    {session.badge}
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] truncate leading-tight">
                  {session.snippet}
                </p>
              </div>
            ))}
          </div>

          {/* Quick Prompts */}
          <div className="space-y-1.5">
            <div className="px-2 text-[10px] font-mono text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
              <Zap size={11} className="text-[#FFB900]" />
              Quick Audit Queries
            </div>

            <div className="space-y-1">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (activeView !== 'home') onNavigate('home');
                    onSelectPrompt(qp.prompt);
                    onClose();
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-md text-[11px] text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors truncate"
                >
                  › {qp.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Footer: Enterprise ERP Status & Auditor Profile */}
        <div className="p-3 border-t border-white/10 bg-[#08090D] space-y-2.5 text-left text-xs">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-[11px] text-[#8A94A8]">
              <Database size={12} className="text-[#10B981]" />
              <span>SAP S/4HANA</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#10B981]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              LIVE ERP
            </span>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-[#111420] border border-white/5">
            <div className="w-7 h-7 rounded-full bg-[#0078D4]/25 border border-[#0078D4]/40 flex items-center justify-center text-xs font-mono font-bold text-[#60A5FA]">
              JM
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-semibold text-white truncate">J. Morgan</div>
              <div className="text-[10px] text-[#64748B] truncate">Senior AP Auditor (SOX Auth)</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
