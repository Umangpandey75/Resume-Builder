import React from 'react';
import { AlertCircle, ChevronRight, CornerDownRight } from 'lucide-react';

export function FlaggedPatterns({ flaggedPatterns = [], aiDetectedLines = [], onTriggerHighlight }) {
  if (!flaggedPatterns || flaggedPatterns.length === 0) return null;

  // Simple token matching helper to find which detected line this pattern relates to
  const tokenize = (text) => {
    if (!text) return [];
    return text.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(Boolean);
  };

  const findMatchingHighlightIndex = (examples) => {
    if (!examples || examples.length === 0) return null;

    let bestIdx = null;
    let maxOverlap = 0;

    // Compare examples against all aiDetectedLines
    examples.forEach(example => {
      aiDetectedLines.forEach((detectedLine, idx) => {
        const tokensEx = tokenize(example);
        const tokensLine = tokenize(detectedLine.text);
        if (tokensEx.length === 0 || tokensLine.length === 0) return;

        let matches = 0;
        tokensEx.forEach(tok => {
          if (tokensLine.includes(tok)) matches++;
        });

        const overlap = matches / Math.min(tokensEx.length, tokensLine.length);
        if (overlap >= 0.50 && overlap > maxOverlap) {
          maxOverlap = overlap;
          bestIdx = idx;
        }
      });
    });

    return bestIdx;
  };

  const handleCardClick = (pattern) => {
    const matchedIdx = findMatchingHighlightIndex(pattern.examples);
    if (matchedIdx !== null && onTriggerHighlight) {
      onTriggerHighlight(matchedIdx);
    }
  };

  const severityStyles = {
    high: 'text-red-400 bg-red-950/10 border-red-900/50',
    medium: 'text-amber-400 bg-amber-950/10 border-amber-900/50',
    low: 'text-yellow-400 bg-yellow-950/10 border-yellow-900/50'
  };

  return (
    <div className="border border-zinc-900 bg-zinc-950/40 rounded-xl p-5 flex flex-col gap-4 animate-fade-up">
      {/* Header */}
      <div className="border-b border-zinc-900 pb-3">
        <h3 className="font-display text-sm font-semibold tracking-wide text-zinc-200">Flagged Writing Patterns</h3>
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {flaggedPatterns.map((pattern, i) => {
          const style = severityStyles[pattern.severity] || severityStyles.low;
          const hasHighlight = findMatchingHighlightIndex(pattern.examples) !== null;

          return (
            <div
              key={i}
              onClick={() => handleCardClick(pattern)}
              className={`border rounded-xl p-4 transition-all ${
                hasHighlight 
                  ? 'cursor-pointer hover:border-zinc-700 bg-zinc-950/20 active:scale-[0.99]' 
                  : 'bg-zinc-950/10'
              }`}
              data-testid="flagged-pattern-card"
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className={`h-4 w-4 shrink-0 ${style.split(' ')[0]}`} />
                  <span className="font-display font-medium text-xs text-zinc-200">{pattern.name}</span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <span className={`text-[8px] font-mono tracking-widest font-bold uppercase px-2 py-0.5 rounded border ${style}`}>
                    {pattern.severity}
                  </span>
                  {hasHighlight && (
                    <ChevronRight className="h-3 w-3 text-zinc-600 group-hover:text-zinc-400" />
                  )}
                </div>
              </div>

              {/* Strategy/Why it matters */}
              <p className="text-[11px] text-zinc-400 font-body leading-relaxed mb-3">
                {pattern.why_it_matters}
              </p>

              {/* Examples */}
              {pattern.examples && pattern.examples.length > 0 && (
                <div className="flex flex-col gap-1.5 bg-zinc-950/60 rounded-lg p-3 border border-zinc-900">
                  <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-semibold">Examples Found:</span>
                  {pattern.examples.map((ex, exIdx) => (
                    <div key={exIdx} className="flex items-start gap-1.5 text-[11px] text-zinc-300 font-mono">
                      <CornerDownRight className="h-3.5 w-3.5 text-zinc-600 shrink-0 mt-0.5" />
                      <span className="italic">"{ex}"</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default FlaggedPatterns;
