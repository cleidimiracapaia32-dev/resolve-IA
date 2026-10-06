import { Link } from "wouter";

export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link href={to} className="inline-flex items-center gap-2.5">
      <span className="grid size-7 place-items-center rounded-[4px] bg-primary font-display text-[13px] font-bold text-white">
        R
      </span>
      <span className="font-display text-[17px] font-bold tracking-tight">
        Resolve<span className="text-primary-bright">-IA</span>
      </span>
    </Link>
  );
}
