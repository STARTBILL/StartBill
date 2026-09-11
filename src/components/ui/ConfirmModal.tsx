import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-secondary-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
      <Card className="w-full max-w-sm bg-white shadow-2xl rounded-2xl border-secondary-200 p-5 space-y-4 text-left">
        <div className="flex items-start justify-between border-b border-secondary-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              variant === 'danger' ? 'bg-error-50 text-error-600 border border-error-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-secondary-900">{title}</h3>
          </div>
          <button onClick={onCancel} className="text-secondary-400 hover:text-secondary-700 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-secondary-600 leading-relaxed font-medium">
          {message}
        </p>

        <div className="flex justify-end gap-2 pt-2 border-t border-secondary-100">
          <Button variant="outline" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </Card>
    </div>
  );
};
