import { jsPDF } from 'jspdf';

/**
 * Generates and downloads a clean, professional ATS Audit Report PDF.
 * 
 * @param {string} fileName The original resume file name
 * @param {Object} result The LLM strict JSON analysis result
 */
export function exportReportPdf(fileName, result) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  let y = 20;

  // Helper to verify and append pages
  function checkPageOverflow(estimatedHeight) {
    if (y + estimatedHeight > pageHeight - margin) {
      pdf.addPage();
      y = 20;
      // Draw small page header on subsequent pages
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Resume ATS Audit Report — ${fileName}`, margin, 12);
      pdf.line(margin, 14, pageWidth - margin, 14);
      pdf.setTextColor(0, 0, 0);
      y = 20;
    }
  }

  // Draw decorative top bar
  pdf.setFillColor(245, 158, 11); // Amber accent color
  pdf.rect(0, 0, pageWidth, 5, 'F');

  // Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.text('RESUME ATS AUDIT REPORT', margin, y);
  y += 8;

  // Metadata
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Document: ${fileName}`, margin, y);
  pdf.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth - margin - 70, y);
  y += 5;

  pdf.setDrawColor(220, 220, 220);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Scores Section
  checkPageOverflow(30);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(30, 30, 30);
  pdf.text('OVERALL METRICS', margin, y);
  y += 8;

  // Draw metrics columns
  pdf.setFontSize(11);
  pdf.setTextColor(60, 60, 60);

  // Score Before
  pdf.text('ATS Score (Before):', margin, y);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(239, 68, 68); // Red
  pdf.text(`${result.ats_score_before} / 100`, margin + 45, y);

  // Score After
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(60, 60, 60);
  pdf.text('ATS Score (After):', margin + 85, y);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(16, 185, 129); // Emerald
  pdf.text(`${result.ats_score_after} / 100 (+${result.ats_score_after - result.ats_score_before} pts)`, margin + 125, y);
  y += 6;

  // Authenticity Score
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(60, 60, 60);
  pdf.text('Authenticity Score:', margin, y);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(245, 158, 11); // Amber
  pdf.text(`${result.authenticity_score} / 100`, margin + 45, y);

  // Verdict Summary
  y += 10;
  checkPageOverflow(15);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(30, 30, 30);
  pdf.text('Recruiter Verdict Summary:', margin, y);
  y += 5;
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(10);
  pdf.setTextColor(80, 80, 80);
  const verdictText = pdf.splitTextToSize(result.verdict_summary || '', contentWidth);
  pdf.text(verdictText, margin, y);
  y += (verdictText.length * 4) + 6;

  // HR Perspective Section
  if (result.hr_perspective) {
    checkPageOverflow(40);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(30, 30, 30);
    pdf.text('RECRUITER PERSPECTIVE', margin, y);
    y += 8;

    pdf.setFontSize(11);
    pdf.text('Verdict Recommendation:', margin, y);
    const hrVerdict = (result.hr_perspective.verdict || 'maybe').replace('_', ' ').toUpperCase();
    pdf.setFont('helvetica', 'bold');
    if (result.hr_perspective.verdict === 'strong_yes' || result.hr_perspective.verdict === 'yes') {
      pdf.setTextColor(16, 185, 129);
    } else if (result.hr_perspective.verdict === 'no') {
      pdf.setTextColor(239, 68, 68);
    } else {
      pdf.setTextColor(245, 158, 11);
    }
    pdf.text(hrVerdict, margin + 50, y);
    y += 6;

    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 30, 30);
    pdf.text('First Impression:', margin, y);
    y += 5;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(60, 60, 60);
    const firstImp = pdf.splitTextToSize(result.hr_perspective.first_impression || '', contentWidth);
    pdf.text(firstImp, margin, y);
    y += (firstImp.length * 4.5) + 5;

    checkPageOverflow(30);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 30, 30);
    pdf.text('Analysis & Reasoning:', margin, y);
    y += 5;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(60, 60, 60);
    const reasoning = pdf.splitTextToSize(result.hr_perspective.reasoning || '', contentWidth);
    pdf.text(reasoning, margin, y);
    y += (reasoning.length * 4.5) + 8;

    // Strengths & Red Flags (side-by-side or stacked)
    checkPageOverflow(40);
    const strengths = result.hr_perspective.strengths || [];
    const redFlags = result.hr_perspective.red_flags || [];

    if (strengths.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(16, 185, 129);
      pdf.text('Key Strengths Spotted:', margin, y);
      y += 5;
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(60, 60, 60);
      strengths.forEach(str => {
        checkPageOverflow(8);
        const itemText = pdf.splitTextToSize(`• ${str}`, contentWidth);
        pdf.text(itemText, margin, y);
        y += (itemText.length * 4.5);
      });
      y += 3;
    }

    if (redFlags.length > 0) {
      checkPageOverflow(15);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(239, 68, 68);
      pdf.text('Recruiter Concerns / Red Flags:', margin, y);
      y += 5;
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(60, 60, 60);
      redFlags.forEach(flag => {
        checkPageOverflow(8);
        const itemText = pdf.splitTextToSize(`• ${flag}`, contentWidth);
        pdf.text(itemText, margin, y);
        y += (itemText.length * 4.5);
      });
      y += 5;
    }
  }

  // Missing Keywords
  if (result.ats_missing_keywords && result.ats_missing_keywords.length > 0) {
    checkPageOverflow(25);
    y += 3;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(30, 30, 30);
    pdf.text('MISSING ATS KEYWORDS', margin, y);
    y += 8;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    const keywordsText = pdf.splitTextToSize(result.ats_missing_keywords.join(', '), contentWidth);
    pdf.text(keywordsText, margin, y);
    y += (keywordsText.length * 4.5) + 8;
  }

  // Suggestions Rewrites
  if (result.suggestions && result.suggestions.length > 0) {
    checkPageOverflow(30);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(30, 30, 30);
    pdf.text('LINE-BY-LINE SUGGESTED REWRITES', margin, y);
    y += 8;

    // Split required and optional
    const requiredSugs = result.suggestions.filter(s => s.priority === 'required');
    const optionalSugs = result.suggestions.filter(s => s.priority !== 'required');

    const renderSuggestion = (sug, index) => {
      checkPageOverflow(45);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(30, 30, 30);
      
      const priorityLabel = sug.priority === 'required' ? 'REQUIRED' : 'OPTIONAL';
      pdf.text(`Rewrite #${index + 1} (${priorityLabel}) — Impact: +${sug.impact_points} pts`, margin, y);
      y += 5;

      // Original
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(180, 50, 50);
      pdf.text('Original:', margin, y);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(120, 60, 60);
      const originalText = pdf.splitTextToSize(sug.original, contentWidth - 20);
      pdf.text(originalText, margin + 18, y);
      y += (originalText.length * 4) + 2;

      // Improved
      checkPageOverflow(15);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(50, 150, 50);
      pdf.text('Improved:', margin, y);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(40, 100, 40);
      const improvedText = pdf.splitTextToSize(sug.improved, contentWidth - 20);
      pdf.text(improvedText, margin + 18, y);
      y += (improvedText.length * 4) + 2;

      // Reason
      checkPageOverflow(12);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(100, 100, 100);
      const reasonText = pdf.splitTextToSize(`Reason: ${sug.reason}`, contentWidth);
      pdf.text(reasonText, margin, y);
      y += (reasonText.length * 4) + 6;
    };

    if (requiredSugs.length > 0) {
      checkPageOverflow(15);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(245, 158, 11);
      pdf.text('REQUIRED ACTION ITEMS:', margin, y);
      y += 6;
      requiredSugs.forEach((sug, i) => renderSuggestion(sug, i));
    }

    if (optionalSugs.length > 0) {
      checkPageOverflow(15);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(120, 120, 120);
      pdf.text('OPTIONAL POLISH ITEMS:', margin, y);
      y += 6;
      optionalSugs.forEach((sug, i) => renderSuggestion(sug, i + requiredSugs.length));
    }
  }

  // Footer / Disclaimer
  checkPageOverflow(20);
  y += 5;
  pdf.setDrawColor(220, 220, 220);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 5;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(140, 140, 140);
  const disclaimerText = pdf.splitTextToSize('Disclaimer: This report was generated locally in the browser by an AI analysis engine based on user-provided keys. No data was uploaded to outside servers. Verify numbers and tool names independently before final resume submission.', contentWidth);
  pdf.text(disclaimerText, margin, y);

  // Save the PDF
  const outputFileName = `${fileName.replace(/\.[^/.]+$/, "")}_ATS_Audit_Report.pdf`;
  pdf.save(outputFileName);
}
