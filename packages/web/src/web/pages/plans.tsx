import { Check } from "lucide-react";
import { PageHeader } from "../components/app-layout";
import { useOverview } from "../queries/stats";
import { usePlans, useSetPlan } from "../queries/billing";
import { cn } from "../lib/utils";

const FEATURES: Record<string, string[]> = {
  free: ["3 análises do Tutor IA por dia", "1 simulado por dia", "Exercícios até ao nível 2", "Painel de progresso"],
  pro: ["60 análises do Tutor IA por dia", "50 simulados por dia", "Bateria completa (40 perguntas)", "Todos os níveis de dificuldade", "Estatísticas avançadas e recomendações"],
  institucional: ["300 análises do Tutor IA por dia", "200 simulados por dia", "Tudo do Pro sem limites práticos", "Contas para escolas, centros e RH", "Relatórios por grupo"],
};

export default function Plans() {
  const plans = usePlans();
  const overview = useOverview();
  const setPlan = useSetPlan();

  if (plans.isLoading)
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <span className="label-mono animate-pulse">A carregar planos…</span>
      </div>
    );

  const current = plans.data?.current ?? "free";
  const usage = overview.data?.usage;

  return (
    <div>
      <PageHeader title="Planos de uso" sub="Escolhe o ritmo do teu treino. Podes mudar a qualquer momento." />

      {usage ? (
        <div className="panel mb-6 flex flex-wrap items-center gap-x-8 gap-y-2 px-5 py-4">
          <span className="label-mono">Uso de hoje</span>
          <span className="font-mono text-[12px] text-muted">
            Tutor IA: <span className="text-foreground">{usage.tutor}/{usage.tutorLimit}</span>
          </span>
          <span className="font-mono text-[12px] text-muted">
            Simulados: <span className="text-foreground">{usage.exams}/{usage.examsLimit}</span>
          </span>
          <span className="font-mono text-[12px] text-muted">
            Plano atual: <span className="font-semibold uppercase text-primary-bright">{current}</span>
          </span>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        {(plans.data?.plans ?? []).map((p) => {
          const isCurrent = p.id === current;
          return (
            <div key={p.id} className={cn("panel relative flex flex-col p-6", p.id === "pro" && "border-primary/60")}>
              {p.id === "pro" ? <span className="absolute -top-2.5 left-5 rounded-sm bg-primary px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-white">Recomendado</span> : null}
              <div className="font-display text-[17px] font-semibold">{p.name}</div>
              <div className="mt-1 font-display text-[24px] font-bold text-primary-bright">{p.price}</div>
              <ul className="mt-4 flex-1 space-y-2">
                {(FEATURES[p.id] ?? []).map((f) => (
                  <li key={f} className="flex gap-2 text-[13px] text-muted">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-cyan" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={isCurrent || setPlan.isPending}
                onClick={() => setPlan.mutate({ plan: p.id as "free" | "pro" | "institucional" })}
                className={cn(
                  "mt-6 w-full rounded-md px-4 py-2.5 text-[13px] font-semibold transition-colors",
                  isCurrent ? "cursor-default border border-border text-muted" : "bg-primary text-white hover:bg-primary/85",
                )}
              >
                {isCurrent ? "Plano atual" : setPlan.isPending ? "A ativar…" : p.id === "free" ? "Mudar para Free" : `Ativar ${p.name}`}
              </button>
            </div>
          );
        })}
      </div>

      <p className="mt-6 max-w-2xl text-[12px] leading-relaxed text-muted">
        A cobrança real (Stripe) é ligada na próxima fase — por agora, a ativação de plano é imediata e sem custo, para testares a
        experiência completa. Os limites diários já estão ativos por plano.
      </p>
    </div>
  );
}
