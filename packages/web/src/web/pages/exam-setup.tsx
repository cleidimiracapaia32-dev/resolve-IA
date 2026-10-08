import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Check, Lock, Timer } from "lucide-react";
import { PageHeader } from "../components/app-layout";
import { Panel, PanelHeader } from "../components/panel";
import { useExamList, useStartExam } from "../queries/exams";
import { useOverview } from "../queries/stats";
import { CATEGORIES, CATEGORY_META, type Category } from "../../api/lib/exercises";
import { PLANS } from "../lib/plan-meta";
import { EXAM_MODES } from "../../api/lib/exam-modes";
import { cn } from "../lib/utils";

export default function ExamSetup() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<keyof typeof EXAM_MODES>("express");
  const [difficulty, setDifficulty] = useState(1);
  const [cats, setCats] = useState<Category[]>([...CATEGORIES]);
  const [error, setError] = useState<string | null>(null);
  const start = useStartExam();
  const list = useExamList();
  const overview = useOverview();
  const maxDiff = overview.data ? PLANS[overview.data.plan].limits.maxDifficulty : 1;
  const plan = overview.data?.plan ?? "free";

  const toggle = (c: Category) => setCats((prev) => (prev.includes(c) ? (prev.length > 1 ? prev.filter((x) => x !== c) : prev) : [...prev, c]));

  const go = () => {
    setError(null);
    start.mutate(
      { mode, difficulty, categories: cats },
      { onSuccess: (r) => navigate(`/app/simulado/${r.id}`), onError: (e) => setError(e.message) },
    );
  };

  return (
    <div>
      <PageHeader title="Simulado cronometrado" sub="Condições reais: contra o relógio, sem explicações até ao fim." />

      <div className="grid gap-4 lg:grid-cols-3">
        {Object.entries(EXAM_MODES).map(([id, m]) => {
          const locked = m.full && plan === "free";
          return (
            <button
              key={id}
              type="button"
              disabled={locked}
              onClick={() => setMode(id as keyof typeof EXAM_MODES)}
              className={cn(
                "panel p-5 text-left transition-colors",
                mode === id ? "border-primary bg-primary/10" : "hover:border-border-strong",
                locked && "cursor-not-allowed opacity-50",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-[15px] font-semibold">{m.label}</span>
                {locked ? <Lock className="size-4 text-warn" /> : null}
              </div>
              <div className="mt-2 flex items-center gap-3 font-mono text-[12px] text-muted">
                <span>{m.questions} perguntas</span>
                <span className="inline-flex items-center gap-1">
                  <Timer className="size-3" /> {m.minutes} min
                </span>
              </div>
              {locked ? <div className="mt-2 text-[12px] text-warn">Disponível no plano Pro</div> : null}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel>
          <PanelHeader title="Dificuldade" />
          <div className="flex gap-2 px-5 py-4">
            {[1, 2, 3].map((d) => (
              <button
                key={d}
                type="button"
                disabled={d > maxDiff}
                onClick={() => setDifficulty(d)}
                className={cn(
                  "grid size-10 place-items-center rounded-md border font-mono text-[14px] transition-colors",
                  difficulty === d ? "border-primary bg-primary/15 text-primary-bright" : "border-border text-muted hover:text-foreground",
                  d > maxDiff && "cursor-not-allowed opacity-35",
                )}
              >
                {d}
              </button>
            ))}
            <span className="ml-2 self-center text-[12px] text-muted">{["", "Direto", "Intermédio", "Avançado"][difficulty]}</span>
          </div>
        </Panel>
        <Panel>
          <PanelHeader title={`Categorias (${cats.length}/6)`} />
          <div className="flex flex-wrap gap-2 px-5 py-4">
            {CATEGORIES.map((c) => {
              const on = cats.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggle(c)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors",
                    on ? "border-primary bg-primary/15 text-primary-bright" : "border-border text-muted hover:text-foreground",
                  )}
                >
                  {on ? <Check className="size-3" /> : null}
                  {CATEGORY_META[c].short}
                </button>
              );
            })}
          </div>
        </Panel>
      </div>

      {error ? <div className="mt-4 rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-[13px] text-danger">{error}</div> : null}

      <div className="mt-6">
        <button
          type="button"
          onClick={go}
          disabled={start.isPending}
          className="rounded-md bg-primary px-6 py-3 text-[14px] font-semibold text-white hover:bg-primary/85 disabled:opacity-60"
        >
          {start.isPending ? "A preparar…" : "Começar simulado"}
        </button>
      </div>

      <Panel className="mt-8">
        <PanelHeader title="Histórico" />
        {(list.data ?? []).length === 0 ? (
          <p className="px-5 py-8 text-[13px] text-muted">Ainda não tens simulados. O primeiro está a um clique.</p>
        ) : (
          <div className="divide-y divide-border">
            {(list.data ?? []).map((e) => (
              <Link key={e.id} href={`/app/simulado/${e.id}`} className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-surface-2/50">
                <div>
                  <div className="text-[13px] font-medium capitalize">
                    {EXAM_MODES[e.mode as keyof typeof EXAM_MODES]?.label ?? e.mode} · nível {e.difficulty}
                  </div>
                  <div className="font-mono text-[11px] text-muted">{new Date(e.startedAt).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                </div>
                <div className="font-display text-[15px] font-bold text-primary-bright">
                  {e.finishedAt ? `${e.score}/${e.total}` : <span className="font-mono text-[11px] font-normal uppercase tracking-widest text-warn">em curso</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
