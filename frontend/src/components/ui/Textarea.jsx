import React from 'react';

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full min-h-[120px] rounded-lg border border-zinc-800 bg-zinc-950/40 p-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-body ${className}`}
      {...props}
    />
  );
}

export default Textarea;
