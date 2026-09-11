import { ReactNode } from 'react';
import { AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { motion } from 'motion/react';

export interface ErrorStateProps {
  id?: string;
  title?: string;
  message: string;
  icon?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  compact?: boolean;
}

export function ErrorState({
  id = 'error-state',
  title,
  message,
  icon,
  onRetry,
  retryLabel = 'Réessayer',
  className = '',
  compact = false
}: ErrorStateProps) {
  // Determine default icons if none provided
  const renderIcon = () => {
    if (icon) return icon;
    
    if (compact) {
      return (
        <div 
          id={`${id}-icon-wrapper`}
          className="p-2 bg-error-50 rounded-xl text-error-600 border border-error-100 flex items-center justify-center flex-shrink-0"
        >
          <AlertCircle className="w-5 h-5 stroke-[2]" />
        </div>
      );
    }

    return (
      <motion.div
        id={`${id}-icon-wrapper`}
        initial={{ scale: 0.9, rotate: -5 }}
        animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
        className="p-4 bg-error-50 rounded-2xl text-error-600 border border-error-100 shadow-sm flex items-center justify-center"
      >
        <AlertTriangle className="w-8 h-8 stroke-[1.8]" />
      </motion.div>
    );
  };

  // Render Compact Mode
  if (compact) {
    return (
      <motion.div
        id={id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className={`flex items-start gap-3 p-4 border border-error-100 bg-error-50/20 rounded-xl ${className}`}
      >
        {renderIcon()}
        
        <div className="flex-1 min-w-0 text-left space-y-1">
          {title && (
            <h4 id={`${id}-title`} className="text-xs font-black text-error-800 leading-snug">
              {title}
            </h4>
          )}
          <p id={`${id}-desc`} className="text-[11px] text-error-700 leading-normal font-semibold">
            {message}
          </p>
          
          {onRetry && (
            <div className="pt-1">
              <Button
                id={`${id}-retry`}
                variant="outline"
                size="xs"
                onClick={onRetry}
                className="hover:bg-error-50 text-error-700 border-error-200/60 font-bold transition flex items-center gap-1 py-1 px-2 text-[10px]"
              >
                <RefreshCw className="w-2.5 h-2.5 animate-spin-hover" />
                <span>{retryLabel}</span>
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Render Full/Normal Mode (Spacious & centered)
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, scale: 0.98, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 border border-error-100 bg-error-50/15 rounded-3xl max-w-2xl mx-auto space-y-5 shadow-sm ${className}`}
    >
      <div className="flex justify-center">
        {renderIcon()}
      </div>

      <div className="space-y-2">
        <h3 
          id={`${id}-title`} 
          className="text-base md:text-lg font-black text-secondary-900 tracking-tight font-display"
        >
          {title || 'Une erreur est survenue'}
        </h3>
        <p 
          id={`${id}-desc`} 
          className="text-xs md:text-sm text-secondary-500 max-w-md mx-auto leading-relaxed font-semibold"
        >
          {message}
        </p>
      </div>

      {onRetry && (
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="pt-2"
        >
          <Button
            id={`${id}-retry`}
            variant="primary"
            size="md"
            onClick={onRetry}
            className="flex items-center gap-2 font-black shadow-md shadow-blue-500/10 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{retryLabel}</span>
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
