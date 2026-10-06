import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { PageHeader } from "../components/app-layout";
import { ExerciseCard, Explanation } from "../components/exercise";
import { fetchNext, useAnswer } from "../queries/practice";
import { useOverview } from "../queries/stats";
import { CATEGORIES, CATEGORY_META, type Category, type Exercise } from "../../api/lib/exercises";
import { PLANS } from "../../api/lib/plan-meta";
import { cn } from "../lib/utils";

interface Phase {
  exercise: Exercise;
  startedAt: number;
  selected: number | null;
  reveal: { answer: number; choice: number; correct: boolean; rule: string; steps: string[] } | null;
}

export default function Practice() {
  const [category, setCategory] = useState<Category>("matrices");
  const [difficulty, setDifficulty] = useState(1);
  const [phase, setPhase] = useState<Phase | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streak, setStreak] = useState({ ok: 0, n: 0 });
  const answer = useAnswer();
  const overview = useOverview();
  const maxDiff = overview.data ? PLANS[overview.data.plan].limits.maxDifficulty : 1;
  const qRef = useRef(0);

  const loadNext = useCallback(
    async (cat: Category, diff: number) => {
      setLoading(true);
      setError(null);
      try {
        const { exercise } = await fetchNext(cat, diff);
        setPhase({ exercise, startedAt: Date.now(), selected: null, reveal: null });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao carregar exercício.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadNext(category, difficulty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, difficulty]);

  const choose = (i: number) => {
    if (!phase || phase.reveal || phase.selected !== null) return;
    const id = ++qRef.current;
    setPhase({ ...phase, selected: i });
    answer.mutate(
      { category: phase.exercise.category, difficulty: phase.exercise.difficulty, seed: phase.exercise.seed, choice: i, timeMs: Date.now() - phase.startedAt },
      {
        onSuccess: (res) => {
          if (qRef.current !== id) return;
          setStreak((s) => ({ ok: s.ok + (res.correct ? 1 : 0), n: s.n + 1 }));
          setPhase((p) => (p ? { ...p, reveal: { answer: res.answer, choice: i, correct: res.correct, rule: res.rule, steps: res.steps } } : p));
        },
        onError: (e) => {
          setError(e.message);
          setPhase((p) => (p ? { ...p, selected: null } : p));
        },
      },
    );
  };

  return (
    <div>
      <PageHeader
        title="Treino livre"
        sub="Exercícios gerados na hora. Escolhe a categoria e o nível."
        right={
          <div className="flex items-center gap-4 font-mono text-[12px] text-muted">
            <span>
              Sessão: <span className="text-foreground">{streak.ok}/{streak.n}</span>
            </span>
            {streak.n >= 5 ? (
              <button type="button" onClick={() => setStreak({ ok: 0, n: 0 })} className="inline-flex items-center gap-1 hover:text-foreground">
                <RotateCcw className="size-3" /> Repor
              </button>
            ) : null}
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-md border px-3.5 py-2 text-[13px] font-medium transition-colors",
              category === c ? "border-primary bg-primary/15 text-primary-bright" : "border-border text-muted hover:border-border-strong hover:text-foreground",
            )}
          >
            {CATEGORY_META[c].label}
          </button>
        ))}
      </div>

      <div className="mb-8 flex items-center gap-2">
        <span className="label-mono mr-1">Nível</span>
        {[1, 2, 3].map((d) => (
          <button
            key={d}
            type="button"
            disabled={d > maxDiff}
            onClick={() => setDifficulty(d)}
            className={cn(
              "grid size-9 place-items-center rounded-md border font-mono text-[13px] transition-colors",
              difficulty === d ? "border-primary bg-primary/15 text-primary-bright" : "border-border text-muted hover:text-foreground",
              d > maxDiff && "cursor-not-allowed opacity-35",
            )}
            title={d > maxDiff ? "Disponível no plano Pro" : undefined}
          >
            {d}
          </button>
        ))}
        {maxDiff < 3 ? <span className="ml-2 font-mono text-[11px] text-warn">nível 3 no plano Pro</span> : null}
      </div>

      {error ? <div className="mb-4 rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-[13px] text-danger">{error}</div> : null}

      {loading || !phase ? (
        <div className="grid min-h-[300px] place-items-center">
          <span className="label-mono animate-pulse">A gerar exercício…</span>
        </div>
      ) : (
        <div className="rise pb-10">
          <ExerciseCard
            exercise={phase.exercise}
            selected={phase.selected}
            onSelect={choose}
            reveal={phase.reveal ? { answer: phase.reveal.answer, choice: phase.reveal.choice } : null}
            disabled={answer.isPending}
          />
          {answer.isPending ? <p className="mt-6 text-center font-mono text-[11px] text-muted">A verificar…</p> : null}
          {phase.reveal ? (
            <div className="rise">
              <Explanation rule={phase.reveal.rule} steps={phase.reveal.steps} correct={phase.reveal.correct} />
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => void loadNext(category, difficulty)}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-primary/85"
                >
                  Próximo exercício <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
