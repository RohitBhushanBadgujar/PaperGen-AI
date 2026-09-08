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
    { view: 'create-wizard', label: 'Create Paper', icon: <PlusCircle className="w-4 h-4 text-[#7A263A]" /> },
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
    <aside className="w-64 bg-[#F7F3EA] text-[#171717] flex flex-col h-screen border-r border-[#DDD8CE] select-none shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#DDD8CE] flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#7A263A] flex items-center justify-center text-white font-bold text-lg tracking-tight shadow-2xs">
          P
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[#171717] tracking-tight text-base">PaperGen-AI</span>
          </div>
          <p className="text-xs text-[#68645D]">Academic Paper Studio</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#68645D]/80">
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
                  ? 'bg-[#F9F1F3] text-[#7A263A] font-semibold shadow-2xs'
                  : 'text-[#68645D] hover:bg-[#EEE9DF] hover:text-[#171717] font-medium'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-[#7A263A]' : 'text-[#68645D]'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    isActive ? 'bg-[#7A263A]/15 text-[#7A263A]' : 'bg-[#DDD8CE]/50 text-[#68645D]'
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
      <div className="p-4 border-t border-[#DDD8CE] bg-[#FCFAF5] space-y-3">
        <div className="bg-[#FFFFFF] rounded-lg p-3 border border-[#DDD8CE] text-xs shadow-2xs">
          <div className="flex items-center justify-between text-[#171717] mb-1">
            <div className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#536B57]" />
              <span>Active Session</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#536B57]"></span>
          </div>
          <p className="text-[11px] text-[#68645D] leading-relaxed">
            {totalBanks} active banks ({totalQuestions} questions). Securely cached in browser memory.
          </p>
        </div>

        {!showClearConfirm ? (
          <button
            id="btn-clear-session"
            onClick={() => setShowClearConfirm(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#9B4A4A] bg-[#9B4A4A]/10 hover:bg-[#9B4A4A]/20 border border-[#9B4A4A]/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Session Data</span>
          </button>
        ) : (
          <div className="bg-[#9B4A4A]/10 border border-[#9B4A4A]/30 rounded-lg p-2.5 text-xs text-[#9B4A4A] space-y-2">
            <div className="flex items-center gap-1.5 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-[#9B4A4A]" />
              <span>Reset session data?</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="btn-confirm-delete-session"
                onClick={() => {
                  clearSession();
                  setShowClearConfirm(false);
                }}
                className="flex-1 bg-[#9B4A4A] hover:bg-[#853E3E] text-white font-medium py-1 rounded transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-2 bg-white border border-[#DDD8CE] hover:bg-[#FCFAF5] text-[#171717] py-1 rounded transition-colors"
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

