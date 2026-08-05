import {
  createRegistrationSchema,
  paginatedResponseSchema,
  paginationQuerySchema,
  registrationSchema,
} from "@raffle_v2/shared";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { createRegistration, listRegistration } from "../controller/registration.controller";
import type { AppEnv } from "../lib/context";
import { requireAuth } from "../middleware/auth";

const app = new OpenAPIHono<AppEnv>();

const errorSchema = z.object({ error: z.string() });

export const registrationListQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(1).optional(),
});

export const registrationListRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Registration"],
  middleware: [requireAuth] as const,
  request: { query: registrationListQuerySchema },
  responses: {
    200: {
      content: { "application/json": { schema: paginatedResponseSchema(registrationSchema) } },
      description: "Paginated list of registrants",
    },
    401: { content: { "application/json": { schema: errorSchema } }, description: "Unauthorized" },
  },
});

export const registrationCreateRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Registration"],
  middleware: [requireAuth] as const,
  request: {
    body: { content: { "application/json": { schema: createRegistrationSchema } } },
  },
  responses: {
    201: {
      content: { "application/json": { schema: registrationSchema } },
      description: "Created Registration",
    },
    404: {
      // Add this
      content: { "application/json": { schema: errorSchema } },
      description: "Event not found",
    },
    403: { content: { "application/json": { schema: errorSchema } }, description: "Forbidden" },
    409: {
      // Add this for conflict/duplicate
      content: { "application/json": { schema: errorSchema } },
      description: "Conflict - Duplicate entry",
    },
  },
});

const routes = app
  .openapi(registrationListRoute, listRegistration)
  .openapi(registrationCreateRoute, createRegistration);

export default routes;

