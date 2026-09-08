import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { GeneratedPaper } from '../../types';
import { generatePaperPdfBlob } from './exportPdf';

/**
 * Packages all generated exam paper sets into a single downloadable ZIP archive.
 */
export async function exportAllSetsToZip(paper: GeneratedPaper): Promise<void> {
  const zip = new JSZip();
  const cleanSubject = (paper.examDetails.subjectName || 'QuestionPaper').replace(/[^a-zA-Z0-9_\-]/g, '_');
  const cleanExam = (paper.examDetails.examName || 'Exam').replace(/[^a-zA-Z0-9_\-]/g, '_');

  // Create a folder in the zip
  const folderName = `${cleanSubject}_${cleanExam}_AllSets`;
  const folder = zip.folder(folderName) || zip;

  // Generate each PDF and append to zip
  for (const set of paper.sets) {
    const pdfBlob = generatePaperPdfBlob(paper, set);
    const fileName = `Paper_${cleanSubject}_${set.setName.replace(/\s+/g, '_')}.pdf`;
    folder.file(fileName, pdfBlob);
  }

  // Generate zip file and trigger browser download
  const content = await zip.generateAsync({ type: 'blob' });
  const zipFileName = `${cleanSubject}_${paper.sets.length}Sets_ExamPapers.zip`;
  saveAs(content, zipFileName);
}
