import React, { useRef } from 'react';
import { X, Printer, Download, FileText } from 'lucide-react';
import { GeneratedPaper, GeneratedSet } from '../../types';
import { exportPaperToDocx } from '../../services/export/exportDocx';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  paper: GeneratedPaper | null;
  activeSet: GeneratedSet | null;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  paper,
  activeSet,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !paper || !activeSet) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-300 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Top bar */}
        <div className="no-print p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-100/80 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-blue-600 text-white shadow-2xs">
              {activeSet.setName} Examination Sheet
            </span>
            <span className="text-xs text-slate-500">Print & PDF Export Preview</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => exportPaperToDocx(paper, activeSet, false)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export DOCX</span>
            </button>

            <button
              id="btn-trigger-browser-print"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Document Container (Styled exactly like standard college/university exam paper) */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-slate-200/50 flex justify-center">
          <div
            ref={printRef}
            className="w-full max-w-[800px] bg-white p-10 md:p-14 shadow-md rounded-lg text-black font-serif leading-relaxed border border-slate-300"
            style={{ fontFamily: '"Times New Roman", Times, serif' }}
          >
            {/* Institution Header */}
            <div className="text-center space-y-1 pb-4 border-b-2 border-black">
              {paper.examDetails.collegeName && (
                <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wide">
                  {paper.examDetails.collegeName}
                </h1>
              )}
              {paper.examDetails.department && (
                <h2 className="text-sm md:text-base font-semibold">
                  {paper.examDetails.department}
                </h2>
              )}
              <h3 className="text-base md:text-lg font-bold uppercase pt-1 tracking-wider">
                {paper.examDetails.examName} — ({activeSet.setName.toUpperCase()})
              </h3>
            </div>

            {/* Exam Meta Info Bar */}
            <div className="grid grid-cols-2 py-3 border-b-2 border-black text-sm my-2">
              <div className="space-y-1">
                <div>
                  <span className="font-bold">Subject: </span>
                  <span>{paper.examDetails.subjectName}</span>
                  {paper.examDetails.subjectCode && <span> ({paper.examDetails.subjectCode})</span>}
                </div>
                <div>
                  <span className="font-bold">Date: </span>
                  <span>{paper.examDetails.date || new Date().toLocaleDateString()}</span>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div>
                  <span className="font-bold">Time Duration: </span>
                  <span>{paper.examDetails.duration}</span>
                </div>
                <div>
                  <span className="font-bold">Maximum Marks: </span>
                  <span className="font-bold">{paper.examDetails.totalMarks}</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            {paper.examDetails.instructions && paper.examDetails.instructions.length > 0 && (
              <div className="my-4 text-xs italic bg-slate-50/50 p-3 border border-slate-200">
                <span className="font-bold not-italic">General Instructions:</span>
                <ol className="list-decimal list-inside mt-1 space-y-0.5">
                  {paper.examDetails.instructions.map((ins, i) => (
                    <li key={i}>{ins}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Sections & Questions */}
            <div className="space-y-8 mt-6">
              {activeSet.sections.map((section, sIdx) => {
                const sectionTotal = section.questionsRequired * section.marksPerQuestion;

                return (
                  <div key={section.sectionId} className="space-y-4">
                    {/* Section Header */}
                    <div className="text-center">
                      <h4 className="font-bold text-base uppercase tracking-wider underline">
                        {section.sectionName}
                      </h4>
                      {section.instruction && (
                        <p className="text-xs italic mt-0.5">({section.instruction})</p>
                      )}
                    </div>

                    {/* Question items */}
                    <div className="space-y-4">
                      {section.questions.map((q) => (
                        <div key={q.id} className="flex items-start justify-between gap-4 text-sm">
                          <div className="flex items-start gap-3 flex-1">
                            <span className="font-bold shrink-0">{q.displayNumber}</span>
                            <span className="leading-relaxed text-justify">{q.text}</span>
                          </div>
                          <span className="font-bold shrink-0 text-xs">[{q.marks}M]</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Paper End Mark */}
            <div className="text-center text-xs font-bold tracking-widest uppercase mt-12 pt-6 border-t border-black">
              *** END OF QUESTION PAPER ***
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
