import React, { useState } from 'react';

export function Tooltip({ content, children, className = '' }) {
  const [visible, setVisible] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && content && (
        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-100 rounded-md shadow-xl z-50 whitespace-pre-wrap max-w-xs text-center pointer-events-none font-mono leading-relaxed tracking-wider border-opacity-70 ${className}`}>
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-zinc-950" />
        </div>
      )}
    </div>
  );
}
export default Tooltip;
