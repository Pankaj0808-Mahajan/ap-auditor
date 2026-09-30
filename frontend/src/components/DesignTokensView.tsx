import React, { useState } from 'react';
import { AcrylicPanel } from './AcrylicPanel';
import { Copy, Check, Terminal } from 'lucide-react';

export const DesignTokensView: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const tokens = [
    {
      name: 'Background Base',
      hex: '#0A0A0C',
      cssVar: '--bg-industrial',
      desc: 'Obsidian void slate matte base. Deepest visual layer.',
      category: 'surface',
      sampleBg: '#0A0A0C',
      textColor: '#FFFFFF',
    },
    {
      name: 'Primary Accent',
      hex: '#0078D4',
      cssVar: '--accent',
      desc: 'Precision industrial cyan-blue for telemetry & actions.',
      category: 'brand',
      sampleBg: '#0078D4',
      textColor: '#FFFFFF',
    },
    {
      name: 'Hazard / Warning',
      hex: '#FFB900',
      cssVar: '--warning',
      desc: 'High-contrast caution amber for non-nominal alerts.',
      category: 'alert',
      sampleBg: '#FFB900',
      textColor: '#0A0A0C',
    },
    {
      name: 'Critical / Error',
      hex: '#D13438',
      cssVar: '--error',
      desc: 'Emergency shutdown & critical audit variance fault red.',
      category: 'alert',
      sampleBg: '#D13438',
      textColor: '#FFFFFF',
    },
    {
      name: 'System Nominal',
      hex: '#107C41',
      cssVar: '--nominal',
      desc: 'Steady-state operational verification green.',
      category: 'status',
      sampleBg: '#107C41',
      textColor: '#FFFFFF',
    },
    {
      name: 'Acrylic Glass Surface',
      hex: 'rgba(14, 15, 20, 0.75)',
      cssVar: 'backdrop-blur(18px)',
      desc: 'Frosted smoked glass panel with specular top hairline.',
      category: 'material',
      sampleBg: 'rgba(14, 15, 20, 0.9)',
      textColor: '#FFFFFF',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Directive Banner */}
      <div className="p-4 bg-[#0B1524]/60 border border-[#0078D4]/40 flex items-start gap-3 text-left">
        <Terminal size={18} className="text-[#0078D4] shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-mono font-bold text-white tracking-wider">
            DESIGN DIRECTIVE: DARK INDUSTRIAL SPECIFICATION
          </div>
          <div className="text-[#8A8F9E]">
            Enforced geometry rule: <span className="text-[#0078D4] font-mono font-semibold">ZERO BORDER RADIUS (`border-radius: 0px !important`)</span>.
            No organic curves, rounded blobs, or pill capsules. Sharp rectangular chamfers, precision hairlines, and frosted acrylic glass.
          </div>
        </div>
      </div>

      {/* Color Tokens Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tokens.map((token) => (
          <div
            key={token.name}
            className="border border-white/10 bg-[#0E0F14]/80 backdrop-blur-md p-4 flex flex-col justify-between text-left relative group hover:border-white/20 transition-all"
            style={{ borderRadius: 0 }}
          >
            <div>
              {/* Color Swatch */}
              <div
                className="w-full h-16 border border-white/15 flex items-center justify-between px-3 mb-3"
                style={{ backgroundColor: token.sampleBg, color: token.textColor, borderRadius: 0 }}
              >
                <span className="font-mono text-xs font-bold uppercase">{token.hex}</span>
                <span className="text-[10px] font-mono opacity-80 uppercase">{token.category}</span>
              </div>

              <div className="font-bold text-sm text-white tracking-wide">{token.name}</div>
              <div className="font-mono text-[11px] text-[#0078D4] mt-0.5">{token.cssVar}</div>
              <div className="text-xs text-[#8A8F9E] mt-2 leading-relaxed">{token.desc}</div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#575C6C]">CLICK TO COPY</span>
              <button
                onClick={() => copyToClipboard(token.hex, token.name)}
                className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-mono border border-white/10 hover:border-[#0078D4] hover:bg-[#0078D4]/10 text-[#A2A7B5] hover:text-white transition-all"
                style={{ borderRadius: 0 }}
              >
                {copiedKey === token.name ? (
                  <>
                    <Check size={12} className="text-[#00CC6A]" />
                    <span className="text-[#00CC6A]">COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>COPY HEX</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Typography & Rules Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
        <AcrylicPanel header="TYPOGRAPHY SYSTEM" technicalId="FONT-SYS" showBrackets>
          <div className="space-y-4 text-xs font-mono">
            <div className="p-3 bg-[#0A0A0C] border border-white/5 space-y-1">
              <div className="text-[#8A8F9E] text-[10px]">PRIMARY UI FONT (Inter / Segoe UI)</div>
              <div className="font-sans text-base font-semibold text-white">
                The quick brown fox jumps over the lazy dog. 0123456789
              </div>
              <div className="text-[10px] text-[#575C6C]">font-family: 'Inter', 'Segoe UI', sans-serif</div>
            </div>

            <div className="p-3 bg-[#0A0A0C] border border-white/5 space-y-1">
              <div className="text-[#8A8F9E] text-[10px]">TELEMETRY & MONO FONT (JetBrains Mono / Consolas)</div>
              <div className="font-mono text-sm text-[#0078D4]">
                SYS_CLK: 14:28:90.412 | LATENCY: 0.12ms | CHECKSUM: 0x88F0
              </div>
              <div className="text-[10px] text-[#575C6C]">font-family: 'JetBrains Mono', 'Consolas', monospace</div>
            </div>
          </div>
        </AcrylicPanel>

        <AcrylicPanel header="CHAMFER CUTOUT RULES" technicalId="GEOM-01" showBrackets>
          <div className="space-y-3 text-xs">
            <div className="text-[#8A8F9E] leading-relaxed">
              Standard 45-degree angle cuts for sci-fi industrial avionics and CAD panels:
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              <div className="p-3 bg-[#161821] border border-white/10 cut-corner-tl flex flex-col items-center justify-center h-20">
                <span className="font-mono text-[10px] text-white">cut-corner-tl</span>
                <span className="text-[9px] text-[#8A8F9E]">Top-Left 45°</span>
              </div>
              <div className="p-3 bg-[#161821] border border-white/10 cut-corner-br flex flex-col items-center justify-center h-20">
                <span className="font-mono text-[10px] text-white">cut-corner-br</span>
                <span className="text-[9px] text-[#8A8F9E]">Bottom-Right 45°</span>
              </div>
              <div className="p-3 bg-[#161821] border border-white/10 cut-corners-diagonal flex flex-col items-center justify-center h-20">
                <span className="font-mono text-[10px] text-white">cut-diagonal</span>
                <span className="text-[9px] text-[#8A8F9E]">Dual Diagonal</span>
              </div>
            </div>
          </div>
        </AcrylicPanel>
      </div>
    </div>
  );
};
