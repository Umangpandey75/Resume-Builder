import React, { useState } from 'react';
import { Copy, Check, Navigation, AlertCircle } from 'lucide-react';

export function SuggestionCard({ suggestion, index, onClick, isActive }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation(); // Avoid triggering click to locate
    navigator.clipboard.writeText(suggestion.improved);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isOptional = suggestion.priority === 'optional';

  return (
    <div 
      onClick={onClick}
      className={`border rounded-xl p-4 transition-all duration-300 cursor-pointer ${
        isActive 
          ? 'bg-amber-950/20 border-amber-500 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30' 
          : 'bg-zinc-950/20 border-zinc-900 hover:border-zinc-800 hover:bg-zinc-950/40'
      }`}
      data-testid="suggestion-card"
    >
      {/* Card Header */}
      <div className="flex items-center justify-between gap-2 border-b border-zinc-900 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Navigation className={`h-3 w-3 ${isActive ? 'text-amber-500' : 'text-zinc-500'}`} />
          <span className="font-display font-medium text-xs text-zinc-300">
            Rewrite #{index + 1} <span className="text-[10px] text-zinc-500 font-mono">· Click to locate</span>
          </span>
          {isOptional && (
            <span className="text-[8px] font-mono font-semibold tracking-wider bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700/30">
              OPTIONAL
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Impact badge */}
          <span className="inline-flex items-center gap-0.5 text-[10px] font-mono font-bold text-emerald-500 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-500/20">
            +{suggestion.impact_points} PTS
          </span>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded bg-zinc-950 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 border border-zinc-900 hover:border-zinc-800 transition-all focus:outline-none"
            title="Copy rewrite to clipboard"
            data-testid="copy-rewrite-btn"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Card Body (Two-Column Strikethrough) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-3">
        {/* Original Column */}
        <div className="bg-red-950/5 border border-red-950/20 rounded-lg p-3 text-red-400 border-opacity-30">
          <p className="text-[8px] font-mono tracking-wider text-red-500 uppercase mb-1 font-bold">Original Line</p>
          <p className="line-through font-body leading-relaxed">{suggestion.original}</p>
        </div>

        {/* Improved Column */}
        <div className="bg-amber-950/5 border border-amber-950/20 rounded-lg p-3 text-amber-300 border-opacity-30">
          <p className="text-[8px] font-mono tracking-wider text-amber-500 uppercase mb-1 font-bold">Suggested Rewrite</p>
          <p className="font-body leading-relaxed font-medium">{suggestion.improved}</p>
        </div>
      </div>

      {/* Card Footer (Why) */}
      <div className="flex items-start gap-2 bg-zinc-950/40 rounded-lg p-3 border border-zinc-900">
        <AlertCircle className="h-3.5 w-3.5 text-zinc-500 shrink-0 mt-0.5" />
        <div>
          <span className="text-[9px] font-mono tracking-wider text-zinc-500 uppercase font-bold">Strategy</span>
          <p className="text-zinc-400 font-body leading-relaxed mt-0.5 text-xs">
            {suggestion.reason}
          </p>
        </div>
      </div>
    </div>
  );
}
export default SuggestionCard;
