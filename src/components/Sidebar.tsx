import React, { useState } from 'react';
import {
  FileText,
  PlusCircle,
  FolderOpen,
  FileCheck2,
  KeyRound,
  Settings,
  Trash2,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { usePaperGen } from '../context/PaperGenContext';
import { AppView, QuestionBank } from '../types';

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, clearSession, generatedPaper, questionBanks } = usePaperGen();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const totalQuestions = (Object.values(questionBanks) as QuestionBank[]).reduce((acc, b) => acc + (b.questions?.length || 0), 0);
  const totalBanks = Object.keys(questionBanks).length;

  const navItems: { view: AppView; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { view: 'dashboard', label: 'Dashboard', icon: <FileText className="w-4 h-4" /> },
    { view: 'create-wizard', label: 'Create Paper', icon: <PlusCircle className="w-4 h-4 text-[#5B8DEF]" /> },
    {
      view: 'banks',
      label: 'Question Banks',
      icon: <FolderOpen className="w-4 h-4" />,
      badge: totalQuestions > 0 ? `${totalQuestions} Qs` : undefined,
    },
    {
      view: 'editor',
      label: 'Generated Papers',
      icon: <FileCheck2 className="w-4 h-4" />,
      badge: generatedPaper ? `${generatedPaper.sets.length} Sets` : undefined,
    },
    {
      view: 'answer-keys',
      label: 'Answer Keys',
      icon: <KeyRound className="w-4 h-4" />,
    },
    { view: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-white text-slate-700 flex flex-col h-screen border-r border-slate-200 select-none shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#5B8DEF] flex items-center justify-center text-white font-bold text-lg tracking-tight shadow-2xs">
          P
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-900 tracking-tight text-base">PaperGen</span>
            <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-[#5B8DEF] border border-blue-100">
              Pro
            </span>
          </div>
          <p className="text-xs text-slate-500">Academic Paper Studio</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">
          Examination Workspace
        </div>

        {navItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              id={`nav-btn-${item.view}`}
              onClick={() => setCurrentView(item.view)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all text-left ${
                isActive
                  ? 'bg-[#F3F7FF] text-[#5B8DEF] font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-[#5B8DEF]' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    isActive ? 'bg-blue-100 text-[#5B8DEF]' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Session Info & Clear Session */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-3">
        <div className="bg-white rounded-lg p-3 border border-slate-200 text-xs shadow-2xs">
          <div className="flex items-center justify-between text-slate-700 mb-1">
            <div className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Active Session</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {totalBanks} active banks ({totalQuestions} questions). Data securely cached in browser memory.
          </p>
        </div>

        {!showClearConfirm ? (
          <button
            id="btn-clear-session"
            onClick={() => setShowClearConfirm(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Session Data</span>
          </button>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-xs text-red-800 space-y-2">
            <div className="flex items-center gap-1.5 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              <span>Reset session data?</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="btn-confirm-delete-session"
                onClick={() => {
                  clearSession();
                  setShowClearConfirm(false);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-1 rounded transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-1 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

