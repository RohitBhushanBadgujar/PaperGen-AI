import React, { useState } from 'react';
import { Settings as SettingsIcon, Building2, BookOpen, Clock, ShieldCheck, Trash2, CheckCircle2, RotateCcw } from 'lucide-react';
import { usePaperGen } from '../../context/PaperGenContext';

export const SettingsView: React.FC = () => {
  const { examDetails, updateExamDetails, clearSession, showNotification } = usePaperGen();

  const handleSaveDefaults = (e: React.FormEvent) => {
    e.preventDefault();
    showNotification('Settings and institutional preferences saved!', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <h2 className="text-base font-bold text-slate-900">
          Institution & Examination Preferences
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure default metadata and instructions automatically populated into new question papers.
        </p>

        <form onSubmit={handleSaveDefaults} className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Default College / Institution Name
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={examDetails.collegeName}
                  onChange={(e) => updateExamDetails({ collegeName: e.target.value })}
                  placeholder="e.g. Apex Institute of Technology"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Default Department / Faculty
              </label>
              <input
                type="text"
                value={examDetails.department}
                onChange={(e) => updateExamDetails({ department: e.target.value })}
                placeholder="e.g. Department of Electronics & Communication"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Standard Time Duration
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={examDetails.duration}
                  onChange={(e) => updateExamDetails({ duration: e.target.value })}
                  placeholder="e.g. 2 Hours"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Preferences</span>
            </button>
          </div>
        </form>
      </div>

      {/* Session Security & Privacy Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Local Privacy & Temporary Session Data</span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          PaperGen AI operates client-side with no persistent remote storage required. Uploaded PDF question banks, parsed questions, and generated papers exist strictly in your temporary browser session memory.
        </p>

        <div className="pt-2">
          <button
            onClick={clearSession}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
            <span>Reset & Delete All Session Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
