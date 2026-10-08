import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { AppRouterClient } from "../../api";
import { authClient } from "./auth";

const link = new RPCLink({
  url: `${window.location.origin}/api/rpc`,
  // Email/password sessions are cookie-based (no managed-auth token) — the
  // browser only attaches cookies cross-request when we opt in explicitly.
  fetch: (request, init) =>
    fetch(request, { ...init, credentials: "include" }),
  headers: () => {
    const token = authClient.managedAuth.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});

/** Direct typed client: await client.ping() */
export const client: AppRouterClient = createORPCClient(link);

/** TanStack Query helpers: useQuery(orpc.ping.queryOptions()) */
export const orpc = createTanstackQueryUtils(client);
