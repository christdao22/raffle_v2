// src/routes/user.route.ts
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { updateUserSchool } from "../controller/auth.controller";
import type { AppEnv } from "../lib/context";
import { requireAuth } from "../middleware/auth";

const app = new OpenAPIHono<AppEnv>();

export const updateUserSchoolRoute = createRoute({
  method: "patch",
  path: "/school",
  tags: ["User"],
  middleware: [requireAuth] as const,
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            school_id: z.string().uuid("Invalid school ID format"),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
      description: "School updated successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: "Bad request - Invalid data",
    },
    401: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: "Unauthorized",
    },
    404: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: "School not found",
    },
    500: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: "Internal server error",
    },
  },
});

const routes = app.openapi(updateUserSchoolRoute, updateUserSchool);

export default routes;
