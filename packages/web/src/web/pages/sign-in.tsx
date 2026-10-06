import { useState } from "react";
import { useLocation } from "wouter";
import { authClient } from "../lib/auth";
import { Logo } from "../components/logo";

export default function SignIn() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result =
        mode === "up"
          ? await authClient.signUp.email({ name: name || email.split("@")[0]!, email, password })
          : await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message ?? "Não foi possível autenticar.");
      } else {
        navigate("/app");
      }
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError(null);
    const result = await authClient.managedAuth.signIn({ provider: "google" });
    if (result.error && result.error.code !== "POPUP_CLOSED") setError(result.error.message ?? "Falha no início de sessão com Google.");
    else if (!result.error) navigate("/app");
  };

  return (
    <div className="grid-bg grid min-h-screen place-items-center px-4">
      <div className="panel rise w-full max-w-sm p-7">
        <div className="flex justify-center">
          <Logo />
        </div>
        <p className="mt-3 text-center text-[13px] text-muted">
          {mode === "in" ? "Entra na tua conta para continuar o treino." : "Cria a tua conta e começa a treinar em 30 segundos."}
        </p>

        <button
          type="button"
          onClick={google}
          className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-md border border-border bg-surface-2 px-4 py-2.5 text-[14px] font-medium transition-colors hover:border-border-strong"
        >
          <svg className="size-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.16 3.57-8.81z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.1A12 12 0 0 0 12 24z" />
            <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.62H1.28a12 12 0 0 0 0 10.76l3.99-3.1z" />
            <path fill="#EA4335" d="M12 4.76c1.76 0 3.34.6 4.58 1.8l3.43-3.44A11.98 11.98 0 0 0 12 0 12 12 0 0 0 1.28 6.62l3.99 3.1c.95-2.85 3.6-4.96 6.73-4.96z" />
          </svg>
          Continuar com Google
        </button>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="label-mono">ou com email</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "up" ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Nome"
              placeholder="Nome"
              className="w-full rounded-md border border-border bg-surface-2 px-3.5 py-2.5 text-[14px] outline-none placeholder:text-muted focus:border-primary"
            />
          ) : null}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Email"
            placeholder="Email"
            className="w-full rounded-md border border-border bg-surface-2 px-3.5 py-2.5 text-[14px] outline-none placeholder:text-muted focus:border-primary"
          />
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-label="Palavra-passe"
            placeholder="Palavra-passe (mín. 8 caracteres)"
            className="w-full rounded-md border border-border bg-surface-2 px-3.5 py-2.5 text-[14px] outline-none placeholder:text-muted focus:border-primary"
          />
          {error ? <div className="rounded-md border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-[13px] text-danger">{error}</div> : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-primary px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-primary/85 disabled:opacity-60"
          >
            {busy ? "A processar…" : mode === "in" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-5 w-full text-center text-[13px] text-muted transition-colors hover:text-foreground">
          {mode === "in" ? "Ainda não tens conta? Regista-te" : "Já tens conta? Entra"}
        </button>
      </div>
    </div>
  );
}
