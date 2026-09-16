import { ExamDetails, RubricSection, QuestionBank, GeneratedPaper, GeneratedSet, PaperQuestion, QuestionItem } from '../../types';

// Helper to shuffle array using Fisher-Yates
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getSectionQuestions(rubric: RubricSection, banks: Record<number, QuestionBank>): QuestionItem[] {
  if (rubric.pdfQuestions && rubric.pdfQuestions.length > 0) {
    return rubric.pdfQuestions;
  }
  const markTier = rubric.marksPerQuestion;
  const bank = banks[markTier];
  if (bank && bank.questions && bank.questions.length > 0) {
    return bank.questions;
  }
  return [];
}

export interface GenerationConfig {
  numberOfSets: number; // 1 to 50
  shuffleOrder: 'section' | 'original'; // 'section' = Shuffle Within Sections, 'original' = Keep Original Order
  reduceRepetition: boolean; // Try to reduce repeated questions across sets
  continuousNumbering: boolean; // Q1, Q2, Q3... across whole paper or reset per section
}

/**
 * Returns letter labels: 0 -> "Set A", 1 -> "Set B", etc.
 */
export function getSetLabel(index: number): string {
  let label = '';
  let temp = index;
  while (temp >= 0) {
    label = String.fromCharCode(65 + (temp % 26)) + label;
    temp = Math.floor(temp / 26) - 1;
  }
  return `Set ${label}`;
}

function numberToWord(n: number): string {
  const words: Record<number, string> = {
    1: 'ONE',
    2: 'TWO',
    3: 'THREE',
    4: 'FOUR',
    5: 'FIVE',
    6: 'SIX',
    7: 'SEVEN',
    8: 'EIGHT',
    9: 'NINE',
    10: 'TEN',
    11: 'ELEVEN',
    12: 'TWELVE',
    13: 'THIRTEEN',
    14: 'FOURTEEN',
    15: 'FIFTEEN',
    16: 'SIXTEEN',
    17: 'SEVENTEEN',
    18: 'EIGHTEEN',
    19: 'NINETEEN',
    20: 'TWENTY',
  };
  return words[n] || n.toString();
}

export function getSectionInstruction(questions: number, attemptAny: number): string {
  if (attemptAny >= questions) {
    return 'Answer ALL questions.';
  }
  const attWord = numberToWord(attemptAny);
  const qWord = numberToWord(questions);
  return `Attempt any ${attWord} (Out of ${qWord})`;
}

