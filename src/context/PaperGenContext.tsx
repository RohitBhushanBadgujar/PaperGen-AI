import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ExamDetails,
  RubricSection,
  QuestionBank,
  GeneratedPaper,
  AppView,
  QuestionItem,
  BloomsLevel,
  BlueprintRequirement,
} from '../types';
import { SAMPLE_EXAM_DETAILS, SAMPLE_RUBRICS, SAMPLE_BANKS } from '../data/sampleQuestionBanks';
import { generateExamPaper, GenerationConfig } from '../services/paper-generator/generator';

interface PaperGenContextType {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  examDetails: ExamDetails;
  updateExamDetails: (details: Partial<ExamDetails>) => void;
  rubrics: RubricSection[];
  setRubrics: React.Dispatch<React.SetStateAction<RubricSection[]>>;
  addRubricSection: (marks: number, count: number) => void;
  removeRubricSection: (id: string) => void;
  updateRubricSection: (id: string, updates: Partial<RubricSection>) => void;
  addBlueprintRow: (sectionId: string) => void;
  removeBlueprintRow: (sectionId: string, rowId: string) => void;
  updateBlueprintRow: (sectionId: string, rowId: string, updates: Partial<BlueprintRequirement>) => void;
  questionBanks: Record<number, QuestionBank>;
  setQuestionBank: (marks: number, bank: QuestionBank) => void;
  addQuestionsToBank: (marks: number, questions: string[], sourceFileName?: string) => void;
  deleteQuestionFromBank: (marks: number, questionId: string) => void;
  editQuestionInBank: (marks: number, questionId: string, newText: string) => void;
  editQuestionBloomLevel: (marks: number, questionId: string, bloomsLevel: BloomsLevel) => void;
  generatedPaper: GeneratedPaper | null;
  setGeneratedPaper: React.Dispatch<React.SetStateAction<GeneratedPaper | null>>;
  activeSetIndex: number;
  setActiveSetIndex: (idx: number) => void;
  pastPapers: GeneratedPaper[];
  loadSampleData: () => void;
  triggerGeneratePaper: (config: GenerationConfig) => { success: boolean; error?: string; warnings?: string[] };
  updatePaperQuestionText: (setId: string, questionId: string, newText: string) => void;
  replacePaperQuestionWithBank: (setId: string, questionId: string, newBankQId: string) => void;
  deletePaperQuestion: (setId: string, questionId: string) => void;
  addPaperQuestionManually: (setId: string, sectionId: string, text: string, marks: number) => void;
  movePaperQuestion: (setId: string, sectionId: string, questionIndex: number, direction: 'up' | 'down') => void;
  updateAnswerKey: (setId: string, questionId: string, answer: string) => void;
  updatePaperQuestionCO: (setId: string, questionId: string, newCo: string) => void;
  updatePaperQuestionBloom: (setId: string, questionId: string, newBloom: BloomsLevel) => void;
  clearSession: () => void;
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const DEFAULT_EXAM_DETAILS: ExamDetails = {
  collegeName: 'Springfield Engineering College',
  department: 'Department of Electronics & Communication',
  examName: 'Internal Assessment II',
  subjectName: 'Applied Electronics',
  subjectCode: 'EC204',
  date: new Date().toISOString().split('T')[0],
  duration: '2 Hours',
  totalMarks: 50,
  instructions: [
    'Answer all questions according to the specified sections.',
    'Draw neat schematic circuit diagrams wherever necessary.',
    'Scientific non-programmable calculators are permitted.',
  ],
  showBloomsInPaper: false,
};

const DEFAULT_RUBRICS: RubricSection[] = [
  {
    id: 'r1',
    sectionName: 'SECTION A — 2 MARKS',
    marksPerQuestion: 2,
    questions: 5,
    attemptAny: 5,
    blueprintRows: [
      { id: 'bp_1', bloomsLevel: 'Remember', questionsDisplayed: 3 },
      { id: 'bp_2', bloomsLevel: 'Understand', questionsDisplayed: 2 },
    ],
  },
  {
    id: 'r2',
    sectionName: 'SECTION B — 3 MARKS',
    marksPerQuestion: 3,
    questions: 5,
    attemptAny: 5,
    blueprintRows: [
      { id: 'bp_3', bloomsLevel: 'Understand', questionsDisplayed: 3 },
      { id: 'bp_4', bloomsLevel: 'Apply', questionsDisplayed: 2 },
    ],
  },
  {
    id: 'r3',
    sectionName: 'SECTION C — 5 MARKS',
    marksPerQuestion: 5,
    questions: 4,
    attemptAny: 3,
    blueprintRows: [
      { id: 'bp_5', bloomsLevel: 'Apply', questionsDisplayed: 2 },
      { id: 'bp_6', bloomsLevel: 'Analyze', questionsDisplayed: 1 },
      { id: 'bp_7', bloomsLevel: 'Evaluate', questionsDisplayed: 1 },
    ],
  },
  {
    id: 'r4',
    sectionName: 'SECTION D — 10 MARKS',
    marksPerQuestion: 10,
    questions: 2,
    attemptAny: 1,
    blueprintRows: [
      { id: 'bp_8', bloomsLevel: 'Create', questionsDisplayed: 2 },
    ],
  },
];

const PaperGenContext = createContext<PaperGenContextType | undefined>(undefined);

export const PaperGenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [examDetails, setExamDetails] = useState<ExamDetails>(() => {
    const saved = sessionStorage.getItem('pg_exam_details');
    return saved ? JSON.parse(saved) : DEFAULT_EXAM_DETAILS;
  });

