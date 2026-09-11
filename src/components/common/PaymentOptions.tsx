import React from 'react';
import { useRegional } from '../../context/RegionalContext';
import { PAYMENT_PROVIDER_LABELS } from '../../data/regions';

interface PaymentOptionsProps {
  selectedProvider?: string;
  onSelectProvider?: (provider: string) => void;
  className?: string;
}

export const PaymentOptions: React.FC<PaymentOptionsProps> = ({
  selectedProvider,
  onSelectProvider,
  className = ''
}) => {
  const { paymentProviders } = useRegional();

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-xs font-bold text-slate-700 block">
        Mode de paiement accepté :
      </label>
      <div className="flex flex-wrap gap-2">
        {paymentProviders.map((providerKey) => {
          const info = PAYMENT_PROVIDER_LABELS[providerKey] || { label: providerKey, icon: '💳' };
          const isSelected = selectedProvider === providerKey;

          return (
            <button
              key={providerKey}
              type="button"
              onClick={() => onSelectProvider && onSelectProvider(providerKey)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>{info.icon}</span>
              <span>{info.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentOptions;
