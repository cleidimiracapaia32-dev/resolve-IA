import type { RouterClient } from "@orpc/server";
import { createApp } from "./__core/app";
import { ping } from "./routes/ping";
import { practice } from "./routes/practice";
import { exams } from "./routes/exams";
import { tutor } from "./routes/tutor";
import { stats } from "./routes/stats";
import { billing } from "./routes/billing";
import { auth } from "./auth";

export const router = {
  ping,
  practice,
  exams,
  tutor,
  stats,
  billing,
};

export type AppRouter = typeof router;
/** Typed client for the router — used by the web and mobile api clients. */
export type AppRouterClient = RouterClient<AppRouter>;

const app = createApp(router);
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

export default app;
