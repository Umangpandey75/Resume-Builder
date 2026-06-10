/**
 * Generates a mock resume audit analysis dynamically matching the user's uploaded PDF lines.
 * This enables the user to fully test the visual highlight overlays, suggestion cards, 
 * and export functions even if they have an API key quota block.
 * 
 * @param {Array<{text: string}>} pdfLines Sorted list of text lines extracted from the resume
 * @param {string} resumeText Full plain text of the resume
 * @returns {Object} Strict JSON analysis object
 */
export function generateMockAnalysis(pdfLines = [], resumeText = '') {
  // Grab a few lines from the actual resume to make the highlights interactive on their own PDF!
  const defaultLine1 = "Architected enterprise systems with synergistic paradigms";
  const defaultLine2 = "Spearheaded digital transformation using cutting edge technologies";
  const defaultLine3 = "Leveraged state-of-the-art frameworks to optimize performance metrics";

  const line1 = pdfLines[Math.min(2, pdfLines.length - 1)]?.text || defaultLine1;
  const line2 = pdfLines[Math.min(Math.floor(pdfLines.length / 2), pdfLines.length - 1)]?.text || defaultLine2;
  const line3 = pdfLines[Math.min(pdfLines.length - 3, pdfLines.length - 1)]?.text || defaultLine3;

  return {
    ats_score_before: 74,
    ats_score_after: 92,
    authenticity_score: 42,
    verdict_summary: "A heavily polished, buzzword-dense resume that relies on AI-typical verbs and abstract ecosystem claims rather than implementation-level metrics.",
    dimension_scores: {
      buzzword_density: 85,
      specificity: 30,
      seniority_realism: 45,
      technical_depth: 50,
      semantic_redundancy: 75,
      style_entropy: 35,
      verifiability: 20,
      ats_manipulation: 80
    },
    ai_detected_lines: [
      { 
        text: line1, 
        severity: "high",
        pattern: "buzzword" 
      },
      { 
        text: line2, 
        severity: "medium",
        pattern: "vague_impact" 
      },
      { 
        text: line3, 
        severity: "low",
        pattern: "uniform_rhythm" 
      }
    ],
    flagged_patterns: [
      { 
        name: "Abstract Fluff Verbs", 
        category: "buzzword", 
        severity: "high",
        examples: [line1], 
        why_it_matters: "Expert recruiters instantly spot AI signatures like 'spearheading synergistic ecosystems' and discard them as bloated fluff." 
      },
      { 
        name: "Vague Metroless Claims", 
        category: "vague_impact", 
        severity: "medium",
        examples: [line2], 
        why_it_matters: "Claiming digital transformation without percentages, dollars, or engineering dimensions feels fabricated." 
      },
      { 
        name: "Uniform Rhythm (AI Cadence)", 
        category: "uniform_rhythm", 
        severity: "low",
        examples: [line3], 
        why_it_matters: "Sentences of identical lengths starting with repetitive action verbs signal ChatGPT-generated copy." 
      }
    ],
    experience_realism: {
      stated_yoe: 3,
      implied_seniority: "principal",
      mismatch_severity: "moderate",
      evidence: [
        "Stated experience is 3 years, but resume claims 'Principal Architect' leading multi-national operations.",
        "Abstract vocabulary doesn't match implementation tooling expected at a Principal level."
      ]
    },
    unverifiable_claims: [
      { 
        claim: line2, 
        probing_questions: [
          "What specific tooling did you use to manage this transformation?",
          "Can you detail the architectural tradeoffs you encountered during this process?",
          "What concrete team sizing and budgets were you responsible for?"
        ] 
      }
    ],
    ats_missing_keywords: ["TypeScript", "Jest", "Core Web Vitals", "WebSockets", "Zustand", "Performance Optimization"],
    suggestions: [
      { 
        original: line1,
        improved: "Refactored React state architecture using Zustand, reducing bundle load times by 180ms.",
        reason: "Replaces vague buzzwords with concrete tool names and specific performance metrics.",
        impact_points: 8,
        priority: "required" 
      },
      { 
        original: line2,
        improved: "Designed and built the analytics dashboard in TypeScript, scaling traffic to 50k MAUs.",
        reason: "Adds quantification and language specifics to make the claim verifiable.",
        impact_points: 6,
        priority: "required" 
      },
      { 
        original: line3,
        improved: "Optimized Core Web Vitals, reducing LCP by 24% and CLS to 0.05.",
        reason: "Replaces generic state-of-the-art phrases with standard web metrics.",
        impact_points: 4,
        priority: "optional" 
      }
    ],
    hr_perspective: {
      verdict: "maybe",
      first_impression: "Inflated titles. High buzzword frequency masking standard frontend experience.",
      reasoning: "The candidate lists principal-level responsibilities but has only 3 years of professional experience. However, the tech stack alignment is reasonable. If they can pass a technical screen regarding Zustand/TypeScript tradeoffs, they may be a fit.",
      strengths: ["Strong keyword alignment with React & state management", "Quantifiable metrics in select secondary sections"],
      red_flags: ["Severe title inflation vs years of experience", "High density of AI writing markers (e.g. synergistic paradigms)"]
    }
  };
}
