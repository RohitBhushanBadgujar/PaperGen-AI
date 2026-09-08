import React, { useState } from 'react';
import { BookOpen, Calendar, Clock, Award, Building2, Plus, Trash2 } from 'lucide-react';
import { usePaperGen } from '../../context/PaperGenContext';

export const StepExamDetails: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const { examDetails, updateExamDetails, showNotification } = usePaperGen();
  const [newInstruction, setNewInstruction] = useState('');

  const handleAddInstruction = () => {
    if (!newInstruction.trim()) return;
    updateExamDetails({
      instructions: [...(examDetails.instructions || []), newInstruction.trim()],
    });
    setNewInstruction('');
  };

  const handleRemoveInstruction = (index: number) => {
    updateExamDetails({
      instructions: examDetails.instructions.filter((_, i) => i !== index),
    });
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examDetails.subjectName.trim()) {
      showNotification('Please enter the Subject Name', 'error');
      return;
    }
    if (!examDetails.examName.trim()) {
      showNotification('Please enter the Exam Name', 'error');
      return;
    }
    onNext();
  };

  return (
    <form onSubmit={handleContinue} className="space-y-6 animate-in fade-in duration-200">
      {/* Overview card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-5">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-base font-semibold text-slate-900">Step 1 — Examination Metadata</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Enter the course, examination name, schedule, and institutional details for the paper header.
          </p>
        </div>

        {/* Primary Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Subject / Course Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="input-subject-name"
                required
                value={examDetails.subjectName}
                onChange={(e) => updateExamDetails({ subjectName: e.target.value })}
                placeholder="e.g. Applied Electronics"
                className="w-full pl-10 pr-3.5 py-2.5 papergen-input text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Examination Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Award className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="input-exam-name"
                required
                value={examDetails.examName}
                onChange={(e) => updateExamDetails({ examName: e.target.value })}
                placeholder="e.g. Internal Assessment II / Midterm Exam"
                className="w-full pl-10 pr-3.5 py-2.5 papergen-input text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Subject Code <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={examDetails.subjectCode}
              onChange={(e) => updateExamDetails({ subjectCode: e.target.value })}
              placeholder="e.g. EC8351"
              className="w-full px-3.5 py-2.5 papergen-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Duration / Time Allowed <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={examDetails.duration}
                onChange={(e) => updateExamDetails({ duration: e.target.value })}
                placeholder="e.g. 2 Hours or 90 Minutes"
                className="w-full pl-10 pr-3.5 py-2.5 papergen-input text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Target Total Marks
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                value={examDetails.totalMarks}
                onChange={(e) => updateExamDetails({ totalMarks: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 papergen-input text-sm font-semibold text-[#5B8DEF]"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                Marks
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              (Synchronizes automatically with Step 2 marking scheme)
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Exam Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={examDetails.date}
                onChange={(e) => updateExamDetails({ date: e.target.value })}
                className="w-full pl-10 pr-3.5 py-2.5 papergen-input text-sm"
              />
            </div>
          </div>
        </div>

        {/* Institution details */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              College / Institution Header
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={examDetails.collegeName}
                onChange={(e) => updateExamDetails({ collegeName: e.target.value })}
                placeholder="e.g. Springfield Engineering College"
                className="w-full pl-10 pr-3.5 py-2.5 papergen-input text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Department / Faculty
            </label>
            <input
              type="text"
              value={examDetails.department}
              onChange={(e) => updateExamDetails({ department: e.target.value })}
              placeholder="e.g. Department of Electronics & Communication"
              className="w-full px-3.5 py-2.5 papergen-input text-sm"
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <label className="block text-xs font-medium text-slate-700">
            Exam Instructions for Students
          </label>

          <div className="space-y-2">
            {examDetails.instructions?.map((ins, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-400">{idx + 1}.</span>
                  <span className="text-slate-800">{ins}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveInstruction(idx)}
                  className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newInstruction}
              onChange={(e) => setNewInstruction(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddInstruction();
                }
              }}
              placeholder="Type instruction (e.g. Draw circuit diagrams wherever required) and press enter..."
              className="flex-1 px-3.5 py-2 papergen-input text-xs"
            />
            <button
              type="button"
              onClick={handleAddInstruction}
              className="px-3.5 py-2 papergen-btn-secondary text-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation button */}
      <div className="flex justify-end">
        <button
          type="submit"
          id="btn-step1-next"
          className="px-5 py-2.5 papergen-btn-primary text-sm flex items-center gap-2 shadow-2xs"
        >
          <span>Continue to Marking Scheme →</span>
        </button>
      </div>
    </form>
  );
};
