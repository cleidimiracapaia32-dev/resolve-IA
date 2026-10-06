import { z } from "zod";
import { authed } from "../middleware/auth";
import { db } from "../database";
import { attempts } from "../database/schema";
import { CATEGORIES, generate, toPublic } from "../lib/exercises";
import { getPlan, PLANS } from "../lib/plans";

const category = z.enum(CATEGORIES);
const difficulty = z.number().int().min(1).max(3);

export const practice = {
  next: authed
    .input(z.object({ category, difficulty }))
    .handler(async ({ input, context }) => {
      const plan = await getPlan(context.user.id);
      const d = Math.min(input.difficulty, PLANS[plan].limits.maxDifficulty);
      const seed = Math.floor(Math.random() * 2_000_000_000);
      return { exercise: toPublic(generate(input.category, d, seed)), cappedTo: d < input.difficulty ? d : null };
    }),

  answer: authed
    .input(z.object({ category, difficulty, seed: z.number().int(), choice: z.number().int(), timeMs: z.number().int().min(0) }))
    .handler(async ({ input, context }) => {
      const solved = generate(input.category, input.difficulty, input.seed);
      const correct = input.choice === solved.answer;
      await db.insert(attempts).values({
        userId: context.user.id,
        category: input.category,
        difficulty: solved.difficulty,
        seed: input.seed,
        choice: input.choice,
        correct,
        timeMs: Math.min(input.timeMs, 600_000),
      });
      return { correct, answer: solved.answer, rule: solved.rule, steps: solved.steps };
    }),
};
