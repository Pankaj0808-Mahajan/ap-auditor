import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  Paperclip,
  RotateCcw,
  Download,
  Menu,
  ShieldAlert,
  ArrowUpRight,
} from 'lucide-react';
import { ChatSidebar } from './ChatSidebar';
import { InvoiceCard, InvoiceCardData } from './InvoiceCard';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  invoices?: InvoiceCardData[];
  quickActions?: { label: string; prompt: string }[];
  isActionLog?: boolean;
}

interface ChatHomePageProps {
  activeView: 'home' | 'dashboard' | 'review' | 'audit';
  onNavigate: (view: 'home' | 'dashboard' | 'review' | 'audit') => void;
  onOpenGetStarted?: () => void;
}

const INITIAL_EXCEPTIONS: InvoiceCardData[] = [
  {
    id: 'EXC-8820',
    vendor: 'KYOCERA INDUSTRIAL SENSORS',
    amount: '$38,910.50',
    poNumber: 'PO-2026-9042',
    flagType: 'DUPLICATE',
    flagTitle: 'Identical Invoice Hash Detected',
    explainableReason:
      'Vendor submitted an invoice with identical line-item amounts, line descriptions, and date matching settled voucher V-8812 paid on Sept 14, 2026. Automated disbursement halted.',
    invoiceValue: '$38,910.50',
    poExpectedValue: '$0.00 (Already Paid)',
    difference: '+$38,910.50 Overpay Risk',
    detectedAt: '8 mins ago',
    status: 'pending',
    voucherMatch: 'V-8812 ($38,910.50)',
    hash: 'sha256:7b1029c49a3e',
  },
  {
    id: 'EXC-8821',
    vendor: 'TITAN HYDRAULICS FABRICATION',
    amount: '$219,840.00',
    poNumber: 'PO-2026-9043',
    flagType: 'VARIANCE',
    flagTitle: 'Line-Item Rate Variance (+4.2%)',
    explainableReason:
      'Line Item #3 "High-Pressure Seal Flange" is billed at $440.00/unit. Master PO-2026-9043 specifies negotiated contract rate of $422.00/unit. Total variance exceeds allowed 1.0% threshold.',
    invoiceValue: '$219,840.00',
    poExpectedValue: '$210,970.00',
    difference: '+$8,870.00 Variance',
    detectedAt: '15 mins ago',
    status: 'pending',
    hash: 'sha256:ee0419d882ca',
    lineItemDetails: [
      {
        item: 'High-Pressure Seal Flange (500 units)',
        poRate: '$422.00/ea',
        billedRate: '$440.00/ea',
        delta: '+$8,870.00',
      },
    ],
  },
  {
    id: 'EXC-8822',
    vendor: 'APEX LOGISTICS INTERNATIONAL',
    amount: '$12,450.00',
    poNumber: 'PO-UNKNOWN',
    flagType: 'TAX_MISMATCH',
    flagTitle: 'Missing Purchase Order & Tax ID',
    explainableReason:
      'Invoice received without referenced authorized Purchase Order. Vendor Corporate Tax Registration Number (GSTIN/EIN) does not match vendor master record in SAP S/4HANA.',
    invoiceValue: '$12,450.00',
    poExpectedValue: 'PO Required',
    difference: 'Unallocated Spend',
    detectedAt: '32 mins ago',
    status: 'pending',
    hash: 'sha256:331fcba87910',
    taxId: 'TAX-EIN-MISMATCH-991',
  },
];

