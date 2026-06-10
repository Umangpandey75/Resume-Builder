import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function Accordion({ title, children, defaultOpen = false, className = '' }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border border-zinc-900 rounded-lg overflow-hidden bg-zinc-950/20 ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-900/30 transition-colors focus:outline-none"
      >
        <span className="font-display font-medium text-sm text-zinc-300 tracking-wide">{title}</span>
        <ChevronDown 
          className={`h-4 w-4 text-zinc-500 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180 text-zinc-300' : ''
          }`} 
        />
      </button>
      
      {/* Accordion panel content */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100 border-t border-zinc-900' : 'max-h-0 opacity-0 pointer-events-none'
        } overflow-hidden`}
      >
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
}
export default Accordion;
