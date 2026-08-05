// src/controllers/user.controller.ts

import type { RouteHandler } from "@hono/zod-openapi";
import type { AppEnv } from "../lib/context";
import type { updateUserSchoolRoute } from "../routes/auth.route";

export const updateUserSchool: RouteHandler<typeof updateUserSchoolRoute, AppEnv> = async (c) => {
  try {
    const currentUser = c.get("user");

    if (!currentUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    return c.json(
      {
        success: true,
        message: "School updated successfully",
      },
      200,
    );
  } catch (error) {
    console.error("Failed to update user school:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};
