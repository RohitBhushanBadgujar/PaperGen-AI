import React, { useState, useMemo } from 'react';
import { X, Clipboard, CheckCircle2, ListFilter, AlertCircle } from 'lucide-react';
import { splitTextIntoQuestions } from '../../services/pdf/pdfExtractor';
import { usePaperGen } from '../../context/PaperGenContext';

interface PasteTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetMarks: number;
}

export const PasteTextModal: React.FC<PasteTextModalProps> = ({
  isOpen,
  onClose,
  targetMarks,
}) => {
  const { addQuestionsToBank } = usePaperGen();
  const [rawText, setRawText] = useState('');
  const [bankTitle, setBankTitle] = useState(`${targetMarks}-Mark Questions`);

  const detectedQuestions = useMemo(() => {
    return splitTextIntoQuestions(rawText);
  }, [rawText]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (detectedQuestions.length === 0) return;
    addQuestionsToBank(targetMarks, detectedQuestions, bankTitle || 'Pasted Text Bank');
    setRawText('');
    onClose();
  };

  const samplePaste = `1. Define an oscillator and state its principle.
2. State two applications of positive feedback in electronic circuits.
3. What is the Barkhausen criterion for oscillation?
4. Define bandwidth and write down the expression.
5. Explain the role of snubber circuits in switching electronics.`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50/50 rounded-t-2xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-100 text-blue-800">
                {targetMarks} Marks Category
              </span>
              <span className="text-xs text-slate-500">Text Extraction & Parser</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Paste Questions Text Directly
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Paste questions formatted with 1., 2., 1), Q1., or Question 1. The parser will split multi-line questions automatically.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Input */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Source Name / Note</label>
              <button
                type="button"
                onClick={() => setRawText(samplePaste)}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Insert Sample Text
              </button>
            </div>
            <input
              type="text"
              value={bankTitle}
              onChange={(e) => setBankTitle(e.target.value)}
              placeholder="e.g. Unit 1 Revision Questions"
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
            />

            <label className="text-xs font-semibold text-slate-700">Paste Questions Here</label>
            <textarea
              rows={12}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`1. State the Barkhausen criterion.\n2. What is negative feedback?\n3. Explain the working of a transistor amplifier with a suitable circuit diagram and mention its applications.`}
              className="flex-1 w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono leading-relaxed focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none resize-none"
            />
          </div>

          {/* Right: Live Parser Detection */}
          <div className="flex flex-col bg-slate-50 rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center gap-2">
                <ListFilter className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Parsed Output
                </span>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  detectedQuestions.length > 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {detectedQuestions.length} Questions Detected
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[320px] pr-1">
              {detectedQuestions.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400">
                  {rawText.trim() ? (
                    <div className="space-y-2 text-amber-600">
                      <AlertCircle className="w-6 h-6 mx-auto" />
                      <p className="font-medium">No numbered questions detected yet.</p>
                      <p className="text-[11px] text-slate-500">
                        Ensure questions begin with 1., 2., Q1., or Question 1.
                      </p>
                    </div>
                  ) : (
                    'Paste questions on the left to see live separation here.'
                  )}
                </div>
              ) : (
                detectedQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-lg border border-slate-200 text-xs shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-blue-700 mb-1">
                      <span>Question {idx + 1}</span>
                      <span className="text-slate-400 font-normal">{targetMarks} Marks</span>
                    </div>
                    <p className="text-slate-800 leading-relaxed">{q}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50 rounded-b-2xl">
          <span className="text-xs text-slate-500">
            {detectedQuestions.length} questions will be added to {targetMarks}-mark bank
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-save-pasted-questions"
              disabled={detectedQuestions.length === 0}
              onClick={handleSave}
              className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save {detectedQuestions.length} Questions</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
