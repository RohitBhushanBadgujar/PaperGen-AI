import React, { useState } from 'react';
import { X, Search, Trash2, Edit3, Plus, Check, FileText } from 'lucide-react';
import { usePaperGen } from '../../context/PaperGenContext';
import { QuestionBank, BloomsLevel } from '../../types';

interface InspectBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  bank: QuestionBank | null;
}

export const InspectBankModal: React.FC<InspectBankModalProps> = ({
  isOpen,
  onClose,
  bank,
}) => {
  const { deleteQuestionFromBank, editQuestionInBank, addQuestionsToBank, editQuestionBloomLevel } = usePaperGen();
  const [search, setSearch] = useState('');
  const [selectedBloomFilter, setSelectedBloomFilter] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionBloom, setNewQuestionBloom] = useState<BloomsLevel>('Understand');
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen || !bank) return null;

  const filteredQuestions = bank.questions.filter((q) => {
    const matchesSearch = q.text.toLowerCase().includes(search.toLowerCase());
    const matchesBloom = selectedBloomFilter === 'all' || q.bloomsLevel === selectedBloomFilter;
    return matchesSearch && matchesBloom;
  });

  const startEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const saveEdit = (id: string) => {
    if (editText.trim()) {
      editQuestionInBank(bank.marks, id, editText.trim());
    }
    setEditingId(null);
  };

  const handleAddNew = () => {
    if (!newQuestionText.trim()) return;
    addQuestionsToBank(bank.marks, [newQuestionText.trim()], 'Manual Entry');
    setNewQuestionText('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50/50 rounded-t-2xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-100 text-blue-800">
                {bank.marks} Marks Category
              </span>
              <span className="text-xs text-slate-500">
                {bank.questions.length} Extracted Questions
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">{bank.name}</h2>
            {bank.fileName && (
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                <span>Source: {bank.fileName}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Filters */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-white">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search in ${bank.questions.length} questions...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedBloomFilter}
              onChange={(e) => setSelectedBloomFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Bloom Levels</option>
              <option value="Remember">Remember</option>
              <option value="Understand">Understand</option>
              <option value="Apply">Apply</option>
              <option value="Analyze">Analyze</option>
              <option value="Evaluate">Evaluate</option>
              <option value="Create">Create</option>
            </select>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question</span>
            </button>
          </div>
        </div>

        {/* Add Question Inline Box */}
        {showAddForm && (
          <div className="p-4 mx-6 mt-3 bg-blue-50/50 border border-blue-200 rounded-xl space-y-3">
            <div className="text-xs font-semibold text-blue-900">Add New {bank.marks}-Mark Question</div>
            <textarea
              rows={3}
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              placeholder="e.g. State the condition for oscillation in Hartley oscillator."
              className="w-full p-2.5 bg-white border border-blue-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600">Bloom's Level:</span>
                <select
                  value={newQuestionBloom}
                  onChange={(e) => setNewQuestionBloom(e.target.value as BloomsLevel)}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800"
                >
                  <option value="Remember">Remember</option>
                  <option value="Understand">Understand</option>
                  <option value="Apply">Apply</option>
                  <option value="Analyze">Analyze</option>
                  <option value="Evaluate">Evaluate</option>
                  <option value="Create">Create</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200/60 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNew}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-xs"
                >
                  Add to Bank
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Questions list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredQuestions.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No questions found matching your filter.
            </div>
          ) : (
            filteredQuestions.map((q, idx) => {
              const isEditing = editingId === q.id;

              return (
                <div
                  key={q.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        Q{idx + 1}
                      </span>
                      <select
                        value={q.bloomsLevel || 'Understand'}
                        onChange={(e) => editQuestionBloomLevel(bank.marks, q.id, e.target.value as BloomsLevel)}
                        className="px-2.5 py-0.5 bg-slate-50 border border-slate-300 rounded text-[11px] font-bold text-indigo-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        title="Change Bloom's Taxonomy Level"
                      >
                        <option value="Remember">Remember</option>
                        <option value="Understand">Understand</option>
                        <option value="Apply">Apply</option>
                        <option value="Analyze">Analyze</option>
                        <option value="Evaluate">Evaluate</option>
                        <option value="Create">Create</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400">
                      {isEditing ? (
                        <button
                          onClick={() => saveEdit(q.id)}
                          className="p-1 rounded text-emerald-600 hover:bg-emerald-50"
                          title="Save Changes"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => startEdit(q.id, q.text)}
                          className="p-1 rounded hover:text-slate-700 hover:bg-slate-100"
                          title="Edit Question"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteQuestionFromBank(bank.marks, q.id)}
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
                      className="w-full p-2 text-xs border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                    />
                  ) : (
                    <p className="text-xs text-slate-800 leading-relaxed font-medium">{q.text}</p>
                  )}

                  {q.sampleAnswer && !isEditing && (
                    <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                      <span className="font-semibold text-slate-600">Model Answer: </span>
                      {q.sampleAnswer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Done Inspecting
          </button>
        </div>
      </div>
    </div>
  );
};
