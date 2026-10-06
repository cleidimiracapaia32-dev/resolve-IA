export const CATEGORIES = [
  "matrices",
  "series",
  "letters",
  "oddone",
  "analogies",
  "calc",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Shape = "circle" | "square" | "triangle" | "diamond" | "hexagon" | "star";
export type Fill = "solid" | "outline" | "striped";

export interface Figure {
  shape: Shape;
  count: number;
  fill: Fill;
  rotation: number;
}

export type Visual =
  | { kind: "matrix"; cells: (Figure | null)[] }
  | { kind: "row"; figures: Figure[] }
  | { kind: "sequence"; terms: string[] }
  | { kind: "text"; text: string };

export type Option = { kind: "figure"; figure: Figure } | { kind: "text"; text: string };

/** What the client receives — never contains the answer. */
export interface Exercise {
  category: Category;
  difficulty: number;
  seed: number;
  prompt: string;
  visual: Visual;
  options: Option[];
}

/** Full solution, only revealed after answering. */
export interface Solved extends Exercise {
  answer: number;
  rule: string;
  steps: string[];
}

export const CATEGORY_META: Record<Category, { label: string; short: string }> = {
  matrices: { label: "Matrizes visuais", short: "Matrizes" },
  series: { label: "Séries numéricas", short: "Séries" },
  letters: { label: "Séries de letras", short: "Letras" },
  oddone: { label: "Figura intrusa", short: "Intrusa" },
  analogies: { label: "Analogias verbais", short: "Analogias" },
  calc: { label: "Cálculo rápido", short: "Cálculo" },
};
