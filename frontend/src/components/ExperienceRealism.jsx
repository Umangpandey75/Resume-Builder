import React, { useState } from 'react';
import { Calendar, Award, AlertTriangle, Eye, HelpCircle, ChevronDown, CheckCircle } from 'lucide-react';

export function ExperienceRealism({ experienceRealism = {}, unverifiableClaims = [] }) {
  const [expandedClaim, setExpandedClaim] = useState(null);

  const { stated_yoe, implied_seniority, mismatch_severity, evidence = [] } = experienceRealism;

  // Severity style configuration
  const severityConfig = {
    none: { label: 'Aligned Experience', bg: 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20' },
    mild: { label: 'Mild Discrepancy', bg: 'bg-yellow-950/20 text-yellow-400 border-yellow-500/20' },
    moderate: { label: 'Moderate Mismatch', bg: 'bg-amber-950/20 text-amber-400 border-amber-500/20' },
    severe: { label: 'Critical Inflation Risk', bg: 'bg-red-950/20 text-red-400 border-red-500/20' }
  };

  const currentSeverity = severityConfig[mismatch_severity] || severityConfig.none;

  const toggleClaim = (idx) => {
    if (expandedClaim === idx) {
      setExpandedClaim(null);
    } else {
      setExpandedClaim(idx);
    }
  };

  return (
    <div className="border border-zinc-900 bg-zinc-950/40 rounded-xl p-5 flex flex-col gap-4 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
        <h3 className="font-display text-sm font-semibold tracking-wide text-zinc-200">Experience & Seniority Realism</h3>
        {mismatch_severity && (
          <span className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${currentSeverity.bg}`}>
            <AlertTriangle className="h-3 w-3 shrink-0" />
            {currentSeverity.label}
          </span>
        )}
      </div>

      {/* YOE vs Seniority Stats */}
      <div className="grid grid-cols-2 gap-4 bg-zinc-950/60 rounded-xl p-4 border border-zinc-900">
        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-mono tracking-widest text-zinc-500 uppercase">Stated Experience</span>
          <div className="flex items-center gap-1.5 text-zinc-200 font-display font-medium text-sm">
            <Calendar className="h-4 w-4 text-amber-500" />
            {stated_yoe !== null && stated_yoe !== undefined ? `${stated_yoe} Years` : 'Unspecified'}
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-mono tracking-widest text-zinc-500 uppercase">Implied Seniority</span>
          <div className="flex items-center gap-1.5 text-zinc-200 font-display font-medium text-sm capitalize">
            <Award className="h-4 w-4 text-amber-500" />
            {implied_seniority || 'Unknown'}
          </div>
        </div>
      </div>

      {/* Evidence checklist */}
      {evidence.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[8px] font-mono tracking-widest text-zinc-500 uppercase">Seniority Evidence & Audit Notes</span>
          <ul className="flex flex-col gap-2 text-xs text-zinc-300 font-body">
            {evidence.map((item, i) => (
              <li key={i} className="flex items-start gap-2 leading-relaxed">
                <span className="text-amber-500 shrink-0 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Unverifiable Claims and Probing Questions */}
      {unverifiableClaims && unverifiableClaims.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-zinc-900/50 pt-3">
          <span className="text-[8px] font-mono tracking-widest text-zinc-500 uppercase">Unverifiable Claims (Probe List)</span>
          <p className="text-[10px] text-zinc-500 font-body mb-1">
            These bullets lack numbers, tools, or specifics. Recruiters may grill you on these:
          </p>

          <div className="flex flex-col gap-2">
            {unverifiableClaims.map((item, idx) => {
              const isExpanded = expandedClaim === idx;
              return (
                <div 
                  key={idx} 
                  className="border border-zinc-900 rounded-lg overflow-hidden bg-zinc-950/20"
                >
                  <button
                    onClick={() => toggleClaim(idx)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-zinc-900/30 transition-all focus:outline-none"
                  >
                    <span className="text-xs font-body text-zinc-300 pr-4 italic">"{item.claim}"</span>
                    <ChevronDown className={`h-4 w-4 text-zinc-500 shrink-0 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-3 pt-1 border-t border-zinc-900 bg-zinc-950/40">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1">
                          <HelpCircle className="h-3.5 w-3.5 text-amber-500" />
                          <span className="text-[9px] font-mono tracking-wider text-amber-500 uppercase font-semibold">Probing Interview Questions</span>
                        </div>
                        <ul className="flex flex-col gap-1.5 text-xs text-zinc-400 font-body list-disc pl-4 leading-relaxed">
                          {item.probing_questions.map((q, qIdx) => (
                            <li key={qIdx}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
export default ExperienceRealism;
