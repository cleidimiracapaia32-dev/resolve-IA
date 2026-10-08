export type PlanId = "free" | "pro" | "institucional";

export interface PlanLimits {
  tutorPerDay: number;
  examsPerDay: number;
  maxDifficulty: number;
  fullExam: boolean;
  analytics: boolean;
}

export const PLANS: Record<PlanId, { name: string; price: string; limits: PlanLimits }> = {
  free: {
    name: "Free",
    price: "0 €",
    limits: { tutorPerDay: 3, examsPerDay: 1, maxDifficulty: 2, fullExam: false, analytics: false },
  },
  pro: {
    name: "Pro",
    price: "7,90 € / mês",
    limits: { tutorPerDay: 60, examsPerDay: 50, maxDifficulty: 3, fullExam: true, analytics: true },
  },
  institucional: {
    name: "Institucional",
    price: "Sob consulta",
    limits: { tutorPerDay: 300, examsPerDay: 200, maxDifficulty: 3, fullExam: true, analytics: true },
  },
};
