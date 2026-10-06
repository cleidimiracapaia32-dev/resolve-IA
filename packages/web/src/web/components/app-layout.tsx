import { Link, useLocation } from "wouter";
import { CreditCard, Dumbbell, LayoutDashboard, LogOut, Sparkles, Timer } from "lucide-react";
import { authClient } from "../lib/auth";
import { cn } from "../lib/utils";
import { Logo } from "./logo";

const NAV = [
  { to: "/app", label: "Painel", icon: LayoutDashboard },
  { to: "/app/treino", label: "Treino", icon: Dumbbell },
  { to: "/app/simulado", label: "Simulado", icon: Timer },
  { to: "/app/tutor", label: "Tutor IA", icon: Sparkles },
  { to: "/app/planos", label: "Planos", icon: CreditCard },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const { data: session } = authClient.useSession();

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-20 flex w-[232px] flex-col border-r border-border bg-surface">
        <div className="border-b border-border px-5 py-5">
          <Logo to="/app" />
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = to === "/app" ? location === "/app" : location.startsWith(to);
            return (
              <Link
                key={to}
                href={to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-[14px] font-medium transition-colors",
                  active ? "bg-primary/15 text-primary-bright" : "text-muted hover:bg-surface-2 hover:text-foreground",
                )}
              >
                <Icon className="size-[17px]" strokeWidth={1.8} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-4">
          <div className="truncate text-[13px] font-medium">{session?.user.name}</div>
          <div className="truncate text-[12px] text-muted">{session?.user.email}</div>
          <button
            type="button"
            onClick={async () => {
              await authClient.signOut();
              navigate("/");
            }}
            className="mt-3 flex items-center gap-2 text-[12px] text-muted transition-colors hover:text-foreground"
          >
            <LogOut className="size-3.5" /> Terminar sessão
          </button>
        </div>
      </aside>
      <main className="grid-bg min-h-screen flex-1 pl-[232px]">
        <div className="mx-auto max-w-5xl px-8 py-8">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="mb-7 flex items-end justify-between">
      <div>
        <h1 className="font-display text-[26px] font-bold tracking-tight">{title}</h1>
        {sub ? <p className="mt-1 text-[14px] text-muted">{sub}</p> : null}
      </div>
      {right}
    </div>
  );
}
