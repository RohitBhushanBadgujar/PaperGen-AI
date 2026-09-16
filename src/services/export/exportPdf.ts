import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { GeneratedPaper, GeneratedSet, getBloomCode } from '../../types';

export function sanitizeForPdf(text: string): string {
  if (!text) return '';
  let cleaned = text
    .replace(/\u00A0/g, ' ')
    .replace(/[—–]/g, '-')
    .replace(/π/g, 'pi')
    .replace(/±/g, '+/-')
    .replace(/°/g, ' deg')
    .replace(/≤/g, '<=')
    .replace(/≥/g, '>=')
    .replace(/×/g, 'x')
    .replace(/÷/g, '/')
    .replace(/√/g, 'sqrt')
    .replace(/Ω/g, 'Ohm');

  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Collapse accidental single-character spacing (e.g. "D r a w   t h e" -> "Draw the")
  const tokens = cleaned.split(' ');
  const resultTokens: string[] = [];
  let streak: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.length === 1 && /^[a-zA-Z]$/.test(t)) {
      streak.push(t);
    } else {
      if (streak.length >= 3) {
        resultTokens.push(streak.join(''));
      } else {
        resultTokens.push(...streak);
      }
      streak = [];
      resultTokens.push(t);
    }
  }
  if (streak.length >= 3) {
    resultTokens.push(streak.join(''));
  } else {
    resultTokens.push(...streak);
  }

  return resultTokens.join(' ');
}

/**
 * Generates and downloads a high-quality, academic examination PDF for a single set.
 */
