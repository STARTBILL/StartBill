import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ id, label, error, helperText, icon, disabled, className = '', type = 'text', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1 text-left">
        {label && (
          <label htmlFor={id} className="text-[10px] font-bold text-secondary-500 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 text-secondary-400 pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            id={id}
            type={type}
            disabled={disabled}
            ref={ref}
            className={`w-full text-xs bg-secondary-50/70 border rounded-xl py-2 px-3.5 outline-none transition duration-150 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed ${
              icon ? 'pl-10' : ''
            } ${
              error
                ? 'border-error-600 focus:border-error-600 focus:ring-1 focus:ring-error-600/30'
                : 'border-secondary-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30'
            } ${className}`}
            {...props}
          />
        </div>
        {error ? (
          <p id={`${id}-error`} className="text-[10px] text-error-700 font-medium">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${id}-helper`} className="text-[10px] text-secondary-400">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
