import React, { useState } from 'react';
import { BookOpen, Layers, Sliders, CheckCircle2, FileCheck2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StepExamDetails } from './StepExamDetails';
import { StepRubric } from './StepRubric';
import { StepGenerateSettings } from './StepGenerateSettings';

export const CreatePaperWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  const steps = [
    { id: 1, label: 'Exam Details', icon: <BookOpen className="w-4 h-4" /> },
    { id: 2, label: 'Paper Structure', icon: <Layers className="w-4 h-4" /> },
    { id: 3, label: 'Review & Generate', icon: <FileCheck2 className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Wizard Step Progress Header */}
      <div className="papergen-card p-3">
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
                className={`p-2.5 rounded-lg flex items-center gap-2.5 text-left transition-all ${
                  isCurrent
                    ? 'bg-[#F9F1F3] border border-[#7A263A]/30 text-[#7A263A] shadow-2xs'
                    : isCompleted
                    ? 'bg-[#FFFFFF] text-[#171717] hover:bg-[#FCFAF5] border border-[#DDD8CE] cursor-pointer'
                    : 'text-[#68645D]/60 opacity-60 cursor-not-allowed border border-[#DDD8CE]/50 bg-[#FCFAF5]/50'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center font-semibold text-[11px] shrink-0 transition-colors ${
                    isCurrent
                      ? 'bg-[#7A263A] text-white'
                      : isCompleted
                      ? 'bg-[#536B57] text-white'
                      : 'bg-[#DDD8CE] text-[#68645D]'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : `0${step.id}`}
                </div>
                <div className="overflow-hidden">
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-[#68645D]">
                    Step 0{step.id}
                  </div>
                  <div className="text-xs font-bold truncate text-[#171717]">{step.label}</div>
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
            <StepRubric
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
              stepMode="structure"
            />
          )}
          {currentStep === 3 && <StepGenerateSettings onBack={() => setCurrentStep(2)} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
