import { asc, eq, desc } from "drizzle-orm";
import { authed } from "../middleware/auth";
import { db } from "../database";
import { attempts, examSessions } from "../database/schema";
import { CATEGORIES, CATEGORY_META } from "../lib/exercises";
import { getPlan, PLANS, usageToday } from "../lib/plans";

export const stats = {
  overview: authed.handler(async ({ context }) => {
    const plan = await getPlan(context.user.id);
    const used = await usageToday(context.user.id);
    const limits = PLANS[plan].limits;
    const rows = await db.select().from(attempts).where(eq(attempts.userId, context.user.id)).orderBy(asc(attempts.createdAt));

    const total = rows.length;
    const correct = rows.filter((r) => r.correct).length;
    const byCategory = CATEGORIES.map((c) => {
      const list = rows.filter((r) => r.category === c);
      const ok = list.filter((r) => r.correct).length;
      return {
        category: c,
        label: CATEGORY_META[c].label,
        total: list.length,
        correct: ok,
        rate: list.length ? Math.round((ok / list.length) * 100) : null,
        avgTimeMs: list.length ? Math.round(list.reduce((s, r) => s + r.timeMs, 0) / list.length) : null,
      };
    });

    const dayKey = (d: Date) => d.toISOString().slice(0, 10);
    const days = new Map<string, { ok: number; n: number }>();
    for (const r of rows) {
      const k = dayKey(r.createdAt);
      const e = days.get(k) ?? { ok: 0, n: 0 };
      e.n++;
      if (r.correct) e.ok++;
      days.set(k, e);
    }
    const trend = [...days.entries()].map(([day, v]) => ({ day, rate: Math.round((v.ok / v.n) * 100), total: v.n }));

    const strong = byCategory.filter((c) => c.total >= 3 && c.rate !== null).sort((a, b) => b.rate! - a.rate!);
    const recs = strong.length
      ? [`Foca-te em ${strong[strong.length - 1]!.label} — é a tua área mais fraca (${strong[strong.length - 1]!.rate}%).`,
        `A tua melhor área é ${strong[0]!.label} (${strong[0]!.rate}%). Sobe a dificuldade para nível ${limits.maxDifficulty}.`]
      : ["Faz pelo menos 3 exercícios em cada categoria para desbloquear recomendações personalizadas."];

    return {
      plan,
      usage: { tutor: used.tutor, tutorLimit: limits.tutorPerDay, exams: used.exams, examsLimit: limits.examsPerDay },
      total,
      correct,
      rate: total ? Math.round((correct / total) * 100) : null,
      byCategory,
      trend,
      recs,
    };
  }),

  exams: authed.handler(async ({ context }) => {
    const rows = await db.select().from(examSessions).where(eq(examSessions.userId, context.user.id)).orderBy(desc(examSessions.startedAt)).limit(30);
    return rows.map(({ items: _i, ...r }) => r);
  }),
};
