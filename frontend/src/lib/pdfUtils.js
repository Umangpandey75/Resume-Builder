import * as pdfjsLib from 'pdfjs-dist';

// Configure pdf.js worker dynamically using the imported pdf.js version from unpkg
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.0.379'}/build/pdf.worker.min.mjs`;

/**
 * Parses a PDF file locally:
 * 1. Renders each page to a high-res canvas (data URL)
 * 2. Extracts text items and groups them into lines with bounding boxes
 * 
 * @param {File} file The PDF file object
 * @param {Function} onProgress Progress callback
 * @returns {Promise<{ pages: Array<{ dataUrl: string, width: number, height: number, lines: Array }> , fullText: string }>}
 */
export async function parsePdfLocally(file, onProgress) {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  
  loadingTask.onProgress = (progressData) => {
    if (progressData.total > 0 && onProgress) {
      const pct = Math.round((progressData.loaded / progressData.total) * 50);
      onProgress(pct); // Load progress goes up to 50%
    }
  };

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const pages = [];
  let fullText = '';

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const scale = 1.5; // High resolution rendering scale
    const viewport = page.getViewport({ scale });

    // 1. Render page to canvas and get data URL
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    // 2. Extract text content with positions
    const textContent = await page.getTextContent();
    const rawItems = textContent.items;

    // Convert items to canvas coordinate system
    const items = rawItems
      .filter(item => item.str.trim() !== '')
      .map(item => {
        // transform matrix: [scaleX, skewX, skewY, scaleY, translateX, translateY]
        const tx = item.transform;
        const fontHeight = Math.abs(tx[3] || tx[0] || 10);
        
        // Convert bottom-left and top-right of text to viewport (canvas) points
        const [x1, y1] = viewport.convertToViewportPoint(tx[4], tx[5]);
        const [x2, y2] = viewport.convertToViewportPoint(tx[4] + item.width, tx[5] + fontHeight);
        
        // Canvas coordinates: origin is top-left, Y is down
        const left = Math.min(x1, x2);
        const top = Math.min(y1, y2);
        const width = Math.abs(x2 - x1);
        const height = Math.abs(y1 - y2);

        return {
          text: item.str,
          left,
          top,
          width,
          height,
          centerY: top + height / 2
        };
      });

    // Group items into lines
    // Standard algorithm: sort items by Y, group items that have overlapping Y bounds or are vertically close
    const groupedLines = [];
    const yThreshold = 8; // Max Y-diff to consider items on the same line

    // Sort items top-to-bottom
    const sortedItems = [...items].sort((a, b) => a.centerY - b.centerY);

    sortedItems.forEach(item => {
      // Find an existing line that matches this item's Y coordinate
      let matchedLine = groupedLines.find(line => {
        const lineAverageY = line.items.reduce((sum, it) => sum + it.centerY, 0) / line.items.length;
        return Math.abs(item.centerY - lineAverageY) < yThreshold;
      });

      if (matchedLine) {
        matchedLine.items.push(item);
      } else {
        groupedLines.push({
          items: [item]
        });
      }
    });

    // Process each grouped line to compute overall bounds and clean text
    const processedLines = groupedLines.map(line => {
      // Sort items within the line from left to right
      line.items.sort((a, b) => a.left - b.left);

      // Concatenate text
      let lineText = '';
      line.items.forEach((it, index) => {
        if (index > 0) {
          // Add space if there is a gap between items
          const prevItem = line.items[index - 1];
          const gap = it.left - (prevItem.left + prevItem.width);
          if (gap > 2) {
            lineText += ' ';
          }
        }
        lineText += it.text;
      });

      // Compute bounding box containing all items on the line
      const left = Math.min(...line.items.map(it => it.left));
      const top = Math.min(...line.items.map(it => it.top));
      const right = Math.max(...line.items.map(it => it.left + it.width));
      const bottom = Math.max(...line.items.map(it => it.top + it.height));

      return {
        text: lineText.trim(),
        left,
        top,
        width: right - left,
        height: bottom - top
      };
    }).filter(line => line.text !== '');

    // Sort final lines from top to bottom
    processedLines.sort((a, b) => a.top - b.top);

    pages.push({
      pageNumber: i,
      dataUrl,
      width: viewport.width,
      height: viewport.height,
      lines: processedLines
    });

    // Accumulate plain text for the LLM
    const pageText = processedLines.map(l => l.text).join('\n');
    fullText += pageText + '\n\n';

    if (onProgress) {
      const pct = 50 + Math.round((i / numPages) * 50);
      onProgress(pct); // Parsing progress covers 50% to 100%
    }
  }

  return {
    pages,
    fullText: fullText.trim()
  };
}
