import React, { useState } from 'react';
import { X, Search, CheckCircle, ArrowRight } from 'lucide-react';
import { usePaperGen } from '../../context/PaperGenContext';
import { PaperQuestion } from '../../types';

interface ReplaceQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuestion: PaperQuestion | null;
  setId: string;
}

export const ReplaceQuestionModal: React.FC<ReplaceQuestionModalProps> = ({
  isOpen,
  onClose,
  currentQuestion,
  setId,
}) => {
  const { questionBanks, replacePaperQuestionWithBank } = usePaperGen();
  const [search, setSearch] = useState('');

  if (!isOpen || !currentQuestion) return null;

  const markTier = currentQuestion.marks;
  const bank = questionBanks[markTier];
  const allBankQuestions = bank?.questions || [];

  // Filter out the exact question currently shown and apply search
  const candidates = allBankQuestions.filter(
    (q) => q.id !== currentQuestion.originalBankQuestionId && q.text.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (bankQId: string) => {
    replacePaperQuestionWithBank(setId, currentQuestion.id, bankQId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50/50 rounded-t-2xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                {markTier} Marks Bank
              </span>
              <span className="text-xs text-slate-500">
                {allBankQuestions.length} total questions available
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Replace Question {currentQuestion.displayNumber}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Question preview */}
        <div className="p-4 mx-6 mt-4 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs">
          <div className="font-semibold text-amber-900 mb-1">Current Question on Paper:</div>
          <p className="text-amber-950 text-sm leading-relaxed">{currentQuestion.text}</p>
        </div>

        {/* Search Input */}
        <div className="p-6 pb-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search in ${markTier}-mark question bank...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Candidate Questions List */}
        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-3">
          {candidates.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No alternative questions found matching your search.
            </div>
          ) : (
            candidates.map((q, idx) => (
              <div
                key={q.id}
                className="group p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Option #{idx + 1}
                    </span>
                    {q.sourceFileName && (
                      <span className="text-[11px] text-slate-400">from {q.sourceFileName}</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-800 font-medium leading-relaxed">{q.text}</p>
                  {q.sampleAnswer && (
                    <div className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="font-semibold text-slate-600">Answer Outline: </span>
                      {q.sampleAnswer}
                    </div>
                  )}
                </div>
                <button
                  id={`btn-choose-replacement-${q.id}`}
                  onClick={() => handleSelect(q.id)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <span>Select</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex justify-end bg-slate-50/50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