export function generatePaperPdfBlob(paper: GeneratedPaper, set: GeneratedSet): Blob {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 18;
  const marginTop = 20;
  const marginBottom = 20;
  const contentWidth = pageWidth - marginX * 2;

  let y = marginTop;

  const checkPageBreak = (spaceNeeded: number) => {
    if (y + spaceNeeded > pageHeight - marginBottom) {
      doc.addPage();
      y = marginTop;
      return true;
    }
    return false;
  };

  // Header
  doc.setFont('times', 'bold');
  doc.setCharSpace(0);
  if (paper.examDetails.collegeName) {
    doc.setFontSize(14);
    const text = sanitizeForPdf(paper.examDetails.collegeName.toUpperCase());
    doc.text(text, pageWidth / 2, y, { align: 'center' });
    y += 6;
  }

  if (paper.examDetails.department) {
    doc.setFont('times', 'normal');
    doc.setFontSize(10.5);
    doc.text(sanitizeForPdf(paper.examDetails.department), pageWidth / 2, y, { align: 'center' });
    y += 5.5;
  }

  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  const examTitle = sanitizeForPdf(`${paper.examDetails.examName || 'SEMESTER EXAMINATION'} — (${set.setName.toUpperCase()})`);
  doc.text(examTitle, pageWidth / 2, y, { align: 'center' });
  y += 5;

  // Horizontal divider
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 5;

  // Metadata block (Subject, Date, Duration, Max Marks)
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setCharSpace(0);
  doc.text('Subject: ', marginX, y, { align: 'left' });
  doc.setFont('times', 'normal');
  const subjStr = sanitizeForPdf(paper.examDetails.subjectName + (paper.examDetails.subjectCode ? ` (${paper.examDetails.subjectCode})` : ''));
  doc.text(subjStr, marginX + 16, y, { align: 'left' });

  doc.setFont('times', 'bold');
  doc.text('Duration: ', pageWidth - marginX - 45, y, { align: 'left' });
  doc.setFont('times', 'normal');
  doc.text(sanitizeForPdf(paper.examDetails.duration || 'N/A'), pageWidth - marginX, y, { align: 'right' });
  y += 5;

  if (paper.examDetails.date) {
    doc.setFont('times', 'bold');
    doc.text('Date: ', marginX, y, { align: 'left' });
    doc.setFont('times', 'normal');
    doc.text(sanitizeForPdf(paper.examDetails.date), marginX + 16, y, { align: 'left' });
  }

  doc.setFont('times', 'bold');
  doc.text('Max Marks: ', pageWidth - marginX - 45, y, { align: 'left' });
  doc.setFont('times', 'bold');
  doc.text(`${paper.examDetails.totalMarks || 0} Marks`, pageWidth - marginX, y, { align: 'right' });
  y += 5.5;

  // Horizontal divider below meta
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 6;

  // Instructions
  if (paper.examDetails.instructions && paper.examDetails.instructions.length > 0) {
    checkPageBreak(15);
    doc.setFont('times', 'bold');
    doc.setFontSize(9.5);
    doc.setCharSpace(0);
    doc.text('Instructions for Candidates:', marginX, y, { align: 'left' });
    y += 4.5;

    doc.setFont('times', 'italic');
    doc.setFontSize(9);
    paper.examDetails.instructions.forEach((ins, idx) => {
      const insLines = doc.splitTextToSize(sanitizeForPdf(`${idx + 1}. ${ins}`), contentWidth);
      checkPageBreak(insLines.length * 4);
      doc.setCharSpace(0);
      insLines.forEach((line: string) => {
        doc.text(line, marginX + 2, y, { align: 'left' });
        y += 4;
      });
    });
    y += 3;
  }

  // Sections
  set.sections.forEach((section, sIdx) => {
    checkPageBreak(25);

    // Section title
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setCharSpace(0);
    const secTitle = sanitizeForPdf(section.sectionName.toUpperCase());
    doc.text(secTitle, pageWidth / 2, y, { align: 'center' });
    y += 5;

    // Attempt instruction & counted marks
    const countedMarks = section.attemptAny * section.marksPerQuestion;
    doc.setFont('times', 'bold');
    doc.setFontSize(9.5);
    doc.setCharSpace(0);
    const instructionText = sanitizeForPdf(`Q.${sIdx + 1} ${section.instruction || ''}`);
    doc.text(instructionText, marginX, y, { align: 'left' });
    doc.text(`[${countedMarks} Marks]`, pageWidth - marginX, y, { align: 'right' });
    y += 5.5;

    // Table Header & Proportions (~8% Q.No., ~64% Description, ~8% Marks, ~8% CO, ~12% Bloom)
    const tableLeft = marginX;
    const headerHeight = 7;

    const colNoWidth = 14;
    const colDescWidth = 112;
    const colMarksWidth = 14;
    const colCoWidth = 14;
    const colBloomWidth = 20;

    const renderTableHeader = () => {
      checkPageBreak(headerHeight + 10);
      doc.setFillColor(245, 245, 245);
      doc.rect(tableLeft, y, contentWidth, headerHeight, 'FD');

      doc.setDrawColor(120, 120, 120);
      doc.setLineWidth(0.3);
      doc.rect(tableLeft, y, contentWidth, headerHeight);

      // Vertical column separator lines in header
      doc.line(tableLeft + colNoWidth, y, tableLeft + colNoWidth, y + headerHeight);
      doc.line(tableLeft + colNoWidth + colDescWidth, y, tableLeft + colNoWidth + colDescWidth, y + headerHeight);
      doc.line(tableLeft + colNoWidth + colDescWidth + colMarksWidth, y, tableLeft + colNoWidth + colDescWidth + colMarksWidth, y + headerHeight);
      doc.line(tableLeft + colNoWidth + colDescWidth + colMarksWidth + colCoWidth, y, tableLeft + colNoWidth + colDescWidth + colMarksWidth + colCoWidth, y + headerHeight);

      doc.setFont('times', 'bold');
      doc.setFontSize(9);
      doc.setCharSpace(0);
      doc.text('Q. No.', tableLeft + colNoWidth / 2, y + 4.5, { align: 'center' });
      doc.text('Question Description', tableLeft + colNoWidth + 4, y + 4.5, { align: 'left' });
      doc.text('Marks', tableLeft + colNoWidth + colDescWidth + colMarksWidth / 2, y + 4.5, { align: 'center' });
      doc.text('CO', tableLeft + colNoWidth + colDescWidth + colMarksWidth + colCoWidth / 2, y + 4.5, { align: 'center' });
      doc.text('Bloom', tableLeft + colNoWidth + colDescWidth + colMarksWidth + colCoWidth + colBloomWidth / 2, y + 4.5, { align: 'center' });
      y += headerHeight;
    };

    renderTableHeader();

    // Table Rows
    section.questions.forEach((q, qIdx) => {
      const qNumStr = (qIdx + 1).toString();
      const cleanQText = sanitizeForPdf(q.text);
      const descLines = doc.splitTextToSize(cleanQText, colDescWidth - 8);
      const rowHeight = Math.max(descLines.length * 4.2 + 5, 10);

      if (y + rowHeight > pageHeight - marginBottom) {
        doc.addPage();
        y = marginTop;
        renderTableHeader();
      }

      // Draw row box
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.2);
      doc.rect(tableLeft, y, contentWidth, rowHeight);

      // Vertical column separator lines in row
      doc.line(tableLeft + colNoWidth, y, tableLeft + colNoWidth, y + rowHeight);
      doc.line(tableLeft + colNoWidth + colDescWidth, y, tableLeft + colNoWidth + colDescWidth, y + rowHeight);
      doc.line(tableLeft + colNoWidth + colDescWidth + colMarksWidth, y, tableLeft + colNoWidth + colDescWidth + colMarksWidth, y + rowHeight);
      doc.line(tableLeft + colNoWidth + colDescWidth + colMarksWidth + colCoWidth, y, tableLeft + colNoWidth + colDescWidth + colMarksWidth + colCoWidth, y + rowHeight);

      // Cell texts
      doc.setFont('times', 'bold');
      doc.setFontSize(9);
      doc.setCharSpace(0);
      doc.text(qNumStr, tableLeft + colNoWidth / 2, y + 5, { align: 'center' });

      // Render each question description line individually to prevent block justification / stretching
      doc.setFont('times', 'normal');
      doc.setFontSize(9);
      doc.setCharSpace(0);
      const descX = tableLeft + colNoWidth + 4;
      let lineY = y + 5;
      descLines.forEach((line: string) => {
        doc.text(line, descX, lineY, { align: 'left' });
        lineY += 4.2;
      });

      doc.setFont('times', 'bold');
      doc.setCharSpace(0);
      doc.text(q.marks.toString(), tableLeft + colNoWidth + colDescWidth + colMarksWidth / 2, y + 5, { align: 'center' });
      doc.text(sanitizeForPdf(q.co || 'CO1'), tableLeft + colNoWidth + colDescWidth + colMarksWidth + colCoWidth / 2, y + 5, { align: 'center' });
      doc.text(sanitizeForPdf(getBloomCode(q.bloomsLevel)), tableLeft + colNoWidth + colDescWidth + colMarksWidth + colCoWidth + colBloomWidth / 2, y + 5, { align: 'center' });

      y += rowHeight;
    });

    y += 6;
  });

  // End of paper
  checkPageBreak(15);
  y += 6;
  doc.setFont('times', 'bold');
  doc.setFontSize(9);
  doc.setCharSpace(0);
  doc.text('*** END OF QUESTION PAPER ***', pageWidth / 2, y, { align: 'center' });

  // Add page numbers
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('times', 'italic');
    doc.setFontSize(8.5);
    doc.setCharSpace(0);
    doc.text(
      `Page ${p} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  return doc.output('blob');
}

export function exportPaperToPdf(paper: GeneratedPaper, set: GeneratedSet) {
  const blob = generatePaperPdfBlob(paper, set);
  const cleanSubject = (paper.examDetails.subjectName || 'QuestionPaper').replace(/[^a-zA-Z0-9_\-]/g, '_');
  const cleanExam = (paper.examDetails.examName || 'Exam').replace(/[^a-zA-Z0-9_\-]/g, '_');
  const fileName = `Paper_${cleanSubject}_${cleanExam}_${set.setName.replace(/\s+/g, '_')}.pdf`;
  saveAs(blob, fileName);
}

/**
 * Generates and downloads a clean Answer Key & Model Answers PDF.
 */
export function exportAnswerKeyToPdf(paper: GeneratedPaper, set: GeneratedSet) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 18;
  const marginTop = 20;
  const marginBottom = 20;
  const contentWidth = pageWidth - marginX * 2;

  let y = marginTop;

  const checkPageBreak = (spaceNeeded: number) => {
    if (y + spaceNeeded > pageHeight - marginBottom) {
      doc.addPage();
      y = marginTop;
      return true;
    }
    return false;
  };

  // Header
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setCharSpace(0);
  doc.text('SCHEME OF VALUATION & MODEL ANSWERS', pageWidth / 2, y, { align: 'center' });
  y += 6;

  doc.setFontSize(11);
  doc.text(sanitizeForPdf(`${paper.examDetails.subjectName || 'Subject'} — ${set.setName.toUpperCase()}`), pageWidth / 2, y, { align: 'center' });
  y += 5.5;

  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.text(sanitizeForPdf(`Exam: ${paper.examDetails.examName || 'N/A'} | Max Marks: ${paper.examDetails.totalMarks}`), pageWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 7;

  set.sections.forEach((sec) => {
    checkPageBreak(18);
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setCharSpace(0);
    doc.text(sanitizeForPdf(sec.sectionName.toUpperCase() + ` (${sec.marksPerQuestion} Marks each)`), marginX, y, { align: 'left' });
    y += 6;

    sec.questions.forEach((q) => {
      doc.setFont('times', 'bold');
      doc.setFontSize(10);
      doc.setCharSpace(0);
      const headerLine = `${q.displayNumber} ${q.text} [${q.marks} Marks]`;
      const qLines = doc.splitTextToSize(sanitizeForPdf(headerLine), contentWidth);

      const ansText = q.answerKey || 'No model answer provided.';
      doc.setFont('times', 'normal');
      const ansLines = doc.splitTextToSize(sanitizeForPdf(`Model Answer / Key Points:\n${ansText}`), contentWidth - 6);

      const blockHeight = (qLines.length * 4.5) + (ansLines.length * 4.2) + 8;
      checkPageBreak(blockHeight);

      // Question Title (line-by-line rendering)
      doc.setFont('times', 'bold');
      doc.setCharSpace(0);
      qLines.forEach((line: string) => {
        doc.text(line, marginX, y, { align: 'left' });
        y += 4.5;
      });
      y += 2;

      // Gray background box for answer key
      doc.setFillColor(245, 247, 250);
      doc.roundedRect(marginX + 2, y - 2, contentWidth - 4, ansLines.length * 4.2 + 4, 1.5, 1.5, 'F');

      doc.setFont('times', 'normal');
      doc.setFontSize(9.5);
      doc.setCharSpace(0);
      ansLines.forEach((line: string) => {
        doc.text(line, marginX + 5, y + 2.5, { align: 'left' });
        y += 4.2;
      });
      y += ansLines.length * 4.2 + 8;
    });

    y += 3;
  });

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('times', 'italic');
    doc.setFontSize(8.5);
    doc.setCharSpace(0);
    doc.text(
      `Page ${p} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  const blob = doc.output('blob');
  const cleanSubject = (paper.examDetails.subjectName || 'AnswerKey').replace(/[^a-zA-Z0-9_\-]/g, '_');
  const fileName = `AnswerKey_${cleanSubject}_${set.setName.replace(/\s+/g, '_')}.pdf`;
  saveAs(blob, fileName);
}
