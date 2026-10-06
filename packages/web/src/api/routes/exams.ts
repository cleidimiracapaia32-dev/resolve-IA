import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { authed } from "../middleware/auth";
import { db } from "../database";
import { attempts, examSessions } from "../database/schema";
import { CATEGORIES, generate, toPublic, type Category } from "../lib/exercises";
import { getPlan, limitError, PLANS, usageToday } from "../lib/plans";

import { EXAM_MODES } from "../lib/exam-modes";

export { EXAM_MODES };

type Item = { category: Category; seed: number };

async function loadSession(id: number, userId: string) {
  const [s] = await db.select().from(examSessions).where(and(eq(examSessions.id, id), eq(examSessions.userId, userId)));
  if (!s) throw new ORPCError("NOT_FOUND", { message: "Simulado não encontrado" });
  return { ...s, items: JSON.parse(s.items) as Item[] };
}

export const exams = {
  modes: authed.handler(() => EXAM_MODES),

  start: authed
    .input(z.object({ mode: z.enum(["express", "standard", "full"]), difficulty: z.number().int().min(1).max(3), categories: z.array(z.enum(CATEGORIES)).min(1) }))
    .handler(async ({ input, context }) => {
      const plan = await getPlan(context.user.id);
      const limits = PLANS[plan].limits;
      const mode = EXAM_MODES[input.mode];
      if (mode.full && !limits.fullExam) throw new ORPCError("FORBIDDEN", { message: "A bateria completa está disponível no plano Pro." });
      const used = await usageToday(context.user.id);
      if (used.exams >= limits.examsPerDay) throw limitError("simulados");
      const difficulty = Math.min(input.difficulty, limits.maxDifficulty);
      const items: Item[] = Array.from({ length: mode.questions }, (_, i) => ({
        category: input.categories[i % input.categories.length]!,
        seed: Math.floor(Math.random() * 2_000_000_000),
      })).sort(() => Math.random() - 0.5);
      const [row] = await db
        .insert(examSessions)
        .values({ userId: context.user.id, mode: input.mode, difficulty, durationSec: mode.minutes * 60, items: JSON.stringify(items), total: items.length })
        .returning();
      return { id: row!.id };
    }),

  get: authed.input(z.object({ id: z.number().int() })).handler(async ({ input, context }) => {
    const s = await loadSession(input.id, context.user.id);
    const finished = !!s.finishedAt;
    const exercises = s.items.map((it) => {
      const solved = generate(it.category, s.difficulty, it.seed);
      return finished ? solved : { ...toPublic(solved), answer: undefined, rule: undefined, steps: undefined };
    });
    let choices: Record<number, number> = {};
    if (finished) {
      const rows = await db.select().from(attempts).where(eq(attempts.sessionId, s.id));
      choices = Object.fromEntries(rows.map((r) => [r.seed, r.choice]));
    }
    const elapsed = Math.floor((Date.now() - s.startedAt.getTime()) / 1000);
    return {
      id: s.id,
      mode: s.mode,
      difficulty: s.difficulty,
      durationSec: s.durationSec,
      remainingSec: finished ? 0 : Math.max(0, s.durationSec - elapsed),
      finished,
      score: s.score,
      total: s.total,
      timeUsedSec: s.timeUsedSec,
      exercises,
      choices,
    };
  }),

  finish: authed
    .input(z.object({ id: z.number().int(), answers: z.array(z.object({ index: z.number().int(), choice: z.number().int(), timeMs: z.number().int().min(0) })) }))
    .handler(async ({ input, context }) => {
      const s = await loadSession(input.id, context.user.id);
      if (s.finishedAt) return { score: s.score ?? 0, total: s.total };
      const byIndex = new Map(input.answers.map((a) => [a.index, a]));
      let score = 0;
      const rows = s.items.flatMap((it, i) => {
        const a = byIndex.get(i);
        if (!a) return [];
        const solved = generate(it.category, s.difficulty, it.seed);
        const correct = a.choice === solved.answer;
        if (correct) score++;
        return [{ userId: context.user.id, category: it.category, difficulty: s.difficulty, seed: it.seed, choice: a.choice, correct, timeMs: Math.min(a.timeMs, 600_000), sessionId: s.id }];
      });
      if (rows.length) await db.insert(attempts).values(rows);
      const timeUsedSec = Math.min(s.durationSec, Math.floor((Date.now() - s.startedAt.getTime()) / 1000));
      await db.update(examSessions).set({ score, timeUsedSec, finishedAt: new Date() }).where(eq(examSessions.id, s.id));
      return { score, total: s.total };
    }),

  list: authed.handler(async ({ context }) => {
    const rows = await db.select().from(examSessions).where(eq(examSessions.userId, context.user.id)).orderBy(desc(examSessions.startedAt)).limit(30);
    return rows.map(({ items: _i, ...r }) => r);
  }),
};
