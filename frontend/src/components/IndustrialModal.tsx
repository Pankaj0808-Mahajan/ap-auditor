import React, { useEffect } from 'react';
import { AcrylicPanel, AcrylicPanelVariant } from './AcrylicPanel';
import { X } from 'lucide-react';

export interface IndustrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  technicalId?: string;
  variant?: AcrylicPanelVariant;
  children: React.ReactNode;
  footerActions?: React.ReactNode;
}

export const IndustrialModal: React.FC<IndustrialModalProps> = ({
  isOpen,
  onClose,
  title,
  technicalId,
  variant = 'default',
  children,
  footerActions,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark frosted backdrop with grid lines */}
      <div
        className="fixed inset-0 bg-[#0A0A0C]/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-xl animate-in fade-in zoom-in-95 duration-150">
        <AcrylicPanel
          variant={variant}
          glow
          showBrackets
          technicalId={technicalId}
          header={title}
          headerAction={
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 text-[#8A8F9E] hover:text-white transition-colors"
              style={{ borderRadius: 0 }}
              title="Close [ESC]"
            >
              <X size={16} />
            </button>
          }
          className="shadow-2xl"
        >
          <div className="text-left text-[#E6E8EE] space-y-4">
            {children}
          </div>

          {footerActions && (
            <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-end gap-3">
              {footerActions}
            </div>
          )}
        </AcrylicPanel>
      </div>
    </div>
  );
};
