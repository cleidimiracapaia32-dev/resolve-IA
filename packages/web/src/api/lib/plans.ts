import { and, eq, gte, count } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { db } from "../database";
import { profiles, tutorSolves, examSessions } from "../database/schema";

import { PLANS, type PlanId, type PlanLimits } from "./plan-meta";

export { PLANS };
export type { PlanId, PlanLimits };

export async function getPlan(userId: string): Promise<PlanId> {
  const [row] = await db.select().from(profiles).where(eq(profiles.userId, userId));
  if (row) return row.plan as PlanId;
  await db.insert(profiles).values({ userId, plan: "free" }).onConflictDoNothing();
  return "free";
}

const startOfDay = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export async function usageToday(userId: string) {
  const since = startOfDay();
  const [[t], [e]] = await Promise.all([
    db.select({ n: count() }).from(tutorSolves).where(and(eq(tutorSolves.userId, userId), gte(tutorSolves.createdAt, since))),
    db.select({ n: count() }).from(examSessions).where(and(eq(examSessions.userId, userId), gte(examSessions.startedAt, since))),
  ]);
  return { tutor: t?.n ?? 0, exams: e?.n ?? 0 };
}

export function limitError(what: string) {
  return new ORPCError("FORBIDDEN", { message: `Limite diário de ${what} atingido no teu plano. Faz upgrade para continuar.` });
}
