import React, { useState } from 'react';
import { KeyRound, Download, Printer, CheckCircle2, FileText, ArrowLeft, Edit3, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { usePaperGen } from '../../context/PaperGenContext';
import { exportAnswerKeyToDocx } from '../../services/export/exportDocx';
import { exportAnswerKeyToPdf } from '../../services/export/exportPdf';

export const AnswerKeyEditorView: React.FC = () => {
  const {
    generatedPaper,
    activeSetIndex,
    setActiveSetIndex,
    updateAnswerKey,
    setCurrentView,
    showNotification,
  } = usePaperGen();

  if (!generatedPaper || !generatedPaper.sets || generatedPaper.sets.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs max-w-2xl mx-auto space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">No Generated Question Paper Available</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Generate an exam paper first to create and edit its answer keys and marking schemes.
        </p>
        <button
          onClick={() => setCurrentView('create-wizard')}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors inline-flex items-center gap-2"
        >
          <span>Create Exam Paper</span>
        </button>
      </div>
    );
  }

  const activeSet = generatedPaper.sets[activeSetIndex] || generatedPaper.sets[0];

  const handleDownloadAnswerKeyPdf = () => {
    exportAnswerKeyToPdf(generatedPaper, activeSet);
    showNotification(`Downloaded Answer Key PDF for ${activeSet.setName}`, 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top Action Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('editor')}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Back to Paper Editor"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Paper Editor</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
              Set:
            </span>
            {generatedPaper.sets.map((set, idx) => (
              <button
                key={set.setId}
                onClick={() => setActiveSetIndex(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeSetIndex === idx
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{set.setName}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => exportAnswerKeyToDocx(generatedPaper, activeSet)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export DOCX</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print</span>
          </button>

          {/* Primary Action */}
          <button
            onClick={handleDownloadAnswerKeyPdf}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Answer Key PDF ({activeSet.setName})</span>
          </button>
        </div>
      </div>

      {/* Answer Key Document Editor */}
      <motion.div
        key={activeSet.setId}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-10 space-y-8"
      >
        <div className="border-b border-slate-200 pb-4 text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold mb-1">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Scheme of Valuation & Model Answers</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            {generatedPaper.examDetails.subjectName} — {activeSet.setName}
          </h1>
          <p className="text-xs text-slate-500">
            {generatedPaper.examDetails.examName} • Max Marks: {generatedPaper.examDetails.totalMarks}
          </p>
        </div>

        <div className="space-y-8">
          {activeSet.sections.map((section) => (
            <div key={section.sectionId} className="space-y-4">
              <div className="bg-slate-100/80 px-4 py-2 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {section.sectionName} ({section.marksPerQuestion} Marks each)
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {section.questions.length} questions
                </span>
              </div>

              <div className="space-y-4">
                {section.questions.map((q) => (
                  <div
                    key={q.id}
                    className="p-5 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="font-bold text-sm text-blue-700 shrink-0">
                          {q.displayNumber}
                        </span>
                        <p className="text-xs font-semibold text-slate-900 leading-relaxed">
                          {q.text}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                        [{q.marks} Marks]
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Model Answer / Marking Scheme Points:</span>
                        </label>
                        {q.answerKey && (
                          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Saved</span>
                          </span>
                        )}
                      </div>

                      <textarea
                        rows={3}
                        value={q.answerKey || ''}
                        onChange={(e) => updateAnswerKey(activeSet.setId, q.id, e.target.value)}
                        placeholder={`Enter key points for evaluation (e.g. 1 Mark for definition, 1 Mark for formula)...`}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono leading-relaxed focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
