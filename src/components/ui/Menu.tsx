import { useState, useEffect, useRef, ReactNode } from 'react';

export interface MenuItem {
  id: string;
  label: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export interface MenuProps {
  id: string;
  trigger: ReactNode;
  items: MenuItem[];
  align?: 'left' | 'right';
  className?: string;
}

export function Menu({ id, trigger, items, align = 'right', className = '' }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div id={id} ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <div id={`${id}-trigger-container`} onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          id={`${id}-dropdown-menu`}
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-1.5 w-44 rounded-xl bg-white border border-secondary-200/60 shadow-lg py-1.5 z-50 origin-top-right transition duration-150 ease-out`}
        >
          {items.map((item, index) => (
            <button
              key={item.id || index}
              id={`${id}-item-${item.id || index}`}
              type="button"
              disabled={item.disabled}
              onClick={() => {
                if (item.onClick) item.onClick();
                setIsOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2 text-xs font-medium text-secondary-700 hover:bg-secondary-50 active:bg-secondary-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors flex items-center gap-2 ${
                item.className || ''
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
