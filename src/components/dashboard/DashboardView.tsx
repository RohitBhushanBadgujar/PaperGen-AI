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
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-100">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Standardized PDF Question Paper Engine</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Create Standardized Exam Papers Directly from Your Question-Bank PDFs
          </h1>

          <p className="text-sm text-blue-100/90 leading-relaxed">
            Upload PDFs for each mark category (2M, 3M, 5M, 10M). PaperGen automatically extracts all questions, enforces your exact marking scheme, generates multiple distinct sets, and exports to printable PDF & DOCX.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="btn-dashboard-start-wizard"
              onClick={() => setCurrentView('create-wizard')}
              className="px-6 py-3 bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-blue-700" />
              <span>Start New Exam Paper Wizard</span>
            </button>

            {totalQuestions === 0 && (
              <button
                id="btn-dashboard-load-sample"
                onClick={loadSampleData}
                className="px-5 py-3 bg-blue-600/60 hover:bg-blue-600 border border-blue-400/40 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-2 backdrop-blur-md"
              >
                <Sparkles className="w-4 h-4 text-blue-300" />
                <span>Load Sample Bank (Applied Electronics)</span>
              </button>
            )}
          </div>
        </div>

        {/* Subtle decorative background watermark */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10 text-white select-none pointer-events-none">
          <FileText className="w-96 h-96" />
        </div>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalBanks}</div>
            <div className="text-xs text-slate-500 font-medium">Question Banks Loaded</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalQuestions}</div>
            <div className="text-xs text-slate-500 font-medium">Total Extracted Questions</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {generatedPaper ? `${generatedPaper.sets.length} Sets` : '0'}
            </div>
            <div className="text-xs text-slate-500 font-medium">Active Generated Paper</div>
          </div>
        </div>
      </div>

      {/* Active Generated Paper Spotlight if available */}
      {generatedPaper && activeSet && (
        <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {generatedPaper.examDetails.subjectName}
                  </h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {generatedPaper.sets.length} Sets Generated
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {generatedPaper.examDetails.examName} • Total Marks: {generatedPaper.examDetails.totalMarks} • Duration: {generatedPaper.examDetails.duration}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => exportPaperToDocx(generatedPaper, activeSet, false)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export DOCX</span>
              </button>

              <button
                onClick={() => setCurrentView('editor')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
              >
                <span>Open in Paper Editor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {activeSet.sections.map((sec) => (
              <div key={sec.sectionId} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium block text-[11px]">
                  {sec.sectionName}
                </span>
                <span className="font-bold text-slate-900">
                  {sec.questions.length} questions ({sec.marksPerQuestion}M each)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How It Works - 4 Simple Steps Guide */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          How PaperGen AI Works
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              1
            </div>
            <div className="text-xs font-bold text-slate-900">Enter Exam Details</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Specify subject, exam title, total marks, duration, and instructions.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              2
            </div>
            <div className="text-xs font-bold text-slate-900">Set Marking Scheme</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Define required questions per mark category (e.g. 5 × 2M, 5 × 3M, 4 × 5M).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              3
            </div>
            <div className="text-xs font-bold text-slate-900">Upload PDF Banks</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              PDF parser detects question numbers, extracts multi-line items, and preserves text.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              4
            </div>
            <div className="text-xs font-bold text-slate-900">Generate & Export</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Random selection builds multiple sets (Set A, B, C). Edit questions, replace, or export to DOCX/PDF.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
