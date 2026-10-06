import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema";

export * from "./auth-schema";

/** Plano ativo de cada utilizador (free | pro | institucional). */
export const profiles = sqliteTable("profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  plan: text("plan").notNull().default("free"),
  planSince: integer("plan_since", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/** Sessões de simulado cronometrado. */
export const examSessions = sqliteTable(
  "exam_sessions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    mode: text("mode").notNull(),
    difficulty: integer("difficulty").notNull(),
    durationSec: integer("duration_sec").notNull(),
    /** JSON: [{ category, seed }] */
    items: text("items").notNull(),
    score: integer("score"),
    total: integer("total").notNull(),
    timeUsedSec: integer("time_used_sec"),
    startedAt: integer("started_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    finishedAt: integer("finished_at", { mode: "timestamp_ms" }),
  },
  (t) => [index("exam_user_idx").on(t.userId)],
);

/** Cada resposta dada (treino livre ou simulado). */
export const attempts = sqliteTable(
  "attempts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    category: text("category").notNull(),
    difficulty: integer("difficulty").notNull(),
    seed: integer("seed").notNull(),
    choice: integer("choice").notNull(),
    correct: integer("correct", { mode: "boolean" }).notNull(),
    timeMs: integer("time_ms").notNull(),
    sessionId: integer("session_id"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [index("attempt_user_idx").on(t.userId)],
);

/** Explicações do Tutor IA a partir de imagens de exercícios de estudo. */
export const tutorSolves = sqliteTable(
  "tutor_solves",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    imageKey: text("image_key").notNull(),
    note: text("note"),
    /** JSON com a análise estruturada da IA */
    result: text("result").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [index("solve_user_idx").on(t.userId)],
);
