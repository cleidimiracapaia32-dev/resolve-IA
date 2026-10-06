import { useRef, useState } from "react";
import { CircleAlert, ImageUp, Sparkles } from "lucide-react";
import { PageHeader } from "../components/app-layout";
import { Panel, PanelHeader } from "../components/panel";
import { useOverview } from "../queries/stats";
import { useSolve, useTutorHistory } from "../queries/tutor";
import { cn } from "../lib/utils";

function Solution({ result }: { result: { category: string; answer: string; confidence: string; rule: string; steps: string[]; tip: string } }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-sm border border-border bg-surface-2 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted">{result.category}</span>
        <span
          className={cn(
            "rounded-sm px-2 py-1 font-mono text-[10px] uppercase tracking-widest",
            result.confidence === "alta" ? "bg-success/15 text-success" : result.confidence === "media" ? "bg-warn/15 text-warn" : "bg-danger/15 text-danger",
          )}
        >
          confiança {result.confidence}
        </span>
      </div>
      <div className="rounded-md border border-primary/40 bg-primary/10 px-5 py-4">
        <div className="label-mono">Resposta</div>
        <div className="mt-1 font-display text-[22px] font-bold text-primary-bright">{result.answer}</div>
      </div>
      <div>
        <div className="label-mono">A regra</div>
        <p className="mt-1.5 text-[14px] leading-relaxed">{result.rule}</p>
      </div>
      <div>
        <div className="label-mono">Passo a passo</div>
        <ol className="mt-2 space-y-2">
          {result.steps.map((s, i) => (
            <li key={i} className="flex gap-3 text-[13px] leading-relaxed text-foreground/90">
              <span className="font-mono text-primary-bright">{String(i + 1).padStart(2, "0")}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="rounded-md border border-cyan/30 bg-cyan/5 px-4 py-3">
        <div className="label-mono text-cyan">Dica para a próxima</div>
        <p className="mt-1 text-[13px] leading-relaxed text-foreground/90">{result.tip}</p>
      </div>
    </div>
  );
}

export default function Tutor() {
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [drag, setDrag] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<ReturnType<typeof useSolve>["mutateAsync"]>> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const solve = useSolve();
  const history = useTutorHistory();
  const overview = useOverview();
  const usage = overview.data?.usage;

  const run = () => {
    if (!file) return;
    setResult(null);
    solve.mutate(
      { file, note },
      { onSuccess: (r) => setResult(r) },
    );
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) {
      setFile(f);
      setResult(null);
    }
  };

  const remaining = usage ? usage.tutorLimit - usage.tutor : null;

  return (
    <div className="pb-12">
      <PageHeader
        title="Tutor IA"
        sub="Carrega uma imagem de um exercício de treino — de um livro, simulado da plataforma ou ficha de estudo — e recebe a resolução explicada."
        right={
          remaining !== null ? (
            <span className={cn("rounded-md border px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest", remaining <= 0 ? "border-warn/50 text-warn" : "border-border text-muted")}>
              {remaining} análises restantes hoje
            </span>
          ) : undefined
        }
      />

      <div className="grid gap-4 lg:grid-cols-5">
        <Panel className="lg:col-span-2">
          <PanelHeader title="Nova análise" />
          <div className="space-y-4 p-5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              className={cn(
                "flex w-full flex-col items-center justify-center gap-2.5 rounded-md border border-dashed px-4 py-10 text-center transition-colors",
                drag ? "border-primary bg-primary/10" : "border-border hover:border-border-strong",
              )}
            >
              {file ? (
                <>
                  <img src={URL.createObjectURL(file)} alt="Exercício" className="max-h-40 rounded-md border border-border object-contain" />
                  <span className="font-mono text-[11px] text-muted">{file.name}</span>
                </>
              ) : (
                <>
                  <ImageUp className="size-7 text-primary-bright" strokeWidth={1.6} />
                  <span className="text-[13px] font-medium">Arrasta uma imagem ou clica para escolher</span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted">PNG · JPG · WebP</span>
                </>
              )}
            </button>
            <input
              ref={inputRef}
              type="file"
              aria-label="Carregar imagem do exercício"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setFile(f);
                  setResult(null);
                }
              }}
            />
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              aria-label="Nota opcional para o tutor"
              placeholder="Nota opcional — ex.: «é de um simulado CEFAD», «não percebo a regra das colunas»"
              className="w-full resize-none rounded-md border border-border bg-surface-2 px-3.5 py-2.5 text-[13px] outline-none placeholder:text-muted focus:border-primary"
            />
            <button
              type="button"
              onClick={run}
              disabled={!file || solve.isPending || remaining === 0}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-primary/85 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles className="size-4" />
              {solve.isPending ? "A analisar…" : "Resolver e explicar"}
            </button>
            {solve.isPending ? (
              <div className="space-y-2">
                {["A ler a imagem…", "A identificar a regra…", "A escrever a explicação…"].map((s, i) => (
                  <div key={s} className="label-mono animate-pulse" style={{ animationDelay: `${i * 700}ms` }}>
                    {s}
                  </div>
                ))}
              </div>
            ) : null}
            {solve.isError ? (
              <div className="flex gap-2.5 rounded-md border border-danger/40 bg-danger/10 px-3.5 py-3 text-[13px] text-danger">
                <CircleAlert className="mt-0.5 size-4 shrink-0" />
                {solve.error.message}
              </div>
            ) : null}
          </div>
        </Panel>

        <Panel className="lg:col-span-3">
          <PanelHeader title="Resolução" />
          <div className="p-5">
            {solve.isPending ? (
              <div className="grid min-h-[280px] place-items-center">
                <span className="label-mono animate-pulse">O tutor está a trabalhar…</span>
              </div>
            ) : result ? (
              <div className="rise">
                <Solution result={result.result} />
              </div>
            ) : (
              <div className="grid min-h-[280px] place-items-center text-center">
                <div>
                  <Sparkles className="mx-auto size-8 text-border-strong" strokeWidth={1.4} />
                  <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-muted">
                    A resolução aparece aqui — resposta, regra, passos e uma dica para reconheceres o padrão sozinho da próxima vez.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Panel>
      </div>

      <Panel className="mt-4">
        <PanelHeader title="Análises anteriores" />
        {(history.data ?? []).length === 0 ? (
          <p className="px-5 py-8 text-[13px] text-muted">Sem histórico ainda.</p>
        ) : (
          <div className="divide-y divide-border">
            {(history.data ?? []).map((h) => (
              <button key={h.id} type="button" onClick={() => setResult(h)} className="flex w-full items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-surface-2/50">
                <img src={h.imageUrl} alt="" className="size-12 shrink-0 rounded-sm border border-border object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium">{h.result.answer}</div>
                  <div className="font-mono text-[11px] text-muted">
                    {h.result.category} · {new Date(h.createdAt).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <span className={cn("font-mono text-[10px] uppercase tracking-widest", h.result.confidence === "alta" ? "text-success" : h.result.confidence === "media" ? "text-warn" : "text-danger")}>{h.result.confidence}</span>
              </button>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
