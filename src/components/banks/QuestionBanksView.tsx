import React, { useState } from 'react';
import {
  FolderOpen,
  Plus,
  ClipboardPaste,
  Search,
  Trash2,
  Edit3,
  Check,
  FileText,
  Eye,
  UploadCloud,
  Sparkles,
} from 'lucide-react';
import { usePaperGen } from '../../context/PaperGenContext';
import { PasteTextModal } from '../modals/PasteTextModal';
import { InspectBankModal } from '../modals/InspectBankModal';
import { QuestionBank } from '../../types';
import { extractQuestionsFromPDF } from '../../services/pdf/pdfExtractor';

export const QuestionBanksView: React.FC = () => {
  const {
    questionBanks,
    addQuestionsToBank,
    deleteQuestionFromBank,
    editQuestionInBank,
    showNotification,
    loadSampleData,
  } = usePaperGen();

  const [selectedMark, setSelectedMark] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');
  const [pasteModalMarks, setPasteModalMarks] = useState<number | null>(null);
  const [inspectingBank, setInspectingBank] = useState<QuestionBank | null>(null);
  const [editingQId, setEditingQId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [newMarkInput, setNewMarkInput] = useState<number>(2);
  const [showAddMarkBank, setShowAddMarkBank] = useState(false);

  const bankList = Object.values(questionBanks) as QuestionBank[];
  const totalQuestions = bankList.reduce((acc, b) => acc + (b.questions?.length || 0), 0);

  // Filtered list of questions
  const displayedQuestions = bankList
    .filter((b: QuestionBank) => selectedMark === 'all' || b.marks === selectedMark)
    .flatMap((b: QuestionBank) => b.questions.map((q) => ({ ...q, bankMarks: b.marks, bankName: b.name })))
    .filter((q) => q.text.toLowerCase().includes(search.toLowerCase()));

  const handleStartEdit = (id: string, text: string) => {
    setEditingQId(id);
    setEditText(text);
  };

  const handleSaveEdit = (marks: number, id: string) => {
    if (editText.trim()) {
      editQuestionInBank(marks, id, editText.trim());
    }
    setEditingQId(null);
  };

  const handlePdfUpload = async (marks: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await extractQuestionsFromPDF(file);
      if (res.success && res.questions.length > 0) {
        addQuestionsToBank(marks, res.questions, file.name);
      } else {
        showNotification(res.errorMessage || 'Failed to extract questions from PDF', 'error');
      }
    } catch (err) {
      showNotification('Error reading PDF file', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Question Banks Repository</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {bankList.length} banks loaded with {totalQuestions} total questions in session memory.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {totalQuestions === 0 && (
            <button
              onClick={loadSampleData}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Load Sample Banks</span>
            </button>
          )}

          <button
            onClick={() => setShowAddMarkBank(!showAddMarkBank)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Mark Category</span>
          </button>
        </div>
      </div>

      {/* Add New Mark Category Banner */}
      {showAddMarkBank && (
        <div className="bg-blue-50/60 border border-blue-200 p-4 rounded-2xl flex items-center justify-between gap-4 animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-blue-950">Select Mark for New Bank:</span>
            <select
              value={newMarkInput}
              onChange={(e) => setNewMarkInput(parseInt(e.target.value))}
              className="px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-bold text-slate-800"
            >
              {[1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20].map((m) => (
                <option key={m} value={m}>
                  {m} Marks Category
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPasteModalMarks(newMarkInput);
                setShowAddMarkBank(false);
              }}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg shadow-2xs"
            >
              Paste Questions Text
            </button>
            <label className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-2xs cursor-pointer flex items-center gap-1.5">
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload PDF</span>
              <input
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  handlePdfUpload(newMarkInput, e);
                  setShowAddMarkBank(false);
                }}
              />
            </label>
          </div>
        </div>
      )}

      {/* Mark Categories Tabs Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedMark('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                selectedMark === 'all'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Categories ({totalQuestions})
            </button>

            {bankList.map((b) => (
              <button
                key={b.marks}
                onClick={() => setSelectedMark(b.marks)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  selectedMark === b.marks
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{b.marks} Marks</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedMark === b.marks ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {b.questions.length}
                </span>
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search in questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-3">
        {displayedQuestions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400 text-xs">
            No questions found in this category. Upload a PDF or paste text to add questions.
          </div>
        ) : (
          displayedQuestions.map((q, idx) => {
            const isEditing = editingQId === q.id;

            return (
              <div
                key={q.id}
                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                      {q.bankMarks} Marks
                    </span>
                    {q.sourceFileName && (
                      <span className="text-[11px] text-slate-400">from {q.sourceFileName}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-slate-400">
                    {isEditing ? (
                      <button
                        onClick={() => handleSaveEdit(q.bankMarks, q.id)}
                        className="p-1 rounded text-emerald-600 hover:bg-emerald-50"
                        title="Save Changes"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(q.id, q.text)}
                        className="p-1 rounded hover:text-slate-700 hover:bg-slate-100"
                        title="Edit Question"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => deleteQuestionFromBank(q.bankMarks, q.id)}
                      className="p-1 rounded hover:text-red-600 hover:bg-red-50"
                      title="Delete Question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  <textarea
                    rows={3}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full p-2.5 text-xs border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                  />
                ) : (
                  <p className="text-xs text-slate-900 font-medium leading-relaxed">{q.text}</p>
                )}

                {q.sampleAnswer && !isEditing && (
                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-600">Model Answer: </span>
                    {q.sampleAnswer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      {pasteModalMarks !== null && (
        <PasteTextModal
          isOpen={true}
          onClose={() => setPasteModalMarks(null)}
          targetMarks={pasteModalMarks}
        />
      )}

      <InspectBankModal
        isOpen={!!inspectingBank}
        onClose={() => setInspectingBank(null)}
        bank={inspectingBank}
      />
    </div>
  );
};
