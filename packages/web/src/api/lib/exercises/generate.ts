import type { Category, Exercise, Solved } from "./types";
import { rng } from "./rng";
import { genMatrix, genOddOne } from "./visual";
import { genCalc, genLetters, genSeries } from "./numeric";
import { genAnalogy } from "./verbal";

const GENERATORS: Record<Category, (r: ReturnType<typeof rng>, d: number, s: number) => Solved> = {
  matrices: genMatrix,
  series: genSeries,
  letters: genLetters,
  oddone: genOddOne,
  analogies: genAnalogy,
  calc: genCalc,
};

/** Same (category, difficulty, seed) always yields the same exercise. */
export function generate(category: Category, difficulty: number, seed: number): Solved {
  const d = Math.min(3, Math.max(1, Math.round(difficulty)));
  return GENERATORS[category](rng(seed * 31 + d * 7 + category.length), d, seed);
}

export function toPublic(s: Solved): Exercise {
  const { answer: _a, rule: _r, steps: _s, ...rest } = s;
  return rest;
}
