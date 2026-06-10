import React from 'react';

export function AuthenticityPanel({ authenticityScore, dimensionScores = {} }) {
  const dimensions = [
    { key: 'buzzword_density', label: 'Buzzword Density', invert: true, desc: 'Lower is better. Measures synergetic fluff.' },
    { key: 'specificity', label: 'Quantified Specificity', invert: false, desc: 'Higher is better. Measures concrete metrics & details.' },
    { key: 'seniority_realism', label: 'Seniority Realism', invert: false, desc: 'Higher is better. Evaluates stated experience vs. terminology.' },
    { key: 'technical_depth', label: 'Technical Depth', invert: false, desc: 'Higher is better. Evaluates depth of tooling & domain details.' },
    { key: 'semantic_redundancy', label: 'Semantic Redundancy', invert: true, desc: 'Lower is better. Tracks repeating identical thoughts.' },
    { key: 'style_entropy', label: 'Style Entropy', invert: false, desc: 'Higher is better. Measures variance in sentence structures.' },
    { key: 'verifiability', label: 'Claim Verifiability', invert: false, desc: 'Higher is better. Highlights testable, fact-based results.' },
    { key: 'ats_manipulation', label: 'ATS Manipulation', invert: true, desc: 'Lower is better. Flags keyword stuffing & hidden hacks.' }
  ];

  const getScoreColor = (score, invert) => {
    // Determine quality of score
    const val = invert ? 100 - score : score;
    if (val >= 75) return 'bg-emerald-500';
    if (val >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getTextColor = (score, invert) => {
    const val = invert ? 100 - score : score;
    if (val >= 75) return 'text-emerald-400';
    if (val >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="border border-zinc-900 bg-zinc-950/40 rounded-xl p-5 flex flex-col gap-4 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
        <h3 className="font-display text-sm font-semibold tracking-wide text-zinc-200">Authenticity Audit</h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-zinc-500 uppercase">Human Signal:</span>
          <span className={`font-display text-base font-bold ${getScoreColor(authenticityScore, false).replace('bg-', 'text-')}`}>
            {authenticityScore}%
          </span>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="flex flex-col gap-3">
        {dimensions.map(({ key, label, invert, desc }) => {
          const score = dimensionScores[key] ?? 50;
          const pct = Math.min(Math.max(score, 0), 100);
          
          return (
            <div key={key} className="flex flex-col gap-1 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 group relative">
                  <span className="font-mono text-zinc-300 hover:text-zinc-100 transition-colors cursor-help">
                    {label}
                  </span>
                  {/* Subtle inline explanation */}
                  <span className="text-[8px] text-zinc-500 font-normal italic">
                    ({invert ? 'Lower is better' : 'Higher is better'})
                  </span>
                </div>
                <span className={`font-mono font-semibold ${getTextColor(score, invert)}`}>
                  {score}%
                </span>
              </div>
              
              {/* Progress Track */}
              <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${getScoreColor(score, invert)}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default AuthenticityPanel;
