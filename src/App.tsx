import React from 'react';
import { PaperGenProvider, usePaperGen } from './context/PaperGenContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { NotificationToast } from './components/NotificationToast';
import { DashboardView } from './components/dashboard/DashboardView';
import { CreatePaperWizard } from './components/wizard/CreatePaperWizard';
import { QuestionBanksView } from './components/banks/QuestionBanksView';
import { PaperEditorView } from './components/editor/PaperEditorView';
import { AnswerKeyEditorView } from './components/editor/AnswerKeyEditorView';
import { SettingsView } from './components/settings/SettingsView';

const MainContent: React.FC = () => {
  const { currentView } = usePaperGen();

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
      <Header />

      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'create-wizard' && <CreatePaperWizard />}
        {currentView === 'banks' && <QuestionBanksView />}
        {currentView === 'editor' && <PaperEditorView />}
        {currentView === 'answer-keys' && <AnswerKeyEditorView />}
        {currentView === 'settings' && <SettingsView />}
      </main>

      <NotificationToast />
    </div>
  );
};

export default function App() {
  return (
    <PaperGenProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-slate-900 font-sans">
        <Sidebar />
        <MainContent />
      </div>
    </PaperGenProvider>
  );
}