export const ChatHomePage: React.FC<ChatHomePageProps> = ({
  activeView,
  onNavigate,
  onOpenGetStarted,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [exceptions, setExceptions] = useState<InvoiceCardData[]>(INITIAL_EXCEPTIONS);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      timestamp: 'Just now',
      text: "👋 Welcome back, Auditor Morgan. I am your **AP Auditor Enterprise Copilot**.\n\nToday I've audited **14,820 inbound vouchers** against SAP S/4HANA PO master and 3-way matching rules. **94.2% (13,960 vouchers)** were auto-passed directly to payment batches.\n\n⚠️ **3 high-risk exceptions** were intercepted at the deterministic audit gate and require human review. How can I assist your audit today?",
      quickActions: [
        { label: '🚨 Show Flagged Invoices', prompt: 'Show all flagged invoices requiring review' },
        { label: '🛡️ Scan Duplicate Interceptions', prompt: 'Check for duplicate invoices & payment risks' },
        { label: '📈 Explain Titan Rate Variance', prompt: 'Explain variance for Titan Hydraulics PO-2026-9043' },
        { label: '📊 View Auto-Pass Metrics', prompt: 'What is our auto-pass rate and SOX compliance status?' },
      ],
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle invoice actions from inline cards
  const handleApproveInvoice = (invoiceId: string, note?: string) => {
    setExceptions((prev) =>
      prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: 'approved' } : inv))
    );

    const targetInvoice = exceptions.find((inv) => inv.id === invoiceId);
    const vendorName = targetInvoice ? targetInvoice.vendor : invoiceId;
    const logId = `LOG-${Math.floor(10000 + Math.random() * 90000)}`;

    const confirmationMsg: ChatMessage = {
      id: `msg-act-${Date.now()}`,
      sender: 'assistant',
      timestamp: 'Just now',
      text: `✅ **SOX Audit Record Created [${logId}]**\n\nException **${invoiceId}** for **${vendorName}** was marked as **APPROVED** by Auditor J. Morgan.\n\n- **Audit Trace Hash:** \`${targetInvoice?.hash || 'sha256:49a8f290e812'}\`\n- **GL Action:** Payment voucher released to SAP S/4HANA disbursement batch.\n- **Sign-off Note:** "${note || 'Authorized human override under SOX 404 policy.'}"`,
      isActionLog: true,
      quickActions: [
        { label: 'View in SOX Audit Log', prompt: 'Open audit log entries' },
        { label: 'Review Remaining Exceptions', prompt: 'Show all flagged invoices requiring review' },
      ],
    };

    setMessages((prev) => [...prev, confirmationMsg]);
  };

  const handleRejectInvoice = (invoiceId: string, note?: string) => {
    setExceptions((prev) =>
      prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: 'rejected' } : inv))
    );

    const targetInvoice = exceptions.find((inv) => inv.id === invoiceId);
    const vendorName = targetInvoice ? targetInvoice.vendor : invoiceId;
    const logId = `LOG-${Math.floor(10000 + Math.random() * 90000)}`;

    const confirmationMsg: ChatMessage = {
      id: `msg-act-${Date.now()}`,
      sender: 'assistant',
      timestamp: 'Just now',
      text: `🛑 **Invoice Rejected & Treasury Protected [${logId}]**\n\nException **${invoiceId}** for **${vendorName}** was marked as **REJECTED**.\n\n- **Disbursement Status:** Locked permanently against payment batch.\n- **Automated Vendor Dispatch:** Credit memo request dispatched to AP contact with explainable audit evidence breakdown.\n- **Reason:** ${note || 'Discrepancy exceeds permissible PO variance threshold.'}`,
      isActionLog: true,
      quickActions: [
        { label: 'View in SOX Audit Log', prompt: 'Open audit log entries' },
        { label: 'Show Remaining Invoices', prompt: 'Show all flagged invoices requiring review' },
      ],
    };

    setMessages((prev) => [...prev, confirmationMsg]);
  };

  const executePrompt = (promptText: string) => {
    if (!promptText.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: 'Just now',
      text: promptText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsTyping(true);

    // Analyze intent and respond
    const lower = promptText.toLowerCase();

    setTimeout(() => {
      let reply: ChatMessage;

      if (
        lower.includes('flagged') ||
        lower.includes('exception') ||
        lower.includes('requiring review') ||
        lower.includes('show all') ||
        lower.includes('review remaining')
      ) {
        reply = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          timestamp: 'Just now',
          text: `🚨 **Autonomous Ingestion Gate: 3 Flagged Invoices**\n\nI have isolated **3 high-risk exceptions** that failed deterministic 3-way matching and duplicate hash scanning. Each dossier includes the explainable AI rationale and three-way reconciliation delta below:`,
          invoices: exceptions,
          quickActions: [
            { label: 'Check Duplicates Specifically', prompt: 'Check for duplicate invoices & payment risks' },
            { label: 'Inspect Titan PO Terms', prompt: 'Explain variance for Titan Hydraulics PO-2026-9043' },
            { label: 'Open Review Queue Page', prompt: 'Open review queue' },
          ],
        };
      } else if (lower.includes('duplicate') || lower.includes('kyocera') || lower.includes('v-8812')) {
        const kyocera = exceptions.filter((e) => e.flagType === 'DUPLICATE');
        reply = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          timestamp: 'Just now',
          text: `🛡️ **Duplicate Payment Interception Dossier**\n\n**Risk Score:** 100% Critical Certainty\n- **Identical Hash:** \`sha256:7b1029c49a3e\` matches historical invoice voucher \`#V-8812\`.\n- **Settlement History:** Voucher #V-8812 was disbursed on Sept 14, 2026 for **$38,910.50**.\n- **Action:** Automated disbursement locked. Treasury loss prevented: **$38,910.50**.`,
          invoices: kyocera,
          quickActions: [
            { label: 'Show All Flagged Exceptions', prompt: 'Show all flagged invoices requiring review' },
            { label: 'Reject Kyocera & Request Credit', prompt: 'Reject EXC-8820' },
          ],
        };
      } else if (lower.includes('titan') || lower.includes('variance') || lower.includes('9043')) {
        const titan = exceptions.filter((e) => e.flagType === 'VARIANCE');
        reply = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          timestamp: 'Just now',
          text: `📈 **Rate Variance Analysis: Titan Hydraulics**\n\n- **Referenced PO:** \`PO-2026-9043\` (Master Contract: Global Heavy Fabrication)\n- **Negotiated Rate:** $422.00/unit for High-Pressure Seal Flange\n- **Billed Rate:** $440.00/unit (+4.26% over contracted rate)\n- **Policy Rule:** AP Auditor flags any variance exceeding **1.00%** on tier-1 components.\n- **Reconciliation Delta:** **+$8,870.00 Overbill** on 500 units.`,
          invoices: titan,
          quickActions: [
            { label: 'Approve with Override', prompt: 'Approve EXC-8821' },
            { label: 'Reject & Request Credit', prompt: 'Reject EXC-8821' },
            { label: 'Show All Exceptions', prompt: 'Show all flagged invoices requiring review' },
          ],
        };
      } else if (lower.includes('apex') || lower.includes('tax') || lower.includes('missing po')) {
        const apex = exceptions.filter((e) => e.flagType === 'TAX_MISMATCH');
        reply = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          timestamp: 'Just now',
          text: `⚠️ **Compliance Discrepancy: Apex Logistics**\n\n- **Invoice Amount:** $12,450.00\n- **PO Reference:** Missing / No authorized Purchase Order cited.\n- **Tax Registration (GSTIN/EIN):** The Tax ID on bill header does not match vendor master record in SAP S/4HANA.\n- **Audit Risk:** Unallocated spend; failure of SOX Section 404 pre-approval control.`,
          invoices: apex,
          quickActions: [
            { label: 'Request PO from Procurement', prompt: 'How do I request retroactive PO for Apex?' },
            { label: 'Show All Flagged Invoices', prompt: 'Show all flagged invoices requiring review' },
          ],
        };
      } else if (
        lower.includes('auto-pass') ||
        lower.includes('rate') ||
        lower.includes('stats') ||
        lower.includes('dashboard') ||
        lower.includes('metrics')
      ) {
        reply = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          timestamp: 'Just now',
          text: `📊 **Enterprise Telemetry & Performance Summary**\n\n| Metric | Live Value | 24h Variance |\n| :--- | :--- | :--- |\n| **Total Invoices Ingested** | 14,820 | +12.4% |\n| **Hands-Off Auto-Pass Rate** | 94.2% | +2.1% model tuning |\n| **Exceptions Reaching Humans** | 860 total (3 urgent pending) | -58% workload |\n| **Duplicate Leakage Blocked** | $342,850.00 | 14 duplicate vouchers caught |\n| **Average Processing Time** | 1.8 seconds/invoice | Sub-second OCR |\n\nAll approved vouchers have been synchronized with the SAP S/4HANA General Ledger.`,
          quickActions: [
            { label: 'Open Full Dashboard', prompt: 'Open dashboard page' },
            { label: 'Show Flagged Invoices', prompt: 'Show all flagged invoices requiring review' },
            { label: 'View SOX Audit Ledger', prompt: 'Open audit log entries' },
          ],
        };
      } else if (lower.includes('open audit log') || lower.includes('audit log')) {
        onNavigate('audit');
        reply = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          timestamp: 'Just now',
          text: `Navigating you to the **SOX Audit Log** page to inspect full cryptographic hashes and immutable decision trails.`,
        };
      } else if (lower.includes('open review') || lower.includes('review queue')) {
        onNavigate('review');
        reply = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          timestamp: 'Just now',
          text: `Navigating you to the **Exception Review Queue** page for batch triage.`,
        };
      } else if (lower.includes('open dashboard') || lower.includes('dashboard page')) {
        onNavigate('dashboard');
        reply = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          timestamp: 'Just now',
          text: `Navigating you to the **Live Dashboard** page for throughput and savings metrics.`,
        };
      } else if (lower.includes('approve exc-8821') || lower.includes('approve titan')) {
        handleApproveInvoice('EXC-8821', 'Approved directly through chat command');
        setIsTyping(false);
        return;
      } else if (lower.includes('reject exc-8820') || lower.includes('reject kyocera')) {
        handleRejectInvoice('EXC-8820', 'Rejected duplicate voucher via chat command');
        setIsTyping(false);
        return;
      } else {
        reply = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          timestamp: 'Just now',
          text: `Understood, Auditor Morgan. As your AP Conversational Assistant, I am connected directly to your **SAP S/4HANA ERP**, **Purchase Order contracts**, and **SOX compliance engine**.\n\nYou can ask me to:\n- **Audit specific invoices** (e.g., *"Show flagged invoices"*, *"Explain Titan variance"*)\n- **Inspect duplicate risk** (e.g., *"Scan for duplicate invoices"*)\n- **Review financial impact** (e.g., *"Show auto-pass rate and leakage blocked"*)\n- **Take sign-off actions** inline with permanent audit recording.`,
          quickActions: [
            { label: 'Show Flagged Invoices', prompt: 'Show all flagged invoices requiring review' },
            { label: 'Check Duplicates', prompt: 'Check for duplicate invoices & payment risks' },
            { label: 'View Auto-Pass Telemetry', prompt: 'What is our auto-pass rate and SOX compliance status?' },
          ],
        };
      }

      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
    }, 600);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `msg-reset-${Date.now()}`,
        sender: 'assistant',
        timestamp: 'Just now',
        text: "✨ **New Audit Session Initialized**\n\nConnected to SAP S/4HANA PO master. 3 exceptions currently flagged at the deterministic audit gate. How can I assist?",
        quickActions: [
          { label: '🚨 Show Flagged Invoices', prompt: 'Show all flagged invoices requiring review' },
          { label: '🛡️ Scan Duplicate Interceptions', prompt: 'Check for duplicate invoices & payment risks' },
          { label: '📈 Explain Titan Rate Variance', prompt: 'Explain variance for Titan Hydraulics PO-2026-9043' },
        ],
      },
    ]);
  };

  const handleSimulateUpload = () => {
    const uploadPrompt = 'Simulate OCR ingestion of inbound invoice PDF #INV-2026-9046 from SIEMENS';
    setInputPrompt(uploadPrompt);
    executePrompt(uploadPrompt);
  };

  const handleExportChat = () => {
    const logData = {
      auditor: 'J. Morgan (Senior Auditor)',
      sessionDate: new Date().toISOString(),
      system: 'AP Auditor Enterprise Conversational AI v2.6',
      soxCompliance: 'Section 404 Authenticated',
      messages: messages.map((m) => ({
        sender: m.sender,
        timestamp: m.timestamp,
        content: m.text,
        invoices: m.invoices?.map((i) => ({ id: i.id, vendor: i.vendor, status: i.status })),
      })),
    };

    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ap-copilot-audit-dossier-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen w-full bg-[#0A0A0C] text-[#E6E8EE] overflow-hidden font-sans">
      {/* 1. LEFT SIDEBAR (ChatGPT Layout) */}
      <ChatSidebar
        activeView={activeView}
        onNavigate={onNavigate}
        onNewChat={handleResetChat}
        onSelectPrompt={executePrompt}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        pendingCount={exceptions.filter((e) => e.status === 'pending').length}
      />

      {/* 2. MAIN CHAT WINDOW */}
      <div className="flex-1 flex flex-col h-full bg-[#0E1017] min-w-0 relative">
        {/* Top Header Bar */}
        <header className="h-14 sm:h-16 px-4 sm:px-6 border-b border-white/10 bg-[#0B0D14]/90 backdrop-blur-md flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger to toggle Sidebar */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle Navigation Sidebar"
            >
              <Menu size={20} />
            </button>

            {/* Model & Copilot Title */}
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-8 h-8 rounded-lg bg-[#0078D4]/20 border border-[#0078D4]/40 flex items-center justify-center text-[#38BDF8] shadow-[0_0_12px_rgba(0,120,212,0.25)]">
                <Bot size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    AP Auditor Assistant
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[#0078D4]/15 text-[#60A5FA] border border-[#0078D4]/30 font-semibold">
                    <Sparkles size={11} />
                    ENTERPRISE AI
                  </span>
                </div>
                <div className="text-[11px] text-[#64748B] flex items-center gap-2">
                  <span className="truncate">SAP S/4HANA ERP Connected</span>
                  <span className="text-white/20">•</span>
                  <span className="text-[#10B981] font-mono font-medium">94.2% Auto-Pass</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('dashboard')}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-[#94A3B8] hover:text-white transition-colors border border-white/10"
            >
              <span>Dashboard</span>
              <ArrowUpRight size={13} />
            </button>

            <button
              onClick={handleExportChat}
              title="Export SOX Compliance Transcript"
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-[#94A3B8] hover:text-white transition-colors border border-white/10 flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export Audit Log</span>
            </button>

            <button
              onClick={handleResetChat}
              title="Start New Chat Session"
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-[#94A3B8] hover:text-white transition-colors border border-white/10 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </header>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => {
              const isUser = message.sender === 'user';

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 sm:gap-4 text-left animate-fadeIn ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {/* Assistant Avatar */}
                  {!isUser && (
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#0078D4] to-[#0E3D77] flex items-center justify-center text-white shrink-0 border border-white/15 shadow-[0_0_15px_rgba(0,120,212,0.35)] mt-0.5">
                      <Bot size={18} />
                    </div>
                  )}

                  {/* Message Bubble Container */}
                  <div
                    className={`max-w-[92%] sm:max-w-[85%] space-y-3.5 ${
                      isUser ? 'items-end' : 'items-start'
                    }`}
                  >
                    {/* Text Card */}
                    <div
                      className={`p-4 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md ${
                        isUser
                          ? 'bg-[#0078D4] text-white rounded-tr-xs font-medium'
                          : message.isActionLog
                          ? 'bg-[#121A2B] border border-[#0078D4]/40 text-[#E2E8F0] rounded-tl-xs'
                          : 'bg-[#131724] border border-white/10 text-[#E2E8F0] rounded-tl-xs'
                      }`}
                    >
                      <div className="whitespace-pre-wrap font-sans space-y-2">
                        {message.text.split('\n\n').map((paragraph, pIdx) => {
                          // Check if markdown table
                          if (paragraph.includes('|')) {
                            const lines = paragraph.trim().split('\n');
                            return (
                              <div key={pIdx} className="overflow-x-auto my-3">
                                <table className="w-full text-xs text-left border border-white/10 rounded-lg overflow-hidden">
                                  <tbody>
                                    {lines.map((line, lIdx) => {
                                      if (line.includes('---')) return null;
                                      const cols = line
                                        .split('|')
                                        .filter(Boolean)
                                        .map((c) => c.trim());
                                      const isHead = lIdx === 0;
                                      return (
                                        <tr
                                          key={lIdx}
                                          className={
                                            isHead
                                              ? 'bg-black/40 font-mono font-bold text-white border-b border-white/10'
                                              : 'border-b border-white/5 hover:bg-white/5'
                                          }
                                        >
                                          {cols.map((col, cIdx) => (
                                            <td key={cIdx} className="p-2">
                                              {col}
                                            </td>
                                          ))}
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            );
                          }

                          return <p key={pIdx}>{paragraph}</p>;
                        })}
                      </div>

                      <div
                        className={`text-[10px] font-mono mt-2 pt-2 border-t flex items-center justify-between ${
                          isUser ? 'border-white/20 text-white/70' : 'border-white/5 text-[#64748B]'
                        }`}
                      >
                        <span>{isUser ? 'Auditor J. Morgan' : 'AP Copilot AI'}</span>
                        <span>{message.timestamp}</span>
                      </div>
                    </div>

                    {/* Inline Flagged Invoices (Reusing InvoiceCard, StatusBadge, EvidencePanel) */}
                    {message.invoices && message.invoices.length > 0 && (
                      <div className="space-y-4 pt-1 w-full">
                        <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8] px-1">
                          <span className="flex items-center gap-1.5">
                            <ShieldAlert size={14} className="text-[#EF4444]" />
                            FLAGGED INVOICE DOSSIERS ({message.invoices.length})
                          </span>
                          <span className="text-[11px] text-[#64748B]">
                            SOX Section 404 Strict Audit
                          </span>
                        </div>

                        {message.invoices.map((invoice) => (
                          <InvoiceCard
                            key={invoice.id}
                            invoice={invoice}
                            initiallyExpanded={true}
                            onApprove={handleApproveInvoice}
                            onReject={handleRejectInvoice}
                          />
                        ))}
                      </div>
                    )}

                    {/* Follow-up / Quick Action Chips */}
                    {message.quickActions && message.quickActions.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {message.quickActions.map((action, aIdx) => (
                          <button
                            key={aIdx}
                            onClick={() => executePrompt(action.prompt)}
                            className="px-3 py-1.5 rounded-lg bg-[#141824] hover:bg-[#1C2234] border border-white/10 hover:border-[#0078D4]/50 text-xs text-[#93C5FD] transition-all hover:shadow-[0_0_12px_rgba(0,120,212,0.25)] flex items-center gap-1.5 cursor-pointer text-left"
                          >
                            <span>{action.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#1C2234] border border-white/15 flex items-center justify-center text-xs font-mono font-bold text-[#60A5FA] shrink-0 mt-0.5">
                      JM
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 sm:gap-4 items-center text-left">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#0078D4] to-[#0E3D77] flex items-center justify-center text-white shrink-0 border border-white/15 shadow-[0_0_15px_rgba(0,120,212,0.35)]">
                  <Bot size={18} />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-[#131724] border border-white/10 text-xs text-[#94A3B8] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0078D4] animate-bounce" />
                  <span
                    className="w-2 h-2 rounded-full bg-[#0078D4] animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-[#0078D4] animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  />
                  <span className="text-[11px] font-mono text-[#64748B] ml-1">
                    AP Copilot is auditing ERP vouchers...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 3. INPUT AREA (Sticky at bottom, ChatGPT layout) */}
        <div className="p-3 sm:p-4 bg-[#0B0D14] border-t border-white/10 shrink-0">
          <div className="max-w-4xl mx-auto space-y-2.5">
            {/* Quick Suggestion Chips Carousel */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
              <span className="text-[10px] font-mono text-[#64748B] uppercase shrink-0">
                Suggestions:
              </span>
              <button
                onClick={() => executePrompt('Show all flagged invoices requiring review')}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#94A3B8] hover:text-white shrink-0 transition-colors text-xs"
              >
                🚨 Flagged Invoices
              </button>
              <button
                onClick={() => executePrompt('Check for duplicate invoices & payment risks')}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#94A3B8] hover:text-white shrink-0 transition-colors text-xs"
              >
                🛡️ Duplicate Scan
              </button>
              <button
                onClick={() => executePrompt('Explain variance for Titan Hydraulics PO-2026-9043')}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#94A3B8] hover:text-white shrink-0 transition-colors text-xs"
              >
                📈 Titan PO Variance
              </button>
              <button
                onClick={() => executePrompt('What is our auto-pass rate and SOX compliance status?')}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#94A3B8] hover:text-white shrink-0 transition-colors text-xs"
              >
                📊 94.2% Auto-Pass Stats
              </button>
            </div>

            {/* Input Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                executePrompt(inputPrompt);
              }}
              className="relative flex items-center bg-[#131724] border border-white/15 focus-within:border-[#0078D4] focus-within:ring-2 focus-within:ring-[#0078D4]/30 rounded-2xl shadow-xl transition-all"
            >
              {/* Attachment / Upload Simulator */}
              <button
                type="button"
                onClick={handleSimulateUpload}
                title="Attach Invoice PDF or EDI feed to audit"
                className="p-3 text-[#94A3B8] hover:text-[#60A5FA] transition-colors cursor-pointer"
              >
                <Paperclip size={18} />
              </button>

              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Ask AP Copilot anything (e.g. 'Show flagged invoices', 'Check PO-2026-9043')..."
                className="flex-1 bg-transparent py-3 sm:py-3.5 px-2 text-sm text-white placeholder-[#64748B] focus:outline-none"
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!inputPrompt.trim() || isTyping}
                className="m-2 p-2 sm:p-2.5 rounded-xl bg-[#0078D4] hover:bg-[#1084DE] active:bg-[#0063B1] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(0,120,212,0.4)] cursor-pointer"
                aria-label="Send Message"
              >
                <Send size={16} />
              </button>
            </form>

            <div className="flex items-center justify-between text-[11px] text-[#64748B] px-1">
              <span>Enterprise Conversational AI — Grounded in SAP S/4HANA PO Master & 3-Way Match</span>
              <span className="hidden sm:inline font-mono">SOX 404 Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
