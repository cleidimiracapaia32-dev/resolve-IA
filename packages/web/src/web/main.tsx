// Entry point referenced by index.html — composition only, real bootstrap
// lives in __main.tsx (template-managed).
import "./__main";
import { authClient } from "./lib/auth";

// Completes a returning managed (Google) sign-in; no-op otherwise. The session
// refreshes reactively once the exchange finishes.
void authClient.managedAuth.handleRedirect();