export function generateExamPaper(
  examDetails: ExamDetails,
  rubrics: RubricSection[],
  banks: Record<number, QuestionBank>,
  config: GenerationConfig = {
    numberOfSets: 1,
    shuffleOrder: 'section',
    reduceRepetition: false,
    continuousNumbering: true,
  }
): { success: boolean; paper?: GeneratedPaper; warnings?: string[]; error?: string } {
  const warnings: string[] = [];

  // Check if any question bank exists or total questions available is 0
  const totalLoadedBanks = Object.values(banks).filter(b => b.questions && b.questions.length > 0).length;
  const totalPdfQuestions = rubrics.reduce((acc, r) => acc + (r.pdfQuestions?.length || 0), 0);
  
  if (totalLoadedBanks === 0 && totalPdfQuestions === 0) {
    return {
      success: false,
      error: 'No Question Bank Found. Please upload a question bank PDF before generating the question paper.',
    };
  }

  // Validate total attemptable marks against target total marks
  const totalAttemptableMarks = rubrics.reduce((sum, r) => {
    const q = r.questions !== undefined ? r.questions : (r.questionsRequired || 5);
    const att = r.attemptAny !== undefined ? r.attemptAny : q;
    return sum + (att * r.marksPerQuestion);
  }, 0);

  if (totalAttemptableMarks !== examDetails.totalMarks) {
    return {
      success: false,
      error: `Paper structure mismatch. Target total marks is ${examDetails.totalMarks}, but current attemptable marks is ${totalAttemptableMarks}. Please adjust the paper structure.`,
    };
  }

  // Validate if all section requirements have enough questions in respective question banks
  for (const rubric of rubrics) {
    const allBankQuestions = getSectionQuestions(rubric, banks);
    const totalDisp = rubric.questions !== undefined ? rubric.questions : (rubric.questionsRequired || 5);
    const totalAttemptAny = rubric.attemptAny !== undefined ? rubric.attemptAny : totalDisp;

    if (totalAttemptAny > totalDisp) {
      return {
        success: false,
        error: `Attempt Any cannot be greater than the number of questions in section "${rubric.sectionName}".`,
      };
    }

    if (allBankQuestions.length === 0) {
      return {
        success: false,
        error: `No questions available for section "${rubric.sectionName}". Please upload a question bank PDF first.`,
      };
    }

    if (allBankQuestions.length < totalDisp) {
      return {
        success: false,
        error: `Section "${rubric.sectionName}" requires ${totalDisp} questions, but only ${allBankQuestions.length} are available in the question bank.`,
      };
    }
  }

  const numSets = Math.max(1, Math.min(config.numberOfSets || 1, 50));
  const sets: GeneratedSet[] = [];

  // Repetition tracker per section if reduceRepetition is enabled
  const poolTracking: Record<string, { allQuestions: QuestionItem[]; usedIndices: Set<number> }> = {};

  if (config.reduceRepetition) {
    for (const rubric of rubrics) {
      const allBankQuestions = getSectionQuestions(rubric, banks);
      poolTracking[rubric.id] = {
        allQuestions: config.shuffleOrder === 'section' ? shuffleArray(allBankQuestions) : [...allBankQuestions],
        usedIndices: new Set<number>(),
      };
    }
  }

  for (let setIdx = 0; setIdx < numSets; setIdx++) {
    const setName = getSetLabel(setIdx);
    let runningQuestionNumber = 1;
    const setSections: GeneratedSet['sections'] = [];

    rubrics.forEach((rubric) => {
      const allBankQuestions = getSectionQuestions(rubric, banks);
      const totalDisp = rubric.questions !== undefined ? rubric.questions : (rubric.questionsRequired || 5);
      const totalAttemptAny = rubric.attemptAny !== undefined ? rubric.attemptAny : totalDisp;

      let sectionQuestions: PaperQuestion[] = [];
      let selectedRaw: QuestionItem[] = [];

      if (config.reduceRepetition) {
        const tracker = poolTracking[rubric.id] || { allQuestions: allBankQuestions, usedIndices: new Set<number>() };
        let availableUnused: number[] = [];
        for (let i = 0; i < tracker.allQuestions.length; i++) {
          if (!tracker.usedIndices.has(i)) {
            availableUnused.push(i);
          }
        }
        if (availableUnused.length < totalDisp) {
          tracker.usedIndices.clear();
          availableUnused = Array.from({ length: tracker.allQuestions.length }, (_, i) => i);
        }
        const pickedIndices = (config.shuffleOrder === 'section' ? shuffleArray(availableUnused) : availableUnused).slice(0, totalDisp);
        pickedIndices.forEach((idx) => tracker.usedIndices.add(idx));
        selectedRaw = pickedIndices.map((idx) => tracker.allQuestions[idx]);
      } else {
        if (config.shuffleOrder === 'section') {
          const shuffled = shuffleArray(allBankQuestions);
          selectedRaw = shuffled.slice(0, totalDisp);
        } else {
          const offset = (setIdx * totalDisp) % Math.max(1, allBankQuestions.length);
          const rotated = [...allBankQuestions.slice(offset), ...allBankQuestions.slice(0, offset)];
          selectedRaw = rotated.slice(0, totalDisp);
        }
      }

      if (config.shuffleOrder === 'section') {
        selectedRaw = shuffleArray(selectedRaw);
      }

      selectedRaw.forEach((origQ) => {
        const qNum = config.continuousNumbering ? runningQuestionNumber : sectionQuestions.length + 1;
        const pq: PaperQuestion = {
          id: `q_${setIdx}_${rubric.marksPerQuestion}_${origQ.id}_${Math.random().toString(36).substring(2, 6)}`,
          sectionId: rubric.id,
          questionNumber: qNum,
          displayNumber: `Q${qNum}.`,
          text: origQ.text,
          marks: rubric.marksPerQuestion,
          bloomsLevel: origQ.bloomsLevel || 'Understand',
          co: origQ.co || 'CO1',
          originalBankQuestionId: origQ.id,
          answerKey: origQ.sampleAnswer || '',
        };

        if (config.continuousNumbering) {
          runningQuestionNumber++;
        }

        sectionQuestions.push(pq);
      });

      const instructionText = getSectionInstruction(totalDisp, totalAttemptAny);

      setSections.push({
        sectionId: rubric.id,
        sectionName: rubric.sectionName || `SECTION - ${rubric.marksPerQuestion} MARKS`,
        marksPerQuestion: rubric.marksPerQuestion,
        questionsCount: totalDisp,
        attemptAny: totalAttemptAny,
        questionsRequired: totalAttemptAny,
        instruction: instructionText,
        questions: sectionQuestions,
      });
    });

    sets.push({
      setId: `set_${setIdx + 1}`,
      setName,
      sections: setSections,
    });
  }

  const generatedPaper: GeneratedPaper = {
    id: `paper_${Date.now()}`,
    createdAt: new Date().toISOString(),
    examDetails: { ...examDetails },
    rubrics: [...rubrics],
    sets,
    activeSetIndex: 0,
  };

  return {
    success: true,
    paper: generatedPaper,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}
