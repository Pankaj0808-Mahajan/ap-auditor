import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  code?: string;
  badge?: string | number;
  badgeVariant?: 'accent' | 'warning' | 'error' | 'nominal';
  icon?: React.ReactNode;
}

export interface IndustrialTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const IndustrialTabs: React.FC<IndustrialTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center border-b border-white/10 bg-[#0A0A0C] overflow-x-auto select-none ${className}`}
      style={{ borderRadius: 0 }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              relative flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-wider font-semibold
              transition-all duration-150 border-r border-white/10 shrink-0
              ${isActive
                ? 'bg-[#0078D4]/15 text-white border-t-2 border-t-[#0078D4]'
                : 'text-[#8A8F9E] hover:text-[#E6E8EE] hover:bg-white/5 border-t-2 border-t-transparent'
              }
            `}
            style={{ borderRadius: 0 }}
          >
            {tab.icon && <span className="text-sm">{tab.icon}</span>}
            
            {tab.code && (
              <span className={`text-[10px] font-mono ${isActive ? 'text-[#0078D4]' : 'text-[#575C6C]'}`}>
                {tab.code}
              </span>
            )}

            <span>{tab.label}</span>

            {tab.badge !== undefined && (
              <span className={`
                text-[10px] font-mono px-1.5 py-0.2 border
                ${tab.badgeVariant === 'error' ? 'bg-[#D13438]/20 text-[#FF6B6E] border-[#D13438]/50' :
                  tab.badgeVariant === 'warning' ? 'bg-[#FFB900]/20 text-[#FFD454] border-[#FFB900]/50' :
                  'bg-white/10 text-white border-white/20'
                }
              `}>
                {tab.badge}
              </span>
            )}

            {/* Active bottom accent line */}
            {isActive && (
              <div className="absolute inset-x-0 bottom-0 h-[2px] bg-[#0078D4] shadow-[0_0_8px_#0078D4]" />
            )}
          </button>
        );
      })}
    </div>
  );
};
