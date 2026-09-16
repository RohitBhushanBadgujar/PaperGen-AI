import React, { useState } from 'react';
import {
  FolderOpen,
  Trash2,
  Edit3,
  Check,
  Sparkles,
  ArrowRight,
  Eye,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { usePaperGen } from '../../context/PaperGenContext';
import { QuestionBank, QuestionItem } from '../../types';

export const StepQuestionBanks: React.FC<{ onNext: () => void; onBack?: () => void }> = ({ onNext, onBack }) => {
  const {
    questionBanks,
    deleteQuestionFromBank,
    editQuestionInBank,
    showNotification,
    loadSampleData,
  } = usePaperGen();

  const [expandedMark, setExpandedMark] = useState<number | null>(2);
  const [editingQId, setEditingQId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const bankList = Object.values(questionBanks) as QuestionBank[];
  const totalQuestions = bankList.reduce((acc, b) => acc + (b.questions?.length || 0), 0);

  const handleStartEdit = (id: string, text: string) => {
    setEditingQId(id);
    setEditText(text);
  };

  const handleSaveEdit = (marks: number, id: string) => {
    if (editText.trim()) {
      editQuestionInBank(marks, id, editText.trim());
      showNotification('Question updated successfully', 'success');
    }
    setEditingQId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#7A263A]/10 text-[#7A263A]">
              Step 02
            </span>
            <h2 className="text-base font-bold text-slate-900">Question Bank Selection & Review</h2>
          </div>
          <p className="text-xs text-slate-500">
            Review available question categories, inspect extracted questions, and verify question bank readiness for your paper structure.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {totalQuestions === 0 && (
            <button
              type="button"
              onClick={loadSampleData}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#7A263A] bg-[#7A263A]/10 hover:bg-[#7A263A]/20 border border-[#7A263A]/20 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#7A263A]" />
              <span>Load Sample Banks</span>
            </button>
          )}
        </div>
      </div>

      {/* Question Categories List */}
      <div className="space-y-4">
        {bankList.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <FolderOpen className="w-10 h-10 text-slate-400 mx-auto" />
            <div className="text-sm font-bold text-slate-900">No Question Banks Loaded</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Please load sample question banks to populate the active session with examination questions.
            </p>
            <button
              type="button"
              onClick={loadSampleData}
              className="px-5 py-2.5 bg-[#7A263A] hover:bg-[#651F30] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              Load Sample Banks
            </button>
          </div>
        ) : (
          bankList.map((bank: QuestionBank) => {
            const isExpanded = expandedMark === bank.marks;
            return (
              <div
                key={bank.marks}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-all"
              >
                {/* Category Header Row */}
                <div
                  onClick={() => setExpandedMark(isExpanded ? null : bank.marks)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#7A263A]/10 flex items-center justify-center text-[#7A263A] font-bold text-sm">
                      {bank.marks}M
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {bank.marks} Marks Category ({bank.name || `${bank.marks} Marks Bank`})
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Available Questions: <strong className="text-slate-800">{bank.questions?.length || 0}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedMark(isExpanded ? null : bank.marks);
                      }}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                      <span>{isExpanded ? 'Hide Questions' : 'Select / View Questions'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Questions List */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-5 space-y-3 animate-in fade-in duration-150">
                    <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                      <span>Extracted Questions ({bank.questions?.length || 0})</span>
                      <span className="text-[11px] font-normal text-slate-500">Click edit icon to modify question text</span>
                    </div>

                    {bank.questions?.length === 0 ? (
                      <div className="text-xs text-slate-500 italic p-4 text-center">No questions in this category.</div>
                    ) : (
                      bank.questions.map((q: QuestionItem, idx: number) => (
                        <div
                          key={q.id || idx}
                          className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-2 shadow-2xs"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              Q{idx + 1} • {q.bloomsLevel || 'Understand'}
                            </span>

                            <div className="flex items-center gap-1">
                              {editingQId === q.id ? (
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(bank.marks, q.id)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" /> Save
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(q.id, q.text)}
                                  className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
                                  title="Edit Question"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => deleteQuestionFromBank(bank.marks, q.id)}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                title="Delete Question"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {editingQId === q.id ? (
                            <textarea
                              rows={2}
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#7A263A] focus:outline-none"
                            />
                          ) : (
                            <p className="text-xs font-medium text-slate-900 leading-relaxed">{q.text}</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-4">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <span>← Back to Exam Details</span>
          </button>
        ) : <div />}

        <div className="flex items-center gap-4">
          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            Total: <span className="font-bold text-slate-900">{totalQuestions}</span> questions ready across {bankList.length} categories.
          </div>
          <button
            type="button"
            onClick={onNext}
            className="px-6 py-2.5 bg-[#7A263A] hover:bg-[#651F30] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <span>Next: Paper Structure</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
