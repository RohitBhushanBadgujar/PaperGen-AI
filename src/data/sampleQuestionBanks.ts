import { QuestionBank, RubricSection, ExamDetails, BloomsLevel } from '../types';

export const SAMPLE_EXAM_DETAILS: ExamDetails = {
  collegeName: 'Apex Institute of Technology & Science',
  department: 'Department of Electronics & Communication Engineering',
  examName: 'Internal Assessment Examination II',
  subjectName: 'Applied Electronics',
  subjectCode: 'EC8351',
  date: new Date().toISOString().split('T')[0],
  duration: '2 Hours',
  totalMarks: 50,
  instructions: [
    'Answer all questions strictly adhering to the rubric.',
    'Draw neat, labeled schematic diagrams wherever necessary.',
    'Assume suitable data if required and state it clearly.',
    'Use of non-programmable scientific calculator is permitted.',
  ],
  showBloomsInPaper: false,
};

export const SAMPLE_RUBRICS: RubricSection[] = [
  {
    id: 'rubric_2m',
    sectionName: 'SECTION A — 2 MARKS',
    marksPerQuestion: 2,
    questions: 5,
    attemptAny: 5,
    blueprintRows: [
      { id: 'bp_2m_1', bloomsLevel: 'Remember', questionsDisplayed: 3 },
      { id: 'bp_2m_2', bloomsLevel: 'Understand', questionsDisplayed: 2 },
    ],
  },
  {
    id: 'rubric_3m',
    sectionName: 'SECTION B — 3 MARKS',
    marksPerQuestion: 3,
    questions: 5,
    attemptAny: 5,
    blueprintRows: [
      { id: 'bp_3m_1', bloomsLevel: 'Understand', questionsDisplayed: 3 },
      { id: 'bp_3m_2', bloomsLevel: 'Apply', questionsDisplayed: 2 },
    ],
  },
  {
    id: 'rubric_5m',
    sectionName: 'SECTION C — 5 MARKS',
    marksPerQuestion: 5,
    questions: 4,
    attemptAny: 3,
    blueprintRows: [
      { id: 'bp_5m_1', bloomsLevel: 'Apply', questionsDisplayed: 2 },
      { id: 'bp_5m_2', bloomsLevel: 'Analyze', questionsDisplayed: 1 },
      { id: 'bp_5m_3', bloomsLevel: 'Evaluate', questionsDisplayed: 1 },
    ],
  },
  {
    id: 'rubric_10m',
    sectionName: 'SECTION D — 10 MARKS',
    marksPerQuestion: 10,
    questions: 2,
    attemptAny: 1,
    blueprintRows: [
      { id: 'bp_10m_1', bloomsLevel: 'Create', questionsDisplayed: 2 },
    ],
  },
];

