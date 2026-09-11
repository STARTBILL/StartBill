import React from 'react';
import { useRegional } from '../../context/RegionalContext';

interface CurrencyFormatterProps {
  amount: number;
  className?: string;
  showSymbol?: boolean;
}

export const CurrencyFormatter: React.FC<CurrencyFormatterProps> = ({ 
  amount, 
  className = '',
  showSymbol = true 
}) => {
  const { formatPrice, currencySymbol } = useRegional();

  if (!showSymbol) {
    return <span className={className}>{amount.toLocaleString('fr-FR')}</span>;
  }

  return (
    <span className={className}>
      {formatPrice(amount)}
    </span>
  );
};

export default CurrencyFormatter;
