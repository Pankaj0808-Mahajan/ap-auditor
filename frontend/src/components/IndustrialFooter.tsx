/**
 * IndustrialFooter.tsx
 *
 * Minimal Dark Footer:
 * - Microsoft Innovate Hackathon Badge
 * - Team Credits & Engineering Attribution
 * - Tech Stack Icons in Sleek Monochrome with Tooltips
 * - Minimalist Industrial Dark Layout (#08090C / #0E0F14)
 */

import React from 'react';
import { Shield } from 'lucide-react';

export function IndustrialFooter() {
  const techStack = [
    {
      name: 'Microsoft Azure',
      desc: 'Dedicated Private Endpoint & Cloud Compute',
      category: 'Cloud Infrastructure',
      svg: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
          <path d="M13.05 2.25L4.5 16.5h4.95l3.6-6 4.95 6H23l-9.95-16.25zM2.5 18.75l2.25 3h14.5l-2.25-3H2.5z" />
        </svg>
      ),
    },
    {
      name: 'Azure OpenAI',
      desc: 'GPT-4o Vision & Deterministic Validation',
      category: 'AI Engine',
      svg: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
          <path d="M22.28 9.87a5.98 5.98 0 0 0-.52-4.93 6.05 6.05 0 0 0-6.19-2.9 6.01 6.01 0 0 0-4.66-2.04 6.06 6.06 0 0 0-5.75 4.16 6.02 6.02 0 0 0-4.14 3 6.05 6.05 0 0 0 .78 6.84 5.99 5.99 0 0 0 .52 4.93 6.06 6.06 0 0 0 6.2 2.9 6.01 6.01 0 0 0 4.65 2.05 6.06 6.06 0 0 0 5.75-4.16 6.02 6.02 0 0 0 4.14-3 6.05 6.05 0 0 0-.78-6.85zm-8.88 10.97a3.83 3.83 0 0 1-2.42-.87l.12-.07 4.02-2.32a1.08 1.08 0 0 0 .54-.93v-5.69l1.71.99a.08.08 0 0 1 .05.06v4.66a3.85 3.85 0 0 1-4.02 3.87zm-7.66-3.32a3.84 3.84 0 0 1-.46-2.52l.13.08 4.02 2.32c.33.19.74.19 1.07 0l4.93-2.85v1.98a.09.09 0 0 1-.03.07l-4.04 2.33a3.85 3.85 0 0 1-5.62-1.41zm-1.8-8.23a3.84 3.84 0 0 1 1.96-1.65v4.81c0 .38.2.73.53.93l4.93 2.85-1.71.99a.09.09 0 0 1-.08 0l-4.04-2.33a3.85 3.85 0 0 1-1.59-5.6zm13.12 1.84l-4.93-2.85 1.71-.99a.09.09 0 0 1 .08 0l4.04 2.33a3.85 3.85 0 0 1 1.6 5.6 3.84 3.84 0 0 1-1.97 1.65v-4.81a1.08 1.08 0 0 0-.53-.93zm2.25-3.35l-.13-.08-4.02-2.32a1.08 1.08 0 0 0-1.07 0l-4.93 2.85v-1.98a.09.09 0 0 1 .03-.07l4.04-2.33a3.85 3.85 0 0 1 5.62 1.41 3.84 3.84 0 0 1 .46 2.52zm-8.86-5.3a3.83 3.83 0 0 1 2.42.87l-.12.07-4.02 2.32a1.08 1.08 0 0 0-.54.93v5.69l-1.71-.99a.08.08 0 0 1-.05-.06v-4.66a3.85 3.85 0 0 1 4.02-3.87zm-1.34 8.78l2.25-1.3 2.25 1.3v2.6l-2.25 1.3-2.25-1.3v-2.6z" />
        </svg>
      ),
    },
    {
      name: 'React 19',
      desc: 'Concurrent Architecture & Three Fiber Reconciler',
      category: 'Frontend Framework',
      svg: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
          <ellipse cx="12" cy="12" rx="10" ry="4.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" fill="none" stroke="currentColor" strokeWidth="1.6" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" fill="none" stroke="currentColor" strokeWidth="1.6" transform="rotate(120 12 12)" />
          <circle cx="12" cy="12" r="1.8" />
        </svg>
      ),
    },
    {
      name: 'Three.js / WebGL',
      desc: 'CAD Mesh Physics & ACESFilmic Tone Mapping',
      category: '3D Graphics Engine',
      svg: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
          <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13.5h-13L12 6.5z" />
        </svg>
      ),
    },
    {
      name: 'TypeScript',
      desc: 'Type-Safe Deterministic Telemetry Contracts',
      category: 'Language',
      svg: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
          <rect x="2" y="2" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M5 9h6m-3 0v9m5-9h3.5c1.4 0 2.5 1 2.5 2.2 0 1.2-1.1 2.3-2.5 2.3H16v4.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      ),
    },
    {
      name: 'Tailwind CSS',
      desc: 'Dark Industrial Precision Tokens',
      category: 'Styling',
      svg: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
          <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.335 6.182 14.975 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C7.666 17.818 9.027 19.2 12.001 19.2c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.335 13.382 8.975 12 6.001 12z" />
        </svg>
      ),
    },
    {
      name: 'GSAP + Lenis',
      desc: 'ScrollTrigger & Kinetic Motion Mechanics',
      category: 'Animation',
      svg: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
          <path d="M4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0zm8-6a6 6 0 0 1 6 6h-6V6z" />
        </svg>
      ),
    },
    {
      name: 'FastAPI / Python',
      desc: 'High-Throughput Asynchronous Reconciliation Service',
      category: 'Backend Engine',
      svg: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
          <path d="M12 2L4 13h6v9l8-11h-6z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="mt-auto bg-[#08090C] border-t border-white/10 text-xs font-mono text-[#8A8F9E] select-none">
      {/* ── Top Bar: Microsoft Innovate Badge & Tech Stack Icons ── */}
      <div className="border-b border-white/5 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-6">

          {/* Microsoft Innovate Badge */}
          <div className="flex items-center gap-3">
            {/* Microsoft 4-Square Logo in sleek monochrome */}
            <div className="grid grid-cols-2 gap-1 p-2 bg-[#0E1017] border border-white/10 shadow-inner flex-shrink-0">
              <div className="w-2.5 h-2.5 bg-[#8A8F9E] opacity-90" />
              <div className="w-2.5 h-2.5 bg-[#8A8F9E] opacity-75" />
              <div className="w-2.5 h-2.5 bg-[#8A8F9E] opacity-75" />
              <div className="w-2.5 h-2.5 bg-[#8A8F9E] opacity-60" />
            </div>

            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-xs tracking-wider">
                  MICROSOFT INNOVATE
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#0078D4]/20 border border-[#0078D4]/40 text-[#60A5FA]">
                  2026 HACKATHON
                </span>
              </div>
              <div className="text-[10px] text-[#575C6C] mt-0.5">
                ENTERPRISE ACCOUNTS PAYABLE RECONCILIATION // AZURE AI TRACK
              </div>
            </div>
          </div>

          {/* Tech Stack Icons in Monochrome */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[9px] uppercase tracking-widest text-[#575C6C] mr-1 hidden lg:inline-block">
              STACK:
            </span>
            {techStack.map((tech) => (
              <div
                key={tech.name}
                title={`${tech.name} — ${tech.desc} (${tech.category})`}
                className="group relative flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0C0D12] border border-white/10 hover:border-[#0078D4]/60 hover:text-white transition-all cursor-default"
              >
                <span className="text-[#6E7385] group-hover:text-[#0078D4] transition-colors">
                  {tech.svg}
                </span>
                <span className="text-[10px] text-[#7A7F92] group-hover:text-white transition-colors">
                  {tech.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Bar: Team Credits, System Specs, & License ── */}
      <div className="py-4 px-4 sm:px-6 bg-[#06070A]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">

          {/* Team Credits */}
          <div className="flex flex-wrap items-center gap-2 text-left">
            <span className="text-white font-bold tracking-wider">AP-AUDITOR</span>
            <span className="text-[#575C6C]">{'//'}</span>
            <span className="text-[#A2A7B5]">
              ENGINEERED BY <strong className="text-white">ADITYA SINGH</strong> & AP-AUDITOR CORE TEAM
            </span>
            <span className="text-[#575C6C]">|</span>
            <span className="text-[#575C6C] text-[10px]">
              AUTONOMOUS INVOICE PARSING & 3-WAY MATCHING SYSTEM
            </span>
          </div>

          {/* Precision Hardware Standards & Compliance */}
          <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#575C6C]">
            <span className="flex items-center gap-1 text-[#8A8F9E]">
              <Shield size={10} className="text-[#0078D4]" />
              STRICT ZERO RADIUS
            </span>
            <span>•</span>
            <span>MESH PHYSICAL SHADER</span>
            <span>•</span>
            <span>LENIS + GSAP SCROLL</span>
            <span>•</span>
            <span className="text-[#8A8F9E] border border-white/10 px-1.5 py-0.2 bg-white/5">
              BUILD v1.0.6-PROD
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
