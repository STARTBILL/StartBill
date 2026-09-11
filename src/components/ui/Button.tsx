import { ButtonHTMLAttributes, ReactNode, MouseEvent } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  id?: string;
  title?: string;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: ReactNode;
}

export function Button({
  id,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

  // Variant classes mapping
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-700 active:bg-primary-800 text-white focus:ring-primary-500 shadow-sm border border-primary-700/10',
    secondary: 'bg-secondary-100 hover:bg-secondary-200 active:bg-secondary-300 text-secondary-800 focus:ring-secondary-500 border border-secondary-200/50',
    outline: 'bg-transparent border border-secondary-300 hover:bg-secondary-50 active:bg-secondary-100 text-secondary-700 focus:ring-primary-500',
    ghost: 'bg-transparent hover:bg-secondary-100 text-secondary-700 active:bg-secondary-200 focus:ring-secondary-400',
    danger: 'bg-error-600 hover:bg-error-700 active:bg-error-800 text-white focus:ring-error-500 shadow-sm border border-error-700/10'
  };

  // Size classes mapping
  const sizeClasses = {
    xs: 'px-2 py-1 text-[10px] gap-1',
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-xs gap-2',
    lg: 'px-5 py-2.5 text-sm gap-2.5'
  };

  const currentVariant = variantClasses[variant] || variantClasses.primary;
  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <button
      id={id}
      type={type}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${currentVariant} ${currentSize} ${className}`}
      {...props}
    >
      {isLoading && (
        <svg
          id={`${id}-spinner`}
          className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
