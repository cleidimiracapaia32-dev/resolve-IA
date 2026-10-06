import { z } from "zod";
import { Output, generateText } from "ai";
import dedent from "dedent";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ORPCError } from "@orpc/server";
import { authed } from "../middleware/auth";
import { db } from "../database";
import { tutorSolves } from "../database/schema";
import { gateway } from "../agent/gateway";
import { s3 } from "../lib/s3";
import { getPlan, limitError, PLANS, usageToday } from "../lib/plans";
import { desc, eq } from "drizzle-orm";

const solutionSchema = z.object({
  category: z.string().describe("tipo de exercício: matrizes visuais, séries numéricas, séries de letras, analogias, figura intrusa, cálculo, outro"),
  answer: z.string().describe("a opção correta, com letra/valor"),
  confidence: z.enum(["alta", "media", "baixa"]),
  rule: z.string().describe("a regra ou padrão subjacente, em uma frase"),
  steps: z.array(z.string()).describe("passos do raciocínio, 3 a 6"),
  tip: z.string().describe("dica curta para reconhecer este padrão mais rápido numa próxima vez"),
});

export type TutorResult = z.infer<typeof solutionSchema>;

const imageUrl = (key: string) =>
  getSignedUrl(s3, new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }), { expiresIn: 3600 });

const toRow = async (row: typeof tutorSolves.$inferSelect) => ({
  id: row.id,
  note: row.note,
  result: JSON.parse(row.result) as TutorResult,
  createdAt: row.createdAt,
  imageUrl: await imageUrl(row.imageKey),
});

export const tutor = {
  presign: authed
    .input(z.object({ filename: z.string().min(1).max(200), contentType: z.enum(["image/png", "image/jpeg", "image/webp"]) }))
    .handler(async ({ input, context }) => {
      const plan = await getPlan(context.user.id);
      const used = await usageToday(context.user.id);
      if (used.tutor >= PLANS[plan].limits.tutorPerDay) throw limitError("análises do Tutor");
      const safe = input.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
      const key = `tutor/${context.user.id}/${Date.now()}-${safe}`;
      const url = await getSignedUrl(s3, new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, ContentType: input.contentType }), { expiresIn: 600 });
      return { url, key, remaining: PLANS[plan].limits.tutorPerDay - used.tutor - 1 };
    }),

  solve: authed
    .input(z.object({ key: z.string().min(5).max(500), note: z.string().max(2000).optional() }))
    .handler(async ({ input, context }) => {
      if (!input.key.startsWith(`tutor/${context.user.id}/`)) throw new ORPCError("FORBIDDEN", { message: "Imagem inválida." });
      const head = await imageUrl(input.key);
      const res = await fetch(head);
      if (!res.ok || !res.headers.get("content-type")?.startsWith("image/")) {
        throw new ORPCError("BAD_REQUEST", { message: "Imagem não encontrada — o upload pode ter falhado." });
      }
      const bytes = new Uint8Array(await res.arrayBuffer());

      const t0 = Date.now();
      let output;
      try {
        ({ output } = await generateText({
        model: gateway("google/gemini-3.1-pro-preview"),
        output: Output.object({ schema: solutionSchema }),
        system: dedent`
          És o Tutor Resolve-IA, especialista em provas psicotécnicas e testes de aptidão
          (matrizes visuais tipo Raven, séries numéricas e de letras, figura intrusa,
          analogias, padrões geográficos e espaciais, cálculo rápido).

          Recebes uma fotografia ou captura de UM exercício de um material de ESTUDO
          ou simulado de treino da plataforma. O teu trabalho é ENSINAR, não apenas dar
          a resposta: identifica a regra, explica passo a passo, e dá uma dica para
          reconhecer o padrão mais rápido.

          Regras:
          - Responde sempre em português europeu.
          - Escolhe a opção correta exatamente como aparece na imagem (ex.: "C", "42", "Figura B").
          - Se a imagem não contiver um exercício de prova psicotécnica/aptidão, ou estiver
            ilegível, usa confidence "baixa" e explica nos steps o que vês e o que pedir ao utilizador.
          - Nunca marques nada como correto sem confiança real; quando em dúvida, confidence "media" ou "baixa".
        `,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: `Resolve e explica este exercício de treino.${input.note ? ` Nota do estudante: ${input.note}` : ""}` },
              { type: "file", mediaType: "image", data: bytes },
            ],
          },
        ],
        }));
      } catch (e) {
        console.error("tutor.solve failed after", Date.now() - t0, "ms", e);
        throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "A IA não conseguiu analisar a imagem. Tenta outra foto com melhor qualidade." });
      }

      const [row] = await db.insert(tutorSolves).values({ userId: context.user.id, imageKey: input.key, note: input.note ?? null, result: JSON.stringify(output) }).returning();
      return toRow(row!);
    }),

  list: authed.handler(async ({ context }) => {
    const rows = await db.select().from(tutorSolves).where(eq(tutorSolves.userId, context.user.id)).orderBy(desc(tutorSolves.createdAt)).limit(20);
    return Promise.all(rows.map(toRow));
  }),
};
