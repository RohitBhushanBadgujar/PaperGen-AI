import React from 'react';
import {
  PlusCircle,
  FolderOpen,
  FileCheck2,
  Sparkles,
  Layers,
  FileText,
  Printer,
  Download,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { usePaperGen } from '../../context/PaperGenContext';
import { exportPaperToDocx } from '../../services/export/exportDocx';
import { QuestionBank } from '../../types';

export const DashboardView: React.FC = () => {
  const {
    setCurrentView,
    questionBanks,
    generatedPaper,
    loadSampleData,
    examDetails,
    rubrics,
  } = usePaperGen();

  const totalQuestions = (Object.values(questionBanks) as QuestionBank[]).reduce(
    (acc, b) => acc + (b.questions?.length || 0),
    0
  );
  const totalBanks = Object.keys(questionBanks).length;
  const activeSet = generatedPaper?.sets?.[0];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 animate-in fade-in duration-200">
      {/* Hero Welcome Banner */}
      <div className="bg-[#FCFAF5] border border-[#DDD8CE] rounded-2xl p-8 text-[#171717] shadow-xs relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7A263A]/10 border border-[#7A263A]/20 text-xs font-semibold text-[#7A263A]">
            <Sparkles className="w-3.5 h-3.5 text-[#7A263A]" />
            <span>PaperGen-AI • Professional Examination Studio</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#171717] leading-tight">
            Create Standardized Exam Papers Directly from Your Question-Bank PDFs
          </h1>

          <p className="text-sm text-[#68645D] leading-relaxed">
            Upload PDFs for each mark category (2M, 3M, 5M, 10M). PaperGen-AI automatically extracts all questions, enforces your exact marking scheme, generates multiple distinct sets, and exports to printable PDF & DOCX.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="btn-dashboard-start-wizard"
              onClick={() => setCurrentView('create-wizard')}
              className="px-6 py-3 bg-[#7A263A] hover:bg-[#651F30] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>Start New Exam Paper Wizard</span>
            </button>

            {totalQuestions === 0 && (
              <button
                id="btn-dashboard-load-sample"
                onClick={loadSampleData}
                className="px-5 py-3 bg-[#FCFAF5] hover:bg-[#F3EFE6] border border-[#DDD8CE] text-[#171717] font-semibold text-xs rounded-xl transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#A88A55]" />
                <span>Load Sample Bank (Applied Electronics)</span>
              </button>
            )}
          </div>
        </div>

        {/* Subtle decorative background watermark */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-5 text-[#7A263A] select-none pointer-events-none">
          <FileText className="w-96 h-96" />
        </div>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="papergen-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#7A263A]/10 text-[#7A263A] flex items-center justify-center font-bold text-lg">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#171717]">{totalBanks}</div>
            <div className="text-xs text-[#68645D] font-medium">Question Banks Loaded</div>
          </div>
        </div>

        <div className="papergen-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#536B57]/10 text-[#536B57] flex items-center justify-center font-bold text-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#171717]">{totalQuestions}</div>
            <div className="text-xs text-[#68645D] font-medium">Total Extracted Questions</div>
          </div>
        </div>

        <div className="papergen-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#A88A55]/10 text-[#A88A55] flex items-center justify-center font-bold text-lg">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#171717]">
              {generatedPaper ? `${generatedPaper.sets.length} Sets` : '0'}
            </div>
            <div className="text-xs text-[#68645D] font-medium">Active Generated Paper</div>
          </div>
        </div>
      </div>

      {/* Active Generated Paper Spotlight if available */}
      {generatedPaper && activeSet && (
        <div className="papergen-card p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DDD8CE] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7A263A]/10 text-[#7A263A] flex items-center justify-center">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#171717]">
                    {generatedPaper.examDetails.subjectName}
                  </h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#7A263A]/10 text-[#7A263A]">
                    {generatedPaper.sets.length} Sets Generated
                  </span>
                </div>
                <p className="text-xs text-[#68645D]">
                  {generatedPaper.examDetails.examName} • Total Marks: {generatedPaper.examDetails.totalMarks} • Duration: {generatedPaper.examDetails.duration}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => exportPaperToDocx(generatedPaper, activeSet, false)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#171717] bg-[#FCFAF5] hover:bg-[#F3EFE6] border border-[#DDD8CE] transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export DOCX</span>
              </button>

              <button
                onClick={() => setCurrentView('editor')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#7A263A] hover:bg-[#651F30] shadow-xs transition-colors"
              >
                <span>Open in Paper Editor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {activeSet.sections.map((sec) => (
              <div key={sec.sectionId} className="p-3 bg-[#FFFFFF] rounded-xl border border-[#DDD8CE]">
                <span className="text-[#68645D] font-medium block text-[11px]">
                  {sec.sectionName}
                </span>
                <span className="font-bold text-[#171717]">
                  {sec.questions.length} questions ({sec.marksPerQuestion}M each)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How It Works - 4 Simple Steps Guide */}
      <div className="papergen-card p-6 space-y-4">
        <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
          How PaperGen-AI Works
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#DDD8CE] space-y-2">
            <div className="w-7 h-7 rounded-lg bg-[#7A263A] text-white font-bold text-xs flex items-center justify-center">
              1
            </div>
            <div className="text-xs font-bold text-[#171717]">Enter Exam Details</div>
            <p className="text-[11px] text-[#68645D] leading-relaxed">
              Specify subject, exam title, total marks, duration, and instructions.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#DDD8CE] space-y-2">
            <div className="w-7 h-7 rounded-lg bg-[#7A263A] text-white font-bold text-xs flex items-center justify-center">
              2
            </div>
            <div className="text-xs font-bold text-[#171717]">Set Marking Scheme</div>
            <p className="text-[11px] text-[#68645D] leading-relaxed">
              Define required questions per mark category (e.g. 5 × 2M, 5 × 3M, 4 × 5M).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#DDD8CE] space-y-2">
            <div className="w-7 h-7 rounded-lg bg-[#7A263A] text-white font-bold text-xs flex items-center justify-center">
              3
            </div>
            <div className="text-xs font-bold text-[#171717]">Upload PDF Banks</div>
            <p className="text-[11px] text-[#68645D] leading-relaxed">
              PDF parser detects question numbers, extracts multi-line items, and preserves text.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#DDD8CE] space-y-2">
            <div className="w-7 h-7 rounded-lg bg-[#7A263A] text-white font-bold text-xs flex items-center justify-center">
              4
            </div>
            <div className="text-xs font-bold text-[#171717]">Generate & Export</div>
            <p className="text-[11px] text-[#68645D] leading-relaxed">
              Random selection builds multiple sets (Set A, B, C). Edit questions, replace, or export to DOCX/PDF.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
