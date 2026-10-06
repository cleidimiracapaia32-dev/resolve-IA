import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("panel", className)}>{children}</div>;
}

export function PanelHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-5 py-3">
      <span className="label-mono">{title}</span>
      {right}
    </div>
  );
}

export function Stat({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: "cyan" | "success" | "danger" | "warn" }) {
  const tone =
    accent === "cyan" ? "text-cyan" : accent === "success" ? "text-success" : accent === "danger" ? "text-danger" : accent === "warn" ? "text-warn" : "text-foreground";
  return (
    <Panel className="px-5 py-4">
      <div className="label-mono">{label}</div>
      <div className={cn("mt-2 font-display text-[28px] font-bold leading-none", tone)}>{value}</div>
      {hint ? <div className="mt-1.5 text-[12px] text-muted">{hint}</div> : null}
    </Panel>
  );
}
