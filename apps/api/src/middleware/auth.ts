import { createMiddleware } from "hono/factory";
import { auth } from "../lib/auth";
import type { AppEnv } from "../lib/context";

/**
 * Resolves the Better Auth session from the request's cookies and stores
 * it on the context. Responds 401 if there isn't a valid session.
 *
 * Mount this before any route/middleware that reads c.get("user").
 */
export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("user", session.user);
  c.set("session", session.session);

  await next();
});

/**
 * Same lookup, but never blocks the request - useful for routes that
 * behave differently for logged-in vs anonymous users without requiring
 * auth outright.
 */
export const attachSession = createMiddleware<AppEnv>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set("user", session?.user ?? null);
  c.set("session", session?.session ?? null);
  await next();
});
