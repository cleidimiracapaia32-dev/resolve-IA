import { z } from "zod";
import { authed } from "../middleware/auth";
import { db } from "../database";
import { profiles } from "../database/schema";
import { getPlan, PLANS } from "../lib/plans";

export const billing = {
  plans: authed.handler(async ({ context }) => {
    const current = await getPlan(context.user.id);
    return {
      current,
      plans: Object.entries(PLANS).map(([id, p]) => ({ id, ...p })),
    };
  }),

  // Sem cobrança real por agora — simula a ativação do plano escolhido.
  // Quando o Stripe for ligado, este procedimento passa a abrir o checkout.
  setPlan: authed
    .input(z.object({ plan: z.enum(["free", "pro", "institucional"]) }))
    .handler(async ({ input, context }) => {
      await db.insert(profiles).values({ userId: context.user.id, plan: input.plan }).onConflictDoUpdate({ target: profiles.userId, set: { plan: input.plan, planSince: new Date() } });
      return { plan: input.plan };
    }),
};
