import type { Exercise, Option, Visual } from "../../api/lib/exercises";
import { cn } from "../lib/utils";
import { FigureView } from "./figure";

const LETTERS = "ABCDEF";

export function MatrixGrid({ visual }: { visual: Extract<Visual, { kind: "matrix" }> }) {
  return (
    <div className="mx-auto grid w-fit grid-cols-3 overflow-hidden rounded-md border border-border">
      {visual.cells.map((cell, i) => (
        <div
          key={i}
          className={cn(
            "grid size-[88px] place-items-center border-border bg-surface-2/40 [&:nth-child(-n+6)]:border-b [&:not(:nth-child(3n))]:border-r",
            cell === null && "bg-primary/10",
          )}
        >
          {cell ? <FigureView figure={cell} size={76} /> : <span className="font-display text-2xl font-bold text-primary-bright">?</span>}
        </div>
      ))}
    </div>
  );
}

export function ExerciseVisual({ visual }: { visual: Visual }) {
  if (visual.kind === "matrix") return <MatrixGrid visual={visual} />;
  if (visual.kind === "row")
    return (
      <div className="flex flex-wrap items-end justify-center gap-4">
        {visual.figures.map((f, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <span className="label-mono text-primary-bright">{LETTERS[i]}</span>
            <div className="grid place-items-center rounded-md border border-border bg-surface-2/40 p-2">
              <FigureView figure={f} size={72} />
            </div>
          </div>
        ))}
      </div>
    );
  if (visual.kind === "sequence")
    return (
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {visual.terms.map((t, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span
              className={cn(
                "grid min-w-14 place-items-center rounded-md border px-3 py-2.5 font-mono text-xl font-medium",
                t === "?" ? "border-primary bg-primary/10 text-primary-bright" : "border-border bg-surface-2/40",
              )}
            >
              {t}
            </span>
            {i < visual.terms.length - 1 ? <span className="text-muted">→</span> : null}
          </div>
        ))}
      </div>
    );
  return <p className="text-center font-display text-xl font-semibold leading-relaxed">{visual.text}</p>;
}

export function OptionButton({
  option,
  index,
  state,
  disabled,
  onClick,
}: {
  option: Option;
  index: number;
  state: "idle" | "selected" | "correct" | "wrong" | "dim";
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "group relative flex items-center justify-center gap-3 rounded-md border px-4 py-3 transition-colors",
        state === "idle" && "border-border bg-surface-2/40 hover:border-primary/60 hover:bg-surface-2",
        state === "selected" && "border-primary bg-primary/15",
        state === "correct" && "border-success bg-success/15",
        state === "wrong" && "border-danger bg-danger/15",
        state === "dim" && "border-border/60 bg-surface-2/20 opacity-50",
        disabled && "cursor-default",
      )}
    >
      <span className="absolute left-3 top-2 font-mono text-[10px] uppercase tracking-widest text-muted">{LETTERS[index]}</span>
      {option.kind === "figure" ? (
        <FigureView figure={option.figure} size={72} />
      ) : (
        <span className="pt-2 font-mono text-[15px] font-medium">{option.text}</span>
      )}
    </button>
  );
}

export function ExerciseCard({
  exercise,
  selected,
  onSelect,
  reveal,
  disabled,
}: {
  exercise: Exercise;
  selected: number | null;
  onSelect: (i: number) => void;
  reveal?: { answer: number; choice: number } | null;
  disabled?: boolean;
}) {
  return (
    <div>
      <p className="text-center font-display text-[19px] font-semibold">{exercise.prompt}</p>
      <div className="mt-6">
        <ExerciseVisual visual={exercise.visual} />
      </div>
      <div className={cn("mx-auto mt-8 grid max-w-2xl gap-3", exercise.options[0]?.kind === "figure" ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-" + Math.min(exercise.options.length, 4))}>
        {exercise.options.map((opt, i) => {
          let state: "idle" | "selected" | "correct" | "wrong" | "dim" = "idle";
          if (reveal) {
            if (i === reveal.answer) state = "correct";
            else if (i === reveal.choice) state = "wrong";
            else state = "dim";
          } else if (selected === i) state = "selected";
          return <OptionButton key={i} option={opt} index={i} state={state} disabled={disabled || !!reveal} onClick={() => onSelect(i)} />;
        })}
      </div>
    </div>
  );
}

export function Explanation({ rule, steps, correct }: { rule: string; steps: string[]; correct: boolean }) {
  return (
    <div className={cn("mt-8 rounded-md border p-5", correct ? "border-success/40 bg-success/5" : "border-danger/40 bg-danger/5")}>
      <div className={cn("font-display text-[15px] font-semibold", correct ? "text-success" : "text-danger")}>{correct ? "Correto" : "Incorreto"}</div>
      <p className="mt-2 text-[14px] text-foreground/90">{rule}</p>
      <ol className="mt-3 space-y-1.5">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-2.5 text-[13px] text-muted">
            <span className="font-mono text-primary-bright">{String(i + 1).padStart(2, "0")}</span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