  const [rubrics, setRubrics] = useState<RubricSection[]>(() => {
    const saved = sessionStorage.getItem('pg_rubrics');
    const parsed = saved ? JSON.parse(saved) : DEFAULT_RUBRICS;
    return parsed.map((r: any) => ({
      ...r,
      blueprintRows: (r.blueprintRows || []).map((row: any) => ({
        id: row.id,
        bloomsLevel: row.bloomsLevel,
        questionsDisplayed: row.questionsDisplayed || row.questionsRequired || 1,
      }))
    }));
  });

  const [questionBanks, setQuestionBanks] = useState<Record<number, QuestionBank>>(() => {
    const saved = sessionStorage.getItem('pg_question_banks');
    return saved ? JSON.parse(saved) : {};
  });

  const [generatedPaper, setGeneratedPaper] = useState<GeneratedPaper | null>(() => {
    const saved = sessionStorage.getItem('pg_generated_paper');
    return saved ? JSON.parse(saved) : null;
  });

  const [pastPapers, setPastPapers] = useState<GeneratedPaper[]>(() => {
    const saved = sessionStorage.getItem('pg_past_papers');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeSetIndex, setActiveSetIndex] = useState<number>(0);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    sessionStorage.setItem('pg_exam_details', JSON.stringify(examDetails));
  }, [examDetails]);

  useEffect(() => {
    sessionStorage.setItem('pg_rubrics', JSON.stringify(rubrics));
  }, [rubrics]);

  useEffect(() => {
    sessionStorage.setItem('pg_question_banks', JSON.stringify(questionBanks));
  }, [questionBanks]);

  useEffect(() => {
    if (generatedPaper) {
      sessionStorage.setItem('pg_generated_paper', JSON.stringify(generatedPaper));
    } else {
      sessionStorage.removeItem('pg_generated_paper');
    }
  }, [generatedPaper]);

  useEffect(() => {
    sessionStorage.setItem('pg_past_papers', JSON.stringify(pastPapers));
  }, [pastPapers]);



  const updateExamDetails = (details: Partial<ExamDetails>) => {
    setExamDetails(prev => ({ ...prev, ...details }));
  };

  const addRubricSection = (marks: number, count: number, attemptAny?: number) => {
    const attAny = attemptAny !== undefined ? attemptAny : count;
    const markName = `SECTION ${String.fromCharCode(65 + rubrics.length)} — ${marks} MARKS`;
    const newRubric: RubricSection = {
      id: `r_${Date.now()}`,
      sectionName: markName,
      marksPerQuestion: marks,
      questions: count,
      attemptAny: attAny,
      blueprintRows: [
        { id: `bp_${Date.now()}`, bloomsLevel: 'Understand', questionsDisplayed: count }
      ],
    };
    setRubrics(prev => [...prev, newRubric]);
    showNotification(`Added ${marks}-mark section (${count} questions, attempt any ${attAny})`, 'success');
  };

  const removeRubricSection = (id: string) => {
    setRubrics(prev => prev.filter(r => r.id !== id));
    showNotification('Section removed from blueprint', 'info');
  };

  const updateRubricSection = (id: string, updates: Partial<RubricSection>) => {
    setRubrics(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
  };

  const addBlueprintRow = (sectionId: string) => {
    setRubrics(prev => prev.map(sec => {
      if (sec.sectionId !== undefined && sec.id !== sectionId) return sec;
      if (sec.id !== sectionId) return sec;
      const newRow: BlueprintRequirement = {
        id: `bp_row_${Date.now()}`,
        bloomsLevel: 'Understand',
        questionsDisplayed: 2,
      };
      return {
        ...sec,
        blueprintRows: [...(sec.blueprintRows || []), newRow],
      };
    }));
  };

  const removeBlueprintRow = (sectionId: string, rowId: string) => {
    setRubrics(prev => prev.map(sec => {
      if (sec.id !== sectionId) return sec;
      if ((sec.blueprintRows || []).length <= 1) {
        showNotification('A section must have at least one Bloom requirement row.', 'error');
        return sec;
      }
      return {
        ...sec,
        blueprintRows: sec.blueprintRows.filter(r => r.id !== rowId),
      };
    }));
  };

  const updateBlueprintRow = (sectionId: string, rowId: string, updates: Partial<BlueprintRequirement>) => {
    setRubrics(prev => prev.map(sec => {
      if (sec.id !== sectionId) return sec;
      return {
        ...sec,
        blueprintRows: sec.blueprintRows.map(row => (row.id === rowId ? { ...row, ...updates } : row)),
      };
    }));
  };

  const setQuestionBank = (marks: number, bank: QuestionBank) => {
    setQuestionBanks(prev => ({ ...prev, [marks]: bank }));
  };

  const addQuestionsToBank = (marks: number, questions: string[], sourceFileName?: string) => {
    const levels: BloomsLevel[] = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];
    const newItems: QuestionItem[] = questions.map((text, idx) => ({
      id: `q_${marks}m_${Date.now()}_${idx}`,
      text: text.trim(),
      marks,
      bloomsLevel: levels[idx % levels.length],
      sourceFileName: sourceFileName || 'PDF Upload',
    }));

    setQuestionBanks(prev => {
      const existing = prev[marks];
      const combinedQuestions = existing ? [...existing.questions, ...newItems] : newItems;
      return {
        ...prev,
        [marks]: {
          id: existing?.id || `bank_${marks}m_${Date.now()}`,
          marks,
          name: existing?.name || `${marks}-Mark Question Bank`,
          fileName: sourceFileName || existing?.fileName || `${marks}-Mark Bank`,
          uploadedAt: new Date().toISOString(),
          questions: combinedQuestions,
        },
      };
    });
    showNotification(`Extracted and stored ${questions.length} questions in ${marks}-Mark Bank!`, 'success');
  };

  const deleteQuestionFromBank = (marks: number, questionId: string) => {
    setQuestionBanks(prev => {
      const bank = prev[marks];
      if (!bank) return prev;
      return {
        ...prev,
        [marks]: {
          ...bank,
          questions: bank.questions.filter(q => q.id !== questionId),
        },
      };
    });
    showNotification('Question removed from bank', 'info');
  };

  const editQuestionInBank = (marks: number, questionId: string, newText: string) => {
    setQuestionBanks(prev => {
      const bank = prev[marks];
      if (!bank) return prev;
      return {
        ...prev,
        [marks]: {
          ...bank,
          questions: bank.questions.map(q => (q.id === questionId ? { ...q, text: newText } : q)),
        },
      };
    });
  };

  const editQuestionBloomLevel = (marks: number, questionId: string, bloomsLevel: BloomsLevel) => {
    setQuestionBanks(prev => {
      const bank = prev[marks];
      if (!bank) return prev;
      return {
        ...prev,
        [marks]: {
          ...bank,
          questions: bank.questions.map(q => (q.id === questionId ? { ...q, bloomsLevel } : q)),
        },
      };
    });
    showNotification(`Updated Bloom's level to ${bloomsLevel}`, 'success');
  };

  const loadSampleData = () => {
    setExamDetails(SAMPLE_EXAM_DETAILS);
    setRubrics(SAMPLE_RUBRICS);
    setQuestionBanks(SAMPLE_BANKS);
    setGeneratedPaper(null);
    showNotification('Loaded sample examination blueprint and question banks successfully!', 'success');
  };

  const triggerGeneratePaper = (config: GenerationConfig) => {
    const result = generateExamPaper(examDetails, rubrics, questionBanks, config);
    if (result.success && result.paper) {
      setGeneratedPaper(result.paper);
      setPastPapers(prev => [result.paper!, ...prev.filter(p => p.id !== result.paper!.id)]);
      showNotification('Examination paper sets generated successfully according to blueprint!', 'success');
      return { success: true, warnings: result.warnings };
    } else {
      showNotification(result.error || 'Failed to generate exam paper.', 'error');
      return { success: false, error: result.error };
    }
  };

  const updatePaperQuestionText = (setId: string, questionId: string, newText: string) => {
    if (!generatedPaper) return;
    setGeneratedPaper(prev => {
      if (!prev) return null;
      return {
        ...prev,
        sets: prev.sets.map(s => {
          if (s.setId !== setId) return s;
          return {
            ...s,
            sections: s.sections.map(sec => ({
              ...sec,
              questions: sec.questions.map(q => (q.id === questionId ? { ...q, text: newText } : q)),
            })),
          };
        }),
      };
    });
    showNotification('Question updated in set', 'success');
  };

  const replacePaperQuestionWithBank = (setId: string, questionId: string, newBankQId: string) => {
    if (!generatedPaper) return;
    let targetMarks = 2;
    generatedPaper.sets.forEach(s => {
      s.sections.forEach(sec => {
        const found = sec.questions.find(q => q.id === questionId);
        if (found) targetMarks = found.marks;
      });
    });

    const bank = questionBanks[targetMarks];
    const bankQ = bank?.questions?.find(q => q.id === newBankQId);
    if (!bankQ) {
      showNotification('Selected question not found in bank', 'error');
      return;
    }

    setGeneratedPaper(prev => {
      if (!prev) return null;
      return {
        ...prev,
        sets: prev.sets.map(s => {
          if (s.setId !== setId) return s;
          return {
            ...s,
            sections: s.sections.map(sec => ({
              ...sec,
              questions: sec.questions.map(q => {
                if (q.id !== questionId) return q;
                return {
                  ...q,
                  text: bankQ.text,
                  bloomsLevel: bankQ.bloomsLevel || q.bloomsLevel,
                  originalBankQuestionId: bankQ.id,
                  answerKey: bankQ.sampleAnswer || q.answerKey,
                };
              }),
            })),
          };
        }),
      };
    });
    showNotification('Question successfully replaced from bank', 'success');
  };

  const deletePaperQuestion = (setId: string, questionId: string) => {
    if (!generatedPaper) return;
    setGeneratedPaper(prev => {
      if (!prev) return null;
      return {
        ...prev,
        sets: prev.sets.map(s => {
          if (s.setId !== setId) return s;
          return {
            ...s,
            sections: s.sections.map(sec => ({
              ...sec,
              questions: sec.questions.filter(q => q.id !== questionId),
            })),
          };
        }),
      };
    });
    showNotification('Question deleted from paper', 'info');
  };

  const addPaperQuestionManually = (setId: string, sectionId: string, text: string, marks: number) => {
    if (!generatedPaper) return;
    setGeneratedPaper(prev => {
      if (!prev) return null;
      return {
        ...prev,
        sets: prev.sets.map(s => {
          if (s.setId !== setId) return s;
          return {
            ...s,
            sections: s.sections.map(sec => {
              if (sec.sectionId !== sectionId) return sec;
              const nextNum = sec.questions.length + 1;
              const newQ = {
                id: `q_manual_${Date.now()}`,
                sectionId,
                questionNumber: nextNum,
                displayNumber: `Q${nextNum}.`,
                text,
                marks,
                bloomsLevel: 'Understand' as BloomsLevel,
              };
              return {
                ...sec,
                questions: [...sec.questions, newQ],
              };
            }),
          };
        }),
      };
    });
    showNotification('Question added to section', 'success');
  };

  const movePaperQuestion = (setId: string, sectionId: string, questionIndex: number, direction: 'up' | 'down') => {
    if (!generatedPaper) return;
    setGeneratedPaper(prev => {
      if (!prev) return null;
      return {
        ...prev,
        sets: prev.sets.map(s => {
          if (s.setId !== setId) return s;
          return {
            ...s,
            sections: s.sections.map(sec => {
              if (sec.sectionId !== sectionId) return sec;
              const newQuestions = [...sec.questions];
              const targetIndex = direction === 'up' ? questionIndex - 1 : questionIndex + 1;
              if (targetIndex < 0 || targetIndex >= newQuestions.length) return sec;

              const temp = newQuestions[questionIndex];
              newQuestions[questionIndex] = newQuestions[targetIndex];
              newQuestions[targetIndex] = temp;

              return {
                ...sec,
                questions: newQuestions,
              };
            }),
          };
        }),
      };
    });
  };

  const updateAnswerKey = (setId: string, questionId: string, answer: string) => {
    if (!generatedPaper) return;
    setGeneratedPaper(prev => {
      if (!prev) return null;
      return {
        ...prev,
        sets: prev.sets.map(s => {
          if (s.setId !== setId) return s;
          return {
            ...s,
            sections: s.sections.map(sec => ({
              ...sec,
              questions: sec.questions.map(q => (q.id === questionId ? { ...q, answerKey: answer } : q)),
            })),
          };
        }),
      };
    });
  };

  const updatePaperQuestionCO = (setId: string, questionId: string, newCo: string) => {
    if (!generatedPaper) return;
    setGeneratedPaper(prev => {
      if (!prev) return null;
      return {
        ...prev,
        sets: prev.sets.map(s => {
          if (s.setId !== setId) return s;
          return {
            ...s,
            sections: s.sections.map(sec => ({
              ...sec,
              questions: sec.questions.map(q => (q.id === questionId ? { ...q, co: newCo } : q)),
            })),
          };
        }),
      };
    });
    showNotification(`Updated CO to ${newCo}`, 'success');
  };

  const updatePaperQuestionBloom = (setId: string, questionId: string, newBloom: BloomsLevel) => {
    if (!generatedPaper) return;
    setGeneratedPaper(prev => {
      if (!prev) return null;
      return {
        ...prev,
        sets: prev.sets.map(s => {
          if (s.setId !== setId) return s;
          return {
            ...s,
            sections: s.sections.map(sec => ({
              ...sec,
              questions: sec.questions.map(q => (q.id === questionId ? { ...q, bloomsLevel: newBloom } : q)),
            })),
          };
        }),
      };
    });
    showNotification(`Updated Bloom's level to ${newBloom}`, 'success');
  };

  const clearSession = () => {
    sessionStorage.clear();
    setExamDetails(DEFAULT_EXAM_DETAILS);
    setRubrics(DEFAULT_RUBRICS);
    setQuestionBanks({});
    setGeneratedPaper(null);
    setPastPapers([]);
    setCurrentView('dashboard');
    showNotification('Session cleared. All uploaded banks and generated papers deleted.', 'info');
  };

  return (
    <PaperGenContext.Provider
      value={{
        currentView,
        setCurrentView,
        examDetails,
        updateExamDetails,
        rubrics,
        setRubrics,
        addRubricSection,
        removeRubricSection,
        updateRubricSection,
        addBlueprintRow,
        removeBlueprintRow,
        updateBlueprintRow,
        questionBanks,
        setQuestionBank,
        addQuestionsToBank,
        deleteQuestionFromBank,
        editQuestionInBank,
        editQuestionBloomLevel,
        generatedPaper,
        setGeneratedPaper,
        activeSetIndex,
        setActiveSetIndex,
        pastPapers,
        loadSampleData,
        triggerGeneratePaper,
        updatePaperQuestionText,
        replacePaperQuestionWithBank,
        deletePaperQuestion,
        addPaperQuestionManually,
        movePaperQuestion,
        updateAnswerKey,
        updatePaperQuestionCO,
        updatePaperQuestionBloom,
        clearSession,
        notification,
        showNotification,
      }}
    >
      {children}
    </PaperGenContext.Provider>
  );
};

export const usePaperGen = () => {
  const context = useContext(PaperGenContext);
  if (!context) {
    throw new Error('usePaperGen must be used within a PaperGenProvider');
  }
  return context;
};