export const SAMPLE_BANKS: Record<number, QuestionBank> = {
  2: {
    id: 'bank_sample_2m',
    marks: 2,
    name: '2-Mark Question Bank',
    fileName: 'Applied_Electronics_2Mark_Bank.pdf',
    uploadedAt: new Date().toISOString(),
    questions: [
      { id: 'q_2m_1', text: 'Define an oscillator and state its fundamental principle of operation.', marks: 2, bloomsLevel: 'Remember', sampleAnswer: 'An oscillator is an electronic circuit that generates a repetitive, oscillating electronic signal without any external AC input signal, using positive feedback.' },
      { id: 'q_2m_2', text: 'State two practical applications of an oscillator circuit.', marks: 2, bloomsLevel: 'Remember', sampleAnswer: '1. Carrier frequency generation in radio/TV transmitters.\n2. Clock pulse generation in microprocessors.' },
      { id: 'q_2m_3', text: 'What is positive feedback and how does it sustain oscillations?', marks: 2, bloomsLevel: 'Understand', sampleAnswer: 'Positive feedback occurs when a portion of the output signal is fed back to the input in phase with the original input.' },
      { id: 'q_2m_4', text: 'Define bandwidth in amplifier circuits and give its formula.', marks: 2, bloomsLevel: 'Remember', sampleAnswer: 'Bandwidth (BW) is the range of frequencies over which the amplifier gain remains within 70.7% (-3dB) of max gain: BW = fH - fL.' },
      { id: 'q_2m_5', text: 'State the Barkhausen criterion for sustained oscillations in a feedback network.', marks: 2, bloomsLevel: 'Remember', sampleAnswer: '1. Loop gain magnitude |Aβ| = 1.\n2. Total loop phase shift = 0° or 360°.' },
      { id: 'q_2m_6', text: 'What is the need for frequency stabilization in LC tank oscillator circuits?', marks: 2, bloomsLevel: 'Understand', sampleAnswer: 'To prevent output frequency drift caused by temperature variations and component aging.' },
      { id: 'q_2m_7', text: 'Differentiate between voltage series and current shunt negative feedback topologies.', marks: 2, bloomsLevel: 'Understand', sampleAnswer: 'Voltage series samples output voltage and mixes in series; current shunt samples current and mixes in parallel.' },
      { id: 'q_2m_8', text: 'Define common mode rejection ratio (CMRR) in differential operational amplifiers.', marks: 2, bloomsLevel: 'Remember', sampleAnswer: 'CMRR is the ratio of differential voltage gain to common-mode voltage gain: CMRR = |Ad / Ac|.' },
      { id: 'q_2m_9', text: 'Mention the condition to prevent thermal runaway in a bipolar junction transistor.', marks: 2, bloomsLevel: 'Apply', sampleAnswer: 'Thermal stability factor S must be minimized and heat dissipation rate must exceed generation rate.' },
      { id: 'q_2m_10', text: 'What is the function of a snubber circuit in switching power converter circuits?', marks: 2, bloomsLevel: 'Understand', sampleAnswer: 'A snubber suppresses high voltage spikes (dV/dt) caused by circuit inductance when a switch turns off.' },
      { id: 'q_2m_11', text: 'Explain the concept of crossover distortion in Class B complementary symmetry push-pull amplifiers.', marks: 2, bloomsLevel: 'Understand', sampleAnswer: 'Distortion near zero crossing when both transistors remain turned off due to the 0.7V cut-in barrier.' },
      { id: 'q_2m_12', text: 'Why is negative feedback widely preferred in commercial audio amplifier circuits?', marks: 2, bloomsLevel: 'Understand', sampleAnswer: 'It stabilizes gain, reduces harmonic distortion, and expands operating bandwidth.' },
    ],
  },
  3: {
    id: 'bank_sample_3m',
    marks: 3,
    name: '3-Mark Question Bank',
    fileName: 'Applied_Electronics_3Mark_Bank.pdf',
    uploadedAt: new Date().toISOString(),
    questions: [
      { id: 'q_3m_1', text: 'Explain the working principle of a Hartley oscillator with an expression for resonant frequency.', marks: 3, bloomsLevel: 'Understand', sampleAnswer: 'Hartley oscillator uses an inductive voltage divider with two inductors and a capacitor: fr = 1 / (2π√(Leq * C)).' },
      { id: 'q_3m_2', text: 'Compare Hartley and Colpitts oscillator circuits in terms of frequency range and tuning ease.', marks: 3, bloomsLevel: 'Analyze', sampleAnswer: 'Colpitts uses capacitive split divider for better high-frequency stability; Hartley is easier to tune smoothly over audio/medium RF.' },
      { id: 'q_3m_3', text: 'Describe the effect of negative feedback on the input impedance and output impedance of an amplifier.', marks: 3, bloomsLevel: 'Understand', sampleAnswer: 'Series feedback multiplies input impedance by (1+Aβ); shunt feedback divides input impedance by (1+Aβ).' },
      { id: 'q_3m_4', text: 'Draw the high frequency small-signal hybrid-π equivalent model of a BJT and label key capacitances.', marks: 3, bloomsLevel: 'Apply', sampleAnswer: 'Diagram includes rbb\', r\'b\'e, Cπ, Cμ, and gm*Vb\'e.' },
      { id: 'q_3m_5', text: 'Derive the voltage gain expression for an inverting operational amplifier configuration using virtual ground.', marks: 3, bloomsLevel: 'Apply', sampleAnswer: 'By KCL at V- node: Av = -Rf / R1.' },
      { id: 'q_3m_6', text: 'Explain how a crystal oscillator achieves extraordinary frequency stability compared to LC oscillators.', marks: 3, bloomsLevel: 'Understand', sampleAnswer: 'Piezoelectric quartz crystal exhibits high Q factor (>10,000) and negligible temperature drift.' },
      { id: 'q_3m_7', text: 'Explain the principle of Class C power amplifier and why it achieves high power conversion efficiency.', marks: 3, bloomsLevel: 'Understand', sampleAnswer: 'Class C is biased below cutoff with conduction angle <180°, yielding efficiency up to 75-85% with LC tuned load.' },
      { id: 'q_3m_8', text: 'Explain how slew rate limitations impact high-speed sinusoidal and square wave signal reproduction in op-amps.', marks: 3, bloomsLevel: 'Analyze', sampleAnswer: 'Slew rate limits max rate of change of output voltage: Vmax = SR / (2πf).' },
      { id: 'q_3m_9', text: 'Describe the working of a Schmitt Trigger circuit with hysteresis loop voltage thresholds (UTP and LTP).', marks: 3, bloomsLevel: 'Understand', sampleAnswer: 'Uses positive feedback to create two distinct switching thresholds to reject noise.' },
    ],
  },
  5: {
    id: 'bank_sample_5m',
    marks: 5,
    name: '5-Mark Question Bank',
    fileName: 'Applied_Electronics_5Mark_Bank.pdf',
    uploadedAt: new Date().toISOString(),
    questions: [
      { id: 'q_5m_1', text: 'Explain the working of a RC Phase Shift Oscillator with a neat circuit diagram and derive its frequency of oscillation and attenuation factor.', marks: 5, bloomsLevel: 'Apply', sampleAnswer: 'Uses 3 RC sections providing 180° total phase shift. fr = 1 / (2πRC√6) and gain |Av| ≥ 29.' },
      { id: 'q_5m_2', text: 'Draw and explain the operation of a Class AB complementary symmetry push-pull power amplifier with thermal compensation diodes.', marks: 5, bloomsLevel: 'Apply', sampleAnswer: 'Biased with two diodes matching Vbe to eliminate crossover distortion and prevent thermal runaway.' },
      { id: 'q_5m_3', text: 'Explain the working of a Wien Bridge Oscillator with lead-lag network and analyze its condition for stable oscillations.', marks: 5, bloomsLevel: 'Analyze', sampleAnswer: 'Lead-lag network has max response at fr = 1/(2πRC) with attenuation 1/3. Op-amp gain must be 3.' },
      { id: 'q_5m_4', text: 'Describe the architecture and working of an Instrumentation Amplifier using three operational amplifiers, deriving its overall differential gain equation.', marks: 5, bloomsLevel: 'Evaluate', sampleAnswer: 'Buffers with two op-amps followed by difference amplifier. Overall gain: Vout = (1 + 2R1/Rg) * (R3/R2) * (V2 - V1).' },
      { id: 'q_5m_5', text: 'Analyze the low frequency response of a common emitter amplifier considering input coupling, output coupling, and emitter bypass capacitors.', marks: 5, bloomsLevel: 'Analyze', sampleAnswer: 'Determines individual corner cutoff frequencies for coupling and bypass capacitors.' },
      { id: 'q_5m_6', text: 'Explain the operation of a Phase-Locked Loop (PLL IC 565) block diagram including Phase Detector, Low Pass Filter, and VCO.', marks: 5, bloomsLevel: 'Evaluate', sampleAnswer: 'Phase detector produces error voltage proportional to phase difference; LPF filters DC control voltage; VCO adjusts frequency.' },
    ],
  },
  10: {
    id: 'bank_sample_10m',
    marks: 10,
    name: '10-Mark Question Bank',
    fileName: 'Applied_Electronics_10Mark_Bank.pdf',
    uploadedAt: new Date().toISOString(),
    questions: [
      { id: 'q_10m_1', text: 'Design and analyze a complete Colpitts Oscillator to generate a stable sinusoidal signal at 1 MHz using a BJT with hfe = 100 and Vcc = 12V. Derive the condition for oscillation, feedback fraction, and evaluate the tank circuit inductor and capacitor parameters.', marks: 10, bloomsLevel: 'Create', sampleAnswer: 'Tank circuit C1, C2, L. fr = 1 / (2π√(L * Ceq)). Feedback fraction β = C1 / C2. Barkhausen condition Av ≥ C2 / C1. Design calculations included.' },
      { id: 'q_10m_2', text: 'Describe the classification of power amplifiers (Class A, Class B, Class AB, Class C, Class D) in detail. Compare them based on operating point, conduction angle, theoretical maximum efficiency, harmonic distortion, and common industrial/audio applications.', marks: 10, bloomsLevel: 'Evaluate', sampleAnswer: 'Detailed comparison of Class A, B, AB, C, and D amplifiers covering efficiency, conduction angles, and applications.' },
      { id: 'q_10m_3', text: 'A two-stage negative feedback amplifier is required for an industrial instrumentation sensor. (a) Derive the expressions for gain sensitivity, input impedance, and output impedance with voltage series negative feedback. (b) If open loop gain is A = 10,000 ± 15%, calculate the feedback ratio β needed to reduce gain variations to ±0.5% and find the stabilized closed loop gain.', marks: 10, bloomsLevel: 'Create', sampleAnswer: '(a) Derivations for gain sensitivity and impedances.\n(b) Calculated β = 0.0029, Closed loop gain Af = 333.33.' },
    ],
  },
};
