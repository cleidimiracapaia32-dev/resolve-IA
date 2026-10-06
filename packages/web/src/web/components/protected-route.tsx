import { Redirect } from "wouter";
import { authClient } from "../lib/auth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending)
    return (
      <div className="grid min-h-screen place-items-center">
        <span className="label-mono animate-pulse">A carregar…</span>
      </div>
    );
  if (!session) return <Redirect to="/entrar" />;

  return <>{children}</>;
}
