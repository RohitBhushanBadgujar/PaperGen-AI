import React, { useState } from 'react';
import { BookOpen, Layers, UploadCloud, Sliders, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StepExamDetails } from './StepExamDetails';
import { StepRubric } from './StepRubric';
import { StepGenerateSettings } from './StepGenerateSettings';

export const CreatePaperWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  const steps = [
    { id: 1, label: 'Exam Details', icon: <BookOpen className="w-4 h-4" /> },
    { id: 2, label: 'Marking Scheme', icon: <Layers className="w-4 h-4" /> },
    { id: 3, label: 'Generate Paper', icon: <Sliders className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Wizard Step Progress Header */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {steps.map((step) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;

            return (
              <button
                key={step.id}
                type="button"
                id={`wizard-step-tab-${step.id}`}
                onClick={() => {
                  if (step.id < currentStep) {
                    setCurrentStep(step.id);
                  }
                }}
                disabled={step.id > currentStep}
                className={`p-3 rounded-lg flex items-center gap-3 text-left transition-all ${
                  isCurrent
                    ? 'bg-[#F3F7FF] border border-blue-200 text-[#5B8DEF] shadow-2xs'
                    : isCompleted
                    ? 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 cursor-pointer'
                    : 'text-slate-400 opacity-60 cursor-not-allowed border border-slate-100 bg-slate-50/50'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center font-semibold text-xs shrink-0 transition-colors ${
                    isCurrent
                      ? 'bg-[#5B8DEF] text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : `0${step.id}`}
                </div>
                <div className="overflow-hidden">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    Step 0{step.id}
                  </div>
                  <div className="text-xs font-semibold truncate text-slate-900">{step.label}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Components with smooth subtle transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {currentStep === 1 && <StepExamDetails onNext={() => setCurrentStep(2)} />}
          {currentStep === 2 && (
            <StepRubric onNext={() => setCurrentStep(3)} onBack={() => setCurrentStep(1)} />
          )}
          {currentStep === 3 && <StepGenerateSettings onBack={() => setCurrentStep(2)} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
