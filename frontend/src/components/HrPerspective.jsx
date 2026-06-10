import React from 'react';
import { Award, AlertOctagon, CheckSquare, AlertTriangle, ShieldCheck } from 'lucide-react';

export function HrPerspective({ hrPerspective }) {
  if (!hrPerspective) return null;

  const { verdict, first_impression, reasoning, strengths = [], red_flags = [] } = hrPerspective;

  // Verdict configs
  const verdictConfig = {
    strong_yes: { label: 'Strong Hire', bg: 'bg-emerald-950/20 text-emerald-400 border-emerald-500/30', icon: ShieldCheck },
    yes: { label: 'Recommend Hire', bg: 'bg-green-950/20 text-green-400 border-green-500/30', icon: Award },
    maybe: { label: 'Conditional Interview', bg: 'bg-amber-950/20 text-amber-400 border-amber-500/30', icon: AlertTriangle },
    no: { label: 'Reject / Hard Pass', bg: 'bg-red-950/20 text-red-400 border-red-500/30', icon: AlertOctagon }
  };

  const currentVerdict = verdictConfig[verdict] || verdictConfig.maybe;
  const VerdictIcon = currentVerdict.icon;

  return (
    <div className="border border-zinc-900 bg-zinc-950/40 rounded-xl p-5 flex flex-col gap-4 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
        <h3 className="font-display text-sm font-semibold tracking-wide text-zinc-200">Recruiter Verdict</h3>
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${currentVerdict.bg}`}>
          <VerdictIcon className="h-3.5 w-3.5 shrink-0" />
          {currentVerdict.label}
        </span>
      </div>

      {/* Impression */}
      <div>
        <span className="text-[8px] font-mono tracking-widest text-zinc-500 uppercase">First Impression</span>
        <p className="text-zinc-200 text-xs italic font-body mt-1 leading-relaxed border-l-2 border-amber-500/30 pl-3">
          "{first_impression}"
        </p>
      </div>

      {/* Reasoning */}
      <div>
        <span className="text-[8px] font-mono tracking-widest text-zinc-500 uppercase">Recruiter Reasoning</span>
        <p className="text-zinc-400 text-xs font-body mt-1 leading-relaxed">
          {reasoning}
        </p>
      </div>

      {/* Strengths & Red Flags grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-zinc-900/50 pt-3 mt-1">
        {/* Strengths */}
        {strengths.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-[8px] font-mono tracking-widest text-emerald-400 uppercase font-semibold">Strengths Spotted</span>
            <ul className="flex flex-col gap-1.5 text-xs text-zinc-300 font-body">
              {strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                  <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Red Flags */}
        {red_flags.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-[8px] font-mono tracking-widest text-red-400 uppercase font-semibold">Concerns & Red Flags</span>
            <ul className="flex flex-col gap-1.5 text-xs text-zinc-300 font-body">
              {red_flags.map((flag, i) => (
                <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                  <span className="text-red-400 shrink-0 mt-0.5">𐄂</span>
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
export default HrPerspective;
