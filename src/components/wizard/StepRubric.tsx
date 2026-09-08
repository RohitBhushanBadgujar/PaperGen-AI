import React, { useState, useRef } from 'react';
import { Plus, Trash2, Layers, BookOpen, Sliders, CheckCircle2, UploadCloud, Loader2 } from 'lucide-react';
import { usePaperGen } from '../../context/PaperGenContext';
import { BloomsLevel, RubricSection, QuestionItem, QuestionBank } from '../../types';
import { extractQuestionsFromPDF } from '../../services/pdf/pdfExtractor';
import { InspectBankModal } from '../modals/InspectBankModal';

export const StepRubric: React.FC<{ onNext: () => void; onBack: () => void }> = ({
  onNext,
  onBack,
}) => {
  const {
    rubrics,
    setRubrics,
    addRubricSection,
    removeRubricSection,
    updateRubricSection,
    addBlueprintRow,
    removeBlueprintRow,
    updateBlueprintRow,
    showNotification,
  } = usePaperGen();

  const [customMarks, setCustomMarks] = useState<number>(2);
  const [customCount, setCustomCount] = useState<number>(5);
  const [parsingSectionId, setParsingSectionId] = useState<string | null>(null);
  const [inspectingSection, setInspectingSection] = useState<RubricSection | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleSectionPDFUpload = async (rubric: RubricSection, file?: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      showNotification('Please select a valid .PDF document', 'error');
      return;
    }

    setParsingSectionId(rubric.id);
    try {
      const result = await extractQuestionsFromPDF(file);
      if (!result.success || result.questions.length === 0) {
        showNotification(result.errorMessage || 'Could not extract questions from PDF.', 'error');
      } else {
        const qItems: QuestionItem[] = result.questions.map((text, idx) => ({
          id: `sec_${rubric.id}_q_${idx}_${Date.now()}`,
          text,
          marks: rubric.marksPerQuestion,
          bloomsLevel: rubric.blueprintRows[idx % rubric.blueprintRows.length]?.bloomsLevel || 'Understand',
          sourceFileName: file.name,
        }));

        updateRubricSection(rubric.id, {
          pdfFileName: file.name,
          pdfFileSize: file.size,
          pdfQuestions: qItems,
        });
        showNotification(`Successfully extracted ${qItems.length} questions from ${file.name}!`, 'success');
      }
    } catch (err: any) {
      console.error(err);
      showNotification('Error reading PDF file.', 'error');
    } finally {
      setParsingSectionId(null);
    }
  };

  // Calculate Displayed Marks and Attemptable / Counted Marks
  const totalDisplayedMarks = rubrics.reduce(
    (sum, r) => {
      const q = r.questions !== undefined ? r.questions : (r.questionsRequired || 5);
      return sum + (q * r.marksPerQuestion);
    },
    0
  );

  const totalAttemptableMarks = rubrics.reduce(
    (sum, r) => {
      const q = r.questions !== undefined ? r.questions : (r.questionsRequired || 5);
      const att = r.attemptAny !== undefined ? r.attemptAny : q;
      return sum + (att * r.marksPerQuestion);
    },
    0
  );

  const totalDisplayedQuestions = rubrics.reduce(
    (sum, r) => sum + (r.questions !== undefined ? r.questions : (r.questionsRequired || 5)),
    0
  );

  const totalAttemptableQuestions = rubrics.reduce(
    (sum, r) => {
      const q = r.questions !== undefined ? r.questions : (r.questionsRequired || 5);
      const att = r.attemptAny !== undefined ? r.attemptAny : q;
      return sum + att;
    },
    0
  );

  // Calculate Bloom distribution across displayed blueprint requirements
  const bloomStats: Record<BloomsLevel, { count: number; marks: number }> = {
    Remember: { count: 0, marks: 0 },
    Understand: { count: 0, marks: 0 },
    Apply: { count: 0, marks: 0 },
    Analyze: { count: 0, marks: 0 },
    Evaluate: { count: 0, marks: 0 },
    Create: { count: 0, marks: 0 },
  };

  rubrics.forEach(r => {
    (r.blueprintRows || []).forEach(row => {
      if (bloomStats[row.bloomsLevel]) {
        bloomStats[row.bloomsLevel].count += row.questionsDisplayed;
        bloomStats[row.bloomsLevel].marks += row.questionsDisplayed * r.marksPerQuestion;
      }
    });
  });

  const handleAddSection = () => {
    if (customMarks <= 0 || customCount <= 0) {
      showNotification('Marks and question count must be greater than 0', 'error');
      return;
    }
    addRubricSection(customMarks, customCount);
  };

  const applyPreset = (type: 'balanced' | 'engineering') => {
    if (type === 'balanced') {
      // Set balanced blueprint across sections
      setRubrics([
        {
          id: 'preset_r1',
          sectionName: 'SECTION A — 2 MARKS',
          marksPerQuestion: 2,
          questionsRequired: 5,
          instruction: 'Answer any 5 out of 7 questions displayed',
          blueprintRows: [
            { id: 'bp_b1', bloomsLevel: 'Remember', questionsDisplayed: 4, questionsRequired: 3 },
            { id: 'bp_b2', bloomsLevel: 'Understand', questionsDisplayed: 3, questionsRequired: 2 },
          ],
        },
        {
          id: 'preset_r2',
          sectionName: 'SECTION B — 5 MARKS',
          marksPerQuestion: 5,
          questionsRequired: 4,
          instruction: 'Answer any 4 out of 6 questions displayed',
          blueprintRows: [
            { id: 'bp_b3', bloomsLevel: 'Understand', questionsDisplayed: 2, questionsRequired: 1 },
            { id: 'bp_b4', bloomsLevel: 'Apply', questionsDisplayed: 2, questionsRequired: 2 },
            { id: 'bp_b5', bloomsLevel: 'Analyze', questionsDisplayed: 2, questionsRequired: 1 },
          ],
        },
        {
          id: 'preset_r3',
          sectionName: 'SECTION C — 10 MARKS',
          marksPerQuestion: 10,
          questionsRequired: 2,
          instruction: 'Answer any 2 out of 3 questions displayed',
          blueprintRows: [
            { id: 'bp_b6', bloomsLevel: 'Evaluate', questionsDisplayed: 2, questionsRequired: 1 },
            { id: 'bp_b7', bloomsLevel: 'Create', questionsDisplayed: 1, questionsRequired: 1 },
          ],
        },
      ]);
      showNotification('Applied Balanced Blueprint Preset (20% Remember, 30% Understand, 25% Apply, 15% Analyze, 10% Evaluate)', 'success');
    } else if (type === 'engineering') {
      setRubrics([
        {
          id: 'preset_e1',
          sectionName: 'SECTION A — 2 MARKS',
          marksPerQuestion: 2,
          questionsRequired: 5,
          instruction: 'Answer all 5 questions',
          blueprintRows: [
            { id: 'bp_e1', bloomsLevel: 'Remember', questionsDisplayed: 2, questionsRequired: 2 },
            { id: 'bp_e2', bloomsLevel: 'Understand', questionsDisplayed: 3, questionsRequired: 3 },
          ],
        },
        {
          id: 'preset_e2',
          sectionName: 'SECTION B — 5 MARKS',
          marksPerQuestion: 5,
          questionsRequired: 4,
          instruction: 'Answer any 4 out of 5 questions displayed',
          blueprintRows: [
            { id: 'bp_e3', bloomsLevel: 'Apply', questionsDisplayed: 2, questionsRequired: 2 },
            { id: 'bp_e4', bloomsLevel: 'Analyze', questionsDisplayed: 2, questionsRequired: 1 },
            { id: 'bp_e5', bloomsLevel: 'Evaluate', questionsDisplayed: 1, questionsRequired: 1 },
          ],
        },
        {
          id: 'preset_e3',
          sectionName: 'SECTION C — 10 MARKS',
          marksPerQuestion: 10,
          questionsRequired: 2,
          instruction: 'Answer any 2 out of 3 questions displayed',
          blueprintRows: [
            { id: 'bp_e6', bloomsLevel: 'Analyze', questionsDisplayed: 1, questionsRequired: 1 },
            { id: 'bp_e7', bloomsLevel: 'Create', questionsDisplayed: 2, questionsRequired: 1 },
          ],
        },
      ]);
      showNotification('Applied Application / Engineering Blueprint Preset (Heavy on Apply, Analyze & Create)', 'success');
    }
  };

  const handleContinue = () => {
    if (rubrics.length === 0) {
      showNotification('Please add at least one section in the blueprint', 'error');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header & Preset Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Step 2 — Paper Blueprint & Bloom's Taxonomy Structure
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Define question sections, Bloom's cognitive levels, and student choice rules ("Attempt Any").
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Presets:</span>
            <button
              type="button"
              onClick={() => applyPreset('balanced')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              <span>Balanced</span>
            </button>
            <button
              type="button"
              onClick={() => applyPreset('engineering')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Engineering / App</span>
            </button>
          </div>
        </div>

        {/* Live Summary Bar (Displayed vs Attemptable Marks & Questions) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="space-y-0.5">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Displayed Marks</div>
            <div className="text-lg font-black text-slate-900">{totalDisplayedMarks} Marks</div>
            <div className="text-[10px] text-slate-400">Total visible on paper</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-[10px] uppercase font-bold tracking-wider text-blue-600">Max Attemptable Marks</div>
            <div className="text-lg font-black text-blue-700">{totalAttemptableMarks} Marks</div>
            <div className="text-[10px] text-blue-500">Counted for grading</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Questions Displayed</div>
            <div className="text-lg font-black text-slate-900">{totalDisplayedQuestions} Qs</div>
            <div className="text-[10px] text-slate-400">Total shown to student</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-600">Questions Attempt Any</div>
            <div className="text-lg font-black text-emerald-700">{totalAttemptableQuestions} Qs</div>
            <div className="text-[10px] text-emerald-500">Student answers required</div>
          </div>
        </div>

        {/* Quick Add Section Bar */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>+ Add Section:</span>
            </span>

            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-600">Marks/Q:</label>
              <select
                value={customMarks}
                onChange={(e) => setCustomMarks(parseInt(e.target.value))}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 Mark</option>
                <option value={2}>2 Marks</option>
                <option value={3}>3 Marks</option>
                <option value={4}>4 Marks</option>
                <option value={5}>5 Marks</option>
                <option value={8}>8 Marks</option>
                <option value={10}>10 Marks</option>
                <option value={15}>15 Marks</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-600">Default Qs:</label>
              <input
                type="number"
                min="1"
                max="30"
                value={customCount}
                onChange={(e) => setCustomCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddSection}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Section</span>
          </button>
        </div>

        {/* Blueprint Sections List */}
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Section Blueprint & Bloom Distribution Matrix
          </div>

          {rubrics.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400 text-xs">
              No sections defined in the blueprint yet. Click "+ Add Section" above.
            </div>
          ) : (
            <div className="space-y-4">
              {rubrics.map((rubric, idx) => {
                const secQuestions = rubric.questions !== undefined ? rubric.questions : (rubric.questionsRequired || 5);
                const secAttemptAny = rubric.attemptAny !== undefined ? rubric.attemptAny : secQuestions;
                const secDisplayedMarks = secQuestions * rubric.marksPerQuestion;
                const secAttemptMarks = secAttemptAny * rubric.marksPerQuestion;

                return (
                  <div
                    key={rubric.id}
                    className="p-5 bg-slate-50 rounded-xl border border-slate-200/90 hover:border-slate-300 transition-all space-y-4"
                  >
                    {/* Section Top Bar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <div className="flex-1 space-y-1">
                          <input
                            type="text"
                            value={rubric.sectionName}
                            onChange={(e) => updateRubricSection(rubric.id, { sectionName: e.target.value })}
                            className="font-bold text-xs text-slate-900 bg-white border border-slate-300 px-2.5 py-1 rounded-lg w-full max-w-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => removeRubricSection(rubric.id)}
                          className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Remove Section"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Section Parameters: Marks/Q, Questions, Attempt Any */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-200">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-500">Marks / Question</label>
                        <div className="text-xs font-black text-slate-900 mt-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                          {rubric.marksPerQuestion} Marks
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-500">Questions (Displayed)</label>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={secQuestions}
                          onChange={(e) => {
                            const q = Math.max(1, parseInt(e.target.value) || 1);
                            const currentRows = rubric.blueprintRows || [];
                            const currentSum = currentRows.reduce((s, r) => s + r.questionsDisplayed, 0);
                            let newRows = currentRows;
                            if (currentRows.length === 1) {
                              newRows = [{ ...currentRows[0], questionsDisplayed: q }];
                            } else if (currentRows.length > 0) {
                              const diff = q - currentSum;
                              newRows = currentRows.map((r, idx) => idx === 0 ? { ...r, questionsDisplayed: Math.max(1, r.questionsDisplayed + diff) } : r);
                            } else {
                              newRows = [{ id: `bp_${Date.now()}`, bloomsLevel: 'Understand', questionsDisplayed: q }];
                            }

                            if (secAttemptAny > q) {
                              showNotification('Attempt Any cannot be greater than the number of questions.', 'error');
                              updateRubricSection(rubric.id, { questions: q, attemptAny: q, blueprintRows: newRows });
                            } else {
                              updateRubricSection(rubric.id, { questions: q, blueprintRows: newRows });
                            }
                          }}
                          className="w-full mt-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-blue-600">Attempt Any</label>
                        <input
                          type="number"
                          min="1"
                          max={secQuestions}
                          value={secAttemptAny}
                          onChange={(e) => {
                            const att = parseInt(e.target.value) || 1;
                            if (att > secQuestions) {
                              showNotification('Attempt Any cannot be greater than the number of questions.', 'error');
                              updateRubricSection(rubric.id, { attemptAny: secQuestions });
                            } else {
                              updateRubricSection(rubric.id, { attemptAny: att });
                            }
                          }}
                          className="w-full mt-1 px-3 py-1.5 bg-blue-50 border border-blue-300 rounded-lg text-xs font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Calculated Marks & Helper text */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-xs">
                      <div className="text-slate-600 italic">
                        {secAttemptAny >= secQuestions ? 'Answer all questions.' : `Students will answer any ${secAttemptAny} of the ${secQuestions} questions.`}
                      </div>
                      <div className="font-bold text-slate-900 space-x-2">
                        <span>Displayed Marks: <strong className="text-slate-900">{secDisplayedMarks}</strong></span>
                        <span>•</span>
                        <span>Attemptable Marks: <strong className="text-blue-700">{secAttemptMarks}</strong></span>
                      </div>
                    </div>

                    {/* Bloom Requirement Rows Table */}
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-bold text-slate-500 px-1 uppercase tracking-wider gap-2">
                        <span>Bloom's Taxonomy Requirement</span>
                        <div className="flex items-center gap-2">
                          {rubric.pdfFileName ? (
                            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg text-emerald-900 text-xs font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="font-bold truncate max-w-[140px]" title={rubric.pdfFileName}>{rubric.pdfFileName}</span>
                              <span className="text-emerald-700 font-bold">({rubric.pdfQuestions?.length || 0} Qs)</span>
                              <button
                                type="button"
                                onClick={() => setInspectingSection(rubric)}
                                className="text-blue-700 hover:underline font-bold uppercase text-[10px] ml-1"
                              >
                                Inspect
                              </button>
                              <button
                                type="button"
                                onClick={() => fileInputRefs.current[rubric.id]?.click()}
                                className="text-slate-600 hover:text-slate-900 uppercase text-[10px] ml-1"
                              >
                                Replace
                              </button>
                              <button
                                type="button"
                                onClick={() => updateRubricSection(rubric.id, { pdfFileName: undefined, pdfFileSize: undefined, pdfQuestions: undefined })}
                                className="text-red-500 hover:text-red-700 uppercase text-[10px] ml-1"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              disabled={parsingSectionId === rubric.id}
                              onClick={() => fileInputRefs.current[rubric.id]?.click()}
                              className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-colors shadow-2xs"
                            >
                              {parsingSectionId === rubric.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <UploadCloud className="w-3.5 h-3.5" />
                              )}
                              <span>＋ Upload Question Bank PDF</span>
                            </button>
                          )}
                          <input
                            type="file"
                            accept=".pdf"
                            ref={(el) => (fileInputRefs.current[rubric.id] = el)}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleSectionPDFUpload(rubric, file);
                              e.target.value = '';
                            }}
                            className="hidden"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        {(rubric.blueprintRows || []).map((row) => {
                          const rowSubtotal = row.questionsDisplayed * rubric.marksPerQuestion;

                          return (
                            <div
                              key={row.id}
                              className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-4"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <span className="text-xs font-bold text-slate-400 w-5">↳</span>
                                <select
                                  value={row.bloomsLevel}
                                  onChange={(e) =>
                                    updateBlueprintRow(rubric.id, row.id, {
                                      bloomsLevel: e.target.value as BloomsLevel,
                                    })
                                  }
                                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                  <option value="Remember">Remember (Recall)</option>
                                  <option value="Understand">Understand (Explain)</option>
                                  <option value="Apply">Apply (Solve)</option>
                                  <option value="Analyze">Analyze (Examine)</option>
                                  <option value="Evaluate">Evaluate (Justify)</option>
                                  <option value="Create">Create (Design)</option>
                                </select>
                              </div>

                              <div className="flex items-center gap-4 shrink-0">
                                <div className="w-24 text-center">
                                  <input
                                    type="number"
                                    min="1"
                                    max="30"
                                    value={row.questionsDisplayed}
                                    onChange={(e) =>
                                      updateBlueprintRow(rubric.id, row.id, {
                                        questionsDisplayed: Math.max(1, parseInt(e.target.value) || 1),
                                      })
                                    }
                                    className="w-16 text-center font-bold text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    title="Questions displayed on paper"
                                  />
                                </div>

                                <div className="w-20 text-right text-xs font-bold text-slate-900">
                                  {rowSubtotal} M
                                </div>

                                <button
                                  type="button"
                                  onClick={() => removeBlueprintRow(rubric.id, row.id)}
                                  className="w-8 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors"
                                  title="Remove Bloom Requirement"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => addBlueprintRow(rubric.id)}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-blue-600 border border-blue-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Add Bloom Requirement to Section</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bloom's Distribution Summary Panel */}
        <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Bloom's Taxonomy Distribution Summary
              </h3>
            </div>
            <div className="text-[11px] text-slate-400">Calculated from Blueprint</div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {(Object.keys(bloomStats) as BloomsLevel[]).map((level) => {
              const stat = bloomStats[level];
              const percentage = totalDisplayedMarks > 0 ? Math.round((stat.marks / totalDisplayedMarks) * 100) : 0;

              return (
                <div key={level} className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 space-y-1">
                  <div className="text-[11px] font-bold text-slate-300">{level}</div>
                  <div className="text-base font-black text-white">{percentage}%</div>
                  <div className="text-[10px] text-slate-400">{stat.count} Qs ({stat.marks}M)</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors flex items-center gap-2"
        >
          <span>← Back to Exam Details</span>
        </button>

        <button
          type="button"
          id="btn-step2-next"
          onClick={handleContinue}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2"
        >
          <span>Continue to Step 3: Generate Paper →</span>
        </button>
      </div>

      <InspectBankModal
        isOpen={inspectingSection !== null}
        onClose={() => setInspectingSection(null)}
        bank={inspectingSection ? {
          id: `bank_${inspectingSection.id}`,
          marks: inspectingSection.marksPerQuestion,
          name: `${inspectingSection.sectionName} Question Bank`,
          fileName: inspectingSection.pdfFileName,
          questions: inspectingSection.pdfQuestions || [],
        } : null}
      />
    </div>
  );
};
