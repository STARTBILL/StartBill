import { Loader2 } from 'lucide-react';

export interface LoaderProps {
  id?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
  fullHeight?: boolean;
}

export function Loader({
  id = 'global-loader',
  size = 'md',
  label = 'Chargement...',
  className = '',
  fullHeight = false
}: LoaderProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div
      id={id}
      className={`flex flex-col items-center justify-center gap-2.5 p-6 text-secondary-500 ${
        fullHeight ? 'min-h-[300px]' : ''
      } ${className}`}
    >
      <Loader2 id={`${id}-spinner`} className={`animate-spin text-primary-500 ${sizeClasses[size]}`} />
      {label && <span className="text-[11px] font-medium tracking-wide uppercase text-secondary-400">{label}</span>}
    </div>
  );
}

export function Skeleton({ id, className = '' }: { id?: string; className?: string }) {
  return (
    <div
      id={id}
      className={`animate-pulse bg-secondary-200/65 rounded-xl ${className}`}
    />
  );
}
