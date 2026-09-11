import { ReactNode } from 'react';
import { Button } from './Button';
import { PackageOpen } from 'lucide-react';

export interface EmptyStateProps {
  id?: string;
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  id = 'empty-state',
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}: EmptyStateProps) {
  return (
    <div
      id={id}
      className={`flex flex-col items-center justify-center text-center p-8 border border-dashed border-secondary-200/80 bg-secondary-50/30 rounded-2xl ${className}`}
    >
      <div id={`${id}-icon-container`} className="p-3 bg-secondary-50 rounded-2xl mb-4 border border-secondary-100 text-secondary-400">
        {icon || <PackageOpen className="w-6 h-6 stroke-[1.5]" />}
      </div>
      <h3 id={`${id}-title`} className="text-xs font-bold text-secondary-900 mb-1">
        {title}
      </h3>
      <p id={`${id}-desc`} className="text-[11px] text-secondary-500 max-w-[240px] leading-relaxed mb-4">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button id={`${id}-action`} variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
