import React, { useState } from 'react';
import {
  FileCheck2,
  Printer,
  Download,
  Edit3,
  Trash2,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Plus,
  Check,
  X,
  FileText,
  KeyRound,
  Sparkles,
  Archive,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePaperGen } from '../../context/PaperGenContext';
import { PaperQuestion, getBloomCode, BloomsLevel } from '../../types';
import { ReplaceQuestionModal } from '../modals/ReplaceQuestionModal';
import { PrintPreviewModal } from '../modals/PrintPreviewModal';
import { exportPaperToDocx } from '../../services/export/exportDocx';
import { exportPaperToPdf } from '../../services/export/exportPdf';
import { exportAllSetsToZip } from '../../services/export/exportZip';

export const PaperEditorView: React.FC = () => {
  const {
    generatedPaper,
    pastPapers,
    setGeneratedPaper,
    activeSetIndex,
    setActiveSetIndex,
    updatePaperQuestionText,
    updatePaperQuestionCO,
    updatePaperQuestionBloom,
    deletePaperQuestion,
    movePaperQuestion,
    addPaperQuestionManually,
    setCurrentView,
    showNotification,
  } = usePaperGen();

  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [replaceTargetQuestion, setReplaceTargetQuestion] = useState<PaperQuestion | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [addingSectionId, setAddingSectionId] = useState<string | null>(null);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [isExportingZip, setIsExportingZip] = useState(false);

  if ((!generatedPaper || !generatedPaper.sets || generatedPaper.sets.length === 0) && pastPapers.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs max-w-2xl mx-auto space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#7A263A]/10 text-[#7A263A] mx-auto flex items-center justify-center">
          <FileText className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">No Generated Question Papers Yet</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Create your examination question paper by going through the Create Paper workflow.
        </p>
        <button
          onClick={() => setCurrentView('create-wizard')}
          className="px-6 py-2.5 bg-[#7A263A] hover:bg-[#651F30] text-white text-xs font-bold rounded-xl shadow-sm transition-colors inline-flex items-center gap-2"
        >
          <span>Start Creating Paper</span>
        </button>
      </div>
    );
  }

  // If generatedPaper is not set but pastPapers has items, select the first one
  const activePaper = generatedPaper || pastPapers[0];
  const activeSet = activePaper.sets[activeSetIndex] || activePaper.sets[0];
  const hasMultipleSets = activePaper.sets.length > 1;

  const handleStartEdit = (q: PaperQuestion) => {
    setEditingQuestionId(q.id);
    setEditText(q.text);
  };

  const handleSaveEdit = (questionId: string) => {
    if (editText.trim()) {
      updatePaperQuestionText(activeSet.setId, questionId, editText.trim());
      showNotification('Question text updated', 'success');
    }
    setEditingQuestionId(null);
  };

  const handleAddQuestionToSection = (sectionId: string, marks: number) => {
    if (!newQuestionText.trim()) return;
    addPaperQuestionManually(activeSet.setId, sectionId, newQuestionText.trim(), marks);
    setNewQuestionText('');
    setAddingSectionId(null);
  };

  const handleDownloadActiveSetPdf = () => {
    exportPaperToPdf(activePaper, activeSet);
    showNotification(`Downloaded PDF for ${activeSet.setName}`, 'success');
  };

  const handleDownloadAllSetsZip = async () => {
    try {
      setIsExportingZip(true);
      await exportAllSetsToZip(activePaper);
      showNotification(`Downloaded all ${activePaper.sets.length} sets as ZIP archive!`, 'success');
    } catch (e) {
      console.error(e);
      showNotification('Could not generate ZIP archive', 'error');
    } finally {
      setIsExportingZip(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Generated Papers Repository List */}
      {pastPapers.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Generated Examination Papers</h2>
              <p className="text-xs text-slate-500">Preview papers, open answer keys, or download PDF and Word copies.</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-[#7A263A]/10 text-[#7A263A] rounded-lg">
              {pastPapers.length} Papers
            </span>
          </div>

          <div className="space-y-3">
            {pastPapers.map((paper) => {
              const isSelected = activePaper?.id === paper.id;
              return (
                <div
                  key={paper.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-[#F9F1F3] border-[#7A263A]/40 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {paper.examDetails.subjectName} – {paper.examDetails.examName}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-[#7A263A] text-white rounded-full">
                          Viewing Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {paper.examDetails.collegeName} • {paper.sets.length} Sets • {paper.examDetails.totalMarks} Marks • {paper.createdAt ? new Date(paper.createdAt).toLocaleDateString() : 'Recent'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setGeneratedPaper(paper);
                        setActiveSetIndex(0);
                      }}
                      className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-2xs transition-colors"
                    >
                      Preview
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setGeneratedPaper(paper);
                        setCurrentView('answer-keys');
                      }}
                      className="px-3.5 py-1.5 bg-[#7A263A]/10 hover:bg-[#7A263A]/20 text-[#7A263A] text-xs font-semibold rounded-lg border border-[#7A263A]/30 shadow-2xs transition-colors"
                    >
                      Answer Key
                    </button>

                    <button
                      type="button"
                      onClick={() => exportPaperToPdf(paper, paper.sets[0])}
                      className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-2xs transition-colors"
                    >
                      Download PDF
                    </button>

                    <button
                      type="button"
                      onClick={() => exportPaperToDocx(paper, paper.sets[0], false)}
                      className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-2xs transition-colors"
                    >
                      Download Word
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Set Selector Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            Question Paper Sets:
          </span>
          {activePaper.sets.map((set, idx) => (
            <button
              key={set.setId}
              id={`btn-tab-set-${idx}`}
              onClick={() => setActiveSetIndex(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeSetIndex === idx
                  ? 'bg-[#7A263A] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>{set.setName}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeSetIndex === idx ? 'bg-[#651F30] text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {set.sections.reduce((acc, s) => acc + s.questions.length, 0)} Qs
              </span>
            </button>
          ))}
        </div>

        {/* Action Export Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="btn-nav-to-answer-key"
            onClick={() => setCurrentView('answer-keys')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5 text-blue-600" />
            <span>Answer Key</span>
          </button>

          <button
            id="btn-export-docx"
            onClick={() => exportPaperToDocx(activePaper, activeSet, false)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>DOCX</span>
          </button>

          <button
            id="btn-print-preview-modal"
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print</span>
          </button>

          {/* Primary Action: Download PDF for current set */}
          <button
            id="btn-download-pdf-active-set"
            onClick={handleDownloadActiveSetPdf}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#7A263A] hover:bg-[#651F30] shadow-sm hover:shadow transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download {activeSet.setName} (PDF)</span>
          </button>

          {/* Secondary Bulk Download if multiple sets */}
          {hasMultipleSets && (
            <button
              id="btn-download-all-sets-zip"
              disabled={isExportingZip}
              onClick={handleDownloadAllSetsZip}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors disabled:opacity-50"
            >
              <Archive className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isExportingZip ? 'Packaging ZIP...' : `Download All (${activePaper.sets.length}) Sets (ZIP)`}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Examination Sheet Preview & Interactive Editor */}
      <motion.div
        key={activeSet.setId}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-10 space-y-8"
      >
        {/* Examination Formal Header Preview */}
        <div className="border-b-2 border-slate-900 pb-6 text-center space-y-1">
          {activePaper.examDetails.collegeName && (
            <h2 className="text-xl font-bold uppercase tracking-wide text-slate-900 font-serif">
              {activePaper.examDetails.collegeName}
            </h2>
          )}
          {activePaper.examDetails.department && (
            <p className="text-xs font-semibold text-slate-700 font-serif">
              {activePaper.examDetails.department}
            </p>
          )}
          <h1 className="text-base md:text-lg font-black uppercase tracking-wider text-slate-900 pt-1 font-serif">
            {activePaper.examDetails.examName} — ({activeSet.setName.toUpperCase()})
          </h1>

          {/* Meta Info Bar */}
          <div className="grid grid-cols-2 text-xs pt-4 font-serif text-slate-800 border-t border-slate-300 mt-4">
            <div className="text-left space-y-1">
              <div>
                <span className="font-bold">Subject: </span>
                <span>{activePaper.examDetails.subjectName}</span>
                {activePaper.examDetails.subjectCode && (
                  <span> ({activePaper.examDetails.subjectCode})</span>
                )}
              </div>
              {activePaper.examDetails.date && (
                <div>
                  <span className="font-bold">Date: </span>
                  <span>{activePaper.examDetails.date}</span>
                </div>
              )}
            </div>
            <div className="text-right space-y-1">
              <div>
                <span className="font-bold">Time Duration: </span>
                <span>{activePaper.examDetails.duration}</span>
              </div>
              <div>
                <span className="font-bold">Maximum Marks: </span>
                <span className="font-bold text-[#7A263A]">{activePaper.examDetails.totalMarks} Marks</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          {activePaper.examDetails.instructions && activePaper.examDetails.instructions.length > 0 && (
            <div className="text-left text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 mt-3 font-sans">
              <span className="font-bold text-slate-800">Instructions for Candidates:</span>
              <ol className="list-decimal list-inside mt-1 space-y-0.5 text-slate-600">
                {activePaper.examDetails.instructions.map((ins, i) => (
                  <li key={i}>{ins}</li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Paper Sections */}
        <div className="space-y-10">
          {activeSet.sections.map((section, sIdx) => {
            const isAdding = addingSectionId === section.sectionId;
            const countedMarks = section.attemptAny * section.marksPerQuestion;

            return (
              <div key={section.sectionId} className="space-y-4">
                {/* Section Header */}
                <div className="border-b border-slate-300 pb-3">
                  <div className="text-center font-serif font-bold text-sm text-slate-900 uppercase">
                    {section.sectionName}
                  </div>
                  <div className="flex items-center justify-between text-xs font-serif font-semibold text-slate-800 pt-1">
                    <span>Q.{sIdx + 1} {section.instruction || ''}</span>
                    <span className="font-bold text-blue-800">[{countedMarks} Marks]</span>
                  </div>
                </div>

                {/* Add question inline box */}
                {isAdding && (
                  <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
                    <div className="text-xs font-bold text-blue-900">
                      Add New {section.marksPerQuestion}-Mark Question to {section.sectionName}
                    </div>
                    <textarea
                      rows={3}
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      placeholder="Type question content here..."
                      className="w-full p-2.5 bg-white border border-blue-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setAddingSectionId(null)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200/60 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() =>
                          handleAddQuestionToSection(section.sectionId, section.marksPerQuestion)
                        }
                        className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-xs"
                      >
                        Add to Section
                      </button>
                    </div>
                  </div>
                )}

                {/* Academic Table View */}
                <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                  <div className="grid grid-cols-12 bg-slate-100 border-b border-slate-300 text-[11px] font-serif font-bold text-slate-800 py-2 px-3 text-center">
                    <div className="col-span-1">Q. No.</div>
                    <div className="col-span-6 text-left">Question Description</div>
                    <div className="col-span-1">Marks</div>
                    <div className="col-span-1">CO</div>
                    <div className="col-span-1">Bloom</div>
                    <div className="col-span-2">Actions</div>
                  </div>

                  <div className="divide-y divide-slate-200">
                    {section.questions.map((q, qIdx) => {
                      const isEditing = editingQuestionId === q.id;

                      return (
                        <div key={q.id} className="grid grid-cols-12 items-center py-3 px-3 text-xs text-slate-900 hover:bg-slate-50/50 transition-colors">
                          <div className="col-span-1 text-center font-bold font-serif">
                            {qIdx + 1}
                          </div>

                          <div className="col-span-6 pr-3 font-sans">
                            {isEditing ? (
                              <div className="space-y-2">
                                <textarea
                                  rows={2}
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="w-full p-2 text-xs border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleSaveEdit(q.id)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-1"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Save</span>
                                  </button>
                                  <button
                                    onClick={() => setEditingQuestionId(null)}
                                    className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[10px]"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="leading-relaxed font-medium">{q.text}</p>
                            )}
                          </div>

                          <div className="col-span-1 text-center font-bold font-serif">
                            {q.marks}M
                          </div>

                          <div className="col-span-1 text-center font-semibold text-slate-700 font-serif">
                            <select
                              value={q.co || 'CO1'}
                              onChange={(e) => updatePaperQuestionCO(activeSet.setId, q.id, e.target.value)}
                              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                              title="Click to change Course Outcome"
                            >
                              {['CO1', 'CO2', 'CO3', 'CO4', 'CO5', 'CO6', 'CO7', 'CO8', 'CO9', 'CO10'].map(co => (
                                <option key={co} value={co}>{co}</option>
                              ))}
                            </select>
                          </div>

                          <div className="col-span-1 text-center font-bold text-indigo-700 font-serif">
                            <select
                              value={q.bloomsLevel}
                              onChange={(e) => updatePaperQuestionBloom(activeSet.setId, q.id, e.target.value as BloomsLevel)}
                              className="text-xs font-bold bg-indigo-50 border border-indigo-200 rounded px-1.5 py-1 text-indigo-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                              title="Click to change Bloom's Taxonomy Level"
                            >
                              {(['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'] as BloomsLevel[]).map(lvl => (
                                <option key={lvl} value={lvl}>{getBloomCode(lvl)} — {lvl}</option>
                              ))}
                            </select>
                          </div>

                          <div className="col-span-2 flex items-center justify-center gap-1">
                            <div className="flex items-center border border-slate-200 rounded overflow-hidden bg-white">
                              <button
                                disabled={qIdx === 0}
                                onClick={() => movePaperQuestion(activeSet.setId, section.sectionId, qIdx, 'up')}
                                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                disabled={qIdx === section.questions.length - 1}
                                onClick={() => movePaperQuestion(activeSet.setId, section.sectionId, qIdx, 'down')}
                                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>

                            {!isEditing && (
                              <button
                                onClick={() => handleStartEdit(q)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            )}

                            <button
                              id={`btn-replace-q-${q.id}`}
                              onClick={() => setReplaceTargetQuestion(q)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Replace Question"
                            >
                              <RefreshCw className="w-3 h-3" />
                            </button>

                            <button
                              onClick={() => deletePaperQuestion(activeSet.setId, q.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => setAddingSectionId(isAdding ? null : section.sectionId)}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 border border-blue-200 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question to {section.sectionName}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Paper End Mark */}
        <div className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 pt-6 border-t border-slate-200">
          *** END OF QUESTION PAPER ***
        </div>
      </motion.div>

      {/* Replace Question Modal */}
      <ReplaceQuestionModal
        isOpen={!!replaceTargetQuestion}
        onClose={() => setReplaceTargetQuestion(null)}
        currentQuestion={replaceTargetQuestion}
        setId={activeSet.setId}
      />

      {/* Print Preview Modal */}
      <PrintPreviewModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        paper={activePaper}
        activeSet={activeSet}
      />
    </div>
  );
};
