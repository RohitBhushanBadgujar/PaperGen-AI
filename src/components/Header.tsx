import React from 'react';
import { PlusCircle, Sparkles, FileCheck2 } from 'lucide-react';
import { usePaperGen } from '../context/PaperGenContext';
import { QuestionBank } from '../types';

export const Header: React.FC = () => {
  const { currentView, setCurrentView, loadSampleData, generatedPaper, questionBanks } = usePaperGen();

  const titleMap: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Teacher Examination Dashboard',
      subtitle: 'Create standardized examination papers from your question bank PDFs',
    },
    'create-wizard': {
      title: 'Create Question Paper',
      subtitle: 'Step-by-step workflow: Details → Rubric → Generation',
    },
    banks: {
      title: 'Question Banks Repository',
      subtitle: 'Manage and inspect extracted questions across all mark categories',
    },
    editor: {
      title: 'Question Paper Editor',
      subtitle: 'Review sets, edit questions, swap with bank items, and export',
    },
    'answer-keys': {
      title: 'Answer Key & Scheme of Valuation',
      subtitle: 'Prepare grading rubrics and model solutions for examiners',
    },
    settings: {
      title: 'Institution & Examination Settings',
      subtitle: 'Configure default headers, instructions, and export preferences',
    },
  };

  const currentInfo = titleMap[currentView] || titleMap.dashboard;
  const totalQuestions = (Object.values(questionBanks) as QuestionBank[]).reduce((acc, b) => acc + (b.questions?.length || 0), 0);

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-2xs">
      <div>
        <h1 className="text-lg font-semibold text-slate-900 tracking-tight">{currentInfo.title}</h1>
        <p className="text-xs text-slate-500 mt-0.5">{currentInfo.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {totalQuestions === 0 && (
          <button
            id="btn-load-sample-bank-header"
            onClick={loadSampleData}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#5B8DEF] bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
            title="Load sample Applied Electronics question bank with 2M, 3M, 5M, 10M questions"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#5B8DEF]" />
            <span>Load Sample Bank</span>
          </button>
        )}

        {generatedPaper && currentView !== 'editor' && (
          <button
            id="btn-view-active-paper"
            onClick={() => setCurrentView('editor')}
            className="flex items-center gap-1.5 px-3 py-1.5 papergen-btn-secondary text-xs"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-[#5B8DEF]" />
            <span>Active Paper ({generatedPaper.sets.length} Sets)</span>
          </button>
        )}

        {currentView !== 'create-wizard' && (
          <button
            id="btn-header-create-paper"
            onClick={() => setCurrentView('create-wizard')}
            className="flex items-center gap-2 px-4 py-2 papergen-btn-primary text-xs font-semibold shadow-2xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Create Paper</span>
          </button>
        )}
      </div>
    </header>
  );
};

