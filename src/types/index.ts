export type BloomsLevel = 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create';

export function getBloomCode(level: BloomsLevel | string): string {
  switch (level) {
    case 'Remember': return 'R';
    case 'Understand': return 'U';
    case 'Apply': return 'A';
    case 'Analyze':
    case 'AN':
    case 'An': return 'An';
    case 'Evaluate': return 'E';
    case 'Create': return 'C';
    default: return 'R';
  }
}

export interface BlueprintRequirement {
  id: string;
  bloomsLevel: BloomsLevel;
  questionsDisplayed: number; // e.g. 3 questions shown on paper
}

export interface ExamDetails {
  collegeName: string;
  department: string;
  examName: string;
  subjectName: string;
  subjectCode: string;
  date: string;
  duration: string;
  totalMarks: number;
  instructions: string[];
  logoUrl?: string;
  showBloomsInPaper?: boolean; // Default false
}

export interface RubricSection {
  id: string;
  sectionName: string; // e.g. "SECTION A"
  marksPerQuestion: number; // e.g. 2
  questions: number; // Total questions displayed e.g. 6
  attemptAny: number; // Questions student must attempt e.g. 4
  questionsRequired?: number; // legacy backward compatibility
  optionalQuestions?: number;
  instruction?: string;
  blueprintRows: BlueprintRequirement[]; // Bloom's Taxonomy blueprint requirements per section
  pdfFileName?: string;
  pdfFileSize?: number;
  pdfQuestions?: QuestionItem[];
}

export interface QuestionItem {
  id: string;
  text: string;
  marks: number;
  bloomsLevel: BloomsLevel;
  co?: string; // Course outcome e.g. "CO1"
  sourceBankId?: string;
  sourceFileName?: string;
  sampleAnswer?: string;
}


export interface QuestionBank {
  id: string;
  marks: number;
  name: string; // e.g., "2-Mark Question Bank"
  fileName?: string;
  fileSize?: number;
  uploadedAt: string;
  questions: QuestionItem[];
  rawText?: string;
}

export interface PaperQuestion {
  id: string;
  sectionId: string;
  questionNumber: number;
  displayNumber: string; // e.g., "Q1." or "1."
  text: string;
  marks: number;
  bloomsLevel: BloomsLevel;
  co: string; // Course outcome e.g. "CO1"
  originalBankQuestionId?: string;
  answerKey?: string;
}

export interface GeneratedSet {
  setId: string;
  setName: string; // e.g. "Set A", "Set B"
  sections: {
    sectionId: string;
    sectionName: string;
    marksPerQuestion: number;
    questionsCount: number;
    attemptAny: number;
    questionsRequired?: number;
    instruction: string;
    questions: PaperQuestion[];
  }[];
}

export interface GeneratedPaper {
  id: string;
  createdAt: string;
  examDetails: ExamDetails;
  rubrics: RubricSection[];
  sets: GeneratedSet[];
  activeSetIndex: number;
}

export type AppView = 
  | 'dashboard'
  | 'create-wizard'
  | 'banks'
  | 'editor'
  | 'answer-keys'
  | 'settings';
