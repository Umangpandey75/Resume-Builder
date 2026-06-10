import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Trash2, ArrowRight, Download, RefreshCw, FileText, CheckCircle2, ChevronRight } from 'lucide-react';
import { parsePdfLocally } from '../lib/pdfUtils';
import { analyzeResume } from '../lib/llm';
import { saveHistoryEntry } from '../lib/history';
import { exportReportPdf } from '../lib/pdf';
import { generateMockAnalysis } from '../lib/mockData';
import PdfUploader from './PdfUploader';
import PdfHighlightViewer from './PdfHighlightViewer';
import AtsScoreRing from './AtsScoreRing';
import HrPerspective from './HrPerspective';
import AuthenticityPanel from './AuthenticityPanel';
import ExperienceRealism from './ExperienceRealism';
import FlaggedPatterns from './FlaggedPatterns';
import SuggestionCard from './SuggestionCard';
import Accordion from './ui/Accordion';
import Button from './ui/Button';
import Textarea from './ui/Textarea';

const SAMPLE_JD = `Role: Senior Frontend Engineer
Requirements:
- 5+ years of experience building responsive, highly interactive web applications using React, JavaScript, and TypeScript.
- Strong proficiency in modern styling tools like Tailwind CSS, PostCSS, or styled-components.
- Proven experience optimizing frontend performance, core web vitals, bundle size optimization, and lazy loading.
- Experience writing clean, robust unit and integration tests (Jest, React Testing Library).
- Collaboration with backend engineers to integrate RESTful APIs and WebSocket architectures.
- Experience with client-side state management (Redux, Zustand, React Context).
- Understanding of SEO best practices, semantic HTML5, and accessible UI designs (WCAG, ARIA).
- Prior experience with canvas rendering, PDF processing, or data visualization library elements is a major plus!`;

