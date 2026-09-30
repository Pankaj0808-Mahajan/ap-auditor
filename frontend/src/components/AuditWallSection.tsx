/**
 * AuditWallSection.tsx — Section 5: "The Audit Wall"
 *
 * "Build a wall of stacked panel rows, each row gets a stamp-punch animation
 * with timestamp on scroll, representing an audit log."
 *
 * Key features:
 * - Stacked industrial acrylic & metallic panel rows representing AP audit records.
 * - On scroll (or auto-punch sequence), as each row reaches the stamp line,
 *   a high-impact mechanical STAMP-PUNCH animation slams down onto the row:
 *     - Emerald Green `#107C41` for "AUDITED: PASSED" (3-Way Matched)
 *     - Amber `#FFB900` for "TOLERANCE FLAGGED" (Variance Review)
 *     - Crimson `#D13438` for "COMPLIANCE REJECT" (Duplicate / Fraud)
 * - Exact precision timestamp stamped with millisecond precision and hash signature.
 * - Tactile mechanical shockwave ring and row impact dip.
 * - Optional synthesized mechanical solenoid audio thud via Web Audio API.
 * - Auto-punch sequence mode, speed toggles, filters, and row telemetry inspector.
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Search,
  Hash,
  Sparkles,
} from 'lucide-react';

// ─── Record Data Structure ───────────────────────────────────────────────────
export interface AuditWallRecord {
  id: string;
  invoiceNo: string;
  poNumber: string;
  grnNumber: string;
  vendor: string;
  amount: string;
  variance: string;
  category: 'nominal' | 'warning' | 'critical';
  confidence: number;
  gstin: string;
  hash: string;
  matchType: string;
  flagReason?: string;
}

const AUDIT_WALL_RECORDS: AuditWallRecord[] = [
  {
    id: 'AUD-88219',
    invoiceNo: 'INV-2026-081',
    poNumber: 'PO-2026-9041',
    grnNumber: 'GRN-44101',
    vendor: 'SIEMENS HEAVY TURBINES LTD',
    amount: '$142,500.00',
    variance: '0.00%',
    category: 'nominal',
    confidence: 99.8,
    gstin: '27AAACS1234F1Z8',
    hash: 'e3b0c44298fc1c149afbf4c8996fb924',
    matchType: 'PO ↔ GRN ↔ INV EXACT MATCH',
  },
  {
    id: 'AUD-88220',
    invoiceNo: 'INV-2026-082',
    poNumber: 'PO-2026-9042',
    grnNumber: 'GRN-44102',
    vendor: 'KYOCERA INDUSTRIAL SENSORS',
    amount: '$38,910.50',
    variance: '+4.20%',
    category: 'warning',
    confidence: 84.1,
    gstin: '29AAACK5678G2Z3',
    hash: '8f434346648f6b96df89dda901c5176b',
    matchType: 'UNIT PRICE VARIANCE (+4.2%)',
    flagReason: 'Shipping surcharges not present on original purchase order.',
  },
  {
    id: 'AUD-88221',
    invoiceNo: 'INV-2026-083',
    poNumber: 'PO-2026-9043',
    grnNumber: 'GRN-44103',
    vendor: 'TITAN HYDRAULICS FABRICATION',
    amount: '$219,840.00',
    variance: '+18.75%',
    category: 'critical',
    confidence: 42.6,
    gstin: '07AAACT9012H1Z5',
    hash: '5d41402abc4b2a76b9719d911017c592',
    matchType: 'POTENTIAL DUPLICATE BILLING',
    flagReason: 'Fuzzy match 99.2% with previous settlement INV-2026-049.',
  },
  {
    id: 'AUD-88222',
    invoiceNo: 'INV-2026-084',
    poNumber: 'PO-2026-9044',
    grnNumber: 'GRN-44104',
    vendor: 'MITSUBISHI POWER AUTOMATION',
    amount: '$64,120.00',
    variance: '0.00%',
    category: 'nominal',
    confidence: 98.9,
    gstin: '33AAACM3456J1Z1',
    hash: '7d793037a0760186574b0282f2f435e7',
    matchType: 'PO ↔ GRN ↔ INV EXACT MATCH',
  },
  {
    id: 'AUD-88223',
    invoiceNo: 'INV-2026-085',
    poNumber: 'PO-2026-9045',
    grnNumber: 'GRN-44105',
    vendor: 'ABB HIGH-VOLTAGE SWITCHGEAR',
    amount: '$88,400.00',
    variance: '-2.10%',
    category: 'warning',
    confidence: 89.2,
    gstin: '24AAACA7890K1Z9',
    hash: '098f6bcd4621d373cade4e832627b4f6',
    matchType: 'EARLY PAYMENT DISCOUNT APPLIED',
    flagReason: 'Vendor deducted 2.1% net-10 discount prior to authorization.',
  },
  {
    id: 'AUD-88224',
    invoiceNo: 'INV-2026-086',
    poNumber: 'PO-2026-9046',
    grnNumber: 'GRN-44106',
    vendor: 'HONEYWELL PROCESS AUTOMATION',
    amount: '$12,450.00',
    variance: '0.00%',
    category: 'nominal',
    confidence: 99.5,
    gstin: '06AAACH1234L1Z7',
    hash: 'ad0234829205b9033196ba818f7a872b',
    matchType: 'PO ↔ GRN ↔ INV EXACT MATCH',
  },
  {
    id: 'AUD-88225',
    invoiceNo: 'INV-2026-087',
    poNumber: 'PO-2026-9047',
    grnNumber: 'GRN-44107',
    vendor: 'SCHNEIDER INDUSTRIAL ELECTRIC',
    amount: '$312,900.00',
    variance: '0.00%',
    category: 'nominal',
    confidence: 99.1,
    gstin: '27AAACS4321M1Z2',
    hash: '1f3870be274f6c49b3e31a0c6728957f',
    matchType: 'PO ↔ GRN ↔ INV EXACT MATCH',
  },
  {
    id: 'AUD-88226',
    invoiceNo: 'INV-2026-088',
    poNumber: 'PO-2026-9048',
    grnNumber: 'GRN-44108',
    vendor: 'EMERSON CONTROL VALVES LLC',
    amount: '$45,780.00',
    variance: '+1.80%',
    category: 'warning',
    confidence: 86.4,
    gstin: '19AAACE8765N1Z4',
    hash: 'd3b07384d113edec49eaa6238ad5ff00',
    matchType: 'FREIGHT TOLERANCE THRESHOLD',
    flagReason: 'Expedited transport differential exceeds standard tier.',
  },
  {
    id: 'AUD-88227',
    invoiceNo: 'INV-2026-089',
    poNumber: 'PO-2026-9049',
    grnNumber: 'GRN-44109',
    vendor: 'YASKAWA ROBOTICS GLOBAL',
    amount: '$178,200.00',
    variance: '0.00%',
    category: 'nominal',
    confidence: 99.4,
    gstin: '29AAACY9876P1Z6',
    hash: '2c6a465997283d9636077172d2f4ea4b',
    matchType: 'PO ↔ GRN ↔ INV EXACT MATCH',
  },
  {
    id: 'AUD-88228',
    invoiceNo: 'INV-2026-090',
    poNumber: 'PO-2026-9050',
    grnNumber: 'GRN-44110',
    vendor: 'ROCKWELL AUTOMATION INC',
    amount: '$95,600.00',
    variance: '+22.40%',
    category: 'critical',
    confidence: 38.7,
    gstin: '07AAACR5432Q1Z8',
    hash: '6ac7b3b3445b69489d6042d0a58d37c4',
    matchType: 'UNMATCHED LINE ITEMS // MISMATCH',
    flagReason: '3 auxiliary servo controllers billed without receiving receipt.',
  },
  {
    id: 'AUD-88229',
    invoiceNo: 'INV-2026-091',
    poNumber: 'PO-2026-9051',
    grnNumber: 'GRN-44111',
    vendor: 'FESTO PNEUMATICS SE',
    amount: '$19,400.00',
    variance: '0.00%',
    category: 'nominal',
    confidence: 99.7,
    gstin: '27AAACF6543R1Z0',
    hash: 'b10a8db164e0754105b7a99be72e3fe5',
    matchType: 'PO ↔ GRN ↔ INV EXACT MATCH',
  },
  {
    id: 'AUD-88230',
    invoiceNo: 'INV-2026-092',
    poNumber: 'PO-2026-9052',
    grnNumber: 'GRN-44112',
    vendor: 'PARKER HANNIFIN MOTION',
    amount: '$53,100.00',
    variance: '0.00%',
    category: 'nominal',
    confidence: 98.8,
    gstin: '33AAACP2109S1Z2',
    hash: 'c4ca4238a0b923820dcc509a6f75849b',
    matchType: 'PO ↔ GRN ↔ INV EXACT MATCH',
  },
  {
    id: 'AUD-88231',
    invoiceNo: 'INV-2026-093',
    poNumber: 'PO-2026-9053',
    grnNumber: 'GRN-44113',
    vendor: 'FANUC CNC SYSTEMS LTD',
    amount: '$420,000.00',
    variance: '0.00%',
    category: 'nominal',
    confidence: 99.9,
    gstin: '24AAACF1098T1Z4',
    hash: 'eccbc87e4b5ce2fe28308fd9f2a7baf3',
    matchType: 'CAPITAL ASSET 3-WAY MATCH',
  },
  {
    id: 'AUD-88232',
    invoiceNo: 'INV-2026-094',
    poNumber: 'PO-2026-9054',
    grnNumber: 'GRN-44114',
    vendor: 'DANFOSS DRIVES & INVERTERS',
    amount: '$67,850.00',
    variance: '+3.10%',
    category: 'warning',
    confidence: 85.3,
    gstin: '06AAACD8765U1Z6',
    hash: 'a87ff679a2f3e71d9181a67b7542122c',
    matchType: 'TARIFF REVISION OVERAGE',
    flagReason: 'Import tariff charge adjustment pending buyer sign-off.',
  },
  {
    id: 'AUD-88233',
    invoiceNo: 'INV-2026-095',
    poNumber: 'PO-2026-9055',
    grnNumber: 'GRN-44115',
    vendor: 'BOSCH REXROTH LINEAR',
    amount: '$114,300.00',
    variance: '0.00%',
    category: 'nominal',
    confidence: 99.2,
    gstin: '27AAACB5432V1Z8',
    hash: 'e4da3b7fbbce2345d7772b0674a318d5',
    matchType: 'PO ↔ GRN ↔ INV EXACT MATCH',
  },
  {
    id: 'AUD-88234',
    invoiceNo: 'INV-2026-096',
    poNumber: 'PO-2026-9056',
    grnNumber: 'GRN-44116',
    vendor: 'WIKA INSTRUMENTATION LP',
    amount: '$8,920.00',
    variance: '+45.00%',
    category: 'critical',
    confidence: 29.5,
    gstin: '29AAACW9999W1Z0',
    hash: '1679091c5a880faf6fb5e6087eb1b2dc',
    matchType: 'GSTIN CHECKSUM INVALID',
    flagReason: 'Tax identifier failed Modulo-36 checksum validation.',
  },
  {
    id: 'AUD-88235',
    invoiceNo: 'INV-2026-097',
    poNumber: 'PO-2026-9057',
    grnNumber: 'GRN-44117',
    vendor: 'SICK OPTICAL SENSORS AG',
    amount: '$27,400.00',
    variance: '0.00%',
    category: 'nominal',
    confidence: 99.3,
    gstin: '07AAACS1122X1Z2',
    hash: '8f14e45fceea167a5a36dedd4bea2543',
    matchType: 'PO ↔ GRN ↔ INV EXACT MATCH',
  },
  {
    id: 'AUD-88236',
    invoiceNo: 'INV-2026-098',
    poNumber: 'PO-2026-9058',
    grnNumber: 'GRN-44118',
    vendor: 'ENDRESS+HAUSER FLOWMETERS',
    amount: '$83,600.00',
    variance: '0.00%',
    category: 'nominal',
    confidence: 99.6,
    gstin: '24AAACE3344Y1Z4',
    hash: 'c9f0f895fb98ab9159f51fd0297e236d',
    matchType: 'PO ↔ GRN ↔ INV EXACT MATCH',
  },
];

// ─── Synthesized Mechanical Stamp Solenoid Sound ─────────────────────────────
class AudioFeedbackEngine {
  private ctx: AudioContext | null = null;

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  playStampThud(category: 'nominal' | 'warning' | 'critical') {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;

      // Primary heavy punch oscillator (low impact frequency drop)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const baseFreq = category === 'critical' ? 95 : category === 'warning' ? 120 : 150;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.08);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);

      // Metallic click on contact
      const click = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      click.type = 'square';
      click.frequency.setValueAtTime(800, now);
      click.frequency.exponentialRampToValueAtTime(120, now + 0.02);

      clickGain.gain.setValueAtTime(0.12, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      click.connect(clickGain);
      clickGain.connect(this.ctx.destination);

      click.start(now);
      click.stop(now + 0.03);
    } catch {
      // AudioContext unavailable or blocked by autoplay
    }
  }
}

const audioEngine = new AudioFeedbackEngine();

// ─── Format Timestamp Helper ────────────────────────────────────────────────
function generateStampTimestamp(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  const h = String(now.getUTCHours()).padStart(2, '0');
  const min = String(now.getUTCMinutes()).padStart(2, '0');
  const s = String(now.getUTCSeconds()).padStart(2, '0');
  const ms = String(now.getUTCMilliseconds()).padStart(3, '0');
  return `${y}-${m}-${d} ${h}:${min}:${s}.${ms} UTC`;
}

// ─── Individual Stamp Mark Component ─────────────────────────────────────────
interface StampMarkProps {
  category: 'nominal' | 'warning' | 'critical';
  timestamp: string;
  hash: string;
}

function StampMark({ category, timestamp, hash }: StampMarkProps) {
  const config = {
    nominal: {
      color: '#107C41',
      bg: 'rgba(16, 124, 65, 0.18)',
      border: '#107C41',
      title: 'AUDITED: PASSED',
      subtitle: '3-WAY MATCH VERIFIED',
      icon: CheckCircle2,
      seal: 'VERIFIED',
    },
    warning: {
      color: '#FFB900',
      bg: 'rgba(255, 185, 0, 0.18)',
      border: '#FFB900',
      title: 'TOLERANCE FLAGGED',
      subtitle: 'VARIANCE ESCALATED',
      icon: AlertTriangle,
      seal: 'REVIEW',
    },
    critical: {
      color: '#D13438',
      bg: 'rgba(209, 52, 56, 0.18)',
      border: '#D13438',
      title: 'COMPLIANCE REJECT',
      subtitle: 'QUARANTINE LOCKED',
      icon: XCircle,
      seal: 'REJECTED',
    },
  }[category];

  const Icon = config.icon;

  return (
    <div
      className="relative animate-stamp-punch pointer-events-none select-none"
      style={{
        transformOrigin: 'center center',
      }}
    >
      {/* Shockwave expanding ring */}
      <div
        className="absolute inset-0 border-2 animate-shockwave pointer-events-none"
        style={{ borderColor: config.color }}
      />

      {/* Rubber / Laser Stamp Box Frame */}
      <div
        className="relative px-3.5 py-2 border-[2.5px] shadow-lg flex items-center gap-3 backdrop-blur-sm"
        style={{
          borderColor: config.color,
          backgroundColor: config.bg,
          boxShadow: `0 0 18px ${config.color}35`,
          transform: 'rotate(-1.2deg)',
        }}
      >
        {/* Stamp Icon Badge */}
        <div
          className="p-1 border flex items-center justify-center flex-shrink-0"
          style={{ borderColor: config.color, color: config.color }}
        >
          <Icon size={18} strokeWidth={2.4} />
        </div>

        {/* Text & Stencil Metadata */}
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span
              className="font-mono text-[11px] font-black uppercase tracking-wider leading-none"
              style={{ color: config.color }}
            >
              [ {config.title} ]
            </span>
            <span
              className="font-mono text-[8px] px-1 py-0.2 border uppercase font-bold"
              style={{
                color: config.color,
                borderColor: `${config.color}60`,
                background: `${config.color}15`,
              }}
            >
              {config.seal}
            </span>
          </div>

          {/* Subtitle / Match Reason */}
          <div className="font-mono text-[9px] text-[#A2A7B5] tracking-wide mt-0.5">
            {config.subtitle}
          </div>

          {/* Punch Timestamp & Hash Proof */}
          <div className="flex items-center gap-2 font-mono text-[8px] text-[#8A8F9E] mt-1 border-t border-white/10 pt-1">
            <span className="flex items-center gap-1 text-white/90">
              <Clock size={8} className="text-[#0078D4]" />
              {timestamp}
            </span>
            <span>•</span>
            <span className="truncate max-w-[110px]" title={hash}>
              SHA:{hash.slice(0, 8)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Stacked Panel Row Component ─────────────────────────────────────────────
interface PanelRowProps {
  record: AuditWallRecord;
  index: number;
  isStamped: boolean;
  timestamp: string;
  onIntersect: (id: string) => void;
  onSelect: (record: AuditWallRecord) => void;
}

function PanelRow({
  record,
  index,
  isStamped,
  timestamp,
  onIntersect,
  onSelect,
}: PanelRowProps) {
  const rowRef = useRef<HTMLDivElement>(null!);

  // IntersectionObserver for scroll triggering
  useEffect(() => {
    const el = rowRef.current;
    if (!el || isStamped) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isStamped) {
            onIntersect(record.id);
          }
        });
      },
      {
        threshold: 0.45,
        rootMargin: '0px 0px -15% 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isStamped, record.id, onIntersect]);

  const categoryColor = {
    nominal: '#107C41',
    warning: '#FFB900',
    critical: '#D13438',
  }[record.category];

  return (
    <div
      ref={rowRef}
      onClick={() => onSelect(record)}
      className={`group relative flex flex-wrap md:flex-nowrap items-center justify-between gap-4 p-4 border transition-all duration-200 cursor-pointer ${
        isStamped ? 'animate-impact-dip' : ''
      }`}
      style={{
        backgroundColor: isStamped ? '#0E1017' : '#090A0D',
        borderColor: isStamped ? `${categoryColor}40` : 'rgba(255, 255, 255, 0.08)',
        boxShadow: isStamped ? `0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)` : 'none',
      }}
    >
      {/* Left indicator accent strip */}
      <div
        className="absolute top-0 bottom-0 left-0 w-1 transition-colors duration-300"
        style={{
          background: isStamped ? categoryColor : 'rgba(255, 255, 255, 0.1)',
          boxShadow: isStamped ? `0 0 10px ${categoryColor}` : 'none',
        }}
      />

      {/* ── Left Column: Index & Primary Telemetry ── */}
      <div className="flex items-start gap-4 min-w-[280px] lg:min-w-[340px]">
        {/* Sequence Badge */}
        <div className="flex flex-col items-center">
          <span className="font-mono text-[9px] text-[#575C6C] font-bold">
            [{String(index + 1).padStart(3, '0')}]
          </span>
          <div
            className="w-2 h-2 mt-1.5 transition-colors"
            style={{
              background: isStamped ? categoryColor : '#2A2D3A',
              boxShadow: isStamped ? `0 0 8px ${categoryColor}` : 'none',
            }}
          />
        </div>

        {/* Invoice & Vendor Details */}
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-white tracking-wide">
              {record.vendor}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-[#8A8F9E]">
            <span className="text-[#0078D4] font-semibold">{record.invoiceNo}</span>
            <span>•</span>
            <span>{record.poNumber}</span>
            <span>•</span>
            <span>{record.grnNumber}</span>
          </div>

          {/* Verification Checksums & GSTIN */}
          <div className="flex items-center gap-2 font-mono text-[9px] text-[#575C6C]">
            <span className="flex items-center gap-1">
              <Hash size={9} />
              {record.gstin}
            </span>
            <span>|</span>
            <span>CONF: {record.confidence}%</span>
          </div>
        </div>
      </div>

      {/* ── Center Column: Billed Amount & Variance ── */}
      <div className="flex items-center gap-6 font-mono text-right flex-shrink-0">
        <div>
          <div className="text-[9px] text-[#575C6C] uppercase tracking-wider">BILLED TOTAL</div>
          <div className="text-sm font-bold text-white">{record.amount}</div>
        </div>

        <div className="w-24 text-right">
          <div className="text-[9px] text-[#575C6C] uppercase tracking-wider">VARIANCE</div>
          <div
            className="text-xs font-bold px-1.5 py-0.5 inline-block border mt-0.5"
            style={{
              color: categoryColor,
              borderColor: `${categoryColor}40`,
              background: `${categoryColor}10`,
            }}
          >
            {record.variance}
          </div>
        </div>
      </div>

      {/* ── Right Column: Mechanical Stamp Zone ── */}
      <div className="w-full md:w-auto min-w-[320px] flex items-center justify-end">
        {isStamped ? (
          <StampMark
            category={record.category}
            timestamp={timestamp}
            hash={record.hash}
          />
        ) : (
          /* Un-stamped state placeholder */
          <div className="w-full md:w-[320px] h-[58px] border border-dashed border-white/10 bg-white/[0.015] flex items-center justify-center gap-2 font-mono text-[9px] text-[#424654] uppercase tracking-widest select-none">
            <span className="w-1.5 h-1.5 bg-[#0078D4]/40 animate-ping" />
            <span>[ AWAITING STAMP PUNCH ]</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Section Component ──────────────────────────────────────────────────
export function AuditWallSection() {
  const [stampedMap, setStampedMap] = useState<Record<string, string>>({});
  const [filter, setFilter]         = useState<'all' | 'nominal' | 'warning' | 'critical'>('all');
  const [search, setSearch]         = useState('');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isAutoPunching, setIsAutoPunching] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AuditWallRecord | null>(null);

  const autoPunchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wallContainerRef  = useRef<HTMLDivElement>(null!);

  // Trigger stamp on a specific record
  const handleStampRecord = useCallback((id: string) => {
    setStampedMap((prev) => {
      if (prev[id]) return prev; // Already stamped
      const ts = generateStampTimestamp();

      const rec = AUDIT_WALL_RECORDS.find(r => r.id === id);
      if (rec && isAudioEnabled) {
        audioEngine.playStampThud(rec.category);
      }

      return {
        ...prev,
        [id]: ts,
      };
    });
  }, [isAudioEnabled]);

  // Reset all stamps
  const handleResetStamps = () => {
    setIsAutoPunching(false);
    if (autoPunchTimerRef.current) clearInterval(autoPunchTimerRef.current);
    setStampedMap({});
    if (wallContainerRef.current) {
      wallContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Auto-punch sequence automation
  const handleToggleAutoPunch = () => {
    if (isAutoPunching) {
      setIsAutoPunching(false);
      if (autoPunchTimerRef.current) clearInterval(autoPunchTimerRef.current);
    } else {
      setIsAutoPunching(true);
      let nextIdx = 0;

      // Find first unstamped record
      for (let i = 0; i < AUDIT_WALL_RECORDS.length; i++) {
        if (!stampedMap[AUDIT_WALL_RECORDS[i].id]) {
          nextIdx = i;
          break;
        }
      }

      autoPunchTimerRef.current = setInterval(() => {
        if (nextIdx >= AUDIT_WALL_RECORDS.length) {
          setIsAutoPunching(false);
          if (autoPunchTimerRef.current) clearInterval(autoPunchTimerRef.current);
          return;
        }

        const target = AUDIT_WALL_RECORDS[nextIdx];
        handleStampRecord(target.id);
        nextIdx++;
      }, 420);
    }
  };

  useEffect(() => {
    return () => {
      if (autoPunchTimerRef.current) clearInterval(autoPunchTimerRef.current);
    };
  }, []);

  // Filtered record list
  const filteredRecords = useMemo(() => {
    return AUDIT_WALL_RECORDS.filter((rec) => {
      const matchFilter = filter === 'all' || rec.category === filter;
      const matchSearch =
        search === '' ||
        rec.vendor.toLowerCase().includes(search.toLowerCase()) ||
        rec.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
        rec.poNumber.toLowerCase().includes(search.toLowerCase()) ||
        rec.id.toLowerCase().includes(search.toLowerCase());

      return matchFilter && matchSearch;
    });
  }, [filter, search]);

  // Metrics summary
  const stampedCount = Object.keys(stampedMap).length;
  const nominalStamped = AUDIT_WALL_RECORDS.filter(r => stampedMap[r.id] && r.category === 'nominal').length;
  const warningStamped = AUDIT_WALL_RECORDS.filter(r => stampedMap[r.id] && r.category === 'warning').length;
  const criticalStamped = AUDIT_WALL_RECORDS.filter(r => stampedMap[r.id] && r.category === 'critical').length;

  return (
    <section
      className="relative flex flex-col bg-[#0A0A0C] min-h-screen text-[#E6E8EE]"
      aria-label="The Audit Wall — Stamped panel rows audit log"
    >
      {/* ── Background Blueprint Grid & Noise ── */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,120,212,0.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,120,212,0.6) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* ── Header Command Strip ── */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-4 px-5 py-3 border-b border-white/10 bg-[#0E0F14]/90 backdrop-blur-xl">
        {/* Title & Section Tag */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-[#0078D4]/20 border border-[#0078D4] text-[#0078D4]">
            <ShieldCheck size={18} />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest">
              <span className="text-[#0078D4] font-bold">[SEC-05]</span>
              <span className="text-white font-bold">THE AUDIT WALL</span>
              <span className="text-[#575C6C]">{'//'}</span>
              <span className="text-[#8A8F9E]">STAMP-PUNCH AUDIT LOG</span>
            </div>
            <div className="text-[10px] font-mono text-[#8A8F9E]">
              Scroll down to slam mechanical certification stamps onto invoice rows.
            </div>
          </div>
        </div>

        {/* Real-time Counters */}
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <div className="px-2.5 py-1 bg-[#107C41]/10 border border-[#107C41]/40 flex items-center gap-1.5">
            <CheckCircle2 size={11} className="text-[#107C41]" />
            <span className="text-[#107C41] font-bold">PASSED: {nominalStamped}</span>
          </div>

          <div className="px-2.5 py-1 bg-[#FFB900]/10 border border-[#FFB900]/40 flex items-center gap-1.5">
            <AlertTriangle size={11} className="text-[#FFB900]" />
            <span className="text-[#FFB900] font-bold">FLAGGED: {warningStamped}</span>
          </div>

          <div className="px-2.5 py-1 bg-[#D13438]/10 border border-[#D13438]/40 flex items-center gap-1.5">
            <XCircle size={11} className="text-[#D13438]" />
            <span className="text-[#D13438] font-bold">REJECTED: {criticalStamped}</span>
          </div>

          <div className="px-3 py-1 bg-white/5 border border-white/10 font-bold text-white">
            STAMPED: {stampedCount} / {AUDIT_WALL_RECORDS.length}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Auto-Punch Simulator */}
          <button
            onClick={handleToggleAutoPunch}
            className={`flex items-center gap-1.5 px-3 py-1 font-mono text-[10px] font-bold border transition-colors uppercase tracking-wider ${
              isAutoPunching
                ? 'bg-[#0078D4] text-white border-[#0078D4]'
                : 'bg-white/5 text-[#E6E8EE] border-white/15 hover:border-[#0078D4] hover:text-[#0078D4]'
            }`}
          >
            {isAutoPunching ? <Pause size={12} /> : <Play size={12} />}
            <span>{isAutoPunching ? 'PAUSE SEQUENCE' : 'AUTO-PUNCH ALL'}</span>
          </button>

          {/* Reset Stamps */}
          <button
            onClick={handleResetStamps}
            title="Reset stamped marks"
            className="p-1.5 font-mono text-[10px] border border-white/10 text-[#8A8F9E] hover:text-white hover:border-white/30 transition-colors"
          >
            <RotateCcw size={13} />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            title="Toggle mechanical punch sound effect"
            className={`p-1.5 font-mono text-[10px] border transition-colors ${
              isAudioEnabled
                ? 'text-[#0078D4] border-[#0078D4]/40 bg-[#0078D4]/10'
                : 'text-[#575C6C] border-white/10'
            }`}
          >
            {isAudioEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>
        </div>
      </div>

      {/* ── Sub-header: Filters & Search ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 bg-[#0A0A0C]/90 border-b border-white/5 font-mono text-[10px]">
        {/* Category Filters */}
        <div className="flex items-center gap-1">
          {[
            { id: 'all', label: 'ALL LOG ENTRIES', count: AUDIT_WALL_RECORDS.length },
            { id: 'nominal', label: 'PASSED [0-VAR]', count: AUDIT_WALL_RECORDS.filter(r => r.category === 'nominal').length },
            { id: 'warning', label: 'REVIEW [VARIANCE]', count: AUDIT_WALL_RECORDS.filter(r => r.category === 'warning').length },
            { id: 'critical', label: 'CRITICAL [REJECT]', count: AUDIT_WALL_RECORDS.filter(r => r.category === 'critical').length },
          ].map(({ id, label, count }) => (
            <button
              key={id}
              onClick={() => setFilter(id as typeof filter)}
              className={`px-2.5 py-1 border transition-colors uppercase ${
                filter === id
                  ? 'bg-white/15 text-white font-bold border-white/40'
                  : 'text-[#8A8F9E] border-transparent hover:text-white hover:border-white/10'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-64">
          <Search size={12} className="absolute left-2.5 top-2.5 text-[#575C6C]" />
          <input
            type="text"
            placeholder="FILTER VENDOR / INV / PO..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#12141C] border border-white/10 px-2 py-1 pl-8 text-xs font-mono text-white focus:outline-none focus:border-[#0078D4]"
          />
        </div>
      </div>

      {/* ── Main Wall Container (Stacked Rows) ── */}
      <div
        ref={wallContainerRef}
        className="flex-1 max-w-7xl w-full mx-auto p-4 space-y-2 z-10"
      >
        {/* Guidance Prompt */}
        <div className="flex items-center justify-between p-2.5 bg-[#0E0F14]/70 border border-[#0078D4]/30 font-mono text-[10px] text-[#A2A7B5]">
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-[#0078D4]" />
            <span>
              <strong>MECHANICAL AUDIT WALL:</strong> Each row triggers an authentic high-impact stamp-punch with precise UTC timestamp as you scroll down.
            </span>
          </div>
          <span className="text-[#575C6C]">SCROLL OR CLICK 'AUTO-PUNCH' ▼</span>
        </div>

        {/* Stacked Rows */}
        {filteredRecords.map((record, index) => (
          <PanelRow
            key={record.id}
            record={record}
            index={index}
            isStamped={!!stampedMap[record.id]}
            timestamp={stampedMap[record.id] || ''}
            onIntersect={handleStampRecord}
            onSelect={setSelectedRecord}
          />
        ))}

        {filteredRecords.length === 0 && (
          <div className="p-12 text-center font-mono text-xs text-[#575C6C]">
            NO AUDIT RECORDS FOUND MATCHING QUERY
          </div>
        )}
      </div>

      {/* ── Detail Telemetry Modal / Drawer ── */}
      {selectedRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setSelectedRecord(null)}
        >
          <div
            className="w-full max-w-xl bg-[#0E1017] border border-[#0078D4]/50 p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <div className="font-mono text-[10px] text-[#0078D4] font-bold uppercase">
                  INVOICE CERTIFICATION AUDIT TELEMETRY // {selectedRecord.id}
                </div>
                <h3 className="text-base font-mono font-bold text-white mt-1">
                  {selectedRecord.vendor}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-[#8A8F9E] hover:text-white font-mono text-xs border border-white/10 px-2 py-0.5"
              >
                ✕ ESC
              </button>
            </div>

            {/* Field Breakdown Grid */}
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-2.5 bg-black/40 border border-white/5">
                <span className="text-[9px] text-[#575C6C] block">INVOICE NUMBER</span>
                <span className="text-white font-bold">{selectedRecord.invoiceNo}</span>
              </div>
              <div className="p-2.5 bg-black/40 border border-white/5">
                <span className="text-[9px] text-[#575C6C] block">PURCHASE ORDER</span>
                <span className="text-white font-bold">{selectedRecord.poNumber}</span>
              </div>
              <div className="p-2.5 bg-black/40 border border-white/5">
                <span className="text-[9px] text-[#575C6C] block">GOODS RECEIPT NOTE</span>
                <span className="text-white font-bold">{selectedRecord.grnNumber}</span>
              </div>
              <div className="p-2.5 bg-black/40 border border-white/5">
                <span className="text-[9px] text-[#575C6C] block">BILLED TOTAL</span>
                <span className="text-white font-bold">{selectedRecord.amount}</span>
              </div>
              <div className="p-2.5 bg-black/40 border border-white/5">
                <span className="text-[9px] text-[#575C6C] block">VARIANCE</span>
                <span className="text-white font-bold">{selectedRecord.variance}</span>
              </div>
              <div className="p-2.5 bg-black/40 border border-white/5">
                <span className="text-[9px] text-[#575C6C] block">GST IDENTIFIER</span>
                <span className="text-white font-bold">{selectedRecord.gstin}</span>
              </div>
            </div>

            {/* Match Status & Flag Reason */}
            <div className="p-3 bg-black/50 border border-white/10 font-mono text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-[#575C6C]">3-WAY RECONCILIATION RESULT</span>
                <span className="text-[10px] font-bold text-[#0078D4]">
                  CONFIDENCE {selectedRecord.confidence}%
                </span>
              </div>
              <div className="text-white font-semibold">{selectedRecord.matchType}</div>
              {selectedRecord.flagReason && (
                <div className="text-[11px] text-[#FFB900] pt-1 border-t border-white/5">
                  ALERT: {selectedRecord.flagReason}
                </div>
              )}
            </div>

            {/* Cryptographic Proof */}
            <div className="p-2.5 bg-[#07080B] border border-white/5 font-mono text-[9px] text-[#8A8F9E]">
              <span className="text-[#575C6C] block mb-0.5">CRYPTOGRAPHIC AUDIT SEAL (SHA-256)</span>
              <div className="text-[#A2A7B5] break-all">{selectedRecord.hash}</div>
              {stampedMap[selectedRecord.id] && (
                <div className="mt-1 text-[#107C41] font-semibold">
                  CERTIFIED STAMP TIMESTAMP: {stampedMap[selectedRecord.id]}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              {!stampedMap[selectedRecord.id] && (
                <button
                  onClick={() => {
                    handleStampRecord(selectedRecord.id);
                  }}
                  className="px-4 py-1.5 bg-[#0078D4] hover:bg-[#0078D4]/80 text-white font-mono text-xs font-bold uppercase tracking-wider"
                >
                  STAMP RECORD NOW
                </button>
              )}
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase tracking-wider"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
