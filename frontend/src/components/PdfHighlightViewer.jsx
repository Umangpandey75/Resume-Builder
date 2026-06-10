import React, { useEffect, useRef } from 'react';
import { ShieldAlert, AlertTriangle, Info } from 'lucide-react';
import { Tooltip } from './ui/Tooltip';

export function PdfHighlightViewer({ pages, aiDetectedLines, activeSuggestionIndex, suggestions }) {
  const containerRef = useRef(null);

  // Normalize and tokenize text for fuzzy token-overlap matching
  const tokenize = (text) => {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);
  };

  const calculateOverlap = (textA, textB) => {
    const tokensA = tokenize(textA);
    const tokensB = tokenize(textB);
    if (tokensA.length === 0 || tokensB.length === 0) return 0;

    let matches = 0;
    const setB = new Set(tokensB);
    tokensA.forEach(token => {
      if (setB.has(token)) matches++;
    });

    // Check overlap ratio against both lengths to handle cases where LLM splits/concatenates lines
    const ratioA = matches / tokensA.length;
    const ratioB = matches / tokensB.length;
    return Math.max(ratioA, ratioB);
  };

  // Find line bounding boxes matching the AI-detected lines
  const matchedHighlights = [];

  if (pages && pages.length > 0 && aiDetectedLines && aiDetectedLines.length > 0) {
    aiDetectedLines.forEach((detectedLine, detectedIndex) => {
      let bestMatch = null;
      let highestOverlap = 0;

      // Scan all pages and lines to find the single best match with overlap >= 75%
      pages.forEach((page, pageIndex) => {
        page.lines.forEach((line, lineIndex) => {
          const overlap = calculateOverlap(line.text, detectedLine.text);
          if (overlap >= 0.75 && overlap > highestOverlap) {
            highestOverlap = overlap;
            bestMatch = {
              pageIndex,
              lineIndex,
              line,
              pageWidth: page.width,
              pageHeight: page.height,
              detectedLine,
              detectedIndex
            };
          }
        });
      });

      if (bestMatch) {
        matchedHighlights.push(bestMatch);
      }
    });
  }

  // Effect to handle scrolling and pulsing when a suggestion card is clicked
  useEffect(() => {
    if (activeSuggestionIndex !== null && suggestions && suggestions[activeSuggestionIndex]) {
      const activeSuggestion = suggestions[activeSuggestionIndex];
      
      // Find the matching highlight based on original line text
      let matchedHighlightIndex = -1;
      let highestOverlap = 0;

      matchedHighlights.forEach((highlight, idx) => {
        const overlap = calculateOverlap(highlight.line.text, activeSuggestion.original);
        if (overlap >= 0.75 && overlap > highestOverlap) {
          highestOverlap = overlap;
          matchedHighlightIndex = idx;
        }
      });

      if (matchedHighlightIndex !== -1) {
        const el = document.getElementById(`highlight-overlay-${matchedHighlightIndex}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Add pulse effect
          el.classList.add('pulse-ring-amber', 'scale-[1.02]');
          const timer = setTimeout(() => {
            el.classList.remove('pulse-ring-amber', 'scale-[1.02]');
          }, 3000);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [activeSuggestionIndex]);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Severity Legend */}
      <div className="flex items-center justify-between border border-zinc-900 bg-zinc-950/40 rounded-xl px-4 py-3">
        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Overlay Legend:</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-red-500/20 border border-red-500/50" />
            <span className="text-[10px] font-mono font-medium text-red-400">High Risk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-amber-500/20 border border-amber-500/50" />
            <span className="text-[10px] font-mono font-medium text-amber-400">Medium Risk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-yellow-500/20 border border-yellow-500/50" />
            <span className="text-[10px] font-mono font-medium text-yellow-400">Low Risk</span>
          </div>
        </div>
      </div>

      {/* Pages Container */}
      <div 
        ref={containerRef}
        className="flex flex-col gap-6 overflow-y-auto no-scrollbar max-h-[85vh] border border-zinc-900 rounded-xl p-4 bg-zinc-950/20"
        data-testid="pdf-highlight-container"
      >
        {pages.map((page, pageIndex) => (
          <div 
            key={pageIndex} 
            className="relative w-full border border-zinc-800 bg-zinc-900 rounded-lg overflow-hidden shadow-2xl"
            style={{ 
              aspectRatio: `${page.width} / ${page.height}`,
            }}
          >
            {/* Rendered PDF Page Image */}
            <img 
              src={page.dataUrl} 
              alt={`Resume Page ${pageIndex + 1}`} 
              className="w-full h-full object-contain pointer-events-none select-none"
            />

            {/* Absolute Highlight Overlays */}
            {matchedHighlights
              .filter(hl => hl.pageIndex === pageIndex)
              .map((hl, hlIdx) => {
                const { line, detectedLine, detectedIndex } = hl;
                const severityColors = {
                  high: 'bg-red-500/25 border-red-500 text-red-500 hover:bg-red-500/35',
                  medium: 'bg-amber-500/25 border-amber-500 text-amber-500 hover:bg-amber-500/35',
                  low: 'bg-yellow-500/20 border-yellow-500 text-yellow-500 hover:bg-yellow-500/30'
                };

                const severityLabels = {
                  high: 'High Severity Audit Alert',
                  medium: 'Medium Severity Audit Alert',
                  low: 'Minor Polish Alert'
                };

                const percentageLeft = (line.left / page.width) * 100;
                const percentageTop = (line.top / page.height) * 100;
                const percentageWidth = (line.width / page.width) * 100;
                const percentageHeight = (line.height / page.height) * 100;

                const globalHighlightIndex = matchedHighlights.indexOf(hl);

                // Build a nice detailed tooltip contents string
                const patternLabel = detectedLine.pattern ? detectedLine.pattern.replace('_', ' ').toUpperCase() : 'AI PATTERN';
                const tooltipText = `[ ${severityLabels[detectedLine.severity]} ]\nPattern: ${patternLabel}\nLine: "${detectedLine.text}"`;

                return (
                  <Tooltip 
                    key={hlIdx} 
                    content={tooltipText}
                    className="z-30"
                  >
                    <div
                      id={`highlight-overlay-${globalHighlightIndex}`}
                      className={`absolute border rounded-[3px] cursor-help mix-blend-normal transition-all duration-300 ${
                        severityColors[detectedLine.severity]
                      }`}
                      style={{
                        left: `${percentageLeft}%`,
                        top: `${percentageTop}%`,
                        width: `${percentageWidth}%`,
                        height: `${percentageHeight}%`,
                      }}
                      data-testid={`highlight-${detectedLine.severity}`}
                    />
                  </Tooltip>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}
export default PdfHighlightViewer;
