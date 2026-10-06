import { Link } from "wouter";
import { ArrowRight, BrainCircuit, ChartLine, Images, ListChecks, Sparkles, Timer } from "lucide-react";
import { useMemo } from "react";
import { authClient } from "../lib/auth";
import { Logo } from "../components/logo";
import { FigureView } from "../components/figure";
import { generate, CATEGORY_META, CATEGORIES } from "../../api/lib/exercises";

function MatrixDemo() {
  const ex = useMemo(() => generate("matrices", 2, 1234), []);
  return (
    <div className="panel rise relative w-full max-w-md p-5 [animation-delay:150ms]">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <span className="label-mono">Matriz · nível 2</span>
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-success">
          <span className="size-1.5 rounded-full bg-success" /> RESOLVIDA EM 9S
        </span>
      </div>
      <div className="mx-auto mt-4 grid w-fit grid-cols-3 overflow-hidden rounded-md border border-border">
        {ex.visual.kind === "matrix" &&
          ex.visual.cells.map((cell, i) => (
            <div
              key={i}
              className="grid size-[74px] place-items-center border-border bg-surface-2/40 [&:nth-child(-n+6)]:border-b [&:not(:nth-child(3n))]:border-r"
            >
              {cell ? (
                <FigureView figure={cell} size={64} />
              ) : (
                <div className="grid size-[64px] place-items-center rounded-sm border border-dashed border-primary/60 bg-primary/10">
                  <FigureView figure={ex.options[ex.answer]!.kind === "figure" ? ex.options[ex.answer]!.figure : cell!} size={58} tone="#6AA6FF" />
                </div>
              )}
            </div>
          ))}
      </div>
      <p className="mt-4 text-[13px] leading-relaxed text-muted">{ex.rule}</p>
      <div className="mt-3 border-t border-border pt-3">
        <div className="label-mono">Tutor IA</div>
        <p className="mt-1.5 text-[13px] leading-relaxed text-foreground/85">{ex.steps[0]}</p>
      </div>
    </div>
  );
}

const FEATURES = [
  { icon: Images, title: "Tutor IA", text: "Fotografa um exercício de um livro ou simulado de treino e recebe a resolução explicada passo a passo, com a regra e uma dica para a próxima vez." },
  { icon: ListChecks, title: "Banco infinito", text: "Milhares de exercícios gerados por algoritmo em 6 categorias psicotécnicas — nunca repetes o mesmo exercício duas vezes." },
  { icon: Timer, title: "Simulados cronometrados", text: "Baterias de 10, 20 ou 40 perguntas contra o relógio, com relatório completo no fim: resposta correta, regra e explicação de cada item." },
  { icon: ChartLine, title: "Estatísticas por área", text: "Taxa de acerto e tempo médio por categoria. O painel mostra onde estás a perder pontos e o que treinar a seguir." },
  { icon: BrainCircuit, title: "Dificuldade progressiva", text: "Três níveis em cada categoria, do raciocínio direto às regras combinadas de matrizes, séries de Fibonacci e antónimos avançados." },
  { icon: Sparkles, title: "Explicações, não só respostas", text: "Cada exercício termina com a regra e os passos do raciocínio — o objetivo é resolveres sozinho na próxima vez." },
];