export function Analyzer({ provider, showHistoryDrawerTrigger, onToastMessage }) {
  // Input states
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  
  // BYOK sync states
  const [apiKeyPresent, setApiKeyPresent] = useState(false);

  // Status states
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  // Analysis result states
  const [result, setResult] = useState(null);
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(null);

  const resultsRef = useRef(null);

  // Check key availability on load & on local events
  const checkApiKey = () => {
    const key = sessionStorage.getItem('byok_llm_key');
    setApiKeyPresent(!!key);
  };

  useEffect(() => {
    checkApiKey();
    window.addEventListener('sessionStorageChange', checkApiKey);
    return () => window.removeEventListener('sessionStorageChange', checkApiKey);
  }, []);

  // Keyboard shortcut listener inside the JD textarea
  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      if (canAnalyze) {
        handleRunAnalysis();
      }
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Process selected file
  const handleFileParsed = async (selectedFile) => {
    setFile(selectedFile);
    setIsParsing(true);
    setParseProgress(0);
    setError(null);
    setResult(null);

    try {
      const parsed = await parsePdfLocally(selectedFile, (progress) => {
        setParseProgress(progress);
      });
      setPages(parsed.pages);
      setResumeText(parsed.fullText);
      if (onToastMessage) {
        onToastMessage('success', 'Resume parsed locally successfully!');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to extract text from PDF locally. Try a standard PDF file.');
      setFile(null);
      if (onToastMessage) {
        onToastMessage('error', 'Failed to parse PDF.');
      }
    } finally {
      setIsParsing(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPages([]);
    setResumeText('');
    setJobDescription('');
    setResult(null);
    setError(null);
    setActiveSuggestionIdx(null);
    if (onToastMessage) {
      onToastMessage('success', 'Workspace cleared.');
    }
  };

  const handleLoadSampleJd = () => {
    setJobDescription(SAMPLE_JD);
    if (onToastMessage) {
      onToastMessage('success', 'Sample Senior Frontend Engineer JD loaded.');
    }
  };

  const handleRunAnalysis = async () => {
    const apiKey = sessionStorage.getItem('byok_llm_key');
    const selectedProvider = sessionStorage.getItem('byok_provider') || 'gemini';

    if (!apiKey) {
      setError('Please add your API key in the header first.');
      if (onToastMessage) onToastMessage('error', 'Missing API key.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setActiveSuggestionIdx(null);

    try {
      let responseJson;
      if (apiKey === 'DEMO_MODE_ACTIVE') {
        const allLines = pages.flatMap(p => p.lines || []);
        responseJson = generateMockAnalysis(allLines, resumeText);
        await new Promise(resolve => setTimeout(resolve, 1500));
      } else {
        // Direct browser HTTPS request to Gemini or OpenAI
        responseJson = await analyzeResume({
          provider: selectedProvider,
          apiKey,
          resume: resumeText,
          jobDescription
        });
      }

      setResult(responseJson);

      if (onToastMessage) {
        onToastMessage('success', 'Analysis complete! Saving to database...');
      }

      // Auto-save analysis history to full-stack MongoDB database
      try {
        const fileBlob = await fileToBase64(file);
        await saveHistoryEntry({
          fileName: file.name,
          fileBlob,
          resumeText,
          jobDescription,
          result: responseJson
        });
        if (onToastMessage) {
          onToastMessage('success', 'Record saved to history.');
        }
      } catch (saveErr) {
        console.error('History save failed:', saveErr);
        // Do not fail the client presentation if only history storage fails
        if (onToastMessage) {
          onToastMessage('info', 'Analysis loaded, but failed to sync history to backend.');
        }
      }

      // Auto-scroll to results block
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);

    } catch (err) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred during LLM analysis.');
      if (onToastMessage) {
        onToastMessage('error', err.message || 'Analysis failed.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reload an entry selected from History drawer
  const handleLoadHistoryEntry = (entryData) => {
    setFile(entryData.file);
    // Trigger parsing locally to re-draw canvas and calculate bounding boxes
    handleFileParsed(entryData.file);
    setResumeText(entryData.resumeText);
    setJobDescription(entryData.jobDescription);
    setResult(entryData.result);
    setError(null);
    setActiveSuggestionIdx(null);
    
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 800); // Allow brief moment to re-render pages
  };

  // Expose load handler to header/parent if needed
  useEffect(() => {
    if (showHistoryDrawerTrigger) {
      showHistoryDrawerTrigger.current = handleLoadHistoryEntry;
    }
  }, [showHistoryDrawerTrigger, pages]);

  const canAnalyze = apiKeyPresent && file && !isParsing && resumeText && jobDescription.trim().length > 0 && !isAnalyzing;

  const atsDelta = result ? (result.ats_score_after - result.ats_score_before) : 0;
  const isSubmitReady = result && result.ats_score_before >= 88;

  // Split suggestion priorities
  const requiredSuggestions = result?.suggestions?.filter(s => s.priority === 'required') || [];
  const optionalSuggestions = result?.suggestions?.filter(s => s.priority === 'optional') || [];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-10">
      
      {/* Hero Section */}
      <section className="text-center flex flex-col items-center gap-4 py-6">
        <div className="flex gap-2 animate-fade-up">
          <span className="text-[9px] font-mono tracking-widest font-bold uppercase text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
            [ LOCAL-FIRST · BYOK ]
          </span>
          <span className="text-[9px] font-mono tracking-widest font-bold uppercase text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
            [ PRIVACY FIRST ]
          </span>
        </div>
        
        <h2 className="text-3xl md:text-5xl font-display font-bold text-zinc-100 tracking-tight leading-none mt-2 max-w-2xl animate-fade-up">
          Resume <span className="anim-gradient-text">Intelligence</span> for the ATS era.
        </h2>
        
        <p className="text-xs md:text-sm text-zinc-400 font-body max-w-lg mt-1 leading-relaxed animate-fade-up">
          Audit your resume for AI signature styles, seniority inflation, and keywords locally. Connect your own API key to bypass expensive paywalls.
        </p>

        {/* 4-Cell Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mt-6">
          <div className="border border-zinc-900 bg-zinc-950/40 rounded-xl p-4 flex flex-col items-center text-center anim-float">
            <span className="text-lg font-display font-bold text-amber-500">8</span>
            <span className="text-[8px] font-mono tracking-widest text-zinc-500 uppercase mt-1">Audit Dimensions</span>
          </div>
          <div className="border border-zinc-900 bg-zinc-950/40 rounded-xl p-4 flex flex-col items-center text-center anim-float-delayed-1">
            <span className="text-lg font-display font-bold text-emerald-500">0</span>
            <span className="text-[8px] font-mono tracking-widest text-zinc-500 uppercase mt-1">External Servers</span>
          </div>
          <div className="border border-zinc-900 bg-zinc-950/40 rounded-xl p-4 flex flex-col items-center text-center anim-float-delayed-2">
            <span className="text-lg font-display font-bold text-zinc-200">100%</span>
            <span className="text-[8px] font-mono tracking-widest text-zinc-500 uppercase mt-1">BYOK Control</span>
          </div>
          <div className="border border-zinc-900 bg-zinc-950/40 rounded-xl p-4 flex flex-col items-center text-center anim-float">
            <span className="text-lg font-display font-bold text-amber-500">85+</span>
            <span className="text-[8px] font-mono tracking-widest text-zinc-500 uppercase mt-1">Target ATS Score</span>
          </div>
        </div>
      </section>

      {/* Input Workspace */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Input: PDF Uploader */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold">Step 1: Upload Resume</label>
            {resumeText && (
              <span className="text-[9px] font-mono text-emerald-400 font-semibold">Parsed successfully</span>
            )}
          </div>
          
          <PdfUploader 
            onFileParsed={handleFileParsed}
            isParsing={isParsing}
            parseProgress={parseProgress}
            onClearFile={handleClear}
            parsedFile={file}
          />

          {resumeText && (
            <div className="border border-zinc-900 bg-zinc-950/10 rounded-xl p-4 flex flex-col gap-2">
              <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-semibold">Extracted Plaintext Snippet</span>
              <p className="text-[10px] text-zinc-400 font-mono line-clamp-4 leading-relaxed bg-zinc-950 p-2.5 rounded border border-zinc-900">
                {resumeText}
              </p>
            </div>
          )}
        </div>

        {/* Right Input: Job Description Textarea */}
        <div className="flex flex-col gap-3 h-full">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold">Step 2: Job Description</label>
            <button
              onClick={handleLoadSampleJd}
              className="text-[9px] font-mono tracking-wider font-semibold text-amber-500 hover:text-amber-400 transition-colors uppercase border border-amber-500/10 px-2 py-1 rounded bg-amber-500/5 active:scale-[0.98]"
            >
              Load Sample JD
            </button>
          </div>

          <div className="relative">
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste the target job description details here..."
              className="h-40 min-h-[160px]"
              data-testid="job-description-input"
            />
            <div className="absolute right-3 bottom-3 text-[9px] font-mono text-zinc-600">
              Ctrl+Enter to Run
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 mt-2">
            <Button
              variant="primary"
              size="lg"
              disabled={!canAnalyze}
              shimmer={canAnalyze}
              onClick={handleRunAnalysis}
              className="flex-1 font-semibold text-xs tracking-widest uppercase h-11"
              data-testid="run-analysis-btn"
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-black" />
                  Auditing Resume...
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  Run ATS analysis <ArrowRight className="h-4 w-4 text-black" />
                </span>
              )}
            </Button>
            
            {(file || jobDescription) && (
              <Button
                variant="secondary"
                size="lg"
                onClick={handleClear}
                className="h-11 px-4 text-xs font-semibold tracking-wider uppercase border border-zinc-800"
                data-testid="clear-workspace-btn"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Tracing Beam Progress Screen */}
      {isAnalyzing && (
        <section className="border border-zinc-900 bg-zinc-950/40 rounded-xl p-8 flex flex-col items-center justify-center gap-4 text-center mt-4">
          <div className="w-full max-w-md h-1 bg-zinc-900 rounded-full tracing-beam" />
          <p className="text-xs font-mono text-amber-500 uppercase tracking-widest animate-pulse-beam">
            Parsing resume · matching keywords · generating rewrites
          </p>
          <p className="text-[10px] text-zinc-600 font-body max-w-sm">
            Contacting {provider === 'gemini' ? 'Google Gemini' : 'OpenAI'} API directly from your browser. This takes roughly 5-15 seconds.
          </p>
        </section>
      )}

      {/* Error Boundary Output */}
      {error && (
        <section className="border border-red-900/30 bg-red-950/10 rounded-xl p-5 flex flex-col gap-2 text-center items-center max-w-2xl mx-auto w-full animate-fade-up">
          <span className="text-[10px] font-mono tracking-widest text-red-500 uppercase font-bold">Audit Operations Interrupted</span>
          <p className="text-xs text-red-400 font-body leading-relaxed">
            {error}
          </p>
        </section>
      )}

      {/* Analysis Results View */}
      {result && !isAnalyzing && (
        <section 
          ref={resultsRef}
          id="results" 
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start scroll-mt-20 border-t border-zinc-900/60 pt-10"
        >
          {/* LEFT COLUMN: PDF Canvas Viewer (~58% width equivalent) */}
          <div className="lg:col-span-7 flex flex-col gap-4 sticky top-24 self-start">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold">Annotated Resume Highlight Map</label>
              <span className="text-[9px] font-mono text-zinc-500 uppercase">
                {pages.length} {pages.length === 1 ? 'Page' : 'Pages'} Loaded
              </span>
            </div>
            
            <PdfHighlightViewer
              pages={pages}
              aiDetectedLines={result.ai_detected_lines}
              activeSuggestionIndex={activeSuggestionIdx}
              suggestions={result.suggestions}
            />
          </div>

          {/* RIGHT COLUMN: Suggestions & Analytics (~42% width equivalent) */}
          <div className="lg:col-span-5 flex flex-col gap-6" data-testid="results-details-panel">
            
            {/* Submit-ready green banner */}
            {isSubmitReady && (
              <div 
                className="border border-emerald-500/25 bg-emerald-950/20 text-emerald-400 rounded-xl p-4 flex items-start gap-3 border-opacity-40 animate-fade-up"
                data-testid="submit-ready-banner"
              >
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed font-body">
                  <p className="font-semibold text-zinc-200">Your resume is already in submit-ready range ({result.ats_score_before}/100).</p>
                  <p className="text-emerald-500/80 mt-1">Below are a couple of high-impact rewrites. Everything else is optional polish — don't feel pressured to chase 100.</p>
                </div>
              </div>
            )}

            {/* Scores & Export Actions Card */}
            <div className="border border-zinc-900 bg-zinc-950/40 rounded-xl p-5 flex flex-col gap-5 animate-fade-up">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <h3 className="font-display text-sm font-semibold tracking-wide text-zinc-200">ATS Audit Scores</h3>
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => exportReportPdf(file?.name || 'resume.pdf', result)}
                  className="text-xs h-8 px-3 border border-zinc-800 hover:border-zinc-700 font-mono uppercase tracking-wider"
                  data-testid="export-pdf-btn"
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Export PDF
                </Button>
              </div>

              {/* Score Rings side-by-side */}
              <div className="flex items-center justify-center gap-10">
                <AtsScoreRing score={result.ats_score_before} label="Before Score" color="#ef4444" />
                <div className="flex flex-col items-center">
                  <div className="inline-flex items-center text-[10px] font-mono font-bold text-emerald-500 bg-emerald-950/20 border border-emerald-500/30 px-2 py-0.5 rounded-full mb-1">
                    +{atsDelta} PTS
                  </div>
                  <ChevronRight className="h-5 w-5 text-zinc-700" />
                </div>
                <AtsScoreRing score={result.ats_score_after} label="After Score" color="#10b981" />
              </div>
            </div>

            {/* Recruiter verdict */}
            <HrPerspective hrPerspective={result.hr_perspective} />

            {/* Authenticity dimensions */}
            <AuthenticityPanel 
              authenticityScore={result.authenticity_score} 
              dimensionScores={result.dimension_scores} 
            />

            {/* Experience seniority check */}
            <ExperienceRealism 
              experienceRealism={result.experience_realism} 
              unverifiableClaims={result.unverifiable_claims} 
            />

            {/* AI Flags */}
            <FlaggedPatterns 
              flaggedPatterns={result.flagged_patterns} 
              aiDetectedLines={result.ai_detected_lines}
              onTriggerHighlight={(idx) => setActiveSuggestionIdx(idx)}
            />

            {/* Missing keywords */}
            {result.ats_missing_keywords && result.ats_missing_keywords.length > 0 && (
              <div className="border border-zinc-900 bg-zinc-950/40 rounded-xl p-5 flex flex-col gap-3 animate-fade-up">
                <div className="border-b border-zinc-900 pb-2">
                  <h3 className="font-display text-sm font-semibold tracking-wide text-zinc-200">Missing ATS Keywords</h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.ats_missing_keywords.map((kw, i) => (
                    <span 
                      key={i} 
                      className="text-[10px] font-mono tracking-wider font-medium text-amber-400 bg-amber-950/25 border border-amber-900/40 px-2 py-1 rounded"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Line-by-line Rewrites Section */}
            <div className="flex flex-col gap-4 animate-fade-up">
              <div className="border-b border-zinc-900 pb-2">
                <h3 className="font-display text-sm font-semibold tracking-wide text-zinc-200">Suggested Bullet Rewrites</h3>
              </div>

              {/* Required Rewrites Column */}
              {requiredSuggestions.length > 0 && (
                <div className="flex flex-col gap-3">
                  <span className="text-[9px] font-mono tracking-widest text-amber-500 uppercase font-semibold">Required Action Items:</span>
                  {requiredSuggestions.map((sug, i) => (
                    <SuggestionCard
                      key={i}
                      suggestion={sug}
                      index={i}
                      isActive={activeSuggestionIdx === result.suggestions.indexOf(sug)}
                      onClick={() => setActiveSuggestionIdx(result.suggestions.indexOf(sug))}
                    />
                  ))}
                </div>
              )}

              {/* Optional Suggestions details accordion */}
              {optionalSuggestions.length > 0 && (
                <div className="flex flex-col gap-2">
                  <Accordion title={`Optional Polish — Not Required (${optionalSuggestions.length} items)`}>
                    <div className="flex flex-col gap-3">
                      {optionalSuggestions.map((sug, i) => (
                        <SuggestionCard
                          key={i}
                          suggestion={sug}
                          index={requiredSuggestions.length + i}
                          isActive={activeSuggestionIdx === result.suggestions.indexOf(sug)}
                          onClick={() => setActiveSuggestionIdx(result.suggestions.indexOf(sug))}
                        />
                      ))}
                    </div>
                  </Accordion>
                </div>
              )}
            </div>

          </div>
        </section>
      )}

    </div>
  );
}
export default Analyzer;
