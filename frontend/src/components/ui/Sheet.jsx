import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Sheet({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children,
  side = 'right'
}) {
  // Listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sideClasses = {
    right: 'right-0 h-full w-full sm:max-w-md border-l animate-slide-right',
    left: 'left-0 h-full w-full sm:max-w-md border-r animate-slide-left'
  };

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Drawer content */}
      <div className={`fixed inset-y-0 right-0 flex max-w-full pl-10 z-50`}>
        <div className="w-screen max-w-md transform bg-zinc-950 border-l border-zinc-900 text-zinc-100 flex flex-col shadow-2xl transition-all duration-300">
          {/* Header */}
          <div className="px-6 py-5 border-b border-zinc-900 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-display font-semibold tracking-wide text-zinc-100">{title}</h2>
              {description && (
                <p className="text-xs text-zinc-500 mt-1 font-body">{description}</p>
              )}
            </div>
            <button 
              onClick={onClose}
              className="rounded-md p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50 transition-colors focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
export default Sheet;
