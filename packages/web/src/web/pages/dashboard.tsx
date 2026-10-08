import { Link } from "wouter";
import { ArrowRight, Sparkles, Timer } from "lucide-react";
import { authClient } from "../lib/auth";
import { PageHeader } from "../components/app-layout";
import { Panel, PanelHeader, Stat } from "../components/panel";
import { useOverview } from "../queries/stats";
import { useExamList } from "../queries/exams";
import { PLANS } from "../lib/plan-meta";

function TrendChart({ trend }: { trend: { day: string; rate: number; total: number }[] }) {
  if (trend.length < 2) return <p className="px-5 py-8 text-[13px] text-muted">Faz exercícios em 2 dias diferentes para veres a tua evolução.</p>;
  const w = 560;
  const h = 120;
  const pts = trend.slice(-30).map((t, i, arr) => ({
    x: (i / Math.max(1, arr.length - 1)) * w,
    y: h - (t.rate / 100) * (h - 16) - 8,
    ...t,
  }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  return (
    <div className="px-5 py-4">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        {[25, 50, 75].map((v) => (
          <line key={v} x1="0" x2={w} y1={h - (v / 100) * (h - 16) - 8} y2={h - (v / 100) * (h - 16) - 8} stroke="#1C2A45" strokeDasharray="3 5" />
        ))}
        <path d={path} fill="none" stroke="#22D3EE" strokeWidth="2" />
        {pts.map((p) => (
          <circle key={p.day} cx={p.x} cy={p.y} r="3" fill="#22D3EE">
            <title>{`${p.day}: ${p.rate}% (${p.total} exercícios)`}</title>
          </circle>
        ))}
      </svg>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-muted">
        <span>{pts[0]!.day}</span>
        <span>{pts[pts.length - 1]!.day}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: session } = authClient.useSession();
  const overview = useOverview();
  const exams = useExamList();

  if (overview.isLoading)
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <span className="label-mono animate-pulse">A carregar o teu painel…</span>
      </div>
    );
  const d = overview.data;
  if (!d) return <p className="text-[14px] text-muted">Não foi possível carregar as estatísticas.</p>;

  const recentExams = (exams.data ?? []).filter((e) => e.finishedAt).slice(0, 5);

  return (
    <div>
      <PageHeader
        title={`Olá, ${session?.user.name?.split(" ")[0] ?? "atleta mental"}`}
        sub="O teu quartel-general de treino psicotécnico."
        right={
          <div className="flex gap-2.5">
            <Link href="/app/treino" className="rounded-md bg-primary px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-primary/85">
              Treinar agora
            </Link>
            <Link href="/app/simulado" className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-[13px] font-medium text-muted hover:text-foreground">
              <Timer className="size-4" /> Simulado
            </Link>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Precisão global" value={d.rate === null ? "—" : `${d.rate}%`} hint={d.total ? `${d.correct} de ${d.total} corretas` : "Ainda sem exercícios"} accent={d.rate !== null && d.rate >= 70 ? "success" : d.rate !== null && d.rate < 50 ? "danger" : undefined} />
        <Stat label="Exercícios feitos" value={String(d.total)} accent="cyan" />
        <Stat label="Tutor IA hoje" value={`${d.usage.tutor}/${d.usage.tutorLimit}`} hint="análises usadas" accent={d.usage.tutor >= d.usage.tutorLimit ? "warn" : undefined} />
        <Stat label="Simulados hoje" value={`${d.usage.exams}/${d.usage.examsLimit}`} hint={`plano ${PLANS[d.plan].name}`} accent={d.usage.exams >= d.usage.examsLimit ? "warn" : undefined} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Panel className="lg:col-span-3">
          <PanelHeader title="Precisão por dia (%)" />
          <TrendChart trend={d.trend} />
        </Panel>
        <Panel className="lg:col-span-2">
          <PanelHeader title="Precisão por categoria" />
          <div className="space-y-3 px-5 py-4">
            {d.byCategory.map((c) => (
              <div key={c.category}>
                <div className="mb-1 flex justify-between text-[12px]">
                  <span className="text-foreground/85">{c.label}</span>
                  <span className="font-mono text-muted">{c.rate === null ? "—" : `${c.rate}% · ${c.total}`}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className={c.rate === null ? "" : c.rate >= 70 ? "h-full rounded-full bg-success" : c.rate >= 50 ? "h-full rounded-full bg-cyan" : "h-full rounded-full bg-danger"}
                    style={{ width: `${c.rate ?? 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Panel className="lg:col-span-2">
          <PanelHeader
            title="Recomendações"
            right={<Sparkles className="size-4 text-primary-bright" />}
          />
          <ul className="space-y-2.5 px-5 py-4">
            {d.recs.map((rec) => (
              <li key={rec} className="flex gap-2.5 text-[13px] leading-relaxed text-muted">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary-bright" />
                {rec}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel className="lg:col-span-3">
          <PanelHeader
            title="Últimos simulados"
            right={
              <Link href="/app/simulado" className="inline-flex items-center gap-1 text-[12px] text-primary-bright hover:underline">
                Novo <ArrowRight className="size-3" />
              </Link>
            }
          />
          {recentExams.length === 0 ? (
            <p className="px-5 py-8 text-[13px] text-muted">Ainda não fizeste nenhum simulado. Testa-te contra o relógio.</p>
          ) : (
            <div className="divide-y divide-border">
              {recentExams.map((e) => (
                <Link key={e.id} href={`/app/simulado/${e.id}`} className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-surface-2/50">
                  <div>
                    <div className="text-[13px] font-medium capitalize">{e.mode} · nível {e.difficulty}</div>
                    <div className="font-mono text-[11px] text-muted">{new Date(e.startedAt).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-[15px] font-bold text-primary-bright">
                      {e.score}/{e.total}
                    </div>
                    <div className="font-mono text-[10px] text-muted">{e.timeUsedSec ? `${Math.floor(e.timeUsedSec / 60)}m${e.timeUsedSec % 60}s` : "—"}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
