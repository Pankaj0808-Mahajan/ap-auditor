import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, UploadCloud, Play } from 'lucide-react';

interface GetStartedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchDemo: () => void;
}

export const GetStartedModal: React.FC<GetStartedModalProps> = ({
  isOpen,
  onClose,
  onLaunchDemo,
}) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0F1219] border border-white/15 p-5 sm:p-8 shadow-2xl text-left space-y-5 sm:space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-[#94A3B8] hover:text-white rounded-lg hover:bg-white/5 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="space-y-2">
          <div className="w-10 h-10 rounded-lg bg-[#0078D4]/15 border border-[#0078D4]/40 flex items-center justify-center text-[#0078D4]">
            <ShieldCheck size={22} />
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            Deploy AP Auditor
          </h3>
          <p className="text-sm text-[#94A3B8] leading-relaxed">
            Eliminate manual invoice processing and eradicate duplicate payments across your ERP.
          </p>
        </div>

        {/* 2-Option Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div
            onClick={() => {
              onClose();
              onLaunchDemo();
            }}
            className="p-4 rounded-xl bg-[#141824] hover:bg-[#1A2030] border border-[#0078D4]/40 cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between text-[#0078D4]">
              <Play size={18} />
              <span className="text-[10px] font-mono font-semibold bg-[#0078D4]/20 px-1.5 py-0.5 rounded">
                INSTANT
              </span>
            </div>
            <div className="text-sm font-bold text-white group-hover:text-[#60A5FA]">
              Interactive Queue Demo
            </div>
            <p className="text-xs text-[#8A94A8]">
              Experience how exception routing works with live mock invoices.
            </p>
          </div>

          <div
            onClick={() => alert('Connect your SAP / NetSuite / Coupa ERP instance via Azure Key Vault.')}
            className="p-4 rounded-xl bg-[#141824] hover:bg-[#1A2030] border border-white/10 hover:border-white/20 cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between text-[#94A3B8]">
              <UploadCloud size={18} />
              <span className="text-[10px] font-mono text-[#64748B]">ERP API</span>
            </div>
            <div className="text-sm font-bold text-white group-hover:text-white">
              Connect ERP Sandbox
            </div>
            <p className="text-xs text-[#8A94A8]">
              Connect SAP, Oracle, NetSuite, or Workday in under 15 minutes.
            </p>
          </div>
        </div>

        {/* Work Email Sign-up form */}
        {submitted ? (
          <div className="p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-xs text-[#10B981] flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>Pilot invite sent! Our enterprise team will reach out within 2 hours.</span>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email) setSubmitted(true);
            }}
            className="space-y-3 pt-2"
          >
            <label className="block text-xs font-medium text-[#94A3B8]">
              Or request an Enterprise Pilot
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-lg bg-[#0A0D14] border border-white/10 text-white text-sm placeholder-[#64748B] focus:outline-none focus:border-[#0078D4]"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-[#0078D4] hover:bg-[#1084DE] text-white font-medium text-sm transition-colors shrink-0"
              >
                Request
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
