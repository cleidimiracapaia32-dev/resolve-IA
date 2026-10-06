export const EXAM_MODES = {
  express: { label: "Express", questions: 10, minutes: 6, full: false },
  standard: { label: "Padrão", questions: 20, minutes: 15, full: false },
  full: { label: "Bateria completa", questions: 40, minutes: 30, full: true },
} as const;
