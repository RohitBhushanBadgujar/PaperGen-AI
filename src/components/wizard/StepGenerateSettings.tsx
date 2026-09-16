import React, { useState } from 'react';
import {
  FileCheck2,
  Shuffle,
  Layers,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Sliders,
  Repeat,
  ListOrdered,
  HelpCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { usePaperGen } from '../../context/PaperGenContext';
import { getSetLabel } from '../../services/paper-generator/generator';

export const StepGenerateSettings: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const {
    examDetails,
    rubrics,
    questionBanks,
    triggerGeneratePaper,
  } = usePaperGen();

  const [selectedSetOption, setSelectedSetOption] = useState<string>('1');
  const [customSetsCount, setCustomSetsCount] = useState<number>(9);
  const [shuffleOrder, setShuffleOrder] = useState<'section' | 'original'>('section');
  const [reduceRepetition, setReduceRepetition] = useState<boolean>(false);
  const [continuousNumbering, setContinuousNumbering] = useState<boolean>(true);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStepText, setGenerationStepText] = useState<string>('');
  const [warnings, setWarnings] = useState<string[]>([]);

  const totalCalculatedMarks = rubrics.reduce(
    (sum, r) => {
      const q = r.questions !== undefined ? r.questions : (r.questionsRequired || 5);
      const att = r.attemptAny !== undefined ? r.attemptAny : q;
      return sum + r.marksPerQuestion * att;
    },
    0
  );

  const totalQuestionsRequiredPerSet = rubrics.reduce(
    (sum, r) => {
      const q = r.questions !== undefined ? r.questions : (r.questionsRequired || 5);
      const att = r.attemptAny !== undefined ? r.attemptAny : q;
      return sum + att;
    },
    0
  );

  const effectiveNumberOfSets =
    selectedSetOption === 'custom'
      ? Math.max(1, customSetsCount || 1)
      : parseInt(selectedSetOption, 10) || 1;

  const totalAvailableQuestions = Object.values(questionBanks).reduce(
    (acc: number, b: any) => acc + (b.questions?.length || 0),
    0
  ) + rubrics.reduce((acc, r) => acc + (r.pdfQuestions?.length || 0), 0);

  const loadedBanksCount = Object.values(questionBanks).filter((b: any) => b.questions && b.questions.length > 0).length + (rubrics.some(r => r.pdfQuestions && r.pdfQuestions.length > 0) ? 1 : 0);

  const shortages = rubrics.filter(r => {
    const bank = questionBanks[r.marksPerQuestion];
    const bankCount = (bank?.questions?.length || 0) + (r.pdfQuestions?.length || 0);
    const secQuestions = r.questions !== undefined ? r.questions : (r.questionsRequired || 5);
    return bankCount < secQuestions;
  });

  const totalAttemptableMarks = rubrics.reduce((sum, r) => {
    const q = r.questions !== undefined ? r.questions : (r.questionsRequired || 5);
    const att = r.attemptAny !== undefined ? r.attemptAny : q;
    return sum + (att * r.marksPerQuestion);
  }, 0);

  const isMarksMismatch = totalAttemptableMarks !== examDetails.totalMarks;

  const hasNoQuestionBank = totalAvailableQuestions === 0;
  const hasShortage = shortages.length > 0;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setWarnings([]);

    // Progress animation sequence
    setGenerationStepText('Initializing exam rubric & question pools...');
    await new Promise((r) => setTimeout(r, 250));

    for (let i = 0; i < Math.min(effectiveNumberOfSets, 6); i++) {
      setGenerationStepText(`Generating ${getSetLabel(i)} with rubric balance...`);
      await new Promise((r) => setTimeout(r, 200));
    }

    if (effectiveNumberOfSets > 6) {
      setGenerationStepText(`Generating remaining ${effectiveNumberOfSets - 6} sets...`);
      await new Promise((r) => setTimeout(r, 200));
    }

    setGenerationStepText('Finalizing exam paper documents...');
    await new Promise((r) => setTimeout(r, 200));

    const res = triggerGeneratePaper({
      numberOfSets: effectiveNumberOfSets,
      shuffleOrder,
      reduceRepetition,
      continuousNumbering,
    });

    setIsGenerating(false);

    if (res.success) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    } else if (res.warnings) {
      setWarnings(res.warnings);
    }
  };

  const setOptions = [
    { value: '1', label: '1 Set' },
    { value: '2', label: '2 Sets' },
    { value: '3', label: '3 Sets' },
    { value: '4', label: '4 Sets' },
    { value: '5', label: '5 Sets' },
    { value: '6', label: '6 Sets' },
    { value: '7', label: '7 Sets' },
    { value: '8', label: '8 Sets' },
    { value: 'custom', label: 'Custom' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-8"
    >
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#7A263A]" />
              <span>Step 03 — Review & Generate</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review your examination details, paper structure, and question availability before generation.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 font-medium">
            <span>{rubrics.length} Sections</span>
            <span>•</span>
            <span className="font-bold text-slate-900">{totalQuestionsRequiredPerSet} Questions / Set</span>
            <span>•</span>
            <span className="font-bold text-[#7A263A]">{totalCalculatedMarks} Marks</span>
          </div>
        </div>

        {/* No Question Bank Warning Banner if empty */}
        {hasNoQuestionBank && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2 text-red-900">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span>No Question Bank Found</span>
            </div>
            <p className="text-xs text-red-700 leading-relaxed">
              Please upload a question bank PDF in Step 2 or load a sample question bank before generating the question paper.
            </p>
          </div>
        )}

        {/* Mismatch Warning Banner */}
        {isMarksMismatch && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-xs text-amber-900">
            <div className="flex items-center gap-1.5 font-bold text-sm">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Paper structure mismatch</span>
            </div>
            <p className="leading-relaxed">
              Target Total Marks: <strong>{examDetails.totalMarks}</strong> | Current Attemptable Marks: <strong>{totalAttemptableMarks}</strong>.
              {totalAttemptableMarks > examDetails.totalMarks ? ` Your paper structure exceeds the target by ${totalAttemptableMarks - examDetails.totalMarks} marks.` : ` Your paper structure is short by ${examDetails.totalMarks - totalAttemptableMarks} marks.`} Please adjust the sections before generating.
            </p>
          </div>
        )}

        {/* Shortage Warning Banner */}
        {hasShortage && !hasNoQuestionBank && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-xs text-amber-900">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Not Enough Questions Available</span>
            </div>
            {shortages.map(s => {
              const bank = questionBanks[s.marksPerQuestion];
              const bankCount = (bank?.questions?.length || 0) + (s.pdfQuestions?.length || 0);
              const req = s.questions !== undefined ? s.questions : (s.questionsRequired || 5);
              return (
                <p key={s.id} className="leading-relaxed">
                  Section "{s.sectionName}" requires {req} questions, but only {bankCount} are available for {s.marksPerQuestion}-mark tier.
                </p>
              );
            })}
          </div>
        )}

        {/* Comprehensive Review Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Exam Details Summary */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center justify-between">
              <span>Exam Details</span>
              <span className="text-[10px] text-slate-500 font-normal">Step 01</span>
            </div>
            <div className="space-y-1 text-xs">
              <div><span className="text-slate-500">Subject:</span> <strong className="text-slate-800">{examDetails.subjectName || 'Not specified'}</strong></div>
              <div><span className="text-slate-500">Exam:</span> <strong className="text-slate-800">{examDetails.examName || 'Not specified'}</strong></div>
              <div><span className="text-slate-500">Duration:</span> <strong className="text-slate-800">{examDetails.duration || 'Not specified'}</strong></div>
              <div><span className="text-slate-500">Max Marks:</span> <strong className="text-[#7A263A]">{totalCalculatedMarks}</strong></div>
            </div>
          </div>

          {/* Paper Structure Summary */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center justify-between">
              <span>Paper Structure</span>
              <span className="text-[10px] text-slate-500 font-normal">Step 02</span>
            </div>
            <div className="space-y-1 text-xs">
              <div><span className="text-slate-500">Total Marks:</span> <strong className="text-slate-900">{totalCalculatedMarks}</strong></div>
              <div><span className="text-slate-500">Sections:</span> <strong className="text-slate-900">{rubrics.length}</strong></div>
              <div><span className="text-slate-500">Questions / Set:</span> <strong className="text-slate-900">{totalQuestionsRequiredPerSet}</strong></div>
            </div>
          </div>

          {/* Question Bank Status Summary */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center justify-between">
              <span>Question Bank Status</span>
              <span className="text-[10px] text-slate-500 font-normal">Source Pool</span>
            </div>
            <div className="space-y-1 text-xs">
              <div><span className="text-slate-500">Question Banks Loaded:</span> <strong className="text-slate-900">{loadedBanksCount}</strong></div>
              <div><span className="text-slate-500">Total Questions Available:</span> <strong className={totalAvailableQuestions > 0 ? 'text-emerald-700 font-bold' : 'text-red-600 font-bold'}>{totalAvailableQuestions}</strong></div>
              <div className="pt-1 border-t border-slate-200 text-[11px] text-slate-600 space-y-0.5">
                {Object.values(questionBanks).map((b: any) => (
                  <div key={b.marks} className="flex justify-between">
                    <span>{b.marks}-Mark Qs:</span>
                    <strong className="text-slate-800">{b.questions?.length || 0}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 1. NUMBER OF SETS */}
        <div className="p-5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
                1. How many sets do you want?
              </label>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate multiple parallel question papers with balanced difficulty and identical rubric rules.
              </p>
            </div>

            <div className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 shrink-0">
              Generating:{' '}
              {effectiveNumberOfSets === 1
                ? '1 Single Set (Set A)'
                : `${effectiveNumberOfSets} Sets (Set A – ${getSetLabel(effectiveNumberOfSets - 1)})`}
            </div>
          </div>

          {/* Set Selector Tabs */}
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
            {setOptions.map((opt) => {
              const isSelected = selectedSetOption === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  id={`btn-select-set-${opt.value}`}
                  onClick={() => setSelectedSetOption(opt.value)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Custom Set Input */}
          <AnimatePresence>
            {selectedSetOption === 'custom' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden pt-2"
              >
                <div className="p-3.5 bg-white rounded-xl border border-blue-200 flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-700">Enter Number of Sets:</span>
                  <input
                    type="number"
                    id="input-custom-sets-count"
                    min="1"
                    max="26"
                    value={customSetsCount}
                    onChange={(e) => setCustomSetsCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-blue-700 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-xs text-slate-500">
                    (e.g., 9 Sets will produce Set A through Set I)
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 2. SHUFFLE QUESTIONS & 3. REPETITION CONTROLS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Question Order / Shuffle Setting */}
          <div className="p-5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Shuffle className="w-4 h-4 text-blue-600" />
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  2. Question Order
                </label>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Control the order of questions inside each section.
              </p>
            </div>

            <div className="space-y-2.5">
              <label
                onClick={() => setShuffleOrder('section')}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  shuffleOrder === 'section'
                    ? 'bg-blue-50/70 border-blue-300 text-blue-950 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="shuffleOrder"
                  checked={shuffleOrder === 'section'}
                  onChange={() => setShuffleOrder('section')}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <span>Shuffle Within Sections</span>
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/70 px-1.5 py-0.2 rounded">
                      Recommended
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Randomly shuffles questions within each section without crossing mark categories.
                  </div>
                </div>
              </label>

              <label
                onClick={() => setShuffleOrder('original')}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  shuffleOrder === 'original'
                    ? 'bg-blue-50/70 border-blue-300 text-blue-950 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="shuffleOrder"
                  checked={shuffleOrder === 'original'}
                  onChange={() => setShuffleOrder('original')}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-bold">Keep Original Order</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Questions remain in the order they were parsed from your question bank.
                  </div>
                </div>
              </label>
            </div>

            {/* Visual rubric safeguard notice */}
            <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Rubric Integrity Guaranteed:</strong> Shuffling only occurs within each section. A 2-mark question will never move into the 3-mark section.
              </span>
            </div>
          </div>

          {/* Repetition & Numbering Settings */}
          <div className="p-5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-blue-600" />
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  3. Repetition & Numbering
                </label>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Fine-tune cross-set duplication and question numbering format.
              </p>
            </div>

            <div className="space-y-3">
              {/* Repetition Toggle */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  reduceRepetition
                    ? 'bg-blue-50/70 border-blue-300 text-blue-950 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  id="checkbox-reduce-repetition"
                  checked={reduceRepetition}
                  onChange={(e) => setReduceRepetition(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-bold">Reduce Repeated Questions Across Sets</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    {reduceRepetition
                      ? 'ON: Attempts to select unique questions for each set from the available bank pool.'
                      : 'OFF: Questions can repeat freely across sets (each set samples independently).'}
                  </div>
                </div>
              </label>

              {/* Numbering format toggle */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ListOrdered className="w-3.5 h-3.5 text-slate-500" />
                  <span>Question Numbering Style</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setContinuousNumbering(true)}
                    className={`py-1.5 px-2 rounded-lg font-semibold border transition-all text-center ${
                      continuousNumbering
                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Continuous (Q1–Q{totalQuestionsRequiredPerSet})
                  </button>
                  <button
                    type="button"
                    onClick={() => setContinuousNumbering(false)}
                    className={`py-1.5 px-2 rounded-lg font-semibold border transition-all text-center ${
                      !continuousNumbering
                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Reset per Section (Q1...)
                  </button>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500">
              All settings apply across all generated sets in real-time.
            </div>
          </div>
        </div>

        {/* Paper Structure Summary Verification */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Examination Structure & Question Bank Availability
            </h3>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Total: {totalCalculatedMarks} Marks
            </span>
          </div>

          {/* Sections Breakdown */}
          <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="p-2.5 pl-3">Section</th>
                  <th className="p-2.5">Marks / Q</th>
                  <th className="p-2.5">Required per Set</th>
                  <th className="p-2.5">Available in Bank</th>
                  <th className="p-2.5 text-right pr-3">Section Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rubrics.map((r) => {
                  const bank = questionBanks[r.marksPerQuestion];
                  const bankCount = bank?.questions?.length || 0;
                  const secQuestions = r.questions !== undefined ? r.questions : (r.questionsRequired || 5);
                  const secAttemptAny = r.attemptAny !== undefined ? r.attemptAny : secQuestions;
                  const isEnough = bankCount >= secQuestions;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="p-2.5 pl-3 font-semibold text-slate-900">{r.sectionName}</td>
                      <td className="p-2.5 text-slate-700">{r.marksPerQuestion} Marks</td>
                      <td className="p-2.5 font-bold text-slate-800">{secQuestions} Disp ({secAttemptAny} Attempt)</td>
                      <td className="p-2.5">
                        <span
                          className={`font-semibold inline-flex items-center gap-1 ${
                            isEnough ? 'text-emerald-700' : 'text-red-600 font-bold'
                          }`}
                        >
                          {isEnough ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <AlertCircle className="w-3.5 h-3.5 text-red-600" />}
                          <span>{bankCount} questions</span>
                        </span>
                      </td>
                      <td className="p-2.5 text-right pr-3 font-bold text-slate-900">
                        {r.marksPerQuestion * secAttemptAny} Marks
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Warnings if any */}
        {warnings.length > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-xs text-amber-900">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Question Pool Notice</span>
            </div>
            {warnings.map((w, idx) => (
              <p key={idx} className="leading-relaxed">
                {w}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isGenerating}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Paper Structure</span>
        </button>

        <button
          type="button"
          id="btn-generate-paper-final"
          disabled={isGenerating || hasNoQuestionBank || hasShortage || isMarksMismatch}
          onClick={handleGenerate}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{generationStepText || 'Generating Paper Sets...'}</span>
            </>
          ) : (
            <>
              <FileCheck2 className="w-5 h-5" />
              <span>
                {effectiveNumberOfSets === 1
                  ? 'Generate Paper'
                  : `Generate ${effectiveNumberOfSets} Sets`}
              </span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};