export default function Landing() {
  const { data: session } = authClient.useSession();
  const cta = session ? { to: "/app", label: "Abrir o painel" } : { to: "/entrar", label: "Criar conta grátis" };

  return (
    <div className="grid-bg min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="hidden items-center gap-7 text-[13px] text-muted md:flex">
          <a href="#funcionalidades" className="transition-colors hover:text-foreground">Funcionalidades</a>
          <a href="#categorias" className="transition-colors hover:text-foreground">Categorias</a>
          <a href="#planos" className="transition-colors hover:text-foreground">Planos</a>
        </nav>
        <Link href={cta.to} className="rounded-md bg-primary px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary/85">
          {session ? "Painel" : "Entrar"}
        </Link>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-10 lg:grid-cols-2">
        <div>
          <div className="rise inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-primary-bright">
            <Sparkles className="size-3.5" /> Preparação para provas psicotécnicas
          </div>
          <h1 className="rise mt-6 font-display text-[44px] font-bold leading-[1.08] tracking-tight [animation-delay:60ms] md:text-[54px]">
            Chega à prova com o raciocínio <span className="text-primary-bright">treinado.</span>
          </h1>
          <p className="rise mt-5 max-w-lg text-[16px] leading-relaxed text-muted [animation-delay:120ms]">
            Exercícios infinitos de matrizes, séries, analogias e raciocínio abstrato — com simulados cronometrados e um tutor IA
            que explica cada passo. Treina antes. Na prova, resolve sozinho.
          </p>
          <div className="rise mt-8 flex flex-wrap items-center gap-3 [animation-delay:180ms]">
            <Link href={cta.to} className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-primary/85">
              {cta.label} <ArrowRight className="size-4" />
            </Link>
            <a href="#funcionalidades" className="rounded-md border border-border px-5 py-3 text-[14px] font-medium text-muted transition-colors hover:border-border-strong hover:text-foreground">
              Ver como funciona
            </a>
          </div>
          <div className="rise mt-10 flex gap-8 [animation-delay:240ms]">
            {[
              ["6", "categorias"],
              ["∞", "exercícios"],
              ["3", "níveis"],
            ].map(([v, l]) => (
              <div key={l}>
                <div className="font-display text-2xl font-bold text-foreground">{v}</div>
                <div className="label-mono mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center lg:justify-end">
          <MatrixDemo />
        </div>
      </section>

      <section id="categorias" className="border-t border-border bg-surface/50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="label-mono">Cobertura</div>
          <h2 className="mt-2 font-display text-[28px] font-bold tracking-tight">As 6 famílias de exercícios das provas reais</h2>
          <div className="mt-8 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((c) => (
              <div key={c} className="bg-surface px-5 py-4 transition-colors hover:bg-surface-2/60">
                <div className="text-[14px] font-semibold">{CATEGORY_META[c].label}</div>
                <div className="mt-1 text-[12px] text-muted">
                  {c === "matrices" && "Padrões de forma, quantidade e preenchimento em grelhas 3×3."}
                  {c === "series" && "Progressões aritméticas, geométricas, Fibonacci e diferenças crescentes."}
                  {c === "letters" && "Saltos no alfabeto, constantes e crescentes, com retorno ao A."}
                  {c === "oddone" && "Encontra a figura que quebra a regra do grupo."}
                  {c === "analogies" && "Relações entre pares: instrumentos, habitações, antónimos, parte-todo."}
                  {c === "calc" && "Contas de cabeça com ordem de operações e percentagens."}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="funcionalidades" className="mx-auto max-w-6xl px-6 py-16">
        <div className="label-mono">Funcionalidades</div>
        <h2 className="mt-2 font-display text-[28px] font-bold tracking-tight">Um quartel-general de treino</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="panel rise p-5" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="grid size-9 place-items-center rounded-md border border-border bg-surface-2 text-primary-bright">
                <Icon className="size-[18px]" strokeWidth={1.8} />
              </div>
              <div className="mt-4 font-display text-[15px] font-semibold">{title}</div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="planos" className="border-t border-border bg-surface/50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="label-mono">Planos</div>
          <h2 className="mt-2 font-display text-[28px] font-bold tracking-tight">Começa grátis. Sobe quando precisares.</h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {[
              { name: "Free", price: "0 €", feats: ["3 análises do Tutor IA por dia", "1 simulado por dia", "Exercícios até ao nível 2", "Painel de progresso básico"] },
              { name: "Pro", price: "7,90 €/mês", feats: ["60 análises do Tutor IA por dia", "Simulados ilimitados + bateria completa", "Todos os níveis de dificuldade", "Estatísticas avançadas e recomendações"], hot: true },
              { name: "Institucional", price: "Sob consulta", feats: ["Tudo do Pro, sem limites práticos", "Contas para escolas, centros de formação e RH", "Relatórios por grupo", "Gestor de conta dedicado"] },
            ].map((p) => (
              <div key={p.name} className={p.hot ? "panel relative border-primary/60 p-6" : "panel p-6"}>
                {p.hot ? <span className="absolute -top-2.5 left-5 rounded-sm bg-primary px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-white">Recomendado</span> : null}
                <div className="font-display text-[17px] font-semibold">{p.name}</div>
                <div className="mt-1 font-display text-[24px] font-bold text-primary-bright">{p.price}</div>
                <ul className="mt-4 space-y-2">
                  {p.feats.map((f) => (
                    <li key={f} className="flex gap-2 text-[13px] text-muted">
                      <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-cyan" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-[12px] text-muted md:flex-row md:items-center md:justify-between">
          <Logo />
          <p className="max-w-xl leading-relaxed">
            Resolve-IA é uma ferramenta de <span className="text-foreground">preparação e estudo</span>. O Tutor existe para explicar
            exercícios de treino antes da prova — não para ser usado durante exames reais, avaliações ou processos de seleção.
          </p>
        </div>
      </footer>
    </div>
  );
}
