import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
  } catch (e) {
    console.warn('Could not set PDF worker from CDN, fallback enabled', e);
  }
}

export interface ExtractionResult {
  success: boolean;
  rawText: string;
  totalPages: number;
  questions: string[];
  errorMessage?: string;
  skippedHeadersFooters?: number;
}

/**
 * Regex patterns matching various question prefixes:
 * - 1. or 1) or 1:
 * - Q1. or Q1) or Q.1 or Q. 1 or Q-1
 * - Question 1: or Question 1. or Question No. 1 or Question No: 1
 * - Case insensitive
 */
const QUESTION_START_REGEX = /^(?:(?:Q(?:uestion)?(?:\s*No\.?|\s*Number)?[\s.:\-)#]*\d+|Q\d+[\s.:\-)]*|\d+[\s.:\-)])\s*)/i;

/**
 * Global pattern matching start of question at line beginning or after newline
 */
const QUESTION_SPLIT_REGEX = /(?:^|\n)(?=(?:(?:Q(?:uestion)?(?:\s*No\.?|\s*Number)?[\s.:\-)#]*\d+|Q\d+[\s.:\-)]*|\d+[\s.:\-)])\s+))/i;

/**
 * Page number and header/footer cleanup patterns
 */
const PAGE_NUMBER_REGEX = /^(?:Page\s*\d+(?:\s*(?:of|\/)\s*\d+)?|\d+\s*(?:\/|of)\s*\d+|[-—–]\s*\d+\s*[-—–]|\d+)$/i;
const COMMON_HEADER_REGEX = /^(?:Question Bank|Department of|Unit\s*[-—–:]?\s*\d+|Semester\s*[-—–:]?\s*[IVXLCDM\d]+|Internal Assessment|Course Code|Subject Code|Confidential|Page\s*\d+)/i;

/**
 * Cleans lines and removes headers/footers
 */
function cleanTextLines(raw: string): { cleanedText: string; skippedCount: number } {
  const lines = raw.split(/\r?\n/);
  const cleaned: string[] = [];
  let skipped = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      cleaned.push('');
      continue;
    }

    // Check if line is purely a page number or isolated single short integer (like "1" on its own line)
    if (PAGE_NUMBER_REGEX.test(trimmed)) {
      skipped++;
      continue;
    }

    // Check if line is a common repeating header/footer marker
    if (COMMON_HEADER_REGEX.test(trimmed) && !QUESTION_START_REGEX.test(trimmed)) {
      skipped++;
      continue;
    }

    cleaned.push(trimmed);
  }

  return {
    cleanedText: cleaned.join('\n'),
    skippedCount: skipped,
  };
}

/**
 * Split text into individual questions by question markers
 */
export function splitTextIntoQuestions(rawText: string): string[] {
  if (!rawText || !rawText.trim()) return [];

  const { cleanedText } = cleanTextLines(rawText);

  // Split by the question prefix boundary
  const rawChunks = cleanedText.split(QUESTION_SPLIT_REGEX);
  const detectedQuestions: string[] = [];

  for (let chunk of rawChunks) {
    chunk = chunk.trim();
    if (!chunk) continue;

    // Check if chunk starts with question marker or contains a question
    if (QUESTION_START_REGEX.test(chunk)) {
      // Clean leading numbering marker to preserve question body cleanly, or keep standard format
      // Replace multi-line linebreaks inside question with a single space to make it continuous
      const normalized = chunk
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(Boolean)
        .join(' ');

      // Remove the leading question label (e.g. "1. ", "Q1. ", "Question 1: ")
      const stripped = normalized.replace(QUESTION_START_REGEX, '').trim();

      if (stripped.length >= 3) {
        detectedQuestions.push(stripped);
      }
    } else if (chunk.length > 10 && !chunk.toLowerCase().startsWith('instructions') && !chunk.toLowerCase().startsWith('section')) {
      // If first chunk was before any question number, check if it's an unnumbered single question
      // Only keep if it looks like a question
      if (detectedQuestions.length === 0 && chunk.length > 5) {
        // Unnumbered question item
        const normalized = chunk
          .split(/\r?\n/)
          .map(l => l.trim())
          .filter(Boolean)
          .join(' ');
        detectedQuestions.push(normalized);
      }
    }
  }

  // If regex split produced 0 or 1 question but there are multiple numbered lines
  if (detectedQuestions.length <= 1) {
    const lines = cleanedText.split(/\r?\n/);
    const lineQuestions: string[] = [];
    let currentQ = '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (QUESTION_START_REGEX.test(trimmed)) {
        if (currentQ) {
          const stripped = currentQ.replace(QUESTION_START_REGEX, '').trim();
          if (stripped) lineQuestions.push(stripped);
        }
        currentQ = trimmed;
      } else {
        if (currentQ) {
          currentQ += ' ' + trimmed;
        } else if (trimmed.length > 5 && !trimmed.toLowerCase().includes('question bank')) {
          currentQ = trimmed;
        }
      }
    }

    if (currentQ) {
      const stripped = currentQ.replace(QUESTION_START_REGEX, '').trim();
      if (stripped) lineQuestions.push(stripped);
    }

    if (lineQuestions.length > detectedQuestions.length) {
      return lineQuestions;
    }
  }

  return detectedQuestions;
}

/**
 * Extracts questions from an uploaded PDF File
 */
export async function extractQuestionsFromPDF(file: File): Promise<ExtractionResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useWorkerFetch: false,
      isEvalSupported: false,
    });

    const pdf = await loadingTask.promise;
    const totalPages = pdf.numPages;
    let fullText = '';

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Reconstruct text preserving layout & line returns
      let lastY: number | null = null;
      let pageText = '';

      for (const item of textContent.items) {
        if ('str' in item) {
          const str = item.str;
          const transform = (item as any).transform;
          const currentY = transform ? transform[5] : null;

          if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 8) {
            pageText += '\n';
          } else if (pageText.length > 0 && !pageText.endsWith('\n') && !pageText.endsWith(' ')) {
            pageText += ' ';
          }

          pageText += str;
          if (currentY !== null) {
            lastY = currentY;
          }
        }
      }

      fullText += pageText + '\n\n';
    }

    const { cleanedText, skippedCount } = cleanTextLines(fullText);
    const questions = splitTextIntoQuestions(cleanedText);

    // If PDF yielded no selectable text or no questions
    if (!cleanedText.trim()) {
      return {
        success: false,
        rawText: '',
        totalPages,
        questions: [],
        errorMessage: 'The PDF contains no selectable text (it may be a scanned image). Please make sure the PDF has readable text or use "Paste Text".',
      };
    }

    if (questions.length === 0) {
      return {
        success: false,
        rawText: cleanedText,
        totalPages,
        questions: [],
        errorMessage: 'Could not detect numbered questions (e.g. 1., Q1., Question 1). Please use "Paste Text" or format with question numbers.',
      };
    }

    return {
      success: true,
      rawText: cleanedText,
      totalPages,
      questions,
      skippedHeadersFooters: skippedCount,
    };
  } catch (err: any) {
    console.error('Error extracting PDF:', err);
    return {
      success: false,
      rawText: '',
      totalPages: 0,
      questions: [],
      errorMessage: err?.message || 'Failed to read PDF file. Please ensure it is a valid PDF document.',
    };
  }
}
