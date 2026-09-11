import { HTMLAttributes, ReactNode, MouseEvent } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  id?: string;
  key?: string | number;
  className?: string;
  children: ReactNode;
  hoverable?: boolean;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
}

export function Card({ id, children, hoverable = false, className = '', ...props }: CardProps) {
  return (
    <div
      id={id}
      className={`bg-white border border-secondary-200/60 rounded-2xl p-4 shadow-sm transition duration-200 ${
        hoverable ? 'hover:shadow-md hover:border-secondary-300' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ id, children, className = '' }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <div id={id} className={`flex items-center justify-between border-b border-secondary-100 pb-3 mb-3 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ id, children, className = '' }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <h3 id={id} className={`text-xs font-bold text-secondary-900 tracking-tight ${className}`}>
      {children}
    </h3>
  );
}

export function CardContent({ id, children, className = '' }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <div id={id} className={`text-xs text-secondary-600 leading-relaxed ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ id, children, className = '' }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <div id={id} className={`border-t border-secondary-100 pt-3 mt-3 flex items-center justify-end gap-2 ${className}`}>
      {children}
    </div>
  );
}
