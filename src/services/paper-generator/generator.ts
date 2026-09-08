import { ExamDetails, RubricSection, QuestionBank, GeneratedPaper, GeneratedSet, PaperQuestion, BloomsLevel, QuestionItem } from '../../types';
import { SAMPLE_BANKS } from '../../data/sampleQuestionBanks';

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
  const sample = SAMPLE_BANKS[markTier];
  if (sample && sample.questions) {
    return sample.questions.map((q, i) => ({
      id: `sample_${markTier}_${i}`,
      text: q.text,
      marks: markTier,
      bloomsLevel: q.bloomsLevel,
      sourceBankId: 'sample',
    }));
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

  // Validate if all blueprint requirements have enough questions in respective question banks
  for (const rubric of rubrics) {
    const markTier = rubric.marksPerQuestion;
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
        error: `No questions available for section "${rubric.sectionName}". Please upload a question bank PDF or add questions first.`,
      };
    }

    let rows = rubric.blueprintRows && rubric.blueprintRows.length > 0
      ? rubric.blueprintRows.map(r => ({ ...r }))
      : [{ id: 'default', bloomsLevel: 'Understand' as BloomsLevel, questionsDisplayed: totalDisp }];

    const sumRows = rows.reduce((acc, r) => acc + r.questionsDisplayed, 0);
    if (sumRows !== totalDisp && rows.length > 0) {
      rows[0].questionsDisplayed = Math.max(1, rows[0].questionsDisplayed + (totalDisp - sumRows));
    }

    for (const row of rows) {
      const matchingQuestions = allBankQuestions.filter(q => q.bloomsLevel === row.bloomsLevel);
      if (matchingQuestions.length < row.questionsDisplayed) {
        return {
          success: false,
          error: `Insufficient questions for Bloom level "${row.bloomsLevel}" in section "${rubric.sectionName}". Required: ${row.questionsDisplayed}, Available: ${matchingQuestions.length}. Please upload a PDF or adjust Bloom requirements.`,
        };
      }
    }
  }

  const numSets = Math.max(1, Math.min(config.numberOfSets || 1, 50));
  const sets: GeneratedSet[] = [];

  // Repetition tracker per mark tier & Bloom level if reduceRepetition is enabled
  const poolTracking: Record<string, { allQuestions: any[]; usedIndices: Set<number> }> = {};

  if (config.reduceRepetition) {
    for (const rubric of rubrics) {
      const allBankQuestions = getSectionQuestions(rubric, banks);
      const bloomsLevels: BloomsLevel[] = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];
      for (const level of bloomsLevels) {
        const levelQs = allBankQuestions.filter(q => q.bloomsLevel === level);
        poolTracking[`${rubric.id}_${level}`] = {
          allQuestions: config.shuffleOrder === 'section' ? shuffleArray(levelQs) : [...levelQs],
          usedIndices: new Set<number>(),
        };
      }
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

      let rows = rubric.blueprintRows && rubric.blueprintRows.length > 0
        ? rubric.blueprintRows.map(r => ({ ...r }))
        : [{ id: 'default', bloomsLevel: 'Understand' as BloomsLevel, questionsDisplayed: totalDisp }];

      const sumRows = rows.reduce((acc, r) => acc + r.questionsDisplayed, 0);
      if (sumRows !== totalDisp && rows.length > 0) {
        rows[0].questionsDisplayed = Math.max(1, rows[0].questionsDisplayed + (totalDisp - sumRows));
      }

      rows.forEach((row) => {
        const level = row.bloomsLevel;
        const requiredCount = row.questionsDisplayed;
        const levelQuestions = allBankQuestions.filter(q => q.bloomsLevel === level);
        let selectedRaw: any[] = [];

        if (config.reduceRepetition) {
          const key = `${rubric.id}_${level}`;
          const tracker = poolTracking[key] || { allQuestions: levelQuestions, usedIndices: new Set<number>() };
          let availableUnused: number[] = [];
          for (let i = 0; i < tracker.allQuestions.length; i++) {
            if (!tracker.usedIndices.has(i)) {
              availableUnused.push(i);
            }
          }
          if (availableUnused.length < requiredCount) {
            tracker.usedIndices.clear();
            availableUnused = Array.from({ length: tracker.allQuestions.length }, (_, i) => i);
          }
          const pickedIndices = (config.shuffleOrder === 'section' ? shuffleArray(availableUnused) : availableUnused).slice(0, requiredCount);
          pickedIndices.forEach((idx) => tracker.usedIndices.add(idx));
          selectedRaw = pickedIndices.map((idx) => tracker.allQuestions[idx]);
        } else {
          if (config.shuffleOrder === 'section') {
            const shuffled = shuffleArray(levelQuestions);
            selectedRaw = shuffled.slice(0, requiredCount);
          } else {
            const offset = (setIdx * requiredCount) % Math.max(1, levelQuestions.length);
            const rotated = [...levelQuestions.slice(offset), ...levelQuestions.slice(0, offset)];
            selectedRaw = rotated.slice(0, requiredCount);
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
            bloomsLevel: origQ.bloomsLevel || level,
            co: origQ.co || 'CO1',
            originalBankQuestionId: origQ.id,
            answerKey: origQ.sampleAnswer || '',
          };

          if (config.continuousNumbering) {
            runningQuestionNumber++;
          }

          sectionQuestions.push(pq);
        });
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
