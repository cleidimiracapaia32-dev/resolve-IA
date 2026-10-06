import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "wouter";
import { AlarmClock, ArrowLeft, ArrowRight, Flag } from "lucide-react";
import { ExerciseCard, Explanation } from "../components/exercise";
import { useExam, useFinishExam } from "../queries/exams";
import { CATEGORY_META } from "../../api/lib/exercises";
import { cn } from "../lib/utils";

function fmt(sec: number) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}

export default function ExamRun() {
  const { id } = useParams<{ id: string }>();
  const examId = Number(id);
  const exam = useExam(examId);
  const finish = useFinishExam();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, { choice: number; timeMs: number }>>(new Map());
  const [left, setLeft] = useState<number | null>(null);
  const startedQ = useRef(Date.now());
  const submitted = useRef(false);

  const data = exam.data;

  useEffect(() => {
    if (data && !data.finished && left === null) setLeft(data.remainingSec);
  }, [data, left]);

  const ticking = !!data && !data.finished && left !== null && left > 0;
  useEffect(() => {
    if (!ticking) return;
    const t = setInterval(() => setLeft((v) => (v === null ? v : Math.max(0, v - 1))), 1000);
    return () => clearInterval(t);
  }, [ticking]);

  const doFinish = () => {
    if (submitted.current || !data || data.finished) return;
    submitted.current = true;
    finish.mutate({
      id: examId,
      answers: [...answers.entries()].map(([i, a]) => ({ index: i, choice: a.choice, timeMs: a.timeMs })),
    });
  };

  useEffect(() => {
    if (left === 0) doFinish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  const pick = (choice: number) => {
    const timeMs = Date.now() - startedQ.current;
    setAnswers((m) => new Map(m).set(index, { choice, timeMs }));
  };

  const goTo = (i: number) => {
    setIndex(i);
    startedQ.current = Date.now();
  };

  const review = useMemo(() => {
    if (!data?.finished) return null;
    return data;
  }, [data]);

  if (exam.isLoading || !data)
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <span className="label-mono animate-pulse">A carregar simulado…</span>
      </div>
    );

  // ── Review mode ─────────────────────────────────────────────
  if (review) {
    const pct = Math.round(((review.score ?? 0) / review.total) * 100);
    return (
      <div className="pb-12">
        <Link href="/app/simulado" className="mb-6 inline-flex items-center gap-2 text-[13px] text-muted hover:text-foreground">
          <ArrowLeft className="size-4" /> Voltar aos simulados
        </Link>
        <div className="panel p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="label-mono">Resultado</div>
              <div className="mt-1 font-display text-[34px] font-bold">
                {review.score}<span className="text-muted">/{review.total}</span>
                <span className={cn("ml-3 text-[20px]", pct >= 70 ? "text-success" : pct >= 50 ? "text-cyan" : "text-danger")}>{pct}%</span>
              </div>
            </div>
            <div className="text-right font-mono text-[12px] text-muted">
              <div>tempo usado: {review.timeUsedSec ? fmt(review.timeUsedSec) : "—"}</div>
              <div className="capitalize">modo: {review.mode} · nível {review.difficulty}</div>
            </div>
          </div>
          <p className="mt-3 text-[13px] text-muted">
            {pct >= 70 ? "Bom desempenho — sobe de nível para continuar a evoluir." : pct >= 50 ? "Caminho certo. Revê as explicações abaixo e repete." : "Sem stress: revê cada explicação com calma e volta a tentar."}
          </p>
        </div>

        <div className="mt-6 space-y-8">
          {review.exercises.map((ex, i) => {
            const solved = ex as { answer: number; rule: string; steps: string[] };
            const choice = review.choices[(ex as { seed: number }).seed];
            const answered = typeof choice === "number";
            const correct = answered && choice === solved.answer;
            return (
              <div key={i} className="panel rise p-6" style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}>
                <div className="mb-4 flex items-center justify-between">
                  <span className="label-mono">
                    {String(i + 1).padStart(2, "0")} · {CATEGORY_META[(ex as { category: keyof typeof CATEGORY_META }).category].label}
                  </span>
                  <span className={cn("font-mono text-[11px] uppercase tracking-widest", !answered ? "text-warn" : correct ? "text-success" : "text-danger")}>
                    {!answered ? "Sem resposta" : correct ? "Correta" : "Errada"}
                  </span>
                </div>
                <ExerciseCard
                  exercise={ex}
                  selected={null}
                  onSelect={() => {}}
                  reveal={answered ? { answer: solved.answer, choice: choice! } : { answer: solved.answer, choice: -1 }}
                  disabled
                />
                <Explanation rule={solved.rule} steps={solved.steps} correct={!!correct} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Run mode ────────────────────────────────────────────────
  const ex = data.exercises[index]!;
  const answered = answers.get(index);
  const low = left !== null && left <= 60;

  return (
    <div className="pb-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="label-mono">
            {String(index + 1).padStart(2, "0")} / {data.total}
          </span>
          <div className="flex gap-1">
            {data.exercises.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Pergunta ${i + 1}`}
                onClick={() => goTo(i)}
                className={cn(
                  "size-2.5 rounded-[2px] transition-colors",
                  i === index ? "bg-primary" : answers.has(i) ? "bg-cyan/70" : "bg-surface-2 ring-1 ring-border",
                )}
              />
            ))}
          </div>
        </div>
        <div className={cn("inline-flex items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-[15px] font-medium", low ? "border-danger/60 bg-danger/10 text-danger" : "border-border bg-surface text-foreground")}>
          <AlarmClock className="size-4" />
          {left === null ? "--:--" : fmt(left)}
        </div>
      </div>

      <div className="panel p-6 md:p-8">
        <ExerciseCard exercise={ex} selected={answered?.choice ?? null} onSelect={pick} />
        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => goTo(index - 1)}
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-[13px] font-medium text-muted transition-colors hover:text-foreground disabled:opacity-40"
          >
            <ArrowLeft className="size-4" /> Anterior
          </button>
          {index < data.total - 1 ? (
            <button type="button" onClick={() => goTo(index + 1)} className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-primary/85">
              Seguinte <ArrowRight className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={doFinish}
              disabled={finish.isPending}
              className="inline-flex items-center gap-2 rounded-md bg-success px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-success/85 disabled:opacity-60"
            >
              <Flag className="size-4" /> {finish.isPending ? "A terminar…" : `Terminar (${answers.size}/${data.total} respondidas)`}
            </button>
          )}
        </div>
      </div>
      <p className="mt-3 text-center font-mono text-[11px] text-muted">As explicações aparecem só no fim — como na prova real.</p>
    </div>
  );
}
