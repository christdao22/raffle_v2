import {
  createSchoolSchema,
  paginatedResponseSchema,
  paginationQuerySchema,
  schoolSchema,
} from "@raffle_v2/shared";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { createSchool, listSchool } from "../controller/school.controller";
import type { AppEnv } from "../lib/context";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";

const app = new OpenAPIHono<AppEnv>();

const errorSchema = z.object({ error: z.string() });

export const schoolListQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(1).optional(),
});

export const schoolListRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Schools"],
  request: { query: schoolListQuerySchema },
  responses: {
    200: {
      content: { "application/json": { schema: paginatedResponseSchema(schoolSchema) } },
      description: "Paginated list of Schools",
    },
    401: { content: { "application/json": { schema: errorSchema } }, description: "Unauthorized" },
  },
});

export const schoolCreateRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Schools"],
  middleware: [requireAuth, requireRole("admin")] as const,
  request: {
    body: { content: { "application/json": { schema: createSchoolSchema } } },
  },
  responses: {
    201: {
      content: { "application/json": { schema: schoolSchema } },
      description: "Created participant",
    },
    403: { content: { "application/json": { schema: errorSchema } }, description: "Forbidden" },
    409: {
      // Add this for conflict/duplicate
      content: { "application/json": { schema: errorSchema } },
      description: "Conflict - Duplicate entry",
    },
  },
});

const routes = app.openapi(schoolListRoute, listSchool).openapi(schoolCreateRoute, createSchool);

export default routes;

