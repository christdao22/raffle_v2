import type { Role } from "@raffle_v2/shared";
import { createMiddleware } from "hono/factory";
import type { AppEnv } from "../lib/context";

/**
 * Gate a route to specific roles. Must run after `requireAuth`, since it
 * reads the user that middleware attaches to the context.
 *
 *   app.openapi(route, handler) // route.middleware: [requireAuth, requireRole("admin")]
 */
export const requireRole = (...roles: Role[]) =>
  createMiddleware<AppEnv>(async (c, next) => {
    const user = c.get("user");

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (!roles.includes(user.role as Role)) {
      return c.json({ error: "Forbidden" }, 403);
    }

    await next();
  });

